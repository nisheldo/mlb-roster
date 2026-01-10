#!/bin/bash

# Script to delete GitHub comments made by user "wiz"
# Requires: gh (GitHub CLI) to be installed and authenticated

set -e

# Configuration
USERNAME="wiz"
DRY_RUN=false
REPO=""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --repo)
            REPO="$2"
            shift 2
            ;;
        --user)
            USERNAME="$2"
            shift 2
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --dry-run       Show what would be deleted without actually deleting"
            echo "  --repo REPO     Specify repository (format: owner/repo)"
            echo "  --user USER     Specify username (default: wiz)"
            echo "  --help          Show this help message"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Check if gh is installed
if ! command -v gh &> /dev/null; then
    echo -e "${RED}Error: GitHub CLI (gh) is not installed${NC}"
    echo "Install it from: https://cli.github.com/"
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo -e "${RED}Error: Not authenticated with GitHub CLI${NC}"
    echo "Run: gh auth login"
    exit 1
fi

# Get repository if not specified
if [ -z "$REPO" ]; then
    if git rev-parse --git-dir > /dev/null 2>&1; then
        REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null || echo "")
    fi

    if [ -z "$REPO" ]; then
        echo -e "${RED}Error: Could not determine repository${NC}"
        echo "Please specify with --repo owner/repo or run from a git repository"
        exit 1
    fi
fi

echo -e "${GREEN}Repository: ${REPO}${NC}"
echo -e "${GREEN}Target user: ${USERNAME}${NC}"

if [ "$DRY_RUN" = true ]; then
    echo -e "${YELLOW}DRY RUN MODE - No comments will be deleted${NC}"
fi

echo ""

# Function to delete issue comments
delete_issue_comments() {
    echo "Fetching issue comments..."

    # Get all issues (open and closed)
    local issues=$(gh api "repos/${REPO}/issues?state=all&per_page=100" --paginate)

    local deleted_count=0
    local issue_numbers=$(echo "$issues" | jq -r '.[].number')

    for issue_num in $issue_numbers; do
        # Get comments for this issue
        local comments=$(gh api "repos/${REPO}/issues/${issue_num}/comments?per_page=100" --paginate 2>/dev/null || echo "[]")

        # Filter comments by username
        local wiz_comments=$(echo "$comments" | jq -r --arg user "$USERNAME" \
            '.[] | select(.user.login == $user) | .id')

        if [ -n "$wiz_comments" ]; then
            for comment_id in $wiz_comments; do
                local comment_body=$(echo "$comments" | jq -r --arg id "$comment_id" \
                    '.[] | select(.id == ($id | tonumber)) | .body' | head -c 100)

                echo -e "Issue #${issue_num} - Comment ID: ${comment_id}"
                echo -e "  Preview: ${comment_body}..."

                if [ "$DRY_RUN" = false ]; then
                    if gh api -X DELETE "repos/${REPO}/issues/comments/${comment_id}" > /dev/null 2>&1; then
                        echo -e "  ${GREEN}✓ Deleted${NC}"
                        ((deleted_count++))
                    else
                        echo -e "  ${RED}✗ Failed to delete${NC}"
                    fi
                else
                    echo -e "  ${YELLOW}[DRY RUN] Would delete${NC}"
                    ((deleted_count++))
                fi
            done
        fi
    done

    echo ""
    echo "Issue comments deleted: ${deleted_count}"
    return $deleted_count
}

# Function to delete PR review comments
delete_pr_comments() {
    echo "Fetching pull request comments..."

    local deleted_count=0

    # Get all PRs (open and closed)
    local prs=$(gh api "repos/${REPO}/pulls?state=all&per_page=100" --paginate)
    local pr_numbers=$(echo "$prs" | jq -r '.[].number')

    for pr_num in $pr_numbers; do
        # Get review comments for this PR
        local comments=$(gh api "repos/${REPO}/pulls/${pr_num}/comments?per_page=100" --paginate 2>/dev/null || echo "[]")

        # Filter comments by username
        local wiz_comments=$(echo "$comments" | jq -r --arg user "$USERNAME" \
            '.[] | select(.user.login == $user) | .id')

        if [ -n "$wiz_comments" ]; then
            for comment_id in $wiz_comments; do
                local comment_body=$(echo "$comments" | jq -r --arg id "$comment_id" \
                    '.[] | select(.id == ($id | tonumber)) | .body' | head -c 100)

                echo -e "PR #${pr_num} - Review Comment ID: ${comment_id}"
                echo -e "  Preview: ${comment_body}..."

                if [ "$DRY_RUN" = false ]; then
                    if gh api -X DELETE "repos/${REPO}/pulls/comments/${comment_id}" > /dev/null 2>&1; then
                        echo -e "  ${GREEN}✓ Deleted${NC}"
                        ((deleted_count++))
                    else
                        echo -e "  ${RED}✗ Failed to delete${NC}"
                    fi
                else
                    echo -e "  ${YELLOW}[DRY RUN] Would delete${NC}"
                    ((deleted_count++))
                fi
            done
        fi

        # Also get regular issue comments on PRs (since PRs are issues)
        local pr_comments=$(gh api "repos/${REPO}/issues/${pr_num}/comments?per_page=100" --paginate 2>/dev/null || echo "[]")
        local wiz_pr_comments=$(echo "$pr_comments" | jq -r --arg user "$USERNAME" \
            '.[] | select(.user.login == $user) | .id')

        if [ -n "$wiz_pr_comments" ]; then
            for comment_id in $wiz_pr_comments; do
                local comment_body=$(echo "$pr_comments" | jq -r --arg id "$comment_id" \
                    '.[] | select(.id == ($id | tonumber)) | .body' | head -c 100)

                echo -e "PR #${pr_num} - Comment ID: ${comment_id}"
                echo -e "  Preview: ${comment_body}..."

                if [ "$DRY_RUN" = false ]; then
                    if gh api -X DELETE "repos/${REPO}/issues/comments/${comment_id}" > /dev/null 2>&1; then
                        echo -e "  ${GREEN}✓ Deleted${NC}"
                        ((deleted_count++))
                    else
                        echo -e "  ${RED}✗ Failed to delete${NC}"
                    fi
                else
                    echo -e "  ${YELLOW}[DRY RUN] Would delete${NC}"
                    ((deleted_count++))
                fi
            done
        fi
    done

    echo ""
    echo "PR comments deleted: ${deleted_count}"
    return $deleted_count
}

# Main execution
echo "Starting comment deletion process..."
echo ""

total_deleted=0

# Delete issue comments
delete_issue_comments
issue_count=$?
total_deleted=$((total_deleted + issue_count))

echo ""

# Delete PR comments
delete_pr_comments
pr_count=$?
total_deleted=$((total_deleted + pr_count))

echo ""
echo "========================================"
if [ "$DRY_RUN" = true ]; then
    echo -e "${YELLOW}Total comments that would be deleted: ${total_deleted}${NC}"
    echo -e "${YELLOW}Run without --dry-run to actually delete${NC}"
else
    echo -e "${GREEN}Total comments deleted: ${total_deleted}${NC}"
fi
echo "========================================"

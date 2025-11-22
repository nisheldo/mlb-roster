# Deployment Guide

This guide explains how to set up automatic deployment to Netlify when code is merged to the main branch.

## Auto-Deploy to Netlify (Recommended)

### Initial Setup

1. **Sign up/Login to Netlify**
   - Go to [https://app.netlify.com/](https://app.netlify.com/)
   - Sign in with your GitHub account

2. **Import Your Project**
   - Click "Add new site" → "Import an existing project"
   - Choose "Deploy with GitHub"
   - Authorize Netlify to access your GitHub account
   - Select the `mlb-roster` repository

3. **Configure Build Settings**
   - Netlify will automatically detect settings from `netlify.toml`
   - **Production branch**: `main` (default)
   - **Build command**: `npm run build` (auto-detected)
   - **Publish directory**: `dist` (auto-detected)
   - Click "Deploy site"

4. **Configure Auto-Deploy**
   - Go to **Site settings** → **Build & deploy** → **Continuous deployment**
   - Ensure "GitHub" is connected
   - Under "Deploy contexts":
     - **Production branch**: `main` ✓
     - **Deploy previews**: Enable for pull requests ✓
     - **Branch deploys**: Configure as needed

### What Happens After Setup

Once configured, Netlify will automatically:

✅ **Deploy to production** when you merge to `main` branch
✅ **Create preview deployments** for pull requests
✅ **Show build status** in GitHub PR checks
✅ **Roll back** if a build fails
✅ **Cache dependencies** for faster builds

### Deployment Workflow

```
1. Create feature branch → Make changes
2. Push to GitHub → Create pull request
3. Netlify builds preview → Review at deploy-preview-*.netlify.app
4. Merge to main → Automatic production deployment
5. Live at your-site-name.netlify.app
```

## GitHub Actions Integration

The project includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that:
- Validates builds on every push and PR
- Runs tests (if you add them)
- Can deploy to Netlify (optional)

### Enable GitHub Actions Deployment (Optional)

If you want to deploy via GitHub Actions instead of Netlify's auto-deploy:

1. **Get Netlify Credentials**
   - In Netlify: User settings → Applications → Personal access tokens
   - Create new access token → Copy the token
   - In your site: Site settings → General → Site information
   - Copy the "Site ID"

2. **Add GitHub Secrets**
   - Go to your GitHub repository
   - Settings → Secrets and variables → Actions
   - Add two secrets:
     - `NETLIFY_AUTH_TOKEN`: Your personal access token
     - `NETLIFY_SITE_ID`: Your site ID

3. **Enable the Workflow**
   - Edit `.github/workflows/deploy.yml`
   - Uncomment the `deploy` job section
   - Commit and push

## Custom Domain Setup

1. **In Netlify Dashboard**
   - Go to Site settings → Domain management
   - Click "Add custom domain"
   - Enter your domain name

2. **Configure DNS**
   - Add Netlify's DNS records to your domain provider
   - Or use Netlify DNS for automatic configuration

## Environment Variables (If Needed)

If you need to add environment variables:

1. In Netlify: Site settings → Environment variables
2. Add variables (they'll be available during build as `import.meta.env.VITE_*`)
3. Remember to prefix with `VITE_` for Vite to expose them

## Monitoring Deployments

- **Deploy logs**: Site overview → Deploys → Click any deploy
- **Build notifications**: Site settings → Build & deploy → Deploy notifications
- **Status badge**: Add to README:
  ```markdown
  [![Netlify Status](https://api.netlify.com/api/v1/badges/YOUR-SITE-ID/deploy-status)](https://app.netlify.com/sites/YOUR-SITE-NAME/deploys)
  ```

## Rollback a Deployment

If something goes wrong:

1. Go to Deploys → Production deploys
2. Find the last working deploy
3. Click "Publish deploy" to restore it

## Troubleshooting

### Build Fails
- Check deploy logs in Netlify dashboard
- Ensure `package.json` dependencies are correct
- Verify build works locally: `npm run build`

### Wrong Branch Deploying
- Site settings → Build & deploy → Continuous deployment
- Set production branch to `main`

### Environment Variables Not Working
- Ensure they're prefixed with `VITE_`
- Redeploy after adding variables

## Support

- [Netlify Documentation](https://docs.netlify.com/)
- [Netlify Support](https://answers.netlify.com/)

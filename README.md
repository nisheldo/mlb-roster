# MLB 40-Man Roster Viewer

A React application that displays the current 40-man rosters for all MLB teams using the official MLB Stats API.

## Features

- Select any MLB team from a dropdown menu
- View the complete 40-man roster for the selected team
- Display player information including:
  - Jersey number
  - Full name
  - Position
  - Current status
- Responsive design that works on desktop and mobile devices
- Clean, modern UI with gradient styling

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd mlb-roster
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to the URL shown in the terminal (typically `http://localhost:5173`)

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run preview` - Preview the production build locally

## Data Source

This application uses the official MLB Stats API to fetch real-time roster data:
- API Endpoint: `https://statsapi.mlb.com/api/v1/teams/{teamId}/roster/40Man`
- No API key required
- Data updates in real-time

## Technologies Used

- React 18
- Vite
- MLB Stats API
- CSS3 with Gradients

## Deployment

This application is configured for automatic deployment to the cloud with continuous integration.

### Auto-Deploy to Netlify (Recommended)

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy)

**Quick Setup:**
1. Click the "Deploy to Netlify" button above
2. Authorize GitHub access and select this repository
3. Click "Deploy site"

**Auto-Deploy Features:**
- ✅ Automatically deploys when you merge to `main` branch
- ✅ Creates preview deployments for pull requests
- ✅ Build status checks in GitHub
- ✅ Automatic rollback on build failures
- ✅ Optimized caching and CDN delivery

**📖 For detailed setup instructions, see [DEPLOYMENT.md](DEPLOYMENT.md)**

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Click the "Deploy with Vercel" button above or:
2. Push your code to GitHub
3. Go to [Vercel](https://vercel.com/)
4. Click "Add New..." → "Project"
5. Import your GitHub repository
6. Vercel will automatically detect the build settings from `vercel.json`
7. Click "Deploy"

### Deploy to Other Platforms

The application can also be deployed to:
- **GitHub Pages**: Use `gh-pages` package
- **Railway**: Direct deployment from GitHub
- **Render**: Static site deployment
- **Firebase Hosting**: Using Firebase CLI

Build command: `npm run build`
Output directory: `dist`

## License

MIT
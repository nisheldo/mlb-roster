# MLB Roster Viewer

A modern React application that displays MLB team rosters and comprehensive player statistics using the official MLB Stats API.

## Features

- **All 30 MLB Teams**: Select and view rosters for any Major League Baseball team
- **Multi-Year Support**: Access roster data from 2020-2025
- **Comprehensive Player Stats**:
  - Career totals and season-by-season statistics
  - Postseason performance
  - Awards and honors
  - Recent transactions
- **Smart Filtering**: Filter by position (Pitcher, Catcher, Infielder, Outfielder)
- **Real-Time Search**: Quickly find players by name
- **Detailed Player Profiles**: Click any player card for in-depth information
- **Dynamic Theming**: UI adapts to selected team's official colors
- **Responsive Design**: Works seamlessly on desktop and mobile devices

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
- `npm run lint` - Run ESLint to check code quality
- `npm test` - Run E2E tests with Playwright
- `npm run test:ui` - Run tests in interactive UI mode
- `npm run test:report` - View HTML test report

## Testing

This project includes comprehensive end-to-end tests using Playwright that automatically validate:
- Core functionality (team/year selection, roster loading)
- All position filters (Pitchers, Catchers, Infielders, Outfielders, DH, Two-Way)
- Player interactions (search, detail modal, stats display)
- Two-way player features (dual stat display)
- DH filter functionality

Tests run automatically on every PR via GitHub Actions. See [tests/README.md](tests/README.md) for detailed testing documentation.

## Data Source

This application uses the official MLB Stats API to fetch real-time roster and statistics data:
- API Base: `https://statsapi.mlb.com/api/v1`
- No API key required
- Real-time data updates
- Endpoints for teams, rosters, player stats, awards, and transactions

## Technologies Used

- **React 19.2.0** - Modern React with concurrent features
- **Vite 7.2.4** - Fast build tool and development server
- **MLB Stats API** - Official MLB data source
- **CSS3** - Modern styling with custom properties and gradients
- **ESLint** - Code quality and consistency

## Project Structure

```
src/
├── api/mlbApi.js           # Centralized MLB API client
├── components/             # React components
│   ├── Roster.jsx         # Main container with team selection
│   ├── PlayerCard.jsx     # Individual player cards
│   └── PlayerDetail.jsx   # Detailed player modal
├── hooks/useMLBData.js    # Custom data fetching hooks
├── data/
│   ├── teamColors.js      # Color schemes for all 30 teams
│   └── rosterData.js      # Static data
└── App.jsx                # Root component
```

## Deployment

This application is configured for automatic deployment to Netlify with continuous integration.

### Deploy to Netlify

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy)

**Quick Setup:**
1. Click the "Deploy to Netlify" button above
2. Authorize GitHub access and select this repository
3. Click "Deploy site"

**Auto-Deploy Features:**
- Automatically deploys when you merge to `main` branch
- Creates preview deployments for pull requests
- Build status checks in GitHub
- Automatic rollback on build failures
- Optimized caching and CDN delivery
- Security headers configured

**Configuration:**
- Build command: `npm run build`
- Publish directory: `dist`
- Deploy settings are defined in `netlify.toml`

**For detailed setup instructions, see [DEPLOYMENT.md](DEPLOYMENT.md)**

## License

MIT

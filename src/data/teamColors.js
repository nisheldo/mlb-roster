// MLB team colors mapping
export const teamColors = {
  // Arizona Diamondbacks
  109: {
    primary: '#A71930',
    secondary: '#E3D4AD',
    accent: '#000000'
  },
  // Atlanta Braves
  144: {
    primary: '#CE1141',
    secondary: '#13274F',
    accent: '#EAAA00'
  },
  // Baltimore Orioles
  110: {
    primary: '#DF4601',
    secondary: '#000000',
    accent: '#FFFFFF'
  },
  // Boston Red Sox
  111: {
    primary: '#BD3039',
    secondary: '#0C2340',
    accent: '#FFFFFF'
  },
  // Chicago Cubs
  112: {
    primary: '#0E3386',
    secondary: '#CC3433',
    accent: '#FFFFFF'
  },
  // Chicago White Sox
  145: {
    primary: '#27251F',
    secondary: '#C4CED4',
    accent: '#FFFFFF'
  },
  // Cincinnati Reds
  113: {
    primary: '#C6011F',
    secondary: '#000000',
    accent: '#FFFFFF'
  },
  // Cleveland Guardians
  114: {
    primary: '#00385D',
    secondary: '#E50022',
    accent: '#FFFFFF'
  },
  // Colorado Rockies
  115: {
    primary: '#33006F',
    secondary: '#C4CED4',
    accent: '#000000'
  },
  // Detroit Tigers
  116: {
    primary: '#0C2340',
    secondary: '#FA4616',
    accent: '#FFFFFF'
  },
  // Houston Astros
  117: {
    primary: '#002D62',
    secondary: '#EB6E1F',
    accent: '#FFFFFF'
  },
  // Kansas City Royals
  118: {
    primary: '#004687',
    secondary: '#BD9B60',
    accent: '#FFFFFF'
  },
  // Los Angeles Angels
  108: {
    primary: '#BA0021',
    secondary: '#003263',
    accent: '#C4CED4'
  },
  // Los Angeles Dodgers
  119: {
    primary: '#005A9C',
    secondary: '#EF3E42',
    accent: '#FFFFFF'
  },
  // Miami Marlins
  146: {
    primary: '#00A3E0',
    secondary: '#EF3340',
    accent: '#000000'
  },
  // Milwaukee Brewers
  158: {
    primary: '#12284B',
    secondary: '#FFC52F',
    accent: '#FFFFFF'
  },
  // Minnesota Twins
  142: {
    primary: '#002B5C',
    secondary: '#D31145',
    accent: '#FFFFFF'
  },
  // New York Mets
  121: {
    primary: '#002D72',
    secondary: '#FF5910',
    accent: '#FFFFFF'
  },
  // New York Yankees
  147: {
    primary: '#003087',
    secondary: '#0C2340',
    accent: '#FFFFFF'
  },
  // Oakland Athletics
  133: {
    primary: '#003831',
    secondary: '#EFB21E',
    accent: '#FFFFFF'
  },
  // Philadelphia Phillies
  143: {
    primary: '#E81828',
    secondary: '#002D72',
    accent: '#FFFFFF'
  },
  // Pittsburgh Pirates
  134: {
    primary: '#27251F',
    secondary: '#FDB827',
    accent: '#FFFFFF'
  },
  // San Diego Padres
  135: {
    primary: '#2F241D',
    secondary: '#FFC425',
    accent: '#FFFFFF'
  },
  // San Francisco Giants
  137: {
    primary: '#FD5A1E',
    secondary: '#27251F',
    accent: '#EFD19F'
  },
  // Seattle Mariners
  136: {
    primary: '#0C2C56',
    secondary: '#005C5C',
    accent: '#C4CED4'
  },
  // St. Louis Cardinals
  138: {
    primary: '#C41E3A',
    secondary: '#0C2340',
    accent: '#FEDB00'
  },
  // Tampa Bay Rays
  139: {
    primary: '#092C5C',
    secondary: '#8FBCE6',
    accent: '#F5D130'
  },
  // Texas Rangers
  140: {
    primary: '#003278',
    secondary: '#C0111F',
    accent: '#FFFFFF'
  },
  // Toronto Blue Jays
  141: {
    primary: '#134A8E',
    secondary: '#1D2D5C',
    accent: '#E8291C'
  },
  // Washington Nationals
  120: {
    primary: '#AB0003',
    secondary: '#14225A',
    accent: '#FFFFFF'
  }
};

// Fallback colors if team not found
export const defaultColors = {
  primary: '#002B5C',
  secondary: '#D31145',
  accent: '#FFFFFF'
};

// Helper function to get team colors
export const getTeamColors = (teamId) => {
  return teamColors[teamId] || defaultColors;
};

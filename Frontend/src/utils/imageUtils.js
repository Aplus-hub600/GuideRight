// Utility functions for generating reliable placeholder images

export const generateThumbnailSVG = (text, color = '#6b7280', size = 64) => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <rect width="${size}" height="${size}" fill="${color}"/>
      <text x="${size/2}" y="${size/2 + 4}" font-family="Arial, sans-serif" font-size="${Math.floor(size/5)}" fill="white" text-anchor="middle">${text}</text>
    </svg>
  `;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};

export const generateAvatarSVG = (text, color = '#6b7280', size = 48) => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="${color}"/>
      <text x="${size/2}" y="${size/2 + 4}" font-family="Arial, sans-serif" font-size="${Math.floor(size/4)}" fill="white" text-anchor="middle">${text}</text>
    </svg>
  `;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};

// Predefined news source thumbnails
export const newSourceThumbnails = {
  'The Daily Star': generateThumbnailSVG('DS', '#3b82f6'),
  'Prothom Alo': generateThumbnailSVG('PA', '#ef4444'),
  'Bangladesh Post': generateThumbnailSVG('BP', '#10b981'),
  'Dhaka Tribune': generateThumbnailSVG('DT', '#f59e0b'),
  'New Age': generateThumbnailSVG('NA', '#8b5cf6'),
  'Financial Express': generateThumbnailSVG('FE', '#06b6d4'),
  'The Business Standard': generateThumbnailSVG('BS', '#ec4899'),
  'UNB News': generateThumbnailSVG('UN', '#84cc16')
};

// Predefined social media avatars
export const socialMediaAvatars = {
  '@infrastructure_bd': generateAvatarSVG('IB', '#3b82f6'),
  '@climate_watch': generateAvatarSVG('CW', '#10b981'),
  '@tech_economist': generateAvatarSVG('TE', '#f59e0b'),
  '@agri_insights': generateAvatarSVG('AI', '#84cc16'),
  '@urban_planner': generateAvatarSVG('UP', '#8b5cf6'),
  '@fintech_bd': generateAvatarSVG('FB', '#ec4899')
};

// Default fallbacks
export const defaultThumbnail = generateThumbnailSVG('IMG', '#6b7280');
export const defaultAvatar = generateAvatarSVG('USR', '#6b7280');
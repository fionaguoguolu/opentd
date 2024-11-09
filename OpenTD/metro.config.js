// metro.config.js in OpenTD project directory
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.watchFolders = ['components']; // Only watch the 'components' folder

config.resolver = {
  ...config.resolver,
  blacklistRE: /node_modules\/.*|\.git\/.*/, // Exclude unnecessary folders
};
config.resolver.sourceExts.push('tsx'); // Ensure .tsx files are included

module.exports = config;

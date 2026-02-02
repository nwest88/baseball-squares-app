/**
 * Entry point for Cloud Functions.
 * * Following best practices, we import specific modules for different features.
 * This keeps index.js clean and scalable as the app grows.
 * https://firebase.google.com/docs/functions/organize-functions
 */

// Import the specific function from our new AI module
const { parseGridImage } = require('./ai');

// Export it so Firebase can find it at the top level
// This preserves the function name 'parseGridImage' so your React Native code doesn't break.
exports.parseGridImage = parseGridImage;
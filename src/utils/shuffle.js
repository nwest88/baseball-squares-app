/**
 * Shuffles an array in place using the Fisher-Yates algorithm.
 * This provides an unbiased shuffle compared to the biased sort() method.
 *
 * @param {Array} array - The array to be shuffled.
 * @returns {Array} - The shuffled array.
 */
export const shuffle = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

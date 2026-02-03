import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY_FOLLOWED = 'followed_pools';

// Get list of all followed Game IDs
export const getFollowedGames = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(KEY_FOLLOWED);
    // Safety check: Ensure we don't try to parse null/undefined
    if (!jsonValue) return [];
    
    const parsed = JSON.parse(jsonValue);
    // Extra safety: Ensure the result is actually an array
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error("Storage Read Error", e);
    return [];
  }
};

// Toggle Follow Status (Returns true if now following, false if unfollowed)
export const toggleFollowGame = async (gameId) => {
  try {
    // Get current list (safe due to above check)
    const current = await getFollowedGames();
    let updated;
    let isFollowing = false;

    if (current.includes(gameId)) {
      // Unfollow: Remove ID
      updated = current.filter(id => id !== gameId);
      isFollowing = false;
    } else {
      // Follow: Add ID
      updated = [...current, gameId];
      isFollowing = true;
    }

    await AsyncStorage.setItem(KEY_FOLLOWED, JSON.stringify(updated));
    return isFollowing;
  } catch (e) {
    console.error("Storage Write Error", e);
    return false;
  }
};

// Check if specific game is followed
export const isGameFollowed = async (gameId) => {
  try {
    const current = await getFollowedGames();
    return current.includes(gameId);
  } catch (e) {
    console.error("Storage Check Error", e);
    return false;
  }
};
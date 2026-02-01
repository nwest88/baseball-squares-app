import { doc, updateDoc } from 'firebase/firestore';

/**
 * Scans the grid and removes all squares owned by a specific player.
 * * @param {object} db - Firebase Firestore instance
 * @param {string} gameId - The ID of the game document
 * @param {object} gridData - The current grid data object (to read rows/cols)
 * @param {string} playerName - The name of the player to remove
 * @returns {Promise<number>} - Returns the number of squares cleared
 */
export const deletePlayerFromGrid = async (db, gameId, gridData, playerName) => {
  if (!gridData || !playerName) return 0;

  const cols = gridData.gridCols || 10;
  const rows = gridData.gridRows || 10;
  const updates = {};
  let foundCount = 0;

  // Scan the entire grid
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const key = `${r}-${c}`;
      const cell = gridData[key];
      
      if (cell) {
        // Handle both Object {name: "Nic"} and String "Nic" formats
        const cellName = (typeof cell === 'object') ? cell.name : cell;
        
        if (cellName === playerName) {
          // Found them! Mark this key for deletion (set to null)
          updates[key] = null; 
          foundCount++;
        }
      }
    }
  }

  // Only talk to the database if we actually found something to delete
  if (foundCount > 0) {
    await updateDoc(doc(db, "squares_pool", gameId), updates);
  }

  return foundCount;
};
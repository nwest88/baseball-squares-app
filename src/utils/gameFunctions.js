import { doc, updateDoc, deleteField } from 'firebase/firestore';
import { Platform } from 'react-native';

/**
 * Scans the grid and removes all squares owned by a specific player.
 */
export const deletePlayerFromGrid = async (db, gameId, gridData, playerName) => {
  console.log(`[DELETE STARTED] Removing player: "${playerName}" from Game: ${gameId}`);

  if (!gridData || !playerName) {
      console.error("[DELETE FAILED] Missing grid data or player name.");
      return 0;
  }

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
        
        // Use trim() to avoid "Nic " vs "Nic" mismatches
        if (cellName && cellName.trim() === playerName.trim()) {
          console.log(`[DELETE] Found match at ${key}`);
          
          // CRITICAL CHANGE: Use deleteField() instead of null
          // This completely removes the field from Firestore
          updates[key] = deleteField(); 
          
          foundCount++;
        }
      }
    }
  }

  console.log(`[DELETE STATUS] Found ${foundCount} squares to delete.`);

  // Only talk to the database if we actually found something to delete
  if (foundCount > 0) {
    console.log("[DELETE] Sending update to Firebase...");
    try {
        await updateDoc(doc(db, "squares_pool", gameId), updates);
        console.log("[DELETE SUCCESS] Database update complete.");
    } catch (error) {
        console.error("[DELETE ERROR] Firebase Error:", error);
        throw error; // Re-throw so the UI knows it failed
    }
  } else {
      console.warn("[DELETE SKIPPED] No squares found for this player.");
  }

  return foundCount;
};
import { doc, updateDoc, deleteField } from 'firebase/firestore';

/**
 * Scans the grid and removes all squares owned by a specific player.
 */
export const deletePlayerFromGrid = async (db, gameId, gridData, playerName) => {
  console.log(`[DELETE STARTED] Removing player: "${playerName}" from Game: ${gameId}`);

  if (!gridData || !playerName) {
      console.warn("[DELETE FAILED] Missing grid data or player name.");
      return 0;
  }

  const cols = gridData.gridCols || 10;
  const rows = gridData.gridRows || 10;
  const updates = {};
  let foundCount = 0;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const key = `${r}-${c}`;
      const cell = gridData[key];
      if (cell) {
        const cellName = (typeof cell === 'object') ? cell.name : cell;
        if (cellName && cellName.trim() === playerName.trim()) {
          updates[key] = deleteField(); 
          foundCount++;
        }
      }
    }
  }

  if (foundCount > 0) {
    await updateDoc(doc(db, "squares_pool", gameId), updates);
  }
  return foundCount;
};

/**
 * Updates a player's square count (Add, Remove, or Reshuffle)
 */
export const updatePlayerAllocation = async (db, gameId, gridData, player, newCount, reshuffle = false) => {
    const playerName = player.name;
    const targetCount = parseInt(newCount);
    
    if (isNaN(targetCount)) throw new Error("Invalid count");

    const cols = gridData.gridCols || 10;
    const rows = gridData.gridRows || 10;
    const updates = {};

    // 1. Identify Resources
    const playerSquares = []; // Keys owned by player
    const emptySquares = [];  // Keys that are null

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const key = `${r}-${c}`;
            const cell = gridData[key];
            if (!cell) {
                emptySquares.push(key);
            } else {
                const cellName = (typeof cell === 'object') ? cell.name : cell;
                if (cellName === playerName) {
                    playerSquares.push(key);
                }
            }
        }
    }

    // 2. Logic Branch
    if (reshuffle) {
        // --- RESHUFFLE MODE ---
        // A. Mark existing spots for deletion (clearing the board for this player)
        playerSquares.forEach(key => updates[key] = deleteField());
        
        // B. Pool available spots (Empty ones + The ones we just cleared)
        const availablePool = [...emptySquares, ...playerSquares];
        
        if (availablePool.length < targetCount) {
            throw new Error(`Not enough space to reshuffle. Need ${targetCount}, have ${availablePool.length}.`);
        }

        // C. Pick new random spots from the pool
        const shuffled = availablePool.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, targetCount);
        
        // D. Assign new spots
        const playerData = { name: playerName, email: player.email || "", note: player.note || "" };
        selected.forEach(key => updates[key] = playerData);

    } else {
        // --- ADJUST MODE (Keep existing, just add/remove difference) ---
        const diff = targetCount - playerSquares.length;

        if (diff > 0) {
            // ADDING SQUARES
            if (emptySquares.length < diff) {
                throw new Error(`Only ${emptySquares.length} squares available.`);
            }
            const shuffled = emptySquares.sort(() => 0.5 - Math.random());
            const selected = shuffled.slice(0, diff);
            const playerData = { name: playerName, email: player.email || "", note: player.note || "" };
            selected.forEach(key => updates[key] = playerData);
        } else if (diff < 0) {
            // REMOVING SQUARES
            const removeCount = Math.abs(diff);
            const shuffled = playerSquares.sort(() => 0.5 - Math.random());
            const toRemove = shuffled.slice(0, removeCount);
            toRemove.forEach(key => updates[key] = deleteField());
        }
        // If diff == 0, do nothing
    }

    // 3. Commit
    if (Object.keys(updates).length > 0) {
        await updateDoc(doc(db, "squares_pool", gameId), updates);
    }
};
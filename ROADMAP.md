🗺️ Product Roadmap: QuickSquares
Current Version: v1.0.1 (The Polished Skateboard)
Last Updated: February 1, 2026
✅ Completed (v1.0 - The MVP)
Focus: Core functionality, deployment, and branding.
| Feature | Description | Status |
|---|---|---|
| Grid Engine | Interactive 10x10, 10x5, and 5x5 grids with scrolling axes. | ✅ Done |
| Game Creation | Create games with custom teams and names. | ✅ Done |
| Assignment Modes | "Manual Pick" (Click-to-fill) and "Auto Assign" (Randomized). | ✅ Done |
| Player Roster | View list of players and their total square counts. | ✅ Done |
| Admin Tools | Randomize axis numbers and update game scores. | ✅ Done |
| PWA Deployment | Hosting on Firebase with Deep Linking support (/game/:id). | ✅ Done |
| Branding | Dark Mode UI with Vegas Gold/Electric Blue theme & Logo. | ✅ Done |
🚧 Planned (v1.1 - The Manager Update)
Focus: Admin controls, money tracking, and UX cleanup.
Target Date: February 2, 2026 (Tomorrow Evening)
1. UI/UX Polish
 * [ ] Clean Up Sharing: Move the floating "Share" button to a cleaner location (e.g., inside the Header or a dedicated "Lobby" area) to reduce clutter.
   * Complexity: 🛹 (Low)
2. Advanced Player Management (Refactor)
 * [ ] "Add Player" Workflow: Replace "Assign Squares" with a robust "Add Player" flow in Auto Mode.
 * [ ] Edit Allocations: Ability to update square counts for existing players.
 * [ ] Re-Roll Logic: Toggle to reassign a player's squares to new random spots (releasing their old ones).
 * [ ] Bulk Tools: "Assign All Remaining" and "Shuffle All" buttons.
 * [ ] Safety Checks: Confirmation dialogs explaining exactly what will happen before shuffling.
   * Complexity: 🛹🛹🛹🛹 (High - Heavy Logic in gameFunctions.js)
3. Admin Powers
 * [ ] Square Deletion: Admin option to "Kick Player" from a specific square directly on the grid.
 * [ ] Roster Deletion: Admin option to delete players from the list (with auth checks preparation).
   * Complexity: 🛹🛹 (Medium)
4. The Ledger (Money & Settings)
 * [ ] Price Per Square: Set a $ amount during creation.
 * [ ] The "Rake": Admin sets an amount to keep (Fundraiser/House cut).
 * [ ] Payout Calculator: Auto-calculate winning amounts per quarter based on the remaining pot.
 * [ ] Total Pot View: Visual display of "Total Collected" vs "Total Expected".
   * Complexity: 🛹🛹🛹 (Medium - Math & UI)
5. Winner Tracking
 * [ ] Winners List: Logic to check scores against the grid and log winners to a display list.
   * Complexity: 🛹🛹 (Medium)
🔮 Future / Backlog (v1.2 - The Security Update)
Focus: Authentication, permissions, and multi-game management.
 * [ ] The "Bouncer" (Auth): Lock write permissions in Firebase. Only the Creator can edit.
 * [ ] User Accounts: "My Games" dashboard for admins.
 * [ ] Payment Integration: (Maybe?) Link to Venmo/CashApp deep links.
 * [ ] Live Score API: Auto-update scores from a sports API (The Lamborghini feature).
🛠️ Tech Debt & Architecture
 * [ ] Refactor: Move player management logic to src/utils/playerUtils.js.
 * [ ] Refactor: Create a MoneyEngine.js for payout calculations.
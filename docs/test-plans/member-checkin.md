# Test Script: Member Check-In Kiosk

**What this tests:** The tablet/kiosk check-in system used at Wednesday lunch meetings.  
**Time to run:** ~10 minutes  
**Priority:** 🔴 P1 — This runs at every meeting. Test it weekly.

---

## Setup

- An admin must have **started a meeting session** for that day (via the admin attendance panel)
- Navigate to `/checkin` on the kiosk device (iPad or tablet)
- The page should show a search box and the current meeting date

---

## Test 1: Active Session Display

1. Go to `/checkin`
2. **Verify:** The page shows today's meeting date (e.g., "Wednesday, March 5, 2026")
3. **Verify:** A search input is prominently displayed
4. **Verify:** There is NO error or "no active session" message

**What can go wrong:** If no session has been started by an admin, the kiosk will show a message that no meeting is active. That's expected — have an admin start the session.

---

## Test 2: Member Search

1. Type the first 2+ letters of a member's first or last name into the search box
2. **Verify:** After a brief pause (< 1 second), matching members appear below the search box
3. **Verify:** Each result shows the member's name, company, and classification
4. **Verify:** If the member has a photo, it appears as a small circle/avatar

---

## Test 3: Check-In a Member

1. Search for a member by name
2. Click on their name in the results
3. **Verify:** A full-screen success overlay appears with:
   - A large checkmark or success indicator
   - The member's name
   - A message like "Checked in!"
4. **Verify:** The overlay automatically dismisses after a few seconds
5. **Verify:** The search box is cleared and ready for the next member

---

## Test 4: Duplicate Check-In Prevention

1. Search for the same member you just checked in
2. Click their name again
3. **Verify:** A different overlay appears — "Already checked in" (not another success message)
4. **Verify:** The overlay also auto-dismisses

---

## Test 5: No Results Found

1. Type a name that doesn't belong to any member (e.g., `zzzzzzz`)
2. **Verify:** A "No members found" or similar message appears
3. **Verify:** No error or crash

---

## Test 6: Short Search Term

1. Type just 1 letter (e.g., `J`)
2. **Verify:** No search is triggered — the member list stays empty
3. Type a second letter (e.g., `Jo`)
4. **Verify:** Search triggers and results appear

---

## Mobile / Tablet Checks

- [ ] The search box is large and easy to tap on a tablet
- [ ] Member names in results are readable at arm's length (tablet on a table)
- [ ] The success/already-checked-in overlay is full-screen and clearly visible
- [ ] Keyboard appears automatically when the page loads (for touch-screen kiosk use)

---

## Common Issues

| Problem | What to check |
|---------|--------------|
| "No active meeting session" | Admin needs to start today's session from `/admin/attendance` |
| Search returns no results | Check spelling; member may not be in the database |
| Check-in doesn't register | API may be down; check with dev team |
| Page doesn't auto-refresh | Refresh manually; kiosk polls every 15 seconds for session status |

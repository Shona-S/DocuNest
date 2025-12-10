# PIN Protection - Testing Checklist

## Quick Test (5 minutes)

### Step 1: Upload a Test File with PIN

```
1. Go to Upload page
2. Select a small test PDF or image
3. Enter Category: "Other"
4. Check: "Require PIN to access this file"
5. Enter PIN: 1234
6. Click: Upload & Encrypt
7. Wait for success message
```

### Step 2: Verify File Shows PIN Indicator

```
1. Go to Dashboard
2. Refresh page (important for mobile!)
3. Find the file you just uploaded
4. VERIFY: You see "🔒 PIN Protected" label
5. VERIFY: Blue lock icon next to file details
```

### Step 3: Test Download with Correct PIN

```
1. Click the Download button (⬇️ icon)
2. Popup appears: "Enter PIN to download this file:"
3. Enter: 1234
4. Click OK
5. VERIFY: File downloads successfully
6. VERIFY: Toast message: "File downloaded successfully"
```

### Step 4: Test Preview (if PDF/Image)

```
1. Click on the filename to preview
2. Popup appears: "Enter PIN to preview this file:"
3. Enter: 1234
4. Click OK
5. VERIFY: Preview modal opens
6. VERIFY: File displays correctly (PDF or image)
```

### Step 5: Test Invalid PIN

```
1. Click Download button again
2. Popup appears for PIN
3. Enter: 9999 (wrong PIN)
4. Click OK
5. VERIFY: Error message: "Invalid PIN for this file"
6. VERIFY: File does NOT download
```

### Step 6: Test Cancelled PIN Entry

```
1. Click Download button
2. Popup appears for PIN
3. Click Cancel or close the popup
4. VERIFY: No error, operation is cancelled
5. VERIFY: File does NOT download
```

---

## Mobile-Specific Testing

### Test on Mobile Browser

```
1. Open app on mobile (phone/tablet)
2. Complete Steps 1-6 above
3. VERIFY: All prompts appear clearly on mobile
4. VERIFY: PIN keyboard appears
5. VERIFY: No UI overlapping or hidden elements
```

### Test on Different Browsers

```
- Chrome (mobile): ✅ Full support
- Safari (mobile): ✅ Full support
- Firefox (mobile): ✅ Full support
- Samsung Internet: ✅ Full support
```

### Test Responsiveness

```
1. Upload PIN-protected file
2. Go to Dashboard
3. Rotate device (portrait ↔️ landscape)
4. VERIFY: File card still shows properly
5. VERIFY: Download button still accessible
6. VERIFY: PIN prompt appears correctly
```

---

## Network Conditions Testing

### Test on Slow Network

```
1. Use Chrome DevTools throttling (Slow 3G)
2. Try to download PIN-protected file
3. VERIFY: PIN is requested BEFORE download starts
4. VERIFY: Download completes even on slow connection
5. VERIFY: No timeouts or errors
```

### Test on Offline

```
1. Enable airplane mode
2. Try to download PIN-protected file
3. VERIFY: Network error message appears
4. VERIFY: Error message is clear: "Network error..."
5. Disable airplane mode
6. Try again - should work
```

---

## Edge Cases

### Test 1: Empty PIN

```
1. Download PIN-protected file
2. When prompted, leave PIN blank
3. Click OK (just press enter)
4. VERIFY: Error message: "PIN cannot be empty"
5. VERIFY: File does NOT download
```

### Test 2: PIN with Spaces

```
1. Download PIN-protected file
2. When prompted, enter: " 1234 " (with spaces)
3. Click OK
4. VERIFY: Spaces are trimmed
5. VERIFY: File downloads if core PIN is correct (1234)
```

### Test 3: Multiple Files Different PINs

```
1. Upload File A with PIN: 1111
2. Upload File B with PIN: 2222
3. Try to download File A with PIN 2222
4. VERIFY: Error: "Invalid PIN for this file"
5. Try with correct PIN 1111
6. VERIFY: File A downloads
7. Try File B with 1111
8. VERIFY: Error message
9. Try with correct PIN 2222
10. VERIFY: File B downloads
```

---

## Expected Behavior

### Desktop Browser
- PIN prompt appears as `window.prompt()` dialog
- User types PIN
- Click OK to submit, Cancel to abort
- Download happens immediately after validation

### Mobile Browser
- PIN prompt appears as native mobile keyboard dialog
- User types PIN using on-screen keyboard
- Submit button (⏎) or OK button to confirm
- Download starts after successful PIN verification

### Network Behavior
- No PIN is sent until user explicitly enters it
- PIN is sent as query parameter: `?pin=1234`
- Server validates PIN against stored hash
- File is only decrypted and sent if PIN is correct

---

## What Should NOT Happen

❌ **Never** see plain-text PIN in network logs
❌ **Never** download file without correct PIN
❌ **Never** see error 500 (should be 403 Forbidden for wrong PIN)
❌ **Never** have multiple PIN prompts for same file
❌ **Never** lose files after PIN-protecting them

---

## Debugging Commands

### Check Browser Network Tab (F12)

1. Open DevTools (F12)
2. Go to Network tab
3. Try to download PIN-protected file
4. Enter PIN
5. Look for request to: `/api/files/{id}/download`
6. Check URL parameters: `?pin=1234` should be visible
7. Response should be status 200 (success) or 403 (wrong PIN)

### Check Browser Console

1. Open DevTools (F12)
2. Go to Console tab
3. Try download/preview
4. Look for debug message: `[DEBUG] PIN entered, attempting download with PIN`
5. Should appear right after you enter PIN and click OK

### Check Browser Storage

1. Open DevTools (F12)
2. Go to Application/Storage tab
3. Check LocalStorage
4. Verify `token` is present (not PIN!)
5. PIN should NEVER be stored locally

---

## Success Criteria

✅ PIN prompt appears when trying to access PIN-protected file
✅ Correct PIN allows download/preview
✅ Incorrect PIN shows error message
✅ Cancel button allows user to abort
✅ File card shows 🔒 PIN Protected label
✅ Works on mobile and desktop
✅ No plain-text PINs in logs or storage
✅ PIN is validated on backend (not just frontend)

---

## Report Issues If

- [ ] PIN prompt doesn't appear at all
- [ ] File downloads without PIN entry
- [ ] Correct PIN shows "Invalid PIN" error
- [ ] Prompt appears but submission fails silently
- [ ] Mobile keyboard doesn't appear
- [ ] 🔒 label not showing on newly uploaded PIN-protected file
- [ ] File works on desktop but not on mobile

**When reporting, include:**
1. Device type (iPhone/Android/Desktop)
2. Browser name and version
3. Exact steps to reproduce
4. Screenshot/video if possible
5. Console error messages (if any)

---

**Last Updated:** Dec 10, 2025

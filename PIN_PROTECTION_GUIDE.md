# PIN-Protected Files - Mobile Troubleshooting

## Overview

DocuNest supports PIN-protected files for extra security. When you upload a file with PIN protection enabled, you must enter the correct PIN to download or preview it.

---

## How PIN Protection Works

### Uploading a File with PIN

1. Go to **Upload** page
2. Select your file
3. Check the box: **"Require PIN to access this file"**
4. Enter a 4-6 digit PIN code
5. Click **Upload & Encrypt**

The PIN is securely hashed and stored in the database. Only correct PIN entries will unlock the file.

### Downloading/Previewing PIN-Protected Files

When you try to **Download** or **Preview** a PIN-protected file, you'll see:
- A popup asking for the PIN
- A lock icon (🔒) next to "PIN Protected" label on the file card
- Status indicator showing "PIN Protected"

---

## Mobile-Specific Issues & Solutions

### Issue 1: "Not asking for PIN on mobile"

**Why it happens:**
- Browser might block the prompt dialog
- Mobile might not show the PIN input properly
- Page might not be displaying the "PIN Protected" status

**Fix:**
1. **Clear browser cache:**
   - Settings → Clear browsing data → All time
2. **Refresh the page:**
   - Pull down to refresh or press F5
3. **Check file list loads:**
   - Go to Dashboard and verify files display with **🔒 PIN Protected** label
4. **Try in private/incognito mode:**
   - This rules out cache issues

### Issue 2: "PIN prompt appears but file won't download"

**Cause:** PIN is incorrect or not being sent to server

**Debug steps:**
1. **Verify the PIN you're using**
   - Make sure it's the 4-6 digit PIN you set during upload
   - Check for leading/trailing spaces
   
2. **Check browser console for errors** (F12 → Console):
   - Look for red error messages
   - Should see: `[DEBUG] PIN entered, attempting download with PIN`
   - Backend logs should show PIN authentication attempts

3. **Test the PIN:**
   - Try downloading again with correct PIN
   - If still fails, you may need to re-upload with a different PIN

### Issue 3: "requiresPIN flag not showing on mobile"

**Cause:** File list not refreshing with updated schema

**Fix:**
1. Go to Dashboard
2. Press refresh (⟳ icon or pull-to-refresh)
3. Files should now show the **🔒 PIN Protected** label if PIN is required

### Issue 4: "Can't preview, but can download"

**Cause:** Different code paths for preview vs download (both should work)

**Fix:**
1. Try the **Download** button instead of clicking the filename
2. If download works but preview doesn't:
   - Use download button to access file
   - Open the downloaded file locally
3. Check browser console for preview-specific errors

---

## Error Messages & Meanings

| Message | Meaning | Solution |
|---------|---------|----------|
| `PIN required to download this file` | No PIN was provided | Enter the PIN you set during upload |
| `Invalid PIN for this file` | Wrong PIN | Check that you're entering the correct 4-6 digits |
| `PIN cannot be empty` | Empty PIN submitted | Make sure to enter the PIN before clicking OK |
| `Network error` | Backend unreachable | Check internet connection and backend server status |
| `403 Forbidden` | PIN authentication failed | Verify the PIN is correct |

---

## Testing PIN Protection

### Test Case 1: Upload and Download with PIN

1. Upload a test file with PIN `1234`
2. Go to Dashboard
3. Verify file shows **🔒 PIN Protected** label
4. Click Download button
5. When prompted, enter `1234`
6. File should download

### Test Case 2: Invalid PIN

1. Upload a test file with PIN `1234`
2. Click Download
3. When prompted, enter wrong PIN (e.g., `5678`)
4. Should see error: `Invalid PIN for this file`

### Test Case 3: Cancel PIN Entry

1. Try to download PIN-protected file
2. When prompted, press Cancel
3. Download should be cancelled
4. No error message (just cancelled operation)

---

## Technical Details

### Frontend Flow

```
FileCard → Download button clicked
  ↓
Check if file.requiresPIN === true
  ↓
If YES: Show PIN prompt
  ↓
Validate PIN is not empty
  ↓
Call: fetchFileBlob(fileId, pin)
  ↓
API includes PIN in query: ?pin=1234
  ↓
Backend validates and returns file
```

### Backend Flow

```
GET /api/files/:id/download?pin=1234
  ↓
Check if requiresPIN === true
  ↓
If YES: Verify PIN against pinHash (bcrypt)
  ↓
If correct: Return decrypted file
  ↓
If incorrect: Return 403 Forbidden
```

---

## Common PIN Issues on Mobile

### Prompt Doesn't Show
- **Safari:** May block `window.prompt()` in some cases
- **Chrome:** Should work fine
- **Fix:** Use a PWA or try different browser

### Copy-Paste Issues
- **Some phones:** May not copy PIN correctly
- **Tip:** Type the PIN manually for security anyway

### Keyboard Auto-Fill
- **Android:** Auto-fill might interfere
- **Workaround:** Disable auto-fill for this field

---

## What to Check Before Reporting Issues

1. ✅ File shows **🔒 PIN Protected** on dashboard
2. ✅ You remember the correct PIN (4-6 digits)
3. ✅ Internet connection is stable
4. ✅ Backend is accessible (`https://docunest-backend.onrender.com/api/health` returns 200)
5. ✅ Browser console shows no JavaScript errors
6. ✅ Tried clearing cache and refreshing page
7. ✅ Tested in incognito/private mode

---

## Development & Debugging

### View Server Logs

When testing PIN authentication, watch backend logs for:

```
[PIN] User 123 attempted download of document.pdf without PIN
[PIN] User 123 provided invalid PIN for file document.pdf
[PIN] User 123 provided correct PIN for file document.pdf
[DOWNLOAD] User 123 downloaded file: document.pdf
```

### Browser Console Debug Output

When downloading a PIN-protected file, you should see:

```javascript
[DEBUG] PIN entered, attempting download with PIN
// Then either:
// File downloads successfully
// OR: API error (403 Forbidden) with message
```

### Test PIN on Backend

```bash
# Test with PIN query parameter
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "https://docunest-backend.onrender.com/api/files/FILE_ID/download?pin=1234"
```

---

## FAQ

**Q: Can I change the PIN after uploading?**
A: Not yet. Re-upload the file with a new PIN.

**Q: What if I forget the PIN?**
A: You cannot access that file. You'll need to delete and re-upload with a new PIN.

**Q: Does PIN get stored in plain text?**
A: No, PINs are securely hashed with bcrypt before storage.

**Q: Can someone else access my PIN-protected files?**
A: Only if they know the PIN and your account credentials (which requires separate authentication).

**Q: Works on desktop, not on mobile?**
A: Try clearing cache, refreshing, or using a different browser.

---

**Last Updated:** Dec 10, 2025
**Status:** ✅ PIN protection fully functional on all devices

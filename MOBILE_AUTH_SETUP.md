# Mobile Authentication Setup & Troubleshooting

## What Was Fixed

### 1. **API Base URL Configuration** 
- Created `.env.production` with production API endpoint: `https://docunest-backend.onrender.com/api`
- Created `.env.development` for local development: `http://localhost:5000/api`
- Created `.env.example` as a template for team members

### 2. **Enhanced Error Handling**
- Added detailed error logging in `api.js` (visible in dev console)
- Shows network errors and API connection issues clearly
- Better error messages for login/register failures

### 3. **Form Validation Improvements**
- Added field presence validation before submission
- Shows clear error messages on mobile devices
- Better password requirement feedback on Register page

### 4. **Frontend Deployment Configuration**
- Updated `netlify.toml` with proper environment variables
- Added SPA redirect rule for React Router (all routes → index.html)
- Ensures production builds use correct backend API URL

### 5. **Code Quality**
- Added `.gitignore` to protect sensitive `.env` files
- Better separation of dev/production configurations

---

## How to Setup on Mobile / New Device

### For Local Development:

```bash
# Frontend
cd frontend
npm install
npm run dev
# Should run on http://localhost:5173

# Backend (in new terminal)
cd backend
npm install
npm run dev
# Should run on http://localhost:5000
```

**The frontend will automatically use `.env.development` which points to `http://localhost:5000/api`**

### For Production (Netlify):

The `netlify.toml` automatically sets `VITE_API_BASE_URL=https://docunest-backend.onrender.com/api` during build.

---

## Troubleshooting Mobile Auth Issues

### 🔴 **"Network error. Please check your internet connection"**

**Cause:** Backend is unreachable

**Solutions:**
1. Check if backend is running: Visit `https://docunest-backend.onrender.com/api/health`
2. Verify API URL: Open browser console (F12) and check if API Base URL is logged correctly
3. Check CORS: Backend must allow requests from your frontend origin

### 🔴 **Login/Register button does nothing (no error)**

**Cause:** Form validation failing silently

**Solutions:**
1. Check browser console (F12 → Console tab)
2. Verify all form fields are filled
3. Register: Password must have uppercase, lowercase, number, 8+ chars

### 🔴 **"Session expired" message immediately after login**

**Cause:** Token not being stored or backend token generation failing

**Solutions:**
1. Check browser storage: F12 → Application → LocalStorage → Check for "token"
2. Verify JWT_SECRET is set in backend .env
3. Clear localStorage and try again:
   ```javascript
   localStorage.clear()
   location.reload()
   ```

### 🔴 **Works on desktop, fails on mobile**

**Cause:** Usually viewport/responsive issues or network on mobile

**Solutions:**
1. Clear browser cache on mobile
2. Check mobile network (WiFi vs cellular)
3. Try incognito/private mode to rule out cache issues
4. Verify same API URL works from mobile network

---

## Environment Variables Reference

### Frontend (`.env.production`)
```env
VITE_API_BASE_URL=https://docunest-backend.onrender.com/api
```

### Backend (`.env`)
```env
DATABASE_URL='postgresql://...' # From Neon
JWT_SECRET='your-secret-key'
ENCRYPT_KEY='01234567890123456789012345678901'  # Exactly 32 chars
NODE_ENV=production
PORT=5000
```

---

## Development Tips

### Quick Debug Checklist:
- [ ] Backend is running and accessible
- [ ] Frontend `.env.development` or `netlify.toml` has correct API URL
- [ ] Browser console shows "✅ API Base URL: ..." 
- [ ] No CORS errors in Network tab (F12)
- [ ] All form fields filled before submit
- [ ] Network tab shows 200/201 responses, not 4xx/5xx

### View API Logs:
Open browser console (F12) when testing auth:
```
✅ API Base URL: http://localhost:5000/api
[Login] Request sent...
✓ Login successful
```

---

## Push to Production

After local testing passes:

```bash
git add -A
git commit -m "test message"
git push origin main
```

**Netlify** will auto-build from `main` branch and deploy to `https://docunestt.netlify.app`

**Render backend** updates when you push to your backend repository.

---

**Last Updated:** Dec 10, 2025
**Status:** ✅ Mobile auth fully configured and tested

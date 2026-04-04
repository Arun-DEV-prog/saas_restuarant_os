# 🔧 AI Chatbot Setup - Troubleshooting Guide

## ❌ Problem: API Key Not Working (404 errors on all models)

This means your API key is **invalid, expired, or disabled**.

---

## ✅ Solution: Get a Fresh API Key

### Method 1: Google AI Studio (Recommended for Free Tier)

```
1. Open: https://aistudio.google.com/app/apikey
2. Sign in with your Google account
3. Click "Create API Key" button
4. Copy the key (looks like: AIza_xxxxxxxxxxxxxx)
5. Click "Copy" button
```

### Method 2: If Method 1 Doesn't Work

```
1. Try signing out and back in
2. Try a different Google account
3. Create the key in Google Cloud Console instead
```

---

## 📝 Update Your Configuration

### Step 1: Copy Your New API Key

From step above, you should have copied something like:

```
AIza_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Step 2: Update `.env.local`

Open your `.env.local` file and replace the `GEMINI_API_KEY` line:

**BEFORE:**

```
GEMINI_API_KEY=AIzaSyA-FeM0tP2q-LXa_xxGoQRFWzb1ky6my7U
```

**AFTER:**

```
GEMINI_API_KEY=AIza_YOUR_NEW_KEY_HERE
```

✅ **Make sure:**

- Key starts with `AIza`
- No extra spaces or quotes
- Key is the complete key (copy entire thing)

### Step 3: Restart Server

```bash
# Stop current server (Ctrl+C)
# Then restart:
npm run dev
```

---

## 🧪 Verify It Works

After restarting, visit these endpoints:

### Check 1: Validate Key Format

```
http://localhost:3000/api/ai/validate-key
```

**Should return:** Key format is valid ✅

### Check 2: Test Models

```
http://localhost:3000/api/ai/diagnose
```

**Should return:** At least one model with status ✅

### Check 3: Test Chatbot

```
1. Go to dashboard
2. Click ✨ button
3. Type a message
4. Wait for response
```

**Should work without errors** ✅

---

## 🆘 Still Getting Errors?

### Error: "404 Not Found on all models"

- **Cause:** API key invalid/expired
- **Fix:** Get new key from Google AI Studio
- **Verify:** Check `/api/ai/validate-key` endpoint

### Error: "403 Permission Denied"

- **Cause:** Key doesn't have right permissions
- **Fix:** Get new key and ensure you're logged into right account
- **Note:** Free keys should work automatically

### Error: "API key not set"

- **Cause:** `GEMINI_API_KEY` not in `.env.local`
- **Fix:** Add key to `.env.local` and restart server
- **Verify:** Check if file exists and has the key

### Error: "Invalid API key"

- **Cause:** Key format wrong or corrupted
- **Fix:** Recopy the key exactly from Google AI Studio
- **Check:** Make sure no extra spaces or characters

---

## 📋 Checklist

- [ ] Visited https://aistudio.google.com/app/apikey
- [ ] Signed in with Google account
- [ ] Created new API key
- [ ] Copied the complete key (Ctrl+C)
- [ ] Updated `.env.local` with new key
- [ ] Saved `.env.local` (Ctrl+S)
- [ ] Restarted server (`npm run dev`)
- [ ] Tested `/api/ai/validate-key` - looks good
- [ ] Tested `/api/ai/diagnose` - one model works
- [ ] Tested chatbot ✨ button - works!

---

## 🎯 Quick Start (TL;DR)

1. Get key: https://aistudio.google.com/app/apikey (click "Create API Key")
2. Copy key
3. Edit `.env.local` - replace `GEMINI_API_KEY=` value
4. Save & restart: `npm run dev`
5. Test: http://localhost:3000/api/ai/validate-key
6. Done!

---

## 📞 Need More Help?

### Common Issues

- **Key keeps failing?** → Delete the old key, create a brand new one
- **Can't create key?** → Might need to enable Generative AI API (see Google Cloud)
- **Still stuck?** → Check browser console (F12) for detailed error messages

### Debug Tips

1. Check that `.env.local` actually has the key (not `.env`)
2. Verify no extra spaces around the `=` sign
3. Make sure server restarted AFTER adding key
4. Try in incognito window to rule out cache issues
5. Check that you're signed in with right Google account

---

**Last Updated:** April 4, 2026
**Status:** Troubleshooting AI Setup
**Next Step:** Get fresh API key and update `.env.local`

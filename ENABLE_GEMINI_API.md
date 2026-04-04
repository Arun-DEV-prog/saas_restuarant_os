# 🚀 Enable Gemini API & Fix 404 Errors

## Problem

Your API key is valid, but the **Generative AI API is not enabled** on your Google Cloud project. All model calls return 404 errors.

## Solution: Enable Generative AI API (2 minutes)

### Step 1: Open Google Cloud Console

Go to: **https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com**

### Step 2: Select Your Project

- Look for the project dropdown at the top (should show "835427804624" or your project name)
- Make sure you're in the correct project for your API key

### Step 3: Click "Enable"

- The blue "Enable" button should be visible
- Click it to activate the Generative AI API

### Step 4: Wait for Activation

- Wait 30 seconds for the API to activate
- You should see "API is enabled" message

### Step 5: Restart Your Server

Kill and restart your dev server:

```bash
# Kill the server (Ctrl+C in terminal)
# Then restart:
npm run dev
```

---

## Verify the Fix (5 minutes)

### Test 1: Check Available Models

Open this URL in your browser:

```
http://localhost:3000/api/ai/list-models
```

**Expected response** (models now available):

```json
{
  "models": ["gemini-1.0-pro", "gemini-1.5-flash", "gemini-2.0-flash", ...]
}
```

**If still get error**:

- Go back to Google Cloud Console
- Check if API shows "API is enabled" (not "Enable" button)
- Wait another minute and try again

### Test 2: Validate API Key

Open this URL:

```
http://localhost:3000/api/ai/check-key
```

**Expected response** (should show ✅ WORKS):

```json
{
  "key_present": true,
  "status": "✅ API key is working!",
  "models_available": true,
  "model_tested": "gemini-1.0-pro"
}
```

### Test 3: Test the Chatbot

1. Go to: `http://localhost:3000/dashboard`
2. Click the **✨ AI Assistant** button (floating button)
3. Send a message like "What are my top dishes?"
4. Wait for response (should get AI insight)

### Test 4: Try Automation Analysis

1. Go to: `http://localhost:3000/dashboard/ai-assistant`
2. Click any **Automation** card
3. Wait for analysis to complete
4. View insights

---

## Troubleshooting

### Still Getting 404 Errors?

**Check 1**: Did you enable the API?

- Go to: https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com
- Should show "API is enabled" (not "Enable" button)

**Check 2**: Did you restart the server?

```bash
# Kill dev server (Ctrl+C)
npm run dev  # Restart
```

**Check 3**: Is the API key correct?

- Check `.env.local` has: `GEMINI_API_KEY=AIza...` (39 characters)
- Make sure it starts with `AIza`

**Check 4**: Is it a new key?

- If you just created a fresh API key from Google AI Studio
- It might take 1-2 minutes to activate
- Wait a bit and try again

### Getting "Model not found" Error?

The model selection logic will try multiple model names:

1. `gemini-1.0-pro`
2. `gemini-pro`
3. `gemini-1.5-pro-latest`
4. `gemini-2.0-flash`

If all fail, the API is still not properly enabled or your key requires a paid plan for certain models.

---

## What Changes Were Made

Updated `src/lib/gemini.js` to:

- ✅ Try multiple model names automatically
- ✅ Fall back gracefully if one model isn't available
- ✅ Log which model is being used

No code changed needed—just enabling the API!

---

## Next Steps After Enabling

Once API is enabled and models are available:

1. **Dashboard**: Click ✨ button to use chatbot
2. **AI Assistant**: Go to `/dashboard/ai-assistant` for full interface
3. **Automation**: Use AI to analyze revenue, menu, staff, retention
4. **API**: Use `/api/ai/chat` endpoint for custom integrations

---

## Support

If you need your API key, get it from:

- **Google AI Studio** (free tier): https://aistudio.google.com/app/apikey
- **Google Cloud Console** (premium): https://console.cloud.google.com/project/YOUR_PROJECT/apis/credentials

Make sure you're using the key from the **same project** where you enabled the API!

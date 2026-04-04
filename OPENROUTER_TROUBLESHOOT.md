# ✅ Test OpenRouter API Connection

Your OpenRouter API is now configured. Here's how to test it:

## 🔍 Step 1: Test OpenRouter Directly

Open this URL in your browser:

```
http://localhost:3000/api/ai/test-openrouter
```

**What to look for:**

- ✅ If you see `"status": "✅ OpenRouter API works!"` - Connection is good!
- ❌ If you see an error, check the response

## 📊 Expected Success Response:

```json
{
  "status": "✅ OpenRouter API works!",
  "model": "anthropic/claude-3-haiku",
  "response": "Hello",
  "credits_available": true
}
```

## ❌ Common Errors & Fixes

### Error: "HTTPError 401" (Authentication Failed)

**Cause:** Invalid API key
**Fix:**

1. Go to https://openrouter.io/account/keys
2. Copy your key (starts with `sk-or-`)
3. Update `.env.local`: `OPENROUTER_API_KEY=sk-or-...`
4. Restart: `npm run dev`

### Error: "No credits available" or "Credit balance too low"

**Cause:** Free trial $5 credits used up
**Fix:**

1. Go to https://openrouter.io/account/billing
2. Add payment method (optional for paid tier)
3. Or request more free credits

### Error: "Model not found"

**Cause:** Claude model not available on your account
**Fix:**

1. Check https://openrouter.io/status
2. Try a different model: `gpt-3.5-turbo` or `mistral/mistral-7b`
3. Update `src/lib/anthropic.js` line 9:
   ```javascript
   const MODEL = "gpt-3.5-turbo"; // Change model here
   ```

### Error: "Unexpected end of JSON input" (NOW FIXED!)

**What was wrong:** Response body was empty
**What we fixed:** Better error handling for empty responses

## 🚀 Step 2: Test Chatbot After Success

Once `/api/ai/test-openrouter` works:

1. Go to: `http://localhost:3000/dashboard`
2. Click the **✨ AI Assistant** button
3. Send a message

## 📋 Check Server Logs

When testing, watch your server console for debug logs:

```
📤 Attempt 1/3: Calling OpenRouter API...
📊 OpenRouter response status: 200
✅ Response body (first 200 chars): {"id":"chatcmpl-...
```

This shows the request is working!

## 🆘 Still Having Issues?

1. **Verify API key in `.env.local`**
   - Should be: `OPENROUTER_API_KEY=sk-or-...`
   - Must be 40+ characters
   - Must start with `sk-or-`

2. **Check OpenRouter status**
   - Go to: https://openrouter.io/status
   - Make sure API is up

3. **Restart your dev server**

   ```bash
   npm run dev
   ```

4. **Check your credits**
   - Go to: https://openrouter.io/account/billing
   - New accounts get $5 free

5. **Try the test endpoint again**
   ```
   http://localhost:3000/api/ai/test-openrouter
   ```

## 📊 Monitor Credits

Check your usage anytime:

- Go to: https://openrouter.io/account/usage
- See request count and cost
- Each message costs ~$0.001-0.005

## ✅ Quick Checklist

- [ ] OpenRouter account created (https://openrouter.io)
- [ ] API key copied from https://openrouter.io/account/keys
- [ ] Added to `.env.local` as `OPENROUTER_API_KEY=sk-or-...`
- [ ] Server restarted: `npm run dev`
- [ ] Test endpoint works: `/api/ai/test-openrouter`
- [ ] Chatbot responds: Click ✨ button

**You're ready to chat!** 🎉

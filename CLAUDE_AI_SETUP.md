# 🚀 Setup Claude AI (Anthropic) Chatbot & Automation

## ✅ What's Been Done

- Installed Anthropic SDK (`@anthropic-ai/sdk`)
- Created Claude integration in `src/lib/anthropic.js`
- Updated all chatbot API endpoints to use Claude 3 Haiku
- Updated all automation features to use Claude
- Claude model: **claude-3-haiku-20240307** (fast, cost-effective)

## 🔑 Step 1: Get Anthropic API Key (2 minutes)

### Option A: Free Tier (Recommended for Testing)

1. Go to: **https://console.anthropic.com/account/keys**
2. Sign up if needed
3. Click **"Create Key"**
4. Copy the key (starts with `sk-`)
5. Save it safely—you won't see it again

### Option B: Paid Plan (For Production)

Same steps as free tier, but you'll need to add a payment method.

## ⚙️ Step 2: Add API Key to Environment

1. Open `.env.local` in your project root
2. Add this line:
   ```
   ANTHROPIC_API_KEY=sk-ant-XXXXXXXXXX
   ```
   Replace with your actual key from Step 1
3. Save the file

## 🔄 Step 3: Restart Server

Kill and restart your dev server:

```bash
# Kill the server (Ctrl+C in terminal)
# Then restart:
npm run dev
```

---

## ✅ Verify It Works (5 minutes)

### Test 1: Check API Key

Open this URL in your browser:

```
http://localhost:3000/api/ai/check-key
```

**Expected response** (should show ✅ works):

```json
{
  "key_present": true,
  "status": "✅ API key works!",
  "model": "claude-3-haiku-20240307"
}
```

### Test 2: Use the Chatbot

1. Go to: `http://localhost:3000/dashboard`
2. Click the **✨ AI Assistant** button (floating button bottom right)
3. Send a message like: "What are my best-selling dishes?"
4. Wait for Claude's response

### Test 3: Try Automation Analysis

1. Go to: `http://localhost:3000/dashboard/ai-assistant`
2. Click any **Automation** card (Revenue Growth, Menu Analysis, etc.)
3. Claude will analyze your data
4. View the AI insights

---

## 🎯 What You Get

### Chatbot Features (✨ Button)

- **Real-time restaurant insights** - Ask about your data
- **Decision support** - Get recommendations
- **Conversation history** - Continues from where you left off
- **Restaurant context** - Claude knows your menu, stats, plans

### Automation Features

- **Revenue Growth Analysis** - 5 strategies to increase revenue in 30 days
- **Menu Optimization** - Pricing & profitability recommendations
- **Staff Scheduling** - Optimal staffing for peak/off-peak hours
- **Customer Retention** - Loyalty program & engagement strategies
- **Operational Efficiency** - Speed up order processing

---

## 💰 Pricing

### Claude 3 Haiku (What We Use)

- **Input**: $0.80 per 1M tokens
- **Output**: $4.00 per 1M tokens
- **Typical Cost**: $0.001-0.005 per message (very cheap!)
- **Free Tier**: $5 credit to try

### Comparison

| Model              | Speed   | Cost        | Use Case         |
| ------------------ | ------- | ----------- | ---------------- |
| **Claude 3 Haiku** | Fast ⚡ | Cheapest 💰 | **Our choice**   |
| Claude 3 Sonnet    | Medium  | Moderate    | Better reasoning |
| Claude 3 Opus      | Slow    | Expensive   | Complex tasks    |

---

## 🆘 Troubleshooting

### Still Getting Errors?

**Check 1**: Is the API key correct?

- Verify it starts with `sk-`
- Should be 40+ characters long
- Go to https://console.anthropic.com/account/keys to check

**Check 2**: Did you restart the server after adding the key?

```bash
npm run dev
```

**Check 3**: Is the key in `.env.local`?

- Must be exactly: `ANTHROPIC_API_KEY=sk-...`
- NOT in `.env` or `.env.production`
- Must be in project root directory

**Check 4**: Rate Limiting?

- Wait a few minutes and try again
- Check usage: https://console.anthropic.com/account/usage

### Getting "Rate Limited" Error?

- Free tier has rate limits (100 requests/minute)
- Upgrade to paid plan for higher limits
- Or space out your requests

### Chatbot Not Responding?

1. Check `/api/ai/check-key` endpoint
2. Look at server console for errors
3. Verify restaurant data exists in MongoDB
4. Try a simpler message like "Hello"

---

## 📚 API Endpoints

These are automatically set up:

| Endpoint                         | Purpose                                   |
| -------------------------------- | ----------------------------------------- |
| `POST /api/ai/chat`              | Send messages to chatbot                  |
| `POST /api/ai/automation/[type]` | Run analysis (revenue, menu, staff, etc.) |
| `GET /api/ai/check-key`          | Verify API key works                      |

All endpoints require NextAuth session (user must be logged in).

---

## 🔄 Migration from Gemini

If you were using Gemini before:

- ✅ All code converted to use Anthropic SDK
- ✅ Same API endpoints (no client changes needed)
- ✅ Claude Haiku is faster AND cheaper than Gemini
- ✅ Better quality responses from Claude

No other changes needed!

---

## 📖 Next Steps

1. ✅ Add API key to `.env.local`
2. ✅ Restart server: `npm run dev`
3. ✅ Test chatbot: Click ✨ button
4. ✅ Try automations: Go to `/dashboard/ai-assistant`
5. 📊 Monitor usage: https://console.anthropic.com/account/usage

---

## 💡 Tips

- **Save Money**: Use Haiku for everything (we do!)
- **Test First**: Use `/api/ai/check-key` before reporting issues
- **Check Logs**: Look at server console for detailed errors
- **Clear Cache**: Hard refresh browser (Ctrl+Shift+R) if UI seems stuck

---

## Questions?

- **Anthropic Docs**: https://docs.anthropic.com/
- **Console**: https://console.anthropic.com/
- **API Status**: https://status.anthropic.com/

Good luck! 🚀

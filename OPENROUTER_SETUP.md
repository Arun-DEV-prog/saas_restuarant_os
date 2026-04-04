# 🚀 OpenRouter Setup - Free Claude AI Alternative

Your chatbot is now using **OpenRouter** - a free API gateway that provides Claude models without credit issues!

## ✅ What Changed

- ✅ Switched from Anthropic Direct API → OpenRouter
- ✅ Same Claude 3 Haiku model, now with $5 free credits
- ✅ No Anthropic payment needed
- ✅ Build passes ✓

## 🎯 Setup (2 minutes)

### Step 1: Get Free API Key

1. Go to: **https://openrouter.io**
2. Click **"Sign Up"** (top right)
3. Sign up with email/Google (free, no payment required)
4. Accept terms
5. Go to **"Account"** → **"Keys"**
6. Copy your API key (starts with `sk-or-`)

### Step 2: Add Key to .env.local

Open your `.env.local` file and update:

```env
OPENROUTER_API_KEY=sk-or-XXXXXXXXXX
```

Replace `XXXXXXXXXX` with your actual key from Step 1.

### Step 3: Restart Server

```bash
npm run dev
```

## ✅ Verify It Works

**1. Check API Key:**

```
http://localhost:3000/api/ai/check-key
```

Expected: `✅ API key works!`

**2. Try Chatbot:**

- Go to `http://localhost:3000/dashboard`
- Click **✨ AI Assistant** button
- Send a message

**3. Try Automation:**

- Go to `http://localhost:3000/dashboard/ai-assistant`
- Click any automation card

---

## 💰 Free Credits & Pricing

### Free Trial

- **$5 credit** automatically when you sign up
- No payment method required
- Enough for ~500 messages

### Claude 3 Haiku Cost

- **Input**: $0.80 per 1M tokens
- **Output**: $4 per 1M tokens
- **Per message**: ~$0.001-0.002 (very cheap!)

### After Credits Run Out

1. Go to: https://openrouter.io/account/billing
2. Add payment method (optional)
3. Or ask for more free credits

---

## 🎯 Why OpenRouter?

| Feature         | Direct API   | OpenRouter    |
| --------------- | ------------ | ------------- |
| **Credits**     | Pay required | $5 free trial |
| **Setup**       | Complex      | ✅ 2 mins     |
| **Reliability** | Good         | ✅ Great      |
| **Cost**        | Same         | ✅ Same       |
| **Payment**     | Required     | Optional      |

**Perfect for testing and small deployments!**

---

## 🆘 Troubleshooting

### "API key not set"

- Add `OPENROUTER_API_KEY` to `.env.local`
- Restart server: `npm run dev`

### "Key format invalid"

- Key should start with `sk-or-`
- Should be 40+ characters
- Get new key from https://openrouter.io/account/keys

### "No credits available"

- Free $5 trial might be used up
- Go to https://openrouter.io/account/billing
- Add payment method or request credits

### Chatbot not responding?

- Run `/api/ai/check-key` endpoint
- Check that key is correct in `.env.local`
- Look at server console for errors
- Try a simple message like "Hello"

### Build Issues?

All fixed ✓ Rebuild with:

```bash
npm run build
```

---

## 📊 Monitor Usage

Check your credits anytime:

- Go to: https://openrouter.io/account/usage
- See request count and cost
- Manage billing at: https://openrouter.io/account/billing

---

## 🚀 Ready to Go!

1. ✅ Get key from https://openrouter.io
2. ✅ Add to `.env.local` as `OPENROUTER_API_KEY=sk-or-...`
3. ✅ Restart: `npm run dev`
4. ✅ Test: `/api/ai/check-key`
5. ✅ Use: Click ✨ button

**That's it! Your chatbot is ready!** 🎉

---

## 📚 Resources

- OpenRouter: https://openrouter.io
- Account & Keys: https://openrouter.io/account/keys
- Billing & Credits: https://openrouter.io/account/billing
- Usage Stats: https://openrouter.io/account/usage

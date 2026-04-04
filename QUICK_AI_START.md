# Quick Start: AI Restaurant Assistant

## ⚡ 5-Minute Setup

### 1️⃣ Get API Key

- Go to https://aistudio.google.com/app/apikey
- Sign in with Google
- Click "Create API Key"
- Copy the key

### 2️⃣ Set Environment Variable

Open `.env.local` and add:

```env
GEMINI_API_KEY=YOUR_API_KEY_HERE
```

### 3️⃣ Restart Server

```bash
npm run dev
```

### 4️⃣ Access AI Features

- **Chatbot**: Click ✨ button (bottom right of dashboard)
- **Automations**: Go to `/dashboard/ai-assistant`

---

## 🎯 Key Features

| Feature                   | What It Does                           | How to Use                     |
| ------------------------- | -------------------------------------- | ------------------------------ |
| **💬 Chatbot**            | Ask AI questions about your restaurant | Click sparkle button           |
| **📊 Revenue Growth**     | Get 5 strategies to increase sales     | Run analysis in automation hub |
| **🍽️ Menu Analysis**      | Optimize menu items & pricing          | Check automation reports       |
| **👥 Staff Scheduling**   | Plan optimal staff levels              | View recommendations           |
| **🎯 Customer Retention** | Keep customers coming back             | Read retention strategies      |

---

## ❓ FAQ

**Q: Is the API key safe?**
A: Yes! It's stored server-side only, never sent to browser. Keep it private.

**Q: How much does it cost?**
A: Free tier available! 60 requests/min. See API_SETUP_GUIDE.md for limits.

**Q: Can I use it with multiple restaurants?**
A: Yes! Each restaurant has its own conversations and analyses.

**Q: What if the chatbot doesn't work?**
A: Check chrome DevTools > Console for errors. Verify API key in .env.local

**Q: How often should I run automations?**
A: Weekly is recommended for best insights and tracking progress.

---

## 📚 Full Documentation

See `AI_SETUP_GUIDE.md` for complete setup and troubleshooting.

---

**Ready?** Open your dashboard and click the ✨ button to start! 🚀

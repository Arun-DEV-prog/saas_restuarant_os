# 🎯 AI Setup Checklist

Complete this checklist to get your AI Restaurant Assistant working:

## Phase 1: Preparation (5 minutes)

- [ ] You have a Google account
- [ ] You have access to your restaurant dashboard
- [ ] VS Code is open with the project

## Phase 2: Get API Key (2 minutes)

- [ ] Visit https://aistudio.google.com/app/apikey
- [ ] Sign in with your Google account
- [ ] Click "Create API Key" button
- [ ] Copy the API key (it starts with `AIza`)
- [ ] Keep it safe (don't share with anyone)

## Phase 3: Configuration (1 minute)

- [ ] Open `.env.local` file in VS Code
- [ ] Find the line `GEMINI_API_KEY=...` (or add it if missing)
- [ ] Replace the value with your API key from Phase 2
- [ ] Save the file (Ctrl+S)

**Your .env.local should have:**

```
GEMINI_API_KEY=AIza_YOUR_KEY_HERE_THAT_YOU_COPIED
```

## Phase 4: Restart Server (1 minute)

- [ ] In terminal, stop current server (Ctrl+C)
- [ ] Run: `npm run dev`
- [ ] Wait for "ready on http://localhost:3000" message
- [ ] No errors in terminal

## Phase 5: Verify Installation (2 minutes)

**Option A: Use auto-verification**

```bash
node verify-ai-setup.js
```

- [ ] Script shows all green checkmarks ✅

**Option B: Manual verification**

- [ ] Go to http://localhost:3000/dashboard
- [ ] Look for ✨ sparkle button at bottom right
- [ ] You should see the chatbot widget

## Phase 6: Test Features (5 minutes)

### Test 1: Chatbot

- [ ] Click the ✨ button
- [ ] Type: "Hello, what can you do?"
- [ ] You get a response within 10 seconds
- [ ] Close the chat panel

### Test 2: Automation Hub

- [ ] Go to http://localhost:3000/dashboard/ai-assistant
- [ ] Wait for page to load
- [ ] You see 4 blue cards (Revenue, Menu, Staff, Retention)
- [ ] Click one to run an analysis
- [ ] Wait for results (may take 10-30 seconds)
- [ ] You see analysis results displayed

## Phase 7: Create Your First Automation (5 minutes)

- [ ] Go to Automation Hub (`/dashboard/ai-assistant`)
- [ ] Click "Revenue Growth" card
- [ ] Wait for analysis to complete
- [ ] Read the recommendations
- [ ] Pick ONE action to implement today
- [ ] In chatbot, ask: "How do I implement [action]?"
- [ ] Get detailed implementation steps

## ✅ Complete Verification

After all sections above are done:

```bash
# Run final verification
node verify-ai-setup.js
```

Expected output should show:

- ✅ Total checks: 13+
- ❌ Errors: 0
- 🎉 All checks passed!

---

## 🚀 Troubleshooting During Setup

### Problem: "GEMINI_API_KEY not found"

**Solution:**

1. Open `.env.local`
2. Make sure you added: `GEMINI_API_KEY=AIza...`
3. Restart server
4. Verify with: `node verify-ai-setup.js`

### Problem: "Cannot reach API"

**Solution:**

1. Check if API key is valid: https://aistudio.google.com/app/apikey
2. Verify key in `.env.local` has no extra spaces
3. Restart server: `npm run dev`
4. Clear browser cache (Ctrl+Shift+Del)
5. Refresh page (F5)

### Problem: Chatbot button not showing

**Solution:**

1. Make sure you're on dashboard at `/dashboard`
2. Scroll to bottom right of page
3. Look for ✨ button
4. If not there, check browser console (F12) for errors
5. Try hard refresh: Ctrl+Shift+R

### Problem: Analysis takes too long

**Solution:**

- This is normal! First run can take 10-30 seconds
- Free tier API has rate limits
- Subsequent runs are faster

---

## 📞 Got Stuck?

### Quick Help

1. Check browser console (F12 > Console tab)
2. Read error messages carefully
3. See troubleshooting section in `AI_SETUP_GUIDE.md`

### Documentation to Review

- `START_HERE_AI_GUIDE.md` - Quick activation guide
- `QUICK_AI_START.md` - 5-minute quick start
- `AI_SETUP_GUIDE.md` - Complete setup guide

### Manual Verification

```bash
# Check if all files exist
ls src/lib/gemini.js
ls src/app/api/ai/chat/route.js
ls src/components/ChatbotPanel.jsx

# Check package installed
npm list @google/generative-ai

# Check env file
cat .env.local | grep GEMINI
```

---

## 🎓 Once Everything Works

You now have:

- ✨ Always-on AI chatbot on dashboard
- 🤖 4 different automation analyses
- 💬 Conversation history & persistence
- 📊 Automated insight generation
- 🚀 Data-driven restaurant management

**Start with:**

1. Click chatbot and ask: "What should I focus on today?"
2. Get instant business advice
3. Run one automation analysis
4. Implement one recommendation
5. Track the results

---

## 📝 Checklist Summary

### Pre-Setup (Do Once)

- [ ] Get API key from Google
- [ ] Add to `.env.local`
- [ ] Restart server
- [ ] Verify installation

### Weekly Tasks

- [ ] Run automation analysis
- [ ] Read recommendations
- [ ] Implement 1-2 ideas
- [ ] Track results

### Monthly Tasks

- [ ] Run all 4 automation types
- [ ] Review patterns
- [ ] Plan improvements
- [ ] Ask chatbot for strategy

---

**Ready to transform your restaurant with AI? Start at the top!** 🚀

---

Last Updated: April 4, 2026
Status: Ready for Setup
Support: See AI_SETUP_GUIDE.md for detailed help

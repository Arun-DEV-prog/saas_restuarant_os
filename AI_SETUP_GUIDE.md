# AI Restaurant Assistant Setup Guide

## Overview

This guide will help you set up the AI-powered restaurant management chatbot using Google's Gemini API (free tier).

## What's Included

### 1. **AI Chatbot**

- Floating widget on dashboard
- Conversational AI for restaurant management advice
- Conversation history and persistence
- Real-time responses using Gemini API

### 2. **Restaurant Automation**

- Revenue Growth Analysis
- Menu Performance Analysis
- Staff Scheduling Recommendations
- Customer Retention Strategies
- Operational Efficiency Reports

### 3. **Automated Features**

- Daily insights generation
- Weekly analysis reports
- Monthly strategy recommendations
- Historical report storage

## Prerequisites

1. **Google Account** (for Gemini API)
2. **Node.js** 18+ (already installed)
3. **API Key** from Google AI Studio

## Step-by-Step Setup

### Step 1: Get Your Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the API key (looks like: `AIza...`)

### Step 2: Configure Environment Variables

1. Open `.env.local` in your project root
2. Add this line:

```env
GEMINI_API_KEY=YOUR_API_KEY_HERE
```

Replace `YOUR_API_KEY_HERE` with the API key from Step 1.

### Step 3: Verify Installation

The required package `@google/generative-ai` should already be installed. To verify:

```bash
npm list @google/generative-ai
```

If not installed, run:

```bash
npm install @google/generative-ai
```

### Step 4: Restart Your Application

```bash
npm run dev
```

### Step 5: Access the Features

#### Option A: Use the Floating Chatbot

1. Go to your restaurant dashboard
2. Look for the ✨ button at the bottom right
3. Click to open the AI assistant
4. Ask questions about your restaurant

#### Option B: Visit the AI Assistant Center

1. Navigate to `/dashboard/ai-assistant`
2. Choose between Automation Hub or Chatbot
3. Run analyses or chat with the AI

## Features Explained

### 🤖 Chatbot Panel

- **Location**: Bottom right of dashboard (always visible)
- **Features**:
  - Conversational interface
  - Conversation history
  - Context-aware responses
  - Persistent storage of conversations
- **Use Cases**:
  - Ask for operational advice
  - Get insights about your data
  - Understand recommendations
  - General business questions

### 🚀 Automation Dashboard

- **Location**: `/dashboard/ai-assistant`
- **Available Analyses**:
  1. **Revenue Growth** - 5 strategies to increase revenue within 30 days
  2. **Menu Analysis** - Optimization for pricing and popularity
  3. **Staff Scheduling** - Optimal staffing based on order patterns
  4. **Customer Retention** - Loyalty and re-engagement strategies

## API Endpoints

### Chat Endpoint

```
POST /api/ai/chat
GET /api/ai/chat
```

- **POST**: Send a message to the chatbot
- **GET**: Retrieve conversation history

### Automation Endpoints

```
POST /api/ai/automation/[automationType]
GET /api/ai/automation/[automationType]
```

- **automationType**: `revenueGrowth`, `menuAnalysis`, `staffScheduling`, `customerRetention`

### Automation Config

```
GET /api/ai/automation-config
POST /api/ai/automation-config
```

- Manage automation schedules and preferences

## Database Collections

The AI system creates and uses these MongoDB collections:

### `ai_conversations`

Stores chatbot conversations

```javascript
{
  restaurantId: ObjectId,
  userId: ObjectId,
  title: String,
  messages: [
    {
      role: "user" | "assistant",
      content: String,
      timestamp: Date
    }
  ],
  createdAt: Date,
  updatedAt: Date
}
```

### `automation_reports`

Stores automation analysis results

```javascript
{
  restaurantId: ObjectId,
  userId: ObjectId,
  type: String, // revenueGrowth, menuAnalysis, etc.
  analysis: String, // AI-generated analysis
  data: Object, // Raw data used for analysis
  createdAt: Date
}
```

### `automation_schedules`

Stores automation preferences

```javascript
{
  restaurantId: ObjectId,
  dailyInsights: { enabled: Boolean, time: String },
  menuOptimization: { enabled: Boolean, frequency: String },
  staffingAnalysis: { enabled: Boolean, frequency: String },
  customerRetention: { enabled: Boolean, frequency: String },
  efficiencyReview: { enabled: Boolean, frequency: String },
  createdAt: Date
}
```

## Troubleshooting

### "API Key not found" Error

- Check that `GEMINI_API_KEY` is set in `.env.local`
- Restart the development server after adding the key
- Verify the key is valid at [Google AI Studio](https://aistudio.google.com/app/apikey)

### Chatbot not responding

- Check browser console for errors
- Verify API key is correctly set
- Check that `/api/ai/chat` endpoint is working
- Try clearing browser cache and localStorage

### Automation analyses not working

- Ensure you have enough order data in the system
- Check that `automationService.js` is properly imported
- Verify MongoDB connection is working
- Check that restaurant data exists in database

### Slow responses

- Gemini API might be rate-limited (free tier has limits)
- Try again in a few moments
- Consider upgrading to a paid Gemini API plan for production

## Usage Examples

### Example 1: Get Revenue Optimization Tips

```
User: "How can I increase my revenue?"
AI: [Provides 5 specific, data-driven strategies based on your order history]
```

### Example 2: Menu Analysis

```
User: "Which items should I focus on?"
AI: [Analyzes your menu items by sales, margins, and popularity]
```

### Example 3: Staff Scheduling

```
User: "What's my busy time?"
AI: [Shows peak hours and suggests optimal staffing levels]
```

## Gemini API Free Tier Limits

- **Requests per minute**: 60
- **Requests per day**: 1,500
- **Concurrent requests**: 100
- **Characters per minute**: 1,000,000

For production use, consider upgrading to a paid plan.

## Best Practices

1. **Regular Analysis**: Run automations weekly for best insights
2. **Implement Recommendations**: Don't just read - act on the advice
3. **Track Results**: Monitor metrics before and after implementing changes
4. **Ask Specific Questions**: The more specific, the better the advice
5. **Use Multiple Tools**: Combine chatbot insights with automation reports

## Next Steps

1. ✅ Set up API key (this guide)
2. 🚀 Start using the chatbot
3. 📊 Run first automation analysis
4. 💡 Implement top recommendations
5. 📈 Track results and iterate

## Support & Resources

- [Google Gemini API Documentation](https://ai.google.dev/)
- [Google AI Studio](https://aistudio.google.com/)
- Project Repository: Check `README.md` for general setup
- Issue Tracker: Report bugs or feature requests

## Future Enhancements

Possible features for future versions:

- Real-time alerts and notifications
- Scheduled automated reports
- Integration with third-party analytics
- Custom AI model training
- Voice-based chatbot interface
- Multi-language support
- Team collaboration features

---

**Last Updated**: April 2026
**API Version**: Gemini Pro
**Status**: ✅ Production Ready

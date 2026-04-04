import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ✅ Try multiple model names until one works
let cachedModel = null;

export const getGeminiModel = () => {
  if (cachedModel) return cachedModel;

  // Try these models in order
  const modelNames = [
    "gemini-1.0-pro",
    "gemini-pro",
    "models/gemini-pro",
    "gemini-1.5-pro-latest",
    "gemini-2.0-flash",
  ];

  for (const modelName of modelNames) {
    try {
      cachedModel = genAI.getGenerativeModel({ model: modelName });
      console.log(`✅ Using model: ${modelName}`);
      return cachedModel;
    } catch (e) {
      console.log(`⚠️  Model ${modelName} not available, trying next...`);
    }
  }

  // Fallback - just return first attempt
  console.warn(
    "⚠️  Using default model, may fail if Generative AI API not enabled",
  );
  cachedModel = genAI.getGenerativeModel({ model: "gemini-pro" });
  return cachedModel;
};

// ✅ Helper function to call Gemini with retry logic (handles 503 errors)
export const callGeminiWithRetry = async (model, prompt, maxRetries = 3) => {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await model.generateContent(prompt);
    } catch (error) {
      lastError = error;

      if (error.status === 503 && attempt < maxRetries) {
        // Service temporarily unavailable, retry with exponential backoff
        const delay = Math.pow(2, attempt - 1) * 1000; // 1s, 2s, 4s
        console.log(
          `⚠️  API (503), retry ${attempt}/${maxRetries} after ${delay}ms...`,
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else if (error.status === 429 && attempt < maxRetries) {
        // Rate limited, retry with longer delay
        const delay = Math.pow(2, attempt) * 1000;
        console.log(
          `⚠️  Rate limited (429), retry ${attempt}/${maxRetries} after ${delay}ms...`,
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        // Other error or last attempt, throw immediately
        throw error;
      }
    }
  }

  throw lastError;
};

// System prompt for restaurant management chatbot
export const RESTAURANT_SYSTEM_PROMPT = `You are an intelligent AI assistant for restaurant management. You have deep knowledge about:
- Restaurant operations and management
- Menu optimization and pricing strategies
- Customer service best practices
- Order fulfillment and logistics
- Staff scheduling and management
- Marketing and customer engagement
- Financial analysis and profitability
- Food safety and compliance
- Inventory management
- Table management and reservations

When responding to restaurant owners and managers:
1. Be professional and concise
2. Provide actionable advice
2. Consider ROI and business impact
4. Suggest automation opportunities
5. Help identify business problems and solutions
6. Provide data-driven recommendations

Context about the restaurant will be provided with each message. Use this to give personalized advice.`;

// Context builder
export const buildRestaurantContext = (restaurant, userData = {}) => {
  return `
Restaurant Details:
- Name: ${restaurant?.name || "Unknown"}
- Cuisine Type: ${restaurant?.cuisineType || "N/A"}
- Status: ${restaurant?.status || "Active"}
- Active Since: ${
    restaurant?.createdAt
      ? new Date(restaurant.createdAt).toLocaleDateString()
      : "N/A"
  }
- Menu Items: ${restaurant?.menuItems?.length || 0} items
- Current Plan: ${restaurant?.plan?.name || "Basic"}

User Context:
- Role: ${userData?.role || "Owner"}
- Experience: ${userData?.experience || "Not specified"}

Today's Data:
- Current Time: ${new Date().toLocaleTimeString()}
- Current Date: ${new Date().toLocaleDateString()}
`;
};

// Automation prompts
export const AUTOMATION_PROMPTS = {
  orderOptimization:
    "Analyze the provided order data and suggest optimizations for faster fulfillment and better customer satisfaction.",

  menuAnalysis:
    "Analyze the menu items and suggest improvements for pricing, popularity, and profitability. Consider customer preferences and seasonal trends.",

  staffScheduling:
    "Based on historical order patterns, suggest optimal staff scheduling to minimize costs while maintaining service quality.",

  customerRetention:
    "Analyze customer data and suggest marketing strategies and loyalty programs to increase repeat customers.",

  inventoryManagement:
    "Based on menu items and sales patterns, suggest inventory optimization strategies to reduce waste and costs.",

  revenueGrowth:
    "Analyze current revenue streams and suggest 5 actionable strategies to increase revenue within 30 days.",

  peakHourManagement:
    "Identify peak hours and suggest operational improvements to handle high-volume periods better.",
};

export default genAI;

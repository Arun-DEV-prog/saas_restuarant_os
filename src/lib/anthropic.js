// ✅ Use Groq API (free tier, unlimited requests)
// Groq is a fast, reliable inference API with free tier
// Get free API key here: https://console.groq.com/

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_BASE_URL = "https://api.groq.com/openai/v1";

// Use llama-3.1-8b-instant (current fast model - Mixtral was deprecated)
// Other options: "llama-3.1-70b-versatile", "gemma-2-9b-it"
const MODEL = "llama-3.1-8b-instant";

export const getClaudeModel = () => {
  return MODEL;
};

// ✅ Helper function to call Groq with retry logic
export const callClaudeWithRetry = async (prompt, maxRetries = 3) => {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`📤 Attempt ${attempt}/${maxRetries}: Calling Groq API...`);

      const response = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 2048,
        }),
      });

      console.log(`📊 Groq response status: ${response.status}`);
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        const responseText = await response.text();

        // Try to parse JSON error, but if empty or not JSON, use default message
        if (responseText) {
          try {
            const errorData = JSON.parse(responseText);
            errorMessage = errorData.error?.message || errorMessage;
          } catch (e) {
            // Not JSON, use response text as error
            errorMessage = responseText.substring(0, 200) || errorMessage;
          }
        }

        const error = new Error(errorMessage);
        error.status = response.status;
        throw error;
      }

      const data = await response.json();

      // Check if response has expected structure
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error(
          `Unexpected response format: ${JSON.stringify(data).substring(0, 200)}`,
        );
      }

      const assistantMessage = data.choices[0].message.content;
      if (!assistantMessage) {
        throw new Error("Empty response from Groq");
      }

      console.log(
        `✅ Groq response received (${assistantMessage.length} chars)`,
      );

      // Transform response to match expected format
      return {
        content: [
          {
            text: assistantMessage,
          },
        ],
      };
    } catch (error) {
      lastError = error;

      // Handle rate limiting and transient errors
      if (
        (error.status === 429 || error.status === 503) &&
        attempt < maxRetries
      ) {
        const delay = Math.pow(2, attempt) * 1000;
        console.log(
          `⚠️  API error (${error.status}), retry ${attempt}/${maxRetries} after ${delay}ms...`,
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        // Log the error for debugging
        console.error(`❌ Groq API Error (Attempt ${attempt}/${maxRetries}):`, {
          status: error.status,
          message: error.message,
          type: error.type || "unknown",
        });
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
3. Consider ROI and business impact
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
export default null;

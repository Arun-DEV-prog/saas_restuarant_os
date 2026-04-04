import { GoogleGenerativeAI } from "@google/generative-ai";

export async function GET(req) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return Response.json(
        {
          error: "❌ GEMINI_API_KEY not set in .env.local",
          fix: "1. Get key: https://aistudio.google.com/app/apikey\n2. Add to .env.local\n3. Restart server",
        },
        { status: 400 },
      );
    }

    console.log("🔍 Diagnosing API key...");

    const genAI = new GoogleGenerativeAI(apiKey);

    const testModels = [
      "gemini-pro",
      "models/gemini-pro",
      "gemini-1.5-pro-latest",
      "gemini-1.5-pro",
      "gemini-1.5-flash",
      "gemini-pro-vision",
    ];

    const results = {
      api_key_present: true,
      tests: {},
    };

    for (const modelName of testModels) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const response = await model.generateContent("Hi");

        results.tests[modelName] = {
          status: "✅ WORKS",
          working: true,
        };

        console.log(`✅ ${modelName} works!`);
        break;
      } catch (error) {
        const msg = error.message || "";
        const is404 = msg.includes("404");
        const is403 = msg.includes("403");
        const is400 = msg.includes("400");

        results.tests[modelName] = {
          status: is404
            ? "❌ Not found"
            : is403
              ? "❌ Permission denied"
              : is400
                ? "❌ Invalid key"
                : "❌ Failed",
          working: false,
        };
      }
    }

    const working = Object.entries(results.tests).find(([_, r]) => r.working);

    if (working) {
      results.recommendation = `✅ Use model: "${working[0]}"`;
      results.next_step = `Update src/lib/gemini.js: model: "${working[0]}"`;
    } else {
      results.error = "❌ No working models found";
      results.troubleshooting = [
        "• API key is invalid or expired",
        "• API key doesn't have required permissions",
        "• Enable Generative AI API in Google Cloud Console",
        "• Get a new key: https://aistudio.google.com/app/apikey",
      ];
    }

    return Response.json(results);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

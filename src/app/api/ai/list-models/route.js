import { GoogleGenerativeAI } from "@google/generative-ai";

export async function GET(req) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return Response.json({ error: "No API key" }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    // Try to list models
    const results = {
      available_models: [],
      working_model: null,
    };

    try {
      const listResponse = await genAI.listModels();
      for await (const model of listResponse) {
        results.available_models.push(model.name);
      }
    } catch (e) {
      console.log("ListModels failed:", e.message);
    }

    // If no models found via listModels, try common names
    if (results.available_models.length === 0) {
      const testModels = [
        "gemini-pro",
        "gemini-1.0-pro",
        "gemini-2.0-flash",
        "gemini-2.0-pro",
      ];

      for (const modelName of testModels) {
        try {
          const model = genAI.getGenerativeModel({ model: modelName });
          const response = await model.generateContent("test");
          results.available_models.push(modelName);
          results.working_model = modelName;
          break;
        } catch (e) {
          // Model doesn't work, continue
        }
      }
    }

    if (results.available_models.length === 0) {
      return Response.json({
        error: "No models found",
        help: "Your API key might not have access to any models",
        suggestion:
          "Create a new API key from https://aistudio.google.com/app/apikey",
      });
    }

    return Response.json({
      available_models: results.available_models,
      working_model: results.working_model,
      recommendation: results.working_model || results.available_models[0],
      next_step: `Update src/lib/gemini.js to use: "${results.working_model || results.available_models[0]}"`,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

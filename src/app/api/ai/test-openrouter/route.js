export async function GET(req) {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    return Response.json({
      error: "❌ OPENROUTER_API_KEY not configured",
      fix: "Add OPENROUTER_API_KEY to .env.local",
    });
  }

  console.log(
    "🔍 Testing OpenRouter API with key starting with:",
    apiKey.substring(0, 20) + "...",
  );

  try {
    // Test with a simple request
    const response = await fetch(
      "https://openrouter.io/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          "HTTP-Referer": process.env.FRONTEND_URL || "http://localhost:3000",
          "X-Title": "Restaurant AI Assistant",
        },
        body: JSON.stringify({
          model: "anthropic/claude-3-haiku",
          messages: [{ role: "user", content: "Say 'Hello'" }],
          max_tokens: 50,
        }),
      },
    );

    console.log("📊 Response status:", response.status);
    console.log("📋 Response headers:", {
      contentType: response.headers.get("content-type"),
      contentLength: response.headers.get("content-length"),
    });

    const responseText = await response.text();
    console.log(
      "📝 Response body (first 500 chars):",
      responseText.substring(0, 500),
    );

    if (!response.ok) {
      return Response.json({
        error: "❌ OpenRouter API Error",
        status: response.status,
        statusText: response.statusText,
        responseBody: responseText.substring(0, 500),
        possibleCauses: [
          "Invalid API key",
          "API key expired or revoked",
          "No credits available",
          "Model not available",
          "Rate limited",
        ],
        fix: "Check https://openrouter.io/account/billing for credits and https://openrouter.io/account/keys for valid key",
      });
    }

    // Try to parse response
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      return Response.json({
        error: "❌ Invalid JSON response from OpenRouter",
        rawResponse: responseText.substring(0, 200),
      });
    }

    const message = data.choices?.[0]?.message?.content;

    return Response.json({
      status: "✅ OpenRouter API works!",
      model: "anthropic/claude-3-haiku",
      response: message,
      credits_available: true,
      fullResponse: data,
    });
  } catch (error) {
    return Response.json({
      error: `❌ Error: ${error.message}`,
      stack: error.stack?.substring(0, 300),
    });
  }
}

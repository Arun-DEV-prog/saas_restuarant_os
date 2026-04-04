export async function GET(req) {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return Response.json({
      error: "❌ GROQ_API_KEY not set",
      fix: "1. Go to https://console.groq.com\n2. Sign up (free, no payment needed)\n3. Get your API key\n4. Add to .env.local: GROQ_API_KEY=gsk_...\n5. Restart server",
    });
  }

  const checks = {
    key_present: !!apiKey,
    key_starts_with_gsk: apiKey.startsWith("gsk_"),
    key_length: apiKey.length,
    key_preview: apiKey.substring(0, 10) + "...",
  };

  if (!checks.key_starts_with_gsk) {
    return Response.json({
      ...checks,
      error: "❌ API key format invalid",
      fix: "Get new key from https://console.groq.com",
      details: "Key should start with 'gsk_'",
    });
  }

  try {
    // Test the Groq API
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [{ role: "user", content: "Hi" }],
          max_tokens: 10,
        }),
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      const msg = errorData.error?.message || "";

      if (response.status === 401) {
        return Response.json({
          ...checks,
          error: "❌ Authentication failed (401)",
          possible_causes: ["API key is invalid", "API key was revoked"],
          fix: "Get new key from https://console.groq.com",
        });
      }

      if (response.status === 429) {
        return Response.json({
          ...checks,
          error: "⚠️  Rate limited (429)",
          fix: "Groq free tier has rate limits. Wait and try again.",
        });
      }

      throw new Error(`HTTP ${response.status}: ${msg}`);
    }

    return Response.json({
      ...checks,
      status: "✅ API key works!",
      model: "llama-3.1-8b-instant",
      unlimited: true,
    });
  } catch (error) {
    return Response.json({
      ...checks,
      error: `❌ Error: ${error.message}`,
      details: error.toString(),
    });
  }
}

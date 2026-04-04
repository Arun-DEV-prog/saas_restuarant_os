export async function GET(req) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return Response.json({ error: "No API key set" }, { status: 400 });
  }

  // Validate API key format
  const isValid = apiKey.startsWith("AIza") && apiKey.length > 30;

  return Response.json({
    api_key_present: !!apiKey,
    api_key_format_valid: isValid,
    key_preview: apiKey?.substring(0, 20) + "...",
    next_step: isValid
      ? "Key format is valid. Try the chatbot again. If still failing, the key may be revoked/disabled."
      : "❌ Key format is invalid. Get a new one from https://aistudio.google.com/app/apikey",
    instructions: [
      "1. Go to: https://aistudio.google.com/app/apikey",
      "2. Click 'Create API Key' (or delete old one first)",
      "3. Copy the new key (AIza...)",
      "4. Update .env.local: GEMINI_API_KEY=YOUR_NEW_KEY",
      "5. Restart server: npm run dev",
      "6. Try chatbot again",
    ],
  });
}

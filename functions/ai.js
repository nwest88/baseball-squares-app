const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { logger } = require("firebase-functions"); // <--- IMPORT THIS
const { GoogleGenerativeAI } = require("@google/generative-ai");

const apiKey = process.env.GEMINI_API_KEY;

exports.parseGridImage = onCall({ secrets: ["GEMINI_API_KEY"] }, async (request) => {
  // 1. Authenticate
  if (!request.auth) {
    logger.warn("Unauthorized access attempt");
    throw new HttpsError("unauthenticated", "User must be logged in.");
  }

  // 2. DEBUG: Check API Key Status
  if (!apiKey) {
    logger.error("CRITICAL: GEMINI_API_KEY is missing/undefined.");
    throw new HttpsError("internal", "Server configuration error: Missing API Key.");
  } else {
    logger.info(`API Key loaded. Length: ${apiKey.length}`);
  }

  const { imageBase64 } = request.data;
  if (!imageBase64) {
    logger.error("No image data received.");
    throw new HttpsError("invalid-argument", "Image data missing.");
  }

  // 3. Initialize AI
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
    Analyze this image of a sports pool or list.
    Extract names and the number of squares/entries they have.
    Return ONLY a JSON array with this format:
    [{"name": "John Doe", "count": 2}, {"name": "Jane Smith", "count": 1}]
    If illegible, return []. Do not include markdown.
  `;

  try {
    logger.info("Sending request to Gemini...");
    const result = await model.generateContent([
      prompt,
      { inlineData: { data: imageBase64, mimeType: "image/jpeg" } }
    ]);

    const responseText = result.response.text();
    logger.info("Gemini Raw Response:", responseText);

    const cleanJson = responseText.replace(/```json|```/g, "").trim();
    return JSON.parse(cleanJson);

  } catch (error) {
    // This logs the ACTUAL error from Google to your Firebase Console
    logger.error("AI Processing Failed:", error); 
    throw new HttpsError("internal", `Failed to process image: ${error.message}`);
  }
});
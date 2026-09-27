import axios from "axios";

const analyzeTask = async (query) => {
  try {
    const baseUrl = process.env.AIML_URL;
    const endpoint =
      process.env.AIML_ANALYZE_ENDPOINT || "/analyze";

    if (!baseUrl) {
      throw new Error("AIML_URL is not configured");
    }

    const response = await axios.post(
      `${baseUrl}${endpoint}`,
      {
        query,
      },
      {
        timeout: 15000,
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "AI service error:",
      error.response?.data || error.message
    );

    throw new Error("AI service is unavailable");
  }
};

export default analyzeTask;
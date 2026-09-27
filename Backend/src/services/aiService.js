import axios from "axios";

// ------------------------------------
// Call Python AI/ML service
// ------------------------------------
const analyzeTask = async (query) => {
  const baseUrl = process.env.AIML_URL;
  const endpoint =
    process.env.AIML_ANALYZE_ENDPOINT ||
    "/analyze";

  const timeout = Number(
    process.env.AIML_TIMEOUT || 15000
  );

  if (!baseUrl) {
    throw new Error(
      "AIML_URL is not configured"
    );
  }

  const url = `${baseUrl}${endpoint}`;

  try {
    const response = await axios.post(
      url,
      {
        query,
      },
      {
        timeout,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    // Python service responded with an error
    if (error.response) {
      console.error(
        "AI service response error:",
        error.response.status,
        error.response.data
      );

      throw new Error(
        `AI service returned status ${error.response.status}`
      );
    }

    // Request timed out
    if (error.code === "ECONNABORTED") {
      console.error(
        "AI service request timed out"
      );

      throw new Error(
        "AI service request timed out"
      );
    }

    // Python server is not running
    if (
      error.code === "ECONNREFUSED" ||
      error.code === "ENOTFOUND"
    ) {
      console.error(
        "AI service is unreachable:",
        error.message
      );

      throw new Error(
        "AI service is unavailable"
      );
    }

    console.error(
      "AI service error:",
      error.message
    );

    throw new Error(
      "AI service request failed"
    );
  }
};

export default analyzeTask;
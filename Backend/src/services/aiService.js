import axios from "axios";


// ============================================================
// CONFIG
// ============================================================

const getBaseUrl = () => {
  const value =
    process.env.AIML_URL ||
    "http://localhost:8000";

  return value.replace(
    /\/+$/,
    "",
  );
};


const getAnalyzeEndpoint = () => {
  const endpoint =
    process.env.AIML_ANALYZE_ENDPOINT ||
    "/ai/analyze";

  return endpoint.startsWith("/")
    ? endpoint
    : `/${endpoint}`;
};


const getTimeout = () => {
  const value = Number(
    process.env.AIML_TIMEOUT ||
      90000,
  );

  if (
    !Number.isFinite(value) ||
    value <= 0
  ) {
    return 90000;
  }

  return value;
};


// ============================================================
// GEMINI / AIML ANALYSIS
// ============================================================

const analyzeTask = async (
  query,
) => {

  if (
    !query ||
    typeof query !== "string" ||
    !query.trim()
  ) {
    throw new Error(
      "Query is required",
    );
  }

  const url =
    `${getBaseUrl()}${getAnalyzeEndpoint()}`;

  try {

    const response =
      await axios.post(
        url,
        {
          query: query.trim(),
        },
        {
          timeout:
            getTimeout(),

          headers: {
            "Content-Type":
              "application/json",

            Accept:
              "application/json",
          },
        },
      );

    return response.data;

  } catch (error) {

    if (error.response) {

      console.error(
        "AI service response error:",
        error.response.status,
        error.response.data,
      );

      const detail =
        error.response.data?.detail ||
        error.response.data?.message ||
        "";

      throw new Error(
        detail
          ? `AI service returned status ${error.response.status}: ${detail}`
          : `AI service returned status ${error.response.status}`,
      );
    }

    if (
      error.code ===
      "ECONNABORTED"
    ) {

      console.error(
        "AI service request timed out:",
        error.message,
      );

      throw new Error(
        "AI service request timed out",
      );
    }

    if (
      error.code ===
        "ECONNREFUSED" ||
      error.code ===
        "ENOTFOUND"
    ) {

      console.error(
        "AI service is unreachable:",
        error.message,
      );

      throw new Error(
        "AI service is unavailable",
      );
    }

    console.error(
      "AI service error:",
      error.message,
    );

    throw new Error(
      "AI service request failed",
    );
  }
};


export default analyzeTask;
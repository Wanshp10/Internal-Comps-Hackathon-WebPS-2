import axios from "axios";

const analyzeTask = async (query) => {
  try {
    const response = await axios.post(
      `${process.env.AIML_URL}/analyze`,
      {
        query,
      },
      {
        timeout: 10000,
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
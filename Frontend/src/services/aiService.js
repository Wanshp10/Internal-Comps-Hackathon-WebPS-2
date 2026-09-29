import { analyzeTask } from "./api.js";

const REQUEST_TIMEOUT = 90000;

export async function askAssistant(query) {
  const cleanQuery =
    String(query || "").trim();

  if (!cleanQuery) {
    throw new Error(
      "Please describe what you need help with.",
    );
  }

  const controller =
    new AbortController();

  const timeoutId = setTimeout(() => {
    controller.abort();
  }, REQUEST_TIMEOUT);

  try {
    const result = await analyzeTask(
      cleanQuery,
      {
        signal: controller.signal,
      },
    );

    if (!result) {
      throw new Error(
        "The backend returned an empty response.",
      );
    }

    return result;
  } catch (error) {
    if (
      error?.name === "AbortError"
    ) {
      const timeoutError =
        new Error(
          "The request took too long. Please try again.",
        );

      timeoutError.status = 504;

      throw timeoutError;
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

export default {
  askAssistant,
};
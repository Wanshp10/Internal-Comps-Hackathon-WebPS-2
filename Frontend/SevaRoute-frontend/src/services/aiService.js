import { apiRequest } from "./api.js";

// Replace /ai/assistant with the endpoint exposed by your AI backend.
export async function askAssistant(message) {
  return apiRequest("/ai/assistant", {
    method: "POST",
    body: JSON.stringify({ message })
  });
}
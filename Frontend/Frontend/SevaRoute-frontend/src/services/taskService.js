import { initialTasks } from "../data/tasks.js";
import { apiRequest } from "./api.js";

// UI works with local demo data until a backend endpoint is configured.
export async function getTasks() {
  try { return await apiRequest("/tasks"); }
  catch { return initialTasks; }
}
export async function getTaskById(id) {
  const tasks = await getTasks();
  return tasks.find(task => task.id === id) || null;
}
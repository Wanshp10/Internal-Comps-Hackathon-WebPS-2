import { initialTasks } from "../data/tasks.js";

export async function getTasks() {
  return Array.isArray(initialTasks)
    ? [...initialTasks]
    : [];
}

export async function getTaskById(id) {
  const tasks = await getTasks();

  return (
    tasks.find(
      (task) => task.id === id,
    ) || null
  );
}

export default {
  getTasks,
  getTaskById,
};
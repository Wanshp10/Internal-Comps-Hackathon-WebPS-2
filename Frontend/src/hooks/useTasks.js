import { useEffect, useState } from "react";
import { initialTasks } from "../data/tasks.js";

export function useTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);

    try {
      const safeTasks = Array.isArray(
        initialTasks,
      )
        ? initialTasks
        : [];

      setTasks(safeTasks);
      setError("");
    } catch (requestError) {
      console.error(
        "Failed to load tasks:",
        requestError,
      );

      setTasks([]);
      setError(
        "Unable to load service catalogue.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    tasks: Array.isArray(tasks)
      ? tasks
      : [],
    loading,
    error,
  };
}

export default useTasks;
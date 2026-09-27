import { useEffect, useState } from "react";
import { getTasks } from "../services/taskService.js";

export function useTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let alive = true;
    getTasks().then(data => { if (alive) setTasks(data); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);
  return { tasks, loading, setTasks };
}
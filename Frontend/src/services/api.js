const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000/api/v1";

const normalizePath = (path) => {
  return String(path || "")
    .trim()
    .replace(/^\/+/, "");
};

const buildUrl = (path) => {
  return `${API_BASE_URL}/${normalizePath(path)}`;
};

const sleep = (ms) =>
  new Promise((resolve) =>
    setTimeout(resolve, ms),
  );

const parseResponse = async (response) => {
  const contentType =
    response.headers.get("content-type") || "";

  if (
    contentType.includes("application/json")
  ) {
    return response.json();
  }

  const text = await response.text();

  return text
    ? { message: text }
    : null;
};

const createApiError = (
  response,
  data,
) => {
  const error = new Error(
    data?.message ||
      data?.detail ||
      `API request failed (${response.status})`,
  );

  error.status = response.status;
  error.data = data;

  return error;
};

export const apiRequest = async (
  path,
  options = {},
) => {
  const {
    method = "GET",
    body,
    headers = {},
    retries = 0,
    retryDelay = 1200,
    ...rest
  } = options;

  const cleanPath = normalizePath(path);

  /*
   * Compatibility guard.
   *
   * The backend intentionally has no:
   * GET /api/v1/tasks
   *
   * Some older frontend code may still request it.
   * Do not send that invalid request to the backend.
   */
  if (
    method.toUpperCase() === "GET" &&
    cleanPath === "tasks"
  ) {
    return {
      success: true,
      data: [],
      message:
        "Task collection endpoint is not used.",
    };
  }

  let lastError = null;

  for (
    let attempt = 0;
    attempt <= retries;
    attempt += 1
  ) {
    try {
      const response = await fetch(
        buildUrl(cleanPath),
        {
          method,

          headers: {
            Accept: "application/json",

            ...(body !== undefined
              ? {
                  "Content-Type":
                    "application/json",
                }
              : {}),

            ...headers,
          },

          ...(body !== undefined
            ? {
                body:
                  typeof body === "string"
                    ? body
                    : JSON.stringify(body),
              }
            : {}),

          ...rest,
        },
      );

      const data =
        await parseResponse(response);

      if (response.ok) {
        return data;
      }

      const error =
        createApiError(
          response,
          data,
        );

      lastError = error;

      /*
       * Retry temporary server failures.
       * Do not retry client errors such as 400/404.
       */
      if (
        attempt < retries &&
        response.status >= 500
      ) {
        await sleep(
          retryDelay *
            (attempt + 1),
        );

        continue;
      }

      throw error;
    } catch (error) {
      lastError = error;

      /*
       * Browser/network failures can also be
       * temporary. Retry only when configured.
       */
      if (
        attempt < retries &&
        (
          !error?.status ||
          error.status >= 500
        )
      ) {
        await sleep(
          retryDelay *
            (attempt + 1),
        );

        continue;
      }

      throw error;
    }
  }

  throw (
    lastError ||
    new Error(
      "API request failed.",
    )
  );
};


// ============================================================
// TASK ANALYSIS
// ============================================================

export const analyzeTask = async (
  query,
  options = {},
) => {
  const cleanQuery =
    String(query || "").trim();

  if (!cleanQuery) {
    throw new Error(
      "Query cannot be empty.",
    );
  }

  return apiRequest(
    "tasks/analyze",
    {
      method: "POST",

      body: {
        query: cleanQuery,
      },

      retries: 2,
      retryDelay: 1500,

      ...options,
    },
  );
};


// ============================================================
// TASK BY ID
// ============================================================

export const getTask = async (
  taskId,
  options = {},
) => {
  if (!taskId) {
    throw new Error(
      "Task ID is required.",
    );
  }

  return apiRequest(
    `tasks/${encodeURIComponent(
      taskId,
    )}`,
    {
      method: "GET",
      ...options,
    },
  );
};


// ============================================================
// PROCEDURE
// ============================================================

export const getProcedureByTask =
  async (
    taskId,
    options = {},
  ) => {
    if (!taskId) {
      throw new Error(
        "Task ID is required.",
      );
    }

    return apiRequest(
      `procedures/task/${encodeURIComponent(
        taskId,
      )}`,
      {
        method: "GET",
        ...options,
      },
    );
  };

export const getProcedure = async (
  procedureId,
  options = {},
) => {
  if (!procedureId) {
    throw new Error(
      "Procedure ID is required.",
    );
  }

  return apiRequest(
    `procedures/${encodeURIComponent(
      procedureId,
    )}`,
    {
      method: "GET",
      ...options,
    },
  );
};


// ============================================================
// ROADMAP
// ============================================================

export const getRoadmap = async (
  roadmapId,
  options = {},
) => {
  if (!roadmapId) {
    throw new Error(
      "Roadmap ID is required.",
    );
  }

  return apiRequest(
    `roadmaps/${encodeURIComponent(
      roadmapId,
    )}`,
    {
      method: "GET",
      ...options,
    },
  );
};

export const getRoadmapGraph =
  async (
    roadmapId,
    options = {},
  ) => {
    if (!roadmapId) {
      throw new Error(
        "Roadmap ID is required.",
      );
    }

    return apiRequest(
      `roadmaps/${encodeURIComponent(
        roadmapId,
      )}/graph`,
      {
        method: "GET",
        ...options,
      },
    );
  };

export const getRoadmapProgress =
  async (
    roadmapId,
    options = {},
  ) => {
    if (!roadmapId) {
      throw new Error(
        "Roadmap ID is required.",
      );
    }

    return apiRequest(
      `roadmaps/${encodeURIComponent(
        roadmapId,
      )}/progress`,
      {
        method: "GET",
        ...options,
      },
    );
  };


// ============================================================
// STEP PROGRESS
// ============================================================

export const updateStepProgress =
  async (
    roadmapId,
    stepId,
    status,
    options = {},
  ) => {
    if (!roadmapId) {
      throw new Error(
        "Roadmap ID is required.",
      );
    }

    if (!stepId) {
      throw new Error(
        "Step ID is required.",
      );
    }

    if (!status) {
      throw new Error(
        "Step status is required.",
      );
    }

    return apiRequest(
      `roadmaps/${encodeURIComponent(
        roadmapId,
      )}/steps/${encodeURIComponent(
        stepId,
      )}/progress`,
      {
        method: "PATCH",

        body: {
          status,
        },

        ...options,
      },
    );
  };


// ============================================================
// BLOCKER
// ============================================================

export const getStepBlocker =
  async (
    roadmapId,
    stepId,
    options = {},
  ) => {
    if (!roadmapId) {
      throw new Error(
        "Roadmap ID is required.",
      );
    }

    if (!stepId) {
      throw new Error(
        "Step ID is required.",
      );
    }

    return apiRequest(
      `roadmaps/${encodeURIComponent(
        roadmapId,
      )}/steps/${encodeURIComponent(
        stepId,
      )}/blocker`,
      {
        method: "GET",
        ...options,
      },
    );
  };


// ============================================================
// HEALTH
// ============================================================

export const getHealth = async (
  options = {},
) => {
  return apiRequest(
    "health",
    {
      method: "GET",
      ...options,
    },
  );
};


// ============================================================
// DEFAULT EXPORT
// ============================================================

const api = {
  request: apiRequest,

  analyzeTask,

  getTask,

  getProcedureByTask,
  getProcedure,

  getRoadmap,
  getRoadmapGraph,
  getRoadmapProgress,

  updateStepProgress,
  getStepBlocker,

  getHealth,
};

export default api;
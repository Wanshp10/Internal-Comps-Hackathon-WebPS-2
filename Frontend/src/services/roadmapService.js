import {
  getRoadmap as getRoadmapApi,
  getRoadmapGraph as getRoadmapGraphApi,
  getRoadmapProgress as getRoadmapProgressApi,
  updateStepProgress as updateStepProgressApi,
  getStepBlocker as getStepBlockerApi,
} from "./api.js";


// ============================================================
// GET ROADMAP
// ============================================================

export async function getRoadmap(
  roadmapId,
) {
  if (!roadmapId) {
    throw new Error(
      "Roadmap ID is required.",
    );
  }

  const response =
    await getRoadmapApi(
      roadmapId,
    );

  if (!response?.success) {
    throw new Error(
      response?.message ||
        "Failed to fetch roadmap.",
    );
  }

  return response.data;
}


// ============================================================
// GET ROADMAP GRAPH
// ============================================================

export async function getRoadmapGraph(
  roadmapId,
) {
  if (!roadmapId) {
    throw new Error(
      "Roadmap ID is required.",
    );
  }

  const response =
    await getRoadmapGraphApi(
      roadmapId,
    );

  if (!response?.success) {
    throw new Error(
      response?.message ||
        "Failed to fetch roadmap graph.",
    );
  }

  return response.data;
}


// ============================================================
// GET ROADMAP PROGRESS
// ============================================================

export async function getRoadmapProgress(
  roadmapId,
) {
  if (!roadmapId) {
    throw new Error(
      "Roadmap ID is required.",
    );
  }

  const response =
    await getRoadmapProgressApi(
      roadmapId,
    );

  if (!response?.success) {
    throw new Error(
      response?.message ||
        "Failed to fetch roadmap progress.",
    );
  }

  return response.data;
}


// ============================================================
// UPDATE STEP PROGRESS
// ============================================================

export async function updateStepProgress({
  roadmapId,
  stepId,
  status,
}) {
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

  const response =
    await updateStepProgressApi(
      roadmapId,
      stepId,
      status,
    );

  if (!response?.success) {
    throw new Error(
      response?.message ||
        "Failed to update step progress.",
    );
  }

  return response.data;
}


// ============================================================
// GET BLOCKER
// ============================================================

export async function getStepBlocker({
  roadmapId,
  stepId,
}) {
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

  const response =
    await getStepBlockerApi(
      roadmapId,
      stepId,
    );

  if (!response?.success) {
    throw new Error(
      response?.message ||
        "Failed to fetch blocker explanation.",
    );
  }

  return response.data;
}
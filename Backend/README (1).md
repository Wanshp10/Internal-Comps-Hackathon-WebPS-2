# PSWB02 Backend API

Backend for **PSWB02 – Municipal Bureaucracy Path Visualizer**.

The backend is responsible for:

- Receiving the user's civic-service query
- Connecting to the AI/ML service
- Storing task analysis
- Resolving/storing civic procedure data
- Generating a roadmap
- Generating dependency graph data
- Tracking step progress
- Explaining blocked steps
- Managing government sources and review status

This README is primarily for the **Frontend and Graph teams** so they can integrate against a stable API contract.

---

## Base URL

Local backend:

```text
http://localhost:5000
```

API prefix:

```text
/api/v1
```

Example:

```text
http://localhost:5000/api/v1/tasks/analyze
```

---

# Main Application Flow

```text
User enters civic query
        ↓
React Frontend
        ↓
POST /api/v1/tasks/analyze
        ↓
Node / Express Backend
        ↓
AI / ML Service
        ↓
Task + Civic Procedure
        ↓
Roadmap generation
        ↓
Dependency Graph
        ↓
Frontend renders roadmap
        ↓
User updates step progress
```

The backend is designed around the structured civic-task contract used by the project. The returned data is dynamic; the frontend must not hardcode civic procedures, task IDs, step counts, or dependencies.

---

# Primary Frontend APIs

For the normal user flow, these are the important endpoints:

| Purpose | Method | Endpoint |
|---|---|---|
| Analyze user query | `POST` | `/api/v1/tasks/analyze` |
| Get roadmap | `GET` | `/api/v1/roadmaps/:id` |
| Get graph | `GET` | `/api/v1/roadmaps/:id/graph` |
| Get progress | `GET` | `/api/v1/roadmaps/:roadmapId/progress` |
| Update step progress | `PATCH` | `/api/v1/roadmaps/:roadmapId/steps/:stepId/progress` |
| Explain blocked step | `GET` | `/api/v1/roadmaps/:roadmapId/steps/:stepId/blocker` |

Everything else is mainly for supporting/admin functionality.

---

# 1. Health Check

## GET

```text
/api/v1/health
```

Example:

```text
GET http://localhost:5000/api/v1/health
```

Response:

```json
{
  "success": true,
  "message": "Backend is running"
}
```

---

# 2. Analyze User Task

## POST

```text
/api/v1/tasks/analyze
```

This is the **main frontend endpoint**.

The frontend sends the user's natural-language civic request here.

## Request

```json
{
  "query": "I want to open a cafe in Pune"
}
```

## Successful response

```json
{
  "success": true,
  "message": "Task analyzed and roadmap generated successfully",
  "data": {
    "taskId": "...",
    "procedureId": "...",
    "roadmapId": "...",
    "aiResponseType": "TASK_ANALYSIS",
    "analysis": {},
    "task": {},
    "procedure": {},
    "roadmap": {}
  }
}
```

### Important

The contents of these fields are dynamic:

```text
analysis
procedure
roadmap
```

Do **not** hardcode task names, task IDs, procedures, or step data in React.

The AI/ML service may return task-understanding data or a complete civic-procedure structure conforming to the project's contract. The backend handles the response and then generates the roadmap.

---

# 3. Task Data

## GET Task

```text
/api/v1/tasks/:id
```

Example:

```text
GET /api/v1/tasks/64xxxxxxxxxxxxxxxxxxxxxx
```

Response shape:

```json
{
  "success": true,
  "data": {
    "_id": "...",
    "query": "I want to open a cafe in Pune",
    "normalizedQuery": "I want to open a cafe in Pune",
    "intent": "...",
    "route": "...",
    "location": "Pune",
    "locationScope": "MAHARASHTRA",
    "entities": {},
    "confidence": 0.8,
    "intentSource": "AI",
    "analysisStatus": "OK",
    "missingFields": [],
    "roadmapId": "..."
  }
}
```

---

# 4. Civic Procedure

There are two ways to retrieve a procedure.

## By task ID

```text
GET /api/v1/procedures/task/:taskId
```

Example:

```text
GET /api/v1/procedures/task/OPEN_FOOD_BUSINESS
```

The frontend should normally use the task/procedure IDs returned by the backend rather than inventing them.

## By MongoDB procedure ID

```text
GET /api/v1/procedures/:id
```

Example:

```text
GET /api/v1/procedures/64xxxxxxxxxxxxxxxxxxxxxx
```

---

# 5. Roadmap

## Get roadmap

```text
GET /api/v1/roadmaps/:id
```

Response:

```json
{
  "success": true,
  "data": {
    "_id": "...",
    "taskId": "...",
    "procedureId": "...",
    "title": "...",
    "location": "Pune",
    "steps": [],
    "dependencies": []
  }
}
```

## Generate roadmap explicitly

```text
POST /api/v1/roadmaps
```

Request:

```json
{
  "procedureId": "...",
  "taskId": "...",
  "location": "Pune"
}
```

Normally the frontend does **not** need this endpoint because `/tasks/analyze` already generates the roadmap.

## Generate roadmap from an existing task

```text
POST /api/v1/roadmaps/from-task/:taskId
```

Use this only when a roadmap needs to be generated separately from an existing task.

---

# 6. Graph API

## GET

```text
/api/v1/roadmaps/:id/graph
```

This is the main endpoint for the **Graph / React Flow UI**.

Example:

```text
GET /api/v1/roadmaps/64xxxxxxxxxxxxxxxxxxxxxx/graph
```

Response:

```json
{
  "success": true,
  "data": {
    "roadmapId": "...",
    "title": "...",
    "location": "Pune",
    "nodes": [],
    "edges": []
  }
}
```

---

## Graph Node Structure

A graph node contains the civic-step data needed by the UI:

```json
{
  "id": "STEP_1",
  "type": "civicStep",
  "data": {
    "title": "Step title",
    "description": "Step description",
    "status": "NOT_STARTED",
    "department": "Department",
    "office": "Office",
    "required_forms": [],
    "required_documents": [],
    "fee": {
      "amount": null,
      "currency": "INR",
      "payment_method": []
    },
    "application": {
      "mode": [],
      "application_link": null
    },
    "eligibility": [],
    "prerequisites": [],
    "depends_on": [],
    "unlocks": [],
    "can_run_in_parallel": false,
    "time_limit_days": null,
    "official_sources": []
  },
  "position": {
    "x": 0,
    "y": 0
  }
}
```

### Node status values

```text
NOT_STARTED
IN_PROGRESS
COMPLETED
LOCKED
```

The frontend should render the visual state from `node.data.status`.

---

## Graph Edge Structure

Each dependency becomes an edge:

```json
{
  "id": "STEP_1-STEP_2",
  "source": "STEP_1",
  "target": "STEP_2",
  "type": "smoothstep",
  "animated": false
}
```

Meaning:

```text
STEP_1 → STEP_2
```

`STEP_2` depends on `STEP_1`.

Do not hardcode dependency relationships in the frontend. Use the returned `edges`.

---

# 7. Step Details

The graph node's `data` contains the information needed to build a details panel, drawer, or modal.

Important fields include:

```text
id
status
title
description
department
office
required_forms
required_documents
fee
application
eligibility
prerequisites
depends_on
unlocks
can_run_in_parallel
time_limit_days
official_sources
```

Example usage:

```javascript
const step = node.data;

console.log(step.title);
console.log(step.required_documents);
console.log(step.fee);
console.log(step.official_sources);
```

---

# 8. Progress Summary

## GET

```text
/api/v1/roadmaps/:roadmapId/progress
```

Example:

```text
GET /api/v1/roadmaps/64xxxxxxxxxxxxxxxxxxxxxx/progress
```

Response:

```json
{
  "success": true,
  "data": {
    "roadmapId": "...",
    "title": "...",
    "totalSteps": 5,
    "completed": 2,
    "inProgress": 1,
    "notStarted": 1,
    "locked": 1,
    "completionPercentage": 40
  }
}
```

Use this for:

- Overall progress bar
- Completed-step count
- In-progress count
- Locked-step count
- Completion percentage

---

# 9. Update Step Progress

## PATCH

```text
/api/v1/roadmaps/:roadmapId/steps/:stepId/progress
```

Example:

```text
PATCH /api/v1/roadmaps/64xxxxxxxxxxxxxxxxxxxxxx/steps/STEP_1/progress
```

Request:

```json
{
  "status": "COMPLETED"
}
```

Allowed user statuses:

```text
NOT_STARTED
IN_PROGRESS
COMPLETED
```

`LOCKED` is controlled by the backend dependency engine.

---

# Dependency Behaviour

For a dependency chain:

```text
STEP_1 → STEP_2 → STEP_3
```

Initially:

```text
STEP_1 = NOT_STARTED
STEP_2 = LOCKED
STEP_3 = LOCKED
```

After the user completes `STEP_1`:

```text
STEP_1 = COMPLETED
STEP_2 = NOT_STARTED
STEP_3 = LOCKED
```

The backend recalculates dependency states automatically.

After updating progress, the frontend should refresh the graph and progress summary.

---

# 10. Blocker Explanation

## GET

```text
/api/v1/roadmaps/:roadmapId/steps/:stepId/blocker
```

Example:

```text
GET /api/v1/roadmaps/64xxxxxxxxxxxxxxxxxxxxxx/steps/STEP_2/blocker
```

Response:

```json
{
  "success": true,
  "data": {
    "step_id": "STEP_2",
    "title": "Step 2",
    "status": "LOCKED",
    "is_locked": true,
    "blockers": [
      {
        "step_id": "STEP_1",
        "title": "Step 1",
        "status": "NOT_STARTED",
        "completed": false
      }
    ],
    "message": "Complete 1 prerequisite step(s) before starting this step."
  }
}
```

Use this when the user clicks a locked step and wants to know why it is blocked.

---

# 11. Sources

Source endpoints:

```text
GET    /api/v1/sources
GET    /api/v1/sources/:id
POST   /api/v1/sources
PATCH  /api/v1/sources/:id
PATCH  /api/v1/sources/:id/verify
PATCH  /api/v1/sources/:id/flag
DELETE /api/v1/sources/:id
```

These are mainly for source/admin functionality.

A source can contain:

```text
source_title
source_url
authority
source_type
last_verified
verified
needs_review
```

---

# 12. Admin Procedure APIs

```text
GET    /api/v1/admin/procedures
GET    /api/v1/admin/procedures/review
GET    /api/v1/admin/procedures/:id
PATCH  /api/v1/admin/procedures/:id
PATCH  /api/v1/admin/procedures/:id/flag
PATCH  /api/v1/admin/procedures/:id/review
DELETE /api/v1/admin/procedures/:id
```

These are for procedure review and maintenance.

Authentication is not currently implemented in this MVP backend.

---

# Recommended React Flow

The standard user flow should be:

## Step 1 — User enters query

```text
I want to open a cafe in Pune
```

## Step 2 — Call analyze

```javascript
const response = await fetch(
  "http://localhost:5000/api/v1/tasks/analyze",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      query: userQuery
    })
  }
);

const result = await response.json();
```

## Step 3 — Save IDs

```javascript
const {
  taskId,
  procedureId,
  roadmapId
} = result.data;
```

The important ID for the roadmap screen is:

```text
roadmapId
```

## Step 4 — Load graph

```javascript
const graphResponse = await fetch(
  `http://localhost:5000/api/v1/roadmaps/${roadmapId}/graph`
);

const graphResult = await graphResponse.json();
```

Use:

```javascript
graphResult.data.nodes
graphResult.data.edges
```

for the graph component.

## Step 5 — Show step details

Use the selected node's:

```javascript
node.data
```

for the details drawer/modal.

## Step 6 — Update progress

```javascript
await fetch(
  `http://localhost:5000/api/v1/roadmaps/${roadmapId}/steps/${stepId}/progress`,
  {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      status: "COMPLETED"
    })
  }
);
```

## Step 7 — Refresh

After changing progress, refresh:

```text
GET /api/v1/roadmaps/:id/graph
GET /api/v1/roadmaps/:id/progress
```

because the backend may unlock dependent steps.

---

# Minimal Frontend API Service

A simple API wrapper can look like this:

```javascript
const API_BASE_URL = "http://localhost:5000/api/v1";

export const analyzeTask = async (query) => {
  const response = await fetch(
    `${API_BASE_URL}/tasks/analyze`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ query })
    }
  );

  return response.json();
};

export const getRoadmapGraph = async (roadmapId) => {
  const response = await fetch(
    `${API_BASE_URL}/roadmaps/${roadmapId}/graph`
  );

  return response.json();
};

export const getProgress = async (roadmapId) => {
  const response = await fetch(
    `${API_BASE_URL}/roadmaps/${roadmapId}/progress`
  );

  return response.json();
};

export const updateStepProgress = async (
  roadmapId,
  stepId,
  status
) => {
  const response = await fetch(
    `${API_BASE_URL}/roadmaps/${roadmapId}/steps/${stepId}/progress`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ status })
    }
  );

  return response.json();
};

export const getStepBlocker = async (
  roadmapId,
  stepId
) => {
  const response = await fetch(
    `${API_BASE_URL}/roadmaps/${roadmapId}/steps/${stepId}/blocker`
  );

  return response.json();
};
```

---

# Error Handling

Successful responses generally have:

```json
{
  "success": true,
  "data": {}
}
```

Errors generally have:

```json
{
  "success": false,
  "message": "Error message"
}
```

Validation errors may also include:

```json
{
  "success": false,
  "message": "AI returned an invalid response",
  "details": []
}
```

Frontend should check:

```javascript
if (!result.success) {
  // show error state
}
```

Recommended UI states:

```text
Loading
Error
Empty result
Roadmap loaded
```

---

# CORS

The backend currently allows the frontend origin configured by:

```env
CLIENT_URL=http://localhost:5173
```

If the React app runs on another port, update `CLIENT_URL` in the backend `.env`.

---

# Important Frontend Rules

### Do not hardcode civic procedures

Avoid:

```javascript
if (task === "DOMICILE_CERTIFICATE") {
  ...
}
```

or fixed step arrays such as:

```javascript
const steps = [
  ...
];
```

Procedure data is dynamic.

### Do not assume a fixed number of steps

Use:

```javascript
roadmap.steps.map(...)
```

### Do not hardcode dependency relationships

Use:

```javascript
graph.data.edges
```

and:

```javascript
node.data.depends_on
```

### Use backend status

Use the returned status:

```text
NOT_STARTED
IN_PROGRESS
COMPLETED
LOCKED
```

### Refresh after progress updates

Completing one step can unlock another step, so refresh the graph/progress data after a successful update.

---

# Backend Stack

```text
Node.js
Express
MongoDB Atlas
Mongoose
Axios
Helmet
CORS
Morgan
```

AI/ML runs separately through the Python service.

---

# Backend Project Structure

```text
Backend/
├── server.js
├── package.json
├── .env
├── .env.example
├── .gitignore
│
└── src/
    ├── app.js
    │
    ├── config/
    │   └── db.js
    │
    ├── controllers/
    │   ├── adminController.js
    │   ├── procedureController.js
    │   ├── progressController.js
    │   ├── roadmapController.js
    │   ├── sourceController.js
    │   └── taskController.js
    │
    ├── models/
    │   ├── CivicProcedure.js
    │   ├── Roadmap.js
    │   ├── Source.js
    │   └── Task.js
    │
    ├── routes/
    │   ├── adminRoutes.js
    │   ├── procedureRoutes.js
    │   ├── roadmapRoutes.js
    │   ├── sourceRoutes.js
    │   └── taskRoutes.js
    │
    ├── services/
    │   ├── aiService.js
    │   ├── graphService.js
    │   ├── progressService.js
    │   ├── roadmapService.js
    │   └── taskPipelineService.js
    │
    └── utils/
        └── aiResponseValidator.js
```

---

# Current Integration Status

```text
Backend server             ✅
MongoDB                    ✅
Task API                   ✅
Civic Procedure API        ✅
Roadmap API                ✅
Dependency Graph API       ✅
Progress API               ✅
Blocker API                ✅
Source APIs                ✅
AI response validation     ✅
Actual AIML connection     ⬜
Frontend integration       ⬜
Final end-to-end testing   ⬜
```

The backend is intended to be consumed dynamically. The next integration work is connecting the actual AI/ML endpoint and the React frontend.

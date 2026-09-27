# Graph Module — PSWB02

This module is responsible for converting structured civic-procedure data into an interactive dependency roadmap.

## Responsibilities

- Convert roadmap steps into React Flow nodes
- Convert `depends_on` relationships into React Flow edges
- Display dependency branches and merges
- Calculate LOCKED / NOT_STARTED / IN_PROGRESS / COMPLETED states
- Display step details
- Allow users to update step progress
- Provide a reusable roadmap component for Frontend integration

## Input

The Graph module expects a roadmap object containing:

- `task_id`
- `task_name`
- `category`
- `steps`

Each step should contain at minimum:

```json
{
  "step_id": "STEP_1",
  "title": "Example Step",
  "description": "Example description",
  "depends_on": []
}
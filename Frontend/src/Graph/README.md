# SevaRoute Graph Module

The Graph module turns the structured civic-service roadmap into an interactive dependency map.

## What it does

- Converts `steps[]` into React Flow nodes.
- Converts `depends_on[]` into directed dependency edges.
- Lays out linear, branching and merging workflows.
- Calculates `LOCKED`, `NOT_STARTED`, `IN_PROGRESS` and `COMPLETED`.
- Opens a detailed information panel when a step is selected.
- Shows required documents, forms, office details, fees, application links and official sources when supplied.
- Persists progress through the same `sevaroute-progress` browser store used by the Task Details page.

## Frontend integration

The graph is already integrated into the main frontend through:

```text
/roadmap
/roadmap/demo
/roadmap/:taskId
```

A task's details page also links directly to:

```text
/roadmap/:taskId
```

The real task route is adapted by:

```text
utils/taskAdapter.js
```

so the Graph module can later receive the AI/backend roadmap schema without changing the visual graph.

## Dependency source of truth

Use:

```json
"depends_on": ["STEP_1", "STEP_2"]
```

to define dependencies.

The graph derives the corresponding edges. `unlocks` does not need to be treated as a second source of truth.

## Progress

AI/backend data should describe the procedure and its dependencies.

The citizen's progress is maintained by the frontend/backend, not invented by the AI layer.

The current demo stores progress in:

```text
localStorage["sevaroute-progress"]
```

This can later be replaced by the project's progress API/database without changing the graph UI.

## Current visual structure

```text
┌─────────────────────────────────────────────────────────────┐
│ Back · Interactive roadmap · Service title · Progress       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│              dependency graph / React Flow                  │
│                                                             │
│                              ┌────────────────────────────┐ │
│                              │ selected step details      │ │
│                              │ documents / office / fee   │ │
│                              │ sources / progress         │ │
│                              └────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

The roadmap intentionally uses most of the available viewport so the dependency graph remains readable.

## Dependency layout

A branching graph such as:

```text
             STEP_1
                |
             STEP_2
             /    \
            /      \
        STEP_3    STEP_4
            \      /
             \    /
             STEP_5
```

is laid out in dependency layers.

For `STEP_5`:

```json
"depends_on": ["STEP_3", "STEP_4"]
```

both prerequisites must be completed before the step becomes available.

## Development

Install dependencies from the main frontend directory:

```bash
npm install
```

Run:

```bash
npm run dev
```

The Graph module should not be treated as a separate production app; it is a feature inside the main SevaRoute frontend.

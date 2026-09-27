# Frontend / Graph UI Update

Updated the SevaRoute frontend and Graph integration.

Highlights:
- Larger, more readable Manrope UI typography with a DM Serif Display accent for major headings.
- Reworked navigation and replaced the old single-letter logo with a civic shield/check mark.
- Roadmap route now uses the full available viewport; footer is hidden while viewing the roadmap.
- React Flow graph nodes are larger and carry step number, status, description and useful metadata.
- Added dependency arrows, legend, minimap, zoom controls and animated graph entry.
- Added animated step-details panel with boxed sections for prerequisites, documents, office, fees, application and official sources.
- Improved status/progress presentation.
- Integrated `/roadmap/:taskId` with the existing task catalogue and the same browser progress store used by Task Details.
- Added an improved interactive-graph launch card to Task Details.
- Removed the unused empty `statusUtils.js`.
- No backend/API contract was changed.

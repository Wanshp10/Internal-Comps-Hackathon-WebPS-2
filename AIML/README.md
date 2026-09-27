# PSWB02 - Municipal Bureaucracy Path Visualizer

AI and government-data module for a Civic Task Navigator focused on Maharashtra civic services.

## What this module does

- Accepts natural-language civic queries
- Predicts civic intent using TF-IDF + Logistic Regression
- Extracts location and task-specific entities
- Detects missing information
- Routes supported tasks through a custom fast path
- Routes other civic tasks through a generic civic path
- Loads structured government workflow JSON files
- Exposes FastAPI endpoints for backend integration

## Current custom intents

- OPEN_FOOD_BUSINESS
- BIRTH_CERTIFICATE
- ORGANIZE_PUBLIC_EVENT
- DOMICILE_CERTIFICATE_MAHARASHTRA

Other civic queries are routed to:

- GENERAL_CIVIC_TASK
- GENERIC_CIVIC_PATH

## Government data

The government_data folder contains:

- 20 detailed Maharashtra civic-task JSON files
- task_catalog.json
- task_mapping.json

Total: 22 JSON files

Each detailed task JSON can contain:

- department
- designated officer
- eligibility
- forms
- required documents
- fees
- prerequisites
- dependencies
- application links
- processing timelines
- official government sources
- progress states

Government facts are sourced from official government portals. Source URLs are stored inside the relevant workflow steps.

## API endpoints

GET /health

Checks whether the AI service and government data directory are available.

POST /ai/analyze

Example request:

{
    "query": "I want to open a cafe in Pune"
}

Main response fields:

- query
- normalized_query
- intent
- route
- location
- location_scope
- entities
- confidence
- intent_source
- status
- missing_fields

GET /government/task/{task_id}

Example:

GET /government/task/DOMICILE_CERTIFICATE

## Project structure

PSWB02_AI/
- app.py
- README.md
- requirements.txt
- .gitignore
- intent_model.ipynb
- data/
- models/
  - intent_classifier.joblib
  - tfidf_vectorizer.joblib
- government_data/
  - task_catalog.json
  - task_mapping.json
  - 20 detailed task JSON files

## Run locally

Install dependencies:

pip install -r requirements.txt

Start FastAPI:

uvicorn app:app --reload

Swagger API documentation:

http://127.0.0.1:8000/docs

## Notes

- Current implementation is Maharashtra-focused.
- Municipal requirements may vary by local authority.
- When official sources conflict or do not provide a universal value, the dataset preserves that uncertainty instead of inventing information.
- Gemini and multilingual experiments remain in the notebook and are not required for the standalone local API.

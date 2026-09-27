
from pathlib import Path
import json
import re
import joblib

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel


# ============================================================
# PATHS
# ============================================================

BASE_DIR = Path(__file__).resolve().parent

MODEL_PATH = BASE_DIR / "models" / "intent_classifier.joblib"
VECTORIZER_PATH = BASE_DIR / "models" / "tfidf_vectorizer.joblib"
GOV_DATA_DIR = BASE_DIR / "government_data"


# ============================================================
# LOAD MODEL
# ============================================================

if not MODEL_PATH.exists():
    raise FileNotFoundError(f"Intent model not found: {MODEL_PATH}")

if not VECTORIZER_PATH.exists():
    raise FileNotFoundError(f"Vectorizer not found: {VECTORIZER_PATH}")

intent_model = joblib.load(MODEL_PATH)
tfidf_vectorizer = joblib.load(VECTORIZER_PATH)


# ============================================================
# CONFIG
# ============================================================

CONFIDENCE_THRESHOLD = 0.65

KNOWN_CUSTOM_INTENTS = {
    "OPEN_FOOD_BUSINESS",
    "BIRTH_CERTIFICATE",
    "ORGANIZE_PUBLIC_EVENT",
    "DOMICILE_CERTIFICATE_MAHARASHTRA"
}

MAHARASHTRA_CITIES = [
    "Mumbai",
    "Pune",
    "Thane",
    "Navi Mumbai",
    "Nagpur",
    "Nashik",
    "Kolhapur",
    "Solapur",
    "Amravati",
    "Kalyan",
    "Dombivli",
    "Chhatrapati Sambhajinagar"
]

OUTSIDE_MAHARASHTRA_CITIES = [
    "Delhi",
    "New Delhi",
    "Bangalore",
    "Bengaluru",
    "Hyderabad",
    "Chennai",
    "Kolkata",
    "Ahmedabad",
    "Jaipur",
    "Lucknow",
    "Surat",
    "Indore",
    "Bhopal",
    "Chandigarh",
    "Patna",
    "Ranchi",
    "Kochi",
    "Gurgaon",
    "Gurugram",
    "Noida"
]

FOOD_BUSINESS_TYPES = [
    "restaurant",
    "bakery",
    "cafe",
    "cloud kitchen",
    "food stall",
    "juice centre",
    "juice center",
    "juice shop",
    "snack centre",
    "snack center",
    "eatery",
    "food outlet",
    "tiffin service",
    "catering business",
    "sweet shop",
    "fast food shop",
    "tea cafe",
    "home kitchen"
]

EVENT_TYPES = [
    "college fest",
    "cultural program",
    "music event",
    "community gathering",
    "outdoor festival",
    "sports event",
    "public exhibition",
    "stage show",
    "charity event",
    "community function",
    "public celebration",
    "college cultural event",
    "outdoor function",
    "public performance",
    "public event"
]

REQUIRED_FIELDS = {
    "OPEN_FOOD_BUSINESS": ["location", "business_type"],
    "ORGANIZE_PUBLIC_EVENT": ["location", "event_type"],
    "BIRTH_CERTIFICATE": ["location"],
    "DOMICILE_CERTIFICATE_MAHARASHTRA": []
}


# ============================================================
# REQUEST MODEL
# ============================================================

class QueryRequest(BaseModel):
    query: str


# ============================================================
# HELPERS
# ============================================================

def find_phrase(text, phrases):
    text_lower = text.lower()

    for phrase in sorted(phrases, key=len, reverse=True):
        if phrase.lower() in text_lower:
            return phrase

    return None


def extract_location_with_scope(text):
    text_lower = text.lower()

    for city in sorted(MAHARASHTRA_CITIES, key=len, reverse=True):
        if city.lower() in text_lower:
            return city, "MAHARASHTRA"

    for city in sorted(
        OUTSIDE_MAHARASHTRA_CITIES,
        key=len,
        reverse=True
    ):
        if city.lower() in text_lower:
            return city, "OUTSIDE_MAHARASHTRA"

    return None, "MISSING"


def extract_birth_subtype(text):
    t = text.lower()

    if any(x in t for x in [
        "delayed",
        "not registered",
        "never registered",
        "late registration"
    ]):
        return "delayed_registration"

    if any(x in t for x in [
        "correction",
        "spelling mistake",
        "name correction",
        "date correction",
        "wrong name",
        "wrong date"
    ]):
        return "correction"

    if any(x in t for x in [
        "duplicate",
        "copy",
        "reissue",
        "old birth certificate"
    ]):
        return "duplicate_copy"

    if any(x in t for x in [
        "newborn",
        "new birth",
        "birth registration",
        "register birth",
        "register the birth",
        "baby born",
        "child born"
    ]):
        return "new_registration"

    return None


def extract_domicile_purpose(text):
    t = text.lower()

    if any(x in t for x in [
        "admission",
        "college",
        "university",
        "education"
    ]):
        return "admission"

    if "scholarship" in t:
        return "scholarship"

    if any(x in t for x in [
        "government job",
        "govt job",
        "job application"
    ]):
        return "government_job"

    if any(x in t for x in [
        "state benefit",
        "government scheme",
        "govt scheme",
        "scheme"
    ]):
        return "state_benefit"

    return None


def extract_entities(text, predicted_intent):
    location, _ = extract_location_with_scope(text)

    entities = {
        "location": location,
        "business_type": None,
        "event_type": None,
        "birth_subtype": None,
        "domicile_purpose": None
    }

    if predicted_intent == "OPEN_FOOD_BUSINESS":
        entities["business_type"] = find_phrase(
            text,
            FOOD_BUSINESS_TYPES
        )

    elif predicted_intent == "ORGANIZE_PUBLIC_EVENT":
        entities["event_type"] = find_phrase(
            text,
            EVENT_TYPES
        )

    elif predicted_intent == "BIRTH_CERTIFICATE":
        entities["birth_subtype"] = extract_birth_subtype(text)

    elif predicted_intent == "DOMICILE_CERTIFICATE_MAHARASHTRA":
        entities["domicile_purpose"] = extract_domicile_purpose(text)

    return entities


def predict_intent(text):
    vector = tfidf_vectorizer.transform([text])

    predicted_intent = intent_model.predict(vector)[0]

    probabilities = intent_model.predict_proba(vector)[0]

    confidence = float(max(probabilities))

    return predicted_intent, confidence


def normalize_intent_route(predicted_intent):
    if predicted_intent in KNOWN_CUSTOM_INTENTS:
        return {
            "intent": predicted_intent,
            "route": "CUSTOM_FAST_PATH"
        }

    return {
        "intent": "GENERAL_CIVIC_TASK",
        "route": "GENERIC_CIVIC_PATH"
    }


def detect_missing_fields(intent, entities, location_scope):
    if location_scope == "OUTSIDE_MAHARASHTRA":
        return "OUT_OF_SCOPE", []

    required = REQUIRED_FIELDS.get(intent, [])

    missing = [
        field
        for field in required
        if not entities.get(field)
    ]

    if missing:
        return "NEEDS_INFO", missing

    return "OK", []


def analyze_query_core(user_query):
    if not user_query or not user_query.strip():
        raise ValueError("Query cannot be empty.")

    normalized_query = user_query.strip()

    raw_intent, confidence = predict_intent(normalized_query)

    route_info = normalize_intent_route(raw_intent)

    final_intent = route_info["intent"]
    route = route_info["route"]

    location, location_scope = extract_location_with_scope(
        normalized_query
    )

    entity_intent = (
        raw_intent
        if raw_intent in KNOWN_CUSTOM_INTENTS
        else final_intent
    )

    entities = extract_entities(
        normalized_query,
        entity_intent
    )

    entities["location"] = location

    if route == "CUSTOM_FAST_PATH":
        status, missing_fields = detect_missing_fields(
            raw_intent,
            entities,
            location_scope
        )
    else:
        if location_scope == "OUTSIDE_MAHARASHTRA":
            status = "OUT_OF_SCOPE"
        else:
            status = "OK"

        missing_fields = []

    intent_source = (
        "CUSTOM_MODEL"
        if confidence >= CONFIDENCE_THRESHOLD
        else "CUSTOM_MODEL_LOW_CONFIDENCE"
    )

    return {
        "query": user_query,
        "normalized_query": normalized_query,
        "intent": final_intent,
        "route": route,
        "location": location,
        "location_scope": location_scope,
        "entities": entities,
        "confidence": confidence,
        "intent_source": intent_source,
        "status": status,
        "missing_fields": missing_fields
    }


def load_task_mapping():
    mapping_path = GOV_DATA_DIR / "task_mapping.json"

    if not mapping_path.exists():
        raise FileNotFoundError(
            f"task_mapping.json not found: {mapping_path}"
        )

    with open(mapping_path, "r", encoding="utf-8") as f:
        return json.load(f)


def get_task_data(task_id):
    mapping = load_task_mapping()

    if task_id not in mapping:
        raise KeyError(task_id)

    target = mapping[task_id]

    if target == "dynamic_retrieval":
        return {
            "task_id": task_id,
            "route": "dynamic_retrieval"
        }

    task_path = GOV_DATA_DIR / target

    if not task_path.exists():
        raise FileNotFoundError(
            f"Government data file not found: {task_path}"
        )

    with open(task_path, "r", encoding="utf-8") as f:
        return json.load(f)


# ============================================================
# FASTAPI
# ============================================================

app = FastAPI(
    title="PSWB02 Civic Task Navigator AI",
    version="1.0.0",
    description=(
        "AI service for Maharashtra civic-task intent routing, "
        "entity extraction and verified government workflow retrieval."
    )
)


@app.get("/")
def root():
    return {
        "service": "PSWB02 Civic Task Navigator AI",
        "status": "running"
    }


@app.get("/health")
def health():
    return {
        "status": "ok",
        "model_loaded": True,
        "government_data_directory": GOV_DATA_DIR.exists()
    }


@app.post("/ai/analyze")
def analyze(request: QueryRequest):
    try:
        return analyze_query_core(request.query)

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


@app.get("/government/task/{task_id}")
def government_task(task_id: str):
    task_id = task_id.upper()

    try:
        return get_task_data(task_id)

    except KeyError:
        raise HTTPException(
            status_code=404,
            detail=f"Unknown task_id: {task_id}"
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

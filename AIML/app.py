from pathlib import Path
import json
import os
import re

from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from gemini_service import (
    gemini_analyze_query,
    gemini_generate_procedure,
    is_configured as gemini_is_configured,
)


# ============================================================
# PATHS
# ============================================================

BASE_DIR = Path(__file__).resolve().parent
GOV_DATA_DIR = BASE_DIR / "government_data"
TASK_CATALOG_PATH = GOV_DATA_DIR / "task_catalog.json"


# ============================================================
# JSON LOADER
# ============================================================

def load_json_file(path: Path, description: str):
    if not path.exists():
        raise FileNotFoundError(
            f"{description} not found: {path}"
        )

    with open(
        path,
        "r",
        encoding="utf-8",
    ) as file:
        return json.load(file)


# ============================================================
# TASK CATALOG
# ============================================================

TASK_CATALOG = load_json_file(
    TASK_CATALOG_PATH,
    "task_catalog.json",
)


SUPPORTED_TASK_IDS = {
    str(task.get("task_id", ""))
    .strip()
    .upper()
    for task in TASK_CATALOG
    if task.get("task_id")
}


TASK_ALIASES = {
    "DOMICILE_CERTIFICATE_MAHARASHTRA":
        "DOMICILE_CERTIFICATE",

    "ORGANIZE_PUBLIC_EVENT":
        "PUBLIC_EVENT_PERMISSION",
}


TASK_NAME_LOOKUP = {}

for task in TASK_CATALOG:

    task_id = str(
        task.get("task_id", "")
    ).strip().upper()

    task_name = str(
        task.get("task_name", "")
    ).strip()

    if not task_id:
        continue

    if task_name:
        TASK_NAME_LOOKUP[
            task_name
        ] = task_id

        TASK_NAME_LOOKUP[
            re.sub(
                r"[^A-Z0-9]+",
                "_",
                task_name.upper(),
            ).strip("_")
        ] = task_id


# ============================================================
# REQUIRED USER INFORMATION
# ============================================================

REQUIRED_FIELDS = {
    "BIRTH_CERTIFICATE": ["location"],
    "DEATH_CERTIFICATE": ["location"],
    "MARRIAGE_REGISTRATION": ["location"],
    "DOMICILE_CERTIFICATE": ["location"],
    "INCOME_CERTIFICATE": ["location"],
    "CASTE_CERTIFICATE": ["location"],
    "NON_CREAMY_LAYER_CERTIFICATE": ["location"],
    "NEW_RATION_CARD": ["location"],
    "RATION_CARD_UPDATE": ["location"],
    "SHOP_ESTABLISHMENT_REGISTRATION": ["location"],
    "OPEN_FOOD_BUSINESS": [
        "location",
        "business_type",
    ],
    "PROPERTY_CIVIC_SERVICE": ["location"],
    "NEW_WATER_CONNECTION": ["location"],
    "TRADE_LICENCE": ["location"],
    "HEALTH_LICENCE": ["location"],
    "BUILDING_PERMIT": ["location"],
    "PUBLIC_EVENT_PERMISSION": [
        "location",
        "event_type",
    ],
    "ASSEMBLY_PROCESSION_PERMISSION": [
        "location",
    ],
    "SENIOR_CITIZEN_CERTIFICATE": [
        "location",
    ],
    "POLICE_CLEARANCE": ["location"],
}


# ============================================================
# REQUEST MODEL
# ============================================================

class QueryRequest(BaseModel):
    query: str


# ============================================================
# STATUS
# ============================================================

def refine_status(result):

    intent = str(
        result.get("intent", "")
    ).strip().upper()

    entities = result.get(
        "entities"
    )

    if not isinstance(
        entities,
        dict,
    ):
        entities = {}

    result["entities"] = entities

    if intent == "GENERAL_CIVIC_TASK":

        result["status"] = "OUT_OF_SCOPE"
        result["missing_fields"] = []
        result["procedure"] = None

        return result

    required = REQUIRED_FIELDS.get(
        intent,
        [],
    )

    missing = [
        field
        for field in required
        if not entities.get(field)
        and not result.get(field)
    ]

    if missing:

        result["status"] = "NEEDS_INFO"
        result["missing_fields"] = missing
        result["procedure"] = None

        return result

    result["status"] = "OK"
    result["missing_fields"] = []

    procedure = result.get(
        "procedure"
    )

    if isinstance(
        procedure,
        dict,
    ):

        jurisdiction = procedure.get(
            "jurisdiction"
        )

        if not isinstance(
            jurisdiction,
            dict,
        ):
            jurisdiction = {}

        jurisdiction.setdefault(
            "state",
            "Maharashtra",
        )

        if (
            result.get("location")
            and result.get("location_scope")
            == "MAHARASHTRA"
        ):
            if (
                str(
                    result.get("location")
                ).strip().lower()
                == "maharashtra"
            ):
                jurisdiction["state"] = (
                    "Maharashtra"
                )

        procedure["jurisdiction"] = (
            jurisdiction
        )

        procedure["task_id"] = (
            procedure.get("task_id")
            or intent
        )

        procedure["task_name"] = (
            procedure.get("task_name")
            or next(
                (
                    task.get("task_name")
                    for task in TASK_CATALOG
                    if str(
                        task.get(
                            "task_id",
                            "",
                        )
                    ).strip().upper()
                    == intent
                ),
                intent.replace(
                    "_",
                    " ",
                ).title(),
            )
        )

        result["procedure"] = procedure

    return result


# ============================================================
# MAIN GEMINI ANALYSIS
# ============================================================

def analyze_query_core(
    user_query: str,
):

    if not user_query or not user_query.strip():
        raise ValueError(
            "Query cannot be empty."
        )

    clean_query = user_query.strip()

    result = gemini_analyze_query(
        user_query=clean_query,
        supported_tasks=TASK_CATALOG,
        supported_task_ids=SUPPORTED_TASK_IDS,
        aliases=TASK_ALIASES,
        task_name_lookup=TASK_NAME_LOOKUP,
    )

    result = refine_status(
        result
    )

    return result


# ============================================================
# FASTAPI
# ============================================================

app = FastAPI(
    title="PSWB02 Civic Task Navigator AI",
    version="4.0.0",
    description=(
        "Gemini-only civic service understanding "
        "and complete procedure generation."
    ),
)


# ============================================================
# ROOT
# ============================================================

@app.get("/")
def root():

    return {
        "service":
            "PSWB02 Civic Task Navigator AI",

        "status":
            "running",

        "ai_mode":
            "GEMINI_ONLY",

        "procedure_generation":
            "GEMINI",
    }


# ============================================================
# HEALTH
# ============================================================

@app.get("/health")
def health():

    return {
        "status":
            "ok",

        "model_loaded":
            False,

        "government_data_directory":
            GOV_DATA_DIR.exists(),

        "gemini_configured":
            gemini_is_configured(),

        "gemini_model":
            os.getenv(
                "GEMINI_MODEL",
                "gemini-3.5-flash-lite",
            ),

        "supported_task_count":
            len(SUPPORTED_TASK_IDS),

        "ai_mode":
            "GEMINI_ONLY",

        "procedure_generation":
            "GEMINI",
    }


# ============================================================
# ANALYZE
# ============================================================

@app.post("/ai/analyze")
def analyze(
    request: QueryRequest,
):

    try:

        result = analyze_query_core(
            request.query
        )

        return result

    except ValueError as error:

        raise HTTPException(
            status_code=400,
            detail=str(error),
        )

    except Exception as error:

        print(
            "AI analysis error:",
            str(error),
        )

        raise HTTPException(
            status_code=500,
            detail=str(error),
        )


# ============================================================
# GEMINI PROCEDURE ENDPOINT
# ============================================================

@app.get(
    "/government/task/{task_id}"
)
def government_task(
    task_id: str,
):

    normalized_task_id = (
        str(task_id)
        .strip()
        .upper()
    )

    if (
        normalized_task_id
        not in SUPPORTED_TASK_IDS
    ):
        raise HTTPException(
            status_code=404,
            detail=(
                f"Unknown task_id: "
                f"{normalized_task_id}"
            ),
        )

    task = next(
        (
            item
            for item in TASK_CATALOG
            if str(
                item.get(
                    "task_id",
                    "",
                )
            ).strip().upper()
            == normalized_task_id
        ),
        {
            "task_id":
                normalized_task_id,

            "task_name":
                normalized_task_id
                .replace(
                    "_",
                    " ",
                )
                .title(),
        },
    )

    try:

        procedure = (
            gemini_generate_procedure(
                task_id=normalized_task_id,
                supported_tasks=[task],
            )
        )

        return procedure

    except Exception as error:

        print(
            "Gemini procedure generation error:",
            str(error),
        )

        raise HTTPException(
            status_code=500,
            detail=str(error),
        )
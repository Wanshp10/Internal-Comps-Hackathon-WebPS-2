import json
import os
import re
from typing import Any

from google import genai
from google.genai import types


# ============================================================
# CONFIG
# ============================================================

DEFAULT_GEMINI_MODEL = (
    "gemini-3.5-flash-lite"
)

_client = None


def get_gemini_model():

    return (
        os.getenv(
            "GEMINI_MODEL",
            DEFAULT_GEMINI_MODEL,
        )
        or DEFAULT_GEMINI_MODEL
    ).strip()


# ============================================================
# GEMINI CLIENT
# ============================================================

def get_client():

    global _client

    if _client is not None:
        return _client

    api_key = (
        os.getenv(
            "GEMINI_API_KEY"
        )
        or ""
    ).strip()

    if not api_key:

        raise RuntimeError(
            "GEMINI_API_KEY is not configured."
        )

    _client = genai.Client(
        api_key=api_key
    )

    return _client


def is_configured():

    return bool(
        (
            os.getenv(
                "GEMINI_API_KEY"
            )
            or ""
        ).strip()
    )


# ============================================================
# TASK ID NORMALIZATION
# ============================================================

def normalize_task_id(
    raw_intent: Any,
    supported_task_ids,
    aliases=None,
    task_name_lookup=None,
):

    if not raw_intent:

        raise ValueError(
            "Gemini did not return an intent."
        )

    aliases = aliases or {}

    task_name_lookup = (
        task_name_lookup or {}
    )

    raw = str(
        raw_intent
    ).strip()

    raw = raw.replace(
        "`",
        "",
    ).strip()

    upper = raw.upper()

    if upper in supported_task_ids:
        return upper

    if upper in aliases:
        return aliases[upper]

    if raw in task_name_lookup:
        return task_name_lookup[raw]

    if upper in task_name_lookup:
        return task_name_lookup[upper]

    normalized = re.sub(
        r"[^A-Z0-9]+",
        "_",
        upper,
    ).strip("_")

    if normalized in task_name_lookup:
        return task_name_lookup[
            normalized
        ]

    compact = normalized.replace(
        "_",
        "",
    )

    for task_id in supported_task_ids:

        task_compact = (
            str(task_id)
            .replace("_", "")
            .upper()
        )

        if (
            compact
            == task_compact
        ):
            return task_id

    raise ValueError(
        f"Unsupported Gemini intent: "
        f"{raw_intent}"
    )


# ============================================================
# JSON PARSER
# ============================================================

def extract_json(
    text: str,
):

    if not text:

        raise ValueError(
            "Gemini returned an empty response."
        )

    cleaned = text.strip()

    cleaned = re.sub(
        r"^```(?:json)?\s*",
        "",
        cleaned,
        flags=re.IGNORECASE,
    )

    cleaned = re.sub(
        r"\s*```$",
        "",
        cleaned,
    )

    cleaned = cleaned.strip()

    try:

        return json.loads(
            cleaned
        )

    except json.JSONDecodeError:

        pass

    start = cleaned.find(
        "{"
    )

    end = cleaned.rfind(
        "}"
    )

    if (
        start != -1
        and end > start
    ):

        candidate = cleaned[
            start:end + 1
        ]

        try:

            return json.loads(
                candidate
            )

        except json.JSONDecodeError:

            pass

    raise ValueError(
        "Could not parse Gemini JSON response."
    )


# ============================================================
# SOURCE NORMALIZATION
# ============================================================

def normalize_source(
    source,
):

    if not isinstance(
        source,
        dict,
    ):

        return {
            "source_title": "",
            "source_url": "",
            "authority": "",
            "last_verified": "",
            "source_type":
                "official_government",
        }

    return {
        "source_title":
            str(
                source.get(
                    "source_title"
                )
                or ""
            ).strip(),

        "source_url":
            str(
                source.get(
                    "source_url"
                )
                or ""
            ).strip(),

        "authority":
            str(
                source.get(
                    "authority"
                )
                or ""
            ).strip(),

        "last_verified":
            str(
                source.get(
                    "last_verified"
                )
                or ""
            ).strip(),

        "source_type":
            str(
                source.get(
                    "source_type"
                )
                or "official_government"
            ).strip(),
    }


# ============================================================
# STEP NORMALIZATION
# ============================================================

def normalize_step(
    step,
    index,
):

    if not isinstance(
        step,
        dict,
    ):

        step = {}

    step_id = str(
        step.get(
            "step_id"
        )
        or f"STEP_{index + 1}"
    ).strip().upper()

    title = str(
        step.get(
            "title"
        )
        or ""
    ).strip()

    if not title:

        title = (
            f"Step {index + 1}"
        )

    fees = step.get(
        "fees"
    )

    if not isinstance(
        fees,
        dict,
    ):

        fees = step.get(
            "fee"
        )

    if not isinstance(
        fees,
        dict,
    ):

        fees = {}

    office = step.get(
        "office"
    )

    if isinstance(
        office,
        str,
    ):

        office = {
            "department":
                office,

            "office_name":
                None,

            "office_type":
                None,

            "location_rule":
                None,
        }

    elif not isinstance(
        office,
        dict,
    ):

        office = {}

    application = step.get(
        "application"
    )

    if not isinstance(
        application,
        dict,
    ):

        application = {}

    return {
        "step_id":
            step_id,

        "title":
            title,

        "description":
            str(
                step.get(
                    "description"
                )
                or ""
            ).strip(),

        "required_forms": [
            str(item).strip()
            for item in (
                step.get(
                    "required_forms"
                )
                or []
            )
            if str(item).strip()
        ],

        "required_documents": [
            str(item).strip()
            for item in (
                step.get(
                    "required_documents"
                )
                or []
            )
            if str(item).strip()
        ],

        "fees": {
            "amount":
                (
                    fees.get(
                        "amount"
                    )
                    if isinstance(
                        fees.get(
                            "amount"
                        ),
                        (int, float),
                    )
                    else None
                ),

            "currency":
                str(
                    fees.get(
                        "currency"
                    )
                    or "INR"
                ).strip(),

            "payment_method": [
                str(item).strip()
                for item in (
                    fees.get(
                        "payment_method"
                    )
                    or []
                )
                if str(item).strip()
            ],

            "notes":
                fees.get(
                    "notes"
                ),
        },

        "office": {
            "department":
                str(
                    office.get(
                        "department"
                    )
                    or ""
                ).strip(),

            "office_name":
                office.get(
                    "office_name"
                ),

            "office_type":
                office.get(
                    "office_type"
                ),

            "location_rule":
                office.get(
                    "location_rule"
                ),
        },

        "prerequisites": [
            str(item).strip()
            for item in (
                step.get(
                    "prerequisites"
                )
                or []
            )
            if str(item).strip()
        ],

        "depends_on": [
            str(item)
            .strip()
            .upper()
            for item in (
                step.get(
                    "depends_on"
                )
                or []
            )
            if str(item).strip()
        ],

        "unlocks": [
            str(item)
            .strip()
            .upper()
            for item in (
                step.get(
                    "unlocks"
                )
                or []
            )
            if str(item).strip()
        ],

        "can_run_in_parallel":
            bool(
                step.get(
                    "can_run_in_parallel",
                    False,
                )
            ),

        "application": {
            "mode": [
                str(item).strip()
                for item in (
                    application.get(
                        "mode"
                    )
                    or []
                )
                if str(item).strip()
            ],

            "application_link":
                (
                    application.get(
                        "application_link"
                    )
                    or None
                ),
        },

        "time_limit_days":
            (
                step.get(
                    "time_limit_days"
                )
                if isinstance(
                    step.get(
                        "time_limit_days"
                    ),
                    (int, float),
                )
                else None
            ),

        "instructions": [
            str(item).strip()
            for item in (
                step.get(
                    "instructions"
                )
                or []
            )
            if str(item).strip()
        ],

        "official_sources": [
            normalize_source(item)
            for item in (
                step.get(
                    "official_sources"
                )
                or []
            )
            if isinstance(
                item,
                dict,
            )
        ],
    }


# ============================================================
# PROCEDURE NORMALIZATION
# ============================================================

def normalize_procedure(
    procedure,
    fallback_task_id,
):

    if not isinstance(
        procedure,
        dict,
    ):

        return None

    task_id = str(
        procedure.get(
            "task_id"
        )
        or fallback_task_id
    ).strip().upper()

    if not task_id:
        return None

    task_name = str(
        procedure.get(
            "task_name"
        )
        or ""
    ).strip()

    if not task_name:

        task_name = (
            task_id
            .replace(
                "_",
                " ",
            )
            .title()
        )

    raw_steps = procedure.get(
        "steps"
    )

    if not isinstance(
        raw_steps,
        list,
    ):

        return None

    raw_steps = raw_steps[
        :8
    ]

    if len(raw_steps) < 4:

        return None

    steps = [
        normalize_step(
            step,
            index,
        )
        for index, step in enumerate(
            raw_steps
        )
    ]

    # --------------------------------------------------------
    # UNIQUE STEP IDS
    # --------------------------------------------------------

    seen_ids = set()

    for index, step in enumerate(
        steps
    ):

        if (
            not step["step_id"]
            or step["step_id"]
            in seen_ids
        ):

            step["step_id"] = (
                f"STEP_{index + 1}"
            )

        seen_ids.add(
            step["step_id"]
        )

    valid_ids = {
        step["step_id"]
        for step in steps
    }

    # --------------------------------------------------------
    # DEPENDENCIES
    # --------------------------------------------------------

    for index, step in enumerate(
        steps
    ):

        step["depends_on"] = [
            dependency
            for dependency in (
                step["depends_on"]
            )
            if (
                dependency in valid_ids
                and dependency
                != step["step_id"]
            )
        ]

        if index == 0:

            step["depends_on"] = []

    for step in steps:

        step["unlocks"] = []

    for step in steps:

        for dependency in (
            step["depends_on"]
        ):

            dependency_step = next(
                (
                    item
                    for item in steps
                    if item[
                        "step_id"
                    ]
                    == dependency
                ),
                None,
            )

            if (
                dependency_step
                and step[
                    "step_id"
                ]
                not in dependency_step[
                    "unlocks"
                ]
            ):

                dependency_step[
                    "unlocks"
                ].append(
                    step["step_id"]
                )

    jurisdiction = (
        procedure.get(
            "jurisdiction"
        )
    )

    if not isinstance(
        jurisdiction,
        dict,
    ):

        jurisdiction = {}

    department = (
        procedure.get(
            "department"
        )
    )

    if not isinstance(
        department,
        dict,
    ):

        department = {}

    freshness = (
        procedure.get(
            "source_freshness"
        )
    )

    if not isinstance(
        freshness,
        dict,
    ):

        freshness = {}

    return {
        "task_id":
            task_id,

        "task_name":
            task_name,

        "category":
            str(
                procedure.get(
                    "category"
                )
                or "civic_service"
            ).strip(),

        "jurisdiction": {
            "state":
                jurisdiction.get(
                    "state"
                )
                or "Maharashtra",

            "district":
                jurisdiction.get(
                    "district"
                ),

            "local_body":
                jurisdiction.get(
                    "local_body"
                ),
        },

        "user_context_required": [
            str(item).strip()
            for item in (
                procedure.get(
                    "user_context_required"
                )
                or []
            )
            if str(item).strip()
        ],

        "department": {
            "name":
                str(
                    department.get(
                        "name"
                    )
                    or ""
                ).strip(),

            "sub_department":
                department.get(
                    "sub_department"
                ),

            "designated_officer":
                department.get(
                    "designated_officer"
                ),

            "office_type":
                department.get(
                    "office_type"
                ),
        },

        "eligibility": [
            str(item).strip()
            for item in (
                procedure.get(
                    "eligibility"
                )
                or []
            )
            if str(item).strip()
        ],

        "steps":
            steps,

        "status_options": [
            "NOT_STARTED",
            "IN_PROGRESS",
            "COMPLETED",
            "LOCKED",
        ],

        "source_freshness": {
            "last_verified":
                freshness.get(
                    "last_verified"
                ),

            "needs_review":
                bool(
                    freshness.get(
                        "needs_review",
                        True,
                    )
                ),
        },
    }


# ============================================================
# PROMPT
# ============================================================

def build_prompt(
    user_query,
    supported_tasks,
):

    task_lines = []

    for task in supported_tasks:

        task_id = str(
            task.get(
                "task_id",
                "",
            )
        ).strip().upper()

        task_name = str(
            task.get(
                "task_name",
                "",
            )
        ).strip()

        if task_id:

            task_lines.append(
                f"- {task_id}: {task_name}"
            )

    supported_text = "\n".join(
        task_lines
    )

    return f"""
You are the ONLY AI engine for SevaRoute,
a Maharashtra civic-service navigation system.

You must perform the COMPLETE operation in ONE response:

1. Understand the user's request.
2. Identify the civic task.
3. Extract location and entities.
4. Generate the COMPLETE practical procedure.
5. Generate 4 to 8 meaningful roadmap steps.
6. Generate dependencies between steps.
7. Generate required documents/forms.
8. Generate eligibility.
9. Generate department and office information.
10. Generate application mode and official links when known.
11. Generate plain-language instructions.

USER QUERY:
{user_query}

SUPPORTED TASKS:
{supported_text}

GENERAL_CIVIC_TASK:
Use this only when the request is not a supported
Maharashtra civic/government service.

CRITICAL RULES:

- Return exactly ONE supported task ID or GENERAL_CIVIC_TASK.
- Never invent a task ID.
- The procedure MUST contain 4 to 8 steps for every
  supported task.
- NEVER return an empty steps array.
- NEVER return one generic placeholder step.
- NEVER use "Untitled Step".
- Every step MUST have a useful, human-readable title.
- Every step MUST have a useful description.
- Use STEP_1, STEP_2, STEP_3, etc.
- STEP_1 must normally have no dependencies.
- Later steps should depend only on genuinely necessary
  earlier steps.
- Generate unlocks consistently with depends_on.
- Include practical documents/forms.
- Include practical eligibility information.
- Include instructions for each step.
- Include department and office information.
- Do not invent an exact fee when uncertain.
- Use null for uncertain numeric fees.
- Do not invent an official URL.
- Use an official Maharashtra government portal only
  when reasonably confident.
- For uncertain official information, use null and
  source_freshness.needs_review = true.
- The response is for a Maharashtra civic-service
  navigation prototype.
- Keep the procedure specific to the identified task.

DOMICILE CERTIFICATE SPECIAL RULE:

If the intent is DOMICILE_CERTIFICATE, generate a
complete multi-step domicile workflow, not a placeholder.

The domicile workflow should cover the relevant stages
such as:

- account/service access
- selecting the domicile service
- preparing identity/address/residence evidence
- completing and submitting the application
- fee/payment where applicable
- authority verification/processing
- certificate issuance/download

Do not collapse the domicile process into a single step.

BIRTH CERTIFICATE SPECIAL RULE:

Generate separate meaningful stages for identifying the
registration route, preparing documents, submitting,
verification/processing, and certificate issuance.

MARRIAGE REGISTRATION SPECIAL RULE:

Generate meaningful stages for determining the route,
documents, application/notice, authority processing,
verification, and certificate issuance as applicable.

Return ONLY VALID JSON.

Required structure:

{{
  "query": "original query",
  "normalized_query": "cleaned query",
  "intent": "SUPPORTED_TASK_ID_OR_GENERAL_CIVIC_TASK",
  "route": "CUSTOM_FAST_PATH_OR_GENERIC_CIVIC_PATH",
  "location": null,
  "location_scope": "MAHARASHTRA_OR_MISSING_OR_OUTSIDE_MAHARASHTRA",
  "entities": {{
    "location": null,
    "business_type": null,
    "event_type": null,
    "birth_subtype": null,
    "domicile_purpose": null
  }},
  "confidence": 0.0,
  "intent_source": "GEMINI",
  "status": "OK",
  "missing_fields": [],
  "gemini_reason": "brief reason",
  "procedure": {{
    "task_id": "SUPPORTED_TASK_ID",
    "task_name": "Human-readable task name",
    "category": "category",
    "jurisdiction": {{
      "state": "Maharashtra",
      "district": null,
      "local_body": null
    }},
    "user_context_required": [],
    "department": {{
      "name": "responsible department",
      "sub_department": null,
      "designated_officer": null,
      "office_type": null
    }},
    "eligibility": [],
    "steps": [
      {{
        "step_id": "STEP_1",
        "title": "Meaningful step title",
        "description": "Useful description",
        "required_forms": [],
        "required_documents": [],
        "fees": {{
          "amount": null,
          "currency": "INR",
          "payment_method": [],
          "notes": null
        }},
        "office": {{
          "department": "",
          "office_name": null,
          "office_type": null,
          "location_rule": null
        }},
        "prerequisites": [],
        "depends_on": [],
        "unlocks": [],
        "can_run_in_parallel": false,
        "application": {{
          "mode": [],
          "application_link": null
        }},
        "time_limit_days": null,
        "instructions": [],
        "official_sources": []
      }}
    ],
    "status_options": [
      "NOT_STARTED",
      "IN_PROGRESS",
      "COMPLETED",
      "LOCKED"
    ],
    "source_freshness": {{
      "last_verified": null,
      "needs_review": true
    }}
  }}
}}
"""


# ============================================================
# REPAIR PROMPT
# ============================================================

def build_repair_prompt(
    user_query,
    supported_tasks,
):

    task_lines = []

    for task in supported_tasks:

        task_lines.append(
            f"- {task.get('task_id')}: "
            f"{task.get('task_name')}"
        )

    return f"""
Your previous JSON response was incomplete.

Generate the complete SevaRoute civic-service response
for this user query:

{user_query}

Choose exactly one task from:

{chr(10).join(task_lines)}

IMPORTANT:

- Return valid JSON only.
- Include intent.
- Include location and entities.
- Include procedure.
- Procedure MUST contain 4 to 8 useful steps.
- Every step needs a real title and description.
- Use STEP_1 through STEP_N.
- Do not return a placeholder.
- Do not return an empty steps array.
- Generate a dependency-aware workflow.
- For DOMICILE_CERTIFICATE specifically, include:
  service access, document preparation, submission,
  payment if applicable, verification/processing,
  and certificate issuance.

Use exactly the same JSON structure requested previously.
"""


# ============================================================
# GEMINI REQUEST
# ============================================================

def call_gemini(
    prompt,
):

    client = get_client()

    model_name = (
        get_gemini_model()
    )

    print(
        f"Gemini model being used: "
        f"{model_name}"
    )

    try:

        response = (
            client.models.generate_content(
                model=model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    temperature=0,
                    response_mime_type=
                        "application/json",
                ),
            )
        )

    except Exception as error:

        raise RuntimeError(
            f"Gemini API request failed: "
            f"{error}"
        ) from error

    response_text = getattr(
        response,
        "text",
        None,
    )

    if not response_text:

        raise RuntimeError(
            "Gemini response contained no text."
        )

    return response_text


# ============================================================
# GEMINI ANALYSIS
# ============================================================

def gemini_analyze_query(
    user_query,
    supported_tasks,
    supported_task_ids=None,
    aliases=None,
    task_name_lookup=None,
):

    if (
        supported_task_ids is None
    ):

        supported_task_ids = {
            str(
                task.get(
                    "task_id",
                    "",
                )
            ).strip().upper()
            for task in supported_tasks
            if task.get("task_id")
        }

    if aliases is None:
        aliases = {}

    if task_name_lookup is None:
        task_name_lookup = {}

    prompt = build_prompt(
        user_query=user_query,
        supported_tasks=supported_tasks,
    )

    response_text = call_gemini(
        prompt
    )

    result = extract_json(
        response_text
    )

    intent = normalize_task_id(
        result.get("intent"),
        supported_task_ids,
        aliases=aliases,
        task_name_lookup=
            task_name_lookup,
    )

    try:

        confidence = float(
            result.get(
                "confidence",
                0,
            )
        )

    except (
        TypeError,
        ValueError,
    ):

        confidence = 0.0

    confidence = max(
        0.0,
        min(
            1.0,
            confidence,
        )
    )

    entities = result.get(
        "entities"
    )

    if not isinstance(
        entities,
        dict,
    ):

        entities = {}

    procedure = None

    if (
        intent
        != "GENERAL_CIVIC_TASK"
    ):

        procedure = normalize_procedure(
            result.get(
                "procedure"
            ),
            fallback_task_id=
                intent,
        )

        # ----------------------------------------------------
        # RETRY ON INCOMPLETE PROCEDURE
        # ----------------------------------------------------

        if procedure is None:

            print(
                "Gemini returned an incomplete "
                "procedure. Retrying."
            )

            repair_prompt = (
                build_repair_prompt(
                    user_query=
                        user_query,
                    supported_tasks=
                        supported_tasks,
                )
            )

            repair_text = call_gemini(
                repair_prompt
            )

            repair_result = extract_json(
                repair_text
            )

            repaired_intent = normalize_task_id(
                repair_result.get(
                    "intent",
                    intent,
                ),
                supported_task_ids,
                aliases=aliases,
                task_name_lookup=
                    task_name_lookup,
            )

            repaired_procedure = (
                normalize_procedure(
                    repair_result.get(
                        "procedure"
                    ),
                    fallback_task_id=
                        repaired_intent,
                )
            )

            if repaired_procedure is None:

                raise RuntimeError(
                    "Gemini could not generate "
                    "a usable 4-8 step civic procedure."
                )

            result = repair_result
            intent = repaired_intent
            procedure = repaired_procedure

            try:

                confidence = float(
                    result.get(
                        "confidence",
                        confidence,
                    )
                )

            except (
                TypeError,
                ValueError,
            ):

                pass

            confidence = max(
                0.0,
                min(
                    1.0,
                    confidence,
                )
            )

            entities = result.get(
                "entities"
            )

            if not isinstance(
                entities,
                dict,
            ):

                entities = {}

    return {
        "query":
            result.get(
                "query"
            )
            or user_query,

        "normalized_query":
            result.get(
                "normalized_query"
            )
            or user_query.strip(),

        "intent":
            intent,

        "route":
            (
                "CUSTOM_FAST_PATH"
                if intent
                != "GENERAL_CIVIC_TASK"
                else "GENERIC_CIVIC_PATH"
            ),

        "location":
            result.get(
                "location"
            )
            or entities.get(
                "location"
            ),

        "location_scope":
            result.get(
                "location_scope"
            )
            or "MISSING",

        "entities": {
            "location":
                entities.get(
                    "location"
                ),

            "business_type":
                entities.get(
                    "business_type"
                ),

            "event_type":
                entities.get(
                    "event_type"
                ),

            "birth_subtype":
                entities.get(
                    "birth_subtype"
                ),

            "domicile_purpose":
                entities.get(
                    "domicile_purpose"
                ),
        },

        "confidence":
            confidence,

        "intent_source":
            "GEMINI",

        "custom_model_confidence":
            None,

        "status":
            result.get(
                "status"
            )
            or (
                "OUT_OF_SCOPE"
                if intent
                == "GENERAL_CIVIC_TASK"
                else "OK"
            ),

        "missing_fields":
            result.get(
                "missing_fields"
            )
            or [],

        "gemini_reason":
            result.get(
                "gemini_reason"
            )
            or result.get(
                "reason"
            ),

        "procedure":
            procedure,
    }


# ============================================================
# DIRECT PROCEDURE GENERATION
# ============================================================

def gemini_generate_procedure(
    task_id,
    user_query="",
    supported_tasks=None,
):

    task_id = str(
        task_id
    ).strip().upper()

    supported_tasks = (
        supported_tasks
        or [
            {
                "task_id":
                    task_id,

                "task_name":
                    task_id
                    .replace(
                        "_",
                        " ",
                    )
                    .title(),
            }
        ]
    )

    query = (
        user_query.strip()
        if user_query
        else
        f"Generate the complete procedure "
        f"for {task_id}."
    )

    supported_ids = {
        task_id
    }

    result = gemini_analyze_query(
        user_query=query,
        supported_tasks=
            supported_tasks,
        supported_task_ids=
            supported_ids,
        aliases={},
        task_name_lookup={},
    )

    procedure = result.get(
        "procedure"
    )

    if procedure is None:

        raise RuntimeError(
            "Gemini did not generate a usable procedure."
        )

    return procedure


# ============================================================
# BACKWARD COMPATIBILITY
# ============================================================

def gemini_intent_fallback(
    user_query,
    supported_tasks,
    supported_task_ids,
    aliases=None,
    task_name_lookup=None,
):

    result = gemini_analyze_query(
        user_query,
        supported_tasks,
        supported_task_ids,
        aliases,
        task_name_lookup,
    )

    return result["intent"]


def normalize_intent(
    raw_intent,
    supported_task_ids,
    aliases=None,
    task_name_lookup=None,
):

    return normalize_task_id(
        raw_intent,
        supported_task_ids,
        aliases,
        task_name_lookup,
    )
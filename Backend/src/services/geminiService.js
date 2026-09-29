import axios from "axios";

// ------------------------------------
// Build Gemini REST URL
// ------------------------------------
const getGeminiUrl = () => {
  const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";
  const apiKey = process.env.GEMINI_API_KEY;
  return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
};

// ------------------------------------
// Prompt template for civic procedure
// ------------------------------------
const buildPrompt = (userQuery) => `
You are a Maharashtra government services assistant.
The user needs help with: "${userQuery}"

Return ONLY a valid JSON object (no markdown, no explanation) describing the civic procedure.
Use this exact schema:

{
  "task_id": "SNAKE_CASE_IDENTIFIER",
  "task_name": "Human Readable Name",
  "category": "e.g. Personal documents",
  "jurisdiction": {
    "state": "Maharashtra",
    "district": null,
    "local_body": null
  },
  "department": {
    "name": "Department Name",
    "sub_department": null,
    "designated_officer": null,
    "office_type": null
  },
  "eligibility": ["Who can apply"],
  "steps": [
    {
      "step_id": "STEP_1",
      "title": "Step title",
      "description": "What to do in this step",
      "required_forms": [],
      "required_documents": ["Document 1", "Document 2"],
      "fees": {
        "amount": null,
        "currency": "INR",
        "payment_method": [],
        "notes": null
      },
      "office": {
        "department": "",
        "office_name": "Office name",
        "office_type": null,
        "location_rule": null
      },
      "prerequisites": [],
      "depends_on": [],
      "unlocks": ["STEP_2"],
      "can_run_in_parallel": false,
      "application": {
        "mode": ["offline"],
        "application_link": null
      },
      "time_limit_days": null,
      "official_sources": []
    }
  ],
  "status_options": ["NOT_STARTED", "IN_PROGRESS", "COMPLETED", "LOCKED"],
  "source_freshness": {
    "last_verified": "",
    "needs_review": true
  }
}

Rules:
- steps must have sequential step_ids: STEP_1, STEP_2, etc.
- Each step's depends_on should list the step_id of the previous step (except STEP_1).
- Each step's unlocks should list the step_id of the next step (except the last).
- Return ONLY the JSON object. No prose.
`;

// ------------------------------------
// Call Gemini and return parsed procedure
// ------------------------------------
const generateProcedureWithGemini = async (userQuery) => {
  const url = getGeminiUrl();
  const timeout = Number(process.env.GEMINI_TIMEOUT || 30000);

  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const payload = {
    contents: [
      {
        parts: [{ text: buildPrompt(userQuery) }],
      },
    ],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 4096,
    },
  };

  try {
    const response = await axios.post(url, payload, {
      timeout,
      headers: { "Content-Type": "application/json" },
    });

    const rawText =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Strip markdown fences if Gemini wraps the JSON
    const jsonText = rawText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();

    const parsed = JSON.parse(jsonText);

    if (!parsed.task_id || !Array.isArray(parsed.steps)) {
      throw new Error("Gemini response missing task_id or steps");
    }

    return parsed;
  } catch (error) {
    if (error.response) {
      console.error(
        "Gemini API error:",
        error.response.status,
        error.response.data
      );
      throw new Error(
        `Gemini API returned status ${error.response.status}`
      );
    }

    if (error.code === "ECONNABORTED") {
      throw new Error("Gemini request timed out");
    }

    console.error("Gemini service error:", error.message);
    throw new Error(error.message || "Gemini request failed");
  }
};

export { generateProcedureWithGemini };

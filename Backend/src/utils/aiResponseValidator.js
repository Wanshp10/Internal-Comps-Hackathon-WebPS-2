// ------------------------------------
// Basic helpers
// ------------------------------------
const isObject = (value) => {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value)
  );
};

const isNonEmptyString = (value) => {
  return (
    typeof value === "string" &&
    value.trim().length > 0
  );
};

// ------------------------------------
// Validate task-understanding response
// ------------------------------------
const validateTaskAnalysis = (data) => {
  const errors = [];

  if (!isObject(data)) {
    errors.push(
      "AI response must be a JSON object"
    );

    return {
      valid: false,
      errors,
    };
  }

  if (
    !isNonEmptyString(data.intent) &&
    !isNonEmptyString(data.task_id)
  ) {
    errors.push(
      "AI response must contain intent or task_id"
    );
  }

  if (
    data.confidence !== undefined &&
    data.confidence !== null
  ) {
    if (
      typeof data.confidence !== "number" ||
      data.confidence < 0 ||
      data.confidence > 1
    ) {
      errors.push(
        "confidence must be a number between 0 and 1"
      );
    }
  }

  if (
    data.entities !== undefined &&
    data.entities !== null &&
    !isObject(data.entities)
  ) {
    errors.push(
      "entities must be an object"
    );
  }

  if (
    data.missing_fields !== undefined &&
    !Array.isArray(data.missing_fields)
  ) {
    errors.push(
      "missing_fields must be an array"
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

// ------------------------------------
// Validate one civic procedure step
// ------------------------------------
const validateProcedureStep = (
  step,
  index
) => {
  const errors = [];

  if (!isObject(step)) {
    return [
      `steps[${index}] must be an object`,
    ];
  }

  if (!isNonEmptyString(step.step_id)) {
    errors.push(
      `steps[${index}].step_id is required`
    );
  }

  if (
    step.required_forms !== undefined &&
    !Array.isArray(step.required_forms)
  ) {
    errors.push(
      `steps[${index}].required_forms must be an array`
    );
  }

  if (
    step.required_documents !== undefined &&
    !Array.isArray(step.required_documents)
  ) {
    errors.push(
      `steps[${index}].required_documents must be an array`
    );
  }

  if (
    step.prerequisites !== undefined &&
    !Array.isArray(step.prerequisites)
  ) {
    errors.push(
      `steps[${index}].prerequisites must be an array`
    );
  }

  if (
    step.depends_on !== undefined &&
    !Array.isArray(step.depends_on)
  ) {
    errors.push(
      `steps[${index}].depends_on must be an array`
    );
  }

  if (
    step.unlocks !== undefined &&
    !Array.isArray(step.unlocks)
  ) {
    errors.push(
      `steps[${index}].unlocks must be an array`
    );
  }

  if (
    step.can_run_in_parallel !== undefined &&
    typeof step.can_run_in_parallel !==
      "boolean"
  ) {
    errors.push(
      `steps[${index}].can_run_in_parallel must be a boolean`
    );
  }

  if (
    step.fees !== undefined &&
    step.fees !== null &&
    !isObject(step.fees)
  ) {
    errors.push(
      `steps[${index}].fees must be an object`
    );
  }

  if (
    step.office !== undefined &&
    step.office !== null &&
    !isObject(step.office)
  ) {
    errors.push(
      `steps[${index}].office must be an object`
    );
  }

  if (
    step.application !== undefined &&
    step.application !== null &&
    !isObject(step.application)
  ) {
    errors.push(
      `steps[${index}].application must be an object`
    );
  }

  if (
    step.official_sources !== undefined &&
    !Array.isArray(step.official_sources)
  ) {
    errors.push(
      `steps[${index}].official_sources must be an array`
    );
  }

  return errors;
};

// ------------------------------------
// Validate full civic procedure response
// ------------------------------------
const validateCivicProcedure = (
  data
) => {
  const errors = [];

  if (!isObject(data)) {
    errors.push(
      "AI response must be a JSON object"
    );

    return {
      valid: false,
      errors,
    };
  }

  if (!isNonEmptyString(data.task_id)) {
    errors.push(
      "task_id is required for a civic procedure"
    );
  }

  if (!isNonEmptyString(data.task_name)) {
    errors.push(
      "task_name is required for a civic procedure"
    );
  }

  if (
    data.jurisdiction !== undefined &&
    data.jurisdiction !== null &&
    !isObject(data.jurisdiction)
  ) {
    errors.push(
      "jurisdiction must be an object"
    );
  }

  if (
    data.department !== undefined &&
    data.department !== null &&
    !isObject(data.department)
  ) {
    errors.push(
      "department must be an object"
    );
  }

  if (
    data.eligibility !== undefined &&
    !Array.isArray(data.eligibility)
  ) {
    errors.push(
      "eligibility must be an array"
    );
  }

  if (!Array.isArray(data.steps)) {
    errors.push(
      "steps must be an array"
    );
  } else {
    data.steps.forEach(
      (step, index) => {
        errors.push(
          ...validateProcedureStep(
            step,
            index
          )
        );
      }
    );
  }

  if (
    data.status_options !== undefined &&
    !Array.isArray(data.status_options)
  ) {
    errors.push(
      "status_options must be an array"
    );
  }

  if (
    data.source_freshness !== undefined &&
    data.source_freshness !== null &&
    !isObject(
      data.source_freshness
    )
  ) {
    errors.push(
      "source_freshness must be an object"
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

// ------------------------------------
// Detect response type
// ------------------------------------
const detectAIResponseType = (data) => {
  if (!isObject(data)) {
    return "INVALID";
  }

  // Full procedure response
  if (
    isNonEmptyString(data.task_id) &&
    Array.isArray(data.steps)
  ) {
    return "CIVIC_PROCEDURE";
  }

  // Task understanding response
  if (
    isNonEmptyString(data.intent) ||
    isNonEmptyString(data.task_id)
  ) {
    return "TASK_ANALYSIS";
  }

  return "INVALID";
};

// ------------------------------------
// Validate complete AI response
// ------------------------------------
const validateAIResponse = (data) => {
  const type =
    detectAIResponseType(data);

  if (type === "CIVIC_PROCEDURE") {
    return {
      type,
      ...validateCivicProcedure(
        data
      ),
    };
  }

  if (type === "TASK_ANALYSIS") {
    return {
      type,
      ...validateTaskAnalysis(
        data
      ),
    };
  }

  return {
    type: "INVALID",
    valid: false,
    errors: [
      "Unsupported AI response format",
    ],
  };
};

export {
  detectAIResponseType,
  validateTaskAnalysis,
  validateCivicProcedure,
  validateAIResponse,
};
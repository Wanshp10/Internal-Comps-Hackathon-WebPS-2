import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { askAssistant } from "../services/aiService.js";

const EXAMPLES = [
  "Birth certificate",
  "Domicile certificate",
  "I want to open a cafe in Pune",
  "Public event permission",
];

const UNSUPPORTED_MESSAGE =
  "This request is outside the supported civic services. Please describe a Maharashtra government or municipal service.";

const getMissingFieldMessage = (
  missingFields = [],
) => {
  if (!missingFields.length) {
    return "Some information is required before we can build your roadmap.";
  }

  const labels = {
    location: "location",
    business_type: "business type",
    event_type: "event type",
    birth_subtype: "birth registration type",
    domicile_purpose: "purpose",
  };

  const readableFields =
    missingFields.map(
      (field) =>
        labels[field] || field,
    );

  if (readableFields.length === 1) {
    return `Please provide your ${readableFields[0]} so we can build the roadmap.`;
  }

  return `Please provide the following information: ${readableFields.join(
    ", ",
  )}.`;
};

export default function Assistant() {
  const navigate = useNavigate();

  const [goal, setGoal] = useState("");
  const [reply, setReply] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();

    const query = goal.trim();

    if (!query || loading) {
      return;
    }

    setLoading(true);
    setReply("");
    setError("");

    try {
      const result =
        await askAssistant(query);

      if (
        !result ||
        typeof result !== "object"
      ) {
        throw new Error(
          "Invalid response received from the backend.",
        );
      }

      if (!result.success) {
        throw new Error(
          result.message ||
            "Unable to analyze your request.",
        );
      }

      const data = result.data;

      if (
        !data ||
        typeof data !== "object"
      ) {
        throw new Error(
          "The backend returned an incomplete response.",
        );
      }

      const analysis =
        data.analysis ||
        data.task ||
        data.rawAIResponse ||
        {};

      const intent =
        analysis.intent ||
        data.task?.intent ||
        "";

      const status =
        analysis.status ||
        analysis.analysisStatus ||
        data.task?.analysisStatus ||
        "";

      const missingFields =
        analysis.missing_fields ||
        analysis.missingFields ||
        data.task?.missingFields ||
        [];

      const location =
        analysis.location ||
        data.task?.location ||
        "";

      // ------------------------------------------------------
      // UNSUPPORTED REQUEST
      // ------------------------------------------------------

      if (
        intent === "GENERAL_CIVIC_TASK" ||
        status === "OUT_OF_SCOPE"
      ) {
        setError(
          UNSUPPORTED_MESSAGE,
        );
        return;
      }

      // ------------------------------------------------------
      // MISSING INFORMATION
      // ------------------------------------------------------

      if (
        status === "NEEDS_INFO" ||
        missingFields.length > 0
      ) {
        setError(
          getMissingFieldMessage(
            missingFields,
          ),
        );
        return;
      }

      // ------------------------------------------------------
      // ROADMAP ID
      // ------------------------------------------------------

      const roadmapId =
        data.roadmapId ||
        data.roadmap?._id ||
        data.roadmap?.roadmapId;

      if (!roadmapId) {
        throw new Error(
          "The backend analyzed the request but did not return a roadmap.",
        );
      }

      // ------------------------------------------------------
      // SUCCESS
      // ------------------------------------------------------

      setReply(
        `Identified ${
          intent || "your civic task"
        }${
          location
            ? ` in ${location}`
            : ""
        }. Your roadmap is ready.`,
      );

      navigate(
        `/roadmap/${roadmapId}`,
        {
          state: {
            taskId:
              data.taskId ||
              data.task?._id ||
              null,

            procedureId:
              data.procedureId ||
              data.procedure?._id ||
              null,

            roadmapId,

            analysis,

            query,
          },
        },
      );
    } catch (requestError) {
      console.error(
        "Assistant request failed:",
        requestError,
      );

      let message =
        requestError?.message ||
        "Could not connect to the backend.";

      // ------------------------------------------------------
      // FRIENDLY HTTP ERROR MESSAGES
      // ------------------------------------------------------

      if (
        requestError?.status === 404
      ) {
        message =
          "The requested service endpoint was not found. Please restart the backend and try again.";
      } else if (
        requestError?.status === 500
      ) {
        message =
          "The civic service could not be processed by the backend. Please try again.";
      } else if (
        requestError?.status === 502 ||
        requestError?.status === 503 ||
        requestError?.status === 504
      ) {
        message =
          "The civic service is taking too long to respond. Please try again.";
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const useExample = (example) => {
    setGoal(example);
    setReply("");
    setError("");
  };

  return (
    <main className="page">
      <div className="container">
        <header className="page-heading">
          <div className="eyebrow">
            Guided service finder
          </div>

          <h1>
            What do you need help with?
          </h1>

          <p>
            Describe your goal. SevaRoute
            identifies the civic task,
            retrieves the relevant procedure,
            and builds a dependency-aware
            roadmap.
          </p>
        </header>

        <div className="two-column">
          <section className="surface">
            <form onSubmit={submit}>
              <label
                className="field-label"
                htmlFor="goal"
              >
                Describe your goal
              </label>

              <textarea
                id="goal"
                value={goal}
                onChange={(event) => {
                  setGoal(
                    event.target.value,
                  );
                  setReply("");
                  setError("");
                }}
                placeholder="For example: I want to open a cafe in Pune."
                required
                disabled={loading}
              />

              <button
                className="btn btn-primary"
                type="submit"
                disabled={
                  loading ||
                  !goal.trim()
                }
              >
                {loading
                  ? "Building your roadmap…"
                  : "Find a matching service →"}
              </button>
            </form>

            <div className="chips">
              {EXAMPLES.map(
                (example) => (
                  <button
                    className="chip"
                    type="button"
                    key={example}
                    onClick={() =>
                      useExample(
                        example,
                      )
                    }
                    disabled={loading}
                  >
                    {example}
                  </button>
                ),
              )}
            </div>

            {loading && (
              <div
                className="assistant-reply"
                role="status"
                aria-live="polite"
              >
                <b>
                  Preparing your roadmap
                </b>

                <p>
                  Understanding your request
                  and retrieving the relevant
                  civic procedure…
                </p>
              </div>
            )}

            {reply &&
              !loading && (
                <div
                  className="assistant-reply"
                  role="status"
                  aria-live="polite"
                >
                  <b>
                    Assistant response
                  </b>

                  <p>{reply}</p>
                </div>
              )}

            {error &&
              !loading && (
                <div
                  className="assistant-reply"
                  role="alert"
                >
                  <b>
                    Unable to continue
                  </b>

                  <p>{error}</p>
                </div>
              )}
          </section>

          <aside className="surface">
            <div className="eyebrow">
              What you get
            </div>

            <h2 className="serif-heading">
              A practical next-step guide
            </h2>

            {[
              [
                "Eligibility",
                "Relevant eligibility information for the selected civic procedure.",
              ],
              [
                "Documents",
                "Required documents and forms for each step.",
              ],
              [
                "Department",
                "The department or office responsible for the step.",
              ],
              [
                "Roadmap",
                "A dependency-aware sequence showing what unlocks what.",
              ],
            ].map(
              ([heading, text], index) => (
                <div
                  className="info-row"
                  key={heading}
                >
                  <span>
                    {index + 1}
                  </span>

                  <div>
                    <b>{heading}</b>
                    <p>{text}</p>
                  </div>
                </div>
              ),
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}
function StepDetails({ step, onClose, onStatusChange }) {
  if (!step) {
    return (
      <aside className="step-details step-details--empty">
        <p>Select a step from the roadmap to view its details.</p>
      </aside>
    );
  }

  const {
    title,
    description,
    status,
    requiredForms,
    requiredDocuments,
    fees,
    office,
    prerequisites,
    dependsOn,
    application,
    timeLimitDays,
    officialSources,
  } = step;

  return (
    <aside className="step-details">
      <div className="step-details__header">
        <div>
          <p className="step-details__step-id">{step.stepId}</p>

          <h2>{title || "Untitled Step"}</h2>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="step-details__close"
          >
            ×
          </button>
        )}
      </div>

      <div className="step-details__status">
        <strong>Status:</strong> {status.replace("_", " ")}
      </div>

      {description && (
        <section>
          <h3>Description</h3>
          <p>{description}</p>
        </section>
      )}

      {dependsOn?.length > 0 && (
        <section>
          <h3>Prerequisite Steps</h3>

          <ul>
            {dependsOn.map((dependency) => (
              <li key={dependency}>{dependency}</li>
            ))}
          </ul>
        </section>
      )}

      {prerequisites?.length > 0 && (
        <section>
          <h3>Prerequisites</h3>

          <ul>
            {prerequisites.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </section>
      )}

      {requiredDocuments?.length > 0 && (
        <section>
          <h3>Required Documents</h3>

          <ul>
            {requiredDocuments.map((document, index) => (
              <li key={index}>
                {typeof document === "string"
                  ? document
                  : JSON.stringify(document)}
              </li>
            ))}
          </ul>
        </section>
      )}

      {requiredForms?.length > 0 && (
        <section>
          <h3>Required Forms</h3>

          <ul>
            {requiredForms.map((form, index) => (
              <li key={index}>
                {typeof form === "string" ? form : JSON.stringify(form)}
              </li>
            ))}
          </ul>
        </section>
      )}

      {office && (
        <section>
          <h3>Office</h3>

          {office.department && (
            <p>
              <strong>Department:</strong> {office.department}
            </p>
          )}

          {office.office_name && (
            <p>
              <strong>Office:</strong> {office.office_name}
            </p>
          )}

          {office.office_type && (
            <p>
              <strong>Type:</strong> {office.office_type}
            </p>
          )}

          {office.location_rule && (
            <p>
              <strong>Location:</strong> {office.location_rule}
            </p>
          )}
        </section>
      )}

      {fees && (
        <section>
          <h3>Fee</h3>

          <p>
            {fees.amount !== null && fees.amount !== undefined
              ? `${fees.currency || "INR"} ${fees.amount}`
              : "Not specified"}
          </p>

          {fees.payment_method?.length > 0 && (
            <p>
              <strong>Payment:</strong> {fees.payment_method.join(", ")}
            </p>
          )}

          {fees.notes && <p>{fees.notes}</p>}
        </section>
      )}

      {timeLimitDays && (
        <section>
          <h3>Time Limit</h3>

          <p>
            {timeLimitDays} day
            {timeLimitDays === 1 ? "" : "s"}
          </p>
        </section>
      )}

      {application && (
        <section>
          <h3>Application</h3>

          {application.mode?.length > 0 && (
            <p>
              <strong>Mode:</strong> {application.mode.join(", ")}
            </p>
          )}

          {application.application_link && (
            <a
              href={application.application_link}
              target="_blank"
              rel="noreferrer"
              className="step-details__link"
            >
              Open Official Application Portal
            </a>
          )}
        </section>
      )}

      {officialSources?.length > 0 && (
        <section>
          <h3>Official Sources</h3>

          {officialSources.map((source, index) => (
            <div key={index} className="step-details__source">
              <strong>{source.source_title || "Official Source"}</strong>

              {source.authority && <p>{source.authority}</p>}

              {source.last_verified && (
                <p>Last verified: {source.last_verified}</p>
              )}

              {source.source_url && (
                <a
                  href={source.source_url}
                  target="_blank"
                  rel="noreferrer"
                  className="step-details__link"
                >
                  View Source
                </a>
              )}
            </div>
          ))}
        </section>
      )}

      {onStatusChange && status !== "LOCKED" && (
        <section className="step-details__actions">
          <h3>Update Progress</h3>

          <div className="step-details__buttons">
            <button type="button" onClick={() => onStatusChange("NOT_STARTED")}>
              Not Started
            </button>

            <button type="button" onClick={() => onStatusChange("IN_PROGRESS")}>
              In Progress
            </button>

            <button type="button" onClick={() => onStatusChange("COMPLETED")}>
              Completed
            </button>
          </div>
        </section>
      )}
    </aside>
  );
}

export default StepDetails;

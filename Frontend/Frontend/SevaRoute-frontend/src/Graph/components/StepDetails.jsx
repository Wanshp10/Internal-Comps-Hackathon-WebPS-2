import "./StepDetails.css";

function DetailList({ items }) {
  if (!items?.length) return null;

  return (
    <ul className="step-details__list">
      {items.map((item, index) => (
        <li key={index}>
          <span className="detail-list-dot" />
          <span>
            {typeof item === "string" ? item : JSON.stringify(item)}
          </span>
        </li>
      ))}
    </ul>
  );
}

function StepDetails({ step, onClose, onStatusChange }) {
  if (!step) {
    return (
      <aside className="step-details step-details--empty">
        <div className="step-details__empty-icon">↗</div>
        <strong>Select a step</strong>
        <p>
          Choose a node on the roadmap to see documents, forms, office
          information, dependencies, fees, and official links.
        </p>
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

  const statusLabel = status.replaceAll("_", " ");

  return (
    <aside className="step-details">
      <div className="step-details__header">
        <div>
          <p className="step-details__step-id">{step.stepId}</p>
          <h2>{title || "Untitled Step"}</h2>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="step-details__close"
          aria-label="Close step details"
        >
          ×
        </button>
      </div>

      <div className={`step-details__status step-details__status--${status.toLowerCase()}`}>
        <span className="step-details__status-dot" />
        <span>{statusLabel}</span>
      </div>

      {description && (
        <section className="step-details__section step-details__section--intro">
          <span className="step-details__section-label">What happens here</span>
          <p>{description}</p>
        </section>
      )}

      {dependsOn?.length > 0 && (
        <section className="step-details__section">
          <h3>Depends on</h3>
          <DetailList items={dependsOn} />
        </section>
      )}

      {prerequisites?.length > 0 && (
        <section className="step-details__section">
          <h3>Prerequisites</h3>
          <DetailList items={prerequisites} />
        </section>
      )}

      {requiredDocuments?.length > 0 && (
        <section className="step-details__section">
          <h3>Required documents</h3>
          <DetailList items={requiredDocuments} />
        </section>
      )}

      {requiredForms?.length > 0 && (
        <section className="step-details__section">
          <h3>Required forms</h3>
          <DetailList items={requiredForms} />
        </section>
      )}

      {office && (office.department || office.office_name || office.office_type || office.location_rule) && (
        <section className="step-details__section">
          <h3>Where to complete it</h3>
          <div className="detail-card">
            {office.department && (
              <div>
                <span>Department</span>
                <strong>{office.department}</strong>
              </div>
            )}
            {office.office_name && (
              <div>
                <span>Office</span>
                <strong>{office.office_name}</strong>
              </div>
            )}
            {office.office_type && (
              <div>
                <span>Office type</span>
                <strong>{office.office_type}</strong>
              </div>
            )}
            {office.location_rule && (
              <div>
                <span>Location</span>
                <strong>{office.location_rule}</strong>
              </div>
            )}
          </div>
        </section>
      )}

      {fees && (
        <section className="step-details__section">
          <h3>Fee</h3>
          <div className="detail-card detail-card--compact">
            <strong>
              {fees.amount !== null && fees.amount !== undefined
                ? `${fees.currency || "INR"} ${fees.amount}`
                : "Not specified"}
            </strong>

            {fees.payment_method?.length > 0 && (
              <span>{fees.payment_method.join(" · ")}</span>
            )}

            {fees.notes && <span>{fees.notes}</span>}
          </div>
        </section>
      )}

      {timeLimitDays && (
        <section className="step-details__section">
          <h3>Typical time limit</h3>
          <p>{timeLimitDays} day{timeLimitDays === 1 ? "" : "s"}</p>
        </section>
      )}

      {application && (
        <section className="step-details__section">
          <h3>Application</h3>

          {application.mode?.length > 0 && (
            <p className="step-details__muted">
              <strong>Mode:</strong> {application.mode.join(", ")}
            </p>
          )}

          {application.application_link && (
            <a
              href={application.application_link}
              target="_blank"
              rel="noreferrer"
              className="step-details__official-link"
            >
              Open official application portal
              <span>↗</span>
            </a>
          )}
        </section>
      )}

      {officialSources?.length > 0 && (
        <section className="step-details__section">
          <div className="step-details__source-heading">
            <div>
              <h3>Official sources</h3>
              <span>Verify before applying</span>
            </div>
          </div>

          <div className="step-details__sources">
            {officialSources.map((source, index) => (
              <a
                href={source.source_url || "#"}
                target="_blank"
                rel="noreferrer"
                key={index}
                className="source-card"
              >
                <span className="source-card__icon">↗</span>
                <span>
                  <strong>{source.source_title || "Official source"}</strong>
                  {source.authority && <small>{source.authority}</small>}
                  {source.last_verified && (
                    <small>Verified {source.last_verified}</small>
                  )}
                </span>
              </a>
            ))}
          </div>
        </section>
      )}

      {onStatusChange && status !== "LOCKED" && (
        <section className="step-details__section step-details__actions">
          <div>
            <h3>Update progress</h3>
            <p className="step-details__muted">
              Mark this step as you work through the service.
            </p>
          </div>

          <div className="step-details__buttons">
            {[
              ["NOT_STARTED", "Not started"],
              ["IN_PROGRESS", "In progress"],
              ["COMPLETED", "Completed"],
            ].map(([value, label]) => (
              <button
                type="button"
                key={value}
                className={status === value ? "is-selected" : ""}
                onClick={() => onStatusChange(value)}
              >
                <span>{value === "COMPLETED" ? "✓" : value === "IN_PROGRESS" ? "•" : "○"}</span>
                {label}
              </button>
            ))}
          </div>
        </section>
      )}
    </aside>
  );
}

export default StepDetails;

export const initialTasks = [
  {
    id: "birth-certificate", title: "Birth Certificate", category: "Personal documents",
    summary: "Understand how to request a birth certificate or certified copy.",
    department: "Municipal Corporation / Registrar of Births and Deaths",
    eligibility: "Parent, guardian, or the person named in the record; requirements vary by state.",
    fee: "Varies by local authority; late registration may involve additional fees.",
    duration: "Depends on record availability and local processing time.",
    documents: ["Proof of birth or hospital record", "Parent/guardian identity proof", "Address proof", "Existing registration details, if available"],
    steps: ["Check whether the birth is already registered.", "Collect identity and birth records.", "Contact the local Registrar or use the official state portal.", "Submit the application and any applicable fee.", "Track the request and collect/download the certificate."],
    sources: [{ label: "India government services portal", url: "https://services.india.gov.in/" }, { label: "Civil Registration System", url: "https://crsorgi.gov.in/" }]
  },
  {
    id: "domicile-certificate", title: "Domicile Certificate", category: "Personal documents",
    summary: "Find common steps for applying for proof of domicile or residence status.",
    department: "State Revenue Department / Tehsil or local service centre",
    eligibility: "Applicants who meet the domicile/residence rules of their state.",
    fee: "State-specific; confirm on the official portal.",
    duration: "Varies by state and verification requirements.",
    documents: ["Identity proof", "Address/residence proof", "Birth or school record, if required", "Photograph and application form"],
    steps: ["Review your state's domicile eligibility rules.", "Prepare identity, residence, and supporting records.", "Apply through the state portal or designated office.", "Complete any verification requested.", "Check status and download/collect the certificate."],
    sources: [{ label: "India government services portal", url: "https://services.india.gov.in/" }, { label: "India.gov.in", url: "https://www.india.gov.in/" }]
  },
  {
    id: "small-business", title: "Register a Small Business", category: "Business & finance",
    summary: "Explore common registration steps and official resources for starting a small business.",
    department: "Depends on business structure; relevant state and central departments",
    eligibility: "Depends on business type, legal structure, and applicable registrations.",
    fee: "Depends on the registration and business structure selected.",
    duration: "Varies by registration and verification.",
    documents: ["Applicant identity and address proof", "Business address details", "Business name and structure details", "PAN and other records, where applicable"],
    steps: ["Choose a suitable business structure and check requirements.", "Gather identity, address, and business details.", "Use the relevant official registration portal.", "Complete the form and pay any applicable fee.", "Save acknowledgement numbers and complete follow-up registrations."],
    sources: [{ label: "Udyam Registration (MSME)", url: "https://udyamregistration.gov.in/" }, { label: "National Single Window System", url: "https://www.nsws.gov.in/" }]
  },
  {
    id: "income-certificate", title: "Income Certificate", category: "Personal documents",
    summary: "Learn the common application path for an income certificate.",
    department: "State Revenue Department / Tehsil or designated service centre",
    eligibility: "Applicants who need income certification and meet their state's rules.",
    fee: "State-specific; verify before applying.",
    duration: "Varies based on local verification.",
    documents: ["Identity proof", "Address proof", "Income evidence", "Self-declaration or application form, if required"],
    steps: ["Check the purpose and eligibility rules for your state.", "Collect identity, residence, and income documents.", "Apply through the official state portal or designated office.", "Respond to verification requests, if any.", "Track the application and download/collect the certificate."],
    sources: [{ label: "India government services portal", url: "https://services.india.gov.in/" }]
  },
  {
    id: "senior-citizen", title: "Senior Citizen Certificate", category: "Personal documents",
    summary: "Check common steps for obtaining a senior citizen certificate or related document.",
    department: "State Social Welfare Department / local administration",
    eligibility: "Age and residence criteria are set by the relevant state or local authority.",
    fee: "May be free or subject to local charges; verify with the authority.",
    duration: "Varies by local process.",
    documents: ["Age proof", "Identity proof", "Address proof", "Photograph, if requested"],
    steps: ["Check your state's age and residence criteria.", "Prepare age, identity, and address proofs.", "Submit through the designated portal or office.", "Complete verification if required.", "Track the request and collect the certificate."],
    sources: [{ label: "India government services portal", url: "https://services.india.gov.in/" }]
  },
  {
    id: "event-permission", title: "Public Event Permission", category: "Community & events",
    summary: "Identify common approvals that may apply to a public event.",
    department: "Local municipal authority, police, and other departments as applicable",
    eligibility: "Event organizers; permissions depend on venue, crowd size, timing, and event type.",
    fee: "Depends on venue and permissions required.",
    duration: "Apply well in advance; timelines vary by local authority.",
    documents: ["Organizer identity and contact details", "Venue permission or booking", "Event schedule and expected attendance", "Safety, traffic, or sound plan where required"],
    steps: ["Describe the event, venue, date, and expected attendance.", "Ask the local authority which permissions apply.", "Prepare venue, safety, and organizer documents.", "Submit applications to relevant departments.", "Keep written approvals and follow issued conditions."],
    sources: [{ label: "India government services portal", url: "https://services.india.gov.in/" }]
  }
];
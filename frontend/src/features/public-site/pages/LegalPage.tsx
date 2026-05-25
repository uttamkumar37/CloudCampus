import { Link } from 'react-router-dom';

type LegalDocument = {
  title: string;
  eyebrow: string;
  summary: string;
  updated: string;
  sections: Array<{
    heading: string;
    body: string[];
  }>;
};

const legalDocuments = {
  privacy: {
    eyebrow: 'Privacy Policy',
    title: 'CloudCampus Privacy Policy',
    summary:
      'How CloudCampus collects, uses, protects, and shares information for school pilots, demos, and platform operations.',
    updated: 'May 25, 2026',
    sections: [
      {
        heading: '1. Scope',
        body: [
          'This Privacy Policy applies to CloudCampus websites, demo environments, pilot environments, and role-based school portals operated by CloudCampus.',
          'Customer schools remain responsible for deciding what student, parent, staff, academic, fee, attendance, and communication data is entered into the platform.',
        ],
      },
      {
        heading: '2. Information We Process',
        body: [
          'Account information may include names, email addresses, phone numbers, role assignments, login identifiers, and authentication events.',
          'School operational data may include students, parents, staff, classes, sections, subjects, attendance, notices, homework, assignments, fees, exams, results, documents, audit logs, and support records.',
          'Technical data may include IP address, device details, browser information, request logs, error logs, rate-limit events, and security audit metadata.',
        ],
      },
      {
        heading: '3. How We Use Data',
        body: [
          'We use data to provide school operations, role-based portals, support, authentication, security monitoring, backups, auditability, billing support, and product reliability.',
          'We do not sell student, parent, staff, or school operational data.',
          'We use aggregated or de-identified operational metrics to improve reliability, performance, and product quality.',
        ],
      },
      {
        heading: '4. Security Controls',
        body: [
          'CloudCampus uses role-based access controls, tenant isolation, password hashing, audit logs, rate limits, encrypted backups, and operational monitoring.',
          'Access to production data is limited to authorized personnel with a support or security need.',
          'Security incidents should be reported to security@cloudcampus.io.',
        ],
      },
      {
        heading: '5. Retention and Deletion',
        body: [
          'Customer data is retained while the school uses CloudCampus, unless a separate agreement or legal requirement requires a different period.',
          'Schools may request export, correction, or deletion of their data through their CloudCampus contact or support channel.',
          'Backups may retain deleted data for a limited operational recovery window before normal backup expiry.',
        ],
      },
      {
        heading: '6. Subprocessors and Transfers',
        body: [
          'CloudCampus may use infrastructure, email, storage, monitoring, payment, and messaging providers to operate the service.',
          'Customer data is shared with subprocessors only as needed to deliver, secure, monitor, or support the platform.',
        ],
      },
      {
        heading: '7. Contact',
        body: [
          'For privacy questions, data requests, or school-pilot privacy review, contact privacy@cloudcampus.io.',
          'This policy is intended for controlled pilots and should be reviewed by counsel before broad commercial rollout.',
        ],
      },
    ],
  },
  terms: {
    eyebrow: 'Terms of Service',
    title: 'CloudCampus Terms of Service',
    summary:
      'The basic terms for accessing CloudCampus demos, pilots, public website tools, and role-based school portals.',
    updated: 'May 25, 2026',
    sections: [
      {
        heading: '1. Acceptance',
        body: [
          'By accessing CloudCampus, you agree to use the platform only for authorized school, demo, pilot, evaluation, or administrative purposes.',
          'If you use CloudCampus for a school or organization, you represent that you are authorized to accept these terms for that organization.',
        ],
      },
      {
        heading: '2. Authorized Use',
        body: [
          'Users must keep credentials confidential, use only their assigned role, and avoid accessing data that does not belong to their school, tenant, child, class, or authorized workflow.',
          'Users must not attempt to bypass authentication, rate limits, tenant isolation, audit logging, or security controls.',
        ],
      },
      {
        heading: '3. Customer Responsibilities',
        body: [
          'Schools are responsible for the accuracy, legality, and permissions for data they upload or enter into CloudCampus.',
          'Schools are responsible for notifying parents, students, staff, and guardians about platform use where required by law or policy.',
          'Schools must not upload prohibited content, malware, unlawful records, or data they are not authorized to process.',
        ],
      },
      {
        heading: '4. Payments and Communications',
        body: [
          'Payment, messaging, WhatsApp, SMS, email, and third-party services may be subject to provider rules, pass-through fees, and availability limits.',
          'Pilot environments may use test-mode payment flows and must not be represented as production payment settlement unless expressly agreed.',
        ],
      },
      {
        heading: '5. Availability and Changes',
        body: [
          'CloudCampus may update features, security controls, integrations, and user interfaces to improve reliability, compliance, and product quality.',
          'Pilot access may be suspended for security, misuse, non-payment, or operational risk.',
        ],
      },
      {
        heading: '6. Limitation',
        body: [
          'CloudCampus is provided for school operations and pilot evaluation. It is not a substitute for professional legal, accounting, tax, health, or regulatory advice.',
          'Production commercial terms, support SLAs, warranties, and liability caps should be captured in a signed customer agreement.',
        ],
      },
      {
        heading: '7. Contact',
        body: [
          'For commercial, support, or terms questions, contact hello@cloudcampus.io.',
          'These terms are intended for controlled pilots and should be reviewed by counsel before broad commercial rollout.',
        ],
      },
    ],
  },
  dpa: {
    eyebrow: 'Data Processing Addendum',
    title: 'CloudCampus Data Processing Addendum',
    summary:
      'A pilot-ready data processing framework for schools using CloudCampus with student, parent, staff, and operational data.',
    updated: 'May 25, 2026',
    sections: [
      {
        heading: '1. Roles',
        body: [
          'The school is the data controller or equivalent decision-maker for school records entered into CloudCampus.',
          'CloudCampus acts as a processor or service provider for customer data, processing it only to provide, secure, support, and improve the service.',
        ],
      },
      {
        heading: '2. Processing Instructions',
        body: [
          'CloudCampus processes customer data according to the school agreement, administrator configuration, user actions, documented support requests, and applicable law.',
          'If CloudCampus believes an instruction creates a security, privacy, or legal risk, CloudCampus may pause the instruction and request clarification.',
        ],
      },
      {
        heading: '3. Categories of Data',
        body: [
          'Customer data may include student records, parent or guardian records, staff records, academic records, attendance, fee information, notices, documents, communication logs, audit logs, and support metadata.',
          'Schools should avoid uploading unnecessary sensitive data and should configure access according to least privilege.',
        ],
      },
      {
        heading: '4. Confidentiality and Security',
        body: [
          'CloudCampus personnel and subprocessors with access to customer data must protect it as confidential.',
          'CloudCampus maintains technical and organizational measures including access controls, tenant isolation, audit logs, backups, monitoring, and incident response practices.',
        ],
      },
      {
        heading: '5. Subprocessors',
        body: [
          'CloudCampus may use subprocessors for hosting, storage, email, monitoring, messaging, support, payments, and security operations.',
          'CloudCampus remains responsible for subprocessors used to deliver the service and will require appropriate confidentiality and security obligations.',
        ],
      },
      {
        heading: '6. Assistance and Requests',
        body: [
          'CloudCampus will provide reasonable assistance for data export, correction, deletion, access requests, security reviews, and incident investigation, subject to technical feasibility and the customer agreement.',
          'Customer-facing export endpoints are part of the paid-readiness roadmap; until then, exports may be handled through an agreed support process.',
        ],
      },
      {
        heading: '7. Return and Deletion',
        body: [
          'At termination, CloudCampus will return or delete customer data according to the customer agreement and applicable law.',
          'Residual copies may remain in encrypted backups until normal backup expiry.',
          'This addendum is intended for controlled pilots and should be reviewed by counsel before broad commercial rollout.',
        ],
      },
    ],
  },
} satisfies Record<string, LegalDocument>;

type LegalPageProps = {
  documentType: keyof typeof legalDocuments;
};

export function LegalPage({ documentType }: LegalPageProps) {
  const document = legalDocuments[documentType];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-sm font-black text-white">
              CC
            </span>
            <span className="text-lg font-black">CloudCampus</span>
          </Link>
          <nav className="flex flex-wrap gap-2 text-sm font-bold">
            <Link to="/privacy" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-slate-700 hover:border-cyan-300 hover:text-cyan-700">
              Privacy
            </Link>
            <Link to="/terms" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-slate-700 hover:border-cyan-300 hover:text-cyan-700">
              Terms
            </Link>
            <Link to="/dpa" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-slate-700 hover:border-cyan-300 hover:text-cyan-700">
              DPA
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-5 py-14 sm:px-8">
        <p className="text-sm font-black uppercase tracking-widest text-cyan-700">{document.eyebrow}</p>
        <h1 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">{document.title}</h1>
        <p className="mt-4 text-base font-semibold text-slate-500">Last updated: {document.updated}</p>
        <p className="mt-6 text-lg leading-8 text-slate-700">{document.summary}</p>

        <div className="mt-10 grid gap-6">
          {document.sections.map((section) => (
            <section key={section.heading} className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-black text-slate-950">{section.heading}</h2>
              <div className="mt-4 grid gap-3">
                {section.body.map((paragraph) => (
                  <p key={paragraph} className="text-sm leading-7 text-slate-600">
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white px-5 py-8 text-sm text-slate-500 sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p>Copyright © 2026 CloudCampus. All rights reserved.</p>
          <Link to="/" className="font-bold text-cyan-700 hover:text-slate-950">
            Back to CloudCampus
          </Link>
        </div>
      </footer>
    </div>
  );
}

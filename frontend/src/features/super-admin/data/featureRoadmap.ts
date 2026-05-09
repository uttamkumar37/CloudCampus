export type FeatureStatus = 'completed' | 'in-progress' | 'planned'

export interface FeatureRoadmapItem {
  name: string
  description: string
  status: FeatureStatus
}

export interface FeatureRoadmapGroup {
  title: string
  summary: string
  items: FeatureRoadmapItem[]
}

export const featureRoadmap: FeatureRoadmapGroup[] = [
  {
    title: 'Admissions',
    summary: 'Recruitment, onboarding, and conversion workflows for new students.',
    items: [
      { name: 'Online admission application form', description: 'Collect applications from parents with structured intake fields.', status: 'completed' },
      { name: 'Admission lead pipeline with stages', description: 'Track every prospect from enquiry to enrolled.', status: 'completed' },
      { name: 'Document upload for admissions', description: 'Accept identity, transfer, and eligibility documents.', status: 'completed' },
      { name: 'Seat availability by class and section', description: 'Show live capacity during intake and approval.', status: 'completed' },
      { name: 'Admission approval workflow', description: 'Route each application through review and verification.', status: 'completed' },
      { name: 'Auto-generated student ID cards', description: 'Produce identity cards immediately after enrollment.', status: 'completed' },
      { name: 'QR-coded student ID cards', description: 'Support attendance and quick verification via QR scan.', status: 'completed' },
      { name: 'Student onboarding checklist', description: 'Track every setup task before a student starts classes.', status: 'completed' },
      { name: 'Parent/KYC verification workflow', description: 'Validate guardian identity and contact details.', status: 'completed' },
      { name: 'Admission fee collection at signup', description: 'Collect initial fees when a seat is confirmed.', status: 'completed' },
    ],
  },
  {
    title: 'Communication',
    summary: 'Broadcasts, reminders, and two-way parent engagement tools.',
    items: [
      { name: 'SMS notification system', description: 'Send urgent updates and reminders by text message.', status: 'completed' },
      { name: 'WhatsApp notification integration', description: 'Deliver high-open-rate alerts through WhatsApp.', status: 'completed' },
      { name: 'Email announcement campaigns', description: 'Send polished announcements to groups and segments.', status: 'completed' },
      { name: 'Push notifications for mobile app', description: 'Reach users instantly on their phones.', status: 'completed' },
      { name: 'Scheduled reminder engine', description: 'Automate fee, exam, and event reminders.', status: 'completed' },
      { name: 'Emergency broadcast alerts', description: 'Push critical alerts to all or selected stakeholders.', status: 'completed' },
      { name: 'Parent communication inbox', description: 'Centralize messages and replies from parents.', status: 'completed' },
      { name: 'Teacher communication inbox', description: 'Centralize staff notifications and internal messages.', status: 'completed' },
      { name: 'Notice board for all roles', description: 'Publish role-aware notices in one place.', status: 'completed' },
      { name: 'Read-receipt tracking for notices', description: 'Confirm who has seen a notice or alert.', status: 'planned' },
    ],
  },
  {
    title: 'Staff Operations',
    summary: 'Tools for managing teachers, staff records, and payroll processes.',
    items: [
      { name: 'Staff leave management', description: 'Request, approve, and track staff leave.', status: 'completed' },
      { name: 'Teacher attendance tracking', description: 'Record daily staff attendance and punctuality.', status: 'completed' },
      { name: 'Substitute teacher assignment', description: 'Fill class gaps when a teacher is absent.', status: 'completed' },
      { name: 'Staff payroll generation', description: 'Create monthly payroll records for employees.', status: 'completed' },
      { name: 'Salary slip downloads', description: 'Generate secure salary slips for staff members.', status: 'completed' },
      { name: 'Department-wise staff structure', description: 'Organize staff by departments and reporting lines.', status: 'completed' },
      { name: 'Staff document storage', description: 'Store contracts, certificates, and HR records.', status: 'completed' },
      { name: 'Staff appraisal notes', description: 'Maintain performance and review notes.', status: 'completed' },
      { name: 'Teacher workload dashboard', description: 'Track teaching load and assigned responsibilities.', status: 'completed' },
      { name: 'Contract expiry alerts', description: 'Warn admins before staff contracts expire.', status: 'completed' },
    ],
  },
  {
    title: 'Academics',
    summary: 'Planning, curriculum, tests, and academic progress management.',
    items: [
      { name: 'Lesson plan builder', description: 'Prepare daily and weekly teaching plans.', status: 'completed' },
      { name: 'Curriculum mapping by subject', description: 'Map subjects to term-wise learning goals.', status: 'completed' },
      { name: 'Chapter completion tracker', description: 'Track lesson progress against syllabus coverage.', status: 'completed' },
      { name: 'Daily class diary', description: 'Record what was taught in each session.', status: 'completed' },
      { name: 'Class test module', description: 'Create short tests and monitor marks.', status: 'completed' },
      { name: 'Question bank repository', description: 'Store reusable questions by topic and difficulty.', status: 'completed' },
      { name: 'Exam blueprint builder', description: 'Define paper structure before generating exams.', status: 'completed' },
      { name: 'Report card PDF generator', description: 'Export branded report cards for parents.', status: 'completed' },
      { name: 'Grade scaling and rubric support', description: 'Support flexible grading rules and rubrics.', status: 'completed' },
      { name: 'Result analytics by subject', description: 'Analyze strengths and weaknesses across exams.', status: 'completed' },
    ],
  },
  {
    title: 'Student Welfare',
    summary: 'Behavior, risk, counseling, and academic intervention management.',
    items: [
      { name: 'Student behavior log', description: 'Record discipline and conduct-related incidents.', status: 'completed' },
      { name: 'Discipline incident tracking', description: 'Follow up on warnings and corrective actions.', status: 'completed' },
      { name: 'Counseling follow-up notes', description: 'Capture support sessions and next steps.', status: 'completed' },
      { name: 'Student risk scoring', description: 'Score students by attendance, behavior, and fees.', status: 'completed' },
      { name: 'Attendance early-warning alerts', description: 'Flag students falling below attendance thresholds.', status: 'completed' },
      { name: 'Fee default risk alerts', description: 'Warn admins about pending and overdue payments.', status: 'completed' },
      { name: 'At-risk student dashboard', description: 'Show intervention priority lists for school leaders.', status: 'completed' },
      { name: 'Intervention task assignments', description: 'Assign corrective actions to staff members.', status: 'completed' },
      { name: 'Multi-term academic calendar', description: 'Manage terms, breaks, exams, and events.', status: 'completed' },
      { name: 'Promotion and retention rules', description: 'Define pass/fail and promotion logic.', status: 'completed' },
    ],
  },
  {
    title: 'Facilities',
    summary: 'Asset-heavy modules for library, transport, hostel, and inventory.',
    items: [
      { name: 'Library management module', description: 'Track books, members, and circulation.', status: 'completed' },
      { name: 'Book issue and return tracking', description: 'Log borrowed and returned items.', status: 'completed' },
      { name: 'Late fine automation', description: 'Apply return penalties automatically.', status: 'planned' },
      { name: 'Vehicle and transport management', description: 'Manage school fleet and routing.', status: 'completed' },
      { name: 'Bus route management', description: 'Define routes, stops, and allocations.', status: 'completed' },
      { name: 'Stop-wise student pickup list', description: 'Show assigned pickup points for each student.', status: 'completed' },
      { name: 'Hostel management module', description: 'Manage hostel allocation and operations.', status: 'completed' },
      { name: 'Hostel room allocation', description: 'Assign beds and rooms to boarding students.', status: 'completed' },
      { name: 'Mess fee management', description: 'Track food plans and mess charges.', status: 'planned' },
      { name: 'Inventory and asset tracking', description: 'Monitor school stock and physical assets.', status: 'completed' },
    ],
  },
  {
    title: 'Finance',
    summary: 'Fees, expenses, refunds, and financial controls for the school.',
    items: [
      { name: 'Purchase request workflow', description: 'Handle internal requests for procurement.', status: 'completed' },
      { name: 'Vendor management module', description: 'Maintain supplier records and contacts.', status: 'completed' },
      { name: 'Expense tracking dashboard', description: 'Show spending by category and period.', status: 'completed' },
      { name: 'Budget planning module', description: 'Plan expected income and monthly expenses.', status: 'completed' },
      { name: 'Cashbook and reconciliation', description: 'Match daily cashflow against records.', status: 'completed' },
      { name: 'Bank deposit tracking', description: 'Track deposits and bank transfer status.', status: 'planned' },
      { name: 'Refund and adjustment handling', description: 'Manage refunds and fee offsets.', status: 'completed' },
      { name: 'Installment fee plans', description: 'Split fee collection into installments.', status: 'completed' },
      { name: 'Scholarship and concession rules', description: 'Apply discounts with approval policies.', status: 'completed' },
      { name: 'Online receipt archive', description: 'Store searchable copies of every receipt.', status: 'completed' },
    ],
  },
  {
    title: 'Certificates & Documents',
    summary: 'Automated document generation for common school operations.',
    items: [
      { name: 'Digital certificate generator', description: 'Create branded school certificates from templates.', status: 'completed' },
      { name: 'Transfer certificate issuance', description: 'Issue TC documents digitally.', status: 'completed' },
      { name: 'Bonafide certificate issuance', description: 'Generate proof-of-study certificates on demand.', status: 'completed' },
      { name: 'Leaving certificate issuance', description: 'Create exit certificates for departing students.', status: 'completed' },
      { name: 'Custom school letter templates', description: 'Design reusable letterheads and forms.', status: 'completed' },
      { name: 'Printable admission confirmation letters', description: 'Confirm admission with downloadable letters.', status: 'completed' },
      { name: 'Document verification QR codes', description: 'Add secure QR validation to certificates.', status: 'completed' },
      { name: 'Auto-filled student forms', description: 'Pre-fill recurring forms from profile data.', status: 'completed' },
      { name: 'Archive and version history', description: 'Keep past document versions searchable.', status: 'planned' },
      { name: 'Digital signature support', description: 'Approve documents electronically.', status: 'planned' },
    ],
  },
  {
    title: 'Admin Controls',
    summary: 'Security, permissions, support, and operational control layers.',
    items: [
      { name: 'Complaint and support ticketing', description: 'Track service requests from staff and parents.', status: 'completed' },
      { name: 'Internal task board', description: 'Assign and monitor school admin tasks.', status: 'completed' },
      { name: 'Approval workflows for admin tasks', description: 'Require review for sensitive actions.', status: 'completed' },
      { name: 'Audit log for sensitive actions', description: 'Track who changed what and when.', status: 'completed' },
      { name: 'Role and permission builder', description: 'Customize access beyond base roles.', status: 'planned' },
      { name: 'Department-level access control', description: 'Limit data visibility by department.', status: 'planned' },
      { name: 'Data export center', description: 'Download reports in PDF, CSV, and Excel.', status: 'completed' },
      { name: 'Advanced search across students and staff', description: 'Find people instantly using multiple filters.', status: 'completed' },
      { name: 'Bulk import for more entities', description: 'Extend import flows beyond the current modules.', status: 'completed' },
      { name: 'Bulk update with preview and rollback', description: 'Safely modify records in large batches.', status: 'planned' },
    ],
  },
  {
    title: 'AI & Insights',
    summary: 'Automation, forecasting, and assistive intelligence for school operators.',
    items: [
      { name: 'AI-generated school performance summaries', description: 'Summarize trends for principals and management.', status: 'planned' },
      { name: 'AI attendance insights', description: 'Highlight attendance patterns and anomalies.', status: 'planned' },
      { name: 'AI fee collection forecasts', description: 'Predict incoming collections and shortfalls.', status: 'planned' },
      { name: 'AI exam performance analysis', description: 'Detect subject-level strengths and weaknesses.', status: 'planned' },
      { name: 'AI parent message drafting', description: 'Help staff write better messages faster.', status: 'planned' },
      { name: 'AI website content suggestions', description: 'Generate homepage and page copy suggestions.', status: 'planned' },
      { name: 'Alumni directory', description: 'Maintain long-term alumni records and engagement.', status: 'planned' },
      { name: 'Alumni donation campaign tools', description: 'Run fundraising campaigns from the alumni base.', status: 'planned' },
      { name: 'School survey and feedback forms', description: 'Collect structured feedback from stakeholders.', status: 'planned' },
      { name: 'Integration marketplace for third-party APIs', description: 'Expose add-ons for external services and tools.', status: 'planned' },
    ],
  },
]

export const totalRoadmapFeatures = featureRoadmap.reduce((count, group) => count + group.items.length, 0)

export const completedRoadmapFeatures = featureRoadmap.reduce(
  (count, group) => count + group.items.filter((item) => item.status === 'completed').length,
  0,
)

export const inProgressRoadmapFeatures = featureRoadmap.reduce(
  (count, group) => count + group.items.filter((item) => item.status === 'in-progress').length,
  0,
)
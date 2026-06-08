#!/usr/bin/env node

const DEFAULTS = {
  tenants: 1000,
  schools: 1000,
  students: 1_000_000,
  staff: 50_000,
  studentUsers: false,
  auditLogs: 0,
  notifications: 0,
  invoices: 100_000,
  aiRecommendations: 10_000,
  automationRules: 1000,
  automationRuns: 50_000,
  batchSize: 1000,
};

const options = parseOptions(process.argv.slice(2));

writeLine('-- CloudCampus Super Admin scale seed SQL');
writeLine('-- Generated for PostgreSQL staging/performance databases. Review before running.');
writeLine('BEGIN;');
writeLine('');

seedPlan();
seedPlatformTenantAndActor();
seedTenants();
seedSchools();
seedStaffUsers();
seedStaffProfiles();
if (options.studentUsers) {
  seedStudentUsers();
}
seedStudents();
seedAuditLogs();
seedNotifications();
seedInvoices();
seedAiRecommendations();
seedAutomationRules();
seedAutomationRuns();
refreshStats();

writeLine('');
writeLine('COMMIT;');

function parseOptions(args) {
  const parsed = { ...DEFAULTS };
  for (const arg of args) {
    if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    }
    const match = arg.match(/^--([a-zA-Z-]+)=(.+)$/);
    if (!match) {
      throw new Error(`Unknown argument: ${arg}`);
    }
    const key = match[1].replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
    if (!(key in parsed)) {
      throw new Error(`Unknown option: ${match[1]}`);
    }
    if (typeof parsed[key] === 'boolean') {
      parsed[key] = ['1', 'true', 'yes'].includes(match[2].toLowerCase());
    } else {
      parsed[key] = Number.parseInt(match[2], 10);
      if (!Number.isFinite(parsed[key]) || parsed[key] < 0) {
        throw new Error(`Option ${match[1]} must be a non-negative integer.`);
      }
    }
  }
  if (parsed.tenants < 1 || parsed.schools < 1) {
    throw new Error('tenants and schools must be at least 1.');
  }
  if (parsed.batchSize < 1) {
    throw new Error('batch-size must be at least 1.');
  }
  if (parsed.automationRuns > 0 && parsed.automationRules < 1) {
    throw new Error('automation-runs requires automation-rules to be at least 1.');
  }
  return parsed;
}

function printHelp() {
  writeLine(`Usage:
  node tests/performance/super-admin-scale-seed-sql.mjs > /tmp/cloudcampus-scale-seed.sql

Options:
  --tenants=1000
  --schools=1000
  --students=1000000
  --staff=50000
  --student-users=false
  --audit-logs=0
  --notifications=0
  --invoices=100000
  --ai-recommendations=10000
  --automation-rules=1000
  --automation-runs=50000
  --batch-size=1000`);
}

function seedPlan() {
  writeLine(`
INSERT INTO subscription_plans (
    id, code, name, description, status, max_schools, max_students, max_staff,
    monthly_price_cents, annual_price_cents, currency, created_at, updated_at
) VALUES (
    ${sqlString(id('plan', 1))}, 'PERF_SCALE', 'Performance Scale Plan', 'Synthetic performance validation plan',
    'ACTIVE', 100000, 2000000, 200000, 100000, 1000000, 'USD', ${timestamp(0)}, ${timestamp(0)}
) ON CONFLICT (code) DO NOTHING;
`);
}

function seedPlatformTenantAndActor() {
  writeLine(`
INSERT INTO tenants (id, code, name, status, created_at)
VALUES (${sqlString(id('platformTenant', 1))}, 'PERF-PLATFORM', 'Performance Platform Tenant', 'ACTIVE', ${timestamp(0)})
ON CONFLICT (code) DO NOTHING;

INSERT INTO user_accounts (
    id, tenant_id, email, display_name, role, status, password_hash, must_change_password, created_at, activated_at
) VALUES (
    ${sqlString(id('superUser', 1))}, ${sqlString(id('platformTenant', 1))}, 'perf-superadmin@cloudcampus.local',
    'Performance Super Admin', 'SUPER_ADMIN', 'ACTIVE', NULL, FALSE, ${timestamp(0)}, ${timestamp(0)}
) ON CONFLICT ON CONSTRAINT uk_user_accounts_tenant_email DO NOTHING;
`);
}

function seedTenants() {
  writeInsert(
    'tenants',
    ['id', 'code', 'name', 'status', 'created_at'],
    options.tenants,
    (index) => [
      id('tenant', index),
      `PERF-T${pad(index, 5)}`,
      `Performance Tenant ${index}`,
      'ACTIVE',
      rawTimestamp(index),
    ],
    'ON CONFLICT (code) DO NOTHING'
  );
}

function seedSchools() {
  writeInsert(
    'schools',
    ['id', 'tenant_id', 'code', 'name', 'primary_school', 'active', 'created_at'],
    options.schools,
    (index) => {
      const tenantIndex = tenantIndexForSchool(index);
      const schoolNumber = schoolNumberInsideTenant(index);
      return [
        id('school', index),
        id('tenant', tenantIndex),
        `SCH-${pad(schoolNumber, 4)}`,
        `Performance School ${index}`,
        rawBoolean(schoolNumber === 1),
        rawBoolean(true),
        rawTimestamp(index),
      ];
    },
    'ON CONFLICT ON CONSTRAINT uk_schools_tenant_code DO NOTHING'
  );
}

function seedStaffUsers() {
  writeInsert(
    'user_accounts',
    ['id', 'tenant_id', 'email', 'display_name', 'role', 'status', 'password_hash', 'must_change_password', 'created_at', 'activated_at'],
    options.staff,
    (index) => {
      const schoolIndex = schoolIndexForDistributedRow(index);
      const tenantIndex = tenantIndexForSchool(schoolIndex);
      return [
        id('staffUser', index),
        id('tenant', tenantIndex),
        `perf-staff-${index}@cloudcampus.local`,
        `Performance Staff ${index}`,
        index % 5 === 0 ? 'FINANCE_STAFF' : 'TEACHER',
        'ACTIVE',
        rawNull(),
        rawBoolean(false),
        rawTimestamp(index),
        rawTimestamp(index),
      ];
    },
    'ON CONFLICT ON CONSTRAINT uk_user_accounts_tenant_email DO NOTHING'
  );
}

function seedStaffProfiles() {
  writeInsert(
    'staff_profiles',
    ['id', 'tenant_id', 'school_id', 'user_id', 'role', 'employee_number', 'full_name', 'email', 'department', 'designation', 'portal_login_required', 'active', 'created_at'],
    options.staff,
    (index) => {
      const schoolIndex = schoolIndexForDistributedRow(index);
      const tenantIndex = tenantIndexForSchool(schoolIndex);
      return [
        id('staffProfile', index),
        id('tenant', tenantIndex),
        id('school', schoolIndex),
        id('staffUser', index),
        index % 5 === 0 ? 'FINANCE_STAFF' : 'TEACHER',
        `EMP-${pad(index, 8)}`,
        `Performance Staff ${index}`,
        `perf-staff-${index}@cloudcampus.local`,
        'Performance',
        index % 5 === 0 ? 'Finance Staff' : 'Teacher',
        rawBoolean(true),
        rawBoolean(true),
        rawTimestamp(index),
      ];
    },
    'ON CONFLICT DO NOTHING'
  );
}

function seedStudentUsers() {
  writeInsert(
    'user_accounts',
    ['id', 'tenant_id', 'email', 'display_name', 'role', 'status', 'password_hash', 'must_change_password', 'created_at', 'activated_at'],
    options.students,
    (index) => {
      const schoolIndex = schoolIndexForDistributedRow(index);
      const tenantIndex = tenantIndexForSchool(schoolIndex);
      return [
        id('studentUser', index),
        id('tenant', tenantIndex),
        `perf-student-${index}@cloudcampus.local`,
        `Performance Student ${index}`,
        'STUDENT',
        'ACTIVE',
        rawNull(),
        rawBoolean(false),
        rawTimestamp(index),
        rawTimestamp(index),
      ];
    },
    'ON CONFLICT ON CONSTRAINT uk_user_accounts_tenant_email DO NOTHING'
  );
}

function seedStudents() {
  writeInsert(
    'students',
    ['id', 'tenant_id', 'school_id', 'admission_number', 'full_name', 'active', 'created_at', 'user_id', 'guardian_email', 'guardian_name', 'guardian_mobile', 'imported_at'],
    options.students,
    (index) => {
      const schoolIndex = schoolIndexForDistributedRow(index);
      const tenantIndex = tenantIndexForSchool(schoolIndex);
      return [
        id('student', index),
        id('tenant', tenantIndex),
        id('school', schoolIndex),
        `ADM-${pad(index, 9)}`,
        `Performance Student ${index}`,
        rawBoolean(true),
        rawTimestamp(index),
        options.studentUsers ? id('studentUser', index) : rawNull(),
        `guardian-${index}@cloudcampus.local`,
        `Guardian ${index}`,
        `90000${pad(index % 100000, 5)}`,
        rawTimestamp(index),
      ];
    },
    'ON CONFLICT ON CONSTRAINT uk_students_school_admission_number DO NOTHING'
  );
}

function seedAuditLogs() {
  writeInsert(
    'audit_logs',
    ['id', 'tenant_id', 'school_id', 'actor_type', 'actor_id', 'action', 'entity_type', 'entity_id', 'summary', 'metadata_json', 'correlation_id', 'created_at'],
    options.auditLogs,
    (index) => {
      const schoolIndex = schoolIndexForDistributedRow(index);
      const tenantIndex = tenantIndexForSchool(schoolIndex);
      return [
        id('auditLog', index),
        id('tenant', tenantIndex),
        id('school', schoolIndex),
        'SYSTEM',
        rawNull(),
        'SCHOOL_UPDATED',
        'School',
        id('school', schoolIndex),
        `Performance audit event ${index}`,
        '{"source":"performance-seed"}',
        `perf-${index}`,
        rawTimestamp(index),
      ];
    },
    'ON CONFLICT DO NOTHING'
  );
}

function seedNotifications() {
  writeInsert(
    'notification_deliveries',
    ['id', 'tenant_id', 'school_id', 'invitation_id', 'user_id', 'channel', 'template', 'recipient_email', 'recipient_name', 'recipient_role', 'subject', 'status', 'provider', 'masked_recipient', 'last_error', 'created_at', 'sent_at', 'failed_at'],
    options.notifications,
    (index) => {
      const schoolIndex = schoolIndexForDistributedRow(index);
      const tenantIndex = tenantIndexForSchool(schoolIndex);
      const failed = index % 20 === 0;
      return [
        id('notification', index),
        id('tenant', tenantIndex),
        id('school', schoolIndex),
        rawNull(),
        rawNull(),
        'EMAIL',
        'PERFORMANCE_SMOKE',
        `delivery-${index}@cloudcampus.local`,
        `Recipient ${index}`,
        'SCHOOL_ADMIN',
        'Performance notification',
        failed ? 'FAILED' : 'LOGGED',
        'performance-seed',
        `d***${index % 1000}@cloudcampus.local`,
        failed ? 'Synthetic provider failure' : rawNull(),
        rawTimestamp(index),
        failed ? rawNull() : rawTimestamp(index),
        failed ? rawTimestamp(index) : rawNull(),
      ];
    },
    'ON CONFLICT DO NOTHING'
  );
}

function seedInvoices() {
  writeInsert(
    'tenant_invoices',
    ['id', 'tenant_id', 'plan_id', 'invoice_number', 'billing_cycle', 'amount_cents', 'currency', 'status', 'issued_at', 'due_at'],
    options.invoices,
    (index) => {
      const tenantIndex = ((index - 1) % options.tenants) + 1;
      const status = index % 10 === 0 ? 'PAID' : (index % 13 === 0 ? 'OVERDUE' : 'ISSUED');
      return [
        id('invoice', index),
        id('tenant', tenantIndex),
        id('plan', 1),
        `PERF-INV-${pad(index, 9)}`,
        index % 12 === 0 ? 'ANNUAL' : 'MONTHLY',
        100000 + (index % 50) * 1000,
        'USD',
        status,
        rawTimestamp(index),
        rawTimestamp(index + 30),
      ];
    },
    'ON CONFLICT (invoice_number) DO NOTHING'
  );
}

function seedAiRecommendations() {
  writeInsert(
    'ai_recommendations',
    [
      'id',
      'tenant_id',
      'school_id',
      'target_type',
      'target_id',
      'recommendation_type',
      'title',
      'summary',
      'rationale',
      'confidence_score',
      'risk_level',
      'status',
      'created_by_actor_type',
      'created_by_actor_id',
      'assigned_to_user_id',
      'approval_required',
      'expires_at',
      'metadata_json',
      'created_at',
      'updated_at',
    ],
    options.aiRecommendations,
    (index) => {
      const schoolIndex = schoolIndexForDistributedRow(index);
      const tenantIndex = tenantIndexForSchool(schoolIndex);
      const status = index % 17 === 0 ? 'APPROVED' : (index % 23 === 0 ? 'REJECTED' : 'PENDING_REVIEW');
      const riskLevel = index % 31 === 0 ? 'HIGH' : (index % 7 === 0 ? 'MEDIUM' : 'LOW');
      return [
        id('aiRecommendation', index),
        id('tenant', tenantIndex),
        id('school', schoolIndex),
        'SCHOOL',
        id('school', schoolIndex),
        index % 5 === 0 ? 'PLATFORM_HEALTH_INSIGHT' : 'STUDENT_RISK_ATTENDANCE',
        `Performance AI recommendation ${index}`,
        `Synthetic AI recommendation summary ${index}`,
        'Generated for Super Admin performance smoke coverage.',
        raw('0.8200'),
        riskLevel,
        status,
        'SYSTEM',
        rawNull(),
        rawNull(),
        rawBoolean(riskLevel !== 'LOW'),
        rawTimestamp(index + 60),
        '{"source":"performance-seed","promptStatus":"redacted"}',
        rawTimestamp(index),
        rawTimestamp(index),
      ];
    },
    'ON CONFLICT DO NOTHING'
  );
}

function seedAutomationRules() {
  writeInsert(
    'automation_rules',
    [
      'id',
      'tenant_id',
      'school_id',
      'code',
      'name',
      'description',
      'trigger_type',
      'trigger_config_json',
      'action_type',
      'action_config_json',
      'enabled',
      'requires_approval',
      'approval_role',
      'risk_level',
      'created_by',
      'updated_by',
      'created_at',
      'updated_at',
    ],
    options.automationRules,
    (index) => {
      const schoolIndex = schoolIndexForDistributedRow(index);
      const tenantIndex = tenantIndexForSchool(schoolIndex);
      return [
        id('automationRule', index),
        id('tenant', tenantIndex),
        id('school', schoolIndex),
        `PERF_RULE_${pad(index, 6)}`,
        `Performance automation rule ${index}`,
        'Synthetic automation rule for Super Admin performance smoke coverage.',
        'SCHEDULED',
        '{"schedule":"PT1H"}',
        'CREATE_RECOMMENDATION',
        '{"recommendationType":"PLATFORM_HEALTH_INSIGHT"}',
        rawBoolean(index % 3 !== 0),
        rawBoolean(index % 5 === 0),
        index % 5 === 0 ? 'SUPER_ADMIN' : rawNull(),
        index % 5 === 0 ? 'HIGH' : 'LOW',
        id('superUser', 1),
        id('superUser', 1),
        rawTimestamp(index),
        rawTimestamp(index),
      ];
    },
    'ON CONFLICT ON CONSTRAINT uk_automation_rules_code_scope DO NOTHING'
  );
}

function seedAutomationRuns() {
  writeInsert(
    'automation_runs',
    [
      'id',
      'automation_rule_id',
      'tenant_id',
      'school_id',
      'status',
      'triggered_by_actor_type',
      'triggered_by_actor_id',
      'input_summary_json',
      'output_summary_json',
      'error_message',
      'started_at',
      'completed_at',
      'created_at',
    ],
    options.automationRuns,
    (index) => {
      const ruleIndex = ((index - 1) % Math.max(1, options.automationRules)) + 1;
      const schoolIndex = schoolIndexForDistributedRow(ruleIndex);
      const tenantIndex = tenantIndexForSchool(schoolIndex);
      const failed = index % 29 === 0;
      return [
        id('automationRun', index),
        id('automationRule', ruleIndex),
        id('tenant', tenantIndex),
        id('school', schoolIndex),
        failed ? 'FAILED' : (index % 11 === 0 ? 'RUNNING' : 'COMPLETED'),
        'SYSTEM',
        rawNull(),
        '{"source":"performance-seed"}',
        failed ? '{}' : '{"createdRecommendation":true}',
        failed ? 'Synthetic automation failure' : rawNull(),
        rawTimestamp(index),
        index % 11 === 0 ? rawNull() : rawTimestamp(index + 1),
        rawTimestamp(index),
      ];
    },
    'ON CONFLICT DO NOTHING'
  );
}

function refreshStats() {
  writeLine(`
INSERT INTO school_stats (
    school_id, tenant_id, student_count, active_student_count, staff_count, active_staff_count, last_activity_at, updated_at
)
SELECT
    s.id,
    s.tenant_id,
    (SELECT COUNT(*) FROM students st WHERE st.school_id = s.id),
    (SELECT COUNT(*) FROM students st WHERE st.school_id = s.id AND st.active = TRUE),
    (SELECT COUNT(*) FROM staff_profiles sp WHERE sp.school_id = s.id),
    (SELECT COUNT(*) FROM staff_profiles sp WHERE sp.school_id = s.id AND sp.active = TRUE),
    (SELECT MAX(al.created_at) FROM audit_logs al WHERE al.school_id = s.id),
    CURRENT_TIMESTAMP
FROM schools s
ON CONFLICT (school_id) DO UPDATE SET
    tenant_id = EXCLUDED.tenant_id,
    student_count = EXCLUDED.student_count,
    active_student_count = EXCLUDED.active_student_count,
    staff_count = EXCLUDED.staff_count,
    active_staff_count = EXCLUDED.active_staff_count,
    last_activity_at = EXCLUDED.last_activity_at,
    updated_at = EXCLUDED.updated_at;

INSERT INTO tenant_stats (
    tenant_id, school_count, active_school_count, student_count, active_student_count,
    staff_count, active_staff_count, user_count, active_user_count, updated_at
)
SELECT
    t.id,
    (SELECT COUNT(*) FROM schools s WHERE s.tenant_id = t.id),
    (SELECT COUNT(*) FROM schools s WHERE s.tenant_id = t.id AND s.active = TRUE),
    (SELECT COUNT(*) FROM students st WHERE st.tenant_id = t.id),
    (SELECT COUNT(*) FROM students st WHERE st.tenant_id = t.id AND st.active = TRUE),
    (SELECT COUNT(*) FROM staff_profiles sp WHERE sp.tenant_id = t.id),
    (SELECT COUNT(*) FROM staff_profiles sp WHERE sp.tenant_id = t.id AND sp.active = TRUE),
    (SELECT COUNT(*) FROM user_accounts ua WHERE ua.tenant_id = t.id),
    (SELECT COUNT(*) FROM user_accounts ua WHERE ua.tenant_id = t.id AND ua.status = 'ACTIVE'),
    CURRENT_TIMESTAMP
FROM tenants t
ON CONFLICT (tenant_id) DO UPDATE SET
    school_count = EXCLUDED.school_count,
    active_school_count = EXCLUDED.active_school_count,
    student_count = EXCLUDED.student_count,
    active_student_count = EXCLUDED.active_student_count,
    staff_count = EXCLUDED.staff_count,
    active_staff_count = EXCLUDED.active_staff_count,
    user_count = EXCLUDED.user_count,
    active_user_count = EXCLUDED.active_user_count,
    updated_at = EXCLUDED.updated_at;

INSERT INTO platform_stats (
    id, total_tenant_count, active_tenant_count, total_school_count, active_school_count,
    total_student_count, active_student_count, total_staff_count, active_staff_count,
    total_user_count, active_user_count, pending_invoice_count, overdue_invoice_count,
    paid_invoice_count, failed_notification_count, pending_outbox_count,
    pending_report_export_count, last_calculated_at
)
SELECT
    'platform',
    (SELECT COUNT(*) FROM tenants),
    (SELECT COUNT(*) FROM tenants WHERE status = 'ACTIVE'),
    (SELECT COUNT(*) FROM schools),
    (SELECT COUNT(*) FROM schools WHERE active = TRUE),
    (SELECT COUNT(*) FROM students),
    (SELECT COUNT(*) FROM students WHERE active = TRUE),
    (SELECT COUNT(*) FROM staff_profiles),
    (SELECT COUNT(*) FROM staff_profiles WHERE active = TRUE),
    (SELECT COUNT(*) FROM user_accounts),
    (SELECT COUNT(*) FROM user_accounts WHERE status = 'ACTIVE'),
    (SELECT COUNT(*) FROM tenant_invoices WHERE status IN ('ISSUED', 'PENDING')),
    (SELECT COUNT(*) FROM tenant_invoices WHERE status = 'OVERDUE' OR (status IN ('ISSUED', 'PENDING') AND due_at IS NOT NULL AND due_at < CURRENT_TIMESTAMP)),
    (SELECT COUNT(*) FROM tenant_invoices WHERE status = 'PAID'),
    (SELECT COUNT(*) FROM notification_deliveries WHERE status = 'FAILED'),
    (SELECT COUNT(*) FROM outbox_events WHERE status = 'PENDING'),
    (SELECT COUNT(*) FROM bulk_jobs WHERE job_type = 'REPORT_EXPORT' AND status IN ('QUEUED', 'VALIDATING', 'PROCESSING')),
    CURRENT_TIMESTAMP
ON CONFLICT (id) DO UPDATE SET
    total_tenant_count = EXCLUDED.total_tenant_count,
    active_tenant_count = EXCLUDED.active_tenant_count,
    total_school_count = EXCLUDED.total_school_count,
    active_school_count = EXCLUDED.active_school_count,
    total_student_count = EXCLUDED.total_student_count,
    active_student_count = EXCLUDED.active_student_count,
    total_staff_count = EXCLUDED.total_staff_count,
    active_staff_count = EXCLUDED.active_staff_count,
    total_user_count = EXCLUDED.total_user_count,
    active_user_count = EXCLUDED.active_user_count,
    pending_invoice_count = EXCLUDED.pending_invoice_count,
    overdue_invoice_count = EXCLUDED.overdue_invoice_count,
    paid_invoice_count = EXCLUDED.paid_invoice_count,
    failed_notification_count = EXCLUDED.failed_notification_count,
    pending_outbox_count = EXCLUDED.pending_outbox_count,
    pending_report_export_count = EXCLUDED.pending_report_export_count,
    last_calculated_at = EXCLUDED.last_calculated_at;
`);
}

function writeInsert(table, columns, totalRows, rowFactory, conflictClause) {
  if (totalRows === 0) {
    return;
  }
  for (let start = 1; start <= totalRows; start += options.batchSize) {
    const end = Math.min(totalRows, start + options.batchSize - 1);
    const values = [];
    for (let index = start; index <= end; index++) {
      values.push(`(${rowFactory(index).map(sqlValue).join(', ')})`);
    }
    writeLine(`INSERT INTO ${table} (${columns.join(', ')}) VALUES`);
    writeLine(values.join(',\n'));
    writeLine(`${conflictClause};`);
    writeLine('');
  }
}

function sqlValue(value) {
  if (value && value.__raw) {
    return value.value;
  }
  return sqlString(value);
}

function sqlString(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}

function rawTimestamp(offset) {
  const normalized = Math.max(0, offset);
  return raw(`TIMESTAMP '2026-01-${pad((normalized % 28) + 1, 2)} ${pad(normalized % 24, 2)}:${pad(normalized % 60, 2)}:00'`);
}

function timestamp(offset) {
  return rawTimestamp(offset).value;
}

function rawBoolean(value) {
  return raw(value ? 'TRUE' : 'FALSE');
}

function rawNull() {
  return raw('NULL');
}

function raw(value) {
  return { __raw: true, value };
}

function tenantIndexForSchool(schoolIndex) {
  return Math.min(options.tenants, Math.floor((schoolIndex - 1) / schoolsPerTenant()) + 1);
}

function schoolNumberInsideTenant(schoolIndex) {
  return ((schoolIndex - 1) % schoolsPerTenant()) + 1;
}

function schoolsPerTenant() {
  return Math.ceil(options.schools / options.tenants);
}

function schoolIndexForDistributedRow(rowIndex) {
  return ((rowIndex - 1) % options.schools) + 1;
}

function id(kind, index) {
  const prefixes = {
    platformTenant: '90000001',
    superUser: '90000002',
    plan: '90000003',
    tenant: '10000000',
    school: '20000000',
    student: '30000000',
    staffUser: '40000000',
    staffProfile: '50000000',
    auditLog: '60000000',
    notification: '70000000',
    invoice: '80000000',
    studentUser: 'a0000000',
    aiRecommendation: 'b0000000',
    automationRule: 'c0000000',
    automationRun: 'd0000000',
  };
  const prefix = prefixes[kind];
  if (!prefix) {
    throw new Error(`Unknown id kind ${kind}`);
  }
  return `${prefix}-0000-4000-8000-${index.toString(16).padStart(12, '0')}`;
}

function pad(value, length) {
  return String(value).padStart(length, '0');
}

function writeLine(value) {
  process.stdout.write(`${value}\n`);
}

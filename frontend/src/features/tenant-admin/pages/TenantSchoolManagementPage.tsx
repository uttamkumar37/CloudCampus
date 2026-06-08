import { type FormEvent, type ReactNode, useEffect, useMemo, useState } from 'react';

import { ApiError } from '../../../shared/api/apiError';
import {
  createTenantSchool,
  deactivateTenantSchool,
  inviteTenantSchoolAdmin,
  listTenantSchoolAdmins,
  listTenantSchools,
  resendTenantSchoolAdminInvitation,
  revokeTenantSchoolAdminAccess,
  type TenantSchoolAdminAccessRevokeResponse,
  type TenantSchoolAdminInviteRequest,
  type TenantSchoolAdminInviteResponse,
  type TenantSchoolAdminSummary,
  type TenantSchoolRequest,
  type TenantSchoolResponse,
  type TenantSchoolUpdateRequest,
  updateTenantSchool,
} from '../api/tenantSchoolsApi';

const ACCESS_TOKEN_STORAGE_KEY = 'cloudcampus.auth.accessToken';
const PAGE_SIZE = 8;

type TenantSchoolManagementMode = 'schools' | 'admins';
type SchoolFormErrors = Partial<Record<'code' | 'name', string>>;
type AdminFormErrors = Partial<Record<'fullName' | 'email' | 'schoolId', string>>;
type DrawerState =
  | { type: 'create-school' }
  | { type: 'edit-school'; school: TenantSchoolResponse }
  | { type: 'invite-admin' }
  | null;
type ConfirmState =
  | { type: 'deactivate-school'; school: TenantSchoolResponse }
  | { type: 'revoke-admin'; admin: TenantSchoolAdminSummary }
  | null;

type TenantSchoolManagementPageProps = {
  mode?: TenantSchoolManagementMode;
  onCreateSchool?: (payload: TenantSchoolRequest, accessToken: string) => Promise<TenantSchoolResponse>;
  onUpdateSchool?: (
    schoolId: string,
    payload: TenantSchoolUpdateRequest,
    accessToken: string,
  ) => Promise<TenantSchoolResponse>;
  onDeactivateSchool?: (schoolId: string, accessToken: string) => Promise<TenantSchoolResponse>;
  onInviteSchoolAdmin?: (
    schoolId: string,
    payload: TenantSchoolAdminInviteRequest,
    accessToken: string,
  ) => Promise<TenantSchoolAdminInviteResponse>;
  onListSchools?: (accessToken: string) => Promise<TenantSchoolResponse[]>;
  onListSchoolAdmins?: (schoolId: string, accessToken: string) => Promise<TenantSchoolAdminSummary[]>;
  onResendSchoolAdminInvitation?: (
    schoolId: string,
    userId: string,
    accessToken: string,
  ) => Promise<TenantSchoolAdminInviteResponse>;
  onRevokeSchoolAdminAccess?: (
    schoolId: string,
    userId: string,
    accessToken: string,
  ) => Promise<TenantSchoolAdminAccessRevokeResponse>;
  storage?: Pick<Storage, 'getItem'>;
};

export function TenantSchoolManagementPage({
  mode = 'schools',
  onCreateSchool = createTenantSchool,
  onUpdateSchool = updateTenantSchool,
  onDeactivateSchool = deactivateTenantSchool,
  onInviteSchoolAdmin = inviteTenantSchoolAdmin,
  onListSchools = listTenantSchools,
  onListSchoolAdmins = listTenantSchoolAdmins,
  onResendSchoolAdminInvitation = resendTenantSchoolAdminInvitation,
  onRevokeSchoolAdminAccess = revokeTenantSchoolAdminAccess,
  storage = globalThis.sessionStorage,
}: TenantSchoolManagementPageProps) {
  const [schools, setSchools] = useState<TenantSchoolResponse[]>([]);
  const [admins, setAdmins] = useState<TenantSchoolAdminSummary[]>([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [page, setPage] = useState(0);
  const [schoolsStatus, setSchoolsStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [adminsStatus, setAdminsStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [drawer, setDrawer] = useState<DrawerState>(null);
  const [confirm, setConfirm] = useState<ConfirmState>(null);
  const [schoolErrors, setSchoolErrors] = useState<SchoolFormErrors>({});
  const [adminErrors, setAdminErrors] = useState<AdminFormErrors>({});
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedSchool = schools.find((school) => school.id === selectedSchoolId) ?? null;
  const visibleSchools = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return schools.filter((school) => {
      const matchesSearch = !normalizedSearch
        || school.name.toLowerCase().includes(normalizedSearch)
        || school.code.toLowerCase().includes(normalizedSearch)
        || school.id.toLowerCase().includes(normalizedSearch);
      const matchesStatus = statusFilter === 'ALL'
        || (statusFilter === 'ACTIVE' ? school.active : !school.active);
      return matchesSearch && matchesStatus;
    });
  }, [schools, search, statusFilter]);
  const totalPages = Math.max(1, Math.ceil(visibleSchools.length / PAGE_SIZE));
  const pagedSchools = visibleSchools.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  useEffect(() => {
    void loadSchools({ quiet: true });
  }, []);

  useEffect(() => {
    setPage(0);
  }, [search, statusFilter]);

  useEffect(() => {
    if (mode !== 'admins') {
      return;
    }
    if (!selectedSchoolId) {
      setAdmins([]);
      setAdminsStatus('idle');
      return;
    }
    void loadAdmins(selectedSchoolId, { quiet: true });
  }, [mode, selectedSchoolId]);

  function accessToken() {
    const token = storage.getItem(ACCESS_TOKEN_STORAGE_KEY);
    if (!token) {
      setError('Tenant Admin login is required.');
      setMessage(null);
      setSchoolsStatus((current) => (current === 'loading' ? 'error' : current));
      return null;
    }
    return token;
  }

  async function loadSchools(options: { quiet?: boolean } = {}) {
    const token = accessToken();
    if (!token) return;

    setSchoolsStatus('loading');
    setError(null);
    try {
      const result = await onListSchools(token);
      setSchools(result);
      setSchoolsStatus('ready');
      if (!options.quiet) {
        setMessage(`${result.length} school${result.length === 1 ? '' : 's'} loaded.`);
      }
    } catch (caught) {
      setSchools([]);
      setSchoolsStatus('error');
      setError(tenantAdminError(caught, 'Schools could not be loaded.'));
      setMessage(null);
    }
  }

  async function loadAdmins(schoolId = selectedSchoolId, options: { quiet?: boolean } = {}) {
    const token = accessToken();
    if (!token || !schoolId) return;

    setAdminsStatus('loading');
    setError(null);
    try {
      const result = await onListSchoolAdmins(schoolId, token);
      setAdmins(result);
      setAdminsStatus('ready');
      if (!options.quiet) {
        setMessage(`${result.length} School Admin${result.length === 1 ? '' : 's'} loaded.`);
      }
    } catch (caught) {
      setAdmins([]);
      setAdminsStatus('error');
      setError(tenantAdminError(caught, 'School Admins could not be loaded.'));
      setMessage(null);
    }
  }

  async function handleCreateSchool(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const token = accessToken();
    if (!token) return;

    const form = new FormData(event.currentTarget);
    const payload: TenantSchoolRequest = {
      code: String(form.get('code') ?? '').trim(),
      name: String(form.get('name') ?? '').trim(),
    };
    const validation = validateSchoolForm(payload, true);
    setSchoolErrors(validation);
    if (Object.keys(validation).length > 0) {
      return;
    }

    setBusyAction('create-school');
    setError(null);
    try {
      const result = await onCreateSchool(payload, token);
      setMessage(`${result.name} created (${result.schoolsUsed}/${result.maxSchools}).`);
      setDrawer(null);
      setSchoolErrors({});
      await loadSchools({ quiet: true });
    } catch (caught) {
      setError(tenantAdminError(caught, 'School creation failed.'));
      setMessage(null);
    } finally {
      setBusyAction(null);
    }
  }

  async function handleUpdateSchool(event: FormEvent<HTMLFormElement>, school: TenantSchoolResponse) {
    event.preventDefault();
    const token = accessToken();
    if (!token) return;

    const form = new FormData(event.currentTarget);
    const payload: TenantSchoolUpdateRequest = {
      name: String(form.get('name') ?? '').trim(),
    };
    const validation = validateSchoolForm({ code: school.code, name: payload.name }, false);
    setSchoolErrors(validation);
    if (Object.keys(validation).length > 0) {
      return;
    }

    setBusyAction('update-school');
    setError(null);
    try {
      const result = await onUpdateSchool(school.id, payload, token);
      setMessage(`${result.name} updated.`);
      setDrawer(null);
      setSchoolErrors({});
      await loadSchools({ quiet: true });
    } catch (caught) {
      setError(tenantAdminError(caught, 'School update failed.'));
      setMessage(null);
    } finally {
      setBusyAction(null);
    }
  }

  async function handleDeactivateSchool() {
    if (confirm?.type !== 'deactivate-school') return;
    const token = accessToken();
    if (!token) return;

    setBusyAction('deactivate-school');
    setError(null);
    try {
      const result = await onDeactivateSchool(confirm.school.id, token);
      setMessage(`${result.name} deactivated.`);
      setConfirm(null);
      await loadSchools({ quiet: true });
    } catch (caught) {
      setError(tenantAdminError(caught, 'School deactivation failed.'));
      setMessage(null);
    } finally {
      setBusyAction(null);
    }
  }

  async function handleInviteAdmin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const token = accessToken();
    if (!token) return;

    const form = new FormData(event.currentTarget);
    const schoolId = String(form.get('schoolId') ?? selectedSchoolId).trim();
    const payload: TenantSchoolAdminInviteRequest = {
      fullName: String(form.get('fullName') ?? '').trim(),
      email: String(form.get('email') ?? '').trim(),
    };
    const validation = validateAdminForm(payload, schoolId);
    setAdminErrors(validation);
    if (Object.keys(validation).length > 0) {
      return;
    }

    setBusyAction('invite-admin');
    setError(null);
    try {
      const result = await onInviteSchoolAdmin(schoolId, payload, token);
      setMessage(`${result.email} invited as School Admin.`);
      setDrawer(null);
      setAdminErrors({});
      setSelectedSchoolId(schoolId);
      await loadAdmins(schoolId, { quiet: true });
    } catch (caught) {
      setError(tenantAdminError(caught, 'School Admin invitation failed.'));
      setMessage(null);
    } finally {
      setBusyAction(null);
    }
  }

  async function handleResendInvitation(admin: TenantSchoolAdminSummary) {
    const token = accessToken();
    if (!token) return;

    setBusyAction(`resend-${admin.userId}`);
    setError(null);
    try {
      const result = await onResendSchoolAdminInvitation(admin.schoolId, admin.userId, token);
      setMessage(`${result.email} invitation resent.`);
      await loadAdmins(admin.schoolId, { quiet: true });
    } catch (caught) {
      setError(tenantAdminError(caught, 'Invitation resend failed.'));
      setMessage(null);
    } finally {
      setBusyAction(null);
    }
  }

  async function handleRevokeAdminAccess() {
    if (confirm?.type !== 'revoke-admin') return;
    const token = accessToken();
    if (!token) return;

    setBusyAction(`revoke-${confirm.admin.userId}`);
    setError(null);
    try {
      const result = await onRevokeSchoolAdminAccess(confirm.admin.schoolId, confirm.admin.userId, token);
      setMessage(`School Admin access revoked (${result.remainingSchoolAdmins} remain).`);
      setConfirm(null);
      await loadAdmins(confirm.admin.schoolId, { quiet: true });
    } catch (caught) {
      setError(tenantAdminError(caught, 'Access revoke failed.'));
      setMessage(null);
    } finally {
      setBusyAction(null);
    }
  }

  const title = mode === 'admins' ? 'School Admins' : 'Schools';
  const detail = mode === 'admins'
    ? 'Invite, review, resend invitations, and remove School Admin access for schools in this organization.'
    : 'Manage tenant-scoped schools without exposing platform or cross-tenant controls.';

  return (
    <section className="tenant-admin-panel" aria-labelledby={`tenant-admin-${mode}-title`}>
      <TenantAdminPageTitle
        detail={detail}
        eyebrow="Tenant Admin"
        title={title}
        action={mode === 'admins'
          ? (
            <button disabled={!selectedSchoolId || schoolsStatus !== 'ready'} onClick={() => setDrawer({ type: 'invite-admin' })} type="button">
              Invite School Admin
            </button>
          )
          : <button onClick={() => setDrawer({ type: 'create-school' })} type="button">Add school</button>}
      />

      {message ? <p className="toast-message" role="status">{message}</p> : null}
      {error ? <p className="toast-message error" role="alert">{error}</p> : null}

      {mode === 'schools' ? (
        <>
          <div className="tenant-admin-toolbar">
            <label>
              Search schools
              <input
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by school name, code, or ID"
                value={search}
              />
            </label>
            <label>
              Status
              <select onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)} value={statusFilter}>
                <option value="ALL">All statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </label>
            <button className="secondary" disabled={schoolsStatus === 'loading'} onClick={() => void loadSchools()} type="button">
              Refresh
            </button>
          </div>

          <TenantSchoolsTable
            onDeactivate={(school) => setConfirm({ type: 'deactivate-school', school })}
            onEdit={(school) => {
              setSchoolErrors({});
              setDrawer({ type: 'edit-school', school });
            }}
            page={page}
            schools={pagedSchools}
            status={schoolsStatus}
            total={visibleSchools.length}
            totalPages={totalPages}
            onNext={() => setPage((current) => Math.min(current + 1, totalPages - 1))}
            onPrevious={() => setPage((current) => Math.max(current - 1, 0))}
          />
        </>
      ) : (
        <TenantSchoolAdminsPanel
          admins={admins}
          busyAction={busyAction}
          onInvite={() => setDrawer({ type: 'invite-admin' })}
          onRefresh={() => void loadAdmins()}
          onResend={(admin) => void handleResendInvitation(admin)}
          onRevoke={(admin) => setConfirm({ type: 'revoke-admin', admin })}
          onSelectSchool={setSelectedSchoolId}
          schools={schools}
          schoolsStatus={schoolsStatus}
          selectedSchool={selectedSchool}
          selectedSchoolId={selectedSchoolId}
          status={adminsStatus}
        />
      )}

      {drawer?.type === 'create-school' ? (
        <TenantDrawer labelledBy="tenant-create-school-title" onClose={() => setDrawer(null)}>
          <SchoolForm
            busy={busyAction === 'create-school'}
            errors={schoolErrors}
            mode="create"
            onCancel={() => setDrawer(null)}
            onSubmit={handleCreateSchool}
          />
        </TenantDrawer>
      ) : null}

      {drawer?.type === 'edit-school' ? (
        <TenantDrawer labelledBy="tenant-edit-school-title" onClose={() => setDrawer(null)}>
          <SchoolForm
            busy={busyAction === 'update-school'}
            errors={schoolErrors}
            mode="edit"
            onCancel={() => setDrawer(null)}
            onSubmit={(event) => void handleUpdateSchool(event, drawer.school)}
            school={drawer.school}
          />
        </TenantDrawer>
      ) : null}

      {drawer?.type === 'invite-admin' ? (
        <TenantDrawer labelledBy="tenant-invite-admin-title" onClose={() => setDrawer(null)}>
          <AdminInviteForm
            busy={busyAction === 'invite-admin'}
            errors={adminErrors}
            onCancel={() => setDrawer(null)}
            onSubmit={handleInviteAdmin}
            schools={schools}
            selectedSchoolId={selectedSchoolId}
          />
        </TenantDrawer>
      ) : null}

      {confirm ? (
        <TenantConfirmationDialog
          busy={busyAction !== null}
          confirmLabel={confirm.type === 'deactivate-school' ? 'Deactivate school' : 'Revoke access'}
          detail={confirm.type === 'deactivate-school'
            ? `${confirm.school.name} will become inactive. Existing records stay tenant-scoped and auditable.`
            : `${confirm.admin.fullName} will lose School Admin access for the selected school.`}
          onCancel={() => setConfirm(null)}
          onConfirm={() => {
            if (confirm.type === 'deactivate-school') {
              void handleDeactivateSchool();
            } else {
              void handleRevokeAdminAccess();
            }
          }}
          title={confirm.type === 'deactivate-school' ? 'Deactivate this school?' : 'Revoke School Admin access?'}
        />
      ) : null}
    </section>
  );
}

function TenantSchoolsTable({
  onDeactivate,
  onEdit,
  onNext,
  onPrevious,
  page,
  schools,
  status,
  total,
  totalPages,
}: {
  onDeactivate: (school: TenantSchoolResponse) => void;
  onEdit: (school: TenantSchoolResponse) => void;
  onNext: () => void;
  onPrevious: () => void;
  page: number;
  schools: TenantSchoolResponse[];
  status: 'loading' | 'ready' | 'error';
  total: number;
  totalPages: number;
}) {
  return (
    <section className="tenant-admin-card" aria-labelledby="tenant-schools-table-title">
      <div className="tenant-admin-card-heading">
        <div>
          <h3 id="tenant-schools-table-title">School directory</h3>
          <span>{total} school{total === 1 ? '' : 's'} match current filters</span>
        </div>
      </div>
      {status === 'loading' ? <TenantSkeleton rows={4} /> : null}
      {status === 'ready' && schools.length === 0 ? (
        <TenantEmptyState title="No schools found" detail="Try another filter or add a school if your subscription allows it." />
      ) : null}
      {status === 'ready' && schools.length > 0 ? (
        <>
          <div className="tenant-admin-table-shell" role="region" aria-label="Schools table" tabIndex={0}>
            <table className="tenant-admin-table">
              <thead>
                <tr>
                  <th scope="col">School</th>
                  <th scope="col">Status</th>
                  <th scope="col">Subscription</th>
                  <th scope="col">School ID</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {schools.map((school) => (
                  <tr key={school.id}>
                    <td>
                      <strong>{school.name}</strong>
                      <span>{school.code}</span>
                      {school.primarySchool ? <em>Primary school</em> : <em>Branch school</em>}
                    </td>
                    <td><TenantStatusBadge status={school.active ? 'ACTIVE' : 'INACTIVE'} /></td>
                    <td>
                      <strong>{school.schoolsUsed}/{school.maxSchools}</strong>
                      <span>Schools used in plan</span>
                    </td>
                    <td><code>{school.id}</code></td>
                    <td>
                      <div className="tenant-admin-actions">
                        <button onClick={() => onEdit(school)} type="button">Edit</button>
                        <button className="secondary" disabled={!school.active || school.primarySchool} onClick={() => onDeactivate(school)} type="button">
                          Deactivate
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="tenant-admin-pagination">
            <span>Page {page + 1} of {totalPages}</span>
            <div>
              <button className="secondary" disabled={page === 0} onClick={onPrevious} type="button">Previous</button>
              <button className="secondary" disabled={page + 1 >= totalPages} onClick={onNext} type="button">Next</button>
            </div>
          </div>
        </>
      ) : null}
    </section>
  );
}

function TenantSchoolAdminsPanel({
  admins,
  busyAction,
  onInvite,
  onRefresh,
  onResend,
  onRevoke,
  onSelectSchool,
  schools,
  schoolsStatus,
  selectedSchool,
  selectedSchoolId,
  status,
}: {
  admins: TenantSchoolAdminSummary[];
  busyAction: string | null;
  onInvite: () => void;
  onRefresh: () => void;
  onResend: (admin: TenantSchoolAdminSummary) => void;
  onRevoke: (admin: TenantSchoolAdminSummary) => void;
  onSelectSchool: (schoolId: string) => void;
  schools: TenantSchoolResponse[];
  schoolsStatus: 'loading' | 'ready' | 'error';
  selectedSchool: TenantSchoolResponse | null;
  selectedSchoolId: string;
  status: 'idle' | 'loading' | 'ready' | 'error';
}) {
  return (
    <section className="tenant-admin-card" aria-labelledby="tenant-admins-title">
      <div className="tenant-admin-card-heading">
        <div>
          <h3 id="tenant-admins-title">School Admin access</h3>
          <span>{selectedSchool ? selectedSchool.name : 'Choose a school to manage admin access'}</span>
        </div>
        <button disabled={!selectedSchoolId || status === 'loading'} onClick={onRefresh} type="button">Refresh admins</button>
      </div>

      <div className="tenant-admin-toolbar">
        <label>
          School
          <select
            disabled={schoolsStatus === 'loading'}
            onChange={(event) => onSelectSchool(event.target.value)}
            value={selectedSchoolId}
          >
            <option value="">Select a school</option>
            {schools.map((school) => (
              <option key={school.id} value={school.id}>{school.name} ({school.code})</option>
            ))}
          </select>
        </label>
        <button disabled={!selectedSchoolId || schoolsStatus !== 'ready'} onClick={onInvite} type="button">Invite School Admin</button>
      </div>

      {!selectedSchoolId ? (
        <TenantEmptyState title="No school selected" detail="Select a tenant school to list, invite, resend, or revoke School Admin access." />
      ) : null}
      {selectedSchoolId && status === 'loading' ? <TenantSkeleton rows={4} /> : null}
      {selectedSchoolId && status === 'ready' && admins.length === 0 ? (
        <TenantEmptyState title="No School Admins yet" detail="Invite the first School Admin for this school when you are ready." />
      ) : null}
      {selectedSchoolId && status === 'ready' && admins.length > 0 ? (
        <div className="tenant-admin-table-shell" role="region" aria-label="School Admins table" tabIndex={0}>
          <table className="tenant-admin-table">
            <thead>
              <tr>
                <th scope="col">Admin</th>
                <th scope="col">Status</th>
                <th scope="col">Invitation</th>
                <th scope="col">Access</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((admin) => (
                <tr key={admin.accessGrantId}>
                  <td>
                    <strong>{admin.fullName}</strong>
                    <span>{maskEmail(admin.email)}</span>
                  </td>
                  <td><TenantStatusBadge status={admin.userStatus} /></td>
                  <td>
                    <strong>{admin.latestInvitationStatus ?? 'No invitation'}</strong>
                    <span>{admin.latestInvitationExpiresAt ? `Expires ${dateLabel(admin.latestInvitationExpiresAt)}` : 'No active invite'}</span>
                  </td>
                  <td>{admin.primaryAccess ? 'Primary access' : 'School access'}</td>
                  <td>
                    <div className="tenant-admin-actions">
                      <button
                        disabled={busyAction === `resend-${admin.userId}` || admin.latestInvitationStatus === 'ACCEPTED'}
                        onClick={() => onResend(admin)}
                        type="button"
                      >
                        {busyAction === `resend-${admin.userId}` ? 'Sending...' : 'Resend'}
                      </button>
                      <button
                        className="secondary"
                        disabled={busyAction === `revoke-${admin.userId}`}
                        onClick={() => onRevoke(admin)}
                        type="button"
                      >
                        Revoke
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}

function SchoolForm({
  busy,
  errors,
  mode,
  onCancel,
  onSubmit,
  school,
}: {
  busy: boolean;
  errors: SchoolFormErrors;
  mode: 'create' | 'edit';
  onCancel: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  school?: TenantSchoolResponse;
}) {
  const titleId = mode === 'create' ? 'tenant-create-school-title' : 'tenant-edit-school-title';
  return (
    <form className="tenant-admin-drawer-form" noValidate onSubmit={onSubmit}>
      <header className="tenant-admin-drawer-header">
        <div>
          <p className="eyebrow">School operations</p>
          <h3 id={titleId}>{mode === 'create' ? 'Add school' : 'Edit school'}</h3>
          <span>{mode === 'create' ? 'Create a tenant-scoped school within plan limits.' : school?.code}</span>
        </div>
        <button className="secondary" disabled={busy} onClick={onCancel} type="button">Close</button>
      </header>
      <div className="tenant-admin-drawer-body">
        <fieldset className="tenant-admin-form-section">
          <legend>School profile</legend>
          {mode === 'create' ? (
            <TenantField error={errors.code} field="code" label="School code" placeholder="BRANCH-EAST" required defaultValue={school?.code ?? ''} />
          ) : null}
          <TenantField error={errors.name} field="name" label="School name" placeholder="Branch East" required defaultValue={school?.name ?? ''} />
        </fieldset>
        <p className="tenant-admin-note">Tenant scope is resolved by the backend from the authenticated session. Do not enter tenant IDs here.</p>
      </div>
      <footer className="tenant-admin-drawer-footer">
        <button className="secondary" disabled={busy} onClick={onCancel} type="button">Cancel</button>
        <button disabled={busy} type="submit">{busy ? 'Saving...' : mode === 'create' ? 'Create school' : 'Save changes'}</button>
      </footer>
    </form>
  );
}

function AdminInviteForm({
  busy,
  errors,
  onCancel,
  onSubmit,
  schools,
  selectedSchoolId,
}: {
  busy: boolean;
  errors: AdminFormErrors;
  onCancel: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  schools: TenantSchoolResponse[];
  selectedSchoolId: string;
}) {
  return (
    <form className="tenant-admin-drawer-form" noValidate onSubmit={onSubmit}>
      <header className="tenant-admin-drawer-header">
        <div>
          <p className="eyebrow">Access control</p>
          <h3 id="tenant-invite-admin-title">Invite School Admin</h3>
          <span>Invitation delivery is handled by the implemented School Admin invite API.</span>
        </div>
        <button className="secondary" disabled={busy} onClick={onCancel} type="button">Close</button>
      </header>
      <div className="tenant-admin-drawer-body">
        <fieldset className="tenant-admin-form-section">
          <legend>School and recipient</legend>
          <TenantSelect error={errors.schoolId} field="schoolId" label="School" required defaultValue={selectedSchoolId}>
            <option value="">Select a school</option>
            {schools.filter((school) => school.active).map((school) => (
              <option key={school.id} value={school.id}>{school.name} ({school.code})</option>
            ))}
          </TenantSelect>
          <TenantField error={errors.fullName} field="fullName" label="Admin full name" placeholder="Branch Principal" required defaultValue="" />
          <TenantField error={errors.email} field="email" label="Admin email" placeholder="principal@example.com" required type="email" defaultValue="" />
        </fieldset>
        <p className="tenant-admin-note">The invite can only grant School Admin access to schools owned by this tenant.</p>
      </div>
      <footer className="tenant-admin-drawer-footer">
        <button className="secondary" disabled={busy} onClick={onCancel} type="button">Cancel</button>
        <button disabled={busy} type="submit">{busy ? 'Sending...' : 'Invite School Admin'}</button>
      </footer>
    </form>
  );
}

function TenantDrawer({ children, labelledBy, onClose }: { children: ReactNode; labelledBy: string; onClose: () => void }) {
  return (
    <div className="tenant-admin-drawer" role="dialog" aria-modal="true" aria-labelledby={labelledBy}>
      <button className="tenant-admin-drawer-backdrop" aria-label="Close drawer" onClick={onClose} type="button" />
      <aside className="tenant-admin-drawer-panel">{children}</aside>
    </div>
  );
}

function TenantConfirmationDialog({
  busy,
  confirmLabel,
  detail,
  onCancel,
  onConfirm,
  title,
}: {
  busy: boolean;
  confirmLabel: string;
  detail: string;
  onCancel: () => void;
  onConfirm: () => void;
  title: string;
}) {
  return (
    <div className="tenant-admin-modal" role="dialog" aria-modal="true" aria-labelledby="tenant-confirm-title">
      <button className="tenant-admin-modal-scrim" aria-label="Cancel confirmation" onClick={onCancel} type="button" />
      <section className="tenant-admin-modal-panel">
        <h3 id="tenant-confirm-title">{title}</h3>
        <p>{detail}</p>
        <div className="tenant-admin-modal-actions">
          <button className="secondary" disabled={busy} onClick={onCancel} type="button">Cancel</button>
          <button disabled={busy} onClick={onConfirm} type="button">{busy ? 'Working...' : confirmLabel}</button>
        </div>
      </section>
    </div>
  );
}

export function TenantAdminPageTitle({
  action,
  detail,
  eyebrow,
  title,
}: {
  action?: ReactNode;
  detail: string;
  eyebrow: string;
  title: string;
}) {
  return (
    <div className="tenant-admin-title">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
        <span>{detail}</span>
      </div>
      {action ? <div className="tenant-admin-title-actions">{action}</div> : null}
    </div>
  );
}

function TenantField({
  defaultValue,
  error,
  field,
  label,
  placeholder,
  required = false,
  type = 'text',
}: {
  defaultValue: string;
  error?: string;
  field: string;
  label: string;
  placeholder: string;
  required?: boolean;
  type?: string;
}) {
  const id = `tenant-${field}`;
  return (
    <div className="tenant-admin-field">
      <label htmlFor={id}>{label}{required ? <span aria-hidden="true">*</span> : null}</label>
      <input
        aria-describedby={error ? `${id}-error` : undefined}
        aria-invalid={Boolean(error)}
        defaultValue={defaultValue}
        id={id}
        name={field}
        placeholder={placeholder}
        required={required}
        type={type}
      />
      {error ? <em id={`${id}-error`}>{error}</em> : null}
    </div>
  );
}

function TenantSelect({
  children,
  defaultValue,
  error,
  field,
  label,
  required = false,
}: {
  children: ReactNode;
  defaultValue: string;
  error?: string;
  field: string;
  label: string;
  required?: boolean;
}) {
  const id = `tenant-${field}`;
  return (
    <div className="tenant-admin-field">
      <label htmlFor={id}>{label}{required ? <span aria-hidden="true">*</span> : null}</label>
      <select
        aria-describedby={error ? `${id}-error` : undefined}
        aria-invalid={Boolean(error)}
        defaultValue={defaultValue}
        id={id}
        name={field}
        required={required}
      >
        {children}
      </select>
      {error ? <em id={`${id}-error`}>{error}</em> : null}
    </div>
  );
}

function TenantStatusBadge({ status }: { status: string }) {
  return <span className={`tenant-admin-status status-${status.toLowerCase()}`}>{status.replace('_', ' ')}</span>;
}

function TenantSkeleton({ rows }: { rows: number }) {
  return (
    <div className="tenant-admin-skeleton" aria-label="Loading">
      {Array.from({ length: rows }).map((_, index) => <span key={index} />)}
    </div>
  );
}

function TenantEmptyState({ detail, title }: { detail: string; title: string }) {
  return (
    <div className="tenant-admin-empty">
      <strong>{title}</strong>
      <span>{detail}</span>
    </div>
  );
}

function validateSchoolForm(payload: TenantSchoolRequest, requireCode: boolean): SchoolFormErrors {
  const errors: SchoolFormErrors = {};
  if (requireCode && !payload.code.trim()) {
    errors.code = 'School code is required.';
  } else if (payload.code.length > 40) {
    errors.code = 'Use 40 characters or fewer.';
  }
  if (!payload.name.trim()) {
    errors.name = 'School name is required.';
  } else if (payload.name.length > 180) {
    errors.name = 'Use 180 characters or fewer.';
  }
  return errors;
}

function validateAdminForm(payload: TenantSchoolAdminInviteRequest, schoolId: string): AdminFormErrors {
  const errors: AdminFormErrors = {};
  if (!schoolId) {
    errors.schoolId = 'Select a school.';
  }
  if (!payload.fullName) {
    errors.fullName = 'Admin full name is required.';
  }
  if (!payload.email) {
    errors.email = 'Admin email is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
    errors.email = 'Enter a valid email address.';
  }
  return errors;
}

function tenantAdminError(caught: unknown, fallback: string) {
  if (caught instanceof ApiError) {
    if (caught.status === 401) return 'Session expired. Sign in again.';
    if (caught.status === 403) return 'Permission denied for this Tenant Admin action.';
    if (caught.status === 404) return 'The requested school was not found in this tenant.';
    return caught.message || fallback;
  }
  return caught instanceof Error ? caught.message : fallback;
}

function maskEmail(email: string) {
  const [local, domain] = email.split('@');
  if (!domain) return email;
  return `${local.slice(0, 1)}***@${domain}`;
}

function dateLabel(value: string) {
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(value));
}

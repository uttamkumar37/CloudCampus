import {
  type TenantSchoolAdminInviteRequest,
  type TenantSchoolAdminInviteResponse,
  type TenantSchoolRequest,
  type TenantSchoolResponse,
} from '../api/tenantSchoolsApi';
import { TenantSchoolManagementPage } from './TenantSchoolManagementPage';

type TenantSchoolCreationPageProps = {
  onCreateSchool?: (payload: TenantSchoolRequest, accessToken: string) => Promise<TenantSchoolResponse>;
  onListSchools?: (accessToken: string) => Promise<TenantSchoolResponse[]>;
  onInviteSchoolAdmin?: (
    schoolId: string,
    payload: TenantSchoolAdminInviteRequest,
    accessToken: string,
  ) => Promise<TenantSchoolAdminInviteResponse>;
  storage?: Pick<Storage, 'getItem'>;
};

export function TenantSchoolCreationPage({
  onCreateSchool,
  onListSchools,
  onInviteSchoolAdmin,
  storage,
}: TenantSchoolCreationPageProps) {
  return (
    <TenantSchoolManagementPage
      mode="schools"
      onCreateSchool={onCreateSchool}
      onInviteSchoolAdmin={onInviteSchoolAdmin}
      onListSchools={onListSchools}
      storage={storage}
    />
  );
}

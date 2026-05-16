import axiosInstance from '@/shared/api/axiosInstance';
import type { ApiResponse } from '@/shared/types/api';

export interface DeviceSession {
  id:          string;
  deviceName:  string;
  ipAddress:   string;
  lastSeenAt:  string;
  createdAt:   string;
  revoked:     boolean;
}

export async function listDevicesApi(): Promise<DeviceSession[]> {
  const { data } = await axiosInstance.get<ApiResponse<DeviceSession[]>>('/v1/auth/devices');
  return data.data!;
}

export async function revokeDeviceApi(id: string): Promise<void> {
  await axiosInstance.delete(`/v1/auth/devices/${id}`);
}

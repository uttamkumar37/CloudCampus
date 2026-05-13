import axiosInstance from '@/shared/api/axiosInstance';

export type DevicePlatform = 'IOS' | 'ANDROID';

export interface DeviceRegisterRequest {
  pushToken: string;
  platform: DevicePlatform;
  /** Expo push token (begins with ExponentPushToken[...]) — optional, sent alongside native token */
  expoPushToken?: string;
}

/**
 * Registers or refreshes the device push token for the authenticated user.
 * Called on every login and whenever the OS rotates the token.
 * POST /v1/devices/register
 */
export async function registerDevice(body: DeviceRegisterRequest): Promise<void> {
  await axiosInstance.post('/v1/devices/register', body);
}

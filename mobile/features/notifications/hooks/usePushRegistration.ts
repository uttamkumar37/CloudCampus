/**
 * usePushRegistration — requests notification permission and registers the
 * device push token with the backend.
 *
 * Call once after the user logs in (mount inside authenticated layout).
 *
 * Flow:
 *  1. Check that the device is physical (simulators do not support push).
 *  2. Request OS permission (shows system dialog once).
 *  3. Get the native FCM/APNs device token via getDevicePushTokenAsync.
 *  4. Also capture the Expo push token for Expo Push Service fallback.
 *  5. POST /v1/devices/register — fire-and-forget; never blocks the UI.
 *
 * Token refresh: Expo Notifications fires a 'devicePushTokenChanged' event
 * when the OS rotates the token. We subscribe and re-register on that event.
 */
import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { registerDevice, type DevicePlatform } from '../api/deviceApi';

export function usePushRegistration(): void {
  useEffect(() => {
    if (!Device.isDevice) {
      // Simulators / emulators cannot receive push notifications
      return;
    }

    async function register() {
      // Request permission
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        console.warn('[Push] Permission denied — skipping token registration.');
        return;
      }

      // Android requires a notification channel
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#1e3a5f',
        });
      }

      // Get native FCM/APNs token
      const deviceTokenResult = await Notifications.getDevicePushTokenAsync();
      const platform: DevicePlatform =
        Platform.OS === 'ios' ? 'IOS' : 'ANDROID';

      // Also get Expo push token (useful for dev / Expo Go testing)
      let expoPushToken: string | undefined;
      try {
        const expoResult = await Notifications.getExpoPushTokenAsync();
        expoPushToken = expoResult.data;
      } catch {
        // Expo push service may not be configured; ignore
      }

      await registerDevice({
        pushToken: deviceTokenResult.data,
        platform,
        expoPushToken,
      });
    }

    void register();

    // Re-register if the OS rotates the token
    const sub = Notifications.addPushTokenListener((token) => {
      void registerDevice({
        pushToken: token.data,
        platform: Platform.OS === 'ios' ? 'IOS' : 'ANDROID',
      });
    });

    return () => sub.remove();
  }, []);
}

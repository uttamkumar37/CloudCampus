/**
 * useNotificationListeners — subscribes to foreground and tap-response
 * notification events for the lifetime of the authenticated session.
 *
 * Foreground handler:  shows a banner while the app is open.
 * Response handler:    handles deep-link navigation when the user taps a
 *                      notification (background or killed state).
 *
 * Mount once inside the authenticated app layout.
 */
import { useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import type { EventSubscription } from 'expo-modules-core';

// Configure how foreground notifications are presented
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/** Notification data payload shape sent from the backend */
interface NotificationData {
  type?: 'ATTENDANCE' | 'FEE_DUE' | 'EXAM_RESULT' | 'ANNOUNCEMENT';
  targetRoute?: string; // Expo Router path to navigate to on tap
  tenantId?: string;
}

export function useNotificationListeners(): void {
  const router = useRouter();
  const receivedSub = useRef<EventSubscription | null>(null);
  const responseSub = useRef<EventSubscription | null>(null);

  useEffect(() => {
    // Foreground: notification arrives while app is open
    receivedSub.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        const data = notification.request.content.data as NotificationData;
        // Trigger offline sync on silent sync notifications
        if (data?.type === 'ATTENDANCE') {
          // Imported lazily to avoid circular deps with database
          void import('@/offline/sync/syncEngine').then(({ flushAttendanceSync }) =>
            flushAttendanceSync(),
          );
        }
      },
    );

    // Response: user tapped a notification
    responseSub.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data as NotificationData;
        if (data?.targetRoute) {
          router.push(data.targetRoute as Parameters<typeof router.push>[0]);
        }
      },
    );

    return () => {
      receivedSub.current?.remove();
      responseSub.current?.remove();
    };
  }, [router]);
}

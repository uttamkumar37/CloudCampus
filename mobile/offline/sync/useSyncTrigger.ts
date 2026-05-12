/**
 * useSyncTrigger — fires flushAttendanceSync on:
 *   • App foreground transition (AppState: background → active)
 *   • Network connectivity restored (NetInfo: offline → online)
 *
 * Mount this once inside the authenticated app layout.
 */
import { useEffect } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { flushAttendanceSync } from '../sync/syncEngine';

export function useSyncTrigger(): void {
  useEffect(() => {
    // Foreground trigger
    function onAppStateChange(state: AppStateStatus) {
      if (state === 'active') {
        void flushAttendanceSync();
      }
    }
    const appStateSub = AppState.addEventListener('change', onAppStateChange);

    // Connectivity trigger
    const netInfoUnsub = NetInfo.addEventListener((state) => {
      if (state.isConnected) {
        void flushAttendanceSync();
      }
    });

    return () => {
      appStateSub.remove();
      netInfoUnsub();
    };
  }, []);
}

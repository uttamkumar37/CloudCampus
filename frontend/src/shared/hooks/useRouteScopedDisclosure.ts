import { useCallback, useState } from 'react';
import { useLocation } from 'react-router-dom';

export function useRouteScopedDisclosure() {
  const location = useLocation();
  const [openLocationKey, setOpenLocationKey] = useState<string | null>(null);

  const open = useCallback(() => setOpenLocationKey(location.key), [location.key]);
  const close = useCallback(() => setOpenLocationKey(null), []);

  return {
    isOpen: openLocationKey === location.key,
    open,
    close,
  };
}

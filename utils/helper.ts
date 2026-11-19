import { useCallback, useEffect, useRef, useState } from 'react';

export function useAutoFocus(ref: React.RefObject<HTMLElement>, enabled = true) {
  useEffect(() => {
    if (enabled && ref.current) {
      ref.current.focus();
    }
  }, [ref, enabled]);
}

export function useInput() {
  const keys = useRef<Record<string, boolean>>({});
  useEffect(() => {
    const down = (e: KeyboardEvent) => { keys.current[e.code] = true; keys.current[e.key.toLowerCase()] = true; };
    const up = (e: KeyboardEvent) => { keys.current[e.code] = false; keys.current[e.key.toLowerCase()] = false; };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, []);
  return keys;
}

export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined'
      ? /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        window.innerWidth < 768
      : false
  );
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return isMobile;
}

export function useOverlayFocusNavigation(_isOpen?: boolean) {
  return { focusedIndex: 0, setFocusedIndex: () => {} };
}

export function useLevelLifecycle(_options?: any) {
  return { onLevelStart: () => {}, onLevelComplete: () => {}, onGameOver: () => {} };
}

export function useAudio() {
  const play = useCallback((_src?: string) => {}, []);
  return { play };
}

export function useSprite(_src?: string) {
  return null;
}

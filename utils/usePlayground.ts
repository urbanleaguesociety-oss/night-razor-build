import { useCallback, useEffect, useState } from 'react';

export function getPlaygroundBootState() {
  return { level: 1, score: 0, autoStart: false, persistenceEnabled: false };
}

export function usePlayground(_options?: { enabled?: boolean }) {
  const [sdk] = useState(() => ({
    startGame: () => {},
    scoreUpdated: () => {},
    levelComplete: () => {},
    gameOver: () => {},
    pauseStateChanged: () => {},
    sendGameEvent: () => {},
  }));
  return { sdk, isReady: true };
}

export function usePlaygroundResume(_options?: any) {
  return {
    initialLevel: 1,
    initialScore: 0,
    persistenceEnabled: false,
    autoStartPending: false,
  };
}

export function usePlaygroundGameLifecycle(_gameState: any, _sdk?: any) {}

export function useRpc<Req, Res>(_rpcName: string): [(payload: Req) => Promise<Res>, boolean] {
  const callRpc = useCallback((_payload: Req) => Promise.resolve(undefined as unknown as Res), []);
  return [callRpc, false];
}

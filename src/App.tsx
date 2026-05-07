import { useCallback, useEffect, useRef } from 'react';
import { initGame } from './game/main';

const GAME_CONTAINER_ID = 'game-container';

export default function App() {
  const gameRef = useRef<any>(null);

  const destroyGame = useCallback(() => {
    if (!gameRef.current) return;

    try {
      gameRef.current.destroy(true);
    } finally {
      gameRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!gameRef.current && document.getElementById(GAME_CONTAINER_ID)) {
      gameRef.current = initGame(GAME_CONTAINER_ID);
    }
  }, []);

  useEffect(() => {
    return () => {
      destroyGame();
    };
  }, []);

  return (
    <main className="app-shell">
      <div className="app-shell__backdrop" />
      <div className="game-shell">
        <div id={GAME_CONTAINER_ID} className="game-shell__container" />
      </div>
      <div className="desktop-hint">Space / Click / Tap to jump · Esc / P / Pause button</div>
    </main>
  );
}

import { useEffect, useRef } from 'react';
import { initGame } from './game/main';

export default function App() {
  const gameRef = useRef<any>(null);

  useEffect(() => {
    if (!gameRef.current) {
      gameRef.current = initGame('game-container');
    }
    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  return null;
}

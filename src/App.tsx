import { useEffect, useRef, useState } from 'react';
import { initGame } from './game/main';

const MOBILE_BREAKPOINT = 900;
const GAME_CONTAINER_ID = 'game-container';

function isMobileLayout() {
  return window.innerWidth < MOBILE_BREAKPOINT
    || window.matchMedia('(hover: none) and (pointer: coarse)').matches;
}

export default function App() {
  const gameRef = useRef<any>(null);
  const [mobileLayout, setMobileLayout] = useState(() => isMobileLayout());

  useEffect(() => {
    let resizeAnimationFrameId = 0;
    const handleResize = () => {
      cancelAnimationFrame(resizeAnimationFrameId);
      resizeAnimationFrameId = window.requestAnimationFrame(() => {
        setMobileLayout(isMobileLayout());
      });
    };

    window.addEventListener('resize', handleResize);
    return () => {
      cancelAnimationFrame(resizeAnimationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (mobileLayout) {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
      return;
    }

    if (!gameRef.current && document.getElementById(GAME_CONTAINER_ID)) {
      gameRef.current = initGame(GAME_CONTAINER_ID);
    }
  }, [mobileLayout]);

  useEffect(() => {
    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  return (
    <main className={`app-shell${mobileLayout ? ' app-shell--mobile' : ''}`}>
      <div className="app-shell__backdrop" />

      {mobileLayout ? (
        <section className="mobile-card">
          <p className="mobile-card__eyebrow">Desktop experience</p>
          <h1 className="mobile-card__title">NeonDash</h1>
          <p className="mobile-card__description">
            This game is tuned for a larger screen with keyboard or mouse controls.
          </p>
          <div className="mobile-card__tips">
            <span>Best on desktop or laptop</span>
            <span>Space / Click to jump</span>
            <span>Esc / P to pause</span>
          </div>
          <p className="mobile-card__footer">
            On mobile, the gameplay is disabled so the UI stays readable and easy to use.
          </p>
        </section>
      ) : (
        <>
          <div className="game-shell">
            <div id={GAME_CONTAINER_ID} className="game-shell__container" />
          </div>
          <div className="desktop-hint">Space / Click to jump · Esc / P to pause</div>
        </>
      )}
    </main>
  );
}

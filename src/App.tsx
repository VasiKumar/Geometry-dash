import { useCallback, useEffect, useRef, useState } from 'react';
import { initGame } from './game/main';

const GAME_CONTAINER_ID = 'game-container';

export default function App() {
  const gameRef = useRef<any>(null);
  const [isPhone, setIsPhone] = useState(false);
  const [isPortrait, setIsPortrait] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenError, setFullscreenError] = useState('');

  const syncViewportState = useCallback(() => {
    const hasTouchInput =
      window.matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0;
    const smallestSide = Math.min(window.innerWidth, window.innerHeight);

    setIsPhone(hasTouchInput && smallestSide <= 1024);
    setIsPortrait(window.innerHeight > window.innerWidth);
    setIsFullscreen(Boolean(document.fullscreenElement));
  }, []);

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
    syncViewportState();

    window.addEventListener('resize', syncViewportState);
    window.addEventListener('orientationchange', syncViewportState);
    document.addEventListener('fullscreenchange', syncViewportState);

    return () => {
      window.removeEventListener('resize', syncViewportState);
      window.removeEventListener('orientationchange', syncViewportState);
      document.removeEventListener('fullscreenchange', syncViewportState);
      destroyGame();
    };
  }, [destroyGame, syncViewportState]);

  const handleFullscreen = useCallback(async () => {
    const page = document.documentElement as HTMLElement & {
      webkitRequestFullscreen?: () => Promise<void> | void;
    };

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        setFullscreenError('');
      } else if (page.requestFullscreen) {
        await page.requestFullscreen();
        setFullscreenError('');
      } else {
        if (page.webkitRequestFullscreen) {
          await page.webkitRequestFullscreen();
          setFullscreenError('');
        } else {
          setFullscreenError('Fullscreen is not available on this phone browser.');
        }
      }
    } catch {
      setFullscreenError('Fullscreen could not start. You can still play directly on your phone.');
    } finally {
      syncViewportState();
    }
  }, [syncViewportState]);

  const showRotatePrompt = isPhone && isPortrait;
  const showPhoneControls = isPhone && !isPortrait;
  const appShellClassName = [
    'app-shell',
    isPhone ? 'app-shell--phone' : '',
    showRotatePrompt ? 'app-shell--mobile' : '',
  ]
    .filter(Boolean)
    .join(' ');
  const gameShellClassName = ['game-shell', showRotatePrompt ? 'game-shell--dimmed' : '']
    .filter(Boolean)
    .join(' ');
  const mobileStatusMessage = showRotatePrompt
    ? 'Turn your phone sideways to play.'
    : 'Tap anywhere to jump. Use the pause button anytime.';

  return (
    <main className={appShellClassName}>
      <div className="app-shell__backdrop" />
      <div className={gameShellClassName}>
        <div id={GAME_CONTAINER_ID} className="game-shell__container" />
      </div>

      {isPhone ? (
        <div className="mobile-status" role="status" aria-live="polite">
          <span className="mobile-status__message">{mobileStatusMessage}</span>
          {fullscreenError && <span className="mobile-status__detail">{fullscreenError}</span>}
          {!isFullscreen && (
            <button type="button" className="mobile-action" onClick={handleFullscreen}>
              Fullscreen
            </button>
          )}
        </div>
      ) : (
        <div className="desktop-hint">Space / Click / Tap to jump · Esc / P / Pause button</div>
      )}

      {showRotatePrompt && (
        <section className="mobile-card mobile-rotate-overlay" aria-live="polite">
          <p className="mobile-card__eyebrow">Phone Mode</p>
          <h1 className="mobile-card__title">Rotate your phone</h1>
          <p className="mobile-card__description">
            Turn your phone sideways to actually play the game. Once you are in landscape,
            tap anywhere on the screen to jump and use the pause button in the corner when needed.
          </p>
          <div className="mobile-card__tips">
            <span>Landscape mode</span>
            <span>Tap to jump</span>
            <span>Play directly on phone</span>
          </div>
          <p className="mobile-card__footer">
            No computer needed — this version is ready to play right on your phone.
          </p>
        </section>
      )}

      {showPhoneControls && (
        <div className="mobile-landscape-hint">Phone controls: tap to jump and pause from the top-right corner.</div>
      )}
    </main>
  );
}

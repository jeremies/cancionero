import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
  type MouseEvent,
} from 'react';
import {
  SONGS,
  formatAvailableRange,
  getAdjacentSongs,
  getSongByNumber,
  parseSongNumberInput,
} from '../data/songs';
import type { Theme } from '../hooks/useTheme';
import type { Song } from '../types/song';
import {
  buildHomeHash,
  buildShareUrl,
  buildSongHash,
} from '../utils/routing';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  ChevronDownIcon,
  MoonIcon,
  ScreenAwakeIcon,
  ShareIcon,
  SunIcon,
} from './Icons';

interface SongViewProps {
  songNumber: number;
  song: Song | undefined;
  theme: Theme;
  onToggleTheme: () => void;
  onGoHome: () => void;
  onSelectSong: (songNumber: number) => void;
  fontScale: {
    scale: number;
    increase: () => void;
    decrease: () => void;
    canIncrease: boolean;
    canDecrease: boolean;
  };
  wakeLock: {
    isSupported: boolean;
    isActive: boolean;
    enabled: boolean;
    toggle: () => void;
  };
}

export function SongView({
  songNumber,
  song,
  theme,
  onToggleTheme,
  onGoHome,
  onSelectSong,
  fontScale,
  wakeLock,
}: SongViewProps) {
  const [jumpOpen, setJumpOpen] = useState(false);
  const [jumpInput, setJumpInput] = useState('');
  const [jumpError, setJumpError] = useState<string | null>(null);
  const [copyNotice, setCopyNotice] = useState<string | null>(null);

  const jumpContainerRef = useRef<HTMLDivElement | null>(null);
  const jumpInputRef = useRef<HTMLInputElement | null>(null);
  const copyTimerRef = useRef<number | null>(null);

  const availableRange = formatAvailableRange();
  const { prev, next } = song ? getAdjacentSongs(song.number) : {};

  useEffect(() => {
    setJumpOpen(false);
    setJumpInput('');
    setJumpError(null);
    setCopyNotice(null);
  }, [songNumber]);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current !== null) {
        window.clearTimeout(copyTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!jumpOpen) {
      return;
    }

    jumpInputRef.current?.focus();

    const handlePointerDown = (event: PointerEvent) => {
      if (
        jumpContainerRef.current &&
        !jumpContainerRef.current.contains(event.target as Node)
      ) {
        setJumpOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setJumpOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [jumpOpen]);

  useEffect(() => {
    if (!song || jumpOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) {
        return;
      }
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName;
      if (
        tag === 'INPUT' ||
        tag === 'TEXTAREA' ||
        tag === 'SELECT' ||
        target?.isContentEditable
      ) {
        return;
      }

      if (event.key === 'ArrowLeft' && prev) {
        event.preventDefault();
        onSelectSong(prev.number);
      } else if (event.key === 'ArrowRight' && next) {
        event.preventDefault();
        onSelectSong(next.number);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [song, jumpOpen, prev, next, onSelectSong]);

  const handleLinkClick = (
    event: MouseEvent<HTMLAnchorElement>,
    action: () => void,
  ) => {
    if (
      !event.metaKey &&
      !event.ctrlKey &&
      !event.shiftKey &&
      !event.altKey &&
      event.button === 0
    ) {
      event.preventDefault();
      action();
    }
  };

  const handleJumpSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsed = parseSongNumberInput(jumpInput);
    if (parsed === null) {
      setJumpError(`Escribe un número válido (${availableRange}).`);
      return;
    }
    const targetSong = getSongByNumber(parsed);
    if (!targetSong) {
      setJumpError(
        `No existe la canción #${parsed}. Disponibles: ${availableRange}.`,
      );
      return;
    }
    setJumpError(null);
    setJumpOpen(false);
    setJumpInput('');
    onSelectSong(targetSong.number);
  };

  const showCopyFeedback = (message: string) => {
    setCopyNotice(message);
    if (copyTimerRef.current !== null) {
      window.clearTimeout(copyTimerRef.current);
    }
    copyTimerRef.current = window.setTimeout(() => {
      setCopyNotice(null);
    }, 2400);
  };

  const handleShare = async () => {
    if (!song) {
      return;
    }
    const url = buildShareUrl(song.number);
    const title = `${song.number}. ${song.title} — Cancionero`;

    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title, url });
        return;
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
      }
    }

    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(url);
        showCopyFeedback('Enlace copiado');
        return;
      } catch {
        // Clipboard permission denied or unavailable.
      }
    }
    showCopyFeedback(buildSongHash(song.number));
  };

  if (!song) {
    return (
      <div className="page-shell">
        <header className="song-toolbar">
          <div className="song-toolbar-inner">
            <a
              href={buildHomeHash()}
              className="toolbar-back"
              onClick={(e) => handleLinkClick(e, onGoHome)}
            >
              <ArrowLeftIcon />
              <span>Índice</span>
            </a>
            <button
              type="button"
              className="icon-btn"
              onClick={onToggleTheme}
              aria-label={
                theme === 'light'
                  ? 'Cambiar a modo noche'
                  : 'Cambiar a modo día'
              }
            >
              {theme === 'light' ? <MoonIcon /> : <SunIcon />}
            </button>
          </div>
        </header>

        <main className="not-found-main">
          <div className="not-found-card">
            <span className="not-found-badge">#{songNumber}</span>
            <h1 className="not-found-title">
              No se encontró la canción #{songNumber}
            </h1>
            <p className="not-found-text">
              Las canciones disponibles en este cancionero son: {availableRange}.
            </p>

            <form
              className="not-found-form"
              onSubmit={handleJumpSubmit}
              noValidate
            >
              <label htmlFor="missing-jump" className="sr-only">
                Ir a otro número de canción
              </label>
              <input
                id="missing-jump"
                type="text"
                inputMode="numeric"
                value={jumpInput}
                onChange={(e) => {
                  setJumpInput(e.target.value);
                  if (jumpError) setJumpError(null);
                }}
                placeholder={`Número (${availableRange})...`}
                className="popover-input"
              />
              <button type="submit" className="jump-submit-btn">
                Ir
              </button>
            </form>
            {jumpError && (
              <p className="form-error" role="alert">
                {jumpError}
              </p>
            )}

            <a
              href={buildHomeHash()}
              className="secondary-btn not-found-home-link"
              onClick={(e) => handleLinkClick(e, onGoHome)}
            >
              Volver al índice
            </a>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <header className="song-toolbar">
        <div className="song-toolbar-inner">
          <a
            href={buildHomeHash()}
            className="toolbar-back"
            onClick={(e) => handleLinkClick(e, onGoHome)}
          >
            <ArrowLeftIcon />
            <span>Índice</span>
          </a>

          <div className="toolbar-jump-wrap" ref={jumpContainerRef}>
            <button
              type="button"
              className="toolbar-jump-btn"
              aria-expanded={jumpOpen}
              aria-haspopup="dialog"
              aria-label="Ir a otra canción"
              onClick={() => {
                setJumpOpen((open) => !open);
                setJumpError(null);
              }}
            >
              <span>#{song.number}</span>
              <ChevronDownIcon />
            </button>

            {jumpOpen && (
              <div
                className="jump-popover"
                role="dialog"
                aria-label="Cambiar de canción"
              >
                <form
                  className="jump-popover-form"
                  onSubmit={handleJumpSubmit}
                  noValidate
                >
                  <label htmlFor="quick-jump-input" className="sr-only">
                    Número de canción
                  </label>
                  <input
                    ref={jumpInputRef}
                    id="quick-jump-input"
                    type="text"
                    inputMode="numeric"
                    value={jumpInput}
                    onChange={(e) => {
                      setJumpInput(e.target.value);
                      if (jumpError) setJumpError(null);
                    }}
                    placeholder="Ir al #..."
                    className="popover-input"
                  />
                  <button type="submit" className="popover-go-btn">
                    Ir
                  </button>
                </form>

                {jumpError && (
                  <p className="form-error popover-error" role="alert">
                    {jumpError}
                  </p>
                )}

                <div className="popover-number-grid">
                  {SONGS.map((item) => {
                    const isCurrent = item.number === song.number;
                    return (
                      <button
                        key={item.number}
                        type="button"
                        className={`popover-num-btn${isCurrent ? ' is-current' : ''}`}
                        aria-current={isCurrent ? 'page' : undefined}
                        aria-label={`${item.number}. ${item.title}`}
                        title={item.title}
                        onClick={() => {
                          setJumpOpen(false);
                          onSelectSong(item.number);
                        }}
                      >
                        {item.number}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="toolbar-actions">
            <div className="font-controls" role="group" aria-label="Tamaño de letra">
              <button
                type="button"
                className="tool-text-btn"
                onClick={fontScale.decrease}
                disabled={!fontScale.canDecrease}
                aria-label="Reducir tamaño de letra"
                title="Reducir tamaño de letra"
              >
                A-
              </button>
              <button
                type="button"
                className="tool-text-btn"
                onClick={fontScale.increase}
                disabled={!fontScale.canIncrease}
                aria-label="Aumentar tamaño de letra"
                title="Aumentar tamaño de letra"
              >
                A+
              </button>
            </div>

            {wakeLock.isSupported && (
              <button
                type="button"
                className={`icon-btn${wakeLock.enabled ? ' is-active' : ''}`}
                aria-pressed={wakeLock.enabled}
                aria-label="Mantener pantalla encendida"
                title={
                  wakeLock.enabled
                    ? wakeLock.isActive
                      ? 'Pantalla encendida activa'
                      : 'Mantener pantalla encendida (activado)'
                    : 'Mantener pantalla encendida (desactivado)'
                }
                onClick={wakeLock.toggle}
              >
                <ScreenAwakeIcon />
              </button>
            )}

            <button
              type="button"
              className={`icon-btn${copyNotice ? ' is-active' : ''}`}
              onClick={handleShare}
              aria-label="Compartir enlace de la canción"
              title="Compartir enlace"
            >
              {copyNotice ? <CheckIcon /> : <ShareIcon />}
            </button>

            <button
              type="button"
              className="icon-btn"
              onClick={onToggleTheme}
              aria-label={
                theme === 'light'
                  ? 'Cambiar a modo noche'
                  : 'Cambiar a modo día'
              }
              title={theme === 'light' ? 'Modo noche' : 'Modo día'}
            >
              {theme === 'light' ? <MoonIcon /> : <SunIcon />}
            </button>
          </div>
        </div>
        {copyNotice && (
          <div className="toolbar-toast" role="status" aria-live="polite">
            {copyNotice}
          </div>
        )}
      </header>

      <main className="song-main">
        <article
          className="song-sheet"
          style={{ '--lyrics-scale': fontScale.scale } as CSSProperties}
        >
          <header className="song-header">
            <div className="song-number-frame">{song.number}</div>
            <h1 className="song-title">{song.title}</h1>
          </header>

          <div className="double-divider song-divider" aria-hidden="true" />

          <div className="lyrics-body">
            {song.stanzas.map((stanza, stanzaIdx) => {
              const isChorus = song.chorusStanzas?.includes(stanzaIdx) ?? false;
              return (
                <div
                  key={stanzaIdx}
                  className={isChorus ? 'stanza stanza-chorus' : 'stanza'}
                >
                  {stanza.map((line, lineIdx) => (
                    <p key={lineIdx} className="lyric-line">
                      {line}
                    </p>
                  ))}
                </div>
              );
            })}
          </div>
        </article>

        <nav className="song-pager" aria-label="Navegación entre canciones">
          {prev ? (
            <a
              href={buildSongHash(prev.number)}
              className="pager-link pager-prev"
              onClick={(e) => handleLinkClick(e, () => onSelectSong(prev.number))}
            >
              <span className="pager-direction">
                <ArrowLeftIcon />
                <span>Anterior</span>
              </span>
              <span className="pager-song-name">
                {prev.number}. {prev.title}
              </span>
            </a>
          ) : (
            <span className="pager-spacer" aria-hidden="true" />
          )}

          {next ? (
            <a
              href={buildSongHash(next.number)}
              className="pager-link pager-next"
              onClick={(e) => handleLinkClick(e, () => onSelectSong(next.number))}
            >
              <span className="pager-direction">
                <span>Siguiente</span>
                <ArrowRightIcon />
              </span>
              <span className="pager-song-name">
                {next.number}. {next.title}
              </span>
            </a>
          ) : (
            <span className="pager-spacer" aria-hidden="true" />
          )}
        </nav>
      </main>
    </div>
  );
}

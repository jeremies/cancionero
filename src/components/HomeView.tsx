import { useRef, useState, type FormEvent, type MouseEvent } from 'react';
import {
  SONGS,
  filterSongs,
  formatAvailableRange,
  getSongByNumber,
  parseSongNumberInput,
} from '../data/songs';
import type { Theme } from '../hooks/useTheme';
import { buildSongHash } from '../utils/routing';
import {
  ArrowRightIcon,
  CloseIcon,
  HashIcon,
  MoonIcon,
  StarOrnamentIcon,
  SunIcon,
} from './Icons';

interface HomeViewProps {
  theme: Theme;
  onToggleTheme: () => void;
  onSelectSong: (songNumber: number) => void;
}

export function HomeView({
  theme,
  onToggleTheme,
  onSelectSong,
}: HomeViewProps) {
  const [query, setQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const filteredSongs = filterSongs(query);
  const availableRange = formatAvailableRange();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) {
      inputRef.current?.focus();
      return;
    }

    const parsedNumber = parseSongNumberInput(trimmed);
    if (parsedNumber !== null) {
      const song = getSongByNumber(parsedNumber);
      if (song) {
        setError(null);
        onSelectSong(song.number);
      } else {
        setError(
          `No existe la canción #${parsedNumber}. Disponibles: ${availableRange}.`,
        );
      }
      return;
    }

    if (filteredSongs.length === 1) {
      setError(null);
      onSelectSong(filteredSongs[0].number);
      return;
    }

    if (filteredSongs.length === 0) {
      setError(`No hay canciones que coincidan con "${trimmed}".`);
      return;
    }

    setError(null);
  };

  const handleQueryChange = (value: string) => {
    setQuery(value);
    if (error) {
      setError(null);
    }
  };

  const handleClear = () => {
    setQuery('');
    setError(null);
    inputRef.current?.focus();
  };

  const handleCardClick = (
    event: MouseEvent<HTMLAnchorElement>,
    songNumber: number,
  ) => {
    if (
      !event.metaKey &&
      !event.ctrlKey &&
      !event.shiftKey &&
      !event.altKey &&
      event.button === 0
    ) {
      event.preventDefault();
      onSelectSong(songNumber);
    }
  };

  return (
    <div className="page-shell">
      <header className="home-topbar">
        <span className="topbar-badge">
          <StarOrnamentIcon className="ornament-icon" />
          <span>{SONGS.length} canciones</span>
        </span>
        <button
          type="button"
          className="icon-btn"
          onClick={onToggleTheme}
          aria-label={
            theme === 'light' ? 'Cambiar a modo noche' : 'Cambiar a modo día'
          }
          title={theme === 'light' ? 'Modo noche' : 'Modo día'}
        >
          {theme === 'light' ? <MoonIcon /> : <SunIcon />}
        </button>
      </header>

      <main className="home-main">
        <section className="masthead" aria-labelledby="masthead-title">
          <div className="masthead-rule" aria-hidden="true">
            <span className="rule-line" />
            <StarOrnamentIcon className="masthead-star" />
            <span className="rule-line" />
          </div>
          <h1 id="masthead-title" className="masthead-title">
            Cancionero
          </h1>
          <p className="masthead-subtitle">Villancicos</p>
          <div className="double-divider" aria-hidden="true" />
        </section>

        <section className="jump-section" aria-label="Buscar o ir a una canción">
          <form className="jump-form" onSubmit={handleSubmit} noValidate>
            <label htmlFor="song-jump" className="jump-label">
              Ir a la canción # o buscar por título
            </label>
            <div className="jump-controls">
              <div className="jump-input-wrap">
                <HashIcon className="jump-input-icon" />
                <input
                  ref={inputRef}
                  id="song-jump"
                  type="text"
                  inputMode="search"
                  autoComplete="off"
                  value={query}
                  onChange={(e) => handleQueryChange(e.target.value)}
                  placeholder={`Escribe un número (${availableRange}) o título...`}
                  className="jump-input"
                  aria-invalid={error ? 'true' : 'false'}
                  aria-describedby={error ? 'jump-error' : undefined}
                />
                {query && (
                  <button
                    type="button"
                    className="jump-clear-btn"
                    onClick={handleClear}
                    aria-label="Limpiar búsqueda"
                  >
                    <CloseIcon />
                  </button>
                )}
              </div>
              <button type="submit" className="jump-submit-btn">
                Ir
              </button>
            </div>
            {error && (
              <p id="jump-error" className="form-error" role="alert">
                {error}
              </p>
            )}
          </form>
        </section>

        <section className="index-section" aria-labelledby="index-heading">
          <div className="index-heading-row">
            <h2 id="index-heading" className="index-heading">
              Índice de canciones
            </h2>
            {query.trim() && (
              <span className="index-count">
                {filteredSongs.length}{' '}
                {filteredSongs.length === 1 ? 'resultado' : 'resultados'}
              </span>
            )}
          </div>

          {filteredSongs.length > 0 ? (
            <ol className="song-grid">
              {filteredSongs.map((song) => (
                <li key={song.number} className="song-grid-item">
                  <a
                    href={buildSongHash(song.number)}
                    className="song-card"
                    onClick={(e) => handleCardClick(e, song.number)}
                  >
                    <span className="song-card-number">{song.number}</span>
                    <span className="song-card-title">{song.title}</span>
                    <span className="song-card-arrow" aria-hidden="true">
                      <ArrowRightIcon />
                    </span>
                  </a>
                </li>
              ))}
            </ol>
          ) : (
            <div className="empty-state">
              <p className="empty-state-text">
                No se encontraron canciones para "{query.trim()}".
              </p>
              <button
                type="button"
                className="secondary-btn"
                onClick={handleClear}
              >
                Ver todas las canciones
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

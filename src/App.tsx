import { HomeView } from './components/HomeView';
import { SongView } from './components/SongView';
import { getSongByNumber } from './data/songs';
import { useFontScale } from './hooks/useFontScale';
import { useHashRoute } from './hooks/useHashRoute';
import { useTheme } from './hooks/useTheme';
import { useWakeLock } from './hooks/useWakeLock';

export function App() {
  const { route, goToSong, goHome } = useHashRoute();
  const { theme, toggleTheme } = useTheme();
  const fontScale = useFontScale();

  const currentSong =
    route.view === 'song' ? getSongByNumber(route.songNumber) : undefined;
  const wakeLock = useWakeLock(route.view === 'song' && Boolean(currentSong));

  if (route.view === 'song') {
    return (
      <SongView
        songNumber={route.songNumber}
        song={currentSong}
        theme={theme}
        onToggleTheme={toggleTheme}
        onGoHome={goHome}
        onSelectSong={goToSong}
        fontScale={fontScale}
        wakeLock={wakeLock}
      />
    );
  }

  return (
    <HomeView
      theme={theme}
      onToggleTheme={toggleTheme}
      onSelectSong={goToSong}
    />
  );
}

export default App;

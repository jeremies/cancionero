import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { App } from './App';

describe('Cancionero App', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.location.hash = '';
    delete document.documentElement.dataset.theme;
  });

  afterEach(() => {
    cleanup();
  });

  it('renders the home index with all 27 songs without subtitle and jumps directly by number', async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(
      screen.getByRole('heading', { name: 'Cancionero' }),
    ).toBeInTheDocument();
    expect(screen.queryByText('Villancicos')).not.toBeInTheDocument();
    expect(document.title).toBe('Cancionero');
    expect(screen.getAllByRole('link')).toHaveLength(27);

    const input = screen.getByLabelText(/Ir a la canción/i);
    await user.type(input, '17');
    await user.click(screen.getByRole('button', { name: 'Ir' }));

    expect(window.location.hash).toBe('#/17');
    expect(
      screen.getByRole('heading', { name: 'Rin, Rin' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Hacia Belén va una burra, RIN RIN,'),
    ).toBeInTheDocument();
  });

  it('shows an accessible error when jumping to an unavailable song number', async () => {
    const user = userEvent.setup();
    render(<App />);

    const input = screen.getByLabelText(/Ir a la canción/i);
    await user.type(input, '99');
    await user.click(screen.getByRole('button', { name: 'Ir' }));

    expect(screen.getByRole('alert')).toHaveTextContent(
      'No existe la canción #99',
    );
    expect(window.location.hash).toBe('');
  });

  it('filters songs by title on the home screen', async () => {
    const user = userEvent.setup();
    render(<App />);

    const input = screen.getByLabelText(/Ir a la canción/i);
    await user.type(input, 'peces');

    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveTextContent('Los peces en el río');
  });

  it('opens direct hash route #/14, adjusts font size, toggles theme, and navigates between songs', async () => {
    const user = userEvent.setup();
    window.location.hash = '#/14';
    render(<App />);

    expect(
      screen.getByRole('heading', { name: 'El Tamborilero' }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByText('El camino que lleva a Belén').length,
    ).toBeGreaterThan(0);
    expect(screen.getByText('Cuando Dios me vió tocando')).toBeInTheDocument();

    const article = document.querySelector('article.song-sheet') as HTMLElement;
    expect(article.style.getPropertyValue('--lyrics-scale')).toBe('1.05');

    await user.click(
      screen.getByRole('button', { name: 'Aumentar tamaño de letra' }),
    );
    expect(article.style.getPropertyValue('--lyrics-scale')).toBe('1.18');
    expect(window.localStorage.getItem('cancionero:fontStep')).toBe('3');

    await user.click(
      screen.getByRole('button', { name: 'Reducir tamaño de letra' }),
    );
    expect(article.style.getPropertyValue('--lyrics-scale')).toBe('1.05');

    await user.click(
      screen.getByRole('button', { name: /Cambiar a modo noche/i }),
    );
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(window.localStorage.getItem('cancionero:theme')).toBe('dark');

    await user.click(
      screen.getByRole('button', { name: 'Ir a otra canción' }),
    );
    await user.click(
      screen.getByRole('button', { name: /19\. !Ay, del Chiquirritín!/i }),
    );
    expect(window.location.hash).toBe('#/19');
    expect(
      screen.getByRole('heading', { name: '!Ay, del Chiquirritín!' }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: /Siguiente/i }));
    expect(window.location.hash).toBe('#/20');
    expect(
      screen.getByRole('heading', { name: 'Adeste fideles' }),
    ).toBeInTheDocument();
  });

  it('renders chorus bar styling on chorus stanzas', () => {
    window.location.hash = '#/21';
    render(<App />);

    expect(
      screen.getByRole('heading', { name: 'Cielito lindo' }),
    ).toBeInTheDocument();

    const chorusStanzas = document.querySelectorAll('.stanza-chorus');
    expect(chorusStanzas).toHaveLength(1);
    expect(chorusStanzas[0]).toHaveTextContent('Ay, ay, ay, ay,');
  });

  it('renders Spanish not-found view for invalid song hash #/99', () => {
    window.location.hash = '#/99';
    render(<App />);

    expect(
      screen.getByRole('heading', { name: 'No se encontró la canción #99' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Volver al índice' }),
    ).toBeInTheDocument();
  });
});

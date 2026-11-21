import { describe, expect, it } from 'vitest';
import {
  SONGS,
  filterSongs,
  formatAvailableRange,
  getAdjacentSongs,
  getSongByNumber,
  parseSongNumberInput,
} from './songs';
import { parseHashRoute } from '../utils/routing';

describe('songs catalog', () => {
  it('contains all 10 villancicos numbered 1 through 10 with exact titles', () => {
    expect(SONGS).toHaveLength(10);
    expect(SONGS.map((s) => [s.number, s.title])).toEqual([
      [1, 'Feliz Navidad'],
      [2, 'Campana sobre campana'],
      [3, 'Los peces en el río'],
      [4, 'El Tamborilero'],
      [5, 'Noche de Paz'],
      [6, 'Les anges dans nos campagnes'],
      [7, 'Rin, Rin'],
      [8, 'La Marimorena'],
      [9, '!Ay, del Chiquirritín!'],
      [10, 'Adeste fideles'],
    ]);
    expect(formatAvailableRange()).toBe('1–10');
  });

  it('preserves verbatim PDF text and spelling quirks', () => {
    const song3 = getSongByNumber(3)?.stanzas.flat().join('\n') ?? '';
    expect(song3).toContain('por ver a Dios Nacer.');
    expect(song3).toContain('Beben y Beben y vuelven a Beber');

    const song4 = getSongByNumber(4)?.stanzas.flat().join('\n') ?? '';
    expect(song4).toContain('que con mi tambor!');
    expect(song4).toContain('Cuando Dios me vió tocando');
    expect(song4).toContain('ante El me sonrió.');

    const song8 = getSongByNumber(8)?.stanzas.flat().join('\n') ?? '';
    expect(song8).toContain('hacen Luna los pastores');

    const song9 = getSongByNumber(9);
    expect(song9?.title).toBe('!Ay, del Chiquirritín!');
    const song9Text = song9?.stanzas.flat().join('\n') ?? '';
    expect(song9Text).toContain('queridin, queridito del alma.');
    expect(song9Text).toContain('mírame con los hojos que yo te miro.');

    const song10 = getSongByNumber(10)?.stanzas.flat().join('\n') ?? '';
    expect(song10).toContain('Delum Infantem, pannis involutum.');
  });

  it('parses song numbers with optional leading hash and ignores non-positive values', () => {
    expect(parseSongNumberInput('4')).toBe(4);
    expect(parseSongNumberInput('  #10  ')).toBe(10);
    expect(parseSongNumberInput('0')).toBeNull();
    expect(parseSongNumberInput('-3')).toBeNull();
    expect(parseSongNumberInput('abc')).toBeNull();
  });

  it('filters songs by number prefix or accent-insensitive title', () => {
    expect(filterSongs('1').map((s) => s.number)).toEqual([1, 10]);
    expect(filterSongs('peces').map((s) => s.number)).toEqual([3]);
    expect(filterSongs('rio').map((s) => s.number)).toEqual([3]);
    expect(filterSongs('chiquirritin').map((s) => s.number)).toEqual([9]);
    expect(filterSongs('   ')).toHaveLength(10);
  });

  it('returns adjacent songs cleanly at boundaries and middle', () => {
    expect(getAdjacentSongs(1)).toEqual({
      prev: undefined,
      next: expect.objectContaining({ number: 2 }),
    });
    expect(getAdjacentSongs(5)).toEqual({
      prev: expect.objectContaining({ number: 4 }),
      next: expect.objectContaining({ number: 6 }),
    });
    expect(getAdjacentSongs(10)).toEqual({
      prev: expect.objectContaining({ number: 9 }),
      next: undefined,
    });
  });
});

describe('hash routing parser', () => {
  it('parses direct song hashes and falls back to home for invalid routes', () => {
    expect(parseHashRoute('#/4')).toEqual({ view: 'song', songNumber: 4 });
    expect(parseHashRoute('#4')).toEqual({ view: 'song', songNumber: 4 });
    expect(parseHashRoute('#/song/10')).toEqual({ view: 'song', songNumber: 10 });
    expect(parseHashRoute('')).toEqual({ view: 'home' });
    expect(parseHashRoute('#/')).toEqual({ view: 'home' });
    expect(parseHashRoute('#/0')).toEqual({ view: 'home' });
    expect(parseHashRoute('#/abc')).toEqual({ view: 'home' });
  });
});

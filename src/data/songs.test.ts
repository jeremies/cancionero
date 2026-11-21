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
  it('contains all 27 songs numbered 1 through 27 with exact titles', () => {
    expect(SONGS).toHaveLength(27);
    expect(SONGS.map((s) => [s.number, s.title])).toEqual([
      [1, "A Betlem me'n vull anar"],
      [2, 'El desembre congelat'],
      [3, 'El dimoni escuat'],
      [4, 'El rabadà'],
      [5, 'El trineu'],
      [6, 'Fum, fum, fum'],
      [7, "L'àngel i els pastors"],
      [8, 'Les dotze van tocant'],
      [9, "Què li darem a n'el Noi de la Mare"],
      [10, 'Sant Josep i la Mare de Déu'],
      [11, 'Feliz Navidad'],
      [12, 'Campana sobre campana'],
      [13, 'Los peces en el río'],
      [14, 'El Tamborilero'],
      [15, 'Noche de Paz'],
      [16, 'Les anges dans nos campagnes'],
      [17, 'Rin, Rin'],
      [18, 'La Marimorena'],
      [19, '!Ay, del Chiquirritín!'],
      [20, 'Adeste fideles'],
      [21, 'Cielito lindo'],
      [22, 'La sirena'],
      [23, 'Despierta'],
      [24, 'Clavelitos'],
      [25, "És l'hora dels adéus"],
      [26, 'Esta noche no alumbra'],
      [27, 'Triste y sola'],
    ]);
    expect(formatAvailableRange()).toBe('1–27');
  });

  it('preserves verbatim PDF text, spelling quirks, and chorus metadata', () => {
    expect(getSongByNumber(2)?.title).toBe('El desembre congelat');
    expect(getSongByNumber(6)?.title).toBe('Fum, fum, fum');

    const song4 = getSongByNumber(4)?.stanzas.flat().join('\n') ?? '';
    expect(song4).toContain('Doncs un angel que, volant, (2)');

    const song6 = getSongByNumber(6)?.stanzas.flat().join('\n') ?? '';
    expect(song6).toContain('ros i blanquet, ros i blanquet;');
    expect(song6).toContain('FUM, FUM, FUM (2),');
    expect(song6).toContain('faci fred, facil calor,');

    const song9 = getSongByNumber(9)?.stanzas.flat().join('\n') ?? '';
    expect(song9).toContain('Què li darem en el Noi de la Mare?');

    const song10 = getSongByNumber(10)?.stanzas.flat().join('\n') ?? '';
    expect(song10).toContain('Feren companyia bonà;');
    expect(song10).toContain('La Mare canta i el Fillet dorm.');

    const song13 = getSongByNumber(13)?.stanzas.flat().join('\n') ?? '';
    expect(song13).toContain('por ver a Dios Nacer.');
    expect(song13).toContain('Beben y Beben y vuelven a Beber');

    const song14 = getSongByNumber(14)?.stanzas.flat().join('\n') ?? '';
    expect(song14).toContain('que con mi tambor!');
    expect(song14).toContain('Cuando Dios me vió tocando');
    expect(song14).toContain('ante El me sonrió.');

    const song18 = getSongByNumber(18)?.stanzas.flat().join('\n') ?? '';
    expect(song18).toContain('hacen Luna los pastores');

    const song19 = getSongByNumber(19);
    expect(song19?.title).toBe('!Ay, del Chiquirritín!');
    const song19Text = song19?.stanzas.flat().join('\n') ?? '';
    expect(song19Text).toContain('queridin, queridito del alma.');
    expect(song19Text).toContain('mírame con los hojos que yo te miro.');

    const song20 = getSongByNumber(20)?.stanzas.flat().join('\n') ?? '';
    expect(song20).toContain('Delum Infantem, pannis involutum.');

    const song21 = getSongByNumber(21);
    expect(song21?.chorusStanzas).toEqual([1]);

    const song22 = getSongByNumber(22);
    expect(song22?.chorusStanzas).toEqual([2]);
    expect(song22?.stanzas.flat().join('\n')).toContain('Quién su canción escuchó');

    const song24 = getSongByNumber(24);
    expect(song24?.chorusStanzas).toEqual([1]);
    const song24Text = song24?.stanzas.flat().join('\n') ?? '';
    expect(song24Text).toContain('Que pá eso no hay que tener');
    expect(song24Text).toContain('Si tu me das esa miel');

    const song27 = getSongByNumber(27)?.stanzas.flat().join('\n') ?? '';
    expect(song27).toContain('en el Monte de Piedad .');
  });

  it('parses song numbers with optional leading hash and ignores non-positive values', () => {
    expect(parseSongNumberInput('4')).toBe(4);
    expect(parseSongNumberInput('  #10  ')).toBe(10);
    expect(parseSongNumberInput('0')).toBeNull();
    expect(parseSongNumberInput('-3')).toBeNull();
    expect(parseSongNumberInput('abc')).toBeNull();
  });

  it('filters songs by number prefix or accent-insensitive title', () => {
    expect(filterSongs('1').map((s) => s.number)).toEqual([
      1, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
    ]);
    expect(filterSongs('peces').map((s) => s.number)).toEqual([13]);
    expect(filterSongs('rio').map((s) => s.number)).toEqual([13]);
    expect(filterSongs('chiquirritin').map((s) => s.number)).toEqual([19]);
    expect(filterSongs('rabada').map((s) => s.number)).toEqual([4]);
    expect(filterSongs('l’angel').map((s) => s.number)).toEqual([7]);
    expect(filterSongs('adeus').map((s) => s.number)).toEqual([25]);
    expect(filterSongs('   ')).toHaveLength(27);
  });

  it('returns adjacent songs cleanly at boundaries and middle', () => {
    expect(getAdjacentSongs(1)).toEqual({
      prev: undefined,
      next: expect.objectContaining({ number: 2 }),
    });
    expect(getAdjacentSongs(14)).toEqual({
      prev: expect.objectContaining({ number: 13 }),
      next: expect.objectContaining({ number: 15 }),
    });
    expect(getAdjacentSongs(27)).toEqual({
      prev: expect.objectContaining({ number: 26 }),
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

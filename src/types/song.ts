export interface Song {
  number: number;
  title: string;
  stanzas: string[][];
  /** Optional 0-based indices into `stanzas` representing chorus blocks with a left accent bar. */
  chorusStanzas?: number[];
}

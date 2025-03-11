export interface ChordsDB {
  main: Main;
  tunings: Tunings;
  keys: string[];
  suffixes: string[];
  chords: Chords;
}

export interface Main {
  strings: number;
  fretsOnChord: number;
  name: string;
  numberOfChords: number;
}

export interface Tunings {
  standard: string[];
}

export interface ChordPosition {
  frets: number[];
  fingers: number[];
  baseFret: number;
  barres: number[];
  midi: number[];
  capo?: boolean;
}

export interface Chord {
  key: string;
  suffix: string;
  positions: ChordPosition[];
}

export type ChordName =
  | "C"
  | "Csharp"
  | "D"
  | "Eb"
  | "E"
  | "F"
  | "Fsharp"
  | "G"
  | "Ab"
  | "A"
  | "Bb"
  | "B";

export type Chords = Record<ChordName, Chord[]>;

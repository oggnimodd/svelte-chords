export type Orientation = "horizontal" | "vertical";

// Replace your old "ChordDefinition" with this:
export type ChordDefinition = {
  // e.g. [3,0,0,0,3,3] or [1,1,1,3,4,1], or "x" for skipped strings
  frets: Array<number | "x"> | string;

  // e.g. [1,0,0,0,2,3]
  fingers: number[] | string;

  // e.g. 1 for open chords, or 5 for chords starting at 5th fret, etc.
  baseFret: number;

  barres?: number[];

  // If it’s a “true” barre chord, set capo=true
  capo?: boolean;

  // If your DB has MIDI data, keep it. Otherwise omit.
  midi?: number[];
};

export type InstrumentType = "guitar" | "ukulele";

export type NutProps = {
  width: number;
  height: number;
  color: string;
  parentWidth: number;
  orientation: Orientation;
  x?: number;
  y?: number;
};

export type DotProps = {
  x: number;
  y: number;
  radius: number;
  color: string;
  showFingerNumber: boolean;
  fingerNumber?: number | string;
};

export type StringMarkerProps = {
  type: "o" | "x";
  stringIndex: number;
  orientation: Orientation;
  stringSpacing: number;
  stringCount: number;
  x?: number;
  y?: number;
};

export type BarreProps = {
  // These values are already computed in pixel coordinates by the parent.
  start: number;
  end: number;
  fret: number;
  thickness: number;
  color: string;
  orientation: Orientation;
};

export type NeckProps = {
  stringCount: number;
  fretCount: number;
  stringSpacing: number;
  fretSpacing: number;
  stringWidth: number;
  fretWidth: number;
  stringColor: string;
  fretColor: string;
  orientation: Orientation;
  skipFirstFretLine?: boolean;
  x?: number;
  y?: number;
};

export type ChordDiagramProps = {
  chord: ChordDefinition;
  instrument: InstrumentType;
  orientation?: Orientation;
  nutWidth?: number;
  nutColor?: string;
  dotRadius?: number;
  dotColor?: string;
  stringColor?: string;
  stringWidth?: number;
  fretColor?: string;
  fretWidth?: number;
  showFingerNumber?: boolean;
  barreColor?: string;
  barreThickness?: number;
  backgroundColor?: string;
  titleFontSize?: number;
  titleFontFamily?: string;
  titleColor?: string;
  showTitle?: boolean;
  markerSize?: number;
  markerColor?: string;
  boxAspectRatio?: number;
  ref?: HTMLOrSVGElement;
};

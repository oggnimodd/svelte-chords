export type Orientation = "horizontal" | "vertical";

export type ChordDefinition = {
  // Either a string (e.g. "x32010" or "xx5558") or an array of numbers,
  // e.g. [1,3,3,2,1,1]
  frets: string | number[];
  // Either a string (e.g. "032010") or an array of numbers, e.g. [1,3,3,2,1,1]
  fingers: string | number[];
  // A single barre fret or an array of barre frets.
  barres?: number | number[];
  // If true, force start at fret 1 regardless of fretting.
  capo?: boolean;
};

export type InstrumentType = "guitar" | "ukulele";

export type NutProps = {
  width: number;
  height: number;
  color: string;
};

export type DotProps = {
  x: number;
  y: number;
  radius: number;
  color: string;
  showFingerNumber: boolean;
  fingerNumber?: string;
};

export type StringMarkerProps = {
  x: number;
  y: number;
  marker: string;
  size: number;
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
  fretColor?: string;
  showFingerNumbers?: boolean;
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
};

<script lang="ts">
  import Nut from "./Nut.svelte";
  import Neck from "./Neck.svelte";
  import type {
    ChordDefinition,
    InstrumentType,
    Orientation,
    ChordDiagramProps,
  } from "./types.js";

  // Destructure component props using $props()
  let {
    chord,
    instrument = "guitar",
    orientation = "horizontal",
    nutWidth = 10,
    nutColor = "black",
    stringColor = "gray",
    stringWidth = 1,
    fretColor = "gray",
    fretWidth = 1,
    boxAspectRatio = 1,
  }: ChordDiagramProps = $props();

  // Determine number of strings and frets based on instrument type.
  const stringCount = instrument === "guitar" ? 6 : 4;
  const fretCount = instrument === "guitar" ? 5 : 4;

  // Virtual coordinate system
  let coordWidth = $state(100);

  // Derived dimensions
  let fretSpacing = $derived(() => {
    if (orientation === "horizontal") {
      return coordWidth / fretCount;
    } else {
      return boxAspectRatio * (coordWidth / (stringCount - 1));
    }
  });

  let stringSpacing = $derived(() => {
    if (orientation === "horizontal") {
      return fretSpacing() / boxAspectRatio;
    } else {
      return coordWidth / (stringCount - 1);
    }
  });

  let neckWidth = $derived(() => {
    if (orientation === "horizontal") {
      return coordWidth;
    } else {
      return (stringCount - 1) * stringSpacing();
    }
  });

  let neckHeight = $derived(() => {
    if (orientation === "horizontal") {
      return (stringCount - 1) * stringSpacing();
    } else {
      return fretCount * fretSpacing();
    }
  });

  // Compute chord offset: if the chord doesn't start at fret 1, offset > 0.
  function computeOffset(): number {
    let frets: (number | string)[];
    if (typeof chord.frets === "string") {
      frets = chord.frets.split("").map((f) => (f === "x" ? "x" : parseInt(f)));
    } else {
      frets = chord.frets;
    }
    let minFret = Infinity;
    let hasOpen = false;
    for (const f of frets) {
      if (typeof f === "number") {
        if (f === 0) {
          hasOpen = true;
        } else if (f < minFret) {
          minFret = f;
        }
      }
    }
    return hasOpen
      ? 0
      : minFret === Infinity
        ? 0
        : minFret > 1
          ? minFret - 1
          : 0;
  }
  let offset = $state(computeOffset());
  let baseFret = $derived(() => offset + 1);
  let showNut = $derived(() => offset === 0);

  // Calculate total dimensions for the SVG container
  let totalWidth = $derived(() => {
    if (orientation === "horizontal") {
      return showNut() ? nutWidth + neckWidth() : neckWidth();
    } else {
      return showNut() ? neckWidth() : nutWidth + neckWidth();
    }
  });
  let totalHeight = $derived(() => {
    if (orientation === "horizontal") {
      return showNut() ? neckHeight() : nutWidth + neckHeight();
    } else {
      return showNut() ? nutWidth + neckHeight() : neckHeight();
    }
  });
</script>

<!-- Render the SVG diagram with overflow visible -->
<svg
  width="100%"
  viewBox={`0 0 ${totalWidth()} ${totalHeight()}`}
  style="overflow: visible;"
>
  {#if orientation === "horizontal"}
    {#if showNut()}
      <!-- Horizontal: Nut on the left, then the Neck (frets and strings) -->
      <g>
        <Nut
          width={nutWidth}
          height={neckHeight()}
          color={nutColor}
          parentWidth={nutWidth}
          {orientation}
        />
      </g>
      <g transform={`translate(${nutWidth}, 0)`}>
        <Neck
          {stringCount}
          {fretCount}
          stringSpacing={stringSpacing()}
          fretSpacing={fretSpacing()}
          {stringWidth}
          {fretWidth}
          {stringColor}
          {fretColor}
          {orientation}
          skipFirstFretLine={false}
        />
      </g>
    {:else}
      <!-- Horizontal: Base fret indicator on top, then the Neck below -->
      <g>
        <text
          x={neckWidth() / 2}
          y={nutWidth / 2}
          text-anchor="middle"
          dominant-baseline="central"
          font-size={nutWidth * 0.8}
        >
          {baseFret()}
        </text>
      </g>
      <g transform={`translate(0, ${nutWidth})`}>
        <Neck
          {stringCount}
          {fretCount}
          stringSpacing={stringSpacing()}
          fretSpacing={fretSpacing()}
          {stringWidth}
          {fretWidth}
          {stringColor}
          {fretColor}
          {orientation}
          skipFirstFretLine={false}
        />
      </g>
    {/if}
  {:else if showNut()}
    <!-- Vertical: Nut on top, then the Neck below -->
    <g>
      <Nut
        width={neckWidth()}
        height={nutWidth}
        color={nutColor}
        parentWidth={neckWidth()}
        {orientation}
      />
    </g>
    <g transform={`translate(0, ${nutWidth})`}>
      <Neck
        {stringCount}
        {fretCount}
        stringSpacing={stringSpacing()}
        fretSpacing={fretSpacing()}
        {stringWidth}
        {fretWidth}
        {stringColor}
        {fretColor}
        {orientation}
        skipFirstFretLine={false}
      />
    </g>
  {:else}
    <!-- Vertical: Base fret indicator on the left, then the Neck to its right -->
    <g>
      <text
        x={nutWidth / 2}
        y={neckHeight() / 2}
        text-anchor="middle"
        dominant-baseline="central"
        font-size={nutWidth * 0.8}
      >
        {baseFret()}
      </text>
    </g>
    <g transform={`translate(${nutWidth}, 0)`}>
      <Neck
        {stringCount}
        {fretCount}
        stringSpacing={stringSpacing()}
        fretSpacing={fretSpacing()}
        {stringWidth}
        {fretWidth}
        {stringColor}
        {fretColor}
        {orientation}
        skipFirstFretLine={false}
      />
    </g>
  {/if}
</svg>

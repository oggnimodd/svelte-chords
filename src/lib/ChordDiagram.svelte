<script lang="ts">
  import Nut from "./Nut.svelte";
  import Neck from "./Neck.svelte";
  import Dot from "./Dot.svelte";
  import StringMarker from "./StringMarker.svelte";
  import type { ChordDiagramProps } from "./types.js";

  // Get props as before.
  let {
    chord,
    orientation = "horizontal",
    nutWidth = 10,
    nutColor = "black",
    stringColor = "gray",
    stringWidth = 1,
    fretColor = "gray",
    fretWidth = 1,
    instrument = "guitar",
    boxAspectRatio = 1,
    dotRadius = 10,
    dotColor = "black",
  }: ChordDiagramProps = $props();

  const stringCount = $derived(instrument === "guitar" ? 6 : 4);
  const fretCount = $derived(instrument === "guitar" ? 5 : 4);

  // Use a fixed coordinate system width.
  const coordWidth = 100;

  // Calculate fret spacing based on our coordinate system.
  const fretSpacing = $derived(() => {
    if (orientation === "horizontal") {
      return coordWidth / fretCount;
    } else {
      return boxAspectRatio * (coordWidth / (stringCount - 1));
    }
  });

  // Calculate string spacing based on our coordinate system.
  const stringSpacing = $derived(() => {
    if (orientation === "horizontal") {
      return fretSpacing() / boxAspectRatio;
    } else {
      return coordWidth / (stringCount - 1);
    }
  });

  // Set the virtual width and height for the SVG.
  const width = $derived(() => coordWidth);
  const height = $derived(() => {
    if (orientation === "horizontal") {
      return (stringCount - 1) * stringSpacing();
    } else {
      return (showNut() ? nutWidth : 0) + fretCount * fretSpacing();
    }
  });

  // Parse chord.frets as before.
  const frets = $derived(() => {
    if (typeof chord.frets === "string") {
      return chord.frets.split("").map((f: string) => {
        if (f === "x") return "x";
        const val = parseInt(f, 16);
        return isNaN(val) ? "x" : val;
      });
    }
    return chord.frets;
  });

  // Compute offset: if barres exist use that; otherwise, use lowest fretted note.
  const offset = $derived(() => {
    let minFret = Infinity;
    let hasOpenString = false;

    for (const f of frets()) {
      if (typeof f === "number") {
        if (f === 0) {
          hasOpenString = true;
        } else if (f < minFret) {
          minFret = f;
        }
      }
    }

    if (hasOpenString) {
      return 0;
    }
    if (minFret === Infinity) {
      return 0;
    }
    return minFret > 1 ? minFret - 1 : 0;
  });

  // Render the nut only if the chord starts at fret 1.
  const showNut = $derived(() => offset() === 0);

  // Marker for open ("o") and muted ("x") strings.
  const marker = $derived(() => {
    let marker: {
      type: "x" | "o";
      string: number;
    }[] = [];

    frets().forEach((fret, k) => {
      if (fret === 0) {
        marker.push({
          type: "o",
          string: k,
        });
      } else if (fret === "x") {
        marker.push({
          type: "x",
          string: k,
        });
      }
    });

    return marker;
  });
</script>

<div style="width: 100%; aspect-ratio: {width()}/{height()}">
  <svg
    viewBox={`0 0 ${width()} ${height()}`}
    preserveAspectRatio="xMinYMin meet"
    overflow="visible"
  >
    {#if orientation === "horizontal"}
      <!-- Render markers for horizontal orientation -->
      {#each marker() as m}
        <StringMarker
          type={m.type}
          stringIndex={m.string}
          orientation="horizontal"
          stringSpacing={stringSpacing()}
          {stringCount}
        />
      {/each}
      <g transform={`translate(${instrument === "guitar" ? 7 : 8}, 0)`}>
        {#if showNut()}
          <!-- Nut on the left -->
          <Nut
            width={nutWidth}
            height={height()}
            color={nutColor}
            orientation="horizontal"
            parentWidth={width()}
          />
        {/if}
        <g transform={`translate(${showNut() ? nutWidth : 0}, 0)`}>
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
          {#each frets().slice().reverse() as fret, k}
            {#if typeof fret === "number" && fret > 0}
              <Dot
                x={((fret as number) - offset() - 0.5) * fretSpacing()}
                y={k * stringSpacing()}
                radius={dotRadius}
                color={dotColor}
                showFingerNumber={false}
              />
            {/if}
          {/each}
        </g>
      </g>
    {:else}
      <!-- Render markers for vertical orientation -->
      {#each marker() as m}
        <StringMarker
          type={m.type}
          stringIndex={m.string}
          orientation="vertical"
          stringSpacing={stringSpacing()}
          {stringCount}
        />
      {/each}
      <g transform={`translate(0, ${instrument === "guitar" ? 6 : 8})`}>
        {#if showNut()}
          <!-- Nut on top -->
          <Nut
            width={width()}
            height={nutWidth}
            color={nutColor}
            orientation="vertical"
            parentWidth={width()}
          />
        {/if}
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
          {#each frets() as fret, k}
            {#if typeof fret === "number" && fret > 0}
              <Dot
                x={k * stringSpacing()}
                y={((fret as number) - offset() - 0.5) * fretSpacing()}
                radius={dotRadius}
                color={dotColor}
                showFingerNumber={false}
              />
            {/if}
          {/each}
        </g>
      </g>
    {/if}
  </svg>
</div>

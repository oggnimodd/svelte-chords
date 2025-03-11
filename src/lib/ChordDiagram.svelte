<script lang="ts">
  import Nut from "./Nut.svelte";
  import Neck from "./Neck.svelte";
  import StringMarker from "./StringMarker.svelte";
  import type { ChordDiagramProps } from "./types.js";

  // Svelte 5 style: $props(), $state, $derived
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

  // Number of strings/frets
  const stringCount = instrument === "guitar" ? 6 : 4;
  const fretCount = instrument === "guitar" ? 5 : 4;

  // Virtual width for immediate rendering (no onMount needed)
  let coordWidth = $state(100);

  // Derived spacing
  let fretSpacing = $derived(() =>
    orientation === "horizontal"
      ? coordWidth / fretCount
      : boxAspectRatio * (coordWidth / (stringCount - 1))
  );

  let stringSpacing = $derived(() =>
    orientation === "horizontal"
      ? fretSpacing() / boxAspectRatio
      : coordWidth / (stringCount - 1)
  );

  // Neck area
  let neckWidth = $derived(() =>
    orientation === "horizontal"
      ? coordWidth
      : (stringCount - 1) * stringSpacing()
  );
  let neckHeight = $derived(() =>
    orientation === "horizontal"
      ? (stringCount - 1) * stringSpacing()
      : fretCount * fretSpacing()
  );

  // Compute offset (lowest fretted note above 1)
  function computeOffset(): number {
    let frets: (number | string)[];
    if (typeof chord.frets === "string") {
      frets = chord.frets
        .split("")
        .map((f) => (f.toLowerCase() === "x" ? "x" : parseInt(f, 10)));
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
    if (hasOpen) return 0;
    if (minFret === Infinity) return 0;
    return minFret > 1 ? minFret - 1 : 0;
  }

  let offset = $state(computeOffset());
  let baseFret = $derived(() => offset + 1);
  let showNut = $derived(() => offset === 0);

  // Markers: "x" or "o" (or "0") from chord.frets
  // VERTICAL => left->right = 6..1
  // HORIZONTAL => top->bottom = 1..6
  let markers = $derived(() => {
    let rawFrets: (number | string)[];
    if (typeof chord.frets === "string") {
      rawFrets = chord.frets
        .split("")
        .map((f) => (f.toLowerCase() === "x" ? "x" : parseInt(f, 10)));
    } else {
      rawFrets = chord.frets;
    }

    let result: { type: "x" | "o"; stringIndex: number }[] = [];
    for (let i = 0; i < stringCount; i++) {
      const fretVal = rawFrets[i];
      if (fretVal === 0) {
        result.push({ type: "o", stringIndex: i });
      } else if (fretVal === "x") {
        result.push({ type: "x", stringIndex: i });
      }
    }
    return result;
  });

  // We'll do a simple stacking layout, minimal transforms:
  let markerArea = $state(nutWidth); // space for markers

  // Compute totalWidth/Height so the diagram is fully visible in the viewBox
  let totalWidth = $derived(() => {
    if (orientation === "horizontal") {
      return markerArea + (showNut() ? nutWidth : 0) + neckWidth();
    } else {
      return showNut() ? neckWidth() : nutWidth + neckWidth();
    }
  });

  let totalHeight = $derived(() => {
    if (orientation === "horizontal") {
      return showNut() ? neckHeight() : nutWidth + neckHeight();
    } else {
      // top for markers + nut if showNut => markerArea + nutWidth
      // plus neck
      return markerArea + (showNut() ? nutWidth : 0) + neckHeight();
    }
  });
</script>

<!-- Main SVG container with 100% width and overflow visible -->
<svg
  width="100%"
  viewBox={`0 0 ${totalWidth()} ${totalHeight()}`}
  style="overflow: visible;"
>
  {#if orientation === "horizontal"}
    <!-- Horizontal orientation: top->bottom = strings 1..6 
         rawFrets[0] => 6th string => bottom, rawFrets[5] => 1st => top. -->

    {#if offset > 0}
      <!-- Base fret indicator on top if chord doesn't start at fret 1 -->
      <!-- KEY CHANGE: position near the first fret line, bigger font, and "fr" suffix -->
      <g>
        <text
          x={markerArea + fretSpacing() / 2}
          y={-fretSpacing() / 4}
          font-size={10}
          text-anchor="middle"
          dominant-baseline="central"
        >
          {baseFret()}fr
        </text>
      </g>

      <!-- Shift everything else down by nutWidth -->
      <g transform={`translate(0, ${nutWidth})`}>
        <!-- Markers on the left -->
        <g>
          {#each markers() as marker}
            <StringMarker
              type={marker.type}
              {orientation}
              stringSpacing={stringSpacing()}
              {stringCount}
              stringIndex={marker.stringIndex}
            />
          {/each}
        </g>
        <!-- No nut in offset>0 scenario, so just the neck -->
        <g transform={`translate(${markerArea}, 0)`}>
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
      </g>
    {:else}
      <!-- offset == 0 => showNut = true -->
      <!-- Markers on the left, no vertical shift -->
      <g>
        {#each markers() as marker}
          <StringMarker
            type={marker.type}
            {orientation}
            stringSpacing={stringSpacing()}
            {stringCount}
            stringIndex={marker.stringIndex}
          />
        {/each}
      </g>
      <!-- Nut on the left, then neck -->
      <g transform={`translate(${markerArea}, 0)`}>
        <Nut
          width={nutWidth}
          height={neckHeight()}
          color={nutColor}
          parentWidth={nutWidth}
          {orientation}
        />
      </g>
      <g transform={`translate(${markerArea + nutWidth}, 0)`}>
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
  {:else}
    <!-- Vertical orientation: left->right = strings 6..1
         rawFrets[0] => 6th => left, rawFrets[5] => 1st => right. -->

    {#if offset > 0}
      <!-- Base fret indicator on the left if chord doesn't start at fret 1 -->
      <!-- KEY CHANGE: align with the first fret line, bigger font, and "fr" suffix -->
      <g>
        <text
          x={-fretSpacing() / 4}
          y={markerArea + fretSpacing() / 2}
          font-size={10}
          text-anchor="middle"
          dominant-baseline="central"
        >
          {baseFret()}fr
        </text>
      </g>
      <!-- Shift everything else right by nutWidth -->
      <g transform={`translate(${nutWidth}, 0)`}>
        <!-- Markers on top -->
        <g>
          {#each markers() as marker}
            <StringMarker
              type={marker.type}
              {orientation}
              stringSpacing={stringSpacing()}
              {stringCount}
              stringIndex={marker.stringIndex}
            />
          {/each}
        </g>
        <!-- Then shift down by markerArea for the neck -->
        <g transform={`translate(0, ${markerArea})`}>
          <!-- offset>0 => no nut, just neck -->
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
      </g>
    {:else}
      <!-- offset == 0 => showNut = true, no base fret indicator on the left -->
      <!-- Markers on top -->
      <g>
        {#each markers() as marker}
          <StringMarker
            type={marker.type}
            {orientation}
            stringSpacing={stringSpacing()}
            {stringCount}
            stringIndex={marker.stringIndex}
          />
        {/each}
      </g>
      <!-- Then shift down by markerArea for the nut -->
      <g transform={`translate(0, ${markerArea})`}>
        <Nut
          width={neckWidth()}
          height={nutWidth}
          color={nutColor}
          parentWidth={neckWidth()}
          {orientation}
        />
      </g>
      <!-- Then the neck below the nut -->
      <g transform={`translate(0, ${markerArea + nutWidth})`}>
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
  {/if}
</svg>

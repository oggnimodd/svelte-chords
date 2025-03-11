<script lang="ts">
  import Nut from "./Nut.svelte";
  import Neck from "./Neck.svelte";
  import StringMarker from "./StringMarker.svelte";
  import type { ChordDiagramProps } from "./types.js";
  import Dot from "./Dot.svelte";

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
    dotRadius = 10,
    dotColor = "black",
    showFingerNumber = true,
    ref = $bindable(),
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
  // For horizontal mode, we use nutWidth as the base indicator area as well
  // Compute totalWidth/Height so the diagram is fully visible in the viewBox
  let totalWidth = $derived(() => {
    if (orientation === "horizontal") {
      return markerArea + nutWidth + neckWidth();
    } else {
      return neckWidth();
    }
  });
  let totalHeight = $derived(() => {
    if (orientation === "horizontal") {
      return nutWidth + neckHeight();
    } else {
      return markerArea + nutWidth + neckHeight();
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

  // Normalize fingers to array format
  const fingers = $derived(() => {
    if (typeof chord.fingers === "string") {
      return chord.fingers.split("");
    }
    return chord.fingers;
  });
</script>

<!-- Main SVG container with 100% width and overflow visible -->
<svg
  bind:this={ref}
  width="100%"
  viewBox={`0 0 ${totalWidth()} ${totalHeight()}`}
  style="overflow: visible;"
>
  {#if orientation === "horizontal"}
    <!-- Horizontal orientation -->
    <g>
      {#if offset > 0}
        <!-- Show base fret indicator if chord doesn't start at fret 1, placed on top -->
        <g>
          <text
            x={markerArea + nutWidth + fretSpacing() / 2}
            y={-fretSpacing() / 2}
            font-size="10"
            text-anchor="middle"
            dominant-baseline="central"
          >
            {baseFret()}fr
          </text>
        </g>
      {/if}
      <!-- Render markers on the left side -->
      <g transform={`translate(${-markerArea / 2}, 0)`}>
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
      {#if offset === 0}
        <!-- Only render nut if chord starts at fret 1 -->
        <g transform={`translate(${markerArea}, ${nutWidth})`}>
          <Nut
            width={nutWidth}
            height={neckHeight()}
            color={nutColor}
            parentWidth={neckHeight()}
            {orientation}
          />
        </g>
      {/if}
      <!-- Always render the neck -->
      <g transform={`translate(${markerArea + nutWidth}, ${nutWidth})`}>
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
              x={((fret as number) - offset - 0.5) * fretSpacing()}
              y={k * stringSpacing()}
              radius={dotRadius}
              color={dotColor}
              {showFingerNumber}
              fingerNumber={fingers().reverse()[k]}
            />
          {/if}
        {/each}
      </g>
    </g>
  {:else}
    <!-- Vertical orientation -->
    {#if offset > 0}
      <!-- Show base fret indicator if chord doesn't start at fret 1 -->
      <g>
        <text
          x={-fretSpacing() / 2}
          y={nutWidth + markerArea + fretSpacing() / 2}
          font-size="10"
          text-anchor="middle"
          dominant-baseline="central"
        >
          {baseFret()}fr
        </text>
      </g>
    {/if}
    <!-- Always show markers on top -->
    <g transform={`translate(0, ${-markerArea / 2})`}>
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
    {#if offset === 0}
      <!-- Only render nut if chord starts at fret 1 -->
      <g transform={`translate(0, ${markerArea})`}>
        <Nut
          width={neckWidth()}
          height={nutWidth}
          color={nutColor}
          parentWidth={neckWidth()}
          {orientation}
        />
      </g>
    {/if}
    <!-- Always render the neck -->
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
      {#each frets() as fret, k}
        {#if typeof fret === "number" && fret > 0}
          <Dot
            x={k * stringSpacing()}
            y={((fret as number) - offset - 0.5) * fretSpacing()}
            radius={dotRadius}
            color={dotColor}
            {showFingerNumber}
            fingerNumber={chord.fingers[k]}
          />
        {/if}
      {/each}
    </g>
  {/if}
</svg>

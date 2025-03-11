<script lang="ts">
  import Nut from "./Nut.svelte";
  import Neck from "./Neck.svelte";
  import StringMarker from "./StringMarker.svelte";
  import Dot from "./Dot.svelte";
  import type { ChordDiagramProps } from "./types.js";

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

  // Number of strings and frets
  const stringCount = instrument === "guitar" ? 6 : 4;
  const fretCount = instrument === "guitar" ? 5 : 4;

  // Virtual width for immediate rendering
  let V = $state(100);

  // Derived reactive values using $derived(expression)
  let baseIndicatorSize = $derived(V * 0.3);

  /* --- VERTICAL LAYOUT --- */
  let contentWidthVertical = $derived(V - baseIndicatorSize);
  let stringSpacingVertical = $derived(
    contentWidthVertical / (stringCount - 1)
  );
  let fretSpacingVertical = $derived(boxAspectRatio * stringSpacingVertical);
  let neckWidthVertical = contentWidthVertical;
  let neckHeightVertical = $derived(fretCount * fretSpacingVertical);
  let markerHeightVertical = baseIndicatorSize;
  let nutHeightVertical = nutWidth;

  // Add dotRadius so right/bottom dots aren't cut off
  let totalHeightVertical = $derived(
    markerHeightVertical + nutHeightVertical + neckHeightVertical + dotRadius
  );
  let totalWidthVertical = $derived(V + dotRadius);

  /* --- HORIZONTAL LAYOUT --- */
  let markerWidthHorizontal = baseIndicatorSize;
  let nutWidthHorizontal = nutWidth;
  let neckWidthHorizontal = $derived(
    V - markerWidthHorizontal - nutWidthHorizontal
  );
  let fretSpacingHorizontal = $derived(neckWidthHorizontal / fretCount);
  let stringSpacingHorizontal = $derived(
    fretSpacingHorizontal / boxAspectRatio
  );
  let diagramHeightHorizontal = $derived(
    (stringCount - 1) * stringSpacingHorizontal
  );
  let baseIndicatorHeightHorizontal = baseIndicatorSize;

  // Add dotRadius so right/bottom dots aren't cut off
  let totalHeightHorizontal = $derived(
    baseIndicatorHeightHorizontal + diagramHeightHorizontal + dotRadius
  );
  let totalWidthHorizontal = $derived(V + dotRadius);

  // Compute fret offset
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
  let baseFret = $derived(offset + 1);

  // Markers: vertical orientation (markers above nut)
  let markersVertical = $derived(
    (() => {
      let raw =
        typeof chord.frets === "string"
          ? chord.frets
              .split("")
              .map((f) => (f.toLowerCase() === "x" ? "x" : parseInt(f, 10)))
          : chord.frets;
      let result: { type: "x" | "o"; stringIndex: number }[] = [];
      for (let i = 0; i < stringCount; i++) {
        const val = raw[i];
        if (val === 0) result.push({ type: "o", stringIndex: i });
        else if (val === "x") result.push({ type: "x", stringIndex: i });
      }
      return result;
    })()
  );

  // Markers: horizontal orientation (markers to the left)
  let markersHorizontal = $derived(
    (() => {
      let raw =
        typeof chord.frets === "string"
          ? chord.frets
              .split("")
              .map((f) => (f.toLowerCase() === "x" ? "x" : parseInt(f, 10)))
          : chord.frets;
      let result: { type: "x" | "o"; stringIndex: number }[] = [];
      for (let i = 0; i < stringCount; i++) {
        const val = raw[stringCount - 1 - i];
        if (val === 0) result.push({ type: "o", stringIndex: i });
        else if (val === "x") result.push({ type: "x", stringIndex: i });
      }
      return result;
    })()
  );

  // Parse frets for dots
  let fretsVertical = $derived(
    typeof chord.frets === "string"
      ? chord.frets
          .split("")
          .map((f) => (f.toLowerCase() === "x" ? "x" : parseInt(f, 10)))
      : chord.frets
  );
  let fretsHorizontal = $derived(
    typeof chord.frets === "string"
      ? chord.frets
          .split("")
          .map((f) => (f.toLowerCase() === "x" ? "x" : parseInt(f, 10)))
          .reverse()
      : (chord.frets as number[]).slice().reverse()
  );

  // Fingers for dots
  let fingersVertical = $derived(
    typeof chord.fingers === "string" ? chord.fingers.split("") : chord.fingers
  );
  let fingersHorizontal = $derived(
    typeof chord.fingers === "string"
      ? chord.fingers.split("").reverse()
      : (chord.fingers as number[]).slice().reverse()
  );
</script>

<svg
  bind:this={ref}
  width="100%"
  viewBox={orientation === "vertical"
    ? `0 0 ${totalWidthVertical} ${totalHeightVertical}`
    : `0 0 ${totalWidthHorizontal} ${totalHeightHorizontal}`}
  style="overflow: visible;"
>
  {#if orientation === "vertical"}
    {#if offset > 0}
      <!-- Base fret indicator on left -->
      <text
        x={baseIndicatorSize / 2}
        y={markerHeightVertical + nutHeightVertical + fretSpacingVertical / 2}
        font-size="10"
        text-anchor="middle"
        dominant-baseline="central"
      >
        {baseFret}fr
      </text>
    {/if}
    <!-- String markers (above the nut) -->
    {#each markersVertical as marker}
      <StringMarker
        type={marker.type}
        orientation="vertical"
        stringSpacing={stringSpacingVertical}
        {stringCount}
        stringIndex={marker.stringIndex}
        x={baseIndicatorSize + marker.stringIndex * stringSpacingVertical}
        y={markerHeightVertical / 2}
      />
    {/each}
    <!-- Only draw nut if offset===0, but keep the nut spacing for layout -->
    {#if offset === 0}
      <Nut
        width={contentWidthVertical}
        height={nutHeightVertical}
        color={nutColor}
        parentWidth={contentWidthVertical}
        orientation="vertical"
        x={baseIndicatorSize}
        y={markerHeightVertical}
      />
    {/if}
    <!-- Neck always starts after nut space, even if nut isn't drawn -->
    <Neck
      x={baseIndicatorSize}
      y={markerHeightVertical + nutHeightVertical}
      {stringCount}
      {fretCount}
      stringSpacing={stringSpacingVertical}
      fretSpacing={fretSpacingVertical}
      {stringWidth}
      {fretWidth}
      {stringColor}
      {fretColor}
      orientation="vertical"
      skipFirstFretLine={false}
    />
    <!-- Dots -->
    {#each fretsVertical as fret, i}
      {#if typeof fret === "number" && fret > 0}
        <Dot
          x={baseIndicatorSize + i * stringSpacingVertical}
          y={markerHeightVertical +
            nutHeightVertical +
            (fret - offset - 0.5) * fretSpacingVertical}
          radius={dotRadius}
          color={dotColor}
          {showFingerNumber}
          fingerNumber={fingersVertical[i]}
        />
      {/if}
    {/each}
  {:else}
    {#if offset > 0}
      <!-- Base fret indicator on top -->
      <text
        x={markerWidthHorizontal +
          nutWidthHorizontal +
          fretSpacingHorizontal / 2}
        y={baseIndicatorHeightHorizontal / 2}
        font-size="10"
        text-anchor="middle"
        dominant-baseline="central"
      >
        {baseFret}fr
      </text>
    {/if}
    <!-- String markers (to the left) -->
    {#each markersHorizontal as marker}
      <StringMarker
        type={marker.type}
        orientation="horizontal"
        stringSpacing={stringSpacingHorizontal}
        {stringCount}
        stringIndex={marker.stringIndex}
        x={markerWidthHorizontal / 2}
        y={baseIndicatorHeightHorizontal +
          marker.stringIndex * stringSpacingHorizontal}
      />
    {/each}
    <!-- Only draw nut if offset===0, but keep the nut spacing for layout -->
    {#if offset === 0}
      <Nut
        width={nutWidthHorizontal}
        height={diagramHeightHorizontal}
        color={nutColor}
        parentWidth={nutWidthHorizontal}
        orientation="horizontal"
        x={markerWidthHorizontal}
        y={baseIndicatorHeightHorizontal}
      />
    {/if}
    <!-- Neck always starts after nut space, even if nut isn't drawn -->
    <Neck
      x={markerWidthHorizontal + nutWidthHorizontal}
      y={baseIndicatorHeightHorizontal}
      {stringCount}
      {fretCount}
      stringSpacing={stringSpacingHorizontal}
      fretSpacing={fretSpacingHorizontal}
      {stringWidth}
      {fretWidth}
      {stringColor}
      {fretColor}
      orientation="horizontal"
      skipFirstFretLine={false}
    />
    <!-- Dots -->
    {#each fretsHorizontal as fret, i}
      {#if typeof fret === "number" && fret > 0}
        <Dot
          x={markerWidthHorizontal +
            nutWidthHorizontal +
            (fret - offset - 0.5) * fretSpacingHorizontal}
          y={baseIndicatorHeightHorizontal + i * stringSpacingHorizontal}
          radius={dotRadius}
          color={dotColor}
          {showFingerNumber}
          fingerNumber={fingersHorizontal[i]}
        />
      {/if}
    {/each}
  {/if}
</svg>

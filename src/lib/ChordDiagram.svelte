<!-- ChordDiagram.svelte -->
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

  let baseFretIndicatorSize = $derived.by(() => V * 0.22);
  let markerSpacingSize = $derived.by(() => V * 0.1);

  let baseIndicatorSize = $derived.by(() => {
    if (orientation === "vertical") {
      return baseFretIndicatorSize;
    } else {
      return markerSpacingSize;
    }
  });

  /* --- VERTICAL LAYOUT --- */
  let contentWidthVertical = $derived.by(() => V - baseIndicatorSize);
  let stringSpacingVertical = $derived.by(
    () => contentWidthVertical / (stringCount - 1)
  );
  let fretSpacingVertical = $derived.by(
    () => boxAspectRatio * stringSpacingVertical
  );
  let neckHeightVertical = $derived.by(() => fretCount * fretSpacingVertical);

  // Now markerHeightVertical depends on orientation
  let markerHeightVertical = $derived.by(() => {
    // For vertical orientation: top margin = small (0.1*V)
    // For horizontal orientation: top margin = 0 (no effect)
    if (orientation === "vertical") {
      return markerSpacingSize;
    } else {
      return 0;
    }
  });

  let nutHeightVertical = nutWidth;

  // Add dotRadius so right/bottom dots aren't cut off
  let totalHeightVertical = $derived.by(
    () =>
      markerHeightVertical + nutHeightVertical + neckHeightVertical + dotRadius
  );
  let totalWidthVertical = $derived.by(() => V + dotRadius);

  /* --- HORIZONTAL LAYOUT --- */
  // baseIndicatorHeightHorizontal depends on orientation
  let baseIndicatorHeightHorizontal = $derived.by(() => {
    // For horizontal orientation: top margin = big (0.3*V)
    // For vertical orientation: top margin = 0
    if (orientation === "horizontal") {
      return baseFretIndicatorSize;
    } else {
      return 0;
    }
  });

  let nutWidthHorizontal = nutWidth;
  let neckWidthHorizontal = $derived.by(
    () => V - baseIndicatorHeightHorizontal - nutWidthHorizontal
  );
  let fretSpacingHorizontal = $derived.by(
    () => neckWidthHorizontal / fretCount
  );
  let stringSpacingHorizontal = $derived.by(
    () => fretSpacingHorizontal / boxAspectRatio
  );
  let diagramHeightHorizontal = $derived.by(
    () => (stringCount - 1) * stringSpacingHorizontal
  );

  // Add dotRadius so right/bottom dots aren't cut off
  let totalHeightHorizontal = $derived.by(
    () => baseIndicatorHeightHorizontal + diagramHeightHorizontal + dotRadius
  );
  let totalWidthHorizontal = $derived.by(() => V + dotRadius);

  // Compute fret offset function
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
  let baseFret = $derived.by(() => offset + 1);

  // Markers: vertical orientation (markers above the nut)
  let markersVertical = $derived.by(() => {
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
  });

  // Markers: horizontal orientation (markers to the left)
  let markersHorizontal = $derived.by(() => {
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
  });

  // Parse frets for dots
  let fretsVertical = $derived.by(() =>
    typeof chord.frets === "string"
      ? chord.frets
          .split("")
          .map((f) => (f.toLowerCase() === "x" ? "x" : parseInt(f, 10)))
      : chord.frets
  );
  let fretsHorizontal = $derived.by(() =>
    typeof chord.frets === "string"
      ? chord.frets
          .split("")
          .map((f) => (f.toLowerCase() === "x" ? "x" : parseInt(f, 10)))
          .reverse()
      : (chord.frets as number[]).slice().reverse()
  );

  // Fingers for dots
  let fingersVertical = $derived.by(() =>
    typeof chord.fingers === "string" ? chord.fingers.split("") : chord.fingers
  );
  let fingersHorizontal = $derived.by(() =>
    typeof chord.fingers === "string"
      ? chord.fingers.split("").reverse()
      : (chord.fingers as number[]).slice().reverse()
  );
</script>

<svg
  bind:this={ref}
  width="100%"
  style="overflow: visible;"
  viewBox={orientation === "vertical"
    ? `0 0 ${totalWidthVertical} ${totalHeightVertical}`
    : `0 0 ${totalWidthHorizontal} ${totalHeightHorizontal}`}
>
  {#if orientation === "vertical"}
    {#if offset > 0}
      <!-- Base fret indicator on left -->
      <text
        x={baseIndicatorSize / 3}
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
        x={baseIndicatorSize + nutWidthHorizontal + fretSpacingHorizontal / 2}
        y={baseIndicatorHeightHorizontal / 3}
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
        x={baseIndicatorSize / 2}
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
        x={baseIndicatorSize}
        y={baseIndicatorHeightHorizontal}
      />
    {/if}

    <!-- Neck always starts after nut space, even if nut isn't drawn -->
    <Neck
      x={baseIndicatorSize + nutWidthHorizontal}
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
          x={baseIndicatorSize +
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

<script lang="ts">
  import { onMount } from "svelte";
  import Nut from "./Nut.svelte";
  import Neck from "./Neck.svelte";
  import Dot from "./Dot.svelte";
  import type { ChordDiagramProps } from "./types.js";

  let container: HTMLDivElement | null = $state(null);
  let parentWidth = $state(0);

  let {
    chord,
    orientation = "horizontal",
    nutWidth = 10,
    nutColor = "black",
    stringColor = "gray",
    fretColor = "gray",
    instrument = "guitar",
    boxAspectRatio = 1,
  }: ChordDiagramProps = $props();

  const stringCount = $derived(instrument === "guitar" ? 6 : 4);
  const fretCount = $derived(instrument === "guitar" ? 5 : 4);

  onMount(() => {
    if (container) {
      const resizeObserver = new ResizeObserver((entries) => {
        parentWidth = entries[0].contentRect.width;
      });
      resizeObserver.observe(container);
      return () => resizeObserver.disconnect();
    }
  });

  // Determine fret spacing.
  const fretSpacing = $derived(() => {
    if (orientation === "horizontal") {
      // If there's a nut, reduce available width.
      return (parentWidth - (showNut() ? nutWidth : 0)) / fretCount;
    } else {
      return boxAspectRatio * (parentWidth / (stringCount - 1));
    }
  });

  // Determine string spacing.
  const stringSpacing = $derived(() => {
    if (orientation === "horizontal") {
      return fretSpacing() / boxAspectRatio;
    } else {
      return parentWidth / (stringCount - 1);
    }
  });

  const width = $derived(() => parentWidth);
  const height = $derived(() => {
    if (orientation === "horizontal") {
      return (stringCount - 1) * stringSpacing();
    } else {
      // Add nut height if rendered.
      return (showNut() ? nutWidth : 0) + fretCount * fretSpacing();
    }
  });

  // Parse chord.frets as an array of numbers or "x".
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
    if (chord.barres) {
      return (chord.barres as number) - 1;
    }
    let minFret = Infinity;
    for (const f of frets()) {
      if (typeof f === "number" && f > 0 && f < minFret) {
        minFret = f;
      }
    }
    return minFret === Infinity ? 0 : minFret - 1;
  });

  // Render the nut only if the chord starts at fret 1.
  const showNut = $derived(() => offset() === 0);
</script>

<div bind:this={container} class="h-auto w-full">
  <svg
    width={width()}
    height={height()}
    viewBox={`0 0 ${width()} ${height()}`}
    overflow="visible"
    preserveAspectRatio="xMinYMin meet"
  >
    {#if orientation === "horizontal"}
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
      <!-- Translate the neck by nutWidth if the nut is rendered -->
      <g transform={`translate(${showNut() ? nutWidth : 0}, 0)`}>
        <Neck
          {stringCount}
          {fretCount}
          stringSpacing={stringSpacing()}
          fretSpacing={fretSpacing()}
          stringWidth={2}
          fretWidth={2}
          {stringColor}
          {fretColor}
          {orientation}
          skipFirstFretLine={showNut()}
        />
        {#each frets().slice().reverse() as fret, k}
          {#if typeof fret === "number" && fret > 0}
            <Dot
              x={((fret as number) - offset() - 0.5) * fretSpacing()}
              y={k * stringSpacing()}
              radius={10}
              color="black"
              showFingerNumber={false}
            />
          {/if}
        {/each}
      </g>
    {:else}
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
      <g transform={`translate(0, ${showNut() ? nutWidth : 0})`}>
        <Neck
          {stringCount}
          {fretCount}
          stringSpacing={stringSpacing()}
          fretSpacing={fretSpacing()}
          stringWidth={2}
          fretWidth={2}
          {stringColor}
          {fretColor}
          {orientation}
          skipFirstFretLine={showNut()}
        />
        {#each frets() as fret, k}
          {#if typeof fret === "number" && fret > 0}
            <Dot
              x={k * stringSpacing()}
              y={((fret as number) - offset() - 0.5) * fretSpacing()}
              radius={10}
              color="black"
              showFingerNumber={false}
            />
          {/if}
        {/each}
      </g>
    {/if}
  </svg>
</div>

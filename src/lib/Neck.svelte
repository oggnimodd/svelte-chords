<script lang="ts">
  import type { NeckProps } from "./types.js";
  let {
    stringCount,
    fretCount,
    stringSpacing,
    fretSpacing,
    stringWidth,
    fretWidth,
    stringColor,
    fretColor,
    orientation,
    skipFirstFretLine = false,
  }: NeckProps = $props();

  // Derived dimensions
  let neckWidth = $derived.by(() =>
    orientation === "horizontal"
      ? fretCount * fretSpacing
      : (stringCount - 1) * stringSpacing
  );
  let neckHeight = $derived.by(() =>
    orientation === "horizontal"
      ? (stringCount - 1) * stringSpacing
      : fretCount * fretSpacing
  );
</script>

<g>
  {#if orientation === "horizontal"}
    <!-- Vertical fret lines -->
    {#each Array(fretCount + 1) as _, i}
      {#if !(skipFirstFretLine && i === 0)}
        <line
          x1={i * fretSpacing}
          y1="0"
          x2={i * fretSpacing}
          y2={neckHeight}
          stroke={fretColor}
          stroke-width={fretWidth}
        />
      {/if}
    {/each}
    <!-- Horizontal string lines -->
    {#each Array(stringCount) as _, j}
      <line
        x1="0"
        y1={j * stringSpacing}
        x2={neckWidth}
        y2={j * stringSpacing}
        stroke={stringColor}
        stroke-width={stringWidth}
      />
    {/each}
  {:else}
    <!-- Horizontal fret lines -->
    {#each Array(fretCount + 1) as _, i}
      {#if !(skipFirstFretLine && i === 0)}
        <line
          x1="0"
          y1={i * fretSpacing}
          x2={neckWidth}
          y2={i * fretSpacing}
          stroke={fretColor}
          stroke-width={fretWidth}
        />
      {/if}
    {/each}
    <!-- Vertical string lines -->
    {#each Array(stringCount) as _, j}
      <line
        x1={j * stringSpacing}
        y1="0"
        x2={j * stringSpacing}
        y2={neckHeight}
        stroke={stringColor}
        stroke-width={stringWidth}
      />
    {/each}
  {/if}
</g>

<script lang="ts">
  import type { BarreProps } from "./types.js";
  let { start, end, fret, thickness, color, orientation }: BarreProps =
    $props();
</script>

{#if orientation === "horizontal"}
  <line
    x1={start}
    y1={fret}
    x2={end}
    y2={fret}
    stroke={color}
    stroke-width={thickness}
    stroke-linecap="round"
  />
{:else}
  <line
    x1={fret}
    y1={start}
    x2={fret}
    y2={end}
    stroke={color}
    stroke-width={thickness}
    stroke-linecap="round"
  />
{/if}

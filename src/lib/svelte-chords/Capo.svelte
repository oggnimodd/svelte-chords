<script lang="ts">
  import type { Orientation } from "./types.js";

  interface CapoProps {
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
    orientation: Orientation;
  }

  let { x, y, width, height, color, orientation }: CapoProps = $props();
</script>

{#if orientation === "vertical"}
  <!-- For vertical, draw a rounded rectangle spanning the first fret -->
  <rect {x} {y} {width} {height} fill={color} rx={height / 2} />
{:else}
  <!-- For horizontal, draw the same shape rotated -->
  <rect {x} {y} {width} {height} fill={color} rx={width / 2} />
{/if}

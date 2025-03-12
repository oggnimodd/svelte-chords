<script lang="ts">
  import type { DotProps } from "./types.js";
  let { x, y, radius, color, showFingerNumber, fingerNumber }: DotProps =
    $props();
</script>

<circle cx={x} cy={y} r={radius} fill={color} />
{#if showFingerNumber && fingerNumber && fingerNumber !== "0"}
  <text
    {x}
    {y}
    text-anchor="middle"
    dominant-baseline="central"
    fill="white"
    font-size={radius * 1.2}
    font-family="Arial, sans-serif"
  >
    {fingerNumber}
  </text>
{/if}

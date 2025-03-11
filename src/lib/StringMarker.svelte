<script lang="ts">
  import type { StringMarkerProps } from "./types.js";
  let {
    type,
    stringIndex,
    orientation,
    stringSpacing,
    stringCount,
    x = 0,
    y = 0,
  }: StringMarkerProps = $props();
  const markerSize = stringSpacing / 6;
</script>

<g transform={`translate(${x}, ${y})`}>
  {#if orientation === "horizontal"}
    {#if type === "o"}
      <circle
        cx="0"
        cy="0"
        r={markerSize}
        fill="none"
        stroke="black"
        stroke-width="1"
      />
    {:else if type === "x"}
      <g stroke="black" stroke-width="1">
        <line
          x1={-markerSize}
          y1={-markerSize}
          x2={markerSize}
          y2={markerSize}
        />
        <line
          x1={-markerSize}
          y1={markerSize}
          x2={markerSize}
          y2={-markerSize}
        />
      </g>
    {/if}
  {:else if type === "o"}
    <circle
      cx="0"
      cy="0"
      r={markerSize}
      fill="none"
      stroke="black"
      stroke-width="1"
    />
  {:else if type === "x"}
    <g stroke="black" stroke-width="1">
      <line x1={-markerSize} y1={-markerSize} x2={markerSize} y2={markerSize} />
      <line x1={-markerSize} y1={markerSize} x2={markerSize} y2={-markerSize} />
    </g>
  {/if}
</g>

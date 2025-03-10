<script lang="ts">
  import type { StringMarkerProps } from "./types.js";

  let {
    type,
    stringIndex,
    orientation,
    stringSpacing,
    stringCount,
  }: StringMarkerProps = $props();
  const markerSize = stringSpacing / 6;
</script>

{#if orientation === "horizontal"}
  <!-- In horizontal mode the nut is on the left.
       We place the marker in the middle of the nut area. -->
  <g
    transform={`translate(0, ${(stringCount - 1 - stringIndex) * stringSpacing})`}
  >
    {#if type === "o"}
      <!-- Render an "o" marker as a circle -->
      <circle
        cx="0"
        cy="0"
        r={markerSize}
        fill="none"
        stroke="black"
        stroke-width="1"
      />
    {:else if type === "x"}
      <!-- Render an "x" marker using two lines -->
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
  </g>
{:else}
  <!-- In vertical mode nut is on top.
       Place the marker above the nut. -->
  <g transform={`translate(${stringIndex * stringSpacing}, 0)`}>
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
  </g>
{/if}

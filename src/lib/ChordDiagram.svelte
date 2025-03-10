<script lang="ts">
  import { onMount } from "svelte";
  import Nut from "./Nut.svelte";
  import Neck from "./Neck.svelte";
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
    instrument,
    boxAspectRatio = 1,
  }: ChordDiagramProps = $props();

  // Derived string and fret counts based on instrument type
  const stringCount = $derived(instrument === "guitar" ? 6 : 4);
  const fretCount = $derived(instrument === "guitar" ? 5 : 4);

  // Measure container width so the SVG fills the parent
  onMount(() => {
    if (container) {
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          parentWidth = entry.contentRect.width;
        }
      });
      resizeObserver.observe(container);
      return () => resizeObserver.disconnect();
    }
  });

  // Calculate spacings based on orientation
  const fretSpacing = $derived(() => {
    if (orientation === "horizontal") {
      return (parentWidth - nutWidth) / fretCount;
    } else {
      return boxAspectRatio * (parentWidth / (stringCount - 1));
    }
  });

  const stringSpacing = $derived(() => {
    if (orientation === "horizontal") {
      return fretSpacing() / boxAspectRatio;
    } else {
      return parentWidth / (stringCount - 1);
    }
  });

  // Calculate height based on orientation
  const height = $derived(() => {
    if (orientation === "horizontal") {
      return stringSpacing() * (stringCount - 1);
    } else {
      return nutWidth + fretCount * fretSpacing();
    }
  });

  // Width is always parentWidth
  const width = $derived(() => parentWidth);
</script>

<div bind:this={container} class="h-auto w-full">
  <svg width={width()} height={height()} viewBox="0 0 {width()} {height()}">
    {#if orientation === "horizontal"}
      <!-- Nut on the left -->
      <Nut width={nutWidth} height={height()} color={nutColor} />
      <!-- Move neck to the right by nutWidth -->
      <g transform="translate({nutWidth}, 0)">
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
        />
      </g>
    {:else}
      <!-- Nut on top -->
      <Nut width={width()} height={nutWidth} color={nutColor} />
      <!-- Move neck down by nutWidth -->
      <g transform="translate(0, {nutWidth})">
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
        />
      </g>
    {/if}
  </svg>
</div>

<script lang="ts">
  import type { NutProps } from "./types.js";
  let {
    width,
    height,
    color,
    orientation,
    parentWidth,
    x = 0,
    y = 0,
  }: NutProps = $props();
  // Extra length is 4% of the parentWidth
  const extra = $derived(() => 0.04 * parentWidth);
  const newWidth = $derived(() =>
    orientation === "horizontal" ? width : width + extra()
  );
  const newHeight = $derived(() =>
    orientation === "horizontal" ? height + extra() : height
  );
  const offsetX = $derived(() =>
    orientation === "horizontal" ? 0 : -extra() / 2
  );
  const offsetY = $derived(() =>
    orientation === "horizontal" ? -extra() / 2 : 0
  );
</script>

<rect
  x={x + offsetX()}
  y={y + offsetY()}
  width={newWidth()}
  height={newHeight()}
  fill={color}
/>

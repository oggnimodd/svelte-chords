<script lang="ts">
  import type { NutProps } from "./types.js";

  let { width, height, color, orientation, parentWidth } = $props();

  // Calculate extra length: 4% of parentWidth
  const extra = $derived(() => 0.04 * parentWidth);

  // Compute new dimensions and offsets reactively
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
  x={offsetX()}
  y={offsetY()}
  width={newWidth()}
  height={newHeight()}
  fill={color}
/>

<script lang="ts">
  import type { NutProps } from "./types.js";

  let { width, height, color }: NutProps = $props();
</script>

<rect x="0" y="0" {width} {height} fill={color} />

<script lang="ts">
  import "../app.css";
  import Sampler from "$lib/components/website/Sampler.svelte";
  let { children } = $props();
</script>

<Sampler />
{@render children()}

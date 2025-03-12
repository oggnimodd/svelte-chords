<script lang="ts">
  import "../app.css";
  import Sampler from "../docs/components/Sampler.svelte";
  let { children } = $props();
</script>

<Sampler />
{@render children()}

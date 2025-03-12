<script lang="ts">
  import { sampleStore } from "../stores/sampler.svelte.js";
  import { createAccousticGuitarSampler } from "../utils/sampler.js";
  import { onDestroy, onMount } from "svelte";
  import * as Tone from "tone";

  onMount(() => {
    (async () => {
      sampleStore.sampler = createAccousticGuitarSampler();
      await Tone.loaded();
    })();
  });

  onDestroy(() => {
    if (sampleStore.sampler) sampleStore.sampler.dispose();
  });
</script>

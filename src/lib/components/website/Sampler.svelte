<script lang="ts">
  import { store } from "./store.svelte.js";
  import { createAccousticGuitarSampler } from "$lib/utils/sampler.js";
  import { onDestroy, onMount } from "svelte";
  import * as Tone from "tone";

  onMount(() => {
    (async () => {
      store.sampler = createAccousticGuitarSampler();
      await Tone.loaded();
    })();
  });

  onDestroy(() => {
    if (store.sampler) store.sampler.dispose();
  });
</script>

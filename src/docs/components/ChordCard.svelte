<script lang="ts">
  import type { ChordDiagramProps } from "$lib/svelte-chords/types.js";
  import ChordDiagram from "$lib/svelte-chords/ChordDiagram.svelte";
  import { toPng } from "html-to-image";
  import * as Tone from "tone";
  import { sampleStore } from "../stores/sampler.svelte.js";
  import { createAccousticGuitarSampler } from "../utils/sampler.js";

  interface ChordCardTheme {
    bg: string;
    accent: string;
    dot: string;
    string: string;
    fret: string;
    nut: string;
    marker: string;
    card: string;
    border: string;
    shadow: string;
    text: string;
    heading: string;
    button: string;
    dotRadius: number;
    capoColor: string;
  }

  interface ChordCard {
    chord: ChordDiagramProps["chord"];
    instrument: "guitar" | "ukulele";
    orientation: "vertical" | "horizontal";
    theme: ChordCardTheme;
    title: string;
  }

  let { chord, instrument, orientation, theme, title }: ChordCard = $props();

  let diagramContainer: HTMLElement | null = $state(null);

  const downloadChordAsPng = () => {
    if (!diagramContainer) return;
    toPng(diagramContainer, { pixelRatio: 3 })
      .then((dataUrl: string) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          if (!ctx) return;
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.beginPath();
          const radius = 12;
          ctx.roundRect(0, 0, canvas.width, canvas.height, radius);
          ctx.clip();
          ctx.drawImage(img, 0, 0);
          const roundedDataUrl = canvas.toDataURL("image/png");
          const link = document.createElement("a");
          link.download = `${title}-chord.png`;
          link.href = roundedDataUrl;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        };
        img.src = dataUrl;
      })
      .catch((error: Error) => {
        console.error("Error generating chord image:", error);
      });
  };

  const playChord = () => {
    if (!chord.midi) return;

    if (!sampleStore.sampler) {
      sampleStore.sampler = createAccousticGuitarSampler();
    }
    // Convert MIDI note numbers to note names (e.g., 60 -> "C4")
    const noteNames = chord.midi.map((midi: number) =>
      Tone.Frequency(midi, "midi").toNote()
    );

    // Current Tone time
    const now = Tone.now();
    const strumDelay = 0.03;

    // A downward strum, play the notes in order
    noteNames.forEach((note, index) => {
      sampleStore.sampler?.triggerAttackRelease(
        note,
        "2n",
        now + index * strumDelay
      );
    });
  };
</script>

<div class="flex flex-col gap-y-3">
  <div
    class={`${theme.card} overflow-hidden rounded-2xl ${theme.shadow} ${theme.border} transform transition-all duration-300 hover:scale-105 hover:shadow-2xl`}
    bind:this={diagramContainer}
  >
    <div
      class={`bg-gradient-to-r ${theme.accent} flex items-center justify-center px-6 py-3`}
    >
      <h3 class="text-center text-lg font-semibold text-white">
        {title}
      </h3>
    </div>
    <div class="flex items-center justify-center p-6">
      <ChordDiagram
        {chord}
        {instrument}
        {orientation}
        dotRadius={theme.dotRadius}
        nutWidth={4}
        stringColor={theme.string}
        fretColor={theme.fret}
        dotColor={theme.dot}
        nutColor={theme.nut}
        markerColor={theme.marker}
        capoColor={theme.capoColor}
        fretWidth={0.8}
        stringWidth={0.8}
      />
    </div>
  </div>
  <div class="flex justify-center gap-x-4">
    <button
      class={`rounded-xl px-6 py-3 ${theme.button} flex cursor-pointer items-center justify-center shadow transition-transform duration-200 hover:scale-105`}
      onclick={downloadChordAsPng}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="mr-2 h-5 w-5"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fill-rule="evenodd"
          d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
          clip-rule="evenodd"
        />
      </svg>
      PNG
    </button>
    <button
      class={`rounded-xl px-6 py-3 ${theme.button} flex cursor-pointer items-center justify-center shadow transition-transform duration-200 hover:scale-105`}
      onclick={playChord}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="mr-2 h-5 w-5"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path d="M4 4l12 6-12 6V4z" />
      </svg>
      Play
    </button>
  </div>
</div>

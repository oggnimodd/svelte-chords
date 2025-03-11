<script lang="ts">
  import { ChordDiagram, type ChordDefinition } from "$lib/index.js";

  const chordsGuitar: ChordDefinition[] = [
    {
      frets: [3, 0, 0, 0, 3, 3],
      fingers: [1, 0, 0, 0, 2, 3],
      baseFret: 1,
    },
    {
      frets: [1, 1, 1, 3, 4, 1],
      fingers: [1, 1, 1, 3, 4, 1],
      baseFret: 5,
      barres: [1],
      capo: true,
    },
    {
      frets: ["x", 4, 1, 1, 2, 4],
      fingers: [0, 3, 1, 1, 2, 4],
      baseFret: 7,
      barres: [1],
      capo: true,
    },
    {
      frets: [1, 1, 3, 3, 1, 1],
      fingers: [1, 1, 3, 4, 1, 1],
      baseFret: 10,
      barres: [1],
      capo: true,
    },
  ];

  const chordsUkulele: ChordDefinition[] = [
    {
      frets: [1, 0, 1, 0],
      fingers: [1, 0, 2, 0],
      baseFret: 1,
    },
  ];
</script>

<div class="mx-auto flex max-w-4xl flex-col gap-y-16 px-4 py-20">
  <!-- Guitar vertical -->
  <div class="mt-4 grid grid-cols-2 gap-20 sm:grid-cols-4">
    {#each chordsGuitar as chord}
      <ChordDiagram
        {chord}
        instrument="guitar"
        orientation="vertical"
        nutWidth={4}
        nutColor="black"
        dotRadius={7}
        dotColor="black"
        stringColor="black"
        fretColor="black"
        backgroundColor="white"
        titleFontSize={20}
        titleFontFamily="Arial, sans-serif"
        titleColor="black"
        showTitle={true}
        markerSize={16}
      />
    {/each}
  </div>

  <!-- Guitar horizontal -->
  <div class="mt-4 grid grid-cols-2 gap-20 sm:grid-cols-4">
    {#each chordsGuitar as chord}
      <ChordDiagram
        {chord}
        instrument="guitar"
        orientation="horizontal"
        nutWidth={4}
        nutColor="black"
        dotRadius={7}
        dotColor="black"
        stringColor="black"
        fretColor="black"
        backgroundColor="white"
        titleFontSize={20}
        titleFontFamily="Arial, sans-serif"
        titleColor="black"
        showTitle={true}
        markerSize={16}
      />
    {/each}
  </div>

  <!-- Ukulele vertical -->
  <div class="mt-4 grid grid-cols-2 gap-20 sm:grid-cols-4">
    {#each chordsUkulele as chord}
      <ChordDiagram
        {chord}
        instrument="ukulele"
        orientation="vertical"
        nutWidth={4}
        nutColor="black"
        dotRadius={7}
        dotColor="black"
        stringColor="black"
        fretColor="black"
        backgroundColor="white"
        titleFontSize={20}
        titleFontFamily="Arial, sans-serif"
        titleColor="black"
        showTitle={true}
        markerSize={16}
        boxAspectRatio={0.8}
      />
    {/each}
  </div>

  <!-- Ukulele horizontal -->
  <div class="mt-4 grid grid-cols-2 gap-20 sm:grid-cols-4">
    {#each chordsUkulele as chord}
      <ChordDiagram
        {chord}
        instrument="ukulele"
        orientation="horizontal"
        nutWidth={4}
        nutColor="black"
        dotRadius={7}
        dotColor="black"
        stringColor="black"
        fretColor="black"
        backgroundColor="white"
        titleFontSize={20}
        titleFontFamily="Arial, sans-serif"
        titleColor="black"
        showTitle={true}
        markerSize={16}
      />
    {/each}
  </div>
</div>

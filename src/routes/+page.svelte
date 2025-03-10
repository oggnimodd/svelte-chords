<script lang="ts">
  import { ChordDiagram, type ChordDefinition } from "$lib/index.js";

  // C major
  const chordsGuitar: ChordDefinition[] = [
    {
      frets: "x32010",
      fingers: "032010",
    },
    {
      frets: "x35553",
      fingers: "012341",
      barres: 3,
      capo: true,
    },
    {
      frets: "xx5558",
      fingers: "001114",
      barres: 5,
    },
    {
      frets: "8aa988",
      fingers: "134211",
      barres: 8,
      capo: true,
    },
  ];

  const chordsUkulele: ChordDefinition[] = [
    {
      frets: "0003",
      fingers: "0003",
    },
    {
      frets: "0433",
      fingers: "0211",
      barres: 3,
    },
    {
      frets: "5433",
      fingers: "3211",
      barres: 3,
      capo: true,
    },
    {
      frets: "5787",
      fingers: "1243",
    },
  ];
</script>

<div class="mx-auto max-w-4xl px-4 py-20">
  <div class="mt-4 grid grid-cols-4 gap-10">
    {#each chordsGuitar as chord}
      <ChordDiagram
        {chord}
        instrument="guitar"
        orientation="vertical"
        nutWidth={6}
        nutColor="black"
        dotRadius={7}
        dotColor="black"
        stringColor="black"
        fretColor="black"
        showFingerNumbers={true}
        barreColor="rgba(0,0,0,0.5)"
        barreThickness={8}
        backgroundColor="white"
        titleFontSize={20}
        titleFontFamily="Arial, sans-serif"
        titleColor="black"
        showTitle={true}
        markerSize={16}
      />
    {/each}
  </div>

  <!-- Guitar horizontal chords -->
  <div class="mt-4 grid grid-cols-4 gap-10">
    {#each chordsGuitar as chord}
      <ChordDiagram
        {chord}
        instrument="guitar"
        orientation="horizontal"
        nutWidth={6}
        nutColor="black"
        dotRadius={7}
        dotColor="black"
        stringColor="black"
        fretColor="black"
        showFingerNumbers={true}
        barreColor="rgba(0,0,0,0.5)"
        barreThickness={8}
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

<script lang="ts">
  import type { ChordsDB, Chord, ChordName } from "$lib/types/chords-db.js";
  // @ts-ignore
  import guitarChordsData from "$lib/chords-db/guitar.json";
  // @ts-ignore
  import ukuleleChordsData from "$lib/chords-db/ukulele.json";
  import ChordDiagram from "$lib/ChordDiagram.svelte";
  import { toPng } from "html-to-image";

  // Load chord data (cast to ChordsDB)
  let guitarChords = guitarChordsData as ChordsDB;
  // @ts-ignore
  let ukuleleChords = ukuleleChordsData as ChordsDB;

  // --- Mapping for keys ---
  function displayKey(dbKey: string): string {
    const map: Record<string, string> = {
      Csharp: "C#",
      Fsharp: "F#",
      Dsharp: "D#",
      Gsharp: "G#",
      Asharp: "A#",
    };
    return map[dbKey] ?? dbKey;
  }

  // Mapping from display key back to database key.
  const keyDisplayToDBMap: Record<string, ChordName> = {
    "C#": "Csharp",
    "F#": "Fsharp",
    "D#": "Eb",
    "G#": "Ab",
    "A#": "Bb",
  };

  // Track user-selected key, suffix, and instrument with $state.
  let selectedKey = $state("C");
  let selectedSuffix = $state("major");
  let selectedInstrument: "guitar" | "ukulele" = $state("guitar");

  // Derive the chord object for (key + suffix)
  let chordData = $derived.by(() => {
    // Convert display key to DB key if available.
    const dbKey: ChordName =
      keyDisplayToDBMap[selectedKey] ?? (selectedKey as ChordName);
    // Select the appropriate chord database based on instrument.
    const chordsDb =
      selectedInstrument === "guitar" ? guitarChords : ukuleleChords;
    const chordList = chordsDb.chords[dbKey] ?? [];
    return chordList.find((c: Chord) => c.suffix === selectedSuffix);
  });

  // Derive the positions/variations.
  let variations = $derived.by(() => {
    return chordData?.positions ?? [];
  });

  // Generate chord name
  let chordName = $derived(
    `${selectedKey}${selectedSuffix !== "major" ? " " + selectedSuffix : ""}`
  );

  // Get theme colors based on instrument
  let themeColors = $derived.by(() => {
    return selectedInstrument === "guitar"
      ? {
          bg: "bg-gradient-to-br from-blue-50 to-indigo-100",
          accent: "from-blue-500 to-indigo-600",
          dot: "#3B82F6", // blue-500
          string: "#1E40AF", // blue-800
          fret: "#1E293B", // slate-800
          nut: "#334155", // slate-700
          marker: "#6366F1", // indigo-500
          card: "bg-white",
          border: "border-blue-200",
          shadow: "shadow-blue-100",
          text: "text-blue-900",
          heading: "text-blue-700",
        }
      : {
          bg: "bg-gradient-to-br from-emerald-50 to-teal-100",
          accent: "from-emerald-500 to-teal-600",
          dot: "#10B981", // emerald-500
          string: "#065F46", // emerald-800
          fret: "#1E293B", // slate-800
          nut: "#334155", // slate-700
          marker: "#14B8A6", // teal-500
          card: "bg-white",
          border: "border-emerald-200",
          shadow: "shadow-emerald-100",
          text: "text-emerald-900",
          heading: "text-emerald-700",
        };
  });

  const downloadChordAsPng = (e: MouseEvent) => {
    // Check if the event target is the same as the currentTarget (the button)
    // This ensures the function only runs when the button itself is clicked
    if (e.target !== e.currentTarget) {
      return; // Exit if clicked on a child element
    }

    // Find the ChordDiagram element inside the clicked button
    const buttonElement = e.currentTarget as HTMLElement;

    if (buttonElement) {
      // Use the toPng function to convert the chord diagram to an image
      toPng(buttonElement)
        .then((dataUrl: string) => {
          // Create a download link
          const link = document.createElement("a");
          link.download = `${chordName}-chord.png`;
          link.href = dataUrl;

          // Trigger download
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        })
        .catch((error: Error) => {
          console.error("Error generating chord image:", error);
        });
    }
  };
</script>

<div class={`min-h-screen ${themeColors.bg} px-4 py-12 sm:px-6 lg:px-8`}>
  <div class="container mx-auto max-w-5xl">
    <!-- Header -->
    <div class="mb-10 text-center">
      <h1 class="mb-2 text-3xl font-bold tracking-tight sm:text-4xl">
        <span class={themeColors.text}>Chord Finder</span>
      </h1>
      <p class="mx-auto max-w-2xl text-gray-600">
        Find and explore different chord variations for guitar and ukulele
      </p>
    </div>

    <!-- Controls -->
    <div
      class={`mb-8 rounded-xl border bg-white/70 p-6 shadow-lg backdrop-blur-sm ${themeColors.border}`}
    >
      <div
        class="flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6"
      >
        <div class="w-full sm:w-auto">
          <label
            for="key"
            class={`mb-1 block text-sm font-medium ${themeColors.heading}`}
            >Key:</label
          >
          <select
            id="key"
            class={`block w-full rounded-lg border-0 px-4 py-2.5 sm:w-32 ${themeColors.text} bg-white/80 shadow-sm ring-1 ring-gray-300 backdrop-blur-sm ring-inset focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6`}
            onchange={(e) =>
              (selectedKey = (e.target as HTMLSelectElement).value)}
          >
            {#each guitarChords.keys as keyOption}
              <option
                value={displayKey(keyOption)}
                selected={displayKey(keyOption) === selectedKey}
              >
                {displayKey(keyOption)}
              </option>
            {/each}
          </select>
        </div>

        <div class="w-full sm:w-auto">
          <label
            for="suffix"
            class={`mb-1 block text-sm font-medium ${themeColors.heading}`}
            >Suffix:</label
          >
          <select
            id="suffix"
            class={`block w-full rounded-lg border-0 px-4 py-2.5 sm:w-48 ${themeColors.text} bg-white/80 shadow-sm ring-1 ring-gray-300 backdrop-blur-sm ring-inset focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6`}
            onchange={(e) =>
              (selectedSuffix = (e.target as HTMLSelectElement).value)}
          >
            {#each guitarChords.suffixes as suffixOption}
              <option
                value={suffixOption}
                selected={suffixOption === selectedSuffix}
              >
                {suffixOption}
              </option>
            {/each}
          </select>
        </div>

        <div class="w-full sm:w-auto">
          <label
            for="instrument"
            class={`mb-1 block text-sm font-medium ${themeColors.heading}`}
            >Instrument:</label
          >
          <select
            id="instrument"
            class={`block w-full rounded-lg border-0 px-4 py-2.5 sm:w-40 ${themeColors.text} bg-white/80 shadow-sm ring-1 ring-gray-300 backdrop-blur-sm ring-inset focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6`}
            onchange={(e) =>
              (selectedInstrument = (e.target as HTMLSelectElement).value as
                | "ukulele"
                | "guitar")}
          >
            <option value="guitar" selected={selectedInstrument === "guitar"}
              >Guitar</option
            >
            <option value="ukulele" selected={selectedInstrument === "ukulele"}
              >Ukulele</option
            >
          </select>
        </div>
      </div>
    </div>

    <!-- Display selected chord -->
    <div class={`mb-6 text-center`}>
      <div class={`text-2xl font-bold sm:text-3xl ${themeColors.text}`}>
        {chordName}
      </div>
      <div class="mt-1 text-gray-600">
        {selectedInstrument === "guitar" ? "Guitar" : "Ukulele"} Chord
      </div>
    </div>

    <!-- Show variations for the chosen chord -->
    {#if variations.length === 0}
      <div
        class="rounded-xl bg-white/80 p-8 text-center shadow-lg backdrop-blur-sm"
      >
        <p class="text-lg text-gray-600">
          No chord shapes found for {chordName}.
        </p>
      </div>
    {:else}
      <div
        class="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4"
      >
        {#each variations as position, i}
          <button
            onclick={downloadChordAsPng}
            class={`${themeColors.card} overflow-hidden rounded-xl shadow-lg ${themeColors.shadow} border ${themeColors.border} transform overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl`}
          >
            <div
              class={`bg-gradient-to-r ${themeColors.accent} pointer-events-none flex items-center justify-center px-4 py-2`}
            >
              <h3
                class="text-center text-lg font-medium font-semibold text-white"
              >
                {chordName}
              </h3>
            </div>
            <div
              class="pointer-events-none flex items-center justify-center p-4"
            >
              <!-- Pass the position data with custom colors -->
              <ChordDiagram
                chord={position}
                instrument={selectedInstrument}
                orientation="vertical"
                dotRadius={8}
                nutWidth={4}
                stringColor={themeColors.string}
                fretColor={themeColors.fret}
                dotColor={themeColors.dot}
                nutColor={themeColors.nut}
                markerColor={themeColors.marker}
                fretWidth={0.8}
                stringWidth={0.8}
              />
            </div>
          </button>
        {/each}
      </div>
    {/if}
  </div>
</div>

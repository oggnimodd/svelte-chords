<script lang="ts">
  import type { ChordsDB, Chord, ChordName } from "$lib/types/chords-db.js";
  // @ts-ignore
  import guitarChordsData from "$lib/chords-db/guitar.json";
  // @ts-ignore
  import ukuleleChordsData from "$lib/chords-db/ukulele.json";
  import ChordDiagram from "$lib/ChordDiagram.svelte";

  // Load chord data (cast to ChordsDB)
  let guitarChords = guitarChordsData as ChordsDB;
  let ukuleleChords = ukuleleChordsData as ChordsDB;

  // --- Mapping for keys ---
  // When displaying, we want "Csharp" to show as "C#" etc.
  function displayKey(dbKey: string): string {
    const map: Record<string, string> = {
      Csharp: "C#",
      Fsharp: "F#",
      // Add more mappings here if needed.
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
  // Note: Store the display version for the key.
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
    // Explicitly type parameter c as Chord.
    return chordList.find((c: Chord) => c.suffix === selectedSuffix);
  });

  // Derive the positions/variations.
  let variations = $derived.by(() => {
    return chordData?.positions ?? [];
  });
</script>

<div class="container mx-auto max-w-4xl space-y-4 p-4 py-10">
  <!-- Dropdowns for selecting key, suffix, and instrument -->
  <div class="flex items-center space-x-2">
    <label for="key" class="font-semibold">Key:</label>
    <select
      id="key"
      class="rounded border px-2 py-1"
      onchange={(e) => (selectedKey = (e.target as HTMLSelectElement).value)}
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

    <label for="suffix" class="font-semibold">Suffix:</label>
    <select
      id="suffix"
      class="rounded border px-2 py-1"
      onchange={(e) => (selectedSuffix = (e.target as HTMLSelectElement).value)}
    >
      {#each guitarChords.suffixes as suffixOption}
        <option value={suffixOption} selected={suffixOption === selectedSuffix}>
          {suffixOption}
        </option>
      {/each}
    </select>

    <label for="instrument" class="font-semibold">Instrument:</label>
    <select
      id="instrument"
      class="rounded border px-2 py-1"
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

  <!-- Show variations for the chosen chord -->
  {#if variations.length === 0}
    <div class="text-gray-500">
      No chord shapes found for {selectedKey}
      {selectedSuffix}.
    </div>
  {:else}
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
      {#each variations as position, i}
        <div class="rounded border p-2 shadow-sm">
          <p class="mb-2 text-sm font-semibold">Variation {i + 1}</p>
          <!-- Pass the position data directly to your ChordDiagram -->
          <ChordDiagram
            chord={position}
            instrument={selectedInstrument}
            orientation="vertical"
            dotRadius={7}
            nutWidth={3}
            stringColor="black"
            fretColor="black"
            fretWidth={0.5}
            stringWidth={0.5}
          />
        </div>
      {/each}
    </div>
  {/if}
</div>

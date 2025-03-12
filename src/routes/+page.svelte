<script lang="ts">
  import type {
    ChordsDB,
    Chord,
    ChordName,
    UkuleleChordsDB,
  } from "../types/chords-db.js";
  // @ts-ignore - ignore TS errors for now
  import guitarChordsData from "../chords-db/guitar.json";
  // @ts-ignore - ignore TS errors for now

  import ukuleleChordsData from "../chords-db/ukulele.json";
  import ChordCard from "../docs/components/ChordCard.svelte";

  // Load chord data (cast to proper types)
  let guitarChords = guitarChordsData as ChordsDB;
  let ukuleleChords = ukuleleChordsData as UkuleleChordsDB;

  // Use canonical keys in the select component.
  const canonicalKeys = [
    "C",
    "C#",
    "D",
    "D#",
    "E",
    "F",
    "F#",
    "G",
    "G#",
    "A",
    "A#",
    "B",
  ];

  // Mapping for guitar: keep type safety.
  const guitarMapping: Record<string, ChordName> = {
    "C#": "Csharp",
    "F#": "Fsharp",
    "D#": "Eb",
    "G#": "Ab",
    "A#": "Bb",
  };

  // Mapping for ukulele: use plain strings because DB keys are flats.
  const ukeMapping: Record<string, string> = {
    "C#": "Db",
    "F#": "Gb",
    "D#": "Eb",
    "G#": "Ab",
    "A#": "Bb",
  };

  // Store user selections in canonical form.
  let selectedKey = $state("C"); // always canonical, like "C#" not "Db"
  let selectedSuffix = $state("major");
  let selectedInstrument: "guitar" | "ukulele" = $state("guitar");
  let selectedOrientation: "vertical" | "horizontal" = $state("vertical");

  // Derive the chord object using the canonical key.
  let chordData = $derived.by(() => {
    const dbKey =
      selectedInstrument === "guitar"
        ? (guitarMapping[selectedKey] ?? selectedKey)
        : (ukeMapping[selectedKey] ?? selectedKey);
    const chordsDb =
      selectedInstrument === "guitar" ? guitarChords : ukuleleChords;
    // Cast dbKey to the proper key type to satisfy TS.
    const chordList =
      chordsDb.chords[dbKey as keyof typeof chordsDb.chords] ?? [];
    return chordList.find((c: Chord) => c.suffix === selectedSuffix);
  });

  // Derive the positions/variations.
  let variations = $derived.by(() => {
    return chordData?.positions ?? [];
  });

  // Generate chord name using the canonical key.
  let chordName = $derived(
    `${selectedKey}${selectedSuffix !== "major" ? " " + selectedSuffix : ""}`
  );

  // Get theme colors based on instrument.
  let theme = $derived.by(() => {
    return selectedInstrument === "guitar"
      ? {
          bg: "bg-gradient-to-br from-blue-100 to-indigo-100",
          accent: "from-blue-500 to-indigo-600",
          dot: "#3B82F6",
          string: "#1E40AF",
          fret: "#1E40AF",
          nut: "#334155",
          marker: "#6366F1",
          card: "bg-white/90",
          border: "border border-blue-200",
          shadow: "shadow-xl",
          text: "text-blue-900",
          heading: "text-blue-700",
          button: "bg-blue-600 hover:bg-blue-700 text-white",
          dotRadius: 6,
          capoColor: "#6366F180",
        }
      : {
          bg: "bg-gradient-to-br from-emerald-100 to-teal-100",
          accent: "from-emerald-500 to-teal-600",
          dot: "#10B981",
          string: "#065F46",
          fret: "#065F46",
          nut: "#334155",
          marker: "#14B8A6",
          card: "bg-white/90",
          border: "border border-emerald-200",
          shadow: "shadow-xl",
          text: "text-emerald-900",
          heading: "text-emerald-700",
          button: "bg-emerald-600 hover:bg-emerald-700 text-white",
          dotRadius: 7.5,
          capoColor: "#10B98180",
        };
  });
</script>

<div class={`min-h-screen ${theme.bg} px-4 py-12 sm:px-6 lg:px-8`}>
  <div class="container mx-auto max-w-5xl">
    <!-- Header -->
    <div class="mb-12 text-center">
      <h1 class="mb-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
        <span
          class="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent"
        >
          Chord Finder
        </span>
      </h1>
      <p class="mx-auto max-w-2xl text-lg text-gray-700">
        Explore stunning chord variations for both guitar and ukulele.
      </p>
    </div>
    <!-- Controls -->
    <div
      class={`mb-10 rounded-2xl ${theme.card} ${theme.border} p-8 shadow-2xl backdrop-blur-lg`}
    >
      <div
        class="flex flex-col items-center justify-center gap-6 sm:flex-row sm:flex-wrap"
      >
        <div class="w-full sm:w-auto">
          <label
            for="key"
            class={`mb-1 block text-sm font-medium ${theme.heading}`}
          >
            Key:
          </label>
          <select
            id="key"
            class="block w-full rounded-xl border-0 bg-white px-4 py-2.5 text-gray-800 shadow focus:ring-2 focus:ring-indigo-500 sm:w-32 sm:text-sm"
            onchange={(e) =>
              (selectedKey = (e.target as HTMLSelectElement).value)}
          >
            {#each canonicalKeys as keyOption}
              <option value={keyOption} selected={keyOption === selectedKey}>
                {keyOption}
              </option>
            {/each}
          </select>
        </div>
        <div class="w-full sm:w-auto">
          <label
            for="suffix"
            class={`mb-1 block text-sm font-medium ${theme.heading}`}
          >
            Suffix:
          </label>
          <select
            id="suffix"
            class="block w-full rounded-xl border-0 bg-white px-4 py-2.5 text-gray-800 shadow focus:ring-2 focus:ring-indigo-500 sm:w-48 sm:text-sm"
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
            class={`mb-1 block text-sm font-medium ${theme.heading}`}
          >
            Instrument:
          </label>
          <select
            id="instrument"
            class="block w-full rounded-xl border-0 bg-white px-4 py-2.5 text-gray-800 shadow focus:ring-2 focus:ring-indigo-500 sm:w-40 sm:text-sm"
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
        <div class="w-full sm:w-auto">
          <label
            for="orientation"
            class={`mb-1 block text-sm font-medium ${theme.heading}`}
          >
            Direction:
          </label>
          <select
            id="orientation"
            class="block w-full rounded-xl border-0 bg-white px-4 py-2.5 text-gray-800 shadow focus:ring-2 focus:ring-indigo-500 sm:w-40 sm:text-sm"
            onchange={(e) =>
              (selectedOrientation = (e.target as HTMLSelectElement).value as
                | "vertical"
                | "horizontal")}
          >
            <option
              value="vertical"
              selected={selectedOrientation === "vertical"}>Vertical</option
            >
            <option
              value="horizontal"
              selected={selectedOrientation === "horizontal"}>Horizontal</option
            >
          </select>
        </div>
      </div>
    </div>
    <!-- Display selected chord -->
    <div class="mb-8 text-center">
      <div class={`text-3xl font-bold sm:text-4xl ${theme.text}`}>
        {chordName}
      </div>
      <div class="mt-1 text-lg text-gray-600">
        {selectedInstrument === "guitar" ? "Guitar" : "Ukulele"} Chord
      </div>
    </div>
    <!-- Show variations for the chosen chord using ChordCard component -->
    {#if variations.length === 0}
      <div
        class="rounded-2xl bg-white/90 p-10 text-center shadow-2xl backdrop-blur-lg"
      >
        <p class="text-xl text-gray-600">
          No chord shapes found for {chordName}.
        </p>
      </div>
    {:else}
      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {#each variations as position, i}
          <ChordCard
            chord={position}
            instrument={selectedInstrument}
            orientation={selectedOrientation}
            {theme}
            title={chordName}
          />
        {/each}
      </div>
    {/if}
  </div>
</div>

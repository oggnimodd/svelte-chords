<script lang="ts">
  import Nut from "./Nut.svelte";
  import Neck from "./Neck.svelte";
  import StringMarker from "./StringMarker.svelte";
  import Dot from "./Dot.svelte";
  import Barre from "./Barre.svelte";
  import Capo from "./Capo.svelte";
  import type { ChordDiagramProps, Orientation } from "./types.js";

  let {
    chord,
    instrument = "guitar",
    orientation = "horizontal",
    nutWidth = 10,
    nutColor = "black",
    stringColor = "gray",
    stringWidth = 1,
    fretColor = "gray",
    fretWidth = 1,
    boxAspectRatio = 1,
    dotRadius = 10,
    dotColor = "black",
    showFingerNumber = true,
    barreColor,
    barreThickness,
    ref = $bindable(),
    capoColor,
  }: ChordDiagramProps = $props();

  const stringCount = $derived(instrument === "guitar" ? 6 : 4);
  const fretCount = $derived(instrument === "guitar" ? 5 : 4);

  let V = $state(100);
  let baseFretIndicatorSize = $derived.by(() => V * 0.22);
  let markerSpacingSize = $derived.by(() => V * 0.1);

  let baseIndicatorSize = $derived.by(() =>
    orientation === "vertical" ? baseFretIndicatorSize : markerSpacingSize
  );

  let contentWidthVertical = $derived.by(() => V - baseIndicatorSize);
  let stringSpacingVertical = $derived.by(
    () => contentWidthVertical / (stringCount - 1)
  );
  let fretSpacingVertical = $derived.by(
    () => boxAspectRatio * stringSpacingVertical
  );
  let neckHeightVertical = $derived.by(() => fretCount * fretSpacingVertical);

  let markerHeightVertical = $derived.by(() =>
    orientation === "vertical" ? markerSpacingSize : 0
  );

  let nutHeightVertical = nutWidth;
  let totalHeightVertical = $derived.by(
    () =>
      markerHeightVertical + nutHeightVertical + neckHeightVertical + dotRadius
  );
  let totalWidthVertical = $derived.by(() => V + dotRadius);

  let baseIndicatorHeightHorizontal = $derived.by(() =>
    orientation === "horizontal" ? baseFretIndicatorSize : 0
  );

  let nutWidthHorizontal = nutWidth;
  let neckWidthHorizontal = $derived.by(
    () => V - baseIndicatorHeightHorizontal - nutWidthHorizontal
  );
  let fretSpacingHorizontal = $derived.by(
    () => neckWidthHorizontal / fretCount
  );
  let stringSpacingHorizontal = $derived.by(
    () => fretSpacingHorizontal / boxAspectRatio
  );
  let diagramHeightHorizontal = $derived.by(
    () => (stringCount - 1) * stringSpacingHorizontal
  );
  let totalHeightHorizontal = $derived.by(
    () => baseIndicatorHeightHorizontal + diagramHeightHorizontal + dotRadius
  );
  let totalWidthHorizontal = $derived.by(() => V + dotRadius);

  // Helper functions to parse frets and fingers
  const parseFrets = () =>
    typeof chord.frets === "string"
      ? chord.frets.split(",").map((s) => parseInt(s.trim()))
      : chord.frets;

  const parseFingers = () =>
    typeof chord.fingers === "string" ? chord.fingers.split("") : chord.fingers;

  let fretsVertical = $derived.by(() => parseFrets());
  let fretsHorizontal = $derived.by(() => parseFrets().slice().reverse());
  let fingersVertical = $derived.by(() => parseFingers());
  let fingersHorizontal = $derived.by(() => parseFingers().slice().reverse());

  // Markers helper; reverse true for horizontal markers
  const getMarkers = (reverse: boolean) => {
    const raw = parseFrets();
    const markers: { type: "x" | "o"; stringIndex: number }[] = [];

    for (let i = 0; i < stringCount; i++) {
      const index = reverse ? stringCount - 1 - i : i;
      const val = raw[index];

      if (val === 0) {
        markers.push({ type: "o", stringIndex: i });
      } else if (val === -1) {
        markers.push({ type: "x", stringIndex: i });
      }
    }

    return markers;
  };

  let markersVertical = $derived.by(() => getMarkers(false));
  let markersHorizontal = $derived.by(() => getMarkers(true));

  // If user doesn’t pass a barreColor, use the dotColor.
  const actualBarreColor = $derived(barreColor ?? dotColor);
  // If user doesn’t pass a barreThickness, use dotRadius * 2.
  const actualBarreThickness = $derived(barreThickness ?? dotRadius * 2);

  const computeBarres = () => {
    if (!chord.barres || chord.barres.length === 0) return [];

    // Reverse the frets if horizontal, same as how you do for dots.
    const orientedFrets =
      orientation === "horizontal"
        ? parseFrets().slice().reverse()
        : parseFrets();

    const barresArr: {
      start: number;
      end: number;
      fret: number;
      thickness: number;
      color: string;
      orientation: Orientation;
    }[] = [];

    for (const barreFret of chord.barres) {
      // Collect the strings that have this barreFret
      const stringIndices = orientedFrets
        .map((f, i) => (f === barreFret ? i : -1))
        .filter((i) => i !== -1);

      // Only do a barre if at least 2 strings share the same fret
      if (stringIndices.length >= 2) {
        const min = Math.min(...stringIndices);
        const max = Math.max(...stringIndices);

        if (orientation === "vertical") {
          // For vertical, strings go left->right, so the line is horizontal
          const fretPos =
            markerHeightVertical +
            nutHeightVertical +
            (barreFret - 0.5) * fretSpacingVertical;

          const start = baseIndicatorSize + min * stringSpacingVertical;
          const end = baseIndicatorSize + max * stringSpacingVertical;

          barresArr.push({
            start,
            end,
            fret: fretPos,
            thickness: actualBarreThickness,
            color: actualBarreColor,
            orientation: "horizontal",
          });
        } else {
          // For horizontal, strings go top->bottom, so the line is vertical
          const fretPos =
            baseIndicatorSize +
            nutWidthHorizontal +
            (barreFret - 0.5) * fretSpacingHorizontal;

          const start =
            baseIndicatorHeightHorizontal + min * stringSpacingHorizontal;
          const end =
            baseIndicatorHeightHorizontal + max * stringSpacingHorizontal;

          barresArr.push({
            start,
            end,
            fret: fretPos,
            thickness: actualBarreThickness,
            color: actualBarreColor,
            orientation: "vertical",
          });
        }
      }
    }

    return barresArr;
  };
  let barres = $derived.by(() => computeBarres());

  const actualCapoColor = $derived(capoColor ?? actualBarreColor);

  const capo = $derived.by(() => {
    if (!chord.capo) return null;

    let capoFret = 0;
    if (chord.barres && chord.barres.length > 0) {
      capoFret = Math.min(...chord.barres);
    }
    if (capoFret <= 0) return null;

    const thickness = actualBarreThickness;
    const color = actualCapoColor;

    if (orientation === "vertical") {
      const fretPos =
        markerHeightVertical +
        nutHeightVertical +
        (capoFret - 0.5) * fretSpacingVertical;
      const start = baseIndicatorSize;
      // Add dotRadius to the computed end to extend the capo length
      const end =
        baseIndicatorSize +
        (stringCount - 1) * stringSpacingVertical +
        dotRadius;

      return {
        x: start,
        y: fretPos - thickness / 2,
        width: end - start,
        height: thickness,
        color,
        orientation: "vertical" as Orientation,
      };
    } else {
      const fretPos =
        baseIndicatorSize +
        nutWidthHorizontal +
        (capoFret - 0.5) * fretSpacingHorizontal;
      const start = baseIndicatorHeightHorizontal;
      // Extend the capo length by adding dotRadius
      const end =
        baseIndicatorHeightHorizontal +
        (stringCount - 1) * stringSpacingHorizontal +
        dotRadius;

      return {
        x: fretPos - thickness / 2,
        y: start,
        width: thickness,
        height: end - start,
        color,
        orientation: "horizontal" as Orientation,
      };
    }
  });
</script>

<svg
  bind:this={ref}
  width="100%"
  style="overflow: visible;"
  viewBox={orientation === "vertical"
    ? `0 0 ${totalWidthVertical} ${totalHeightVertical}`
    : `0 0 ${totalWidthHorizontal} ${totalHeightHorizontal}`}
>
  {#if orientation === "vertical"}
    {#if chord.baseFret > 1}
      <text
        x={baseIndicatorSize / 3}
        y={markerHeightVertical + nutHeightVertical + fretSpacingVertical / 2}
        font-size="10"
        text-anchor="middle"
        dominant-baseline="central"
      >
        {chord.baseFret}fr
      </text>
    {/if}

    {#each markersVertical as marker}
      <StringMarker
        type={marker.type}
        orientation="vertical"
        stringSpacing={stringSpacingVertical}
        {stringCount}
        stringIndex={marker.stringIndex}
        x={baseIndicatorSize + marker.stringIndex * stringSpacingVertical}
        y={markerHeightVertical / 2}
        fretSpacing={fretSpacingVertical}
      />
    {/each}

    {#if chord.baseFret === 1}
      <Nut
        width={contentWidthVertical}
        height={nutHeightVertical}
        color={nutColor}
        parentWidth={contentWidthVertical}
        orientation="vertical"
        x={baseIndicatorSize}
        y={markerHeightVertical}
      />
    {/if}

    {#if capo}
      <Capo
        x={capo.x}
        y={capo.y}
        width={capo.width}
        height={capo.height}
        color={capo.color}
        orientation={capo.orientation}
      />
    {/if}

    <Neck
      x={baseIndicatorSize}
      y={markerHeightVertical + nutHeightVertical}
      {stringCount}
      {fretCount}
      stringSpacing={stringSpacingVertical}
      fretSpacing={fretSpacingVertical}
      {stringWidth}
      {fretWidth}
      {stringColor}
      {fretColor}
      orientation="vertical"
      skipFirstFretLine={false}
    />

    {#each barres as barre}
      <Barre
        start={barre.start}
        end={barre.end}
        fret={barre.fret}
        thickness={barre.thickness}
        color={barre.color}
        orientation={barre.orientation}
      />
    {/each}

    {#each fretsVertical as fret, i}
      {#if typeof fret === "number" && fret > 0}
        <Dot
          x={baseIndicatorSize + i * stringSpacingVertical}
          y={markerHeightVertical +
            nutHeightVertical +
            (fret - 0.5) * fretSpacingVertical}
          radius={dotRadius}
          color={dotColor}
          {showFingerNumber}
          fingerNumber={fingersVertical[i]}
        />
      {/if}
    {/each}
  {:else}
    {#if chord.baseFret > 1}
      <text
        x={baseIndicatorSize + nutWidthHorizontal + fretSpacingHorizontal / 2}
        y={baseIndicatorHeightHorizontal / 3}
        font-size="10"
        text-anchor="middle"
        dominant-baseline="central"
      >
        {chord.baseFret}fr
      </text>
    {/if}

    {#each markersHorizontal as marker}
      <StringMarker
        type={marker.type}
        orientation="horizontal"
        stringSpacing={stringSpacingHorizontal}
        {stringCount}
        stringIndex={marker.stringIndex}
        x={baseIndicatorSize / 2}
        y={baseIndicatorHeightHorizontal +
          marker.stringIndex * stringSpacingHorizontal}
        fretSpacing={fretSpacingHorizontal}
      />
    {/each}

    {#if chord.baseFret === 1}
      <Nut
        width={nutWidthHorizontal}
        height={diagramHeightHorizontal}
        color={nutColor}
        parentWidth={nutWidthHorizontal}
        orientation="horizontal"
        x={baseIndicatorSize}
        y={baseIndicatorHeightHorizontal}
      />
    {/if}

    {#if capo}
      <Capo
        x={capo.x}
        y={capo.y}
        width={capo.width}
        height={capo.height}
        color={capo.color}
        orientation={capo.orientation}
      />
    {/if}

    <Neck
      x={baseIndicatorSize + nutWidthHorizontal}
      y={baseIndicatorHeightHorizontal}
      {stringCount}
      {fretCount}
      stringSpacing={stringSpacingHorizontal}
      fretSpacing={fretSpacingHorizontal}
      {stringWidth}
      {fretWidth}
      {stringColor}
      {fretColor}
      orientation="horizontal"
      skipFirstFretLine={false}
    />

    {#each barres as barre}
      <Barre
        start={barre.start}
        end={barre.end}
        fret={barre.fret}
        thickness={barre.thickness}
        color={barre.color}
        orientation={barre.orientation}
      />
    {/each}

    {#each fretsHorizontal as fret, i}
      {#if typeof fret === "number" && fret > 0}
        <Dot
          x={baseIndicatorSize +
            nutWidthHorizontal +
            (fret - 0.5) * fretSpacingHorizontal}
          y={baseIndicatorHeightHorizontal + i * stringSpacingHorizontal}
          radius={dotRadius}
          color={dotColor}
          {showFingerNumber}
          fingerNumber={fingersHorizontal[i]}
        />
      {/if}
    {/each}
  {/if}
</svg>

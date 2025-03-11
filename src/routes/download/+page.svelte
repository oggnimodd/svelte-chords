<script lang="ts">
  import ChordDiagram from "$lib/ChordDiagram.svelte";
  import type { ChordDefinition } from "$lib/types.js";
  import { toSvg } from "html-to-image";

  let svgRef: HTMLOrSVGElement | undefined = $state();

  const downloadSvg = async () => {
    if (!svgRef) return;
    const dataUrl = await toSvg(svgRef);

    // Download svg
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = "chord.svg";
    link.click();
  };

  const chordData: ChordDefinition = {
    frets: "x35553",
    fingers: "012341",
    barres: 3,
    capo: true,
  };
</script>

<button onclick={downloadSvg}>Download svg</button>

<div bind:this={svgRef}>
  <ChordDiagram
    chord={chordData}
    instrument="guitar"
    orientation="vertical"
    nutWidth={4}
    nutColor="black"
    dotRadius={7}
    dotColor="black"
    stringColor="black"
    fretColor="black"
    barreColor="rgba(0,0,0,0.5)"
    barreThickness={8}
    backgroundColor="white"
    titleFontSize={20}
    titleFontFamily="Arial, sans-serif"
    titleColor="black"
    showTitle={true}
    markerSize={16}
    boxAspectRatio={1}
  />
</div>

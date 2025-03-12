import * as Tone from "tone";

export function createAccousticGuitarSampler() {
  return new Tone.Sampler({
    urls: {
      C4: "C4.mp3",
      F4: "F4.mp3",
      G4: "G4.mp3",
      A4: "A4.mp3",
    },
    baseUrl: "/guitar/",
    attack: 0.02,
    release: 1.5,
  }).toDestination();
}

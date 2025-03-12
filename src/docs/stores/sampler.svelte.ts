import type { Sampler } from "tone";

interface SamplerStore {
  sampler: Sampler | null;
}

export const sampleStore: SamplerStore = $state({
  sampler: null,
});

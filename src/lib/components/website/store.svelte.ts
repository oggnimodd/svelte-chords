import type { Sampler } from "tone";

interface Store {
  sampler: Sampler | null;
}

export const store: Store = $state({
  sampler: null,
});

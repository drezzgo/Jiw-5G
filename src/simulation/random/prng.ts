export interface DeterministicRandom {
  next(): number;
  between(min: number, max: number): number;
  chance(probability: number): boolean;
  integer(minInclusive: number, maxInclusive: number): number;
}

/**
 * Mulberry32: small deterministic 32-bit PRNG suitable for reproducible
 * academic simulations. It is NOT cryptographically secure.
 */
export class Mulberry32 implements DeterministicRandom {
  private state: number;

  constructor(seed: number) {
    this.state = seed >>> 0;
  }

  next(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  between(min: number, max: number): number {
    if (max < min) throw new Error("max must be >= min");
    return min + (max - min) * this.next();
  }

  chance(probability: number): boolean {
    if (probability < 0 || probability > 1) {
      throw new Error("probability must be between 0 and 1");
    }
    return this.next() < probability;
  }

  integer(minInclusive: number, maxInclusive: number): number {
    if (maxInclusive < minInclusive) throw new Error("invalid integer range");
    return Math.floor(this.between(minInclusive, maxInclusive + 1));
  }
}

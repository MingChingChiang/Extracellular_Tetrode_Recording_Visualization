/**
 * Digital Signal Processing Module
 * Implements basic filters for Electrophysiology.
 */

export class DSP {
    constructor() {
        // Simple IIR Filter state
        this.filters = {};
    }

    static generateNoise(amplitude) {
        // Gaussian noise (Box-Muller transform)
        const u1 = Math.random();
        const u2 = Math.random();
        const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
        return z * amplitude;
    }

    // Simple RC Low Pass Filter
    // y[i] = y[i-1] + alpha * (x[i] - y[i-1])
    static lowPass(current, previous, dt, cutoff) {
        if (!cutoff) return current;
        const rc = 1.0 / (2.0 * Math.PI * cutoff);
        const alpha = dt / (rc + dt);
        return previous + alpha * (current - previous);
    }

    // High Pass Filter (via Low Pass subtraction)
    // HP = Signal - LP
    static highPass(current, previousLP, dt, cutoff) {
        if (!cutoff) return current;
        const lp = DSP.lowPass(current, previousLP, dt, cutoff);
        return current - lp;
    }
}

export class BandPassFilter {
    constructor(lowCutoff, highCutoff, sampleRate) {
        this.lowCutoff = lowCutoff;   // e.g., 300 Hz (High Pass part)
        this.highCutoff = highCutoff; // e.g., 6000 Hz (Low Pass part)
        this.dt = 1 / sampleRate;

        this.prevLP_High = 0; // State for the Low Pass used in High Pass
        this.prevLP_Low = 0;  // State for the Low Pass
    }

    process(sample) {
        // 1. Apply High Pass (remove < lowCutoff)
        // HP = Sample - LP(lowCutoff)
        // We need to track the LP state for this subtraction
        const lpForHp = DSP.lowPass(sample, this.prevLP_High, this.dt, this.lowCutoff);
        this.prevLP_High = lpForHp;
        const highPassed = sample - lpForHp;

        // 2. Apply Low Pass (remove > highCutoff)
        const bandPassed = DSP.lowPass(highPassed, this.prevLP_Low, this.dt, this.highCutoff);
        this.prevLP_Low = bandPassed;

        return bandPassed;
    }

    reset() {
        this.prevLP_High = 0;
        this.prevLP_Low = 0;
    }
}

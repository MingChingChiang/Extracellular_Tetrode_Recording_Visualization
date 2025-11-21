/**
 * Simulation Engine for Extracellular Recording
 * Handles the physics of volume conduction and neuron current sources.
 */

import { DSP } from './dsp.js';

export class Neuron {
    constructor(x, y, z, type = 'pyramidal') {
        // Position of Soma
        this.somaPos = { x, y, z };
        this.type = type; // 'pyramidal' or 'interneuron'

        // Apical Dendrite extends upwards (negative y)
        // Interneurons might be more compact, but for dipole model let's keep simple.
        // If interneuron, maybe smaller dipole or different orientation?
        // For now, let's assume similar dipole but maybe shorter for interneuron?
        const dendLen = type === 'interneuron' ? 100 : 300;
        this.dendritePos = { x, y: y - dendLen, z };

        this.time = 0;
        this.baseFiringRate = type === 'interneuron' ? 20 : 5; // Hz
        this.isSpiking = false;
        this.spikeTime = 0;

        // Current state
        this.somaCurrent = 0; // nA
        this.dendriteCurrent = 0; // nA
    }

    update(dt) {
        this.time += dt;

        // Poisson Firing Process
        // Probability of firing in this time step = rate * dt
        // Only fire if not already spiking (refractory period approx spike width)
        if (!this.isSpiking) {
            const prob = this.baseFiringRate * dt;
            if (Math.random() < prob) {
                this.fire();
            }
        }

        // Calculate Current based on spike time
        if (this.isSpiking) {
            const t_rel = this.time - this.spikeTime;
            const duration = 0.005; // 5ms spike duration including AHP

            if (t_rel > duration) {
                this.isSpiking = false;
                this.somaCurrent = 0;
                this.dendriteCurrent = 0;
            } else {
                // Generate Spike Waveform
                // Gaussian-ish
                const sigma = 0.0005; // 0.5ms width
                const center = 0.001; // Peak at 1ms
                const amp = 800; // nA

                let I = -amp * Math.exp(-Math.pow(t_rel - center, 2) / (2 * sigma * sigma));

                // AHP (After Hyperpolarization) - slower positive current
                I += (amp * 0.25) * Math.exp(-Math.pow(t_rel - 0.003, 2) / (2 * 0.001 * 0.001));

                this.somaCurrent = I;
                this.dendriteCurrent = -I;
            }
        }
    }

    fire() {
        this.isSpiking = true;
        this.spikeTime = this.time;
    }
}

export class Electrode {
    constructor(x, y, z, name) {
        this.pos = { x, y, z };
        this.name = name;
        this.voltage = 0;
        this.history = new Array(500).fill(0);
    }

    setPosition(x, y, z) {
        this.pos = { x, y, z };
    }

    record(potential) {
        this.voltage = potential;
        this.history.push(potential);
        this.history.shift();
    }
}

export class PhysicsEngine {
    constructor() {
        this.sigma = 0.3; // S/m
        this.k = 1 / (4 * Math.PI * this.sigma);
        this.noiseLevel = 50; // uV (microvolts) - Default increased

        // Ref: UnitMatch (Nature Methods 2024)
        // d10 is the distance at which amplitude decays to 10% of max.
        // Range: 30 - 95 um. We use a median value of 60 um.
        // Formula: A(d) = A0 * exp(-d/lambda)
        // 0.1 = exp(-d10/lambda)  =>  ln(0.1) = -d10/lambda  =>  lambda = d10 / ln(10)
        this.d10 = 60; // um
        this.spatialDecayConstant = this.d10 / Math.log(10); // approx 26 um
    }

    calculatePotential(point, neurons) {
        let totalPotential = 0;

        // Linear Superposition of all neurons
        // neurons can be a single Neuron or an Array
        const neuronList = Array.isArray(neurons) ? neurons : [neurons];

        for (const neuron of neuronList) {
            const rSoma = this.distance(point, neuron.somaPos);
            const rDend = this.distance(point, neuron.dendritePos);

            const minR = 10; // Avoid singularity

            // V = k * I / r
            let vSoma = this.k * neuron.somaCurrent / Math.max(rSoma, minR);
            let vDend = this.k * neuron.dendriteCurrent / Math.max(rDend, minR);

            // Apply Exponential Decay to highlight local specificity (Tetrode advantage)
            // V_decayed = V * exp(-r / lambda)
            vSoma *= Math.exp(-rSoma / this.spatialDecayConstant);
            vDend *= Math.exp(-rDend / this.spatialDecayConstant);

            totalPotential += (vSoma + vDend);
        }

        // Add Noise (in mV)
        // noiseLevel is in uV, so divide by 1000
        if (this.noiseLevel > 0) {
            totalPotential += DSP.generateNoise(this.noiseLevel / 1000);
        }

        return totalPotential;
    }

    distance(p1, p2) {
        return Math.sqrt(
            Math.pow(p1.x - p2.x, 2) +
            Math.pow(p1.y - p2.y, 2) +
            Math.pow(p1.z - p2.z, 2)
        );
    }
}


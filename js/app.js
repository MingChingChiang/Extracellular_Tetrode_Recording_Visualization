/**
 * Main Application Controller
 */

import { Neuron, Electrode, PhysicsEngine } from './simulation.js';
import { SpatialView, WaveformView, SpikeView } from './view.js';
import { BandPassFilter } from './dsp.js';

class App {
    constructor() {
        // Initialize Physics
        this.physics = new PhysicsEngine();

        // Initialize CA1 Layer
        // ML Range: 1.0 - 1.5 mm (1000 - 1500 um)
        // Tightly packed: ~30 um spacing
        // Width = 500 um. Count = 500 / 30 ~= 16-17.
        this.neurons = [];
        this.generateNeurons();

        // Initialize Electrodes
        // Tetrode Geometry: 12um wire, diamond pattern
        // Center at 1250 (Middle of ML range), -1000 (Depth)
        this.tetrodeCenter = { x: 1250, y: -1000, z: 0 };
        const d = 12;
        this.tetrode = [
            new Electrode(0, -1000 - d, 0, 'Ch1'),
            new Electrode(d, -1000, 0, 'Ch2'),
            new Electrode(0, -1000 + d, 0, 'Ch3'),
            new Electrode(-d, -1000, 0, 'Ch4')
        ];
        this.updateTetrodePosition(1250, -1000);

        // Reference Electrode at -500 um
        this.reference = new Electrode(1450, -500, 0, 'Ref'); // Move ref to side

        // Simulation State
        this.isPlaying = true;
        this.physicsStepsPerFrame = 5;
        this.dt = 0.0005;
        this.sampleRate = 1 / this.dt;

        this.filters = this.tetrode.map(() => new BandPassFilter(300, 6000, this.sampleRate));
        this.filterMode = 'raw';

        // Spike Detection State
        this.spikeThreshold = 0.05;
        this.refractoryPeriod = 0.002;
        this.lastSpikeTime = -1;

        // Initialize Views
        const spatialContainer = document.getElementById('spatial-view-container');
        this.spatialView = new SpatialView('spatial-canvas', spatialContainer.clientWidth, spatialContainer.clientHeight);

        this.waveformView = new WaveformView('waveform-canvas');
        this.spikeView = new SpikeView('scatter-canvas');

        this.showField = true;

        // Bind Controls
        this.bindControls();

        // Start Loop
        this.lastTime = performance.now();
        this.animate();

        // Handle Resize
        window.addEventListener('resize', () => {
            this.spatialView.resize(spatialContainer.clientWidth, spatialContainer.clientHeight);
            this.waveformView.resize();
            this.spikeView.resize();
        });
    }

    generateNeurons() {
        this.neurons = [];
        const mlStart = 1000;
        const mlEnd = 1500;
        const spacing = 30; // um (Cell body diameter)
        const count = Math.floor((mlEnd - mlStart) / spacing);

        for (let i = 0; i < count; i++) {
            // Tightly packed
            const x = mlStart + i * spacing + spacing / 2;
            // 20% chance of being an Interneuron
            const type = Math.random() < 0.2 ? 'interneuron' : 'pyramidal';

            let y;
            if (type === 'interneuron') {
                // Interneuron: Close to Pyramidal layer (-1200) with small offset (+/- 10 um)
                y = -1200 + (Math.random() - 0.5) * 20;
            } else {
                // Pyramidal: Standard jitter (+/- 20 um)
                y = -1200 + (Math.random() - 0.5) * 40;
            }

            const z = 0;

            const neuron = new Neuron(x, y, z, type);

            if (type === 'pyramidal') {
                neuron.baseFiringRate = 5 + (Math.random() - 0.5) * 2;
            } else {
                neuron.baseFiringRate = 20 + (Math.random() - 0.5) * 5; // Fast firing
            }

            this.neurons.push(neuron);
        }
    }

    bindControls() {
        // Play/Pause
        const playBtn = document.getElementById('play-pause-btn');
        playBtn.addEventListener('click', () => {
            this.isPlaying = !this.isPlaying;
            playBtn.innerHTML = this.isPlaying ?
                '<span class="icon">⏸</span> Pause Simulation' :
                '<span class="icon">▶</span> Resume Simulation';
            playBtn.style.background = this.isPlaying ? 'var(--accent-color)' : '#ff9800';
        });

        // Refresh Clusters Button
        const refreshBtn = document.getElementById('refresh-clusters-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.generateNeurons();
                this.spikeView.clearSpikes();
            });
        }

        // Hotkey 'C' for Refresh
        window.addEventListener('keydown', (e) => {
            if (e.key.toLowerCase() === 'c') {
                this.generateNeurons();
                this.spikeView.clearSpikes();
            }
        });

        // Waveform Range Input
        const waveRangeInput = document.getElementById('waveform-range');
        if (waveRangeInput) {
            waveRangeInput.addEventListener('change', (e) => {
                const range = parseFloat(e.target.value);
                this.waveformView.setRange(range);
            });
            // Set initial
            this.waveformView.setRange(parseFloat(waveRangeInput.value));
        }

        // Scatter Range Input
        const scatterRangeInput = document.getElementById('scatter-range');
        if (scatterRangeInput) {
            scatterRangeInput.addEventListener('change', (e) => {
                const range = parseFloat(e.target.value);
                this.spikeView.setRange(range);
            });
            // Set initial
            this.spikeView.setRange(parseFloat(scatterRangeInput.value));
        }

        // Depth Slider: Left (-800) to Right (-2000)
        // We use a positive scale 800 -> 2000 and negate it.
        const depthSlider = document.getElementById('depth-slider');
        const depthValue = document.getElementById('depth-value');
        depthSlider.min = 800;
        depthSlider.max = 2000;
        depthSlider.value = 1000; // Starts at -1000
        depthValue.textContent = -1000;

        depthSlider.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            const depth = -val; // Negate to get coordinate
            depthValue.textContent = depth;
            this.updateTetrodePosition(null, depth);
        });

        // Offset Slider: 1000 to 1500
        const offsetSlider = document.getElementById('offset-slider');
        const offsetValue = document.getElementById('offset-value');
        offsetSlider.min = 1000;
        offsetSlider.max = 1500;
        offsetSlider.value = 1250;
        offsetValue.textContent = 1250;

        offsetSlider.addEventListener('input', (e) => {
            const offset = parseFloat(e.target.value);
            offsetValue.textContent = offset;
            this.updateTetrodePosition(offset, null);
        });

        // Reference Slider
        const refSlider = document.getElementById('ref-slider');
        const refValue = document.getElementById('ref-value');
        refSlider.min = -2.0;
        refSlider.max = 1.0;
        refSlider.step = 0.1;
        refSlider.value = -0.5;
        refValue.textContent = -0.5;

        refSlider.addEventListener('input', (e) => {
            const distMm = parseFloat(e.target.value);
            refValue.textContent = distMm.toFixed(1);
            this.reference.setPosition(1450, distMm * 1000, 0);
        });

        // Noise Slider
        const noiseSlider = document.getElementById('noise-slider');
        const noiseValue = document.getElementById('noise-value');
        if (noiseSlider) {
            noiseSlider.addEventListener('input', (e) => {
                const noise = parseInt(e.target.value);
                noiseValue.textContent = noise;
                this.physics.noiseLevel = noise;
            });
        }

        // Filter Select
        const filterSelect = document.getElementById('filter-select');
        if (filterSelect) {
            filterSelect.addEventListener('change', (e) => {
                this.filterMode = e.target.value;
                this.filters.forEach(f => f.reset());

                if (this.filterMode === 'lfp') {
                    this.filters.forEach(f => { f.lowCutoff = 1; f.highCutoff = 300; });
                } else if (this.filterMode === 'spike') {
                    this.filters.forEach(f => { f.lowCutoff = 300; f.highCutoff = 6000; });
                }
            });
        }

        // Show Field Checkbox
        const showFieldCheck = document.getElementById('show-field');
        showFieldCheck.addEventListener('change', (e) => {
            this.showField = e.target.checked;
        });

        // Firing Rate & Co-firing
        const freqSlider = document.getElementById('freq-slider');
        const freqValue = document.getElementById('freq-value');
        freqSlider.addEventListener('input', (e) => {
            const freq = parseFloat(e.target.value);
            freqValue.textContent = freq.toFixed(1);

            // Update all neurons
            this.neurons.forEach(n => n.baseFiringRate = freq);

            // Co-firing Logic:
            // When slider moves, trigger a synchronous burst in a subset of neurons
            // Pick 3 random neurons and force them to fire soon
            if (Math.random() < 0.3) { // Don't do it every single event
                const indices = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => 0.5 - Math.random()).slice(0, 3);
                indices.forEach(idx => {
                    if (this.neurons[idx]) this.neurons[idx].fire();
                });
            }
        });
    }

    updateTetrodePosition(newOffset, newDepth) {
        let cx = this.tetrodeCenter.x;
        let cy = this.tetrodeCenter.y;

        if (newOffset !== null) cx = newOffset;
        if (newDepth !== null) cy = newDepth;

        this.tetrodeCenter = { x: cx, y: cy, z: 0 };

        const d = 12;
        const offsets = [
            { x: 0, y: -d },
            { x: d, y: 0 },
            { x: 0, y: d },
            { x: -d, y: 0 }
        ];

        this.tetrode.forEach((elec, i) => {
            elec.setPosition(cx + offsets[i].x, cy + offsets[i].y, 0);
        });
    }

    detectSpikes(voltages) {
        // Voltages are in mV.
        // Threshold: 50 uV = 0.05 mV.
        const threshold = 0.05;

        // We want to detect NEGATIVE peaks for extracellular spikes.
        // But we can just look for absolute deviation > threshold.
        // Or strictly negative peaks. Let's do strictly negative < -threshold.

        const minVal = Math.min(...voltages); // Most negative value

        if (minVal < -threshold) {
            // Simple debounce
            const now = performance.now() / 1000;
            if (now - this.lastSpikeTime > this.refractoryPeriod) {
                this.lastSpikeTime = now;

                // Capture Peak Amplitudes (Absolute values)
                // We want the magnitude of the spike on each channel.
                // Ideally we should find the peak in a small window, but for real-time viz,
                // we'll take the current value (assuming we caught the peak).
                // Better: take the absolute value of the current voltage.

                const amplitudes = voltages.map(v => Math.abs(v));
                this.spikeView.addSpike(amplitudes);
            }
        }
    }

    animate() {
        const now = performance.now();
        // const dt = (now - this.lastTime) / 1000; 
        this.lastTime = now;

        if (this.isPlaying) {
            for (let step = 0; step < this.physicsStepsPerFrame; step++) {
                // 1. Update Neurons
                this.neurons.forEach(n => n.update(this.dt));

                // 2. Calculate Potentials
                const refPotential = this.physics.calculatePotential(this.reference.pos, this.neurons);

                const currentVoltages = [];

                this.tetrode.forEach((elec, i) => {
                    const rawPotential = this.physics.calculatePotential(elec.pos, this.neurons);
                    let signal = rawPotential - refPotential;

                    if (this.filterMode !== 'raw') {
                        signal = this.filters[i].process(signal);
                    }

                    currentVoltages.push(signal);

                    if (step === this.physicsStepsPerFrame - 1) {
                        elec.record(signal);
                    }
                });

                // Spike Detection (on the last step)
                if (step === this.physicsStepsPerFrame - 1) {
                    this.detectSpikes(currentVoltages);
                }
            }
        } else {
            // Even if paused, we might want to update potentials if electrode moved?
            // Yes, static field visualization.
            // But we don't update neuron time/spiking.
            const refPotential = this.physics.calculatePotential(this.reference.pos, this.neurons);
            this.tetrode.forEach((elec, i) => {
                const rawPotential = this.physics.calculatePotential(elec.pos, this.neurons);
                let signal = rawPotential - refPotential;
                // No filtering update in static mode to avoid ringing
                // Just show raw static potential? Or keep last value?
                // Let's just not update the waveform history, but update the field view.
            });
        }

        // 3. Render Spatial View (Always render to show electrode movement)
        this.spatialView.clear();
        if (this.showField) {
            this.spatialView.drawField(this.physics, this.neurons);
        }
        this.spatialView.drawNeurons(this.neurons);
        this.spatialView.drawElectrodes(this.tetrode, this.reference);

        // 4. Render Waveforms (Only if playing, or static buffer)
        this.waveformView.clear();
        this.waveformView.drawTraces(this.tetrode);

        // 5. Render Spikes
        this.spikeView.clear();
        this.spikeView.drawScatter();

        requestAnimationFrame(() => this.animate());
    }
}

window.addEventListener('DOMContentLoaded', () => {
    new App();
});

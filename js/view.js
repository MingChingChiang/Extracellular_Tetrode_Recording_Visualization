/**
 * Visualization Logic
 * Handles rendering of the spatial view and waveform display.
 */

export class SpatialView {
    constructor(canvasId, width, height) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');

        // Viewport settings
        this.yMin = 0; // Top (Surface)
        this.yMax = -2500; // Bottom (Deep)
        this.xRange = 800; // um width

        this.resize(width, height);
        this.bindInteraction();
    }

    bindInteraction() {
        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            const delta = e.deltaY;
            const range = this.yMin - this.yMax;
            const shift = delta * (range / 1000); // Sensitivity

            // Pan Up/Down
            this.yMin -= shift;
            this.yMax -= shift;
        });
    }

    resize(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
        this.width = width;
        this.height = height;
    }

    setZoom(yMin, yMax) {
        this.yMin = yMin;
        this.yMax = yMax;
    }

    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }

    toScreen(x, y) {
        // Map World Coordinates to Screen Coordinates
        // World X: 1000 to 1500 um (Center 1250)
        // Screen Width represents xRange (e.g. 600um) centered at 1250

        const xCenter = 1250;
        // const xRange = 800; // Old
        const xRange = 600; // New tighter focus

        const screenX = ((x - xCenter) / xRange + 0.5) * this.width;

        // Normalize Y between 0 and 1 based on range
        const normalizedY = (this.yMin - y) / (this.yMin - this.yMax);
        const screenY = normalizedY * this.height;

        return { x: screenX, y: screenY };
    }

    toWorld(screenX, screenY) {
        const xCenter = 1250;
        const xRange = 600;

        const x = (screenX / this.width - 0.5) * xRange + xCenter;

        const normalizedY = screenY / this.height;
        const y = this.yMin - normalizedY * (this.yMin - this.yMax);

        return { x, y };
    }

    drawField(physics, neurons) {
        // Optimization: Only calculate every Nth pixel
        const resolution = 10;
        const cols = Math.ceil(this.width / resolution);
        const rows = Math.ceil(this.height / resolution);

        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                const sx = i * resolution;
                const sy = j * resolution;

                // Convert Screen to World
                const worldPos = this.toWorld(sx, sy);

                const V = physics.calculatePotential({ x: worldPos.x, y: worldPos.y, z: 0 }, neurons);

                const maxV = 0.05;
                const normV = Math.max(-1, Math.min(1, V / maxV));

                let color;
                if (normV > 0) {
                    color = `rgba(255, 82, 82, ${normV * 0.5})`;
                } else {
                    color = `rgba(68, 138, 255, ${Math.abs(normV) * 0.5})`;
                }

                this.ctx.fillStyle = color;
                this.ctx.fillRect(sx, sy, resolution, resolution);
            }
        }
    }

    drawNeurons(neurons) {
        const neuronList = Array.isArray(neurons) ? neurons : [neurons];
        for (const neuron of neuronList) {
            this.drawPyramidalCell(neuron);
        }
    }

    // Hanze et al 2000 style
    drawPyramidalCell(neuron) {
        const soma = this.toScreen(neuron.somaPos.x, neuron.somaPos.y);

        // Orientation: Soma is Dorsal (Top), Dendrites extend Ventral (Bottom).
        // In our new coordinate system:
        // Surface = 0 (Top of Screen)
        // Deep = -2000 (Bottom of Screen)
        // Soma is at -1200.
        // Dendrites should go towards -2000 (Down on screen).
        // Apical Dendrite extends from Soma towards Ventral (Deep).

        // Wait, Pyramidal cells in CA1:
        // Soma is in Stratum Pyramidale.
        // Apical Dendrites extend into Stratum Radiatum / Lacunosum-Moleculare (towards fissure/dentate).
        // Basal Dendrites extend into Stratum Oriens (towards alveus/surface).
        // Usually "Dorsal" is Surface/Alveus. "Ventral" is Fissure.
        // So Apical Dendrites point DOWN (Ventral). Basal point UP (Dorsal).
        // My previous drawing had Apical pointing UP.
        // User asked: "neuron上下翻轉，讓cell body 更接近dorsal的位置"
        // This implies Soma Top, Apical Down.

        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.lineWidth = 1.5;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';

        // Flash color
        const color = neuron.isSpiking ? '#ffff00' : 'rgba(255, 255, 255, 0.8)';
        this.ctx.strokeStyle = color;
        this.ctx.fillStyle = color;

        // 1. Soma (Triangular/Pear shape)
        // Pointing DOWN (Apex points to Apical Dendrite)
        const size = 12;
        this.ctx.beginPath();
        this.ctx.moveTo(soma.x, soma.y + size); // Apex (Bottom)
        this.ctx.bezierCurveTo(
            soma.x - size, soma.y - size / 2,
            soma.x - size / 2, soma.y - size,
            soma.x, soma.y - size
        );
        this.ctx.bezierCurveTo(
            soma.x + size / 2, soma.y - size,
            soma.x + size, soma.y - size / 2,
            soma.x, soma.y + size
        );
        this.ctx.fill();

        // 2. Apical Dendrite (Thick shaft + branches) -> EXTENDS DOWN
        // Main Shaft
        this.ctx.beginPath();
        this.ctx.moveTo(soma.x, soma.y + size);
        this.ctx.lineTo(soma.x, soma.y + 250); // Long shaft DOWN
        this.ctx.lineWidth = 3;
        this.ctx.stroke();

        // Oblique Branches (Proximal)
        this.ctx.lineWidth = 1.5;
        this.ctx.beginPath();
        // Left branch
        this.ctx.moveTo(soma.x, soma.y + 50);
        this.ctx.quadraticCurveTo(soma.x - 30, soma.y + 60, soma.x - 60, soma.y + 40);
        // Right branch
        this.ctx.moveTo(soma.x, soma.y + 70);
        this.ctx.quadraticCurveTo(soma.x + 30, soma.y + 80, soma.x + 50, soma.y + 60);
        this.ctx.stroke();

        // Tuft (Distal)
        this.ctx.beginPath();
        const tuftStart = soma.y + 250;
        this.ctx.moveTo(soma.x, tuftStart);
        // Fan out
        this.ctx.lineTo(soma.x - 40, tuftStart + 60);
        this.ctx.moveTo(soma.x, tuftStart);
        this.ctx.lineTo(soma.x + 40, tuftStart + 60);
        this.ctx.moveTo(soma.x, tuftStart);
        this.ctx.lineTo(soma.x, tuftStart + 70);
        this.ctx.stroke();

        // 3. Basal Dendrites (Skirt) -> EXTENDS UP
        this.ctx.beginPath();
        this.ctx.moveTo(soma.x, soma.y - size);
        this.ctx.lineTo(soma.x - 40, soma.y - size - 30);
        this.ctx.moveTo(soma.x, soma.y - size);
        this.ctx.lineTo(soma.x + 40, soma.y - size - 30);
        this.ctx.moveTo(soma.x, soma.y - size);
        this.ctx.lineTo(soma.x, soma.y - size - 40);
        this.ctx.stroke();
    }

    drawElectrodes(tetrode, reference) {
        const tetrodeColor = '#64ffda';

        tetrode.forEach((elec, index) => {
            const pos = this.toScreen(elec.pos.x, elec.pos.y);

            this.ctx.fillStyle = tetrodeColor;
            this.ctx.beginPath();
            this.ctx.arc(pos.x, pos.y, 4, 0, Math.PI * 2);
            this.ctx.fill();

            this.ctx.fillStyle = '#fff';
            this.ctx.font = '10px Arial';
            this.ctx.fillText((index + 1).toString(), pos.x + 8, pos.y);
        });

        const refPos = this.toScreen(reference.pos.x, reference.pos.y);
        this.ctx.fillStyle = '#ffeb3b';
        this.ctx.beginPath();
        this.ctx.arc(refPos.x, refPos.y, 8, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.fillText("REF", refPos.x + 12, refPos.y);
    }
}

export class WaveformView {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.resize();

        this.colors = ['#ff5252', '#448aff', '#69f0ae', '#ffd740'];
        this.range = 2000; // uV (+/- 2000)
    }

    resize() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width - 30;
        this.canvas.height = rect.height - 50; // Account for header
        this.width = this.canvas.width;
        this.height = this.canvas.height;
    }

    setRange(uV) {
        this.range = uV;
    }

    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }

    drawTraces(tetrode) {
        const historyLen = tetrode[0].history.length;
        const step = this.width / historyLen;

        // 5 Rows: Ch1, Ch2, Ch3, Ch4, Mean
        const numRows = 5;
        const rowHeight = this.height / numRows;

        // Gain Calculation:
        // Range is +/- X uV. Total span 2X uV.
        // Row Height should cover 2X uV.
        // Gain (pixels/mV) = rowHeight / (2 * range/1000)
        // e.g. Range 2000uV = 2mV. Span 4mV.
        // Gain = rowHeight / 4.
        const gain = rowHeight / (2 * this.range / 1000);

        // Draw Channels 1-4
        tetrode.forEach((elec, chIndex) => {
            const rowCenter = (chIndex * rowHeight) + (rowHeight / 2);

            // Draw Zero Line
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.moveTo(0, rowCenter);
            this.ctx.lineTo(this.width, rowCenter);
            this.ctx.stroke();

            // Draw Trace
            this.ctx.strokeStyle = this.colors[chIndex];
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();

            for (let i = 0; i < historyLen; i++) {
                const x = i * step;
                const y = rowCenter - (elec.history[i] * gain);
                if (i === 0) this.ctx.moveTo(x, y);
                else this.ctx.lineTo(x, y);
            }
            this.ctx.stroke();
        });

        // Draw Mean LFP (Row 5)
        const meanRowCenter = (4 * rowHeight) + (rowHeight / 2);

        // Zero Line
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.beginPath();
        this.ctx.moveTo(0, meanRowCenter);
        this.ctx.lineTo(this.width, meanRowCenter);
        this.ctx.stroke();

        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();

        for (let i = 0; i < historyLen; i++) {
            const x = i * step;
            let sum = 0;
            for (let ch = 0; ch < 4; ch++) sum += tetrode[ch].history[i];
            const mean = sum / 4;

            const y = meanRowCenter - (mean * gain);
            if (i === 0) this.ctx.moveTo(x, y);
            else this.ctx.lineTo(x, y);
        }
        this.ctx.stroke();
    }
}

export class SpikeView {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.resize();

        // Store detected spikes: { ch1: amp, ch2: amp, ... }
        this.spikes = [];
        this.maxSpikes = 200;
        this.range = 2000; // uV (0 to 2000)
    }

    resize() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width - 30;
        this.canvas.height = rect.height - 50;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
    }

    setRange(uV) {
        this.range = uV;
    }

    addSpike(amplitudes) {
        this.spikes.push(amplitudes);
        if (this.spikes.length > this.maxSpikes) {
            this.spikes.shift();
        }
    }

    clearSpikes() {
        this.spikes = [];
        this.clear();
    }

    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }

    drawScatter() {
        // 6 Subplots for 4 channels (4 choose 2 = 6 pairs)
        // Grid: 3 cols x 2 rows
        // Pairs: (1,2), (1,3), (1,4)
        //        (2,3), (2,4), (3,4)

        const pairs = [
            [0, 1], [0, 2], [0, 3],
            [1, 2], [1, 3], [2, 3]
        ];

        const cols = 3;
        const rows = 2;
        const w = this.width / cols;
        const h = this.height / rows;
        const padding = 5;

        pairs.forEach((pair, index) => {
            const col = index % cols;
            const row = Math.floor(index / cols);

            const x0 = col * w + padding;
            const y0 = row * h + padding;
            const plotW = w - 2 * padding;
            const plotH = h - 2 * padding;

            // Draw Box
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
            this.ctx.strokeRect(x0, y0, plotW, plotH);

            // Draw Points
            this.ctx.fillStyle = 'rgba(100, 255, 218, 0.8)';

            // Scale: 0 to Range (uV)
            // Input amplitudes are in mV.
            // Range is in uV.
            const maxAmpMv = this.range / 1000;

            this.spikes.forEach(spike => {
                const valX = spike[pair[0]]; // mV (absolute)
                const valY = spike[pair[1]]; // mV (absolute)

                // Map 0..maxAmp to 0..plotW
                // Origin (0,0) is Bottom-Left

                const px = x0 + (valX / maxAmpMv) * plotW;
                const py = y0 + plotH - (valY / maxAmpMv) * plotH;

                // Clip
                if (px >= x0 && px <= x0 + plotW && py >= y0 && py <= y0 + plotH) {
                    this.ctx.beginPath();
                    this.ctx.arc(px, py, 2, 0, Math.PI * 2);
                    this.ctx.fill();
                }
            });

            // Labels
            this.ctx.fillStyle = '#aaa';
            this.ctx.font = '10px Arial';
            this.ctx.fillText(`Ch${pair[0] + 1} vs Ch${pair[1] + 1}`, x0 + 5, y0 + 12);
        });
    }
}

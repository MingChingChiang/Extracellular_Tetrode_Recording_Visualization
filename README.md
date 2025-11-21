# Extracellular Tetrode Recording Visualization

An interactive simulation of in vivo electrophysiology, visualizing how a tetrode records neural activity from the CA1 layer of the hippocampus.

## Features
- **Realistic Physics**: Dipole neuron models, volume conduction, and noise simulation.
- **Interactive Controls**: Adjust tetrode depth, lateral offset, noise levels, and reference electrode position.
- **Real-time Analysis**: Live LFP/Spike waveforms and Spike Sorting (Cluster Analysis).
- **Responsive Design**: Optimized for Full HD (1920x1080) with scrollable support for smaller screens.

> [!NOTE]
> **Resizing the Window**: If you resize the browser window and the layout looks distorted, simply **refresh the page** to restore the correct proportions.

## How to Run Locally
Because this project uses modern JavaScript Modules (`import`/`export`), **you cannot simply double-click `index.html` to open it**. You must run a local web server.

### Option 1: VS Code (Recommended)
1. Install the **Live Server** extension in VS Code.
2. Right-click `index.html` and select **"Open with Live Server"**.

### Option 2: Python
Open a terminal in this folder and run:
```bash
# Python 3
python -m http.server 8000
```
Then open `http://localhost:8000` in your browser.

## How to Share (The Easiest Way)
To share this with classmates without them needing to install anything, deploy it to the web.

### Method: Netlify Drop (Drag & Drop)
1. Go to [app.netlify.com/drop](https://app.netlify.com/drop).
2. Drag this entire project folder onto the page.
3. Netlify will generate a live URL (e.g., `https://random-name.netlify.app`) that you can send to anyone!

### Method: GitHub Pages
1. Upload this code to a GitHub repository.
2. Go to **Settings** > **Pages**.
3. Select the `main` branch and save.
4. GitHub will provide a link to your live site.

## 📜 Changelog
See the full development history in [CHANGELOG.md](./CHANGELOG.md).

## 🤝 Credits
- **Code & Implementation**: Gemini 3 Pro (High)
- **Concept & Direction**: Ming-Ching Chiang
- **Special Thanks**: To the user for their continuous feedback and precise requirements that shaped this project through 23 phases of refinement.

## 🖊️ Citation
If you use this project in your research or presentation, please cite it as:

> Chiang, M. C. (2025). Extracellular Tetrode Recording Visualization [Computer software]. https://github.com/YOUR_USERNAME/tetrode-visualization

Or use the **"Cite this repository"** button in the GitHub sidebar.

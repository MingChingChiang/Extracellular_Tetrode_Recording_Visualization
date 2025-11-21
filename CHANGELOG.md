# Project History & Changelog

This document tracks the development evolution of the Extracellular Tetrode Recording Visualization project.

## Phase 23: Width-First Responsive Layout
- **Layout Strategy**: Switched to "Width-First" approach. The app prioritizes filling the browser width (100%) and calculates height automatically based on 16:9 aspect ratio.
- **Scrolling**: Restored vertical scrolling. If the app becomes taller than the screen, users can scroll down.
- **UX**: Added a "Refresh" tip to the README to handle canvas resizing artifacts.

## Phase 22: Responsive Letterbox Layout
- **Layout Strategy**: Implemented "Scale to Fit" (Letterbox).
- **Behavior**: The app automatically scales down to fit entirely within the viewport without scrolling, maintaining 16:9 aspect ratio.
- **Typography**: Switched to `vmin` units for font sizes to ensure text scales with the container.

## Phase 21: Fixed Resolution Layout
- **Layout Strategy**: Enforced a strict 1920x1080 (Full HD) resolution.
- **Behavior**: The app behaves like a static canvas. Smaller screens show scrollbars; larger screens center the content.

## Phase 20: Strict Dimension Enforcement
- **Layout Strategy**: Used CSS `calc()` to rigidly link width to height (`Height * 16/9`) to prevent aspect ratio distortion on narrow screens.

## Phase 19: Layout Robustness Fix
- **Bug Fix**: Changed body display from `flex` to `block` and used `margin: 0 auto` to prevent content clipping when the window is smaller than the app content.

## Phase 18: Documentation & Sharing
- **Documentation**: Created `README.md` with instructions for running locally (Live Server / Python) and sharing via Netlify Drop.

## Phase 17: Layout Balance & Interaction
- **Layout**: Split the Left Panel 50/50 between Spatial View and Controls.
- **UI**: Moved "Refresh Clusters" button to the Spike Sorting panel.
- **Interaction**: Added Mouse Wheel Panning to the Spatial View.

## Phase 16: Simulation & Viewport Adjustments
- **Simulation**: Positioned Interneurons at -1200 ± 10 μm.
- **Viewport**: Updated Spatial View range to 0 (Surface) to -2500 μm (Deep).
- **Controls**: Adjusted Depth Slider range to -800 μm (Left) to -2000 μm (Right).

## Phase 15: Visual & UI Refinements
- **Visuals**: Enhanced Interneuron visibility (Bright Cyan + White Border).
- **Controls**: Updated default Noise Level to 50 μV (Range 0-100).
- **Typography**: Implemented dynamic font sizing (min 24px).

## Phase 14: Height-Driven Responsive Layout
- **Layout**: Prioritized height (95vh) with a minimum of 900px to ensure visibility on laptops.

## Phase 13: Scrollable Responsive Layout
- **Layout**: Enabled vertical scrolling (`overflow-y: auto`) and used `aspect-ratio: 16/9` to prevent content cut-off on smaller screens.

## Phase 12: Responsive Aspect Ratio Fix
- **Layout**: Removed fixed pixel caps and implemented responsive scaling using `min(vw, vh)`.

## Phase 11: Horizontal Layout Transformation
- **Layout**: Transformed to a Horizontal Split (Left: Spatial/Controls, Right: Analysis) to better utilize widescreen monitors.

## Phase 10: FullHD Layout Optimization
- **Layout**: Optimized specifically for 1920x1080 resolution using CSS Grid.

## Phase 9: Layout & Interneurons
- **Features**: Added Fast-Firing Interneurons (20Hz).
- **Layout**: Adjusted UI to a widescreen format (Top 1/3 Spatial, Bottom 2/3 Analysis).

## Phase 8: UI & Analysis Refinement
- **Analysis**: Added Range Controls for Waveforms and Spike Sorting.
- **UI**: Implemented "Refresh Clusters" hotkey ('C').

## Phase 7: Revert & Refine
- **Interaction**: Reverted complex mouse interactions in favor of precise sliders.
- **Simulation**: Updated ML Range and Neuron Packing density.

## Phase 6: Physics Refinement (UnitMatch)
- **Physics**: Incorporated data from UnitMatch (Nature Methods 2024) for realistic signal decay parameters.

## Phase 5: Physics & Interaction Upgrade
- **Physics**: Implemented Exponential Decay.
- **Interaction**: Added Mouse Drag and Zoom (later reverted for simplicity).

## Phase 4: Final Polish & Coordinates
- **Coordinate System**: Standardized Depth (DV) coordinates.
- **UI**: Fixed overflow issues.

## Phase 3: Analysis & Refinement
- **Analysis**: Implemented Spike Detection and Scatter Plots.
- **Controls**: Added Play/Pause and Firing Rate controls.

## Phase 1 & 2: Core Implementation
- **Foundation**: Created project structure, Neuron Model, Extracellular Potential Physics, and Basic Visualization.

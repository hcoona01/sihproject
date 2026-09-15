# ARES-01 // Rover Telemetry Ground Station

A mission-critical, Grafana-inspired robotics telemetry dashboard engineered for live rover monitoring and remote control. Built with React 19, TypeScript, Vite, Tailwind CSS, and native Server-Sent Events (SSE).

---

## Live System Architecture

```
                                          ┌──► /temp  (SSE: JSON {data, rover_id})
                                          ├──► /dist  (SSE: JSON {data, rover_id})
[Render Backend: sihproject-qt1s] ───────┼──► /humd  (SSE: JSON {data, rover_id})
                                          ├──► /video (Standby Optics Viewport / Live Stream)
                                          └──► /led   (Tactical LED illumination GET)
                                                        ▲
                                                        │
                                          ┌─────────────┴─────────────────┐
                                          │ ARES-01 Command Terminal (UI) │
                                          └───────────────────────────────┘
```

### Telemetry Pipeline
* **Continuous Non-Polling Ingestion**: Dedicated `EventSource` managers for `/temp`, `/dist`, and `/humd`.
* **Zero-Allocation History Windowing**: Rolling ring buffers with a default memory cap of 40 points to avoid unbounded heap growth.
* **Automatic Reconnect**: Exponential backoff with jitter and status health diagnostics.
* **Robotics Optics Viewport**: Telemetry HUD displaying target reticle, forward distance overlay, live/standby states, and full-screen expansion.
* **LED Control Bus**: Dispatches tactical lighting state changes (`GET /led?state=1&status=on&rover_id=...`) with latency instrumentation and feedback audit.

---

## Tech Stack
* **Runtime & Package Manager**: `bun` (v1.4+)
* **Framework**: React 19 + TypeScript
* **Styling**: Tailwind CSS v4 + Custom Cyberpunk/Robotics scanlines & HUD primitives
* **Icons**: `lucide-react`
* **Build System**: Vite 6

---

## Getting Started

### 1. Install Dependencies
```bash
cd frontend
bun install
```

### 2. Launch Development Server
```bash
bun run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Production Build & Verification
```bash
bun run build
bun run preview
```

---

## Configuration & Overrides
The dashboard defaults to `https://sihproject-qt1s.onrender.com`. The operator can adjust the target endpoint, rolling buffer capacity, or safety thresholds directly through the **Station Settings** modal in the top header.

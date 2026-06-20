# 🧩 Ludwing Puzzle SVG Generator

> A free, browser-based tool to generate fully customizable puzzle grid SVG files — ready for laser cutting and 3D printing.




***

## 🔍 What Is This?

The **Ludwing Puzzle SVG Generator** is a zero-dependency, fully client-side web tool that lets you design and export puzzle grid patterns as SVG files. It was built with makers, laser cutter enthusiasts, and 3D printing hobbyists in mind.

No server. No account. No installation. Just open the page, configure your puzzle, and download the file.

***

## ✨ Features

- 🎛️ **Full parametric control** — width, height, corner radius, margin, columns, rows
- 🔀 **Randomized tab shapes** — seed-based generation ensures unique and repeatable patterns
- 📐 **Real-time live preview** — every parameter change updates the SVG preview instantly
- 📏 **Accurate mm dimensions** — all coordinates are expressed in real-world millimeters via SVG `viewBox`
- 🖊️ **Adjustable stroke width** — synced between preview and exported file
- ⬛ **Solid border mode** — fills the outer margin with solid black for 3D slicer compatibility
- 💾 **One-click SVG export** — downloads a clean, print-ready SVG file
- 🌍 **Bilingual UI** — full Italian / English interface toggle
- 🎨 **Dark theme design** — clean, minimal, purple-accented UI

***

## 🚀 How to Use

1. **Open the tool** at [lucchior.github.io/Puzzle_Generator](https://lucchior.github.io/Puzzle_Generator/)
2. **Set your puzzle dimensions** — enter width and height in millimeters
3. **Configure the grid** — choose number of columns and rows
4. **Adjust the tabs** — use the seed slider for different random shapes, control tab size and jitter
5. **Set the outer border** — add a margin and optionally enable solid border for 3D printing
6. **Fine-tune stroke width** — set line thickness in mm (0.1 mm is optimal for laser cutting)
7. **Preview live** — the SVG updates in real time as you change parameters
8. **Download** — click **Scarica SVG / Download SVG** to export your file

***

## ⚙️ Parameters Explained

| Parameter | Description | Recommended Range |
|-----------|-------------|-------------------|
| **Width / Height** | Overall puzzle dimensions in mm | Any size up to 2000 mm |
| **Corner Radius** | Rounded corners on the outer puzzle border | 0–10 mm |
| **Margin** | Uniform spacing around the puzzle grid | 3–15 mm |
| **Solid Border** | Fills the margin area solid black (for 3D slicer) | Toggle on/off |
| **Columns / Rows** | Number of puzzle pieces along each axis | 2–100 |
| **Seed** | Controls the random shape of all tabs | 0–9999 |
| **Tab Size** | Percentage of cell size occupied by the tab knob | 15–25% |
| **Jitter** | How irregular/organic the tab shapes look | 0 (symmetric) – 13 (organic) |
| **Stroke Width** | Line thickness in the exported SVG | 0.05–0.5 mm |

***

## 📂 Output File

The exported file is a standard **SVG** with:

- `width` and `height` expressed in **mm** for direct use in laser cutting software (LightBurn, RDWorks, etc.)
- All paths drawn with `stroke="black"` and `fill="none"` — compatible with any vector cutter
- A single file containing horizontal lines, vertical lines, outer border, and optional margin — each as a separate `<path>` element
- Clean, minimal XML with no embedded fonts, scripts, or external dependencies

### Example SVG structure

```xml
<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="310mm" height="210mm" viewBox="0 0 310 210">
  <path fill="none" stroke="black" stroke-width="0.1" d="..."/> <!-- margin outline -->
  <path fill="none" stroke="black" stroke-width="0.1" d="..."/> <!-- horizontal tabs -->
  <path fill="none" stroke="black" stroke-width="0.1" d="..."/> <!-- vertical tabs -->
  <path fill="none" stroke="black" stroke-width="0.1" d="..."/> <!-- outer border -->
</svg>
```

***

## 🖨️ Use Cases

- **Laser cutting** — engrave or cut puzzle pieces from wood, acrylic, cardboard, or leather
- **3D printing** — use the solid border mode to generate printable puzzle frames
- **Educational tools** — create custom puzzle templates for schools or workshops
- **Gift making** — design personalized photo puzzles by overlaying the SVG on an image

***

## 🛠️ Technical Details

The tool is built entirely with **vanilla HTML, CSS, and JavaScript** — no frameworks, no build tools, no external libraries. It runs 100% in the browser.

### Tab shape algorithm

Each tab is generated using a **cubic Bézier curve** system with seeded pseudo-random values (based on `Math.sin`). The same seed always produces the same puzzle layout, making designs reproducible.

The core generation functions:

- `gen_dh()` — generates all horizontal cut paths
- `gen_dv()` — generates all vertical cut paths
- `gen_db()` — generates the outer puzzle border with optional rounded corners
- `gen_margin_outline()` / `gen_margin_solid()` — generates the outer margin frame

All coordinates are computed in **real mm units** matching the SVG `viewBox`, so the preview and the exported file are always pixel-perfect identical.

***

## 🗂️ Project Structure

```
Puzzle_Generator/
└── index.html       # Complete self-contained application (HTML + CSS + JS)
```

No build step required. No dependencies. Just one file.

***

## 🌐 Deployment

The project is deployed via **GitHub Pages** directly from the `main` branch. Any push to `main` automatically updates the live site.

To run locally, simply open `index.html` in any modern browser — no server needed.

***

## 🤝 Support the Project

If this tool saved you time or you just want to say thanks, consider buying me a coffee via PayPal:

👉 [paypal.me/Lucchior](https://paypal.me/Lucchior)

***

## 👤 Author

**Ludwing** — Maker, Anycubic Insider, 3D printing & laser cutting enthusiast.

- 🔧 [Makeronline Profile](https://www.makeronline.com/en/user/personalInfo/c302cd8c-3538-4ba1-b329-09ef4cabfb5d.html?trackUserType=1)
- ⚡ [Anycubic Deals & Offers](https://lucchior.github.io/Anycubic_offerte/)

***

## 📄 License

This project is open source and free to use. Attribution appreciated but not required.

***

*Built with ❤️ for the maker community.*

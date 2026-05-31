# <img src="https://github.com/user-attachments/assets/9c3edf75-58f3-466f-9cde-e41ac5c2d8b6" width="25" align="bottom" alt="Logo" margin-right="20">  Jetflow

Jetflow is a browser-based styling engine that combines readable CSS-like syntax with utility-driven speed. It allows you to build modern interfaces without writing traditional CSS files while keeping the syntax intuitive. Drop in one script tag, write atomic classes in HTML, and ship. No build step, no configuration required.

<img width="1280" height="640" alt="gh" src="https://github.com/user-attachments/assets/666496df-0609-4186-a64f-3f87f3a7e045" />

## Overview

With the release of **v1.0.1**, Jetflow introduces a next-generation engine that runs entirely in the browser. It watches your DOM via `MutationObserver` and generates only the CSS you actually use in real time. It bridges the gap between traditional CSS and utility-first systems, bringing modern styling workflows straight to vanilla HTML.

## Features

- **Zero Build Step:** Runs natively in the browser via a single CDN script.
- **Performance Optimized:** Deduplicated CSS injection, AST caching, and batched rendering.
- **Chained Variants:** Stack media queries, dark mode, and pseudo-class modifiers endlessly.
- **Arbitrary Values:** Bracket syntax for strict-validated one-off values.
- **Runtime Theming:** Dynamically update colors and UI variables on the fly without page reloads.
- **Scoped Mode:** Isolate generated CSS to a specific container boundary.
- **Dev Inspector:** Debug computed Jetflow AST and generated CSS directly in the console.

## Installation

Include the compiled file in your document `<head>`:
```html
<script src="https://cdn.jsdelivr.net/gh/studioframes/Jetflow@v1.0.1/jetflow.js"></script>
```

## Basic Usage & Chained Variants

Use classes directly in your markup. Jetflow supports endless variant stacking:
```html
<div class="p-4 bg-brand-mid text-white md:dark:hover:bg-brand-dark">
  Hello World
</div>
```

## CSS-like Arbitrary Values

Jetflow supports strict-validated direct value input using bracket syntax for one-off tweaks:
```html
<div class="mt-[42px] p-[13px] bg-[#1a1a1a] w-[calc(100%-2rem)] rounded-[12px]">
  Custom styling
</div>
```

## Semantic Presets (Apply)

Group utility chains into clean, reusable semantic component classes via configuration:

```javascript
// jetflow.config.js
export default {
  apply: {
    ".btn-primary": "flex items-center gap-2 rounded-md bg-brand-mid px-4 py-2 text-white hover:bg-brand-dark"
  }
};
```

Use them in markup:
```html
<button class="btn-primary">
  Submit
</button>
```

## Runtime Theming

Change your application's design tokens on the fly. `Jetflow.setTheme()` injects and overrides CSS custom properties dynamically without needing a page refresh:

```javascript
JetFlow.setTheme({
  colors: {
    brand: {
      mid: "#ff6b00",
      dark: "#cc5500"
    }
  }
});
```

## Scoped Mode

Need to isolate utility classes to a specific container (e.g., a widget or an admin panel)? Use the scoped directive:

```html
<div class="jf-scope-[admin-panel]">
  <!-- Styles generated in here will be strictly prefixed with .jf-scope-admin-panel -->
  <div class="bg-red-500 text-white p-4">Widget</div>
</div>
```

## Dev Inspector

Debug your UI directly in the browser console. Inspect any element to see how Jetflow parsed its utility classes and view the exact generated CSS:

```javascript
// Run in your browser console:
JetFlow.inspect(document.querySelector('.btn-primary'));
```

## Configuration

Jetflow uses a configuration file (or global object) to define custom themes, aliases, and presets.

Example structure:

```javascript
export default {
  darkMode: "media", // "media" | "class" | "both"
  theme: {
    colors: {
      brand: {
        light: "#ffd9d9",
        mid: "#c91414",
        dark: "#830d0d"
      }
    }
  },
  utilities: {
    "flex-center": "flex items-center justify-center"
  }
};
```

## Goals

- Eliminate the need for build tools like PostCSS or Webpack for modern CSS.
- Improve readability over traditional utility systems.
- Maintain full flexibility for advanced usage.
- Provide a blazing-fast, scalable styling workflow directly in the browser.

## Status

Active development. Features and APIs may evolve.

> [!CAUTION]
> #### Do not visit or download anything from any unofficial URLs claiming to be jetflow. We do not offer anything for download outside of [this Github repository](https://github.com/JetflowJS/Jetflow) at present.
> Our official URLs include:
> - https://jetflow.js.org
> - https://jetflowjs.pages.dev

## Disclaimer
> [!CAUTION]
> Jetflow is a free and open-source project and is not related to any other Jetflow/JetFlow related projects.

> [!IMPORTANT]
> This project is developed and maintained solely by the repository owner. While it may look professionally structured, it is **not a company** and operates with **zero revenue**. It is a **100%** non-profit.

---
> ### Jetflow is for the Community
> **Jetflow is, and always will be, open-source and free for everyone.**

> [!NOTE]
> For more info visit our [Documentation site](https://jetflow.js.org/docs).

# <img src="https://github.com/user-attachments/assets/9c3edf75-58f3-466f-9cde-e41ac5c2d8b6" width="25" align="bottom" alt="Logo" margin-right="20">  Jetflow


Jetflow is a browser-based styling engine that combines readable CSS-like syntax with utility-driven speed. It allows you to build modern interfaces without writing traditional CSS files while keeping the syntax intuitive.

<img width="1280" height="640" alt="gh" src="https://github.com/user-attachments/assets/666496df-0609-4186-a64f-3f87f3a7e045" />

## Overview

Jetflow is designed to bridge the gap between traditional CSS and utility-first systems. It provides a unified approach where you can use semantic classes, atomic utilities, and CSS-like values together in a single workflow.

## Features

- Semantic presets for reusable UI patterns
- CSS-like arbitrary values using bracket syntax
- Utility-based styling for rapid development
- Clean and human-readable naming system
- Responsive and state modifiers support
- Runtime compilation with no build step required for usage
- Single-file distribution for CDN usage

## Installation

Include the compiled file in your project:
```html
<script src="https://cdn.jsdelivr.net/gh/JetflowJS/Jetflow@v0.1.0/jetflow.min.js"></script>
```

## Basic Usage

Use classes directly in your markup:
```html
<div class="p-4 bg-brand-mid text-white">
  Hello World
</div>
```

## CSS-like Values

JetFlow supports direct value input using bracket syntax:
```html
<div class="p-[8px_16px] bg-[#1479c9] rounded-[12px]">
  Custom styling
</div>
```

## Semantic Presets

Define reusable styles in your configuration:
```css
.btn {
  padding: 8px 16px;
  border-radius: 6px;
}

.btn-primary {
  background: blue;
  color: white;
}
```

Use them in markup:

```html
<button class="btn-primary">
  Button
</button>
```

## Grouped Syntax

Reduce class clutter using grouping:
```html
<div class="(p-4 bg-white rounded-lg shadow)">
</div>
```

Supports modifiers:
```html
<div class="hover:(bg-blue-mid text-white)">
</div>
```

## Configuration

JetFlow uses a configuration file to define theme values, utilities, and presets.

Example structure:

``` javascript
export default {
  theme: {
    colors: {
      brand: {
        light: "#d9efff",
        mid: "#1479c9",
        dark: "#0d4f83"
      }
    }
  },
  apply: {
    ".btn": "px-4 py-2 rounded-md",
    ".btn-primary": "bg-brand-mid text-white"
  }
};
```

## Goals

- Reduce CSS complexity
- Improve readability over traditional utility systems
- Maintain full flexibility for advanced usage
- Provide a fast and scalable styling workflow

## Status

Active development. Features and APIs may evolve.

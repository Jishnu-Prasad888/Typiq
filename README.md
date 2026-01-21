# Typiq Font Explorer

## Problem Statement

As a occasional designer working with **GIMP** and **Inkscape**, I faced significant challenges in managing and exploring the fonts installed on my system. Both applications have limited font browsing capabilities, making it difficult to:

1. **Discover fonts efficiently** - Scrolling through long alphabetical lists in design software is time-consuming
2. **Preview fonts properly** - GIMP and Inkscape show limited previews without contextual text
3. **Organize fonts** - No way to categorize, tag, or bookmark favorite fonts
4. **Compare fonts side-by-side** - Essential for selecting font pairs for design projects
5. **Access font CSS quickly** - When moving from design to web development, I needed quick access to CSS font-family declarations

Typiq was born out of this need for a **local, efficient font management tool** that bridges the gap between system fonts and design workflow.

## What is Typiq?

Typiq is a **desktop font exploration and management application** that gives you complete control over your system fonts. It's designed for designers, developers, and typography enthusiasts who want to:

- **Browse** all installed fonts with beautiful previews
- **Compare** fonts side-by-side for pairing decisions
- **Bookmark** and organize fonts with custom categories and tags
- **Export** font information for web development workflows
- **Manage** font collections without leaving your local environment

## Images

![[./images/Screenshot_1.png]]
![[./images/Screenshot_2.png]]
![[./images/Screenshot_3.png]]
![[./images/Screenshot_4.png]]
![[./images/Screenshot_5.png]]
![[./images/Screenshot_6.png]]

## Key Features

### Font Explorer

- **Complete System Font Inventory** - Automatically detects and loads all installed fonts
- **Smart Filtering** - Filter by category (sans-serif, serif, monospace, display, handwriting)
- **Bookmarks System** - Star and categorize your favorite fonts
- **Custom Preview Text** - Test fonts with your own content
- **Live Adjustments** - Modify font size, weight, and style in real-time

### Font Comparator

- **Multi-Font Comparison** - Compare 2-4 fonts simultaneously in different slots
- **Visual Pairing Suggestions** - Get intelligent font pair recommendations
- **Save Font Combinations** - Store successful pairings for future projects
- **Adjustable Settings** - Customize weight, size, italic, underline per font

### ⚙️ Settings & Data Management

- **Customizable Preview Settings** - Set default preview text and font size
- **Data Export** - Export bookmarks as JSON, CSV, or CSS
- **Theme Toggle** - Light/Dark mode support
- **Cache Management** - Optimized font loading with 5-minute cache

## 🛠️ Technical Architecture

Typiq is built with modern web technologies packaged as a desktop application:

- **Frontend**: React + TypeScript + Tailwind CSS
- **Desktop Framework**: Electron with Vite
- **State Management**: React Context + Local Storage
- **Virtualization**: TanStack Virtual for performant font lists
- **Styling**: Custom design system with CSS variables

## 🚀 Installation & Building

### Prerequisites

1. **Node.js** (v18 or higher)
2. **npm** or **yarn**
3. **Git** (for cloning repository)

### Development Setup

```bash
# Clone the repository
git clone <repository-url>
cd typiq-font-explorer

# Install dependencies
npm install

# Start development server
npm run dev
```

### Production Builds

The project includes specific build scripts for each platform:

#### Windows Build

```bash
npm run build:win
```

- Creates `.exe` installer
- Windows 10/11 compatible
- Includes all system dependencies

#### macOS Build

```bash
npm run build:mac
```

- Creates `.dmg` package
- Universal binary (Intel + Apple Silicon)
- Signed and notarized (requires developer certificate)

#### Linux Build

```bash
npm run build:linux
```

- Creates `.AppImage`, `.deb`, and `.rpm` packages
- Compatible with Ubuntu, Fedora, and most distributions
- AppImage is portable across distributions

### Build Configuration

The build process is configured in `package.json` with the following electron-builder settings:

```json
{
  "build": {
    "appId": "com.typiq.fontexplorer",
    "productName": "Typiq Font Explorer",
    "directories": {
      "output": "dist"
    },
    "files": ["dist-electron", "dist"],
    "mac": {
      "category": "public.app-category.graphics-design",
      "target": ["dmg", "zip"]
    },
    "win": {
      "target": ["nsis", "portable"]
    },
    "linux": {
      "target": ["AppImage", "deb", "rpm"],
      "category": "Graphics"
    }
  }
}
```

### Adding New Features

1. **New Font Filter**: Add to categories array in `FontExplorer.tsx`
2. **New Setting**: Extend `AppSettings` interface in `Settings.tsx`
3. **New Export Format**: Add to exportData function in `Settings.tsx`
4. **New UI Component**: Create in `components/` with TypeScript interfaces

### Font Loading Mechanism

Typiq uses a multi-layer font loading strategy:

1. **System Font Detection**: Uses Electron's `font-list` module
2. **Font Cache**: 5-minute cache to improve performance
3. **Lazy Injection**: Fonts are injected into DOM only when previewed
4. **Error Handling**: Graceful degradation if fonts can't be loaded

### Styling System

The application uses a custom design system with CSS variables:

```css
:root {
  --tw-bg-primary: #ffffff;
  --tw-bg-secondary: #f8f9fa;
  --tw-text-primary: #2a231c;
  --tw-accent-orange: #ff6b35;
  /* ... more variables */
}
```

## Design Philosophy

Typiq follows these design principles:

1. **Performance First**: Virtual lists for large font collections
2. **Accessibility**: Keyboard navigation and screen reader support
3. **Consistency**: Unified design language across all components
4. **Practicality**: Features solve real design workflow problems

## Performance Optimizations

- **Virtual Scrolling**: Handles thousands of fonts smoothly
- **Font Caching**: 5-minute cache reduces system calls
- **Lazy Loading**: Fonts load only when needed
- **Debounced Search**: Prevents UI jank during typing
- **Memoized Components**: Reduces unnecessary re-renders

### Code Standards

- TypeScript for all new code
- Tailwind CSS for styling
- Functional components with hooks

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Gitify is an Electron desktop application that displays GitHub notifications in the system tray. Built with React, TypeScript, and using pnpm for package management.

## Development Commands

### Setup and Installation
```bash
pnpm install  # Takes 2-3 minutes, requires timeout of 5+ minutes
```

### Building
```bash
pnpm build         # Full production build (30-35 seconds)
pnpm watch         # Development mode with hot reload (15 seconds initial)
pnpm start         # Run the Electron app (fails in headless environments)
```

### Code Quality and Testing
```bash
pnpm lint:check    # Check linting/formatting with Biome (<1 second)
pnpm lint          # Auto-fix linting/formatting issues
pnpm test          # Run Jest tests (60-70 seconds, timeout 30+ minutes)
pnpm test -u       # Update Jest snapshots after UI changes
pnpm tsc --noEmit  # TypeScript compilation check (5 seconds)
```

### Packaging
```bash
pnpm package:macos --publish=never   # macOS build
pnpm package:win --publish=never     # Windows build  
pnpm package:linux --publish=never   # Linux build
```

## Architecture

### Process Structure
- **Main process** (`src/main/`): Electron backend, system tray integration
- **Renderer process** (`src/renderer/`): React frontend UI
- **Preload scripts**: Secure IPC communication bridge
- **Shared code** (`src/shared/`): Common utilities and types

### Key Technologies
- **Electron 38+**: Desktop framework with menubar integration
- **React 19+**: UI with @primer/react components
- **TypeScript 5+**: Strict typing throughout
- **Webpack 5**: Multi-target bundling (main/preload/renderer)  
- **Biome**: Unified linting and formatting
- **Tailwind CSS**: Utility-first styling
- **Jest + jsdom**: Testing framework

### Core Functionality
- **GitHub API integration** (`src/renderer/utils/api/`): Notification fetching
- **OAuth authentication** (`src/renderer/utils/auth/`): GitHub login flow
- **Notification management** (`src/renderer/hooks/useNotifications.ts`): Core logic
- **Settings management** (`src/renderer/routes/Settings.tsx`): User preferences
- **System tray** (`src/main/`): Cross-platform menubar integration

## File Organization

### Source Structure
```
src/
├── main/           # Electron main process
├── renderer/       # React UI application  
│   ├── components/ # Reusable UI components
│   ├── hooks/      # Custom React hooks
│   ├── routes/     # Page-level components
│   └── utils/      # Utilities and API clients
└── shared/         # Cross-process shared code
```

### Configuration
- `biome.json`: Linting rules with custom import grouping
- `jest.config.ts`: Test configuration with jsdom environment
- `config/`: Webpack configurations for each target
- `tailwind.config.ts`: CSS framework configuration

## Development Workflow

### Pre-commit Validation
Always run these before committing:
```bash
pnpm lint:check && pnpm tsc --noEmit && pnpm test
```

### Build Validation
After changes, verify:
1. Clean build succeeds: `rm -rf build && pnpm build`
2. Check output files exist in `build/` directory
3. File sizes are reasonable (main.js ~300KB, renderer.js ~2MB)

### Development Mode
1. Start watch mode: `pnpm watch` (leave running)
2. Launch app: `pnpm start`
3. Make changes, use `CmdOrCtrl+R` to reload

## Important Constraints

### Timing Expectations
- Dependency install: 2-3 minutes (normal for Electron)
- Full build: 30-35 seconds
- Test suite: 60-70 seconds
- TypeScript check: 5 seconds

### Expected Behavior
- **Electron in containers**: Will fail (expected in headless environments)
- **Build warnings**: Some PostCSS/Tailwind warnings are normal
- **Test snapshots**: May have some existing failures, focus on new changes
- **Linting warnings**: Existing codebase has warnings, only fix your changes

### Code Style
- Uses Biome with custom import grouping (Node → React/Testing → Electron → Primer → Packages → Shared → Relative)
- Single quotes for JavaScript, double quotes for JSX
- 2-space indentation
- No console usage in production code (`noConsole: "error"`)

## Project Philosophy

Gitify focuses on GitHub notification monitoring, not being a full GitHub client. Keep changes:
- Simple and focused on core notification functionality
- Consistent with existing @primer/react UI patterns
- Cross-platform compatible (macOS, Windows, Linux)
- Minimal complexity for edge cases

## Node.js Requirements

- Requires Node.js >=22 (check package.json engines)
- Works with Node 20+ but shows warnings
- Uses pnpm 10+ as package manager
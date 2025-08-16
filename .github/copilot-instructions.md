# Gitify Development Instructions

Gitify is a Node.js/Electron desktop application that displays GitHub notifications in the system tray. It's built with React, TypeScript, and uses pnpm for package management.

**ALWAYS follow these instructions first and only fallback to additional search and context gathering if the information in the instructions is incomplete or found to be in error.**

## Working Effectively

### Prerequisites and Setup
- **Install pnpm globally first**: `npm install -g pnpm`
- **Node.js requirement**: This project requires Node.js >=22 (check .nvmrc), though it works with Node 20+ with warnings
- **Bootstrap the repository**:
  - `pnpm install` -- takes 2.5 minutes. NEVER CANCEL. Set timeout to 5+ minutes.

### Development Workflow
- **Build the application**:
  - `pnpm build` -- takes 32 seconds. NEVER CANCEL. Set timeout to 60+ minutes.
  - Builds both main (Electron process) and renderer (React UI) bundles
  - Output goes to `build/` directory
- **Development mode with hot reload**:
  - `pnpm watch` -- starts webpack in watch mode for both main and renderer
  - Takes ~15 seconds for initial compilation
  - Leave running while developing
- **Run the Electron app**:
  - `pnpm start` -- launches the desktop application
  - NOTE: Will fail in headless/container environments due to Electron sandbox restrictions (expected)
  - Use `CmdOrCtrl+R` to reload when watch mode detects changes

### Linting and Code Quality
- **Check linting and formatting**:
  - `pnpm lint:check` -- takes <1 second using Biome
  - **ALWAYS run before committing** or CI will fail
- **Auto-fix issues**:
  - `pnpm lint` -- automatically fixes linting and formatting issues

### Testing
- **Run TypeScript compilation check**:
  - `pnpm tsc --noEmit` -- takes 5 seconds. NEVER CANCEL. Set timeout to 10+ minutes.
- **Run unit tests**:
  - `pnpm test` -- takes 67 seconds. NEVER CANCEL. Set timeout to 30+ minutes.
  - Uses Jest with jsdom environment
  - NOTE: Some existing snapshot tests may fail but still return success - this is normal
  - Update snapshots after legitimate UI changes with `pnpm test -u`
- **Run tests with coverage** (CI format):
  - `pnpm test --coverage --runInBand --verbose`

## Validation Scenarios

**CRITICAL**: After making changes, ALWAYS validate your work by running these scenarios:

### Build Validation
1. **Clean build test**: `rm -rf build && pnpm build`
2. **Verify build outputs**: Check that `build/main.js`, `build/renderer.js`, and `build/styles.css` are created
3. **File sizes should be reasonable**: main.js ~300KB, renderer.js ~2MB, styles.css ~1MB
4. **Success indicators**: Look for "webpack compiled successfully" messages for both main and renderer

### Code Quality Validation
1. **Linting passes**: `pnpm lint:check` should show warnings but complete successfully (exit code 0)
2. **TypeScript compiles**: `pnpm tsc --noEmit` should complete without errors
3. **Tests pass**: Run `pnpm test` and ensure no new test failures (some existing ones may fail - focus on your changes)

### Development Environment Testing
1. **Watch mode works**: Start `pnpm watch`, make a small change to a file in `src/`, verify webpack recompiles (look for compilation success messages)
2. **Development build**: The watch mode creates development builds with source maps in `build/` directory

## Expected Command Outputs

### Successful Build
```
webpack 5.101.2 compiled successfully in [time]
```

### Successful Tests (with some expected failures)
```
Test Suites: X failed, Y passed, Z total
Tests:       A failed, B passed, C total
```
Note: Focus on ensuring no NEW test failures from your changes.

### Successful Linting
```
Checked X files in Yms. No fixes applied.
Found Z warnings.
```
Warnings are acceptable - the important part is that it completes successfully.

## Common Tasks and File Locations

### Key Files and Directories
- **Main Electron process**: `src/main/` - Node.js backend code
- **Renderer process**: `src/renderer/` - React frontend code  
- **Shared code**: `src/shared/` - Common utilities and types
- **Build configuration**: `config/` - Webpack configs and electron-builder settings
- **Assets**: `assets/` - Icons, sounds, and static resources

### Configuration Files
- **package.json**: Main project configuration and scripts
- **biome.json**: Linting and formatting rules
- **jest.config.ts**: Test configuration
- **tsconfig.json**: TypeScript configuration
- **tailwind.config.ts**: CSS framework configuration

### Frequently Modified Areas
- **Notification logic**: `src/renderer/hooks/useNotifications.ts`
- **GitHub API client**: `src/renderer/utils/api/`
- **UI components**: `src/renderer/components/`
- **Authentication**: `src/renderer/utils/auth/`
- **Settings**: `src/renderer/routes/Settings.tsx`

## Build and Release Process

### Local Packaging (for testing)
- **macOS**: `pnpm package:macos --publish=never`
- **Windows**: `pnpm package:win --publish=never`  
- **Linux**: `pnpm package:linux --publish=never`
- **NOTE**: These require the full build first and additional platform-specific dependencies

### Pre-commit Checks
- **Automatic via Husky**: Git hooks run `pnpx lint-staged` on commit
- **Manual validation**: Run `pnpm lint:check && pnpm tsc --noEmit && pnpm test`

## Important Constraints and Limitations

### Timing Expectations
- **Dependency installation**: 2-3 minutes (normal for Electron projects)
- **Full build (clean)**: 30-35 seconds
- **Watch mode initial compilation**: 10-15 seconds
- **Watch mode recompilation**: 5-8 seconds for incremental changes
- **Test suite**: 60-70 seconds
- **TypeScript compilation**: 5 seconds
- **Linting**: <1 second

### Environment Issues
- **Electron in containers**: Will fail to start due to sandbox restrictions (expected behavior in headless environments)
- **Node version warnings**: Project requires Node >=22, works with 20+ but shows warnings in `pnpm` commands
- **Build warnings**: Some PostCSS/Tailwind warnings in renderer build are normal and expected
- **Linting warnings**: Existing codebase has some linting warnings - focus only on your changes

### Common Troubleshooting
- **Build failures**: Check Node version, ensure `pnpm install` completed successfully
- **Test snapshot failures**: Run `pnpm test -u` to update snapshots after legitimate UI changes
- **Linting errors**: Run `pnpm lint` to auto-fix most issues
- **Watch mode not updating**: Restart watch mode, check file permissions

## Development Philosophy

This project focuses on GitHub notification monitoring, not being a full GitHub client. Keep changes:
- **Simple and focused** on core notification functionality
- **Consistent** with existing UI patterns and design language
- **Minimal** - avoid adding complexity for edge cases
- **Cross-platform** compatible (macOS, Windows, Linux)

## Technology Stack Reference

**Core Technologies:**
- **Electron 37+**: Desktop app framework
- **React 19+**: UI library  
- **TypeScript 5+**: Language
- **pnpm 10+**: Package manager
- **Biome**: Linting and formatting
- **Jest**: Testing framework
- **Webpack 5**: Build system
- **Tailwind CSS**: Styling framework

**Key Dependencies:**
- **menubar**: System tray integration
- **electron-updater**: Auto-update functionality
- **@primer/react**: GitHub's React component library
- **date-fns**: Date utilities
- **axios**: HTTP client for GitHub API

ALWAYS reference this information first before exploring the codebase or running commands to save time and avoid common pitfalls.
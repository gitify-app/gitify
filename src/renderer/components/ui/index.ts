/**
 * App-owned UI layer.
 *
 * The renderer imports these instead of `@primer/react` directly, so a design
 * language can later swap an implementation behind this seam without touching
 * call sites (the D4 decision in the plan). Phase 1 (Classic) re-exports Primer
 * unchanged, so rendering is byte-identical; the value of the layer today is the
 * single, lint-enforced import boundary and the per-component swap point it
 * creates. When a language needs a component to diverge structurally, replace
 * that component's line here with a dedicated implementation module.
 *
 * `ThemeProvider` / `BaseStyles` / `useTheme` / `useConfirm` are re-exported too
 * so ALL Primer value imports live under this directory: the provider stays as
 * the token/attribute engine, and `useConfirm`'s dialog depends on it.
 *
 * Note: Primer *types* are intentionally still imported directly via
 * `import type` at the two sites that need them (`derive from public props`
 * convention) — the boundary isolates Primer components, not Primer types.
 */
export {
  ActionList,
  ActionMenu,
  AnchoredOverlay,
  Avatar,
  Banner,
  BaseStyles,
  Button,
  ButtonGroup,
  FormControl,
  Heading,
  IconButton,
  IssueLabelToken,
  Label,
  LabelGroup,
  Popover,
  RelativeTime,
  Select,
  Stack,
  Text,
  TextInput,
  TextInputWithTokens,
  ThemeProvider,
  Tooltip,
  Truncate,
  useConfirm,
  useTheme,
} from '@primer/react';

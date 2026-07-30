/**
 * App-owned UI layer. The renderer imports Primer components through here rather
 * than `@primer/react` directly, so a design language can swap an implementation
 * behind this seam. Phase 1 re-exports Primer unchanged; replace a line with a
 * dedicated module when a component needs to diverge.
 *
 * Value imports are boundary-enforced (see index.test.ts); `import type` from
 * `@primer/react` is still allowed at call sites.
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

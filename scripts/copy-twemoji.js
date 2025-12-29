#!/usr/bin/env node

/**
 * Copies required twemoji SVG files from node_modules to src-tauri/assets.
 * Run this as part of the build process before `tauri build`.
 */

import { existsSync, mkdirSync, cpSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

const sourceDir = join(
  projectRoot,
  'node_modules/@discordapp/twemoji/dist/svg',
);
const targetDir = join(projectRoot, 'src-tauri/assets/twemoji');

// Emoji codepoints used in the app (from constants.ts and utils/errors.ts)
const REQUIRED_EMOJIS = [
  '1f389', // 🎉 party popper
  '1f38a', // 🎊 confetti ball
  '1f3c6', // 🏆 trophy
  '1f3d6', // 🏖️ beach with umbrella
  '1f44f', // 👏 clapping hands
  '1f513', // 🔓 unlocked
  '1f52d', // 🔭 telescope
  '1f60e', // 😎 smiling face with sunglasses
  '1f62e-200d-1f4a8', // 😮‍💨 face exhaling
  '1f633', // 😳 flushed face
  '1f643', // 🙃 upside-down face
  '1f648', // 🙈 see-no-evil monkey
  '1f64c', // 🙌 raising hands
  '1f680', // 🚀 rocket
  '1f6dc', // 🛜 wireless
  '1f914', // 🤔 thinking face
  '1f972', // 🥲 smiling face with tear
  '1f973', // 🥳 partying face
  '1fae0', // 🫠 melting face
  '2728', // ✨ sparkles
];

if (!existsSync(sourceDir)) {
  console.error(`Source directory not found: ${sourceDir}`);
  console.error('Run "pnpm install" first.');
  process.exit(1);
}

// Create target directory if it doesn't exist
if (!existsSync(targetDir)) {
  mkdirSync(targetDir, { recursive: true });
}

let copied = 0;
let missing = 0;

for (const emoji of REQUIRED_EMOJIS) {
  const sourceFile = join(sourceDir, `${emoji}.svg`);
  const targetFile = join(targetDir, `${emoji}.svg`);

  if (existsSync(sourceFile)) {
    cpSync(sourceFile, targetFile);
    copied++;
  } else {
    console.warn(`Missing emoji SVG: ${emoji}`);
    missing++;
  }
}

console.log(`Copied ${copied} twemoji SVG files to ${targetDir}`);
if (missing > 0) {
  console.warn(`${missing} emoji files were not found`);
}

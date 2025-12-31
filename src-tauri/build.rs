use std::fs;
use std::path::Path;

/// Emoji codepoints used in the app (from constants.ts and utils/errors.ts)
const REQUIRED_EMOJIS: &[&str] = &[
    "1f389",            // 🎉
    "1f38a",            // 🎊
    "1f3c6",            // 🏆
    "1f3d6",            // 🏖️
    "1f44f",            // 👏
    "1f513",            // 🔓
    "1f52d",            // 🔭
    "1f60e",            // 😎
    "1f62e-200d-1f4a8", // 😮‍💨
    "1f633",            // 😳
    "1f643",            // 🙃
    "1f648",            // 🙈
    "1f64c",            // 🙌
    "1f680",            // 🚀
    "1f6dc",            // 🛜
    "1f914",            // 🤔
    "1f972",            // 🥲
    "1f973",            // 🥳
    "1fae0",            // 🫠
    "2728",             // ✨
];

fn copy_twemoji_assets() {
    let manifest_dir = std::env::var("CARGO_MANIFEST_DIR").unwrap();
    let project_root = Path::new(&manifest_dir).parent().unwrap();

    let source_dir = project_root.join("node_modules/@discordapp/twemoji/dist/svg");
    let target_dir = Path::new(&manifest_dir).join("assets/twemoji");

    // Create target directory if it doesn't exist
    if !target_dir.exists() {
        fs::create_dir_all(&target_dir).expect("Failed to create twemoji assets directory");
    }

    // Check if source directory exists
    if !source_dir.exists() {
        println!(
            "cargo:warning=Twemoji source directory not found: {}. Run 'pnpm install' first.",
            source_dir.display()
        );
        return;
    }

    for emoji in REQUIRED_EMOJIS {
        let source_file = source_dir.join(format!("{}.svg", emoji));
        let target_file = target_dir.join(format!("{}.svg", emoji));

        if source_file.exists() {
            fs::copy(&source_file, &target_file).unwrap_or_else(|e| {
                panic!("Failed to copy {}: {}", source_file.display(), e);
            });
        } else {
            println!("cargo:warning=Missing emoji SVG: {}", emoji);
        }
    }
}

fn main() {
    // Tell Cargo to rerun this script if twemoji sources change
    let manifest_dir = std::env::var("CARGO_MANIFEST_DIR").unwrap();
    let project_root = Path::new(&manifest_dir).parent().unwrap();
    let source_dir = project_root.join("node_modules/@discordapp/twemoji/dist/svg");

    // Rerun if the twemoji source directory changes
    println!("cargo:rerun-if-changed={}", source_dir.display());

    // Also rerun if this build script itself changes
    println!("cargo:rerun-if-changed=build.rs");

    copy_twemoji_assets();
    tauri_build::build();
}

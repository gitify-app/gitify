module.exports = {
  content: ["./src/**/*.js", "./src/**/*.ts", "./src/**/*.tsx"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        gray: {
          sidebar: "#24292e",
          dark: "#161b22",
          darker: "#090E15",
          darkest: "#000209",
        },
        primary: "#203354",
        success: "#2CC966",
        info: "#8BA9C6",
        warning: "#FCAA67",
        danger: "#B7524F",
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};

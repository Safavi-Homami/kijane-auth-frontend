module.exports = {
  plugins: ["react-hooks"],
  extends: [
    "plugin:react/recommended",
    "plugin:react-hooks/recommended"
  ],
  rules: {
    "react/prop-types": "off",
  },
  settings: {
    react: {
      version: "detect" // Automatisch React-Version erkennen
    }
  }
};

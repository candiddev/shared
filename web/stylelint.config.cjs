module.exports = {
  extends: "stylelint-config-recommended",
  plugins: ["stylelint-no-unsupported-browser-features"],
  rules: {
    "plugin/no-unsupported-browser-features": [
      true,
      {
        ignore: ["text-decoration"],
        severity: "error",
      },
    ],
    "selector-type-no-unknown": [
      true,
      {
        ignore: ["custom-elements"],
      },
    ],
  },
};

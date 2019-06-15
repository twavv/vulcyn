module.exports = {
  parser: "@typescript-eslint/parser",
  extends: [
    "plugin:@typescript-eslint/base",
    "prettier/@typescript-eslint",
    "plugin:prettier/recommended",
  ],
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: "module",
  },
  rules: {
    "quote-props": ["warn", "consistent-as-needed"],
    // Adapted from typescript-eslint with annoying things removed
    // https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/src/configs/recommended.json
    "@typescript-eslint/adjacent-overload-signatures": "error",
    "@typescript-eslint/ban-types": "error",
    camelcase: "off",
    "@typescript-eslint/camelcase": [
      "warn",
      {
        allow: ["^_", "^\\$_"],
      },
    ],
    "@typescript-eslint/class-name-casing": "error",
    "@typescript-eslint/explicit-member-accessibility": [
      "error",
      {
        // https://github.com/typescript-eslint/typescript-eslint/issues/617
        accessibility: "off",
        overrides: {
          properties: "no-public",
          methods: "no-public",
          constructors: "off",
        },
      },
    ],
    "@typescript-eslint/interface-name-prefix": "error",
    "@typescript-eslint/member-delimiter-style": "error",
    "@typescript-eslint/no-angle-bracket-type-assertion": "error",
    "no-array-constructor": "off",
    "@typescript-eslint/no-array-constructor": "error",
    "@typescript-eslint/no-empty-interface": "error",
    "@typescript-eslint/no-inferrable-types": "error",
    "@typescript-eslint/no-misused-new": "error",
    "@typescript-eslint/no-namespace": "error",
    "@typescript-eslint/no-object-literal-type-assertion": "error",
    "@typescript-eslint/no-triple-slash-reference": "error",
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": [
      "warn",
      {
        vars: "all",
        args: "after-used",
        ignoreRestSiblings: false,
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
      },
    ],
    "@typescript-eslint/no-var-requires": "error",
    "@typescript-eslint/prefer-interface": "warn",
    "@typescript-eslint/prefer-namespace-keyword": "error",
    "@typescript-eslint/type-annotation-spacing": "warn",
  },
};

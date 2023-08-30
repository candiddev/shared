module.exports = {
	env: {
		browser: true,
		es2017: true,
		node: true,
	},
	extends: [
		"eslint:recommended",
		"plugin:@typescript-eslint/recommended",
		"plugin:@typescript-eslint/recommended-requiring-type-checking",
		"plugin:compat/recommended",
	],
	globals: {
		testing: "writable",
	},
	overrides: [
		{
			files: [
				"**/*.d.ts",
				"!src/components/*.ts",
				"!src/lib/**/*.ts",
				"src/*.ts",
			],
			rules: {
				"jsdoc/require-jsdoc": "off",
			},
		},
		{
			files: [
				"**/*.test.ts",
				"src/lib/testing/*.ts",
			],
			rules: {
				"@typescript-eslint/consistent-type-assertions": "off",
				"@typescript-eslint/explicit-function-return-type": "off",
				"@typescript-eslint/no-explicit-any": "off",
				"@typescript-eslint/no-non-null-assertion": "off",
				"compat/compat": "off",
				"jsdoc/require-jsdoc": "off",
				"no-restricted-syntax": "off",
			},
		},
		{
			files: [
				"**/*.test.ts",
			],
			rules: {
				"no-restricted-syntax": [
					"error",
					"ThrowStatement",
					{
						message: "Use testing.hasClass",
						selector: "Identifier[name='classList']",
					},
					{
						message: "Use testing.hasAttribute",
						selector: "Identifier[name='getAttribute']",
					},
					{
						message: "Use testing.find or testing.findAll",
						selector: "Identifier[name='getElementsByClassName']",
					},
					{
						message: "Use testing.find or testing.findAll",
						selector: "Identifier[name='getElementsByTagName']",
					},
					{
						message: "Use testing.text",
						selector: "Identifier[name='textContent']",
					},
				],
			},
		},
	],
	parser: "@typescript-eslint/parser",
	parserOptions: {
		ecmaVersion: 2020,
		project: "tsconfig.eslint.json",
		sourceType: "module",
	},
	plugins: [
		"@typescript-eslint",
		"compat",
		"jsdoc",
		"simple-import-sort",
	],
	root: true,
	rules: {
		"@typescript-eslint/array-type": "error",
		"@typescript-eslint/ban-types": "off",
		"@typescript-eslint/consistent-type-assertions": [
			"error",
			{
				assertionStyle: "as",
			},
		],
		"@typescript-eslint/consistent-type-definitions": [
			"error",
			"interface",
		],
		"@typescript-eslint/consistent-type-imports": "error",
		"@typescript-eslint/explicit-function-return-type": "error",
		"@typescript-eslint/func-call-spacing": "error",
		"@typescript-eslint/indent": [
			"error",
			"tab",
			{
				ignoredNodes: [
					"PropertyDefinition[decorators]",
					"TSUnionType",
				],
			},
		],
		"@typescript-eslint/member-delimiter-style": [
			"error",
			{
				multiline: {
					delimiter: "comma",
					requireLast: true,
				},
				singleline: {
					delimiter: "comma",
					requireLast: true,
				},
			},
		],
		"@typescript-eslint/no-duplicate-imports": "error",
		"@typescript-eslint/no-empty-function": "off",
		"@typescript-eslint/no-extra-parens": "error",
		"@typescript-eslint/no-floating-promises": "error",
		"@typescript-eslint/no-inferrable-types": [
			"error",
			{
				ignoreProperties: true,
			},
		],
		"@typescript-eslint/no-misused-promises": [
			"error",
			{
				checksVoidReturn: false,
			},
		],
		"@typescript-eslint/no-require-imports": "error",
		"@typescript-eslint/no-shadow": "off",
		"@typescript-eslint/no-type-alias": "error",
		"@typescript-eslint/no-unnecessary-type-arguments": "error",
		"@typescript-eslint/no-unsafe-argument": "off",
		"@typescript-eslint/no-unsafe-assignment": "off",
		"@typescript-eslint/no-unsafe-call": "off",
		"@typescript-eslint/no-unsafe-member-access": "off",
		"@typescript-eslint/no-unsafe-return": "off",
		"@typescript-eslint/no-unused-vars": [
			"error",
			{
				argsIgnorePattern: "^_",
			},
		],
		"@typescript-eslint/prefer-function-type": "error",
		"@typescript-eslint/promise-function-async": "error",
		"@typescript-eslint/require-array-sort-compare": "error",
		"@typescript-eslint/require-await": "off", // This gets really goofy with awaiting empty
		"@typescript-eslint/restrict-plus-operands": "error",
		"@typescript-eslint/restrict-template-expressions": "off",
		"@typescript-eslint/return-await": "error",
		"@typescript-eslint/semi": "error",
		"@typescript-eslint/strict-boolean-expressions": "error",
		"@typescript-eslint/switch-exhaustiveness-check": "error",
		"@typescript-eslint/typedef": [
			"error",
			{
				arrowParameter: false,

			},
		],
		"@typescript-eslint/unbound-method": "off",
		"@typescript-eslint/unified-signatures": "error",
		"accessor-pairs": "error",
		"array-bracket-newline": [
			"error",
			{
				minItems: 1,
			},
		],
		"array-bracket-spacing": "error",
		"array-callback-return": "off", // Confuses stream maps with array maps
		"array-element-newline": "error",
		"arrow-body-style": [
			"error",
			"always",
		],
		"arrow-parens": "error",
		"arrow-spacing": "error",
		"block-scoped-var": "error",
		"brace-style": "error",
		"camelcase": "error",
		"comma-dangle": [
			"error",
			"always-multiline",
		],
		"compat/compat": "error",
		"curly": [
			"error",
			"all",
		],
		"dot-notation": "error",
		"eol-last": "error",
		"eqeqeq": "error",
		"implicit-arrow-linebreak": "error",
		"indent": "off",
		"jsdoc/require-description-complete-sentence": "error",
		"jsdoc/require-jsdoc": [
			"error",
			{
				contexts: [
					"TSPropertySignature",
				],
				enableFixer: false,
				publicOnly: true,
				require: {
					FunctionDeclaration: false,
				},
			},
		],
		"linebreak-style": "error",
		"multiline-ternary": "error",
		"newline-per-chained-call": [
			"error",
			{
				ignoreChainWithDepth: 1,
			},
		],
		"no-case-declarations": "off",
		"no-console": "error",
		"no-duplicate-imports": "off",
		"no-else-return": "error",
		"no-extra-parens": "off",
		"no-floating-decimal": "error",
		"no-implicit-globals": "error",
		"no-lonely-if": "error",
		"no-magic-numbers": "off",
		"no-multi-str": "error",
		"no-negated-condition": "error",
		"no-param-reassign": "error",
		"no-restricted-properties": [
			"error",
			{
				object: "testing",
				property: "logBody",
			},
		],
		"no-restricted-syntax": [
			"error",
			"ThrowStatement",
		],
		"no-return-assign": "error",
		"no-return-await": "off",
		"no-shadow": "off",
		"no-trailing-spaces": "error",
		"no-unneeded-ternary": "error",
		"no-unused-vars": "off",
		"no-useless-catch": "error",
		"no-useless-concat": "error",
		"no-var": "error",
		"object-curly-spacing": [
			"error",
			"always",
		],
		"object-property-newline": [
			"error",
			{
				allowAllPropertiesOnSameLine: false,
			},
		],
		"operator-assignment": "error",
		"prefer-arrow-callback": "error",
		"prefer-template": "error",
		"promise/always-return": "off",
		"quote-props": [
			"error",
			"consistent-as-needed",
		],
		"quotes": [
			"error",
			"double",
		],
		"semi": "off",
		"simple-import-sort/exports": "error",
		"simple-import-sort/imports": "error",
		"sort-imports": "off",
		"sort-keys": "error",
		"space-before-blocks": "error",
		"space-before-function-paren": "error",
		"space-in-parens": "error",
		"vars-on-top": "error",
		"yoda": "error",
	},
};

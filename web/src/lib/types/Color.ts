import type { Translation } from "@lib/yaml8n";
import { ColorBlack, ColorBlue, ColorBrown, ColorGray, ColorGreen, ColorIndigo, ColorOrange, ColorPink, ColorPurple, ColorRed, ColorTeal, ColorWhite, ColorYellow, Default } from "@lib/yaml8n";

/* eslint-disable sort-keys*/
export const ColorEnum: {
	[key: string]: {
		dark: string,
		light: string,
		translation: Translation,
	},
} = {
	default: {
		dark: "",
		light: "",
		translation: Default,
	},
	red: {
		dark: "#ff5252",
		light: "#d50000",
		translation: ColorRed,
	},
	pink: {
		dark: "#ff4081",
		light: "#f50057",
		translation: ColorPink,
	},
	orange: {
		dark: "#ffab40",
		light: "#ff6d00",
		translation: ColorOrange,
	},
	yellow: {
		dark: "#ffd740",
		light: "#ffab00",
		translation: ColorYellow,
	},
	green: {
		dark: "#69f0ae",
		light: "#00c853",
		translation: ColorGreen,
	},
	teal: {
		dark: "#64ffda",
		light: "#00bfa5",
		translation: ColorTeal,
	},
	blue: {
		dark: "#448aff",
		light: "#2962ff",
		translation: ColorBlue,
	},
	indigo: {
		dark: "#536dfe",
		light: "#6366f1",
		translation: ColorIndigo,
	},
	purple: {
		dark: "#7c4dff",
		light: "#6200ea",
		translation: ColorPurple,
	},
	brown: {
		dark: "#795548",
		light: "#5d4037",
		translation: ColorBrown,
	},
	black: {
		dark: "#c7c7c7",
		light: "#101010",
		translation: ColorBlack,
	},
	gray: {
		dark: "#dfe6e9",
		light: "#b2bec3",
		translation: ColorGray,
	},
	white: {
		dark: "#ffffff",
		light: "#636363",
		translation: ColorWhite,
	},
};
/* eslint-enable sort-keys*/

export const Color = {
	content: {
		black: "#1f2937",
		white: "#ebecf0",
	},
	contentColor: (color: string): string => {
		const c = Color.toHex(color);

		if (!c.startsWith("#")) {
			return Color.content.black;
		}

		const rgb = parseInt(c.substring(1), 16); // convert rrggbb to decimal
		const r = rgb >> 16 & 0xff; // extract red
		const g = rgb >>  8 & 0xff; // extract green
		const b = rgb >>  0 & 0xff; // extract blue

		const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b; // per ITU-R BT.709

		if (luma < 100) {
			return Color.content.white;
		}

		return Color.content.black;
	},
	toHex: (color: string, darkMode?: boolean): string => {
		if (Object.hasOwn(ColorEnum, color)) {
			return ColorEnum[color][darkMode === true ?
				"dark" :
				"light"
			];
		}

		return color;
	},
};

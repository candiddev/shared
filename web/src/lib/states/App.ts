import type { DropdownMenuAttrsItem } from "@lib/components/DropdownMenu";
import type { FormItemAutocompleteParseOutput, FormItemAutocompleteParser } from "@lib/components/FormItem";
import type { FormOverlayComponentAttrs } from "@lib/components/FormOverlay";
import type { MarkdownParseOutput, MarkdownParser } from "@lib/components/Markdown";
import type { AppAlert } from "@lib/layout/AppAlerts";
import type { AppFormSettings } from "@lib/layout/AppForm";
import type { AppBreadcrumb } from "@lib/layout/AppToolbar";
import { Log } from "@lib/services/Log";
import type { TelemetryOptions } from "@lib/services/Telemetry";
import { Telemetry } from "@lib/services/Telemetry";
import { CivilDate, CivilDateOrderEnum, CivilDateSeparatorEnum } from "@lib/types/CivilDate";
import { Color, ColorEnum } from "@lib/types/Color";
import { DisplayEnum } from "@lib/types/Display";
import type { Timestamp } from "@lib/types/Timestamp";
import { Clone } from "@lib/utilities/Clone";
import { StringCapitalize } from "@lib/utilities/StringCapitalize";
import type { ISO639Code } from "@lib/yaml8n";
import { ActionAdd, ActionCancel, ActionClose, ActionConfirm, ActionDelete, ActionDeleteConfirm, ActionDeselectAll, ActionDismiss, ActionEdit, ActionImport, ActionKeepAwake, ActionNew, ActionNone, ActionPreview, ActionSearch, ActionShow, ActionUpdate, ActionView, AlertNewVersion, AppToolbarActionsOnThisPage, ColorCustom, FormCreated, FormImageSelect, FormImportCSVField, FormImportCSVSelectCSV, FormImportCSVTooltip, FormItemDurationHour, FormItemDurationHours, FormItemDurationMinute, FormItemDurationMinutes, FormItemInputIconName, FormItemInputIconTooltip, FormItemNewPasswordPassword, FormItemNewPasswordTooltip, FormItemSelectColorName, FormItemSelectColorTooltip, FormItemSelectCurrencyFormat, FormItemSelectCurrencyFormatTooltip, FormItemTextAreaScanText, FormLastUpdated, FormRecurrenceDays, FormRecurrenceEnd, FormRecurrenceEndTooltip, FormRecurrenceFirst, FormRecurrenceFourth, FormRecurrenceFourthToLast, FormRecurrenceLabel, FormRecurrenceLast, FormRecurrenceMonths, FormRecurrenceNextDate, FormRecurrenceSecond, FormRecurrenceSecondToLast, FormRecurrenceSpecificDate, FormRecurrenceThird, FormRecurrenceThirdToLast, FormRecurrenceTooltip, FormRecurrenceWeeks, FormRecurrenceYears, Help, NoImage, Or, TableHeaderFilterTooltip, TableNothing, TableShowColumns, TooltipMarkdown, Translate,WeekdayFriday, WeekdayMonday, WeekdaySaturday, WeekdaySunday, WeekdayThursday, WeekdayTuesday, WeekdayWednesday } from "@lib/yaml8n";
import m from "mithril";
import Stream from "mithril/stream";
import nosleep from "nosleep.js";

// These are all flat so it's easy to merge changes.
export interface App {
	/** Current active loading button. */
	componentsButtonLoading: string,

	/** Current active DropdownMenu. */
	componentsDropdownMenu: string,

	/** If the DropdownMenu opens above. */
	componentsDropdownMenuAbove: boolean,

	/** A list of alerts. */
	layoutAppAlerts: AppAlert[],

	/** List of breadcrumbs to display. */
	layoutAppBreadCrumbs: AppBreadcrumb[],

	/** AppForm settings. */
	layoutAppForm: AppFormSettings,

	/** AppHelpLink is the iFrame link for AppHelp. */
	layoutAppHelpLink: string,

	/** AppHelp is open. */
	layoutAppHelpOpen: boolean,

	/** AppMenu is open. */
	layoutAppMenuOpen: boolean,

	/** Current navPath, should be set on route changes. */
	layoutAppMenuPath: string,

	/** A list of extra AppToolbarAction Buttons to always show, typically relevant for the current page. */
	layoutAppToolbarActionButtons: DropdownMenuAttrsItem[],

	/** Current user has admin privileges. */
	sessionAdmin: boolean,

	/** Current user is authenticated. */
	sessionAuthenticated: boolean,

	/** Whether or not debug mode is turned on. */
	sessionDebug: boolean,

	/** The current display setting. */
	sessionDisplay: DisplayEnum,

	/** Enable/disable the MOTD. */
	sessionHideMOTD: boolean,

	/** InstallPrompt event data for PWA. */
	sessionInstallPrompt: BeforeInstallPromptEvent | null,

	/** Whether the PWA InstallPrompt has been dismissed. */
	sessionInstallPromptDismissed: boolean,

	/** Determines whether the app is online or offline. */
	sessionOnline: boolean,

	/** A list of redirects that have been set.  Calling AppState.redirect() will pop them. */
	sessionRedirects: string[],

	/** The ServiceWorkerRegistration, if available. */
	sessionServiceWorkerRegistration: ServiceWorkerRegistration | null,

	/** Sleep is disabled. */
	sessionSleepDisabled: boolean,

	/** Translations contains various app-level translations. */
	translations: {
		/* eslint-disable jsdoc/require-jsdoc */
		actionAdd: string,
		actionCancel: string,
		actionClose: string,
		actionConfirm: string,
		actionDelete: string,
		actionDeleteConfirm: string,
		actionDeselectAll: string,
		actionDismiss: string,
		actionEdit: string,
		actionImport: string,
		actionKeepAwake: string,
		actionNew: string,
		actionPreview: string,
		actionSearch: string,
		actionShow: string,
		actionUpdate: string,
		alertNewVersion: string,
		appToolbarActionsOnThisPage: string,
		colorCustom: string,
		formCreated: string,
		formImageSelect: string,
		formImportCSVField: string,
		formImportCSVSelectCSV: string,
		formImportCSVTooltip: string,
		formItemDurationHour: string,
		formItemDurationHours: string,
		formItemDurationMinute: string,
		formItemDurationMinutes: string,
		formItemInputIconName: string,
		formItemInputIconTooltip: string,
		formItemNewPasswordPassword: string,
		formItemNewPasswordTooltip: string,
		formItemSelectColorName: string,
		formItemSelectColorTooltip: string,
		formItemSelectColorValues: AppPreferencesTranslationsFormItemSelectColorValue[],
		formItemSelectCurrencyFormat: string,
		formItemSelectCurrencyFormatTooltip: string,
		formItemTextAreaScanText: string,
		formLastUpdated: string,
		formPermissionTypes: string[],
		formRecurrenceDays: string,
		formRecurrenceEnd: string,
		formRecurrenceEndTooltip: string,
		formRecurrenceFirst: string,
		formRecurrenceFourth: string,
		formRecurrenceFourthToLast: string,
		formRecurrenceLabel: string,
		formRecurrenceLast: string,
		formRecurrenceMonths: string,
		formRecurrenceNextDate: string,
		formRecurrenceSecond: string,
		formRecurrenceSecondToLast: string,
		formRecurrenceSpecificDate: string,
		formRecurrenceThird: string,
		formRecurrenceThirdToLast: string,
		formRecurrenceTooltip: string,
		formRecurrenceWeekdays: string[],
		formRecurrenceWeeks: string,
		formRecurrenceYears: string,
		help: string,
		noImage: string,
		or: string,
		tableHeaderFilterTooltip: string,
		tableNothingFound: string,
		tableShowColumns: string,
		tooltipMarkdown: string,
		/* eslint-enable jsdoc/require-jsdoc */
	},
}

interface AppPreferencesTranslationsFormItemSelectColorValue {
	id: string,
	name: string,
}

export interface AppPreferences {
	/** Accent color. */
	colorAccent: string,

	/** Negative color. */
	colorNegative: string,

	/** Positive color. */
	colorPositive: string,

	/** Primary color. */
	colorPrimary: string,

	/** Secondary color. */
	colorSecondary: string,

	/** Dark mode. */
	darkMode: boolean,

	/** CivilDate order format. */
	formatDateOrder: CivilDateOrderEnum,

	/** CivilDate separator format. */
	formatDateSeparator: CivilDateSeparatorEnum,

	/** Time format. */
	formatTime24: boolean,

	/** Language. */
	iso639Code: string,
}

let noSleep: any; // eslint-disable-line @typescript-eslint/no-explicit-any

if (typeof document !== "undefined") {
	noSleep = new nosleep();
}

interface AppStyle {
	"--border": string,
	"--color_accent": string,
	"--color_accent-content": string,
	"--color_base-1": string,
	"--color_base-2": string,
	"--color_base-3": string,
	"--color_content": string,
	"--color_content-invert": string,
	"--color_negative": string,
	"--color_positive": string,
	"--color_primary": string,
	"--color_primary-content": string,
	"--color_secondary": string,
	"--color_secondary-content": string,
}

function New (): App {
	return {
		componentsButtonLoading: "",
		componentsDropdownMenu: "",
		componentsDropdownMenuAbove: false,
		layoutAppAlerts: [],
		layoutAppBreadCrumbs: [],
		layoutAppForm: {
			component: null,
			data: {},
		},
		layoutAppHelpLink: "",
		layoutAppHelpOpen: false,
		layoutAppMenuOpen: false,
		layoutAppMenuPath: "",
		layoutAppToolbarActionButtons: [],
		sessionAdmin: false,
		sessionAuthenticated: false,
		sessionDebug: false,
		sessionDisplay: DisplayEnum.XLarge,
		sessionHideMOTD: false,
		sessionInstallPrompt: null,
		sessionInstallPromptDismissed: false,
		sessionOnline: true,
		sessionRedirects: [],
		sessionServiceWorkerRegistration: null,
		sessionSleepDisabled: false,
		translations: {
			actionAdd: "Add",
			actionCancel: "Cancel",
			actionClose: "Close",
			actionConfirm: "Confirm",
			actionDelete: "Delete",
			actionDeleteConfirm: "Confirm Delete",
			actionDeselectAll: "Deselect All",
			actionDismiss: "Dismiss",
			actionEdit: "Edit",
			actionImport: "Import",
			actionKeepAwake: "Keep Awake",
			actionNew: "New",
			actionPreview: "Preview",
			actionSearch: "Search",
			actionShow: "Show",
			actionUpdate: "Update",
			alertNewVersion: "",
			appToolbarActionsOnThisPage: "On this page",
			colorCustom: "Custom",
			formCreated: "Created",
			formImageSelect: "Select",
			formImportCSVField: "",
			formImportCSVSelectCSV: "Select CSV",
			formImportCSVTooltip: "",
			formItemDurationHour: "Hour",
			formItemDurationHours: "Hours",
			formItemDurationMinute: "Minute",
			formItemDurationMinutes: "Minutes",
			formItemInputIconName: "Icon",
			formItemInputIconTooltip: "tooltip",
			formItemNewPasswordPassword: "Password",
			formItemNewPasswordTooltip: "",
			formItemSelectColorName: "Color",
			formItemSelectColorTooltip: "",
			formItemSelectColorValues: Object.keys(ColorEnum)
				.map((color) => {
					return {
						id: color,
						name: StringCapitalize(color),
					};
				}),
			formItemSelectCurrencyFormat: "Currency Format",
			formItemSelectCurrencyFormatTooltip: "",
			formItemTextAreaScanText: "Scan Text From Picture",
			formLastUpdated: "Last Updated",
			formPermissionTypes: [
				"Edit",
				"View",
				"None",
			],
			formRecurrenceDays: "Days",
			formRecurrenceEnd: "End Recurrence on",
			formRecurrenceEndTooltip: "",
			formRecurrenceFirst: "First",
			formRecurrenceFourth: "Fourth",
			formRecurrenceFourthToLast: "Fourth To Last",
			formRecurrenceLabel: "Repeat every...",
			formRecurrenceLast: "Last",
			formRecurrenceMonths: "Months",
			formRecurrenceNextDate: "Next Date",
			formRecurrenceSecond: "Second",
			formRecurrenceSecondToLast: "Second To Last",
			formRecurrenceSpecificDate: "Specific Date",
			formRecurrenceThird: "Third",
			formRecurrenceThirdToLast: "Third To Last",
			formRecurrenceTooltip: "",
			formRecurrenceWeekdays: [
				"Monday",
				"Tuesday",
				"Wednesday",
				"Thursday",
				"Friday",
				"Saturday",
				"Sunday",
			],
			formRecurrenceWeeks: "Weeks",
			formRecurrenceYears: "Years",
			help: "Help",
			noImage: "No Image",
			or: "Or",
			tableHeaderFilterTooltip: "",
			tableNothingFound: "Nothing Found",
			tableShowColumns: "SHow Columns",
			tooltipMarkdown: "markdown",
		},
	};
}

export const AppState = {
	clearLayoutAppAlert: (message: string): void => {
		const alerts = AppState.data.layoutAppAlerts;

		const i = alerts.findIndex((alert) => {
			return alert.message === message;
		});

		if (i >= 0) {
			alerts.splice(i, 1);
		}

		AppState.set({
			layoutAppAlerts: alerts,
		});
		m.redraw();
	},
	data: New(),
	formatCivilDate: (date: CivilDate | NullCivilDate): string => {
		if (typeof date === "object" && date !== null) {
			return date.toString(
				AppState.preferences().formatDateOrder,
				AppState.preferences().formatDateSeparator,
			);
		}

		return CivilDate.fromString(date as string) // eslint-disable-line @typescript-eslint/no-non-null-assertion
			.toString(
				AppState.preferences().formatDateOrder,
				AppState.preferences().formatDateSeparator,
			);
	},
	formatTimestamp: (timestamp: Timestamp): string => {
		return timestamp.toPrettyString(
			AppState.preferences().formatDateOrder,
			AppState.preferences().formatDateSeparator,
			AppState.preferences().formatTime24,
		);
	},
	getComponentsButtonLoading: (): string => {
		return AppState.data.componentsButtonLoading;
	},
	getComponentsDropdownMenu: (): string => {
		return AppState.data.componentsDropdownMenu;
	},
	getComponentsDropdownMenuAbove: (): boolean => {
		return AppState.data.componentsDropdownMenuAbove;
	},
	getLayoutAppAlerts: (): AppAlert[] => {
		return AppState.data.layoutAppAlerts;
	},
	getLayoutAppBreadcrumbs: (): AppBreadcrumb[] => {
		return AppState.data.layoutAppBreadCrumbs;
	},
	getLayoutAppForm: (): AppFormSettings => {
		return AppState.data.layoutAppForm;
	},
	getLayoutAppMenuPath: (): string => {
		return AppState.data.layoutAppMenuPath;
	},
	getLayoutAppToolbarActionButtons: (): DropdownMenuAttrsItem[] => {
		return AppState.data.layoutAppToolbarActionButtons;
	},
	getSessionDisplay: (): DisplayEnum => {
		return AppState.data.sessionDisplay;
	},
	getSessionInstallPrompt: (): BeforeInstallPromptEvent | null => {
		return AppState.data.sessionInstallPrompt;
	},
	getSessionRedirects: (): string[] => {
		return AppState.data.sessionRedirects;
	},
	getSessionServiceWorkerRegistration: (): ServiceWorkerRegistration | null => {
		return AppState.data.sessionServiceWorkerRegistration;
	},
	init: (
		motd: () => string | undefined,
		oncreate: () => Promise<void>,
		ondebug: () => TelemetryOptions,
		parserFormItemAutocomplete: FormItemAutocompleteParser | undefined,
		parserMarkdown: MarkdownParser | undefined,
		preferences: Stream<AppPreferences>,
		product: string,
	): void => {
		AppState.motd = motd;
		AppState.oncreate = oncreate;
		AppState.ondebug = ondebug;

		if (parserFormItemAutocomplete !== undefined) {
			AppState.parserFormItemAutocomplete = parserFormItemAutocomplete;
		}

		if (parserMarkdown !== undefined) {
			AppState.parserMarkdown = parserMarkdown;
		}

		AppState.preferences.end(true);
		AppState.preferences = preferences.map((preferences) => {
			if (AppState.preferences().iso639Code !== preferences.iso639Code) {
				AppState.setSessionISO639(preferences.iso639Code);
			}

			const colors = {
				accent: Color.toHex(preferences.colorAccent, preferences.darkMode),
				primary: Color.toHex(preferences.colorPrimary, preferences.darkMode),
				secondary: Color.toHex(preferences.colorSecondary, preferences.darkMode),
			};

			AppState.style = {
				"--border": preferences.darkMode ?
					"var(--border_dark)" :
					"var(--border_light)",
				"--color_accent": colors.accent,
				"--color_accent-content": Color.contentColor(colors.accent),
				"--color_base-1": preferences.darkMode ?
					"#111827" :
					"#ffffff",
				"--color_base-2": preferences.darkMode ?
					"#1f2937" :
					"#eceff1",
				"--color_base-3": preferences.darkMode ?
					"#374151" :
					"#cfd8dc",
				"--color_content": Color.toHex(preferences.darkMode ?
					Color.content.white :
					Color.content.black),
				"--color_content-invert": Color.toHex(preferences.darkMode ?
					Color.content.black :
					Color.content.white),
				"--color_negative": Color.toHex(preferences.colorNegative, preferences.darkMode),
				"--color_positive": Color.toHex(preferences.colorPositive, preferences.darkMode),
				"--color_primary": colors.primary,
				"--color_primary-content": Color.contentColor(colors.primary),
				"--color_secondary": colors.secondary,
				"--color_secondary-content": Color.contentColor(colors.secondary),
			};

			return preferences;
		});
		AppState.product = product;
		AppState.updateSize();

		m.route.prefix = "";

		// Handle resize and setup initial size
		window.addEventListener("resize", () => {
			AppState.updateSize();
		});
	},
	isLayoutAppHelpOpen: (): boolean => {
		return AppState.data.layoutAppHelpOpen;
	},
	isLayoutAppMenuOpen: (): boolean => {
		return AppState.data.layoutAppMenuOpen;
	},
	isSessionAdmin: (): boolean => {
		return AppState.data.sessionAdmin;
	},
	isSessionAuthenticated: (): boolean => {
		return AppState.data.sessionAuthenticated;
	},
	isSessionDebug: (): boolean => {
		return AppState.data.sessionDebug;
	},
	isSessionHideMOTD: (): boolean => {
		return AppState.data.sessionHideMOTD;
	},
	isSessionOnline: (): boolean => {
		return AppState.data.sessionOnline;
	},
	isSessionSleepDisabled: (): boolean => {
		return AppState.data.sessionSleepDisabled;
	},
	motd: (): string | undefined => {
		return;
	},
	oncreate: async (): Promise<void> => {},
	ondebug: (): TelemetryOptions => {
		return {
			endpoint: "",
			path: "",
			serviceName: "",
		};
	},
	parserFormItemAutocomplete: {
		options: Stream([] as string[]),
		parse: (): FormItemAutocompleteParseOutput => {
			return {
				options: [],
				splice: "",
				visible: false,
			};
		},
	} as FormItemAutocompleteParser,
	parserMarkdown: {
		match: /a^/,
		parse: (): MarkdownParseOutput => {
			return {
				link: "",
				name: "",
			};
		},
	} as MarkdownParser,
	preferences: Stream({
		colorAccent: "",
		colorNegative: "",
		colorPositive: "",
		colorPrimary: "",
		colorSecondary: "",
		darkMode: false,
		formatDateOrder: CivilDateOrderEnum.MDY,
		formatDateSeparator: CivilDateSeparatorEnum.ForwardSlash,
		formatTime24: false,
	} as AppPreferences),
	product: "",
	redirect: (): void => {
		const redirects = AppState.data.sessionRedirects;

		if (redirects.length > 0) {
			Log.debug(`Redirect: ${redirects[0]} from ${m.route.get()}`);

			m.route.set(redirects[0], {}, {
				replace: true,
				state: {
					key: Date.now(),
				},
			});

			redirects.shift();

			AppState.set({
				sessionRedirects: redirects,
			});
		} else if (m.route.get() === undefined || m.route.get() !== "/home"
			&& !m.route.get()
				.includes("/about")
			&& !m.route.get()
				.includes("/cook/recipes/")
			&& !m.route.get()
				.includes("/payment")
		) {
			m.route.set("/home", {}, {
				replace: true,
				state: {
					key: Date.now(),
				},
			});
		}
	},
	reset: (): void => {
		AppState.data = New();
		AppState.updateSize();
	},
	set: (state: Partial<App>): void => {
		Log.debug(`App state change: ${JSON.stringify(state)}`);
		AppState.data = {
			...AppState.data,
			...state,
		};
	},
	setComponentsButtonLoading: (name: string): void => {
		AppState.set({
			componentsButtonLoading: name,
		});
	},
	setComponentsDropdownMenu: (id: string, x: number): void => {
		AppState.set({
			componentsDropdownMenu: id === AppState.data.componentsDropdownMenu ?
				"" :
				id,
			componentsDropdownMenuAbove: x > window.innerHeight * 0.75,
		});
	},
	setLayoutApp: (data: {
		/* eslint-disable jsdoc/require-jsdoc */
		breadcrumbs: AppBreadcrumb[],
		helpLink: string,
		toolbarActionButtons: DropdownMenuAttrsItem[],
		/* eslint-enable jsdoc/require-jsdoc */
	}): void => {
		AppState.set({
			layoutAppBreadCrumbs: data.breadcrumbs,
			layoutAppHelpLink: data.helpLink,
			layoutAppToolbarActionButtons: data.toolbarActionButtons,
		});

		if (data.breadcrumbs.length === 0) {
			document.title = AppState.product;
		} else {
			document.title = `${AppState.product} - ${data.breadcrumbs.map((breadcrumb) => {
				return breadcrumb.name;
			})
				.join(" - ")}`;
		}

		m.redraw();
	},
	setLayoutAppAlert: (alert: AppAlert, hidden?: boolean): void => {
		if (typeof window === "undefined") {
			return;
		}

		Log.debug(alert.message);

		if (alert.message === "" || hidden === true) {
			return;
		}

		const alerts = Clone(AppState.data.layoutAppAlerts);

		const i = alerts.findIndex((a) => {
			return a.message === alert.message;
		});

		if (i >= 0) {
			return;
		}

		if (alert.actions === undefined) {
			alert.actions = [];
		}

		alert.actions.unshift({
			name: AppState.data.translations.actionDismiss,
			onclick: async (): Promise<void> => {
				AppState.clearLayoutAppAlert(alert.message);
			},
		});

		alerts.push(alert);

		if (alert.persist !== true) {
			setTimeout(
				() => {
					AppState.clearLayoutAppAlert(alert.message);
				},
				process.env.NODE_ENV === "test"
					? 300
					: 1500,
			);
		}

		AppState.set({
			layoutAppAlerts: alerts,
		});

		m.redraw();
	},
	setLayoutAppAlertNewVersion: (): void => {
		const msg = AppState.data.translations.alertNewVersion;

		AppState.setLayoutAppAlert(
			{
				actions: [
					{
						name: "Activate",
						onclick: async (): Promise<void> => {
							AppState.clearLayoutAppAlert(msg);
							window.location.reload();
						},
					},
				],
				message: msg,
				persist: true,
			},
		);
	},
	setLayoutAppForm: (component?: () => m.Component<FormOverlayComponentAttrs<any>>, data?: any): void => { // eslint-disable-line @typescript-eslint/no-explicit-any
		AppState.set({
			layoutAppForm: {
				component: component === undefined ?
					null :
					component,
				data: data === undefined ?
					AppState.data.layoutAppForm.data :
					Clone(data),
			},
		});
		m.redraw();
	},
	setLayoutAppMenuPath: (path: string): void => {
		AppState.set({
			layoutAppMenuPath: path,
		});
	},
	setSessionAdmin: (admin: boolean): void => {
		AppState.set({
			sessionAdmin: admin,
		});
	},
	setSessionAuthenticated: (authenticated: boolean): void => {
		AppState.set({
			sessionAuthenticated: authenticated,
		});
	},
	setSessionHideMOTD: (): void => {
		AppState.set({
			sessionHideMOTD: true,
		});
	},
	setSessionISO639: (code: ISO639Code): void => {
		AppState.set({
			translations: {
				actionAdd: Translate(code, ActionAdd),
				actionCancel: Translate(code, ActionCancel),
				actionClose: Translate(code, ActionClose),
				actionConfirm: Translate(code, ActionConfirm),
				actionDelete: Translate(code, ActionDelete),
				actionDeleteConfirm: Translate(code, ActionDeleteConfirm),
				actionDeselectAll: Translate(code, ActionDeselectAll),
				actionDismiss: Translate(code, ActionDismiss),
				actionEdit: Translate(code, ActionEdit),
				actionImport: Translate(code, ActionImport),
				actionKeepAwake: Translate(code, ActionKeepAwake),
				actionNew: Translate(code, ActionNew),
				actionPreview: Translate(code, ActionPreview),
				actionSearch: Translate(code, ActionSearch),
				actionShow: Translate(code, ActionShow),
				actionUpdate: Translate(code, ActionUpdate),
				alertNewVersion: Translate(code, AlertNewVersion),
				appToolbarActionsOnThisPage: Translate(code, AppToolbarActionsOnThisPage),
				colorCustom: Translate(code, ColorCustom),
				formCreated: Translate(code, FormCreated),
				formImageSelect: Translate(code, FormImageSelect),
				formImportCSVField: Translate(code, FormImportCSVField),
				formImportCSVSelectCSV: Translate(code, FormImportCSVSelectCSV),
				formImportCSVTooltip: Translate(code, FormImportCSVTooltip),
				formItemDurationHour: Translate(code, FormItemDurationHour),
				formItemDurationHours: Translate(code, FormItemDurationHours),
				formItemDurationMinute: Translate(code, FormItemDurationMinute),
				formItemDurationMinutes: Translate(code, FormItemDurationMinutes),
				formItemInputIconName: Translate(code, FormItemInputIconName),
				formItemInputIconTooltip: Translate(code, FormItemInputIconTooltip),
				formItemNewPasswordPassword: Translate(code, FormItemNewPasswordPassword),
				formItemNewPasswordTooltip: Translate(code, FormItemNewPasswordTooltip),
				formItemSelectColorName: Translate(code, FormItemSelectColorName),
				formItemSelectColorTooltip: Translate(code, FormItemSelectColorTooltip),
				formItemSelectColorValues: Object.keys(ColorEnum)
					.map((key) => {
						return {
							id: key,
							name: Translate(code, ColorEnum[key].translation),
						};
					}),
				formItemSelectCurrencyFormat: Translate(code, FormItemSelectCurrencyFormat),
				formItemSelectCurrencyFormatTooltip: Translate(code, FormItemSelectCurrencyFormatTooltip),
				formItemTextAreaScanText: Translate(code, FormItemTextAreaScanText),
				formLastUpdated: Translate(code, FormLastUpdated),
				formPermissionTypes: [
					Translate(code, ActionEdit),
					Translate(code, ActionView),
					Translate(code, ActionNone),
				],
				formRecurrenceDays: Translate(code, FormRecurrenceDays),
				formRecurrenceEnd: Translate(code, FormRecurrenceEnd),
				formRecurrenceEndTooltip: Translate(code, FormRecurrenceEndTooltip),
				formRecurrenceFirst: Translate(code, FormRecurrenceFirst),
				formRecurrenceFourth: Translate(code, FormRecurrenceFourth),
				formRecurrenceFourthToLast: Translate(code, FormRecurrenceFourthToLast),
				formRecurrenceLabel: Translate(code, FormRecurrenceLabel),
				formRecurrenceLast: Translate(code, FormRecurrenceLast),
				formRecurrenceMonths: Translate(code, FormRecurrenceMonths),
				formRecurrenceNextDate: Translate(code, FormRecurrenceNextDate),
				formRecurrenceSecond: Translate(code, FormRecurrenceSecond),
				formRecurrenceSecondToLast: Translate(code, FormRecurrenceSecondToLast),
				formRecurrenceSpecificDate: Translate(code, FormRecurrenceSpecificDate),
				formRecurrenceThird: Translate(code, FormRecurrenceThird),
				formRecurrenceThirdToLast: Translate(code, FormRecurrenceThirdToLast),
				formRecurrenceTooltip: Translate(code, FormRecurrenceTooltip),
				formRecurrenceWeekdays: [
					Translate(code, WeekdayMonday),
					Translate(code, WeekdayTuesday),
					Translate(code, WeekdayWednesday),
					Translate(code, WeekdayThursday),
					Translate(code, WeekdayFriday),
					Translate(code, WeekdaySaturday),
					Translate(code, WeekdaySunday),
				],
				formRecurrenceWeeks: Translate(code, FormRecurrenceWeeks),
				formRecurrenceYears: Translate(code, FormRecurrenceYears),
				help: Translate(code, Help),
				noImage: Translate(code, NoImage),
				or: Translate(code, Or),
				tableHeaderFilterTooltip: Translate(code, TableHeaderFilterTooltip),
				tableNothingFound: Translate(code, TableNothing),
				tableShowColumns: Translate(code, TableShowColumns),
				tooltipMarkdown: Translate(code, TooltipMarkdown),
			},
		});
	},
	setSessionInstallPrompt: (e: BeforeInstallPromptEvent | null): void => {
		if (!AppState.data.sessionInstallPromptDismissed) {
			AppState.set({
				sessionInstallPrompt: e,
			});
		}

		if (e === null) {
			AppState.set({
				sessionInstallPromptDismissed: true,
			});
		}
	},
	setSessionRedirect: (redirect: string | string[]): void => {
		if (Array.isArray(redirect)) {
			AppState.set({
				sessionRedirects: redirect,
			});

			return;
		}

		if (AppState.data.sessionRedirects.includes(redirect)) {
			return;
		}

		Log.debug(`Redirect set: ${redirect} from ${m.route.get()}`);
		if (redirect.includes("/reset")
			&& redirect.includes("/signin")
			&& redirect.includes("/signup")) {

			return;
		}

		const redirects = Clone(AppState.data.sessionRedirects);
		redirects.unshift(redirect);

		AppState.set({
			sessionRedirects: redirects,
		});
	},
	setSessionServiceWorkerRegistration: (r: ServiceWorkerRegistration): void => {
		AppState.set({
			sessionServiceWorkerRegistration: r,
		});
	},
	style: {
		"--border": "",
		"--color_accent": "",
		"--color_accent-content": "",
		"--color_base-1": "",
		"--color_base-2": "",
		"--color_base-3": "",
		"--color_content": "",
		"--color_content-invert": "",
		"--color_negative": "",
		"--color_positive": "",
		"--color_primary": "",
		"--color_primary-content": "",
		"--color_secondary": "",
		"--color_secondary-content": "",
	} as AppStyle,
	toggleLayoutAppHelpOpen: (open?: boolean): void => {
		if (open === true || open === false) {
			AppState.set({
				layoutAppHelpOpen: open,
			});
		} else {
			AppState.set({
				layoutAppHelpOpen: !AppState.data.layoutAppHelpOpen,
			});
		}
	},
	toggleLayoutAppMenuOpen: (open?: boolean): void => {
		if (open === true || open === false) {
			AppState.set({
				layoutAppMenuOpen: open,
			});
		} else {
			AppState.set({
				layoutAppMenuOpen: !AppState.data.layoutAppMenuOpen,
			});
		}
	},
	toggleSessionDebug: (): void => {
		Telemetry.state = AppState.ondebug();

		AppState.set({
			sessionDebug: true,
		});
	},
	toggleSessionSleepDisabled: (): void => {
		AppState.set({
			sessionSleepDisabled: !AppState.data.sessionSleepDisabled,
		});

		if (AppState.data.sessionSleepDisabled) {
			noSleep.enable();
		} else {
			noSleep.disable();
		}
	},
	updateSize: (): void => {
		let display = DisplayEnum.XSmall;

		if (window.matchMedia("(min-width: 1280px)").matches) {
			display = DisplayEnum.XLarge;

			if (AppState.data.sessionAuthenticated) {
				AppState.toggleLayoutAppMenuOpen(true);
				m.redraw();
			}
		} else if (window.matchMedia("(min-width: 1024px)").matches) {
			display = DisplayEnum.Large;
		} else if (window.matchMedia("(min-width: 768px)").matches) {
			display = DisplayEnum.Medium;
		} else if (window.matchMedia("(min-width: 640px)").matches) {
			display = DisplayEnum.Small;
		}

		if (display !== AppState.data.sessionDisplay) {
			AppState.set({
				sessionDisplay: display,
			});

			m.redraw();
		}
	},
};

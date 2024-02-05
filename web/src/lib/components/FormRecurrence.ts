import { AppState } from "@lib/states/App";
import type { WeekdayEnum } from "@lib/types/Weekday";
import m from "mithril";

import { CivilDate } from "../types/CivilDate";
import { Month, MonthEnum } from "../types/Month";
import type { RecurrenceInterval } from "../types/Recurrence";
import { Recurrence } from "../types/Recurrence";
import { Timestamp } from "../types/Timestamp";
import { Animate, Animation } from "../utilities/Animate";
import { Form } from "./Form";
import { FormItem } from "./FormItem";
import { FormItemInput } from "./FormItemInput";
import { FormItemInputDate } from "./FormItemInputDate";
import { FormItemSelect } from "./FormItemSelect";
import { Tooltip } from "./Tooltip";

export interface FormRecurrenceAttrs {
  /** End date of the recurrence, if applicable. */
  endDate?: NullCivilDate;
  endDateInput?(e: string): void;

  /** Show the future date as the next date? */
  futureNext?: boolean;

  /** Recurrence value. */
  recurrence: RecurrenceInterval;

  /** Start date of the recurrence. */
  startDate: NullCivilDate;
}

export function FormRecurrence(): m.Component<FormRecurrenceAttrs> {
  const every = [
    AppState.data.translations.formRecurrenceDays,
    AppState.data.translations.formRecurrenceWeeks,
    AppState.data.translations.formRecurrenceMonths,
    AppState.data.translations.formRecurrenceYears,
  ];
  const monthCadence = [
    AppState.data.translations.formRecurrenceFourthToLast,
    AppState.data.translations.formRecurrenceThirdToLast,
    AppState.data.translations.formRecurrenceSecondToLast,
    AppState.data.translations.formRecurrenceLast,
    AppState.data.translations.formRecurrenceSpecificDate,
    AppState.data.translations.formRecurrenceFirst,
    AppState.data.translations.formRecurrenceSecond,
    AppState.data.translations.formRecurrenceThird,
    AppState.data.translations.formRecurrenceFourth,
  ];

  const state: {
    /** Every X. */
    every: number;

    /** The recurrence value the Form was initialized with. */
    initRecurrence: RecurrenceInterval;

    /** The initial start date the Form was using. */
    initStartDate: NullCivilDate;

    /** What cadence to use for months. */
    monthCadence: number;
  } = {
    every: 0,
    initRecurrence: Recurrence.new(),
    initStartDate: null,
    monthCadence: 4,
  };

  function init(
    recurrence: RecurrenceInterval,
    startDate: NullCivilDate,
  ): void {
    state.every = 0;

    if (recurrence.weekdays !== null) {
      state.every = 1;
    }
    if (recurrence.day !== 0) {
      state.every = 2;
    }
    if (recurrence.monthWeek !== 0) {
      state.every = 2;
      state.monthCadence = recurrence.monthWeek + 4;
    }
    if (recurrence.month !== MonthEnum.None) {
      state.every = 3;
    }
    if (recurrence.separation === 0) {
      recurrence.separation = 1;
    }

    state.initRecurrence = recurrence;
    state.initStartDate = startDate;
  }

  return {
    onbeforeremove: Animate.onbeforeremove(Animation.Fade),
    oninit: (vnode): void => {
      init(vnode.attrs.recurrence, vnode.attrs.startDate);
    },
    onupdate: (vnode): void => {
      if (
        vnode.attrs.recurrence !== state.initRecurrence ||
        vnode.attrs.startDate !== state.initStartDate
      ) {
        init(vnode.attrs.recurrence, vnode.attrs.startDate);
        m.redraw();
      }
    },
    view: (vnode): m.Children => {
      return m(Form, [
        m(
          "div.FormItem",
          {
            id: "form-item-recurrence",
          },
          [
            m("div.FormItem__label", [
              m(
                "label",
                {
                  for: "form-item-input-recurrence",
                  id: "form-item-label-recurrence",
                },
                AppState.data.translations.formRecurrenceLabel,
              ),
              m(Tooltip, {
                value: AppState.data.translations.formRecurrenceTooltip,
              }),
            ]),
            m("div.FormItem__multi", [
              m(FormItemInput, {
                max: 52,
                min: 1,
                name: "recurrence-separation",
                oninput: (e) => {
                  if (e !== "") {
                    const v = parseInt(e, 10);
                    if (v >= 0 && v < 52) {
                      vnode.attrs.recurrence.separation = v;
                      return;
                    }
                  }
                  vnode.attrs.recurrence.separation = 0;
                },
                type: "number",
                value: vnode.attrs.recurrence.separation,
              }),
              m(FormItemSelect, {
                name: "recurrence-every",
                oninput: (e: string) => {
                  state.every = every.indexOf(e);
                  if (state.every > 1 && vnode.attrs.startDate !== null) {
                    switch (state.every) {
                      case 2:
                        vnode.attrs.recurrence.day = parseInt(
                          vnode.attrs.startDate.split("-")[2],
                          10,
                        );
                        vnode.attrs.recurrence.month = 0;
                        break;
                      case 3:
                        vnode.attrs.recurrence.day = parseInt(
                          vnode.attrs.startDate.split("-")[2],
                          10,
                        );
                        vnode.attrs.recurrence.month = parseInt(
                          vnode.attrs.startDate.split("-")[1],
                          10,
                        );
                    }
                  } else {
                    vnode.attrs.recurrence.month = 0;
                    vnode.attrs.recurrence.day = 0;
                  }
                  vnode.attrs.recurrence.monthWeek = 0;
                  vnode.attrs.recurrence.weekday = 0;
                  vnode.attrs.recurrence.weekdays = null;
                },
                options: every,
                value: every[state.every],
              }),
              state.every > 0
                ? m("span.FormItem__label#form-label-recurrence-on", "on")
                : [],
              state.every === 3
                ? m(FormItemSelect, {
                    name: "recurrence-month",
                    oninput: (e: string): void => {
                      vnode.attrs.recurrence.month = Month.values.indexOf(e);
                    },
                    options: Month.values,
                    value: Month.values[vnode.attrs.recurrence.month],
                  })
                : [],
              state.every > 1
                ? m(FormItemSelect, {
                    name: "recurrence-monthcadence",
                    oninput: (e: string) => {
                      state.monthCadence = monthCadence.indexOf(e);
                      if (
                        state.monthCadence === 4 &&
                        vnode.attrs.startDate !== null
                      ) {
                        vnode.attrs.recurrence.day = parseInt(
                          vnode.attrs.startDate.split("-")[2],
                          10,
                        );
                      } else {
                        vnode.attrs.recurrence.day = 0;
                      }
                      (vnode.attrs.recurrence.monthWeek =
                        monthCadence.indexOf(e) - 4),
                        (vnode.attrs.recurrence.weekday = 0);
                      vnode.attrs.recurrence.weekdays = null;
                    },
                    options: [
                      AppState.data.translations.formRecurrenceSpecificDate,
                      AppState.data.translations.formRecurrenceFirst,
                      AppState.data.translations.formRecurrenceSecond,
                      AppState.data.translations.formRecurrenceThird,
                      AppState.data.translations.formRecurrenceFourth,
                      AppState.data.translations.formRecurrenceLast,
                      AppState.data.translations.formRecurrenceSecondToLast,
                      AppState.data.translations.formRecurrenceThirdToLast,
                      AppState.data.translations.formRecurrenceFourthToLast,
                    ],
                    value: monthCadence[state.monthCadence],
                  })
                : [],
              state.every > 1 && state.monthCadence === 4
                ? m(FormItemInput, {
                    max: 31,
                    min: 1,
                    name: "recurrence-day",
                    oninput: (e) => {
                      if (e !== "") {
                        const v = parseInt(e, 10);
                        if (v >= 0 && v < 32) {
                          vnode.attrs.recurrence.day = v;
                          return;
                        }
                      }
                      vnode.attrs.recurrence.day = 0;
                    },
                    type: "number",
                    value: vnode.attrs.recurrence.day,
                  })
                : [],
              state.every === 1 || (state.every > 1 && state.monthCadence !== 4)
                ? m(FormItemSelect, {
                    multiple: state.every === 1,
                    name: "recurrence-weekdays",
                    oninput: (e: string) => {
                      if (state.every === 1) {
                        const days: number[] = [];
                        const el = document.getElementById(
                          "form-item-select-recurrence-weekdays",
                        ) as HTMLSelectElement; // eslint-disable-line @typescript-eslint/consistent-type-assertions
                        if (el !== null) {
                          const options: HTMLOptionElement[] = [].slice.call(
                            el.options,
                          );
                          for (const option of options) {
                            if (option.selected === true) {
                              days.push(
                                AppState.data.translations.formRecurrenceWeekdays.indexOf(
                                  option.value,
                                ) + 1,
                              );
                            }
                          }
                        }
                        vnode.attrs.recurrence.weekdays = days;
                      } else {
                        vnode.attrs.recurrence.weekday =
                          AppState.data.translations.formRecurrenceWeekdays.indexOf(
                            e,
                          ) + 1;
                      }
                    },
                    options:
                      AppState.data.translations.formRecurrenceWeekdays.map(
                        (weekday) => {
                          return {
                            name: weekday,
                            selected:
                              vnode.attrs.recurrence.weekdays === null
                                ? vnode.attrs.recurrence.weekday ===
                                  ((AppState.data.translations.formRecurrenceWeekdays.indexOf(
                                    weekday,
                                  ) + 1) as WeekdayEnum)
                                : vnode.attrs.recurrence.weekdays.includes(
                                    AppState.data.translations.formRecurrenceWeekdays.indexOf(
                                      weekday,
                                    ) + 1,
                                  ),
                          };
                        },
                      ),
                  })
                : [],
            ]),
          ],
        ),
        m(FormItem, {
          input: {
            disabled: true,
            oninput: (): void => {},
            required: true,
            type: "date",
            value:
              vnode.attrs.startDate === null
                ? AppState.formatCivilDate(CivilDate.now())
                : vnode.attrs.futureNext === true
                  ? AppState.formatCivilDate(
                      Recurrence.nextFutureTimestamp(
                        vnode.attrs.recurrence,
                        Timestamp.fromCivilDate(
                          CivilDate.fromString(vnode.attrs.startDate),
                        ),
                      ).toCivilDate(),
                    )
                  : AppState.formatCivilDate(
                      Recurrence.nextTimestamp(
                        vnode.attrs.recurrence,
                        Timestamp.fromCivilDate(
                          CivilDate.fromString(vnode.attrs.startDate),
                        ),
                      ).toCivilDate(),
                    ),
          },
          name: AppState.data.translations.formRecurrenceNextDate,
          tooltip: "",
        }),
        vnode.attrs.endDate === undefined
          ? []
          : m(FormItemInputDate, {
              name: AppState.data.translations.formRecurrenceEnd,
              oninput: (e: string): void => {
                if (vnode.attrs.endDateInput !== undefined) {
                  vnode.attrs.endDateInput(e);
                }
              },
              tooltip: AppState.data.translations.formRecurrenceEndTooltip,
              value: vnode.attrs.endDate,
            }),
      ]);
    },
  };
}

import "./Markdown.css";

import { AppState } from "@lib/states/App";
import MarkdownIt from "markdown-it";
import type Token from "markdown-it/lib/token";
import m from "mithril";

import { StringToID } from "../utilities/StringToID";
import type { IconName } from "./Icon";
import { Icon } from "./Icon";
import { Tooltip } from "./Tooltip";

export interface MarkdownParseOutput {
  /** Icon to render from parsing. */
  icon?: IconName;

  /** A link to render from parsing. */
  link?: string;

  /** Name of the link. */
  name: string;
}

export interface MarkdownParser {
  /** A matcher for testing text to run the custom parser against. */
  match: RegExp;
  parse(word: string): MarkdownParseOutput;
}

export interface MarkdownAttrs {
  /** Are the Markdown lines clickable? */
  clickable?: boolean;

  /** Value to render into Markdown. */
  value?: number | null | string;
}

const icon = /icon@\w+(_\w+)?/;

const md = new MarkdownIt({
  linkify: true,
});

export function ParseMarkdownInline(
  config: MarkdownAttrs,
  token: Token,
): m.Children {
  const children: m.Children = [];

  if (token.children !== null) {
    let href = "";

    for (let i = 0; i < token.children.length; i++) {
      const child = token.children[i];
      let words: string[] = [];

      if (child.type === "code_inline") {
        children.push(m(child.tag, child.content));
        continue;
      }

      if (
        child.type !== "text" &&
        child.tag !== "" &&
        child.tag !== "a" &&
        child.tag !== "br" &&
        token.children[i + 1].content !== ""
      ) {
        children.push(m(child.tag, token.children[i + 1].content));
        i += 2;
        continue;
      }

      if (
        child.type === "link_open" &&
        child.attrs !== null &&
        child.attrs.length === 1 &&
        child.attrs[0].length === 2
      ) {
        href = child.attrs[0][1];
      }

      if (child.tag === "br") {
        children.push(m("br"));
        continue;
      }

      if (child.content === "") {
        continue;
      }

      for (const word of child.content.split(" ")) {
        if (word.match(AppState.parserMarkdown.match)) {
          if (words.length > 0) {
            children.push(
              m(
                "span",
                {
                  onclick: (e: m.Event<MouseEvent>): void => {
                    if (config.clickable === true) {
                      if (
                        e.target.style.getPropertyValue("text-decoration") ===
                        "line-through"
                      ) {
                        e.target.style.opacity = "1";
                        e.target.style.setProperty("text-decoration", "");
                      } else {
                        e.target.style.opacity = "0.5";
                        e.target.style.setProperty(
                          "text-decoration",
                          "line-through",
                        );
                      }
                    }
                  },
                },
                `${words.join(" ")} `,
              ),
            );
            words = [];
          }

          const output = AppState.parserMarkdown.parse(word);

          if (output.link === undefined && output.icon !== undefined) {
            children.push(
              m(Tooltip, {
                icon: output.icon,
                value: output.name,
              }),
            );
          } else if (output.link !== undefined && output.name !== "") {
            children.push(
              m(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                output.link.startsWith("/") ? m.route.Link : ("a" as any),
                {
                  class: "GlobalLink",
                  href: output.link,
                  onclick: (e: MouseEvent) => {
                    e.stopPropagation();
                  },
                  options: {
                    state: {
                      key: Date.now(),
                    },
                  },
                },
                [
                  output.icon === undefined
                    ? []
                    : m(Icon, {
                        icon: output.icon,
                      }),
                  m("span", output.name),
                ],
              ),
            );
          } else {
            children.push(m("span", output.name));
          }

          continue;
        } else if (word.match(icon)) {
          if (words.length > 0) {
            children.push(m("span", `${words.join(" ")} `));
            words = [];
          }

          children.push(
            m(Icon, {
              icon: word.split("@")[1].replace(/-/g, "_"),
            }),
          );

          continue;
        }

        words.push(word);
      }

      if (words.length > 0) {
        if (href === "") {
          children.push(
            m(
              "span",
              {
                onclick: (e: m.Event<MouseEvent>): void => {
                  if (config.clickable === true) {
                    if (
                      e.target.style.getPropertyValue("text-decoration") ===
                      "line-through"
                    ) {
                      e.target.style.opacity = "1";
                      e.target.style.setProperty("text-decoration", "");
                    } else {
                      e.target.style.opacity = "0.5";
                      e.target.style.setProperty(
                        "text-decoration",
                        "line-through",
                      );
                    }
                  }
                },
              },
              words.join(" "),
            ),
          );
        } else {
          children.push(
            m(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              href.startsWith("/") ? m.route.Link : ("a" as any),
              {
                class: "GlobalLink",
                href: href,
                onclick: (e: m.Event<MouseEvent>) => {
                  e.stopPropagation();
                },
                target: href.startsWith("/") ? undefined : "_blank",
              },
              m("span", `${words.join(" ")}`),
            ),
          );

          href = "";
        }
      }
    }
  }

  return children;
}

export function ParseMarkdownToken(
  config: MarkdownAttrs,
  index: number,
  tokens: Token[],
): m.Vnode {
  const children: m.Children = [];

  const token = tokens[index];

  for (let i = index + 1; i < tokens.length; i++) {
    if (tokens[i].level === token.level + 1 && tokens[i].nesting >= 0) {
      if (tokens[i].type === "inline") {
        children.push(ParseMarkdownInline(config, tokens[i]));
      } else {
        children.push(ParseMarkdownToken(config, i, tokens));
      }
    } else if (tokens[i].level > token.level) {
      continue;
    } else {
      break;
    }
  }

  if (token.tag.startsWith("a")) {
    return m(
      "a.Markdown",
      {
        href: `${m.route.get()}#${token.content}`,
        onclick: (e: m.Event<MouseEvent>) => {
          e.stopPropagation();
        },
      },
      m(
        token.tag,
        {
          class: "Markdown",
        },
        children,
      ),
    );
  }

  return m(
    token.tag,
    {
      class: "Markdown",
      id: token.tag.includes("h")
        ? `h${StringToID(tokens[index + 1].content)}`
        : undefined,
    },
    token.type === "fence" ? token.content : children,
  );
}

export function ParseMarkdownTokens(
  config: MarkdownAttrs,
  tokens: Token[],
): m.Children {
  const children: m.Children = [];

  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i].level === 0 && tokens[i].nesting >= 0) {
      children.push(ParseMarkdownToken(config, i, tokens));
    }
  }

  return children;
}

export function Markdown(): m.Component<MarkdownAttrs> {
  return {
    view: (vnode): m.Children => {
      return vnode.attrs.value === undefined
        ? []
        : ParseMarkdownTokens(
            vnode.attrs,
            md.parse(`${vnode.attrs.value}`, {}),
          );
    },
  };
}

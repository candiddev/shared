import { AppState } from "@lib/states/App";

import type { MarkdownParseOutput } from "./Markdown";
import { Markdown } from "./Markdown";

describe("Markdown", () => {
  test("formatting", async () => {
    testing.mount(Markdown, {
      clickable: true,
      value: `
example.com/cook/recipes after
> A long **block quote**

\`\`\`
some code 
\`\`\`

here is some \`inline\` code

here is an _italic_ word and a **bold** word

# Heading1
Some stuff yay!

## Heading2
Some stuff yay!

### Heading3
Some stuff yay!

#### Heading4
Some stuff yay!

##### Heading5
Some stuff yay!

###### Heading6
Some stuff yay!

Here is [A link](https://homechart.app), enjoy!
https://homechart.app/cook/recipes

1. Ordered1
    1. Ordered1a
    2. Ordered1b
2. Ordered2
    1. Ordered2a
    2. Ordered2b

* Unordered1
    - Unordered1a
    - Unordered1b
* Unordered2
    - Unordered2a
		- Unordered2b

icon@more_vert
		`,
    });

    // URL
    const urlP = testing.find("p:nth-child(1)");
    const urlA = testing.find("p:nth-child(1) > a");
    testing.text(urlP, "example.com/cook/recipes after");
    testing.text(urlA, "example.com/cook/recipes");
    testing.hasAttribute(urlA, "href", "http://example.com/cook/recipes");
    testing.hasAttribute(urlA, "target", "_blank");

    // Block quote
    const blockQuoteSpan = testing.find("blockquote > p > span");
    testing.text(blockQuoteSpan, "A long ");
    testing.text("blockquote strong", "block quote");

    // Code
    const code = testing.find("code");
    testing.text(code, "some code \n");
    testing.text("p > code", "inline");

    // Italics/bold
    testing.text("em", "italic");
    testing.text("p:nth-of-type(3) > strong", "bold");

    // Headings
    for (let i = 1; i < 7; i++) {
      const h = testing.find(`h${i}`);
      testing.text(h, `Heading${i}`);
      testing.text(h.nextElementSibling as HTMLElement, "Some stuff yay!");
    }
    testing.find("#h-heading1");
    testing.find("#h-heading6");

    // Link
    const link1 = testing.find("p:nth-of-type(10) > a");
    testing.text(link1, "A link");
    testing.hasAttribute(link1, "href", "https://homechart.app");
    const text = link1.nextElementSibling as Element;
    expect(text.tagName).toBe("SPAN");
    testing.text(text, ", enjoy!");
    const link2 = text.nextElementSibling?.nextElementSibling as HTMLElement;
    testing.hasAttribute(link2, "href", "https://homechart.app/cook/recipes");

    // Ordered list
    testing.findAll("ol > li", 6);
    const orderedsub = testing.findAll(
      "ol:nth-of-type(1) > li:nth-of-type(1) > ol:nth-of-type(1) li",
      2,
    );
    testing.text(orderedsub[1], "Ordered1b");
    const orderedsubspan = testing.find("ol > li > ol > li > p > span");
    testing.click(orderedsubspan);
    testing.hasStyle(orderedsubspan, "text-decoration: line-through;");

    // Unordered list
    testing.findAll("ul > li", 6);
    const unorderedsub = testing.findAll(
      "ul:nth-last-child(2) > li:nth-of-type(1) > ul:nth-of-type(1) li",
      2,
    );
    testing.text(unorderedsub[1], "Unordered1b");

    // Icon
    testing.text("i", "more_vert");
  });

  test("parsing", async () => {
    AppState.parserMarkdown = {
      match: /#test/,
      parse: (word: string): MarkdownParseOutput => {
        return word.includes("icon")
          ? {
              icon: "hello",
              name: word.split("/")[1],
            }
          : {
              link: "/test",
              name: word.split("/")[1],
            };
      },
    };

    testing.mount(Markdown, {
      clickable: true,
      value: `
what is this #test/asdf
#test/icon
#teeest/icon
`,
    });

    const a = testing.findAll("a", 1);
    testing.text(a[0], "asdf");
    testing.hasAttribute(a[0], "href", "#!/test");
    testing.click("span");
    testing.hasStyle("span", "text-decoration: line-through;");

    const tooltips = testing.findAll(".Tooltips", 1);
    testing.text(tooltips[0], "helloicon");

    const span = testing.findAll("span", 4);
    testing.text(span[3], "#teeest/icon");
  });
});

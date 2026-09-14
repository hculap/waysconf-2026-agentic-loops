/* ==========================================================================
   GENERATED FILE — do not edit.

   Generator: scripts/build-figma-plugin.mjs
   Sources:   design/tokens/tokens.json, brief/CONTENT.md, design/FIGMA-SPEC.md
   Regenerate: node scripts/build-figma-plugin.mjs

   A Figma plugin sandbox has no filesystem and no network, so every value the
   plugin needs is baked in here. figma-plugin/code.js reads this object and
   contains no colour, no size and no line of copy of its own.
   ========================================================================== */
const TURBINE_DATA = {
  "meta": {
    "project": "TURBINE",
    "file": "TURBINE — Landing page",
    "generator": "scripts/build-figma-plugin.mjs",
    "sources": [
      "design/tokens/tokens.json",
      "brief/CONTENT.md",
      "design/FIGMA-SPEC.md",
      "docs/CANON.md"
    ],
    "note": "Generated file. Do not edit. Run: node scripts/build-figma-plugin.mjs"
  },
  "tokens": {
    "color": [
      {
        "name": "color/accent/arc",
        "hex": "#7C5CFF",
        "rgb": {
          "r": 0.486275,
          "g": 0.360784,
          "b": 1
        },
        "aliasOf": null,
        "description": "Tertiary accent: badges, marquee."
      },
      {
        "name": "color/accent/coolant",
        "hex": "#2FE6D6",
        "rgb": {
          "r": 0.184314,
          "g": 0.901961,
          "b": 0.839216
        },
        "aliasOf": null,
        "description": "Secondary accent: links, active tab."
      },
      {
        "name": "color/accent/sodium",
        "hex": "#FF6A1A",
        "rgb": {
          "r": 1,
          "g": 0.415686,
          "b": 0.101961
        },
        "aliasOf": null,
        "description": "Primary accent, sodium lamp orange, CTAs. Pair with text.on-accent, never with white."
      },
      {
        "name": "color/bg/base",
        "hex": "#0A0B0D",
        "rgb": {
          "r": 0.039216,
          "g": 0.043137,
          "b": 0.05098
        },
        "aliasOf": null,
        "description": "Page background. Also the correct ink on accent and state fills."
      },
      {
        "name": "color/bg/raised",
        "hex": "#1C1F25",
        "rgb": {
          "r": 0.109804,
          "g": 0.121569,
          "b": 0.145098
        },
        "aliasOf": null,
        "description": "Hover states, table header."
      },
      {
        "name": "color/bg/surface",
        "hex": "#131519",
        "rgb": {
          "r": 0.07451,
          "g": 0.082353,
          "b": 0.098039
        },
        "aliasOf": null,
        "description": "Cards, nav background."
      },
      {
        "name": "color/border/strong",
        "hex": "#3D434E",
        "rgb": {
          "r": 0.239216,
          "g": 0.262745,
          "b": 0.305882
        },
        "aliasOf": null,
        "description": "Dividers, the secondary button outline, and the boundary of the email field and the checkbox. 1.98:1 on bg/base: never the focus indicator. The contrast matrix is on the Design system page."
      },
      {
        "name": "color/border/subtle",
        "hex": "#2A2E36",
        "rgb": {
          "r": 0.164706,
          "g": 0.180392,
          "b": 0.211765
        },
        "aliasOf": null,
        "description": "Hairlines, card borders. Decorative only: 1.45:1 on bg.base, below the 3:1 non-text bar, so it must never be the sole indicator of a control."
      },
      {
        "name": "color/state/danger",
        "hex": "#FF4D4D",
        "rgb": {
          "r": 1,
          "g": 0.301961,
          "b": 0.301961
        },
        "aliasOf": null,
        "description": "Sold-out, errors."
      },
      {
        "name": "color/state/success",
        "hex": "#3DDC84",
        "rgb": {
          "r": 0.239216,
          "g": 0.862745,
          "b": 0.517647
        },
        "aliasOf": null,
        "description": "Confirmation."
      },
      {
        "name": "color/text/muted",
        "hex": "#6B7280",
        "rgb": {
          "r": 0.419608,
          "g": 0.447059,
          "b": 0.501961
        },
        "aliasOf": null,
        "description": "4.07:1 on bg/base and 3.78:1 on bg/surface — under 4.5:1 for normal text on both, so the page does not use it. Legal lines and notes are text/secondary."
      },
      {
        "name": "color/text/on-accent",
        "hex": "#0A0B0D",
        "rgb": {
          "r": 0.039216,
          "g": 0.043137,
          "b": 0.05098
        },
        "aliasOf": "color/bg/base",
        "description": "Alias of bg.base. Dark ink, not white, is as the text colour on accent.sodium and on every other accent or state fill."
      },
      {
        "name": "color/text/primary",
        "hex": "#F2F4F7",
        "rgb": {
          "r": 0.94902,
          "g": 0.956863,
          "b": 0.968627
        },
        "aliasOf": null,
        "description": "Headings, body on dark."
      },
      {
        "name": "color/text/secondary",
        "hex": "#A7AEBB",
        "rgb": {
          "r": 0.654902,
          "g": 0.682353,
          "b": 0.733333
        },
        "aliasOf": null,
        "description": "Supporting copy. The correct choice wherever a muted grey is wanted."
      }
    ],
    "scale": [
      {
        "name": "space/1",
        "value": 4,
        "description": "Spacing scale."
      },
      {
        "name": "space/2",
        "value": 8,
        "description": "Spacing scale."
      },
      {
        "name": "space/3",
        "value": 12,
        "description": "Spacing scale."
      },
      {
        "name": "space/4",
        "value": 16,
        "description": "Spacing scale."
      },
      {
        "name": "space/6",
        "value": 24,
        "description": "Spacing scale."
      },
      {
        "name": "space/8",
        "value": 32,
        "description": "Spacing scale."
      },
      {
        "name": "space/12",
        "value": 48,
        "description": "Spacing scale."
      },
      {
        "name": "space/16",
        "value": 64,
        "description": "Spacing scale."
      },
      {
        "name": "space/24",
        "value": 96,
        "description": "Spacing scale."
      },
      {
        "name": "space/32",
        "value": 128,
        "description": "Spacing scale."
      },
      {
        "name": "radius/none",
        "value": 0,
        "description": "Radius."
      },
      {
        "name": "radius/sm",
        "value": 4,
        "description": "Badges, the checkbox, the email field and the table header corners."
      },
      {
        "name": "radius/md",
        "value": 8,
        "description": "Artist cards, the venue image, the comparison table, the access box and the map box."
      },
      {
        "name": "radius/lg",
        "value": 16,
        "description": "Ticket cards."
      },
      {
        "name": "radius/pill",
        "value": 999,
        "description": "Fully rounded ends: buttons, tabs and the tab track, the menu button and the social links."
      },
      {
        "name": "breakpoint/mobile",
        "value": 390,
        "description": "Breakpoint."
      },
      {
        "name": "breakpoint/tablet",
        "value": 768,
        "description": "The nav collapses to a hamburger below this width; the programme table stacks below it."
      },
      {
        "name": "breakpoint/desktop",
        "value": 1440,
        "description": "Breakpoint."
      },
      {
        "name": "size/content-max",
        "value": 1200,
        "description": "Content max width."
      },
      {
        "name": "border/hairline",
        "value": 1,
        "description": "Hairline stroke."
      },
      {
        "name": "border/focus",
        "value": 2,
        "description": "Focus ring stroke."
      },
      {
        "name": "size/touch-min",
        "value": 24,
        "description": "Minimum touch target."
      },
      {
        "name": "size/tap-comfortable",
        "value": 48,
        "description": "Medium buttons, the email field, nav links, the menu button, social links and FAQ questions (56 below 768, 64 from 768). Small buttons and tabs are 40, footer links 37, the checkbox 24 inside a taller label row. Every control clears size/touch-min."
      }
    ],
    "type": {
      "family": [
        {
          "name": "font/display",
          "value": "Space Grotesk",
          "stack": [
            "Space Grotesk",
            "Inter",
            "system-ui",
            "sans-serif"
          ],
          "role": "display"
        },
        {
          "name": "font/body",
          "value": "Inter",
          "stack": [
            "Inter",
            "system-ui",
            "-apple-system",
            "Segoe UI",
            "sans-serif"
          ],
          "role": "body"
        },
        {
          "name": "font/mono",
          "value": "JetBrains Mono",
          "stack": [
            "JetBrains Mono",
            "ui-monospace",
            "SFMono-Regular",
            "Menlo",
            "monospace"
          ],
          "role": "mono"
        }
      ],
      "weight": [
        {
          "name": "weight/regular",
          "value": 400,
          "role": "regular"
        },
        {
          "name": "weight/medium",
          "value": 500,
          "role": "medium"
        },
        {
          "name": "weight/semibold",
          "value": 600,
          "role": "semibold"
        },
        {
          "name": "weight/bold",
          "value": 700,
          "role": "bold"
        }
      ],
      "size": [
        {
          "name": "text/xs",
          "value": 12,
          "rem": 0.75
        },
        {
          "name": "text/sm",
          "value": 14,
          "rem": 0.875
        },
        {
          "name": "text/base",
          "value": 16,
          "rem": 1
        },
        {
          "name": "text/lg",
          "value": 18,
          "rem": 1.125
        },
        {
          "name": "text/xl",
          "value": 20,
          "rem": 1.25
        },
        {
          "name": "text/2xl",
          "value": 24,
          "rem": 1.5
        },
        {
          "name": "text/3xl",
          "value": 32,
          "rem": 2
        },
        {
          "name": "text/4xl",
          "value": 40,
          "rem": 2.5
        },
        {
          "name": "text/5xl",
          "value": 56,
          "rem": 3.5
        },
        {
          "name": "text/6xl",
          "value": 72,
          "rem": 4.5
        },
        {
          "name": "text/7xl",
          "value": 96,
          "rem": 6
        }
      ],
      "leading": [
        {
          "name": "leading/none",
          "percent": 100,
          "css": "1"
        },
        {
          "name": "leading/tight",
          "percent": 108,
          "css": "1.08"
        },
        {
          "name": "leading/snug",
          "percent": 125,
          "css": "1.25"
        },
        {
          "name": "leading/normal",
          "percent": 150,
          "css": "1.5"
        },
        {
          "name": "leading/relaxed",
          "percent": 162.5,
          "css": "1.625"
        }
      ],
      "tracking": [
        {
          "name": "tracking/tight",
          "em": -0.02,
          "percent": -2,
          "source": "all display type"
        },
        {
          "name": "tracking/normal",
          "em": 0,
          "percent": 0,
          "source": "—"
        },
        {
          "name": "tracking/wide",
          "em": 0.06,
          "percent": 6,
          "source": "eyebrows and mono tags"
        },
        {
          "name": "tracking/wordmark",
          "em": 0.18,
          "percent": 18,
          "source": "wordmark lockup only"
        }
      ]
    },
    "responsive": {
      "modes": [
        "Mobile 390",
        "Tablet 768",
        "Desktop 1440"
      ],
      "variables": [
        {
          "name": "responsive/gutter",
          "values": [
            24,
            48,
            48
          ],
          "note": "24 at 390, 48 from 768 up"
        },
        {
          "name": "responsive/container-max",
          "values": [
            342,
            672,
            1104
          ],
          "note": "size/content-max (1200) includes the gutters: 1200 − 2 × 48"
        },
        {
          "name": "responsive/section-pad-y",
          "values": [
            64,
            96,
            128
          ],
          "note": "space/16, space/24, space/32"
        },
        {
          "name": "responsive/grid-columns",
          "values": [
            4,
            8,
            12
          ],
          "note": ""
        },
        {
          "name": "responsive/grid-gutter",
          "values": [
            16,
            24,
            24
          ],
          "note": ""
        },
        {
          "name": "responsive/type/wordmark-hero",
          "values": [
            40,
            72,
            96
          ],
          "alias": [
            "text/4xl",
            "text/6xl",
            "text/7xl"
          ]
        },
        {
          "name": "responsive/type/section-h2",
          "values": [
            32,
            40,
            56
          ],
          "alias": [
            "text/3xl",
            "text/4xl",
            "text/5xl"
          ]
        },
        {
          "name": "responsive/type/subsection-h3",
          "values": [
            24,
            24,
            32
          ],
          "alias": [
            "text/2xl",
            "text/2xl",
            "text/3xl"
          ]
        },
        {
          "name": "responsive/type/lead",
          "values": [
            18,
            18,
            20
          ],
          "alias": [
            "text/lg",
            "text/lg",
            "text/xl"
          ]
        }
      ]
    },
    "fonts": [
      {
        "family": "Space Grotesk",
        "weight": 700,
        "candidates": [
          "Bold"
        ]
      },
      {
        "family": "Space Grotesk",
        "weight": 500,
        "candidates": [
          "Medium"
        ]
      },
      {
        "family": "Inter",
        "weight": 400,
        "candidates": [
          "Regular"
        ]
      },
      {
        "family": "Inter",
        "weight": 500,
        "candidates": [
          "Medium"
        ]
      },
      {
        "family": "Inter",
        "weight": 600,
        "candidates": [
          "Semi Bold",
          "SemiBold",
          "Medium"
        ]
      },
      {
        "family": "JetBrains Mono",
        "weight": 400,
        "candidates": [
          "Regular"
        ]
      },
      {
        "family": "JetBrains Mono",
        "weight": 700,
        "candidates": [
          "Bold"
        ]
      }
    ],
    "roleFamily": {
      "display": "Space Grotesk",
      "body": "Inter",
      "mono": "JetBrains Mono"
    }
  },
  "contrast": {
    "swatches": [
      {
        "name": "color/accent/arc",
        "hex": "#7C5CFF",
        "ratio": 4.53,
        "label": "4.53:1 on bg/base · PASS-AA"
      },
      {
        "name": "color/accent/coolant",
        "hex": "#2FE6D6",
        "ratio": 12.57,
        "label": "12.57:1 on bg/base · PASS-AA"
      },
      {
        "name": "color/accent/sodium",
        "hex": "#FF6A1A",
        "ratio": 6.87,
        "label": "6.87:1 on bg/base · PASS-AA"
      },
      {
        "name": "color/bg/base",
        "hex": "#0A0B0D",
        "ratio": 1,
        "label": "the ground"
      },
      {
        "name": "color/bg/raised",
        "hex": "#1C1F25",
        "ratio": 1.19,
        "label": "1.19:1 on bg/base · FAIL"
      },
      {
        "name": "color/bg/surface",
        "hex": "#131519",
        "ratio": 1.08,
        "label": "1.08:1 on bg/base · FAIL"
      },
      {
        "name": "color/border/strong",
        "hex": "#3D434E",
        "ratio": 1.98,
        "label": "1.98:1 on bg/base · FAIL"
      },
      {
        "name": "color/border/subtle",
        "hex": "#2A2E36",
        "ratio": 1.45,
        "label": "1.45:1 on bg/base · FAIL"
      },
      {
        "name": "color/state/danger",
        "hex": "#FF4D4D",
        "ratio": 6.02,
        "label": "6.02:1 on bg/base · PASS-AA"
      },
      {
        "name": "color/state/success",
        "hex": "#3DDC84",
        "ratio": 11.03,
        "label": "11.03:1 on bg/base · PASS-AA"
      },
      {
        "name": "color/text/muted",
        "hex": "#6B7280",
        "ratio": 4.07,
        "label": "4.07:1 on bg/base · PASS-AA-LARGE"
      },
      {
        "name": "color/text/primary",
        "hex": "#F2F4F7",
        "ratio": 17.87,
        "label": "17.87:1 on bg/base · PASS-AA"
      },
      {
        "name": "color/text/secondary",
        "hex": "#A7AEBB",
        "ratio": 8.83,
        "label": "8.83:1 on bg/base · PASS-AA"
      }
    ],
    "pairs": [
      {
        "fg": "color/text/primary",
        "bg": "color/bg/base",
        "fgHex": "#F2F4F7",
        "bgHex": "#0A0B0D",
        "ratio": 17.87,
        "verdict": "PASS-AA",
        "note": "Pass",
        "label": "text/primary on bg/base"
      },
      {
        "fg": "color/text/primary",
        "bg": "color/bg/surface",
        "fgHex": "#F2F4F7",
        "bgHex": "#131519",
        "ratio": 16.59,
        "verdict": "PASS-AA",
        "note": "Pass",
        "label": "text/primary on bg/surface"
      },
      {
        "fg": "color/text/secondary",
        "bg": "color/bg/base",
        "fgHex": "#A7AEBB",
        "bgHex": "#0A0B0D",
        "ratio": 8.83,
        "verdict": "PASS-AA",
        "note": "Pass",
        "label": "text/secondary on bg/base"
      },
      {
        "fg": "color/bg/base",
        "bg": "color/accent/sodium",
        "fgHex": "#0A0B0D",
        "bgHex": "#FF6A1A",
        "ratio": 6.87,
        "verdict": "PASS-AA",
        "note": "Pass — this is the button",
        "label": "bg/base on accent/sodium"
      },
      {
        "fg": "color/text/muted",
        "bg": "color/bg/base",
        "fgHex": "#6B7280",
        "bgHex": "#0A0B0D",
        "ratio": 4.07,
        "verdict": "PASS-AA-LARGE",
        "note": "Fail for body copy. Legal and footer only.",
        "label": "text/muted on bg/base"
      },
      {
        "fg": "#FFFFFF",
        "bg": "color/accent/sodium",
        "fgHex": "#FFFFFF",
        "bgHex": "#FF6A1A",
        "ratio": 2.87,
        "verdict": "FAIL",
        "note": "Fail. Never white on orange.",
        "label": "#FFFFFF on accent/sodium"
      }
    ]
  },
  "textStyles": [
    {
      "name": "Display/Wordmark-Nav",
      "family": "display",
      "weight": 700,
      "size": "text/xl",
      "px": 20,
      "leading": "leading/snug",
      "tracking": "tracking/wordmark",
      "textCase": "UPPER",
      "usedBy": "Nav and footer lockup",
      "figmaFamily": "Space Grotesk",
      "styleCandidates": [
        "Bold"
      ]
    },
    {
      "name": "Display/Wordmark-Hero/390",
      "family": "display",
      "weight": 700,
      "size": "text/4xl",
      "px": 40,
      "leadingPercent": 100,
      "tracking": "tracking/wordmark",
      "textCase": "UPPER",
      "usedBy": "Hero h1, at below 768",
      "figmaFamily": "Space Grotesk",
      "styleCandidates": [
        "Bold"
      ]
    },
    {
      "name": "Display/Wordmark-Hero/768",
      "family": "display",
      "weight": 700,
      "size": "text/6xl",
      "px": 72,
      "leadingPercent": 100,
      "tracking": "tracking/wordmark",
      "textCase": "UPPER",
      "usedBy": "Hero h1, at 768 to 1439",
      "figmaFamily": "Space Grotesk",
      "styleCandidates": [
        "Bold"
      ]
    },
    {
      "name": "Display/Wordmark-Hero/1440",
      "family": "display",
      "weight": 700,
      "size": "text/7xl",
      "px": 96,
      "leadingPercent": 100,
      "tracking": "tracking/wordmark",
      "textCase": "UPPER",
      "usedBy": "Hero h1, at 1440 and up",
      "figmaFamily": "Space Grotesk",
      "styleCandidates": [
        "Bold"
      ]
    },
    {
      "name": "Display/Section/390",
      "family": "display",
      "weight": 700,
      "size": "text/3xl",
      "px": 32,
      "leadingPercent": 120,
      "tracking": "tracking/tight",
      "textCase": "ORIGINAL",
      "usedBy": "Every section h2, at below 768",
      "figmaFamily": "Space Grotesk",
      "styleCandidates": [
        "Bold"
      ]
    },
    {
      "name": "Display/Section/768",
      "family": "display",
      "weight": 700,
      "size": "text/4xl",
      "px": 40,
      "leadingPercent": 111.11,
      "tracking": "tracking/tight",
      "textCase": "ORIGINAL",
      "usedBy": "Every section h2, at 768 to 1439",
      "figmaFamily": "Space Grotesk",
      "styleCandidates": [
        "Bold"
      ]
    },
    {
      "name": "Display/Section/1440",
      "family": "display",
      "weight": 700,
      "size": "text/5xl",
      "px": 56,
      "leadingPercent": 100,
      "tracking": "tracking/tight",
      "textCase": "ORIGINAL",
      "usedBy": "Every section h2, at 1440 and up",
      "figmaFamily": "Space Grotesk",
      "styleCandidates": [
        "Bold"
      ]
    },
    {
      "name": "Display/Subsection/390",
      "family": "display",
      "weight": 500,
      "size": "text/2xl",
      "px": 24,
      "leadingPercent": 133.33,
      "tracking": "tracking/tight",
      "textCase": "ORIGINAL",
      "usedBy": "Day heading, Getting here, ticket tier, at below 768",
      "figmaFamily": "Space Grotesk",
      "styleCandidates": [
        "Medium"
      ]
    },
    {
      "name": "Display/Subsection/768",
      "family": "display",
      "weight": 500,
      "size": "text/2xl",
      "px": 24,
      "leadingPercent": 133.33,
      "tracking": "tracking/tight",
      "textCase": "ORIGINAL",
      "usedBy": "Day heading, Getting here, ticket tier, at 768 to 1439",
      "figmaFamily": "Space Grotesk",
      "styleCandidates": [
        "Medium"
      ]
    },
    {
      "name": "Display/Subsection/1440",
      "family": "display",
      "weight": 500,
      "size": "text/3xl",
      "px": 32,
      "leadingPercent": 120,
      "tracking": "tracking/tight",
      "textCase": "ORIGINAL",
      "usedBy": "Day heading, Getting here, ticket tier, at 1440 and up",
      "figmaFamily": "Space Grotesk",
      "styleCandidates": [
        "Medium"
      ]
    },
    {
      "name": "Body/Lead/390",
      "family": "body",
      "weight": 400,
      "size": "text/lg",
      "px": 18,
      "leadingPercent": 162.5,
      "tracking": "tracking/normal",
      "textCase": "ORIGINAL",
      "usedBy": "Hero second line, section intro, newsletter pitch, at below 768",
      "figmaFamily": "Inter",
      "styleCandidates": [
        "Regular"
      ]
    },
    {
      "name": "Body/Lead/768",
      "family": "body",
      "weight": 400,
      "size": "text/lg",
      "px": 18,
      "leadingPercent": 162.5,
      "tracking": "tracking/normal",
      "textCase": "ORIGINAL",
      "usedBy": "Hero second line, section intro, newsletter pitch, at 768 to 1439",
      "figmaFamily": "Inter",
      "styleCandidates": [
        "Regular"
      ]
    },
    {
      "name": "Body/Lead/1440",
      "family": "body",
      "weight": 400,
      "size": "text/xl",
      "px": 20,
      "leadingPercent": 162.5,
      "tracking": "tracking/normal",
      "textCase": "ORIGINAL",
      "usedBy": "Hero second line, section intro, newsletter pitch, at 1440 and up",
      "figmaFamily": "Inter",
      "styleCandidates": [
        "Regular"
      ]
    },
    {
      "name": "Display/Card-Title-Large",
      "family": "display",
      "weight": 500,
      "size": "text/2xl",
      "px": 24,
      "leadingPercent": 130,
      "tracking": "tracking/tight",
      "textCase": "ORIGINAL",
      "usedBy": "Headliner name from 768",
      "figmaFamily": "Space Grotesk",
      "styleCandidates": [
        "Medium"
      ]
    },
    {
      "name": "Display/Card-Title-Small",
      "family": "display",
      "weight": 500,
      "size": "text/base",
      "px": 16,
      "leadingPercent": 130,
      "tracking": "tracking/tight",
      "textCase": "ORIGINAL",
      "usedBy": "Every artist name below 768",
      "figmaFamily": "Space Grotesk",
      "styleCandidates": [
        "Medium"
      ]
    },
    {
      "name": "Display/Card-Title",
      "family": "display",
      "weight": 500,
      "size": "text/xl",
      "px": 20,
      "leadingPercent": 130,
      "tracking": "tracking/tight",
      "textCase": "ORIGINAL",
      "usedBy": "Artist name, FAQ question",
      "figmaFamily": "Space Grotesk",
      "styleCandidates": [
        "Medium"
      ]
    },
    {
      "name": "Display/Price",
      "family": "display",
      "weight": 700,
      "size": "text/4xl",
      "px": 40,
      "leading": "leading/tight",
      "tracking": "tracking/tight",
      "textCase": "ORIGINAL",
      "usedBy": "Ticket price",
      "figmaFamily": "Space Grotesk",
      "styleCandidates": [
        "Bold"
      ]
    },
    {
      "name": "Body/Base",
      "family": "body",
      "weight": 400,
      "size": "text/base",
      "px": 16,
      "leading": "leading/relaxed",
      "tracking": "tracking/normal",
      "textCase": "ORIGINAL",
      "usedBy": "Default paragraph",
      "figmaFamily": "Inter",
      "styleCandidates": [
        "Regular"
      ]
    },
    {
      "name": "Body/Base-Medium",
      "family": "body",
      "weight": 500,
      "size": "text/base",
      "px": 16,
      "leading": "leading/relaxed",
      "tracking": "tracking/normal",
      "textCase": "ORIGINAL",
      "usedBy": "Nav link, emphasis",
      "figmaFamily": "Inter",
      "styleCandidates": [
        "Medium"
      ]
    },
    {
      "name": "Body/Small",
      "family": "body",
      "weight": 400,
      "size": "text/sm",
      "px": 14,
      "leading": "leading/normal",
      "tracking": "tracking/normal",
      "textCase": "ORIGINAL",
      "usedBy": "Card meta, captions, helper text",
      "figmaFamily": "Inter",
      "styleCandidates": [
        "Regular"
      ]
    },
    {
      "name": "Body/Small-Medium",
      "family": "body",
      "weight": 500,
      "size": "text/sm",
      "px": 14,
      "leading": "leading/normal",
      "tracking": "tracking/normal",
      "textCase": "ORIGINAL",
      "usedBy": "Tab label, table cell emphasis",
      "figmaFamily": "Inter",
      "styleCandidates": [
        "Medium"
      ]
    },
    {
      "name": "Label/Eyebrow",
      "family": "body",
      "weight": 600,
      "size": "text/xs",
      "px": 12,
      "leadingPercent": 133,
      "tracking": "tracking/wide",
      "textCase": "UPPER",
      "usedBy": "Section eyebrow",
      "figmaFamily": "Inter",
      "styleCandidates": [
        "Semi Bold",
        "SemiBold",
        "Medium"
      ]
    },
    {
      "name": "Label/Button",
      "family": "body",
      "weight": 600,
      "size": "text/base",
      "px": 16,
      "leading": "leading/normal",
      "tracking": "tracking/normal",
      "textCase": "ORIGINAL",
      "usedBy": "Button md",
      "figmaFamily": "Inter",
      "styleCandidates": [
        "Semi Bold",
        "SemiBold",
        "Medium"
      ]
    },
    {
      "name": "Label/Button-Small",
      "family": "body",
      "weight": 600,
      "size": "text/sm",
      "px": 14,
      "leadingPercent": 143,
      "tracking": "tracking/normal",
      "textCase": "ORIGINAL",
      "usedBy": "Button sm, nav CTA, tab",
      "figmaFamily": "Inter",
      "styleCandidates": [
        "Semi Bold",
        "SemiBold",
        "Medium"
      ]
    },
    {
      "name": "Mono/Time",
      "family": "mono",
      "weight": 400,
      "size": "text/sm",
      "px": 14,
      "leadingPercent": 143,
      "tracking": "tracking/normal",
      "textCase": "ORIGINAL",
      "usedBy": "Timetable times, token names",
      "figmaFamily": "JetBrains Mono",
      "styleCandidates": [
        "Regular"
      ]
    },
    {
      "name": "Mono/Tag",
      "family": "mono",
      "weight": 700,
      "size": "text/xs",
      "px": 12,
      "leadingPercent": 133,
      "tracking": "tracking/wide",
      "textCase": "UPPER",
      "usedBy": "Ticker tags, badges",
      "figmaFamily": "JetBrains Mono",
      "styleCandidates": [
        "Bold"
      ]
    },
    {
      "name": "Legal/Fine",
      "family": "body",
      "weight": 400,
      "size": "text/xs",
      "px": 12,
      "leading": "leading/normal",
      "tracking": "tracking/normal",
      "textCase": "ORIGINAL",
      "usedBy": "Footer legal, fiction disclaimer",
      "figmaFamily": "Inter",
      "styleCandidates": [
        "Regular"
      ]
    }
  ],
  "pages": [
    "Cover",
    "Design system",
    "Desktop 1440",
    "Tablet 768",
    "Mobile 390",
    "Exports"
  ],
  "eyebrows": {
    "faq": "Before you come"
  },
  "cover": {
    "width": 1600,
    "height": 960,
    "padding": 128,
    "gap": 32,
    "subtitle": "Landing page — design file",
    "meta": "11–13 June 2027 · The Powerhouse, Hall E · Kraków",
    "provenance": "Fictional festival. Teaching material for WaysConf 2026."
  },
  "skipLink": {
    "height": 40,
    "padX": 16,
    "padY": 12,
    "top": 8
  },
  "breakpoints": [
    {
      "key": "desktop",
      "width": 1440,
      "mode": "Desktop 1440",
      "frame": "TURBINE / Desktop 1440",
      "page": "Desktop 1440",
      "gutter": 48,
      "sectionPadY": 128,
      "container": 1104,
      "gridColumns": 12,
      "gridGutter": 24,
      "type": {
        "wordmarkHero": 96,
        "sectionH2": 56,
        "sectionH2Leading": 100,
        "subsectionH3": 32,
        "subsectionH3Leading": 120,
        "lead": 20
      },
      "nav": {
        "layout": "full",
        "height": 72,
        "padX": 48,
        "padY": 12,
        "linkGap": 32,
        "linkStyle": "Body/Base-Medium"
      },
      "hero": {
        "height": 780,
        "padX": 168,
        "padTop": 160,
        "padBottom": 96,
        "gap": 32,
        "ctaDirection": "HORIZONTAL",
        "ctaGap": 16,
        "ctaFill": false
      },
      "ticker": {
        "height": 56,
        "gap": 24
      },
      "lineup": {
        "columns": 4,
        "cardWidth": 258,
        "cardSizing": "FIXED",
        "metaDirection": "HORIZONTAL",
        "headlinerNameSize": 24
      },
      "programme": {
        "layout": "table-row",
        "showHead": true
      },
      "venue": {
        "direction": "HORIZONTAL",
        "columnWidth": 528,
        "imageAspect": 1.3333333333333333,
        "mapWidth": 528,
        "mapHeight": 320,
        "travelColumns": 1
      },
      "tickets": {
        "direction": "HORIZONTAL",
        "cardWidth": 352,
        "cardSizing": "FIXED",
        "cardPad": 24,
        "highlightPad": 32,
        "comparisonCell": 120,
        "comparison": "table"
      },
      "faq": {
        "listWidth": 800,
        "listSizing": "FIXED",
        "triggerPadY": 24,
        "minHeight": 64,
        "answerPadRight": 48
      },
      "newsletter": {
        "width": 655,
        "formWidth": 560,
        "sizing": "FIXED"
      },
      "footer": {
        "layout": "wide",
        "columnWidth": 156,
        "columnGap": 24,
        "brandWidth": 384
      }
    },
    {
      "key": "tablet",
      "width": 768,
      "mode": "Tablet 768",
      "frame": "TURBINE / Tablet 768",
      "page": "Tablet 768",
      "gutter": 48,
      "sectionPadY": 96,
      "container": 672,
      "gridColumns": 8,
      "gridGutter": 24,
      "type": {
        "wordmarkHero": 72,
        "sectionH2": 40,
        "sectionH2Leading": 111.11,
        "subsectionH3": 24,
        "subsectionH3Leading": 133.33,
        "lead": 18
      },
      "nav": {
        "layout": "full",
        "height": 64,
        "padX": 48,
        "padY": 12,
        "linkGap": 24,
        "linkStyle": "Body/Small-Medium"
      },
      "hero": {
        "height": 700,
        "padX": 48,
        "padTop": 120,
        "padBottom": 64,
        "gap": 32,
        "ctaDirection": "HORIZONTAL",
        "ctaGap": 16,
        "ctaFill": false
      },
      "ticker": {
        "height": 48,
        "gap": 24
      },
      "lineup": {
        "columns": 3,
        "cardWidth": 208,
        "cardSizing": "FIXED",
        "metaDirection": "HORIZONTAL",
        "headlinerNameSize": 24
      },
      "programme": {
        "layout": "table-row",
        "showHead": true
      },
      "venue": {
        "direction": "VERTICAL",
        "columnWidth": 672,
        "imageAspect": 1.7777777777777777,
        "mapWidth": 672,
        "mapHeight": 280,
        "travelColumns": 2
      },
      "tickets": {
        "direction": "VERTICAL",
        "cardWidth": 480,
        "cardSizing": "FILL",
        "cardPad": 24,
        "highlightPad": 24,
        "comparisonCell": 96,
        "comparison": "table"
      },
      "faq": {
        "listWidth": 672,
        "listSizing": "FILL",
        "triggerPadY": 24,
        "minHeight": 64,
        "answerPadRight": 48
      },
      "newsletter": {
        "width": 590,
        "formWidth": 480,
        "sizing": "FIXED"
      },
      "footer": {
        "layout": "stacked",
        "columnWidth": 324,
        "columnGap": 24,
        "brandWidth": 672
      }
    },
    {
      "key": "mobile",
      "width": 390,
      "mode": "Mobile 390",
      "frame": "TURBINE / Mobile 390",
      "page": "Mobile 390",
      "gutter": 24,
      "sectionPadY": 64,
      "container": 342,
      "gridColumns": 4,
      "gridGutter": 16,
      "type": {
        "wordmarkHero": 40,
        "sectionH2": 32,
        "sectionH2Leading": 120,
        "subsectionH3": 24,
        "subsectionH3Leading": 133.33,
        "lead": 18
      },
      "nav": {
        "layout": "compact",
        "height": 64,
        "padX": 24,
        "padY": 8,
        "linkGap": 24,
        "linkStyle": "Body/Small-Medium"
      },
      "hero": {
        "height": 600,
        "padX": 24,
        "padTop": 96,
        "padBottom": 64,
        "gap": 16,
        "ctaDirection": "VERTICAL",
        "ctaGap": 12,
        "ctaFill": true
      },
      "ticker": {
        "height": 44,
        "gap": 16
      },
      "lineup": {
        "columns": 2,
        "cardWidth": 163,
        "cardSizing": "FIXED",
        "metaDirection": "VERTICAL",
        "headlinerNameSize": 16
      },
      "programme": {
        "layout": "stacked",
        "showHead": false
      },
      "venue": {
        "direction": "VERTICAL",
        "columnWidth": 342,
        "imageAspect": 1.3333333333333333,
        "mapWidth": 342,
        "mapHeight": 200,
        "travelColumns": 1
      },
      "tickets": {
        "direction": "VERTICAL",
        "cardWidth": 342,
        "cardSizing": "FILL",
        "cardPad": 16,
        "highlightPad": 16,
        "comparisonCell": 0,
        "comparison": "lists"
      },
      "faq": {
        "listWidth": 342,
        "listSizing": "FILL",
        "triggerPadY": 16,
        "minHeight": 56,
        "answerPadRight": 0
      },
      "newsletter": {
        "width": 342,
        "formWidth": 342,
        "sizing": "FILL"
      },
      "footer": {
        "layout": "compact",
        "columnWidth": 163,
        "columnGap": 16,
        "brandWidth": 342
      }
    }
  ],
  "annotations": [
    {
      "target": "section-nav",
      "text": "nav landmark, aria-label=\"Primary\". Wordmark links to #top. Below 768 the links collapse behind a button whose accessible name toggles Open menu / Close menu."
    },
    {
      "target": "lineup/tabs",
      "text": "role=tablist with aria-label=\"Filter the lineup by day\". Each tab role=tab with aria-selected. The panel is lineup/grid. With JavaScript off the tabs are hidden and all twelve cards show."
    },
    {
      "target": "programme/days",
      "text": "One table per day with a caption. th scope=col for the stage columns, th scope=row for the time. An empty cell carries a visually hidden \"No set\"; the visible em dash is aria-hidden."
    },
    {
      "target": "faq/trigger",
      "text": "h3 > button, aria-expanded, aria-controls -> faq/answer id. Without JavaScript every answer is open."
    },
    {
      "target": "newsletter/form",
      "text": "Visible label above the input, never a placeholder standing in for it. Consent unchecked on load. Messages announced politely, never as an alert dialog."
    }
  ],
  "behaviour": [
    {
      "title": "Widths",
      "rows": [
        [
          "Breakpoints",
          "Three layouts: below 768 (drawn at 390), 768 to 1439 (drawn at 768), 1440 and up (drawn at 1440). Everything changes at exactly 768 and 1440; between those widths the layout stretches."
        ],
        [
          "Content column",
          "Side gutters are 24 below 768 and 48 from 768. The column is at most 1104 wide and centred, so above 1440 the extra width goes to the margins. The hero photo, the ticker and every section background run edge to edge."
        ],
        [
          "Below 390",
          "Nothing is fixed wider than the screen. The 390 layout narrows."
        ],
        [
          "Type",
          "Section h2 32 / 40 / 56 with line height 1.2 / 1.11 / 1.0; h3 24 / 24 / 32; lead 18 / 18 / 20; hero TURBINE 40 / 72 / 96 (below 768 / 768 to 1439 / 1440 and up). Each size is its own text style, for example Display/Section/390, /768 and /1440."
        ],
        [
          "Section spacing",
          "Padding above and below each section is 64 / 96 / 128. Inside a section the heading block and the content are 48 apart."
        ]
      ]
    },
    {
      "title": "Layout per section",
      "rows": [
        [
          "Nav",
          "Height 64 below 1440 and 72 at 1440. Below 768 the four links and the Tickets button collapse behind the menu button; from 768 they sit in one row. The bar is sticky: it stays at the top of the window while the page scrolls."
        ],
        [
          "Hero",
          "Minimum height 600 / 700 / 780, content at the bottom, aligned to the same content column as every other section. The two buttons stack at full width below 768 and sit side by side from 768."
        ],
        [
          "Lineup",
          "Two columns below 768 (gap 16), three from 768 (gap 24), four at 1440. Every card in a row stretches to the tallest card in that row; the content stays at the top."
        ],
        [
          "Programme",
          "From 768: one table per day, four even columns, no zebra striping. Below 768: one line per set, time · stage · artist, and stages with no set are left out."
        ],
        [
          "Venue",
          "The image and the text stack below 1440 and sit in two columns at 1440. The image is 4:3 below 768, 16:9 from 768 to 1439 and 4:3 at 1440, cropped from the centre."
        ],
        [
          "Tickets",
          "One column, at most 480 wide and centred, below 1440; three across at 1440, all the same height. The comparison is a table from 768 and one list per tier below 768."
        ],
        [
          "FAQ",
          "The list is 800 wide and centred at 1440 and full width below."
        ],
        [
          "Newsletter",
          "Heading and pitch are centred. The form is 480 wide from 768, 560 at 1440, and full width below 768."
        ],
        [
          "Footer",
          "Below 1440 the brand takes the first row and the four link columns sit two across; at 1440 the brand (384) and the four columns share one row. Below 1440 the social links sit above the legal lines; at 1440 the legal lines are on the left and the social links on the right."
        ]
      ]
    },
    {
      "title": "Hover and focus",
      "rows": [
        [
          "Buttons",
          "A text/primary wash at 10% over the whole button, under the label (drawn in the State=hover variants). The ghost button underlines its label instead."
        ],
        [
          "Links",
          "Nav links and social links go from text/secondary to text/primary. Footer links and FAQ questions go from text/primary to accent/coolant. The scroll cue goes from text/secondary to text/primary."
        ],
        [
          "Cards and tabs",
          "Artist cards: the border goes from border/subtle to border/strong and a 10% text/primary wash covers the portrait. Unselected tabs get a bg/raised fill and a text/primary label. The menu button gets a bg/raised fill. Ticket cards, the email field and the checkbox do not change on hover."
        ],
        [
          "Timing",
          "Every colour change takes 150ms. Nothing on the page runs longer."
        ],
        [
          "Focus",
          "Every focusable element shows the same ring: a 2px accent/coolant outline, 2px outside the element, following its corner radius. That covers links, buttons, tabs, the email field, the checkbox, the wordmark, social links, the scroll cue and FAQ questions. Nothing else changes on focus."
        ],
        [
          "Skip link",
          "The first focusable element. Hidden above the window until it is focused, then shown 16 from the top and left of the page: accent/sodium fill, bg/base text, radius/md, padding 12 × 16."
        ],
        [
          "Active nav link",
          "There is none. No link is highlighted, and nothing changes as the page scrolls."
        ]
      ]
    },
    {
      "title": "Behaviour",
      "rows": [
        [
          "Mobile menu",
          "Closed: the wordmark and a 48 × 48 menu button with a three-line icon in accent/coolant. Open: the bar grows downwards inside the page, pushing the content down rather than covering it — the four links stacked, 48 tall each, then the Tickets button. It opens and closes instantly. Escape closes it and returns focus to the button, following a link closes it, and focus is not trapped. Drawn open next to the Mobile 390 frame."
        ],
        [
          "Lineup filter",
          "All is selected on load. Choosing a day shows only that day's four cards, in the same order, and rewrites the status line under the tabs. The arrow keys move between tabs and select as they go; Home and End jump to the first and last. Only the selected tab is in the Tab order. Without JavaScript the tabs are not shown and all twelve cards are."
        ],
        [
          "FAQ",
          "Every question is closed on load. Each one opens and closes on its own, and several can be open at once. The chevron turns 180° in 150ms; the answer appears without animation. Without JavaScript every answer is open."
        ],
        [
          "Newsletter",
          "Nothing is checked while typing. On submit, an empty or malformed address and an unticked box each show their message directly under the control, in state/danger at 14px, and the control's border turns state/danger. Focus moves to the first control with a problem, and a message clears as soon as its control changes. When both are valid the success line appears under the button in state/success, and the form stays as it is. Nothing is sent."
        ],
        [
          "Ticker",
          "Moves right to left without stopping: one full set of tags every 60 seconds, looping without a jump. It does not pause on hover. Under reduced motion it stands still and the strip can be scrolled sideways; the Motion=static variant is that still strip, which is why it looks the same."
        ],
        [
          "Scroll cue",
          "The chevron bounces: once a second it rises by a quarter of its height and comes back. It does not move under reduced motion."
        ],
        [
          "Reduced motion",
          "With prefers-reduced-motion set, nothing animates or transitions, and in-page links jump instead of scrolling smoothly."
        ],
        [
          "Sold out",
          "The Full Pass + Workshop card switches to TicketCard Variant=sold-out when no workshop places are left. Its button then reads Workshop sold out and stays focusable. Today places are left, so the page shows the available card."
        ]
      ]
    },
    {
      "title": "Images, fonts and icons",
      "rows": [
        [
          "Hero photo",
          "Covers the section at every width, centred. No focal point is set, so each width keeps the middle of the photo. Over it, a bottom-to-top gradient of bg/base at 95%, 70% and 30%; below 768 an extra flat bg/base at 50%; from 768 a left-to-right gradient of bg/base at 90%, 55% and 0%. Contrast of the text over the photo is measured on the rendered page, not in this file."
        ],
        [
          "Artist portraits",
          "4:5, cropped from the centre. A badge sits 12 from the top left: Headliner on accent/arc, Main and Support on bg/raised."
        ],
        [
          "Fonts",
          "Space Grotesk 500 and 700, Inter 400, 500 and 600, and JetBrains Mono 400 and 700, all free under the SIL Open Font License from Google Fonts. A Figma file cannot carry font files; the page serves its own copies."
        ],
        [
          "Icons",
          "Every icon is a vector in this file: chevron, tick, menu, info, Instagram, Bandcamp and Mastodon. Select one and export it as SVG. Icons are aria-hidden on the page."
        ],
        [
          "Photo copies",
          "A saved .fig also holds Figma's own reduced copies of the photos, which nothing in the design uses."
        ],
        [
          "Addresses",
          "turbine.fm, tickets.turbine.fm and the social accounts are fictional. The page links to them exactly as written."
        ]
      ]
    }
  ],
  "favicon": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 32 32\" role=\"img\" aria-label=\"TURBINE\">\n  <title>TURBINE</title>\n  <rect width=\"32\" height=\"32\" rx=\"6\" fill=\"#0A0B0D\"/>\n  <!-- Four blades around a hub: a turbine, reduced until it still reads at 16px. -->\n  <g fill=\"none\" stroke=\"#FF6A1A\" stroke-width=\"2.6\" stroke-linecap=\"round\">\n    <path d=\"M16 5.5v6\"/>\n    <path d=\"M16 20.5v6\"/>\n    <path d=\"M5.5 16h6\"/>\n    <path d=\"M20.5 16h6\"/>\n  </g>\n  <g fill=\"none\" stroke=\"#2FE6D6\" stroke-width=\"1.8\" stroke-linecap=\"round\" opacity=\"0.85\">\n    <path d=\"M9.2 9.2l3.4 3.4\"/>\n    <path d=\"M19.4 19.4l3.4 3.4\"/>\n    <path d=\"M22.8 9.2l-3.4 3.4\"/>\n    <path d=\"M12.6 19.4l-3.4 3.4\"/>\n  </g>\n  <circle cx=\"16\" cy=\"16\" r=\"2.6\" fill=\"#FF6A1A\"/>\n</svg>\n",
  "content": {
    "meta": {
      "title": "TURBINE — 11–13 June 2027 — Hall E, Kraków",
      "description": "Three nights of ambient, techno and modular sound in a power station that stopped making electricity in 1998. Kraków, 11–13 June 2027.",
      "ogTitle": "TURBINE — Three nights inside the machine",
      "ogDescription": "Ambient, techno and modular sound in a hall built for power. Twelve artists, three stages, three nights. Kraków, 11–13 June 2027."
    },
    "skipLink": "Skip to main content",
    "nav": {
      "wordmark": "TURBINE",
      "wordmarkLabel": "TURBINE — back to top",
      "links": [
        {
          "label": "Lineup",
          "target": "#lineup"
        },
        {
          "label": "Programme",
          "target": "#programme"
        },
        {
          "label": "Venue",
          "target": "#venue"
        },
        {
          "label": "Questions",
          "target": "#faq"
        }
      ],
      "cta": {
        "label": "Tickets",
        "target": "#tickets"
      },
      "landmark": "Primary"
    },
    "hero": {
      "eyebrow": "Fourth edition",
      "wordmark": "TURBINE",
      "tagline": "Three nights inside the machine",
      "secondary": "Ambient, techno and modular sound in a hall built for power.",
      "dates": "Friday 11 – Sunday 13 June 2027",
      "venue": "The Powerhouse, Hall E · Kraków",
      "ctaPrimary": {
        "label": "Get tickets",
        "target": "#tickets"
      },
      "ctaSecondary": {
        "label": "See the lineup",
        "target": "#lineup"
      },
      "scrollCue": {
        "label": "Scroll",
        "accessibleName": "Scroll down to the lineup",
        "target": "#lineup"
      }
    },
    "ticker": {
      "tags": [
        "INDUSTRIAL TECHNO",
        "DEEP AMBIENT",
        "DRONE",
        "CONCRETE AND STEEL",
        "MODULAR LIVE",
        "HARDWARE TECHNO",
        "FIELD RECORDING",
        "TAPE LOOPS",
        "DUB TECHNO",
        "SODIUM LIGHT",
        "NEOCLASSICAL ELECTRONIC",
        "PERCUSSIVE AMBIENT",
        "GENERATIVE",
        "GLASSY IDM"
      ],
      "separator": "·",
      "accessibleText": "Genres across the three nights: industrial techno, deep ambient, drone, modular live, hardware techno, field recording, tape loops, dub techno, neoclassical electronic, percussive ambient, generative and glassy IDM. Between them, two words for the room: concrete and steel, sodium light."
    },
    "lineup": {
      "heading": "Lineup",
      "intro": "Twelve artists over three nights. Four a night, one stage at a time. Nothing you want to hear runs against anything else you want to hear.",
      "tabsLabel": "Filter the lineup by day",
      "tabs": [
        {
          "label": "All",
          "accessibleName": "All twelve artists",
          "shows": "12 cards"
        },
        {
          "label": "Fri",
          "accessibleName": "Friday 11 June",
          "shows": "4 cards"
        },
        {
          "label": "Sat",
          "accessibleName": "Saturday 12 June",
          "shows": "4 cards"
        },
        {
          "label": "Sun",
          "accessibleName": "Sunday 13 June",
          "shows": "4 cards"
        }
      ],
      "status": {
        "All": "Showing all twelve artists.",
        "Fri": "Showing four artists playing Friday 11 June.",
        "Sat": "Showing four artists playing Saturday 12 June.",
        "Sun": "Showing four artists playing Sunday 13 June."
      },
      "artists": [
        {
          "name": "KASIMIR VOLT",
          "billing": "Headliner",
          "dayStage": "Friday · Turbine Hall",
          "day": "Friday",
          "stage": "Turbine Hall",
          "genre": "Industrial techno",
          "blurb": "Kick drums built to move the air in a room this size, played loud enough that the roof trusses answer back.",
          "slug": "kasimir-volt"
        },
        {
          "name": "Lena Orbis",
          "billing": "Headliner",
          "dayStage": "Saturday · Turbine Hall",
          "day": "Saturday",
          "stage": "Turbine Hall",
          "genre": "Deep ambient",
          "blurb": "Chords held until the hall's eight-second reverb becomes part of the chord.",
          "slug": "lena-orbis"
        },
        {
          "name": "NULLSET",
          "billing": "Headliner",
          "dayStage": "Sunday · Turbine Hall",
          "day": "Sunday",
          "stage": "Turbine Hall",
          "genre": "Generative",
          "blurb": "A patch that writes the set while it plays, so nobody in the hall has heard it before, including NULLSET.",
          "slug": "nullset"
        },
        {
          "name": "Auric Drift",
          "billing": "Main",
          "dayStage": "Friday · Boiler Room",
          "day": "Friday",
          "stage": "Boiler Room",
          "genre": "Drone",
          "blurb": "Sustained low end that arrives through the floor and reaches your ears second.",
          "slug": "auric-drift"
        },
        {
          "name": "Mara Teschke",
          "billing": "Main",
          "dayStage": "Saturday · Boiler Room",
          "day": "Saturday",
          "stage": "Boiler Room",
          "genre": "Modular live",
          "blurb": "Everything patched on stage, with the cables, the mistakes and the recoveries all audible.",
          "slug": "mara-teschke"
        },
        {
          "name": "SUBSTATION 9",
          "billing": "Main",
          "dayStage": "Sunday · Boiler Room",
          "day": "Sunday",
          "stage": "Boiler Room",
          "genre": "Hardware techno",
          "blurb": "Three drum machines, no laptop, and a hi-hat that cuts through brick like a spanner dropped on pipework.",
          "slug": "substation-9"
        },
        {
          "name": "Hiroko Vane",
          "billing": "Support",
          "dayStage": "Friday · Cooling Tower",
          "day": "Friday",
          "stage": "Cooling Tower",
          "genre": "Field recording",
          "blurb": "Tape of harbours, lifts and transformer hum, mixed until the recordings and the tower sound like one place.",
          "slug": "hiroko-vane"
        },
        {
          "name": "Cold Cathode",
          "billing": "Support",
          "dayStage": "Saturday · Cooling Tower",
          "day": "Saturday",
          "stage": "Cooling Tower",
          "genre": "Dub techno",
          "blurb": "One chord, a spring reverb and a long delay; the concrete does the rest of the work.",
          "slug": "cold-cathode"
        },
        {
          "name": "Ilse Rüm",
          "billing": "Support",
          "dayStage": "Sunday · Cooling Tower",
          "day": "Sunday",
          "stage": "Cooling Tower",
          "genre": "Neoclassical electronic",
          "blurb": "Piano and cello through tape delay, played at the volume of a conversation.",
          "slug": "ilse-rum"
        },
        {
          "name": "TAPE DECAY",
          "billing": "Support",
          "dayStage": "Friday · Boiler Room",
          "day": "Friday",
          "stage": "Boiler Room",
          "genre": "Tape loops",
          "blurb": "Four reel-to-reel machines running spliced loops that wear out audibly before the set ends.",
          "slug": "tape-decay"
        },
        {
          "name": "Odalys Ferrer",
          "billing": "Support",
          "dayStage": "Saturday · Cooling Tower",
          "day": "Saturday",
          "stage": "Cooling Tower",
          "genre": "Percussive ambient",
          "blurb": "Drums and metal bowls recorded in the room, then played back into it until the two blur.",
          "slug": "odalys-ferrer"
        },
        {
          "name": "VITRINE",
          "billing": "Support",
          "dayStage": "Sunday · Boiler Room",
          "day": "Sunday",
          "stage": "Boiler Room",
          "genre": "Glassy IDM",
          "blurb": "Brittle high-register rhythms that sound like something small breaking, slowed down.",
          "slug": "vitrine"
        }
      ]
    },
    "programme": {
      "heading": "Programme",
      "intro": "One stage plays at a time. The night opens in the Cooling Tower, moves down to the Boiler Room and finishes on the main floor. Changeovers take fifteen minutes and the walk between stages takes about four.",
      "days": [
        {
          "label": "Friday 11 June",
          "doors": "Doors 19:00 · Last set ends 04:00 · Hall clears 04:30",
          "daytime": null,
          "caption": "Friday 11 June, set times by stage",
          "columns": [
            "Time",
            "Turbine Hall",
            "Boiler Room",
            "Cooling Tower"
          ],
          "rows": [
            {
              "time": "19:30 – 21:00",
              "cells": [
                "—",
                "—",
                "Hiroko Vane"
              ]
            },
            {
              "time": "21:15 – 22:45",
              "cells": [
                "—",
                "TAPE DECAY",
                "—"
              ]
            },
            {
              "time": "23:00 – 00:45",
              "cells": [
                "—",
                "Auric Drift",
                "—"
              ]
            },
            {
              "time": "01:00 – 04:00",
              "cells": [
                "KASIMIR VOLT",
                "—",
                "—"
              ]
            }
          ],
          "stacked": [
            "19:30 – 21:00 · Cooling Tower · Hiroko Vane",
            "21:15 – 22:45 · Boiler Room · TAPE DECAY",
            "23:00 – 00:45 · Boiler Room · Auric Drift",
            "01:00 – 04:00 · Turbine Hall · KASIMIR VOLT"
          ]
        },
        {
          "label": "Saturday 12 June",
          "doors": "Doors 19:00 · Last set ends 04:00 · Hall clears 04:30",
          "daytime": "14:00 – 17:00 · Boiler Room · Modular synthesis workshop with Mara Teschke. Full Pass + Workshop only, 40 places.\nWorkshop entry from 13:30 at the gate. The hall opens to everyone at 19:00.",
          "caption": "Saturday 12 June, set times by stage",
          "columns": [
            "Time",
            "Turbine Hall",
            "Boiler Room",
            "Cooling Tower"
          ],
          "rows": [
            {
              "time": "19:30 – 21:00",
              "cells": [
                "—",
                "—",
                "Odalys Ferrer"
              ]
            },
            {
              "time": "21:15 – 23:00",
              "cells": [
                "—",
                "—",
                "Cold Cathode"
              ]
            },
            {
              "time": "23:15 – 01:00",
              "cells": [
                "—",
                "Mara Teschke",
                "—"
              ]
            },
            {
              "time": "01:15 – 04:00",
              "cells": [
                "Lena Orbis",
                "—",
                "—"
              ]
            }
          ],
          "stacked": [
            "19:30 – 21:00 · Cooling Tower · Odalys Ferrer",
            "21:15 – 23:00 · Cooling Tower · Cold Cathode",
            "23:15 – 01:00 · Boiler Room · Mara Teschke",
            "01:15 – 04:00 · Turbine Hall · Lena Orbis"
          ]
        },
        {
          "label": "Sunday 13 June",
          "doors": "Doors 17:30 · Last set ends 02:00 · Hall clears 02:30",
          "daytime": null,
          "caption": "Sunday 13 June, set times by stage",
          "columns": [
            "Time",
            "Turbine Hall",
            "Boiler Room",
            "Cooling Tower"
          ],
          "rows": [
            {
              "time": "18:00 – 19:30",
              "cells": [
                "—",
                "—",
                "Ilse Rüm"
              ]
            },
            {
              "time": "19:45 – 21:15",
              "cells": [
                "—",
                "VITRINE",
                "—"
              ]
            },
            {
              "time": "21:30 – 23:15",
              "cells": [
                "—",
                "SUBSTATION 9",
                "—"
              ]
            },
            {
              "time": "23:30 – 02:00",
              "cells": [
                "NULLSET",
                "—",
                "—"
              ]
            }
          ],
          "stacked": [
            "18:00 – 19:30 · Cooling Tower · Ilse Rüm",
            "19:45 – 21:15 · Boiler Room · VITRINE",
            "21:30 – 23:15 · Boiler Room · SUBSTATION 9",
            "23:30 – 02:00 · Turbine Hall · NULLSET"
          ]
        }
      ],
      "note": "All times are Central European Summer Time. Set times can move. Anything that changes is posted at the gate and here.",
      "emptyCell": "—",
      "emptyCellAccessible": "No set"
    },
    "venue": {
      "heading": "The Powerhouse, Hall E",
      "paragraphs": [
        "Hall E has not made electricity since 1998. For three nights it makes something else. The building went up in 1928 to burn coal for the city; Hall E held the turbines, and their concrete plinths are still set into the floor. The main stage goes up between them.",
        "The three rooms are not versions of one room. The Turbine Hall is the main floor: twenty-six metres up to the roof trusses and about eight seconds of reverb, which is why the slow sets are programmed here and not downstairs. The Boiler Room is two levels below ground — brick vaults, a low ceiling, iron furnace doors along one wall, and heat the crowd makes and the building keeps. The Cooling Tower is a forty-metre concrete shell with a ring of seating at the base and a deck closing the top. It is the quietest room on site, and the loudest thing in it is usually the room.",
        "Four thousand people a night, across all three. The hall is not heated and it holds the cold: about fourteen degrees on the floor at three in the morning, in June. Bring a layer, and bring ear protection."
      ],
      "gettingHere": {
        "heading": "Getting here",
        "address": "The Powerhouse, Hall E · ul. Kotłowa 3 · 30-702 Kraków",
        "travel": [
          {
            "term": "Tram",
            "description": "Trams 9, 14 and 22 stop at Elektrownia, 200 metres from the gate. The last tram into the centre leaves at 23:10; after that the night line 62 runs every forty minutes until 04:40."
          },
          {
            "term": "Train",
            "description": "Kraków Główny is twenty minutes away on tram 14, or a 35-minute walk along the river."
          },
          {
            "term": "Bike",
            "description": "Three hundred covered racks inside the gate, lit and staffed until thirty minutes after the last set."
          },
          {
            "term": "Accessibility",
            "description": "Step-free from the gate to all three stages. A lift serves the Boiler Room and the Cooling Tower balcony, and the Turbine Hall has a raised viewing platform with its own bar and toilet. Accessible toilets on every level."
          }
        ],
        "parking": "There is no parking on site and the streets around it are permit-only. The drop-off point is on the corner of ul. Kotłowa and ul. Węglowa, fifty metres from the gate.",
        "mapCaption": "Hall E, the gate on ul. Kotłowa, and the Elektrownia tram stop two streets north. The river runs along the southern edge of the site.",
        "mapPlaceholder": "MAP PLACEHOLDER"
      }
    },
    "tickets": {
      "heading": "Tickets",
      "intro": "Three ways in. The price you see is the price you pay: no booking fee, no service charge, and no tier that expires while you are reading this.",
      "cards": [
        {
          "name": "Single Night",
          "price": "€45",
          "priceSuffix": "one night",
          "badge": null,
          "includes": [
            "One night, chosen at checkout",
            "All three stages",
            "Re-entry on the night"
          ],
          "button": "Choose a night",
          "variant": "standard",
          "target": "https://tickets.turbine.fm/2027"
        },
        {
          "name": "Full Pass",
          "price": "€110",
          "priceSuffix": "three nights",
          "badge": "Most popular",
          "includes": [
            "All three nights, 11–13 June",
            "All three stages",
            "Re-entry on every night",
            "€25 less than three single nights"
          ],
          "button": "Get a Full Pass",
          "variant": "highlighted",
          "target": "https://tickets.turbine.fm/2027"
        },
        {
          "name": "Full Pass + Workshop",
          "price": "€165",
          "priceSuffix": "three nights and the workshop",
          "badge": null,
          "includes": [
            "Everything in the Full Pass",
            "Modular synthesis workshop, Saturday 14:00 – 17:00",
            "Led by Mara Teschke in the Boiler Room",
            "40 places"
          ],
          "button": "Get a Full Pass and workshop",
          "variant": "standard",
          "target": "https://tickets.turbine.fm/2027"
        }
      ],
      "comparison": {
        "caption": "The three tiers compared",
        "columns": [
          "Single Night",
          "Full Pass",
          "Full Pass + Workshop"
        ],
        "rows": [
          {
            "label": "Price",
            "cells": [
              "€45",
              "€110",
              "€165"
            ]
          },
          {
            "label": "Nights",
            "cells": [
              "One, chosen at checkout",
              "Three",
              "Three"
            ]
          },
          {
            "label": "Stages",
            "cells": [
              "All three",
              "All three",
              "All three"
            ]
          },
          {
            "label": "Re-entry on the night",
            "cells": [
              "Yes",
              "Yes",
              "Yes"
            ]
          },
          {
            "label": "Saturday workshop",
            "cells": [
              "No",
              "No",
              "Yes, 40 places"
            ]
          },
          {
            "label": "Companion ticket",
            "cells": [
              "Free",
              "Free",
              "Free"
            ]
          },
          {
            "label": "Booking fee",
            "cells": [
              "None",
              "None",
              "None"
            ]
          }
        ]
      },
      "accessNote": "Companion tickets for personal assistants are free. Write to access@turbine.fm and we will arrange it, no documentation required.",
      "smallPrint": "Every ticket is 18+. Bring photo ID."
    },
    "faq": {
      "heading": "Questions",
      "intro": "Eight things people write to us about.",
      "items": [
        {
          "id": "faq-times",
          "question": "What time does it start and finish?",
          "answer": "Doors at 19:00 on Friday and Saturday, 17:30 on Sunday. The last set ends at 04:00 on Friday and Saturday and at 02:00 on Sunday, and the hall clears half an hour later. Full set times are in the programme above."
        },
        {
          "id": "faq-age",
          "question": "Is there an age limit?",
          "answer": "Yes. Eighteen and over, on every night and in the workshop. We check photo ID at the gate and we do not make exceptions."
        },
        {
          "id": "faq-reentry",
          "question": "Can I leave and come back?",
          "answer": "Yes, on the same night, with your wristband. The gate stops readmitting at 02:00 on Friday and Saturday and at 00:30 on Sunday. The yard between the gate and the hall is the smoking area, so you do not have to leave the site for that."
        },
        {
          "id": "faq-accessibility",
          "question": "What is the site like if I have access needs?",
          "answer": "Step-free from the gate to all three stages. A lift serves the Boiler Room and the Cooling Tower balcony. The Turbine Hall has a raised viewing platform with its own bar and toilet. Accessible toilets on every level. A quiet room next to the gate stays open all night with the sound at conversation level, and ear defenders are free at the info desk. There is haze on all three stages and strobe in the Turbine Hall after midnight. Companion tickets for personal assistants are free: write to access@turbine.fm."
        },
        {
          "id": "faq-bring",
          "question": "What should I bring?",
          "answer": "Photo ID, your ticket on a phone or on paper, and ear protection. Bring a layer as well: the hall is unheated and sits at about fourteen degrees at three in the morning, in June. Leave glass, professional cameras and anything larger than a small rucksack at home."
        },
        {
          "id": "faq-cashless",
          "question": "Is the site cashless?",
          "answer": "The bars and the merchandise stand take cards and phones only. If you would rather not use a card, the desk by the gate turns cash into a festival card with no fee, and refunds the balance in cash on the same night."
        },
        {
          "id": "faq-weather",
          "question": "What happens if it rains?",
          "answer": "Nothing changes. All three stages are under cover and so is the queue. The only open ground is the yard between the gate and the hall, and that is forty metres."
        },
        {
          "id": "faq-lockers",
          "question": "Are there lockers?",
          "answer": "Nine hundred of them by the gate, €5 a night, large enough for a coat and a rucksack. They open and close as often as you like on the same wristband. The staffed cloakroom next to them takes coats until thirty minutes after the last set."
        }
      ]
    },
    "newsletter": {
      "heading": "Three emails a year",
      "pitch": "Changes to set times, and the dates for the fifth edition. Nothing else.",
      "label": "Email address",
      "placeholder": "name@example.com",
      "consent": "Yes, send me TURBINE festival email. Every message has an unsubscribe link.",
      "button": "Sign up",
      "note": "We do not sell the list and we do not share it.",
      "fixtureNote": "This page is a teaching fixture. The form sends nothing and stores nothing.",
      "messages": {
        "Empty field": "Enter your email address.",
        "Not an address": "That does not look like an email address. Check it and try again.",
        "Consent not ticked": "Tick the box to confirm you want the email.",
        "Success": "You are on the list. We will write when there is something to say."
      }
    },
    "footer": {
      "heading": "Site footer",
      "tagline": "Three nights inside the machine",
      "columns": [
        {
          "heading": "Festival",
          "links": [
            {
              "label": "Lineup",
              "target": "#lineup"
            },
            {
              "label": "Programme",
              "target": "#programme"
            },
            {
              "label": "Venue",
              "target": "#venue"
            },
            {
              "label": "Tickets",
              "target": "#tickets"
            }
          ]
        },
        {
          "heading": "Visit",
          "links": [
            {
              "label": "Getting here",
              "target": "#venue"
            },
            {
              "label": "Accessibility",
              "target": "#faq-accessibility"
            },
            {
              "label": "What to bring",
              "target": "#faq-bring"
            },
            {
              "label": "Lockers and cloakroom",
              "target": "#faq-lockers"
            }
          ]
        },
        {
          "heading": "Contact",
          "links": [
            {
              "label": "hello@turbine.fm",
              "target": "mailto:hello@turbine.fm"
            },
            {
              "label": "access@turbine.fm",
              "target": "mailto:access@turbine.fm"
            },
            {
              "label": "Three emails a year",
              "target": "#newsletter"
            },
            {
              "label": "Questions",
              "target": "#faq"
            }
          ]
        },
        {
          "heading": "Small print",
          "links": [
            {
              "label": "Terms of entry",
              "target": "https://turbine.fm/terms"
            },
            {
              "label": "Privacy",
              "target": "https://turbine.fm/privacy"
            },
            {
              "label": "House rules",
              "target": "https://turbine.fm/house-rules"
            },
            {
              "label": "Credits",
              "target": "https://turbine.fm/credits"
            }
          ]
        }
      ],
      "socials": [
        {
          "label": "TURBINE on Instagram",
          "target": "https://turbine.fm/instagram"
        },
        {
          "label": "TURBINE on Bandcamp",
          "target": "https://turbine.fm/bandcamp"
        },
        {
          "label": "TURBINE on Mastodon",
          "target": "https://turbine.fm/mastodon"
        }
      ],
      "legal": [
        "© 2027 TURBINE · The Powerhouse, Hall E · ul. Kotłowa 3 · 30-702 Kraków",
        "Fourth edition · 11–13 June 2027 · 18+"
      ],
      "disclaimer": "TURBINE is a fictional festival created as teaching material for a conference workshop. Artist names, imagery and copy are invented. Any resemblance to a real event or performer is coincidental."
    },
    "images": {
      "hero": {
        "file": "hero-hall.jpg",
        "alt": "The interior of a vast disused turbine hall at night, steel roof trusses overhead, a crowd standing in silhouette under orange work lamps and cyan haze."
      },
      "venue": {
        "file": "venue-exterior.jpg",
        "alt": "A long brick power station with tall arched windows at blue hour, orange light leaking from inside, a chimney and cooling tower behind it."
      },
      "og": {
        "file": "og-card.jpg",
        "alt": "The curved flank of a huge riveted turbine casing lit orange from one side, the rest of the frame falling away into darkness."
      },
      "artists": [
        {
          "slug": "kasimir-volt",
          "name": "KASIMIR VOLT",
          "file": "artist-01-kasimir-volt.jpg",
          "alt": "A figure in hard silhouette against dense smoke, rimmed by a single orange lamp directly behind the head."
        },
        {
          "slug": "lena-orbis",
          "name": "Lena Orbis",
          "file": "artist-02-lena-orbis.jpg",
          "alt": "A standing figure almost entirely dissolved into cold cyan fog, low and small in an otherwise empty frame."
        },
        {
          "slug": "nullset",
          "name": "NULLSET",
          "file": "artist-03-nullset.jpg",
          "alt": "A fine lattice of cyan and violet light lines drawn in empty black space, fraying toward the edges."
        },
        {
          "slug": "auric-drift",
          "name": "Auric Drift",
          "file": "artist-04-auric-drift.jpg",
          "alt": "A tall shaft of orange light falling down a dark concrete wall, with a shoulder in shadow entering from the left."
        },
        {
          "slug": "mara-teschke",
          "name": "Mara Teschke",
          "file": "artist-05-mara-teschke.jpg",
          "alt": "Two hands patching cables into a dark modular synthesiser panel under a single orange lamp."
        },
        {
          "slug": "substation-9",
          "name": "SUBSTATION 9",
          "file": "artist-06-substation-9.jpg",
          "alt": "A figure seen from behind facing a wall of old electrical switchgear, edged by a single orange rim light."
        },
        {
          "slug": "hiroko-vane",
          "name": "Hiroko Vane",
          "file": "artist-07-hiroko-vane.jpg",
          "alt": "A small silhouetted figure holding a pole aloft against a large, evenly glowing pale cyan window panel."
        },
        {
          "slug": "cold-cathode",
          "name": "Cold Cathode",
          "file": "artist-08-cold-cathode.jpg",
          "alt": "A figure smeared and abstracted behind fogged wired safety glass, backlit by a cyan tube light."
        },
        {
          "slug": "ilse-rum",
          "name": "Ilse Rüm",
          "file": "artist-09-ilse-rum.jpg",
          "alt": "A single hand resting still on the keys of an old piano keyboard, lit warmly from one side, the rest in darkness."
        },
        {
          "slug": "tape-decay",
          "name": "TAPE DECAY",
          "file": "artist-10-tape-decay.jpg",
          "alt": "A loop of magnetic tape running diagonally between spools, its edge catching an orange highlight, one spool blurred by motion."
        },
        {
          "slug": "odalys-ferrer",
          "name": "Odalys Ferrer",
          "file": "artist-11-odalys-ferrer.jpg",
          "alt": "A long-exposure frame of a figure mid-strike, one arm smeared into an orange trail above the lit rims of metal percussion."
        },
        {
          "slug": "vitrine",
          "name": "VITRINE",
          "file": "artist-12-vitrine.jpg",
          "alt": "The exposed edges of stacked plate glass sheets glowing cyan under a single side light, with faint violet refraction."
        }
      ],
      "all": {
        "hero-hall.jpg": "The interior of a vast disused turbine hall at night, steel roof trusses overhead, a crowd standing in silhouette under orange work lamps and cyan haze.",
        "artist-01-kasimir-volt.jpg": "A figure in hard silhouette against dense smoke, rimmed by a single orange lamp directly behind the head.",
        "artist-02-lena-orbis.jpg": "A standing figure almost entirely dissolved into cold cyan fog, low and small in an otherwise empty frame.",
        "artist-03-nullset.jpg": "A fine lattice of cyan and violet light lines drawn in empty black space, fraying toward the edges.",
        "artist-04-auric-drift.jpg": "A tall shaft of orange light falling down a dark concrete wall, with a shoulder in shadow entering from the left.",
        "artist-05-mara-teschke.jpg": "Two hands patching cables into a dark modular synthesiser panel under a single orange lamp.",
        "artist-06-substation-9.jpg": "A figure seen from behind facing a wall of old electrical switchgear, edged by a single orange rim light.",
        "artist-07-hiroko-vane.jpg": "A small silhouetted figure holding a pole aloft against a large, evenly glowing pale cyan window panel.",
        "artist-08-cold-cathode.jpg": "A figure smeared and abstracted behind fogged wired safety glass, backlit by a cyan tube light.",
        "artist-09-ilse-rum.jpg": "A single hand resting still on the keys of an old piano keyboard, lit warmly from one side, the rest in darkness.",
        "artist-10-tape-decay.jpg": "A loop of magnetic tape running diagonally between spools, its edge catching an orange highlight, one spool blurred by motion.",
        "artist-11-odalys-ferrer.jpg": "A long-exposure frame of a figure mid-strike, one arm smeared into an orange trail above the lit rims of metal percussion.",
        "artist-12-vitrine.jpg": "The exposed edges of stacked plate glass sheets glowing cyan under a single side light, with faint violet refraction.",
        "venue-exterior.jpg": "A long brick power station with tall arched windows at blue hour, orange light leaking from inside, a chimney and cooling tower behind it.",
        "og-card.jpg": "The curved flank of a huge riveted turbine casing lit orange from one side, the rest of the frame falling away into darkness."
      },
      "map": null
    },
    "microcopy": [
      {
        "where": "Skip link",
        "string": "Skip to main content",
        "note": "targets `#main`"
      },
      {
        "where": "Nav landmark",
        "string": "Primary",
        "note": "aria-label"
      },
      {
        "where": "Wordmark link",
        "string": "TURBINE — back to top",
        "note": "accessible name"
      },
      {
        "where": "Hamburger, closed",
        "string": "Open menu",
        "note": "aria-label"
      },
      {
        "where": "Hamburger, open",
        "string": "Close menu",
        "note": "aria-label"
      },
      {
        "where": "Scroll cue link",
        "string": "Scroll down to the lineup",
        "note": "accessible name; visible text is `Scroll`"
      },
      {
        "where": "Ticker strip",
        "string": "aria-hidden=\"true\"",
        "note": "the visually hidden sentence under Ticker, below, is the accessible version"
      },
      {
        "where": "Lineup tab list",
        "string": "Filter the lineup by day",
        "note": "`aria-label` on the tab list"
      },
      {
        "where": "Programme captions",
        "string": "see the Programme section",
        "note": "one per day table"
      },
      {
        "where": "Empty programme cell",
        "string": "No set",
        "note": "visually hidden; the visible `—` is `aria-hidden=\"true\"`"
      },
      {
        "where": "Ticket card 2",
        "string": "Most popular",
        "note": "real text, not a background image"
      },
      {
        "where": "Sold-out button",
        "string": "Workshop sold out",
        "note": "`aria-disabled=\"true\"`, stays focusable"
      },
      {
        "where": "FAQ items",
        "string": "the questions in the FAQ section",
        "note": "the question sits in an `h3` inside the control, unchanged"
      },
      {
        "where": "Newsletter messages",
        "string": "see Newsletter messages, below",
        "note": "announced politely, never as an alert dialog"
      },
      {
        "where": "Footer landmark heading",
        "string": "Site footer",
        "note": "visually hidden `h2`"
      },
      {
        "where": "Main landmark",
        "string": "`id=\"main\"` on the element that starts at the hero",
        "note": "the skip link target"
      },
      {
        "where": "Wordmark link target",
        "string": "#top",
        "note": "`id=\"top\"` on the outermost page wrapper is optional; `#top` resolves to the top of the document under the HTML fragment rules with or without it"
      }
    ]
  }
};

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
        "description": "Focus ring base, dividers. 1.98:1 on bg.base: usable as an offset or underlay, never as the visible focus indicator on its own. See CONTRAST.md."
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
        "description": "Legal and footer only. 4.1:1 on bg/base — fails AA for body copy. Use text/secondary instead."
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
        "description": "Alias of bg.base. CANON section 4 fixes dark ink, not white, as the text colour on accent.sodium and on every other accent or state fill."
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
        "description": "CANON §6 spacing scale."
      },
      {
        "name": "space/2",
        "value": 8,
        "description": "CANON §6 spacing scale."
      },
      {
        "name": "space/3",
        "value": 12,
        "description": "CANON §6 spacing scale."
      },
      {
        "name": "space/4",
        "value": 16,
        "description": "CANON §6 spacing scale."
      },
      {
        "name": "space/6",
        "value": 24,
        "description": "CANON §6 spacing scale."
      },
      {
        "name": "space/8",
        "value": 32,
        "description": "CANON §6 spacing scale."
      },
      {
        "name": "space/12",
        "value": 48,
        "description": "CANON §6 spacing scale."
      },
      {
        "name": "space/16",
        "value": 64,
        "description": "CANON §6 spacing scale."
      },
      {
        "name": "space/24",
        "value": 96,
        "description": "CANON §6 spacing scale."
      },
      {
        "name": "space/32",
        "value": 128,
        "description": "CANON §6 spacing scale."
      },
      {
        "name": "radius/none",
        "value": 0,
        "description": "CANON §6 radius."
      },
      {
        "name": "radius/sm",
        "value": 4,
        "description": "CANON §6 radius."
      },
      {
        "name": "radius/md",
        "value": 8,
        "description": "CANON §6 radius."
      },
      {
        "name": "radius/lg",
        "value": 16,
        "description": "CANON §6 radius."
      },
      {
        "name": "radius/pill",
        "value": 999,
        "description": "Fully rounded ends. Used for genre tags and the ticket badges."
      },
      {
        "name": "breakpoint/mobile",
        "value": 390,
        "description": "CANON §6 breakpoint."
      },
      {
        "name": "breakpoint/tablet",
        "value": 768,
        "description": "The nav collapses to a hamburger below this width; the programme table stacks below it."
      },
      {
        "name": "breakpoint/desktop",
        "value": 1440,
        "description": "CANON §6 breakpoint."
      },
      {
        "name": "size/content-max",
        "value": 1200,
        "description": "Content max width."
      },
      {
        "name": "border/hairline",
        "value": 1,
        "description": "Hairline stroke. FIGMA-SPEC §2.4."
      },
      {
        "name": "border/focus",
        "value": 2,
        "description": "Focus ring stroke. CANON §9 via FIGMA-SPEC §2.4."
      },
      {
        "name": "size/touch-min",
        "value": 24,
        "description": "CANON §9 minimum touch target."
      },
      {
        "name": "size/tap-comfortable",
        "value": 48,
        "description": "Used for every real control. FIGMA-SPEC §2.4."
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
          "percent": 162,
          "css": "1.625"
        }
      ],
      "tracking": [
        {
          "name": "tracking/tight",
          "em": -0.02,
          "percent": -2,
          "source": "CANON §5, all display type"
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
          "source": "FIGMA-SPEC §12, eyebrows and mono tags"
        },
        {
          "name": "tracking/wordmark",
          "em": 0.18,
          "percent": 18,
          "source": "CANON §5, wordmark lockup only"
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
            32,
            48
          ],
          "note": "CANON §6 fixes 24 and 48; 32 is the tablet step"
        },
        {
          "name": "responsive/container-max",
          "values": [
            342,
            704,
            1200
          ],
          "note": "Viewport minus two gutters, capped at size/content-max"
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
      "name": "Display/Wordmark-Hero",
      "family": "display",
      "weight": 700,
      "size": "responsive/type/wordmark-hero",
      "px": 96,
      "leading": "leading/none",
      "tracking": "tracking/wordmark",
      "textCase": "UPPER",
      "usedBy": "Hero h1",
      "figmaFamily": "Space Grotesk",
      "styleCandidates": [
        "Bold"
      ]
    },
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
      "name": "Display/Section",
      "family": "display",
      "weight": 700,
      "size": "responsive/type/section-h2",
      "px": 56,
      "leading": "leading/tight",
      "tracking": "tracking/tight",
      "textCase": "ORIGINAL",
      "usedBy": "Every section h2",
      "figmaFamily": "Space Grotesk",
      "styleCandidates": [
        "Bold"
      ]
    },
    {
      "name": "Display/Subsection",
      "family": "display",
      "weight": 500,
      "size": "responsive/type/subsection-h3",
      "px": 32,
      "leading": "leading/snug",
      "tracking": "tracking/tight",
      "textCase": "ORIGINAL",
      "usedBy": "h3, ticket tier, day heading",
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
      "name": "Body/Lead",
      "family": "body",
      "weight": 400,
      "size": "responsive/type/lead",
      "px": 20,
      "leading": "leading/relaxed",
      "tracking": "tracking/normal",
      "textCase": "ORIGINAL",
      "usedBy": "Hero secondary line, section intro",
      "figmaFamily": "Inter",
      "styleCandidates": [
        "Regular"
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
  "cover": {
    "width": 1600,
    "height": 960,
    "padding": 128,
    "gap": 32,
    "subtitle": "Landing page — design file",
    "meta": "12–14 June 2027 · The Powerhouse, Hall E · Kraków",
    "provenance": "Fictional festival. Teaching material for WaysConf 2026. Source of truth: docs/CANON.md"
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
      "container": 1200,
      "gridColumns": 12,
      "gridGutter": 24,
      "type": {
        "wordmarkHero": 96,
        "sectionH2": 56,
        "subsectionH3": 32,
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
        "padX": 120,
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
        "cardWidth": 282,
        "cardSizing": "FIXED",
        "metaDirection": "HORIZONTAL",
        "headlinerNameSize": 24
      },
      "programme": {
        "layout": "table-row",
        "timeWidth": 96,
        "showHead": true
      },
      "venue": {
        "direction": "HORIZONTAL",
        "columnWidth": 576,
        "imageAspect": 1.3333333333333333,
        "mapWidth": 576,
        "mapHeight": 320,
        "travelColumns": 2
      },
      "tickets": {
        "direction": "HORIZONTAL",
        "cardWidth": 384,
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
        "width": 560,
        "sizing": "FIXED"
      },
      "footer": {
        "layout": "wide",
        "columnWidth": 180,
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
      "gutter": 32,
      "sectionPadY": 96,
      "container": 704,
      "gridColumns": 8,
      "gridGutter": 24,
      "type": {
        "wordmarkHero": 72,
        "sectionH2": 40,
        "subsectionH3": 24,
        "lead": 18
      },
      "nav": {
        "layout": "full",
        "height": 64,
        "padX": 32,
        "padY": 12,
        "linkGap": 24,
        "linkStyle": "Body/Small-Medium"
      },
      "hero": {
        "height": 700,
        "padX": 32,
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
        "cardWidth": 218.67,
        "cardSizing": "FILL",
        "metaDirection": "HORIZONTAL",
        "headlinerNameSize": 24
      },
      "programme": {
        "layout": "table-row",
        "timeWidth": 72,
        "showHead": true
      },
      "venue": {
        "direction": "VERTICAL",
        "columnWidth": 704,
        "imageAspect": 1.7777777777777777,
        "mapWidth": 704,
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
        "listWidth": 704,
        "listSizing": "FILL",
        "triggerPadY": 24,
        "minHeight": 64,
        "answerPadRight": 48
      },
      "newsletter": {
        "width": 480,
        "sizing": "FIXED"
      },
      "footer": {
        "layout": "stacked",
        "columnWidth": 340,
        "columnGap": 24,
        "brandWidth": 704
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
        "subsectionH3": 24,
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
        "timeWidth": 0,
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
        "sizing": "FILL"
      },
      "footer": {
        "layout": "stacked",
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
      "text": "button, aria-expanded, aria-controls -> faq/answer id. Native details/summary satisfies this without script."
    },
    {
      "target": "newsletter/form",
      "text": "Visible label above the input, never a placeholder standing in for it. Consent unchecked on load. Messages announced politely, never as an alert dialog."
    }
  ],
  "exports": {
    "directory": "design/export/",
    "sections": [
      "nav",
      "hero",
      "ticker",
      "lineup",
      "programme",
      "venue",
      "tickets",
      "faq",
      "newsletter",
      "footer"
    ],
    "widths": [
      390,
      768,
      1440
    ],
    "rows": [
      {
        "layer": "section-nav",
        "suffix": "-390",
        "file": "section-nav-390.png"
      },
      {
        "layer": "section-nav",
        "suffix": "-768",
        "file": "section-nav-768.png"
      },
      {
        "layer": "section-nav",
        "suffix": "-1440",
        "file": "section-nav-1440.png"
      },
      {
        "layer": "section-hero",
        "suffix": "-390",
        "file": "section-hero-390.png"
      },
      {
        "layer": "section-hero",
        "suffix": "-768",
        "file": "section-hero-768.png"
      },
      {
        "layer": "section-hero",
        "suffix": "-1440",
        "file": "section-hero-1440.png"
      },
      {
        "layer": "section-ticker",
        "suffix": "-390",
        "file": "section-ticker-390.png"
      },
      {
        "layer": "section-ticker",
        "suffix": "-768",
        "file": "section-ticker-768.png"
      },
      {
        "layer": "section-ticker",
        "suffix": "-1440",
        "file": "section-ticker-1440.png"
      },
      {
        "layer": "section-lineup",
        "suffix": "-390",
        "file": "section-lineup-390.png"
      },
      {
        "layer": "section-lineup",
        "suffix": "-768",
        "file": "section-lineup-768.png"
      },
      {
        "layer": "section-lineup",
        "suffix": "-1440",
        "file": "section-lineup-1440.png"
      },
      {
        "layer": "section-programme",
        "suffix": "-390",
        "file": "section-programme-390.png"
      },
      {
        "layer": "section-programme",
        "suffix": "-768",
        "file": "section-programme-768.png"
      },
      {
        "layer": "section-programme",
        "suffix": "-1440",
        "file": "section-programme-1440.png"
      },
      {
        "layer": "section-venue",
        "suffix": "-390",
        "file": "section-venue-390.png"
      },
      {
        "layer": "section-venue",
        "suffix": "-768",
        "file": "section-venue-768.png"
      },
      {
        "layer": "section-venue",
        "suffix": "-1440",
        "file": "section-venue-1440.png"
      },
      {
        "layer": "section-tickets",
        "suffix": "-390",
        "file": "section-tickets-390.png"
      },
      {
        "layer": "section-tickets",
        "suffix": "-768",
        "file": "section-tickets-768.png"
      },
      {
        "layer": "section-tickets",
        "suffix": "-1440",
        "file": "section-tickets-1440.png"
      },
      {
        "layer": "section-faq",
        "suffix": "-390",
        "file": "section-faq-390.png"
      },
      {
        "layer": "section-faq",
        "suffix": "-768",
        "file": "section-faq-768.png"
      },
      {
        "layer": "section-faq",
        "suffix": "-1440",
        "file": "section-faq-1440.png"
      },
      {
        "layer": "section-newsletter",
        "suffix": "-390",
        "file": "section-newsletter-390.png"
      },
      {
        "layer": "section-newsletter",
        "suffix": "-768",
        "file": "section-newsletter-768.png"
      },
      {
        "layer": "section-newsletter",
        "suffix": "-1440",
        "file": "section-newsletter-1440.png"
      },
      {
        "layer": "section-footer",
        "suffix": "-390",
        "file": "section-footer-390.png"
      },
      {
        "layer": "section-footer",
        "suffix": "-768",
        "file": "section-footer-768.png"
      },
      {
        "layer": "section-footer",
        "suffix": "-1440",
        "file": "section-footer-1440.png"
      },
      {
        "layer": "TURBINE / Mobile 390",
        "suffix": "-390",
        "file": "full-page-390.png"
      },
      {
        "layer": "TURBINE / Tablet 768",
        "suffix": "-768",
        "file": "full-page-768.png"
      },
      {
        "layer": "TURBINE / Desktop 1440",
        "suffix": "-1440",
        "file": "full-page-1440.png"
      }
    ]
  },
  "content": {
    "meta": {
      "title": "TURBINE — 12–14 June 2027 — Hall E, Kraków",
      "description": "Three nights of ambient, techno and modular sound in a power station that stopped making electricity in 1998. Kraków, 12–14 June 2027.",
      "ogTitle": "TURBINE — Three nights inside the machine",
      "ogDescription": "Ambient, techno and modular sound in a hall built for power. Twelve artists, three stages, three nights. Kraków, 12–14 June 2027."
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
      "dates": "Friday 12 – Sunday 14 June 2027",
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
      "accessibleText": "Genres across the three nights: industrial techno, deep ambient, drone, modular live, hardware techno, field recording, tape loops, dub techno, neoclassical electronic, percussive ambient, generative and glassy IDM."
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
          "accessibleName": "Friday 12 June",
          "shows": "4 cards"
        },
        {
          "label": "Sat",
          "accessibleName": "Saturday 13 June",
          "shows": "4 cards"
        },
        {
          "label": "Sun",
          "accessibleName": "Sunday 14 June",
          "shows": "4 cards"
        }
      ],
      "status": {
        "All": "Showing all twelve artists.",
        "Fri": "Showing four artists playing Friday 12 June.",
        "Sat": "Showing four artists playing Saturday 13 June.",
        "Sun": "Showing four artists playing Sunday 14 June."
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
          "label": "Friday 12 June",
          "doors": "Doors 19:00 · Last set ends 04:00 · Hall clears 04:30",
          "daytime": null,
          "caption": "Friday 12 June, set times by stage",
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
          "label": "Saturday 13 June",
          "doors": "Doors 19:00 · Last set ends 04:00 · Hall clears 04:30",
          "daytime": "14:00 – 17:00 · Boiler Room · Modular synthesis workshop with Mara Teschke. Full Pass + Workshop only, 40 places.",
          "caption": "Saturday 13 June, set times by stage",
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
          "label": "Sunday 14 June",
          "doors": "Doors 17:30 · Last set ends 02:00 · Hall clears 02:30",
          "daytime": null,
          "caption": "Sunday 14 June, set times by stage",
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
            "All three nights, 12–14 June",
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
          "answer": "Step-free from the gate to all three stages, a lift to the Boiler Room and to the Cooling Tower balcony, and a raised viewing platform in the Turbine Hall with its own bar and toilet. Accessible toilets on every level. A quiet room next to the gate stays open all night with the sound at conversation level, and ear defenders are free at the info desk. There is haze on all three stages and strobe in the Turbine Hall after midnight. Companion tickets for personal assistants are free: write to access@turbine.fm."
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
      "pitch": "Set times, the day tickets go on sale, and the lineup once it is locked. Nothing else.",
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
        "Fourth edition · 12–14 June 2027 · 18+"
      ],
      "disclaimer": "TURBINE is a fictional festival created as teaching material for a conference workshop. Artist names, imagery and copy are invented. Any resemblance to a real event or performer is coincidental."
    },
    "images": {
      "alt": {
        "hero-hall-e.webp": "The empty floor of Hall E at night, four concrete turbine plinths lit from above by sodium lamps, steel roof trusses in the dark overhead.",
        "artists/kasimir-volt.webp": "KASIMIR VOLT behind a mixing desk, lit from one side in orange, both hands on the faders.",
        "artists/lena-orbis.webp": "Lena Orbis at a table of hardware in a dark hall, eyes closed, one hand held over a filter.",
        "artists/nullset.webp": "NULLSET seen from behind, facing a modular rack whose patch cables cross in front of a bank of green meters.",
        "artists/auric-drift.webp": "Auric Drift standing still at a table of pedals, the room behind him lost in haze.",
        "artists/mara-teschke.webp": "Mara Teschke leaning over a modular case, one patch cable between her teeth while she plugs in another.",
        "artists/substation-9.webp": "SUBSTATION 9 crouched over three drum machines on flight cases, lit only by their displays.",
        "artists/hiroko-vane.webp": "Hiroko Vane in headphones, holding a field recorder at arm's length towards a concrete wall.",
        "artists/cold-cathode.webp": "Cold Cathode at a mixer in blue light, one hand on a delay unit, smoke crossing the beam.",
        "artists/ilse-rum.webp": "Ilse Rüm at an upright piano with a tape machine on top of it and a microphone lowered to the strings.",
        "artists/tape-decay.webp": "TAPE DECAY between two reel-to-reel machines, a loop of tape running across the stage from one to the other.",
        "artists/odalys-ferrer.webp": "Odalys Ferrer seated among metal bowls and hand drums, a mallet resting on the rim of the largest.",
        "artists/vitrine.webp": "VITRINE lit from below through a sheet of glass, both hands flat on a control surface.",
        "venue-boiler-room.webp": "The Boiler Room: brick vaults two levels below ground, a low ceiling, and a row of iron furnace doors along one wall.",
        "map-powerhouse.svg": "Map of the Powerhouse site: Hall E and its gate on ulica Kotłowa, the Elektrownia tram stop two streets north, and the river along the southern edge.",
        "og-turbine.jpg": "The TURBINE wordmark over the floor of Hall E, with the dates 12 to 14 June 2027 and the venue, The Powerhouse, Hall E, Kraków.",
        "texture-grain.png": ""
      },
      "manifest": [
        {
          "path": "design/assets/hero-hall-e.webp",
          "where": "Hero, full-bleed",
          "size": "2400 × 1350"
        },
        {
          "path": "design/assets/artists/<slug>.webp",
          "where": "Lineup cards, twelve files",
          "size": "800 × 1000"
        },
        {
          "path": "design/assets/venue-boiler-room.webp",
          "where": "Venue, left column",
          "size": "1600 × 1200"
        },
        {
          "path": "design/assets/map-powerhouse.svg",
          "where": "Venue, static map placeholder",
          "size": "1200 × 800"
        },
        {
          "path": "design/assets/og-turbine.jpg",
          "where": "Social card, published at `/og-turbine.jpg`",
          "size": "1200 × 630"
        },
        {
          "path": "design/assets/texture-grain.png",
          "where": "Decorative overlay",
          "size": "tiles"
        }
      ]
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
        "note": "the visually hidden sentence in §5 is the accessible version"
      },
      {
        "where": "Lineup tab list",
        "string": "Filter the lineup by day",
        "note": "`aria-label` on the tab list"
      },
      {
        "where": "Programme captions",
        "string": "see §7",
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
        "string": "questions in §10",
        "note": "the `summary` text is the question, unchanged"
      },
      {
        "where": "Newsletter messages",
        "string": "see §11",
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
      }
    ]
  }
};

# design/export — the visual baseline

These PNGs are what the visual gate compares your build against. AC-34 fails if a
full-page screenshot differs from the file here by more than 1.5% of its pixels;
AC-35 holds the hero to 0.5%.

## Where they come from

There are two legitimate sources, and the difference matters.

**From Figma — the real one.** Open the TURBINE file, select the frames named in
`design/FIGMA-SPEC.md`, and export at 1× to this directory using the naming
convention below. This is the baseline that makes the gate mean what it says it
means: *does the implementation match the design*. If you have the Figma file, use
this route.

**From the reference implementation — the provisional one.** `npm run baseline` renders
the built site at the three breakpoints and writes the result here. This is what ships
in the repository today, because the gate has to work for participants who do not have
the Figma file open. It answers a narrower question: *does your build match the
reference build*. That is still a useful regression gate, and it is what you want during
the workshop — but it is not the same claim, and the slides say so.

The files currently in this directory were produced the second way. Replacing them with
Figma exports is a strict improvement and requires no code change.

## Naming

```
390.png                 full page at 390 CSS px wide
768.png                 full page at 768
1440.png                full page at 1440
section-<name>-<w>.png  one section, e.g. section-hero-1440.png
```

`<name>` is the value of the section's `data-section` attribute, exactly as listed in
`docs/CANON.md` §7.

## The thing not to do

Do not regenerate the baseline to make a failing build pass. That converts the gate
from a measurement into a mirror, and the whole point of this repository is the
difference between those two.

`npm run baseline` refuses to overwrite existing files without `--yes` for this reason,
and prints a warning saying it out loud.

## Why screenshots at all

A pixel diff is a blunt instrument. It detects that something moved; it has no idea
whether the movement was an improvement, and it will fail loudly over a font that loaded
a frame late.

That is why AC-37 exists and runs first: before any comparison, the gate asserts that
fonts are ready, every image has decoded, and animations are frozen. If those
preconditions do not hold it fails AC-37 and makes no comparison at all, rather than
reporting a difference it cannot attribute. A measurement taken under unknown
conditions is not evidence.

# Is the verifier deterministic?

The whole argument rests on one property: `npm run check` must return the same verdict
every time, on the same input, or it is an opinion with a progress bar. So it was run
twice, back to back, against an unchanged `solution` build.

## The two runs

```
RUN A: Build=pass:0 Accessibility=pass:0 Content=pass:0 Links=pass:0 Runtime=pass:0
       Structure=pass:0 Design tokens=pass:0 Visual fidelity=skip:0 Lighthouse=pass:0

RUN B: Build=pass:0 Accessibility=pass:0 Content=pass:0 Links=pass:0 Runtime=pass:0
       Structure=pass:0 Design tokens=pass:0 Visual fidelity=skip:0 Lighthouse=pass:0
```

Identical, gate for gate, failure count for failure count.

## The interesting part is underneath

The verdicts matched. The **measurements did not**:

| | Run A | Run B |
|---|---|---|
| Lighthouse performance, three raw runs | 98, 100, **84** | 99, 98, 98 |
| Median taken | **98** | **98** |
| LCP | 1737 ms | 2336 ms |
| CLS | 0.000 | 0.000 |
| Total transfer | 425 KB | 425 KB |

One raw Lighthouse run came back at 84 — fourteen points below its neighbours, on a page
that had not changed by a byte, because something else on the machine wanted the CPU at
that moment. A gate that took a single sample would have failed the build there, and the
next person to see a red build for no reason is the person who stops believing the gate.

That is what the median of three is for, and it is why `checks/gates/lighthouse.mjs`
discards runs that fail outright and retries up to five times for three usable samples —
see `evidence/INCIDENTS.md` #7, where a median of `[0, 0, 80]` reported a perfect page as
a total failure.

## What this does and does not establish

It establishes that the verdict is stable across two runs on one machine, and that the
noisiest gate is designed for the noise it actually has.

It does not establish reproducibility across machines, which is a different and harder
claim: font rendering, CPU class and browser build all move the numbers. The gates most
exposed to that are Lighthouse and the visual diff, which is why the first has a threshold
with ten points of headroom and the second has AC-37 refusing to compare a capture taken
under unknown conditions.

The gates with no tolerance at all — structure, content, links, tokens, accessibility —
read the DOM and computed styles. Those are the ones worth trusting between machines, and
they are also the ones that catch most of what an agent gets wrong.

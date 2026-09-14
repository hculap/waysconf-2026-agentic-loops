# 06 — Ship it

A URL you can send to someone. This is the bit that makes the afternoon real.

---

```text
Put this on the internet.

Build the site, then deploy it to Netlify. Use npx so there is nothing to install; if I
am not logged in, tell me what to click rather than doing it silently.

When it is live, do not just tell me it worked. Check:

- fetch the public URL and confirm it returns 200
- confirm the page it serves is the page you just built, not an older one — compare what
  comes back against what is in the dist folder
- run npm run check -- --url against the live URL, and show me the result

Then give me the URL on its own line so I can copy it.
```

---

**What you should see.** A browser window asking you to authorise Netlify — do it — then a
question about which site to create. Then a line like:

```
https://something-something-123456.netlify.app
```

Open it on your phone. That is the whole point of the exercise: the thing exists, on the
internet, and you can hand it to someone.

---

### If it goes wrong

| What you see | Say this |
|---|---|
| It asks you to log in and nothing opens | It printed a URL. Paste it into a browser by hand. |
| A blank page at the live URL | `The live page is blank. Check what you published — which folder did you deploy?` |
| CSS missing, text unstyled | Usually the wrong folder was published. `Deploy the dist folder, not the project root.` |
| "It deployed successfully" with no URL | `Give me the public URL on its own line.` |
| The live check fails where the local one passed | `Show me exactly which checks differ between local and live, and why. Do not change the checker.` |
| It says the checker cannot take an address | `Prompt 04 asked for --url. Add it without changing what any check decides, then run it against the live URL.` |

---

### The check that matters here, and why it is not fussiness

"Confirm the page it serves is the page you just built."

Everything up to now proved something about a file on your laptop. Between that file and a
visitor there is a build, an upload, a CDN and a cache, and each of them has been known to
serve something other than what you sent. Green checks locally say nothing about what is
live.

When this was built, that check failed — twice — for a reason nobody would have guessed:
the host quietly injects its own tags into every page it serves, so the bytes can never
match exactly. The honest check turned out to be "the body is identical and everything I
put in the head is still there", which is a different sentence from the one originally
written down, and it is the true one.

Asking "is the thing I published the thing I checked?" takes ten seconds and is the last
place a whole afternoon of correctness can quietly evaporate.

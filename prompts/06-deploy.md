# 06 — Ship it

The agent builds the site, deploys it to Netlify with the Netlify CLI and checks the live
address.

---

```text
Put this on the internet.

Build the site, then deploy it to Netlify with the Netlify command line. It is installed and
I am signed in; if it says I am not, tell me what to do rather than doing it silently.

When it is live, do not just tell me it worked. Check:

- fetch the public URL and confirm it returns 200
- confirm the page it serves is the page you just built, not an older one — compare what
  comes back against what is in the dist folder
- run npm run check -- --url against the live URL, and show me the result

Then give me the URL on its own line so I can copy it.
```

---

**Expected result.** If the Netlify CLI asks which site to use, choose to create a new
project. It prints an address like `https://something-123456.netlify.app`. The agent then
reports three checks: the address returns 200, the served page matches `dist`, and
`npm run check -- --url` passes against the live address. The address comes last, on its
own line.

---

### If something goes wrong

| What you see | Say this |
|---|---|
| It says you are not logged in | Run `netlify login` in another terminal, as on the Preparation page, then say `I am logged in now.` |
| A blank page at the live address | `The live page is blank. Which folder did you deploy?` |
| No styles on the live page | `Deploy the dist folder, not the project root.` |
| "Deployed successfully" and no address | `Give me the public address on its own line.` |
| The live check fails where the local one passed | `Show me exactly which checks differ between local and live, and why. Do not change the checker.` |
| It says the checker cannot take an address | `Prompt 04 asked for --url. Add it without changing what any check decides, then run it against the live address.` |

---

### Why it is written this way

- A successful deploy says nothing about what is served. The agent compares the live page with `dist`.
- Compare content, not bytes: Netlify adds its own tags to the HTML it serves.
- The checker runs against the live address, not only against the local server.

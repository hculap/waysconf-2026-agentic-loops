# 06 — Ship it

In a new session, the agent builds the site, creates a Netlify site and deploys to it without
interactive questions, checks the live address with the same checker, and commits and pushes
anything that changed.

## Before you paste

Type `/clear`, if you have not already.

---

```text
Put this on the internet.

Build the site, then deploy it to Netlify with the Netlify command line. It is installed and
I am signed in; if it says I am not, tell me what to do rather than doing it silently.

This project has no Netlify site yet. Create it and deploy in one command, without
interactive questions: netlify deploy --prod --dir=dist --site-name turbine-<my GitHub
username>. Find my username with gh api user --jq .login. If that name is taken, add a
short suffix and run it again.

When it is live, do not just tell me it worked. Check:

- fetch the public URL and confirm it returns 200
- confirm the page it serves is the page you just built, not an older one — compare what
  comes back against what is in the dist folder
- run npm run check -- --url against the live URL, and show me the result

Write the site name and the live address into notes.md. Then commit anything that changed
with a message that says what this step did, and push.

Then give me the URL on its own line so I can copy it.
```

---

**Expected result.** No questions from the Netlify CLI: `--site-name` creates the site and
deploys to it. The address looks like `https://turbine-yourname.netlify.app`. The agent then
reports three checks: the address returns 200, the served page matches `dist`, and
`npm run check -- --url` passes against the live address. It writes the site name into
`notes.md`, and commits and pushes anything that changed, for example the Netlify settings it
created. The address comes last, on its own line.

**After this prompt: type `/clear`.**

---

### If something goes wrong

| What you see | Say this |
|---|---|
| It says you are not logged in | Run `netlify login` in a new terminal window (any folder), as on the Preparation page, then say `I am logged in now.` |
| Codex asks to use the network | Answer yes. Deploying and fetching the live address need it. |
| The Netlify CLI asks a question and waits | Press Esc, then say `Stop that command. Deploy with --site-name so it does not ask anything.` |
| The site name is taken | `Add a short suffix to the site name and deploy again.` |
| The CLI keeps failing | Say `Open this project folder for me.` Drag the `dist` folder onto https://app.netlify.com/drop and claim the site when Netlify offers it. Then say `Link this folder to my Netlify site <name> with netlify link --name <name>, write the site name into notes.md, and run npm run check -- --url against its address.` |
| A blank page at the live address | `The live page is blank. Which folder did you deploy?` |
| No styles on the live page | `Deploy the dist folder, not the project root.` |
| "Deployed successfully" and no address | `Give me the public address on its own line.` |
| The live check fails where the local one passed | `Show me exactly which checks differ between local and live, and why. Do not change the checker.` |
| It says the checker cannot take an address | `Prompt 03 asked for --url. Add it without changing what any check decides, then run it against the live address.` |

---

### Why it is written this way

- `--site-name` creates the site in the same command: an agent cannot answer an interactive question in the terminal, and a waiting command waits for ever.
- A successful deploy says nothing about what is served. The agent compares the live page with `dist`, content and not bytes, because Netlify adds its own tags to the HTML.
- The site name goes into `notes.md`: prompt 07 deploys again to the same site after `/clear`.

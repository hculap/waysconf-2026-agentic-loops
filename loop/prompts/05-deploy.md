# 05 — Build and deploy

Put this page on the internet and give me the URL.

**Precondition.** Run the gates first:

```bash
npm run check
```

If that exits non-zero, stop. Do not deploy, do not deploy "just the passing part", do not deploy to a
draft URL to have a look. Report which gates failed and hand it back. Deploying an unverified build is the
one thing in this repository that cannot be undone by a `git reset`.

If it exits 0:

```bash
npm run build
npm run deploy          # netlify deploy --prod --dir=dist
```

The first Netlify run opens a browser to authorise and then asks you to pick or create a site. If a site is
already linked, use it. Do not create a second one.

Then prove the deploy, rather than reporting it:

1. **The URL answers.** `curl -sS -o /dev/null -w '%{http_code} %{content_type}\n' <URL>` — expect `200`
   and `text/html`. Retry a few times over thirty seconds; a fresh deploy propagates.
2. **The page that shipped is the page that passed.** Compare hashes:
   `curl -sS <URL> | sha256sum` against `sha256sum dist/index.html`. They match or you have deployed
   something other than what the gates approved. This is the check that is usually missing, and it is the
   only one that connects the green run to the live site.
3. **The live page is still sound.** `npm run check -- --url <URL>` runs the browser gates against the
   public URL rather than the local preview.

Report: the URL, the two hashes, the HTTP status, and the result of the live run. If any of the three
failed, say which and stop.

Do not:

- Do not print, echo or write a Netlify token, an API key or any other secret. Anything that reaches a
  transcript is there permanently.
- Do not install a package globally or change anything outside this directory.
- Do not `git push --force`, and do not push at all unless asked.
- Do not edit anything under `checks/` to get past the precondition.
- Do not tell me it is live because the command printed a URL. Tell me it is live because you fetched it.

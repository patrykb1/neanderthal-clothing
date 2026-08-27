Security guidance
=================

1. Rotate exposed secrets immediately
   - Replace any secrets (Stripe secret keys, admin passwords, API keys) in the providers' dashboards.

2. Remove secrets from this repository
   - If `.env.local` or other files with secrets were committed, remove them from the index and history.
   - Quick local cleanup (does not rewrite history):

```bash
git rm --cached .env.local
git commit -m "remove local env from repo"
```

   - To fully remove sensitive data from history, consider `git filter-repo` or the BFG Repo-Cleaner. Follow each tool's docs before running.

3. Keep secrets out of client bundles
   - Only store secret keys (like `STRIPE_SECRET_KEY`) on the server or CI environment variables.
   - Client-side env vars should only include non-sensitive values (publishable keys, public IDs).

4. Environment file guidance
   - Use `.env.example` with placeholders for contributors.
   - Ensure `.gitignore` includes `.env.local` and similar files. This repo already ignores `env.*`.

5. Verify after cleanup
   - After rotation and history purge, confirm no sensitive values remain in the remote repo or tags.

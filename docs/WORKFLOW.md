## Branch model

- **main**: Production branch. Contains code that is ready for deployment and should always be stable.
- **staging**: Active integration branch. Feature and fix branches are opened against `staging` and merged only via pull requests.
- **Feature/fix branches**: Named for the work item (for example, `feature/calc-improvements` or `bugfix/fix-typo`) and created from `staging`.

## Change flow and merge rules

1. Create a feature branch from `staging`.
2. Open a pull request targeting `staging`.
3. Ensure all required status checks pass (including the Jekyll build) and obtain the required approval(s).
4. Merge using the "Merge pull request" or "Squash and merge" strategy; do not force-push to shared branches.
5. Periodically promote `staging` into `main` via pull request once release criteria are met.

## Recommended GitHub branch protections

- Require pull requests before merging into `main`.
- Require status checks to pass before merging; include the Jekyll build as a mandatory check.
- Disallow force-pushes to `main`; allow only fast-forward or merge commits via pull requests.

## Release criteria for `staging` → `main`

- The project builds cleanly (Jekyll build passes without errors).
- Release checklist is completed and documented in the pull request (e.g., updated content reviewed, links validated, accessibility spot-check performed as applicable).
- All required reviewers have approved the promotion pull request.

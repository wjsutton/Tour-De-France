# Resources/.agents/

This folder holds context docs for AI agents (and people) that build or change this Tableau data
app. It ships inside the packaged `.twbx` under `Resources/`, next to the `.twb` and `Packages/`, so
it travels with the workbook through publish and download. Tableau ignores it; it is not part of the
app's runtime.

Before you modify this app, read every file in this folder. If this README is the only file here,
nobody has written docs for the app yet.

## Rules

- **Never put secrets here.** No tokens, passwords, API keys, credentials, or personal data. Anyone
  who can download the workbook can read this folder.
- Never put these docs under `Packages/<id>/content/`. That folder is the extension's web root and
  is served to the browser.
- When repackaging the `.twbx`, include this folder.

## Data apps (from tableau-mcp)

Copied from the tableau-mcp docs (`docs/docs/tools/data-apps/scaffold-data-app.md`, commit 6373f668);
the tableau-mcp top-level README has no data-app section of its own.

- A **data app** is a Tableau worksheet (viz) extension packaged inside the workbook. It queries a
  published datasource live through the Extensions API. Hosting needs Tableau Server/Cloud with the
  `Packages` feature (2026.3+); the `scaffold-data-app` MCP tool is behind the `data-apps` feature flag.
- Layout: `<App Name>.twb`, `Data/`, `Packages/<package id>/` (`manifest.json`,
  `extensions/data-app.trex`, `content/` = the web root with `index.html` and `src/`), `Resources/`.
- Identity: package id `com.tableau.mcp.<slug(app name)>`, version `1.0.0`, author `Tableau MCP`.
  The template placeholders `TODO-MANIFEST-ID`, `TODO App Name`, `TODO Sheet Name`,
  `TODO-MANIFEST-VERSION`, `TODO Author Name` are replaced in the `.twb`, `data-app.trex` and
  `manifest.json`, then `Packages/TODO-MANIFEST-ID` and the `.twb` are renamed. Keep all three in sync.
- `content/src/tableau.extensions.1.latest.min.js` must load before `app.js`.
- Data: `tableau.extensions.initializeAsync()` then `workbook.getAllDataSourcesAsync()` (fallback
  `worksheetContent.worksheet.getDataSourcesAsync()`), then `ds.queryAsync({ fields: [...] })` and
  `ds.readMetadataAsync()`; both return the VizQL Data Service shape `{ data: [rows] }`.
  `BOUND_DATASOURCE_ID` empty = first datasource. Datasource wiring into the `.twb` is a separate step.
- `manifest.json` `requestedOrigins` is empty by default. To call external origins (APIs, video
  hosts) set it to a space-separated CSP-style source list, e.g.
  `"https://api.example.com https://cdn.example.com"`; each must also be in the site's allowed
  origins (`GET /api/exp/sites/{siteId}/packages/allowed-origins`).
- Use safe DOM APIs (`textContent` / `createElement`) for live data; vendor libraries, no CDN.
- Publishing needs Explorer (Can Publish) or higher and API scope `tableau:packages:read`.

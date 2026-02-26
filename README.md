# Extension Trust Monitor 🛡️

A privacy-first Chrome Extension (Manifest V3) designed to detect risky or compromised extensions by monitoring permission changes, update events, and high-risk capabilities without sending any data off-device.

## Feature Highlights
- **Inventory & Snapshot Baseline**: Records all installed extensions and their access patterns.
- **Risk Engine Scoring (0-100)**: Evaluates an extension's risk immediately upon install or stealthy background updates.
- **Local Audit Log**: Keeps track of extension install, update, and permission-change events up to 500 records. Contains JSON export functionality.
- **Watch Mode**: DOM-level heuristics that look for clickjacking/overlay attacks on user-defined sensitive sites.
- **100% Privacy**: No tracking, no telemetry, no calls to remote APIs.

## How to Setup & Build
1. **Prerequisites**: Node.js 20+
2. **Install**:
   ```bash
   npm install
   ```
3. **Development (Watch)**: 
   ```bash
   npm run build -- --watch
   ```
   *To test in Chrome: Go to `chrome://extensions/` > Enable "Developer mode" > "Load unpacked" and select the `dist` folder.*
4. **Build Production (Minified)**:
   ```bash
   npm run build
   ```
5. **Linting and Testing**:
   ```bash
   npm run lint
   npm run test
   ```

## How to Test Permission Change Detection
1. Install this Trust Monitor extension unpacked.
2. Create a dummy test extension locally with minimum permissions (e.g. only `storage`). Install it unpacked.
3. Observe it in the Trust Monitor Dashboard (it should result in "Alacsony Kockázat").
4. Modify the `manifest.json` of your dummy test extension to bump its version and add a high-risk permission (e.g., `cookies` and `<all_urls>` host_permissions).
5. Press the "Update" (Reload) button on the dummy extension on the `chrome://extensions` page.
6. Check your OS notifications. Trust Monitor will alert you: "Magas Kockázat" with reasons explaining the sudden change.

## Architecture
- Built heavily utilizing **Vite**, **TypeScript** and **React**.
- Runs on MV3 **Service Workers** executing periodic snapshots using `chrome.alarms` and `chrome.management.onInstalled|onUpdated` events.

## Strict Compliance Information
Designed to pass Chrome Web Store policies: All extensive rights like `management` are transparently justified, code operates without `eval()` loops or remote fetched logic, delivering what it claims with listed heuristics limits.

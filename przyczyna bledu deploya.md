The Netlify deploy errored, with the following guidance provided:

Diagnosis
- Relevant log lines: [./app/turnieje/page.tsx (file + location)](#L65), the TypeScript error message [line 66](#L66), and the object literal properties shown at [lines 71–73](#L71-L73).
- Error type and cause: TypeScript compilation error — an object literal in frontend/app/turnieje/page.tsx is missing the required property image_url while being assigned to a value whose type requires image_url. See the pointer at [line 69](#L69) and the object example at [lines 71–73](#L71-L73).

Solution
You have two safe fixes. Pick one.

Option A — Add the missing property to the tournament objects (quick fix)
1. Edit frontend/app/turnieje/page.tsx (see file in repo: https://github.com/dawidbozek/livescore/blob/main/frontend/app/turnieje/page.tsx).
2. For each tournament object in the tournamentSchedule, add image_url (string). Example change:

```typescript
// frontend/app/turnieje/page.tsx
{
  name: 'Warmup Open Steel',
  tournament_date: '2026-07-16',
  dart_type: 'steel',
  image_url: '', // add this (or a valid URL)
},
```

3. Commit and push the change, then re-run the build (npm run build / redeploy on Netlify).

Option B — Make image_url optional in the type (if some tournaments legitimately have no image)
1. Find the type or interface that describes each tournament item (it appears to be used in the Record<...> type in the same file).
2. Change the property from required to optional:

```typescript
// wherever the type is declared (example)
type Tournament = {
  name: string;
  tournament_date: string;
  dart_type: 'steel' | 'soft'; // etc.
  image_url?: string; // make optional
};
```

3. Commit, push, and rebuild.

Verification
- After applying one of the above, run npm run build locally inside the frontend folder to confirm the TypeScript error is resolved before pushing.
- If you edit the type, ensure no other code assumes image_url is always present (add checks where necessary).

Notes
- The log shows the error arises during Next.js TypeScript compilation ([lines 62–66](#L62-L66)). Fixing the missing property or the type will allow the build to complete.

The relevant error logs are:

Line 53: [96m[1mbuild.command from netlify.toml                               [22m[39m
Line 54: [96m[1m────────────────────────────────────────────────────────────────[22m[39m
Line 55: ​
Line 56: [36m$ npm run build[39m
Line 57: > darts-live-score@1.0.0 build
Line 58: > next build
Line 59: [1m[38;2;173;127;168m▲ Next.js 16.1.4[39m[22m (Turbopack)
Line 60: [37m[1m [22m[39m Creating an optimized production build ...
Line 61: [32m[1m✓[22m[39m Compiled successfully in 7.7s
Line 62: [37m[1m [22m[39m Running TypeScript ...
Line 63: [31mFailed to compile.
Line 64: [39m
Line 65: [36m./app/turnieje/page.tsx[39m:[33m15[39m:[33m5[39m
Line 66: [31m[1mType error[22m[39m: Property 'image_url' is missing in type '{ name: string; tournament_date: string; dart_type: "ste
Line 67: [0m [90m 13 |[39m [36mconst[39m tournamentSchedule[33m:[39m [33mRecord[39m[33m<[39m[33mstring[39m[33m,[39m [33mO
Line 68:  [90m 14 |[39m   [32m'czwartek'[39m[33m:[39m [
Line 69: [31m[1m>[22m[39m[90m 15 |[39m     {
Line 70:  [90m    |[39m     [31m[1m^[22m[39m
Line 71:  [90m 16 |[39m       name[33m:[39m [32m'Warmup Open Steel'[39m[33m,[39m
Line 72:  [90m 17 |[39m       tournament_date[33m:[39m [32m'2026-07-16'[39m[33m,[39m
Line 73:  [90m 18 |[39m       dart_type[33m:[39m [32m'steel'[39m[33m,[39m[0m
Line 74: Next.js build worker exited with code: 1 and signal: null
Line 75: [91m[1m​[22m[39m
Line 76: [91m[1m"build.command" failed                                        [22m[39m
Line 77: [91m[1m────────────────────────────────────────────────────────────────[22m[39m
Line 78: ​
Line 79:   [31m[1mError message[22m[39m
Line 80:   Command failed with exit code 1: npm run build
Line 81: ​
Line 82:   [31m[1mError location[22m[39m
Line 83:   In build.command from netlify.toml:
Line 84:   npm run build
Line 85: ​
Line 86:   [31m[1mResolved config[22m[39m
Line 87:   build:
Line 88:     base: /opt/build/repo/frontend
Line 89:     command: npm run build
Line 90:     commandOrigin: config
Line 91:     environment:
Line 92:       - NEXT_PUBLIC_SUPABASE_ANON_KEY
Line 93:       - NEXT_PUBLIC_SUPABASE_URL
Line 94:       - SUPABASE_SERVICE_KEY
Line 95:     publish: /opt/build/repo/frontend/.next
Line 96:     publishOrigin: config
Line 97:   plugins:
Line 98:     - inputs: {}
Line 99:       origin: config
Line 100:       package: "@netlify/plugin-nextjs"
Line 101: Failed during stage 'building site': Build script returned non-zero exit code: 2
Line 102: Build failed due to a user error: Build script returned non-zero exit code: 2
Line 103: Failing build: Failed to build site
Line 104: Finished processing build request in 30.184s
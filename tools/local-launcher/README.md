# Local launcher

One double-click to get the site running locally: it changes into the project,
installs dependencies if they are missing, starts the dev server, waits until it
answers, and opens Edge at <http://localhost:3000>.

## Use it

Double-click **`Open-Local.cmd`**.

- A console window stays open showing the Vite output — that window *is* the
  server. Close it (or press `Ctrl+C`) to stop the site.
- A desktop shortcut works too: right-click `Open-Local.cmd` → *Send to* →
  *Desktop (create shortcut)*.

## What it does, in order

1. Moves to the project root (two folders above this script), so the same file
   works from any copy of the repository.
2. If port 3000 is already serving something, it skips the install and the
   server start and just opens Edge — clicking twice does not start two servers.
3. If `node_modules` is missing in *this* folder, runs `pnpm install` first.
4. Starts `pnpm dev`, then opens Edge as soon as the port answers (up to 90 s).

## Files

| File | Role |
| --- | --- |
| `Open-Local.cmd` | The entry point you double-click |
| `open-when-ready.ps1` | Waits for the port, then starts Edge (hidden helper) |

## Diagnostics

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\open-when-ready.ps1 -Check
```

prints the target URL, whether the port is open right now, and whether Edge was
found — without opening anything.

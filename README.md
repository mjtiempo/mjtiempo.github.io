# mjtiempo.github.io

The personal GitHub Pages site of **Mark John Tiempo** (`mjtiempo`) — a two-tile desktop in the browser, styled after the [Omarchy](https://omarchy.org) shell: top bar with live clock and weather, and two Hyprland-style tiled windows side by side.

- **Left tile — Profile:** avatar, name, bio, location, followers, public-repo count — all fetched live from the GitHub API
- **Right tile — Repositories:** the full public repo list, ordered by most recently updated (recent first), with descriptions, language dots, stars, forks, and an updated stamp

**Live:** https://mjtiempo.github.io/

---

## Highlighted repositories

### New

| Repo | What it is |
|------|------------|
| [omarchy-site](https://github.com/mjtiempo/omarchy-site) | An interactive re-imagining of [omarchy.org](https://omarchy.org) — the whole site is an Omarchy desktop: top bar, launcher menu, 9 themed workspaces, a tiled video wall, embedded app pages (Manual, News, Teams, Patrons, Sponsorships, AIR, Meetups), calendar and weather widgets, and closable Security/Brand popups. Vanilla HTML/CSS/JS, no build step, GitHub Pages-ready. Also the source of this site's design language. |
| [omarchy-proxmox-client](https://github.com/mjtiempo/omarchy-proxmox-client) | A Proxmox client for the Omarchy bar — a Quickshell widget that surfaces Proxmox status on the desktop. |
| [omarchy-clippy](https://github.com/mjtiempo/omarchy-clippy) | An Omarchy shell widget (QML/Quickshell) that lives in the bar and clips useful bits and pieces. |

### Older

| Repo | What it is |
|------|------------|
| [jitsimeet-jwt-ansible](https://github.com/mjtiempo/jitsimeet-jwt-ansible) | Ansible playbook for deploying **Jitsi Meet** with JWT auth — the long-running self-hosting project (Shell, ⭐ 1, ⑂ 4). |

The full live list (with counts and updated dates) is always on the site itself: https://mjtiempo.github.io/

## Running

No build step:

```bash
open index.html
# or
python3 -m http.server
```

## Structure

```text
index.html                   — markup (~7 KB)
assets/
├── css/personal.css         — styles (Tokyo Night tokens, tiles, calendar, weather)
└── js/personal.js           — clock, calendar, weather, GitHub API fetches
```

## Notes

- Built with vanilla HTML/CSS/JS — no framework, no bundler
- Data comes from the GitHub API (profile, repos), [wttr.in](https://wttr.in) + [Open-Meteo](https://open-meteo.com) for weather; the layout is inspired by the actual Omarchy shell and [omarchy.org](https://omarchy.org)

# OffsetEase — v4.3

A ground-up redesign of the OffsetEase marketing site: **futuristic yet timeless, enterprise-grade, ultra-minimal.** Content is sourced from [offsetease.com](https://offsetease.com); this build is entirely independent and does **not** modify or deploy to the live site.

> **Climate · Carbon · Capital** — sustainability, turned into business advantage.

## Design system

| Token | Value | Use |
| --- | --- | --- |
| Primary | `#0C4D56` | Deep teal — brand core |
| Deep / Abyss | `#083A41` / `#061E23` | Dark sections, footer |
| Glow | `#2FBFA8` | Luminous accent, data, interactive |
| Gold | `#B98A3E` | Editorial hairline accents (used sparingly) |
| Bone | `#F6F4EE` | Warm background |
| Ink / Slate | `#0A1B1E` / `#51625F` | Text |

- **Type:** Inter + Inter Tight — clean, Meta-style, high readability.
- **Motion:** a subtle atmospheric particle field (hero canvas), scroll-triggered reveals, count-ups, an animated methodology cycle and a live global-reach globe. All respect `prefers-reduced-motion`.
- **Zero dependencies / zero build step** — pure HTML, CSS and vanilla JS. Custom inline SVG for every graphic; no external image hosts.

## Pages

- `index.html` — Home: hero, philosophy, services, methodology, stats, industries, global reach, insights, CTA.
- `services.html` — All 15 capabilities, grouped and filterable (Measure · Disclose · Reduce).
- `about.html` — Approach, four commitments, the five-stage methodology, standards.
- `contact.html` — Consultation form + direct contact details.

## Structure

```
index.html · services.html · about.html · contact.html
assets/
  css/styles.css   — design system + all components
  js/main.js       — nav, reveals, count-ups, hero canvas, form
  img/favicon.svg
```

## Run locally

Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8080
```

Then visit `http://localhost:8080`.

## Brand & imagery

- **Logo:** the official OffsetEase artwork (`assets/img/offsetease-logo.png`, sourced from offsetease.com) is used unchanged. It is applied as a CSS mask so it renders in brand teal on light surfaces and white on the dark footer — the artwork itself is never altered. Favicons are the official `favicon.ico` / `favicon.png` / `apple-touch-icon.png`.
- **Photography:** cinematic, topic-relevant imagery (Earth from space, forest canopy, wind turbines, solar farm) is served from the Unsplash CDN, given a teal duotone scrim so it reads as bespoke and on-brand. All are free under the [Unsplash License](https://unsplash.com/license). Credits — Earth, forest canopy, wind turbines, solar farm via Unsplash.

## Notes

- The contact form is a front-end prototype (client-side confirmation only); wire it to an email/CRM endpoint before production use.
- Standards, services and contact details are drawn from the public OffsetEase site.

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)

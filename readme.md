# Jainam Damanwala — Interactive Portfolio



Personalized adaptation of Bruno Simon’s folio-2025 (MIT). The original license is preserved in license.md and static/license.txt.



## Run



Use Node.js 22.18+ or 24+. Run `npm ci --legacy-peer-deps`, then `npm run dev`. Run `npm run build` to produce dist; `npm run preview` serves the production build.



The retained upstream vite-plugin-restart peer declaration predates Vite 7, hence legacy-peer-deps. No multiplayer service is configured. The 3D world works without it; online leaderboards and visitor whispers do not persist.



## Content



Profile: static/profile.html. Projects: sources/data/projects.js and sources/data/lab.js. Contact: sources/data/social.js. Resume: static/Jainam-Damanwala-Resume.pdf. Text content is based on the user-provided resume; education and current employment retain its stated status.



The original world and scenery are credited to Bruno Simon. This adaptation does not claim their authorship. Music by Kounine (CC0, as documented in the upstream project).


## September 2026 revision

Updated from JainamDamanwalaResume_2026.pdf. Software and interactive work lead the portfolio. Accessible chat-history projects are labeled coursework or professional work. Classmates' projects are excluded. No unpublished game titles or repository URLs are claimed. Project data is in scripts/portfolio-content.json.

## Full project catalog

Includes all 49 projects explicitly supplied by Jainam, plus the prior interactive portfolio and adaptive dashboard. Paradise Game Studio is the flagship. Chess search improvements and Sudoku planned features retain their stated development status. Published game titles and store URLs were not supplied.

## GitHub Pages

Live site: https://jainamdamanwala.github.io/Portfolio3D/

Pushes to main automatically build and deploy through GitHub Actions. Select GitHub Actions in Settings → Pages → Build and deployment → Source. Local profile, project, and résumé links support the repository subpath.

# MyWeb

Seungyun Lim's personal portfolio. A static site built with HTML, CSS, and browser JavaScript; no installation or build step is required.

## Local preview

From the project folder:

```sh
python -m http.server 8000 --bind 127.0.0.1
```

Open `http://127.0.0.1:8000`. Stop the server with Ctrl+C.

## Structure

- `index.html`: introduction, selected projects, interests, direction, and GitHub contact.
- `about.html`: background, timeline, and learning process.
- `projects.html`: project collection.
- `projects/`: case studies and unfinished project notes.
- `interests/`: individual interest pages.
- `style.css`: existing shared stylesheet imports.
- `css/theme.css`: site-wide visual system and responsive layouts, loaded **after** other styles on every page.
- `js/site.js`: shared mobile navigation.
- `css/about-lab.css`: About page visual design, responsive layout, and motion preferences.
- `js/about.js`: perspectives, accessible journey tabs, and learning-process interaction.
- `js/project-pages.js`: MaplePath's illustrative, browser-only preview.

## Design conventions

Use blue for actions, navy for headings, and white or pale slate backgrounds. Keep body copy at least 16px, use clear focus states, and respect reduced-motion preferences. The homepage uses `.wrap`, `.home-section`, `.action`, and `.eyebrow` as reusable layout and UI primitives.

The header and footer are static HTML repeated across pages. Update all pages when changing shared navigation. Internal URLs in nested pages need the `../` prefix. When adding a page, include the viewport meta tag, a single `h1`, `main#main-content`, `css/theme.css`, and `js/site.js`.

## Content still to complete

FindInPI, Robot Tool Database, STEM, sports, and music retain their unfinished detail content. MaplePath's public repository and full live demo links still need to be supplied. Its embedded preview is sample data, not a connection to the actual application.

This checkout tracks `https://github.com/mape-yt/MyWeb.git`. Local edits do not publish automatically; hosting configuration must be checked separately before deployment.

# UniVEP — GitHub Pages deployment

This is a static project page. No installation or build is required.

## Publish

1. Extract this ZIP. Upload all extracted files to the root of your new GitHub repository. `index.html` must be at the root next to `style.css`, `motion.css`, `app.js`, `motion.js`, `config.js`, `data.js` and `assets/`.
2. Open repository Settings → Pages. Select **Deploy from a branch**, branch **main**, folder **/(root)**, then Save.
3. Open the actual URL shown in GitHub Pages once deployment finishes.

## Links to replace

Open `config.js` and set `paperUrl` to the final arXiv abstract URL and `codeUrl` to the released code repository. The Paper placeholder currently points to https://arxiv.org/; no manuscript or figure PDF is bundled. The Cite button links to the on-page BibTeX.

Once your Pages address is known, replace the `og:image` content in `index.html` with the absolute URL of `assets/figures/teaser-social.png` on your site for social sharing.

All runtime assets use relative paths, so project subdirectories work. Keep the `assets/` tree intact. The original figures are vector SVGs. Drawer Cube Place is supplied as fast-start H.264 MP4 in 1080p and 720p.

## Charts and animation

- Bars grow from a zero baseline. Exact values appear after the bars.
- NFE lines draw left-to-right across measured budgets. Hover/tap for exact data; click the legend to compare methods. Focus a chart and use left/right arrows for keyboard inspection.
- Real-robot bars retain the paper's exact table values.
- Replay controls and scroll re-entry replay the charts. Reduced-motion preferences show the complete static charts.
- The original NFE vector figure and full numeric tables remain expandable.

The animation approach was informed by PEAR's public project page (https://mit-han-lab.github.io/pear-blog/), implemented independently with UniVEP data.

## November 19 update

The manuscript teaser, method, noise analysis, action geometry and real-robot figures have been replaced. Body copy and results use the new two-versus-sixteen comparison. All prose and supporting labels enter in short, staggered scroll sequences. NFE tooltips and the numerical table show mean ± SD wherever the manuscript reports three seeds. Standard deviations are never fabricated for appendix-only points.

Upload the complete contents of this ZIP to the repository root, including `editorial.css`, `text-motion.js` and the local font files. Keep the Paper URL in `config.js` as the arXiv placeholder until the final link is ready. No PDF is distributed.

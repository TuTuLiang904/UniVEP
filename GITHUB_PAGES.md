# Deploy the UniVEP project page

1. Extract the ZIP and place its contents in the repository folder used by GitHub Pages. Replace the old site files with the new versions, preserving `index.html`, `.nojekyll`, scripts, stylesheets, and the full `assets/` tree together.
2. In **Settings → Pages**, choose the branch and folder containing `index.html`.
3. Open the URL shown by GitHub Pages. No build step is required.

Paper links use the arXiv URL in `config.js`. When the code is released, set `codeUrl` there and update the Code button text in `index.html`. Its width is set in `research-story.css`. Cite opens the on-page BibTeX.

Open the extracted `index.html` directly for local preview. The page shows high-resolution files from `assets/figures/preview/`, and each figure links to its original PDF in `assets/figures/`. For social sharing, use the absolute URL to `assets/figures/teaser-social.png` on the destination domain in the `og:image` tag.

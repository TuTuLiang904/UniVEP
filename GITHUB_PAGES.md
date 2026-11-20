# Deploy the UniVEP project page

1. Extract the ZIP and place its contents in the repository folder used by GitHub Pages. Keep `index.html`, scripts, stylesheets, and the full `assets/` tree together.
2. In **Settings → Pages**, choose the branch and folder containing `index.html`.
3. Open the URL shown by GitHub Pages. No build step is required.

Paper links use the arXiv URL in `config.js`. When the code is released, set `codeUrl` there and update the Code button text in `index.html`. Its width is set in `research-story.css`. Cite opens the on-page BibTeX.

All paper figures load from the original PDFs in `assets/figures/`. Keep those files and the local PDFium worker assets together. For local preview, run `python3 -m http.server 8000` in the extracted folder and visit `http://localhost:8000`. For social sharing, use the absolute URL to `assets/figures/teaser-social.png` on the destination domain in the `og:image` tag.

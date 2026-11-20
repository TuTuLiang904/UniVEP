// Render the original local PDF files in a worker so the page stays responsive.
const states = new WeakMap();
const visible = new Set();
const pending = new Map();
let renderer;
let serial = 0;

function fail(element) {
  element.dataset.pdfState = 'error';
  element.setAttribute('aria-busy', 'false');
  element.querySelector('.pdf-status').textContent = 'Open the original PDF to view this figure.';
}
function worker() {
  if (renderer) return renderer;
  renderer = new Worker(new URL('./pdf-worker.js', import.meta.url), {type: 'module'});
  renderer.onmessage = ({data}) => {
    const element = pending.get(data.id);
    pending.delete(data.id);
    if (!element || states.get(element)?.ticket !== data.id) return;
    if (data.error) {
      fail(element);
      console.error('PDF figure could not be displayed:', element.dataset.pdf, data.error);
      return;
    }
    const canvas = element.querySelector('canvas');
    canvas.width = data.width;
    canvas.height = data.height;
    const pixels = new ImageData(new Uint8ClampedArray(data.buffer), data.width, data.height);
    canvas.getContext('2d', {alpha: false}).putImageData(pixels, 0, 0);
    element.style.aspectRatio = `${data.originalWidth} / ${data.originalHeight}`;
    element.dataset.pdfState = 'rendered';
    element.dataset.pdfPixels = `${data.width}×${data.height}`;
    element.setAttribute('aria-busy', 'false');
  };
  renderer.onerror = event => {
    pending.forEach(fail);
    pending.clear();
    console.error('PDF worker could not start:', event.message);
  };
  return renderer;
}
function draw(element) {
  const state = states.get(element);
  const url = element.dataset.pdf;
  const width = element.clientWidth;
  if (!state || !url || width < 8) return;
  const density = Math.min(3, Math.max(2, devicePixelRatio || 1));
  const pixels = Math.max(1, Math.round(width * density));
  const key = `${url}|${pixels}`;
  if (state.key === key) return;
  const id = ++serial;
  state.key = key;
  pending.delete(state.ticket);
  state.ticket = id;
  element.dataset.pdfState = 'loading';
  element.querySelector('.pdf-status').textContent = 'Loading figure…';
  element.setAttribute('aria-busy', 'true');
  pending.set(id, element);
  try {
    worker().postMessage({id, url: new URL(url, document.baseURI).href, width: pixels});
  } catch (error) {
    pending.delete(id);
    fail(element);
    console.error('Could not initialize the PDF worker:', error);
  }
}
const observer = new IntersectionObserver(entries => {
  for (const {target, isIntersecting} of entries) {
    if (isIntersecting) {
      visible.add(target);
      draw(target);
    } else {
      visible.delete(target);
    }
  }
}, {rootMargin: '350px 0px'});
const resize = new ResizeObserver(entries => {
  for (const {target} of entries) {
    if (visible.has(target) || target.closest('dialog[open]')) draw(target);
  }
});
function arm(element) {
  if (!states.has(element)) {
    states.set(element, {ticket: 0, key: ''});
    observer.observe(element);
    resize.observe(element);
  }
  if (element.closest('dialog[open]')) draw(element);
}
document.querySelectorAll('[data-pdf]').forEach(arm);
window.UNIVEP_PDF = {refresh: arm};

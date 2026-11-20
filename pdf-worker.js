import {PDFiumLibrary} from './assets/vendor/pdfium/index.esm.browser.js';

const library = PDFiumLibrary.init({
  wasmUrl: new URL('./assets/vendor/pdfium/pdfium.wasm', import.meta.url).href
}).then(runtime => ({runtime}), error => ({error}));
const documents = new Map();
let work = Promise.resolve();

function open(url) {
  if (!documents.has(url)) {
    const bytes = fetch(url).then(response => {
      if (!response.ok) throw Error(`Could not load PDF (${response.status})`);
      return response.arrayBuffer();
    });
    const document = Promise.all([library, bytes]).then(([result, buffer]) => {
      if (result.error) throw result.error;
      return result.runtime.loadDocument(new Uint8Array(buffer));
    });
    documents.set(url, document.catch(error => {
      documents.delete(url);
      throw error;
    }));
  }
  return documents.get(url);
}
async function render({id, url, width}) {
  try {
    const document = await open(url);
    const page = document.getPage(0);
    try {
      const {originalWidth, originalHeight} = page.getOriginalSize();
      const height = Math.max(1, Math.round(width * originalHeight / originalWidth));
      const bitmap = await page.render({
        width, height, scale: 1, colorSpace: 'RGBA', render: 'bitmap', transparent: false
      });
      self.postMessage({
        id, width: bitmap.width, height: bitmap.height, originalWidth, originalHeight,
        buffer: bitmap.data.buffer
      }, [bitmap.data.buffer]);
    } finally {
      page.close();
    }
  } catch (error) {
    self.postMessage({id, error: error?.message || String(error)});
  }
}
self.onmessage = ({data}) => { work = work.then(() => render(data)); };

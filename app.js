(() => {
  'use strict';
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const labels = {v:'V', x:'X', xv:'X–V', u:'UniVEP', ux:'UniVEP–X'};
  const data = window.UNIVEP_DATA;
  const config = window.UNIVEP_CONFIG || {};
  $$('[data-resource="paper"]').forEach(a => {a.href=config.paperUrl || 'https://arxiv.org/abs/2611.26103';});
  $$('[data-resource="code"]').forEach(a => {a.href=config.codeUrl || 'https://example.com/';});

  // The exact switch used in the manuscript; this is a mode selector, not a rollout simulation.
  const slider = $('#noise-level');
  function updateMode() {
    const sigma = Number(slider.value) / 100;
    const isX = sigma >= 0.5;
    $('#noise-output').textContent = `σ = ${sigma.toFixed(2)}`;
    $('#noise-output').style.color = isX ? '#0d9488' : '#7860ef';
    slider.style.accentColor = isX ? '#0d9488' : '#7860ef';
    $('#selected-mode').dataset.mode = isX ? 'x' : 'v';
    $('#mode-letter').textContent = isX ? 'X' : 'V';
    $('#mode-title').textContent = isX ? 'Endpoint recovery' : 'Velocity refinement';
    $('#mode-description').textContent = isX ? 'σ ≥ σ*: select the endpoint mode.' : 'σ < σ*: select the velocity mode.';
  }
  slider.addEventListener('input', updateMode);
  updateMode();

  // Every paper figure is read directly from its original PDF.
  const dialog = $('#figure-dialog');
  let previousFocus;
  $$('[data-zoom]').forEach(button => button.addEventListener('click', () => {
    previousFocus = button;
    const caption = button.dataset.caption || 'Original paper figure';
    const frame = $('#dialog-pdf');
    frame.dataset.pdf = button.dataset.zoom;
    frame.setAttribute('role', 'img');
    frame.setAttribute('aria-label', caption);
    frame.style.aspectRatio = button.querySelector('[data-pdf]')?.style.aspectRatio || '1.8';
    $('#dialog-title').textContent = caption;
    $('#dialog-original').href = button.dataset.zoom;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    $('.dialog-pdf-wrap').scrollTo(0, 0);
    window.UNIVEP_PDF?.refresh(frame);
    $('#close-dialog').focus();
  }));
  $('#close-dialog').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.body.style.overflow = '';
    if (previousFocus) previousFocus.focus({preventScroll:true});
  });

  function renderPolicy(key) {
    const model = data.models[key]; if (!model) return;
    $$('.numerical-detail .policy-tabs [role=tab]').forEach(tab => { const active=tab.dataset.policy===key; tab.setAttribute('aria-selected',String(active)); tab.tabIndex=active?0:-1; });
    $('#policy-panel').setAttribute('aria-labelledby',`tab-${key}`); $('#policy-note').textContent=model.note;
    const keys=['v','x','xv','u','ux'].filter(k=>model.series[k]);
    let table=`<table class="results-table"><caption class="sr-only">Exact ${model.name} success rates in percent. Standard deviation across three training seeds is included where reported.</caption><thead><tr><th scope="col">Recipe / NFE</th>${data.budgets.map(n=>`<th scope="col">${n}</th>`).join('')}</tr></thead><tbody>`;
    keys.forEach(k=>{ table+=`<tr${k==='u'?' class="ours-row"':''}><th scope="row">${labels[k]}</th>`; model.series[k].forEach((v,i)=>{const best=v!=null && v===Math.max(...keys.map(q=>model.series[q][i]).filter(n=>n!=null)),sd=model.sd?.[k]?.[i];table+=`<td${best?' class="best"':''}>${v==null?'—':v.toFixed(2)+(sd!=null?`<span class="sd"> ± ${sd.toFixed(2)}</span>`:'')}</td>`;});table+='</tr>';});
    $('#nfe-table').innerHTML=table+'</tbody></table>';
  }
  $$('.numerical-detail .policy-tabs [role=tab]').forEach(tab=>{
    tab.addEventListener('click',()=>renderPolicy(tab.dataset.policy));
    tab.addEventListener('keydown',event=>{const tabs=$$('.numerical-detail .policy-tabs [role=tab]');let i=tabs.indexOf(tab);if(event.key==='ArrowRight')i=(i+1)%tabs.length;else if(event.key==='ArrowLeft')i=(i-1+tabs.length)%tabs.length;else if(event.key==='Home')i=0;else if(event.key==='End')i=tabs.length-1;else return;event.preventDefault();renderPolicy(tabs[i].dataset.policy);tabs[i].focus();});
  });
  renderPolicy('lila');

  function renderBenchmark(key) {
    const model=data.nativeBenchmarks[key];
    if (!model) return;
    $$('.benchmark-tabs [role=tab]').forEach(tab=>{const active=tab.dataset.benchmark===key;tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1;});
    $('#benchmark-panel').setAttribute('aria-labelledby',`benchmark-tab-${key}`);
    const columns=['LIBERO','LIBERO-Plus','RoboTwin Clean','RoboTwin Randomized'];
    const best=columns.map((_,i)=>Math.max(...model.rows.map(row=>row.values[i])));
    $('#benchmark-table').innerHTML=`<table class="results-table"><caption>${model.name} · ${model.nfe} network evaluations</caption><thead><tr><th scope="col">Recipe</th>${columns.map(name=>`<th scope="col">${name}</th>`).join('')}</tr></thead><tbody>${model.rows.map(row=>`<tr${row.key==='u'?' class="ours-row"':''}><th scope="row">${row.recipe}</th>${row.values.map((v,i)=>`<td${v===best[i]?' class="best"':''}>${v.toFixed(2)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
    $('#benchmark-note').textContent=model.note;
  }
  const benchmarkTabs=$$('.benchmark-tabs [role=tab]');
  benchmarkTabs.forEach(tab=>{
    tab.addEventListener('click',()=>renderBenchmark(tab.dataset.benchmark));
    tab.addEventListener('keydown',event=>{let i=benchmarkTabs.indexOf(tab);if(event.key==='ArrowRight')i=(i+1)%benchmarkTabs.length;else if(event.key==='ArrowLeft')i=(i-1+benchmarkTabs.length)%benchmarkTabs.length;else if(event.key==='Home')i=0;else if(event.key==='End')i=benchmarkTabs.length-1;else return;event.preventDefault();renderBenchmark(benchmarkTabs[i].dataset.benchmark);benchmarkTabs[i].focus();});
  });
  renderBenchmark('star');
  // H.264 fast-start files; smaller screens and data-saving connections get 720p.
  const video=$('#drawer-video'),quality=$('#video-quality');
  const saveData=Boolean(navigator.connection?.saveData);
  function setVideoQuality(choice,initial=false){
    const stream=choice==='auto'?(matchMedia('(max-width:720px)').matches||saveData?'720':'1080'):choice;
    const src=`assets/video/drawer-cube-place-${stream}.mp4`;if(video.getAttribute('src')===src)return;
    const time=video.currentTime||0,resume=!video.paused;video.src=src;
    if(!initial)video.addEventListener('loadedmetadata',()=>{video.currentTime=Math.min(time,Math.max(0,video.duration-.1));if(resume)video.play().catch(()=>{});},{once:true});
    video.load();
  }
  quality.addEventListener('change',()=>setVideoQuality(quality.value));setVideoQuality('auto',true);
  let autoStarted=false;
  const mediaObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){video.preload='auto';if(!autoStarted&&!saveData&&!matchMedia('(prefers-reduced-motion: reduce)').matches){autoStarted=true;video.muted=true;video.play().catch(()=>{});}}else if(!video.paused)video.pause();}),{threshold:.35});
  mediaObserver.observe(video);

  const copyButton = $('#copy-citation');
  copyButton.addEventListener('click', async () => {
    const text = $('#bibtex code').textContent.trim();
    let success = false;
    try { await navigator.clipboard.writeText(text); success = true; }
    catch (_) {
      const field = document.createElement('textarea');
      field.value = text; field.style.position = 'fixed'; field.style.opacity = '0';
      document.body.appendChild(field); field.select();
      try { success = document.execCommand('copy'); } catch (_) {}
      field.remove();
    }
    copyButton.textContent = success ? 'Copied ✓' : 'Select the citation below';
    $('#copy-status').textContent = success ? 'BibTeX citation copied to clipboard.' : 'Could not copy automatically. Download the BibTeX file or select the citation text.';
    window.setTimeout(() => {copyButton.innerHTML='Copy citation <span aria-hidden="true">⧉</span>';},2200);
  });
  const navLinks = $$('.site-header nav a');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navLinks.forEach(link => link.classList.toggle('active', link.hash === `#${entry.target.id}`));
    });
  },{rootMargin:'-15% 0px -65% 0px',threshold:0});
  navLinks.map(link=>document.querySelector(link.hash)).filter(Boolean).forEach(section=>observer.observe(section));
})();

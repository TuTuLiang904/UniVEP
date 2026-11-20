(() => {
  'use strict';
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const targets=new Set(),played=new WeakSet(),frames=new Map();
  const selectors=['.target-definition','.path-equation','.finding-pair article','.residual-explanation','.result-highlights>div','.hero-logo','.hero h1','.authors .author-row>span','.author-notes','.affiliations p','.institution-logos img','.resource-links a','.site-header .brand','.site-header nav a','.nav-paper','main h2','main h3','main h4','main p','main figcaption','main summary','main .section-kicker','.summary-route','.chart-legend','.coverage-line','.policy-tabs','.video-heading label','.selector-heading>span','.mode-selector>label','.range-labels','.selected-mode','.robot-stat .stat','.citation-toolbar','main pre','.table-scroll','.site-footer a','.site-footer p'].join(',');
  function count(el){
    if(played.has(el))return;played.add(el);
    const value=Number(el.dataset.count),decimals=Number(el.dataset.decimals||0);
    if(!Number.isFinite(value))return;
    if(reduced.matches||value===0){el.textContent=value.toFixed(decimals);return;}
    const start=performance.now();
    function tick(now){const p=Math.min(1,(now-start)/1150);el.textContent=(value*(1-Math.pow(1-p,3))).toFixed(decimals);if(p<1)frames.set(el,requestAnimationFrame(tick));else frames.delete(el);}
    frames.set(el,requestAnimationFrame(tick));
  }
  function show(el){
    if(el.classList.contains('text-shown'))return;
    el.classList.add('text-shown');el.dataset.textState='shown';observer?.unobserve(el);
    if(el.matches('[data-count]'))count(el);el.querySelectorAll('[data-count]').forEach(count);
  }
  const observer=(!reduced.matches&&'IntersectionObserver' in window)?new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)show(e.target);}),{rootMargin:'0px 0px -7% 0px',threshold:0}):null;
  function arm(root=document){
    const elements=[...(root.matches?.(selectors)?[root]:[]),...root.querySelectorAll(selectors)];
    elements.forEach(el=>{
      if(targets.has(el)||el.matches('.sr-only')||el.closest('dialog,.chart-tooltip,.sr-only')||el.parentElement?.closest('[data-text-reveal]'))return;
      targets.add(el);el.dataset.textReveal='';
      let delay=0;
      if(el.closest('.hero')){
        if(el.matches('h1'))delay=70;
        else if(el.closest('.authors'))delay=120+Math.min(10,[...document.querySelectorAll('.authors .author-row>span')].indexOf(el))*22;
        else if(el.matches('.author-notes'))delay=220;
        else if(el.closest('.affiliations'))delay=240;
        else if(el.closest('.institution-logos'))delay=260;
        else if(el.closest('.resource-links'))delay=300;
      }else if(el.matches('h2'))delay=40;else if(el.matches('h3,h4'))delay=70;else if(el.matches('p'))delay=100;else if(el.matches('figcaption'))delay=150;
      el.style.setProperty('--text-delay',`${delay}ms`);el.classList.add('text-ready');el.dataset.textState='waiting';
      if(observer)observer.observe(el);else show(el);
    });
  }
  function sweep(){targets.forEach(el=>{if(el.dataset.textState==='shown')return;const r=el.getBoundingClientRect();if(r.height>0&&r.width>0&&r.top<innerHeight*.95&&r.bottom>0)show(el);});}
  arm();document.documentElement.dataset.textMotion=reduced.matches?'reduced':'enabled';requestAnimationFrame(sweep);
  window.addEventListener('load',sweep,{once:true});setTimeout(sweep,450);
  document.addEventListener('toggle',()=>requestAnimationFrame(sweep),true);
  document.addEventListener('focusin',e=>{const el=e.target.closest?.('[data-text-reveal]');if(el)show(el);});
  reduced.addEventListener('change',()=>{document.documentElement.dataset.textMotion=reduced.matches?'reduced':'enabled';if(reduced.matches){targets.forEach(show);frames.forEach((id,el)=>{cancelAnimationFrame(id);el.textContent=Number(el.dataset.count).toFixed(Number(el.dataset.decimals||0));});frames.clear();}});
  const table=document.getElementById('nfe-table');
  if(table)new MutationObserver(()=>{if(!targets.has(table))arm(table);else if(!reduced.matches){table.classList.remove('text-shown');table.dataset.textState='waiting';observer?.observe(table);requestAnimationFrame(sweep);}}).observe(table,{childList:true});
  let scrollFrame=0;
  function reading(){const h=document.documentElement.scrollHeight-innerHeight;document.documentElement.style.setProperty('--reading-progress',h>0?String(Math.max(0,Math.min(1,scrollY/h))):'0');document.querySelector('.site-header')?.classList.toggle('scrolled',scrollY>40);scrollFrame=0;}
  window.addEventListener('scroll',()=>{if(!scrollFrame)scrollFrame=requestAnimationFrame(reading);},{passive:true});
  window.addEventListener('resize',()=>{if(!scrollFrame)scrollFrame=requestAnimationFrame(reading);},{passive:true});reading();
})();

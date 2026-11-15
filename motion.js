(() => {
  'use strict';
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const data = window.UNIVEP_DATA;
  const names = {v:'V-pred', x:'X-pred', xv:'X-pred (V-loss)', u:'UniVEP', ux:'UniVEP–X'};
  // Match the prediction-target colors of the manuscript's original NFE figure.
  const colors = {v:'#2563eb', x:'#0d9488', xv:'#7c3aed', u:'#e11d48', ux:'#d97706'};
  const order = ['v','x','xv','u','ux'];
  const motionQuery = matchMedia('(prefers-reduced-motion: reduce)');
  document.documentElement.dataset.motionPreference=motionQuery.matches?'reduce':'no-preference';
  const timers = new WeakMap();
  const registry = new Map();
  const cleanups = [];
  const fmt = n => Number.isInteger(n) ? String(n) : n.toFixed(2);
  const replayIcon = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 5.5A5 5 0 1 1 3 10M3.5 2v3.5H7"/></svg>';
  $$('[data-replay]').forEach(b => {b.innerHTML = replayIcon + '<span>Replay</span>';});

  function settle(el) {
    clearTimeout(timers.get(el));
    el.classList.add('is-in');
    el.dataset.motionState = 'complete';
  }
  function reset(el) {
    clearTimeout(timers.get(el));
    el.classList.remove('is-in');
    el.dataset.motionState = 'ready';
  }
  function play(el) {
    if (motionQuery.matches) {settle(el); return;}
    reset(el);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      el.classList.add('is-in');
      el.dataset.motionState = 'running';
      timers.set(el, setTimeout(() => {el.dataset.motionState = 'complete';}, 2150));
    }));
  }
  const observer = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (motionQuery.matches) {settle(e.target);return;}
      if (e.isIntersecting && e.intersectionRatio >= .2 && !e.target.classList.contains('is-in')) play(e.target);
      else if (!e.isIntersecting && (e.boundingClientRect.bottom <= 0 || e.boundingClientRect.top >= innerHeight)) reset(e.target);
    });
  }, {threshold:[0,.2]}) : null;
  function register(el, group) {
    el.classList.add('motion-ready');
    if (!registry.has(group)) registry.set(group, []);
    registry.get(group).push(el);
    if (motionQuery.matches || !observer) settle(el);
    else {reset(el);observer.observe(el);}
  }
  $$('[data-replay]').forEach(b => b.addEventListener('click', () => {
    hideTooltips();
    (registry.get(b.dataset.replay) || []).forEach(el => {
      const rect=el.getBoundingClientRect();
      if (rect.bottom > 0 && rect.top < innerHeight) play(el);
      else if (!motionQuery.matches) reset(el);
    });
  }));
  motionQuery.addEventListener('change', () => {
    document.documentElement.dataset.motionPreference=motionQuery.matches?'reduce':'no-preference';
    registry.forEach(elements => elements.forEach(el => {
      if (motionQuery.matches) settle(el);
      else {const r=el.getBoundingClientRect();if(r.bottom>0 && r.top<innerHeight)play(el);else reset(el);}
    }));
  });
  function placeTooltip(surface, tip, x, y) {
    const w=tip.offsetWidth, h=tip.offsetHeight;
    tip.style.left=`${Math.max(8,Math.min(x+14,surface.clientWidth-w-8))}px`;
    tip.style.top=`${Math.max(5,Math.min(y+12,surface.clientHeight-h-5))}px`;
  }
  function hideTooltips() {cleanups.forEach(fn => fn());}
  window.addEventListener('scroll', hideTooltips, {passive:true});
  document.addEventListener('keydown', e => {if(e.key==='Escape')hideTooltips();});

  // Two independent, zero-based scales make both measured effects visible.
  const comparison=$('#efficiency-chart');
  if (comparison) register(comparison, 'efficiency');

  // Lines connect measured observations only. No fitting, smoothing, or new samples.
  const hidden = new Set();
  const grid=$('#nfe-grid');
  const legend=$('#nfe-legend');
  legend.innerHTML=order.map(k=>`<button type="button" data-series="${k}" aria-pressed="true" aria-label="Show ${names[k]}" style="--series-color:${colors[k]}"><i class="legend-line" aria-hidden="true"></i>${names[k]}</button>`).join('');
  const nfePanels=[];
  ['star','lila','fast','scratch'].forEach(key => {
    const article=document.createElement('article');
    article.className='nfe-panel'; article.dataset.model=key;
    article.innerHTML=`<h4 id="chart-title-${key}">${data.models[key].name}</h4><div class="chart-surface"><svg class="line-chart" tabindex="0" role="img" aria-labelledby="chart-title-${key}" aria-describedby="nfe-interaction-hint"></svg><div class="chart-tooltip" role="tooltip" hidden></div><span class="sr-only chart-announcement" role="status" aria-live="polite"></span></div>`;
    grid.appendChild(article);nfePanels.push(article);
    renderNfe(article,key);
    register(article,'nfe');
  });
  function renderNfe(article,key) {
    const surface=$('.chart-surface',article),svg=$('svg',surface),tip=$('.chart-tooltip',surface),announcement=$('.chart-announcement',surface);
    const compact=surface.clientWidth<440;
    const W=compact?420:520,H=compact?280:310,L=47,R=W-17,T=30,B=H-51;
    const ranges={star:[30,70],lila:[60,90],fast:[30,80],scratch:[40,80]};
    const [min,max]=ranges[key],model=data.models[key];
    const keys=order.filter(k=>model.series[k]);
    const measuredIndices=data.budgets.map((_,i)=>i).filter(i=>keys.some(k=>model.series[k][i]!=null));
    const x=n=>L+Math.log2(n)/4*(R-L), y=v=>B-(v-min)/(max-min)*(B-T);
    svg.setAttribute('viewBox',`0 0 ${W} ${H}`);
    svg.setAttribute('data-y-domain',`${min},${max}`);
    svg.setAttribute('data-x-scale','log2');
    let html=`<title>${model.name}: measured success versus function evaluations</title><desc>RoboTwin Clean, 50 tasks. Y axis ${min} to ${max} percent. X axis is logarithmic. Use left and right arrow keys to inspect measured budgets.</desc><defs><clipPath id="nfe-clip-${key}"><rect x="${L-5}" y="${T-8}" width="${R-L+10}" height="${B-T+16}"/></clipPath></defs>`;
    for(let v=min;v<=max;v+=10)html+=`<line class="chart-gridline" x1="${L}" x2="${R}" y1="${y(v)}" y2="${y(v)}"/><text class="chart-tick" x="${L-12}" y="${y(v)+4}" text-anchor="end">${v}</text>`;
    html+=`<text class="chart-axis-title" x="${L}" y="14">Success (%)</text><line class="chart-axis" x1="${L}" x2="${R}" y1="${B}" y2="${B}"/>`;
    measuredIndices.forEach(i => {const n=data.budgets[i];html+=`<line class="chart-axis" x1="${x(n)}" x2="${x(n)}" y1="${B}" y2="${B+5}"/><text class="chart-tick" x="${x(n)}" y="${B+21}" text-anchor="middle">${n}</text>`;});
    html+=`<text class="chart-axis-title" x="${(L+R)/2}" y="${H-5}" text-anchor="middle">Function evaluations (NFE, log₂ scale)</text>`;
    keys.forEach((k,si) => {
      const values=model.series[k],points=values.map((v,i)=>v==null?null:[x(data.budgets[i]),y(v),v,i]).filter(Boolean);
      const path=points.map((p,i)=>`${i?'L':'M'}${p[0].toFixed(3)},${p[1].toFixed(3)}`).join(' ');
      html+=`<g class="chart-series series-${k}${hidden.has(k)?' series-hidden':''}" data-series="${k}" style="--series-color:${colors[k]}" clip-path="url(#nfe-clip-${key})"><path class="data-line" pathLength="1" d="${path}" style="--delay:${si*45}ms"/>`;
      points.forEach(p => {html+=`<circle class="data-point" cx="${p[0]}" cy="${p[1]}" r="${k==='u'?3.9:3.2}" data-nfe="${data.budgets[p[3]]}" data-value="${p[2]}" style="--delay:${Math.round(100+Math.log2(data.budgets[p[3]])/4*1450+si*45)}ms"><title>${names[k]}, NFE ${data.budgets[p[3]]}: ${p[2].toFixed(2)}%</title></circle>`;});
      html+='</g>';
    });
    html+=`<g class="cursor-layer" visibility="hidden" aria-hidden="true"><line class="chart-crosshair" x1="${L}" x2="${L}" y1="${T}" y2="${B}"/>${keys.map(k=>`<circle class="cursor-point" data-cursor-series="${k}" r="4.6" style="--series-color:${colors[k]}"/>`).join('')}</g>`;
    svg.innerHTML=html;
    const cursor=$('.cursor-layer',svg),crosshair=$('.chart-crosshair',svg);
    let selected=1,raf=0,pending=null,pointerStart;
    function close(){tip.hidden=true;cursor.style.display='none';cursor.setAttribute('visibility','hidden');}
    // Each re-render replaces the surface's previous cleanup rather than retaining its DOM.
    surface._closeTip=close;
    function inspect(i,px,py,speak=false) {
      selected=i;
      const rows=keys.filter(k=>!hidden.has(k)&&model.series[k][i]!=null);
      if(!rows.length){close();return;}
      crosshair.setAttribute('x1',x(data.budgets[i]));crosshair.setAttribute('x2',x(data.budgets[i]));
      $$('[data-cursor-series]',cursor).forEach(c=>{
        const k=c.dataset.cursorSeries,v=model.series[k][i],show=!hidden.has(k)&&v!=null;
        c.setAttribute('visibility',show?'visible':'hidden');
        if(show){c.setAttribute('cx',x(data.budgets[i]));c.setAttribute('cy',y(v));}
      });
      cursor.style.display='';cursor.setAttribute('visibility','visible');
      tip.innerHTML=`<span class="tooltip-heading">${model.name} · NFE ${data.budgets[i]}</span>${rows.map(k=>`<span class="tooltip-row" style="--series-color:${colors[k]}"><i class="tooltip-dot"></i><span>${names[k]}</span><strong>${model.series[k][i].toFixed(2)}%</strong></span>`).join('')}`;
      tip.hidden=false;placeTooltip(surface,tip,px,py);
      if(speak)announcement.textContent=`NFE ${data.budgets[i]}. ${rows.map(k=>`${names[k]} ${model.series[k][i].toFixed(2)} percent`).join('; ')}.`;
    }
    function inspectPointer(e){
      const rect=svg.getBoundingClientRect(),vx=(e.clientX-rect.left)/rect.width*W;
      if(vx<L-10||vx>R+10){close();return;}
      const distances=measuredIndices.map(i=>Math.abs(x(data.budgets[i])-vx)),i=measuredIndices[distances.indexOf(Math.min(...distances))];
      inspect(i,e.clientX-rect.left,e.clientY-rect.top);
    }
    svg.onpointermove=e=>{
      if(e.pointerType==='touch')return;
      pending={clientX:e.clientX,clientY:e.clientY};
      if(!raf)raf=requestAnimationFrame(()=>{raf=0;if(pending)inspectPointer(pending);});
    };
    svg.onpointerdown=e=>{pointerStart={x:e.clientX,y:e.clientY,t:performance.now()};};
    svg.onpointerup=e=>{if(e.pointerType==='touch'&&pointerStart&&Math.hypot(e.clientX-pointerStart.x,e.clientY-pointerStart.y)<12&&performance.now()-pointerStart.t<700)inspectPointer(e);};
    svg.onpointerleave=()=>{pending=null;cancelAnimationFrame(raf);raf=0;if(document.activeElement!==svg)close();};
    svg.onblur=close;
    svg.onfocus=()=>inspect(selected,x(data.budgets[selected])/W*surface.clientWidth,25,true);
    svg.onkeydown=e=>{
      let i=selected;
      const position=measuredIndices.indexOf(i);
      if(e.key==='ArrowRight')i=measuredIndices[Math.min(measuredIndices.length-1,position+1)];
      else if(e.key==='ArrowLeft')i=measuredIndices[Math.max(0,position-1)];
      else if(e.key==='Home')i=measuredIndices[0];
      else if(e.key==='End')i=measuredIndices[measuredIndices.length-1];
      else if(e.key==='Escape'){close();return;}
      else return;
      e.preventDefault();inspect(i,x(data.budgets[i])/W*surface.clientWidth,25,true);
    };
  }
  nfePanels.forEach(panel=>cleanups.push(()=>{if(document.activeElement!==$('svg',panel))$('.chart-surface',panel)._closeTip?.();}));
  const canHide=k=>Object.values(data.models).every(model=>Object.keys(model.series).some(s=>s!==k&&!hidden.has(s)));
  $$('button',legend).forEach(button=>button.addEventListener('click',()=>{
    const k=button.dataset.series;
    if(hidden.has(k))hidden.delete(k);else if(canHide(k))hidden.add(k);
    $$('button',legend).forEach(b=>{
      b.setAttribute('aria-pressed',String(!hidden.has(b.dataset.series)));
      b.setAttribute('aria-disabled',String(!hidden.has(b.dataset.series)&&!canHide(b.dataset.series)));
    });
    $$('.nfe-panel .chart-series').forEach(g=>g.classList.toggle('series-hidden',hidden.has(g.dataset.series)));
    hideTooltips();
  }));
  if('ResizeObserver' in window){
    let resizeFrame=0;
    const widths=new WeakMap();
    const resize=new ResizeObserver(entries=>{
      let changed=false;
      entries.forEach(e=>{const now=e.contentRect.width,before=widths.get(e.target);widths.set(e.target,now);if(before!=null&&Math.abs(now-before)>2)changed=true;});
      if(changed){cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(()=>nfePanels.forEach(p=>renderNfe(p,p.dataset.model)));}
    });
    nfePanels.forEach(p=>resize.observe(p));
  }

  // Exact per-task real-robot data, with a common 0–100% scale in every panel.
  const robot=$('#robot-chart'),robotGrid=$('#robot-chart-grid');
  if(robot&&data.realRobot){
    const keys=['v','x','xv','u'];
    $('#robot-legend').innerHTML=keys.map(k=>`<span style="--series-color:${colors[k]}"><i class="legend-line" aria-hidden="true"></i>${names[k]}</span>`).join('');
    data.realRobot.tasks.forEach((task,ti)=>{
      const surface=document.createElement('article');surface.className='robot-chart-panel chart-surface';
      const baseline=197,top=28,height=baseline-top;
      let bars='';
      [0,50,100].forEach(v=>{const y=baseline-v/100*height;bars+=`<line class="chart-gridline" x1="34" x2="232" y1="${y}" y2="${y}"/><text class="chart-tick" x="26" y="${y+5}" text-anchor="end">${v}</text>`;});
      keys.forEach((k,ki)=>{
        const v=data.realRobot.series[k][ti],x=48+ki*46,y=baseline-v/100*height,delay=ki*55+ti*70;
        bars+=`<rect class="robot-bar" tabindex="0" role="img" aria-label="${task.name}, ${names[k]}: ${v.toFixed(2)} percent" x="${x}" y="${y}" width="29" height="${baseline-y}" data-series="${k}" data-value="${v}" style="--series-color:${colors[k]};--delay:${delay}ms"/><text class="bar-number" x="${x+14.5}" y="${y-8}" style="--delay:${delay+500}ms">${fmt(v)}</text><text class="robot-bar-label" x="${x+14.5}" y="220">${['V','X','X / V','U'][ki]}</text>`;
      });
      surface.innerHTML=`<h4>${task.name}</h4><svg class="robot-chart" viewBox="0 0 244 231" role="group" aria-label="${task.name}: success rates, 0 to 100 percent">${bars}</svg><div class="chart-tooltip" role="tooltip" hidden></div>`;
      robotGrid.appendChild(surface);
      const tip=$('.chart-tooltip',surface);robot.appendChild(tip);
      const close=()=>{tip.hidden=true;};cleanups.push(()=>{if(!surface.contains(document.activeElement))close();});
      $$('.robot-bar',surface).forEach(bar=>{
        function show(e){
          const r=robot.getBoundingClientRect(),br=bar.getBoundingClientRect();
          tip.innerHTML=`<span class="tooltip-heading">${task.name}</span><span class="tooltip-row" style="--series-color:${colors[bar.dataset.series]}"><i class="tooltip-dot"></i><span>${names[bar.dataset.series]}</span><strong>${Number(bar.dataset.value).toFixed(2)}%</strong></span><span class="tooltip-context">${task.id==='mean'?'Mean across three tasks':'50 evaluation trials'}</span>`;
          tip.hidden=false;placeTooltip(robot,tip,e?.clientX?e.clientX-r.left:br.left-r.left,e?.clientY?e.clientY-r.top:br.top-r.top);
        }
        bar.addEventListener('pointerenter',e=>{if(e.pointerType!=='touch')show(e);});
        bar.addEventListener('pointerleave',()=>{if(document.activeElement!==bar)close();});
        bar.addEventListener('click',show);
        bar.addEventListener('focus',()=>show());bar.addEventListener('blur',close);
      });
      register(surface,'robot');
    });
  }
})();

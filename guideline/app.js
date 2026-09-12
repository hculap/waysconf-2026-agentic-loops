/* app.js is one file for both languages, so every word it shows comes off the page it is
   running on rather than out of this script. */
var COPY = (document.documentElement.lang === 'pl')
  ? { done: 'Skopiowane', again: 'Kopiuj' }
  : { done: 'Copied', again: 'Copy' };

document.querySelectorAll('.copy').forEach(function(b){
  b.addEventListener('click',function(){
    var pre=document.getElementById(b.dataset.for); if(!pre) return;
    var t=pre.innerText, ok=function(){b.textContent=COPY.done;b.setAttribute('data-done','');
      setTimeout(function(){b.textContent=COPY.again;b.removeAttribute('data-done')},1600)};
    if(navigator.clipboard&&window.isSecureContext){navigator.clipboard.writeText(t).then(ok,function(){fb(t,ok)})}else{fb(t,ok)}
  });
});
function fb(t,ok){var a=document.createElement('textarea');a.value=t;a.setAttribute('readonly','');
  a.style.position='absolute';a.style.left='-9999px';document.body.appendChild(a);a.select();
  try{document.execCommand('copy');ok()}catch(e){}document.body.removeChild(a)}

/* Pick your system once and every [data-os] block on the page follows. The markup ships
   with all three visible, so a reader with JavaScript off loses nothing — the page is just
   longer. The stored choice is a convenience; every read and write is wrapped, because
   localStorage throws in a private window rather than returning nothing. */
(function(){
  var box=document.querySelector('.ospick');
  var radios=document.querySelectorAll('.ospick input[name="os"]');
  if(!box||!radios.length) return;
  var hint=document.querySelector('[data-os-hint]');
  /* Both sentences are written in the locale file with a %s where the system name goes,
     and handed over on the fieldset. No English in this file. */
  var LABELS={mac:'macOS',windows:'Windows',linux:'Linux'};
  try{ LABELS=JSON.parse(box.getAttribute('data-os-labels'))||LABELS }catch(e){}
  var GUESSED=box.getAttribute('data-os-guessed')||'';
  var SET=box.getAttribute('data-os-set')||'';

  function stored(){try{return localStorage.getItem('sp-os')}catch(e){return null}}
  function store(v){try{localStorage.setItem('sp-os',v)}catch(e){}}

  function guess(){
    var p=(navigator.userAgentData&&navigator.userAgentData.platform)||navigator.platform||navigator.userAgent||'';
    if(/mac|iphone|ipad|ipod/i.test(p)) return 'mac';
    if(/win/i.test(p)) return 'windows';
    return 'linux';
  }

  function apply(os,guessed){
    document.querySelectorAll('[data-os]').forEach(function(el){
      el.hidden = el.getAttribute('data-os')!==os;
    });
    document.querySelectorAll('.ospick input[name="os"]').forEach(function(r){
      r.checked = r.value===os;
    });
    if(hint){
      var template = guessed ? GUESSED : SET;
      if(template) hint.textContent = template.replace('%s', LABELS[os] || os);
    }
  }

  var saved=stored();
  apply(saved||guess(), !saved);

  radios.forEach(function(r){
    r.addEventListener('change',function(){ if(r.checked){ store(r.value); apply(r.value,false) } });
  });
})();

/* Mark the section being read.

     Which heading is "current" is a judgement, not a fact: several are on screen at once.
     The rule here is the last heading whose top has passed a line a third of the way down
     the viewport — the same rule a reader uses, and stable while scrolling in either
     direction. IntersectionObserver alone flickers at section boundaries. */
(function(){
  var links = [].slice.call(document.querySelectorAll('.toc a'));
    if(!links.length) return;
  var targets = links.map(function(a){
      return { link: a, el: document.getElementById(decodeURIComponent(a.hash.slice(1))) };
    }).filter(function(t){ return t.el });
  if(!targets.length) return;

  var active = null;
  function mark(){
      var line = window.innerHeight / 3;
      var found = targets[0];
      for (var i = 0; i < targets.length; i++) {
        if (targets[i].el.getBoundingClientRect().top <= line) found = targets[i];
      }
      /* At the very bottom the last section may never cross the line. */
      if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 4) {
        found = targets[targets.length - 1];
      }
      if (found === active) return;
      if (active) active.link.removeAttribute('aria-current');
      found.link.setAttribute('aria-current', 'true');
      active = found;
    }

  var ticking = false;
  function onScroll(){
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function(){ mark(); ticking = false });
    }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  window.addEventListener('load', onScroll);
  mark();
})();

/* A flag the gate can read. "No console errors" is an inference; this is a measurement.
   If a Content-Security-Policy, a 404 or a syntax error stops this file, the attribute is
   absent and checks/guideline-behaviour.mjs says so by name.

   It is set at the very end, outside every other block, on purpose: nested inside the
   picker's IIFE it was never reached on the During tab, which has no picker — so the rail
   was dead there and the flag said nothing about it. */
document.documentElement.setAttribute('data-sp-ready','1');

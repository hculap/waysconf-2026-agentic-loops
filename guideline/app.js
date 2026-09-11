document.querySelectorAll('.copy').forEach(function(b){
  b.addEventListener('click',function(){
    var pre=document.getElementById(b.dataset.for); if(!pre) return;
    var t=pre.innerText, ok=function(){b.textContent='Copied';b.setAttribute('data-done','');
      setTimeout(function(){b.textContent='Copy';b.removeAttribute('data-done')},1600)};
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
  var LABELS={mac:'macOS',windows:'Windows',linux:'Linux'};
  var radios=document.querySelectorAll('.ospick input[name="os"]');
  if(!radios.length) return;
  var hint=document.querySelector('[data-os-hint]');

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
      hint.textContent = guessed
        ? 'We guessed ' + LABELS[os] + ' from your browser. Not right? Pick another — everything below changes to match.'
        : 'Everything below is for ' + LABELS[os] + '.';
    }
  }

  var saved=stored();
  apply(saved||guess(), !saved);

  radios.forEach(function(r){
    r.addEventListener('change',function(){ if(r.checked){ store(r.value); apply(r.value,false) } });
  });

  /* A flag the gate can read. "No console errors" is an inference; this is a measurement.
     If a Content-Security-Policy, a 404 or a syntax error stops this file, the attribute
     is absent and checks/guideline-behaviour.mjs says so by name. */
  document.documentElement.setAttribute('data-sp-ready','1');
})();

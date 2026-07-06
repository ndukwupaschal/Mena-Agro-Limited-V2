
/* scroll reveal + word stagger */
const io=new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.14});
document.querySelectorAll('.ws').forEach(h=>{
  h.querySelectorAll(':scope > .serif-i').forEach(()=>{}); // keep spans intact
  const nodes=[...h.childNodes];
  h.innerHTML='';
  nodes.forEach(nd=>{
    if(nd.nodeType===3){
      nd.textContent.split(/(\s+)/).forEach(tk=>{
        if(/^\s+$/.test(tk)||tk===''){h.append(tk);return}
        const s=document.createElement('span');s.className='w';s.textContent=tk;h.append(s);
      });
    } else { nd.classList&&nd.classList.add('w'); h.append(nd); }
  });
  [...h.querySelectorAll('.w')].forEach((w,i)=>w.style.transitionDelay=(i*55)+'ms');
});
document.querySelectorAll('.rv,.ws').forEach(el=>io.observe(el));

/* nav state */
const nav=document.getElementById('nav');
addEventListener('scroll',()=>{nav.classList.toggle('scrolled',scrollY>40)},{passive:true});

/* gentle photo parallax */
const plEls=[...document.querySelectorAll('.pl')];
let ticking=false;
function parallax(){
  const vh=innerHeight;
  plEls.forEach(el=>{
    const r=el.getBoundingClientRect();
    if(r.bottom<0||r.top>vh)return;
    const prog=(r.top+r.height/2-vh/2)/vh;
    const img=el.querySelector('img');
    if(img)img.style.transform=`translateY(${prog*-100*(+el.dataset.p||.04)*10}px) scale(1.12)`;
  });
  ticking=false;
}
if(!matchMedia('(prefers-reduced-motion: reduce)').matches){
  addEventListener('scroll',()=>{if(!ticking){requestAnimationFrame(parallax);ticking=true}},{passive:true});
  parallax();
}

/* count-up */
const fmt=n=>n>=1000?n.toLocaleString('en-US'):n;
const co=new IntersectionObserver(es=>{
  es.forEach(e=>{
    if(!e.isIntersecting)return;co.unobserve(e.target);
    const el=e.target,end=+el.dataset.count;
    const hasPre=el.innerHTML.trim().startsWith('<em');
    const ems=[...el.querySelectorAll('em')];
    const pre=hasPre?ems[0].outerHTML:'';
    const suf=ems.length?ems[ems.length-1].outerHTML:'';
    const t0=performance.now(),D=1400;
    const step=t=>{
      const p=Math.min((t-t0)/D,1),v=Math.round(end*(1-Math.pow(1-p,3)));
      el.innerHTML=pre+fmt(v)+(suf&&(!hasPre||ems.length>1)?suf:'');
      if(p<1)requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
},{threshold:.5});
if(!matchMedia('(prefers-reduced-motion: reduce)').matches){
  document.querySelectorAll('[data-count]').forEach(el=>co.observe(el));
}


/* splash intro — once per session */
(function(){
  const sp=document.getElementById('splash');
  if(!sp)return;
  if(sessionStorage.getItem('ma_splash')||matchMedia('(prefers-reduced-motion: reduce)').matches){
    sp.remove();return;
  }
  sessionStorage.setItem('ma_splash','1');
  document.body.style.overflow='hidden';
  setTimeout(()=>{sp.classList.add('gone');document.body.style.overflow='';},1900);
  sp.addEventListener('click',()=>{sp.classList.add('gone');document.body.style.overflow='';});
})();

/* mobile menu */
(function(){
  const b=document.querySelector('.burger');
  if(!b)return;
  b.addEventListener('click',()=>{
    const open=nav.classList.toggle('open');
    b.setAttribute('aria-expanded',open);
    document.body.style.overflow=open?'hidden':'';
  });
  document.querySelectorAll('.nav-links a').forEach(a=>a.addEventListener('click',()=>{
    nav.classList.remove('open');document.body.style.overflow='';
  }));
})();

/* partnership form — Formspree with mailto fallback */
(function(){
  const f=document.getElementById('pform');
  if(!f)return;
  const ENDPOINT=f.getAttribute('action'); // https://formspree.io/f/YOUR_FORM_ID
  const status=document.getElementById('pform-status');
  f.addEventListener('submit',async e=>{
    e.preventDefault();
    // Fallback to email app until the Formspree ID is configured
    if(ENDPOINT.includes('YOUR_FORM_ID')){
      const v=id=>encodeURIComponent(document.getElementById(id).value.trim());
      const subject=encodeURIComponent('Partnership inquiry — '+(document.getElementById('pf-org').value.trim()||document.getElementById('pf-name').value.trim()||'MENA AGRO website'));
      window.location.href=`mailto:contact@menaagro.com?subject=${subject}&body=Name: ${v('pf-name')}%0D%0AEmail: ${v('pf-email')}%0D%0AOrganization: ${v('pf-org')}%0D%0A%0D%0A${v('pf-msg')}`;
      return;
    }
    const btn=f.querySelector('button');
    btn.disabled=true;btn.textContent='Sending…';status.textContent='';
    try{
      const res=await fetch(ENDPOINT,{
        method:'POST',
        headers:{'Accept':'application/json'},
        body:new FormData(f)
      });
      if(res.ok){
        f.reset();
        status.textContent='Message sent. We respond within two working days — thank you.';
        status.className='form-note ok';
      }else{throw 0}
    }catch(_){
      status.innerHTML='Something went wrong — please email us directly at <a href="mailto:contact@menaagro.com">contact@menaagro.com</a>.';
      status.className='form-note err';
    }
    btn.disabled=false;btn.textContent='Send message';
  });
})();

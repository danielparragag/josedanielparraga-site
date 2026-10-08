/* Native scroll scenes: deterministic at any scroll position, no video download. */
(()=>{
 const reduced=matchMedia('(prefers-reduced-motion:reduce)');
 const home=document.querySelector('.identity-story');
 const story=document.querySelector('.scroll-story');
 const clamp=x=>Math.max(0,Math.min(1,x));
 const smooth=x=>{x=clamp(x);return x*x*(3-2*x)};
 const phase=(p,start,end)=>smooth((p-start)/(end-start));
 const nav=document.querySelector('nav');
 if(home)home.classList.add('motion-ready');
 function update(){
  const navHeight=nav.getBoundingClientRect().height;
  document.documentElement.style.setProperty('--nav-height',navHeight+'px');
  for(const section of [home,story].filter(Boolean))section.style.setProperty('--nav-height',navHeight+'px');
  if(home){
   const travel=Math.max(1,home.offsetHeight-(innerHeight-navHeight));
   const p=clamp((navHeight-home.getBoundingClientRect().top)/travel);
   const academy=phase(p,.34,.72),study=1-academy;
   home.style.setProperty('--progress',p);
   home.querySelector('.map-study').style.setProperty('--branch-light',study);
   home.querySelector('.map-academy').style.setProperty('--branch-light',academy);
   for(const [selector,value] of [['.map-route-practice',reduced.matches?1:phase(p,0,.3)],['.map-route-academy',reduced.matches?1:phase(p,.35,.72)]]){
    const path=home.querySelector(selector);path.style.strokeDasharray='220';path.style.strokeDashoffset=220*(1-value);
   }
   home.querySelector('.map-documents').style.transform=`translateY(${reduced.matches?0:14*phase(p,0,.3)}px)`;
   home.querySelector('.map-signature').style.strokeDasharray='60';home.querySelector('.map-signature').style.strokeDashoffset=reduced.matches?0:60*(1-phase(p,.05,.3));
   home.querySelector('.map-lesson').style.transform=`translateY(${reduced.matches?0:10*(1-academy)}px)`;
   home.querySelector('.map-page').style.strokeDasharray='60';home.querySelector('.map-page').style.strokeDashoffset=reduced.matches?0:60*(1-academy);
   const track=home.querySelector('.identity-copy-track'),chapters=[...home.querySelectorAll('.identity-chapter')];
   track.style.transform=reduced.matches?'':`translateY(${-academy*chapters[0].offsetHeight}px)`;
   chapters.forEach((chapter,i)=>{const inactive=!reduced.matches&&i!==(academy<.5?0:1);chapter.inert=inactive;chapter.setAttribute('aria-hidden',String(inactive))});
  }
  if(story){
   const scene=story.querySelector('.case-animation');if(!scene)return;
   const travel=Math.max(1,story.offsetHeight-(innerHeight-navHeight));
   const p=reduced.matches?.48:clamp((navHeight-story.getBoundingClientRect().top)/travel);
   const analysis=phase(p,.12,.43),action=phase(p,.65,.88);
   scene.querySelectorAll('.case-paper').forEach((paper,i)=>{
    paper.style.transform=`translate(${(i===0?100:-100)*analysis}px,${25*analysis}px)`;
    paper.style.opacity=1-phase(p,.25,.43);
   });
   scene.querySelector('.case-folder').style.transform=`translateX(${-85*analysis}px)`;
   scene.querySelector('.case-folder').style.opacity=1-action;
   scene.querySelector('.case-folder-mark').style.opacity=analysis;
   scene.querySelector('.case-analysis').style.opacity=analysis*(1-action);
   scene.querySelector('.analysis-list').style.transform=`translateX(${-22*analysis}px)`;
   scene.querySelector('.case-action').style.opacity=action;
   scene.querySelector('.case-action').style.transform=`translateX(${35*(1-action)}px)`;
   scene.querySelector('.action-route').style.strokeDasharray='120';
   scene.querySelector('.action-route').style.strokeDashoffset=120*(1-action);
   scene.querySelector('.action-point').style.opacity=phase(p,.8,.9);
   const current=p<.31?0:p<.72?1:2;
   scene.querySelectorAll('[data-case-step]').forEach((step,i)=>step.dataset.current=String(i===current));
   scene.querySelector('.scene-caption').textContent=['Reunir lo necesario para entender tu caso.','Relacionar los hechos y evaluar las alternativas.','Definir contigo la actuación que corresponde.'][current];
   const track=story.querySelector('.story-track'),reading=story.querySelector('.story-narrative');
   if(track){const distance=Math.max(0,track.scrollHeight-reading.clientHeight);track.style.transform=innerWidth<=650&&!reduced.matches?`translateY(${-p*distance}px)`:'';}
  }
 }
 let queued=false;
 function queue(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;update()})}
 addEventListener('scroll',queue,{passive:true});addEventListener('resize',queue);addEventListener('pageshow',queue);reduced.addEventListener('change',queue);
 if('ResizeObserver' in window){const observer=new ResizeObserver(queue);observer.observe(nav);if(home)observer.observe(home.querySelector('.identity-stage'));}
 update();
})();

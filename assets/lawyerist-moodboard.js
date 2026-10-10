(()=>{'use strict';
 const catalog=JSON.parse(document.getElementById('reference-catalog').textContent);
 const storageKey='lawyerist-board-v2-selection';
 let saved=new Set(),filter='Todas',opener=null;
 try{const stored=JSON.parse(localStorage.getItem(storageKey)||'[]');if(Array.isArray(stored))saved=new Set(stored.filter(id=>catalog.some(x=>x.id===id)));}catch(e){}
 const cards=[...document.querySelectorAll('.reference-card')],dialog=document.querySelector('.image-dialog');
 function update(){
  let visible=0;
  cards.forEach(card=>{const chosen=saved.has(card.dataset.id);card.hidden=filter==='Guardadas'?!chosen:filter!=='Todas'&&card.dataset.group!==filter;if(!card.hidden)visible++;const button=card.querySelector('.save-reference');button.setAttribute('aria-pressed',String(chosen));button.querySelector('span').textContent=chosen?'Guardada':'Guardar';button.setAttribute('aria-label',(chosen?'Quitar referencia guardada: ':'Guardar referencia: ')+catalog.find(x=>x.id===card.dataset.id).title);});
  document.getElementById('saved-count').textContent=saved.size;
  document.getElementById('visible-count').textContent=visible+(visible===1?' referencia':' referencias');
  document.querySelector('.no-results').hidden=visible>0;
 }
 document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{filter=button.dataset.filter;document.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));update();}));
 document.querySelectorAll('[data-save]').forEach(button=>button.addEventListener('click',()=>{const id=button.dataset.save;if(saved.has(id))saved.delete(id);else saved.add(id);try{localStorage.setItem(storageKey,JSON.stringify([...saved]));}catch(e){document.querySelector('.selection-status').textContent='El navegador no permite guardar la selección. Puedes descargarla al terminar.';}update();}));
 document.querySelectorAll('[data-open]').forEach(button=>button.addEventListener('click',()=>{const item=catalog.find(x=>x.id===button.dataset.open);opener=button;document.getElementById('preview-title').textContent=item.title;const image=document.getElementById('preview-image');image.src=item.src;image.alt=item.alt;document.getElementById('preview-note').textContent=item.look;const source=document.getElementById('preview-source');source.href=item.source;source.textContent='Ver fuente · '+item.credit;dialog.showModal();document.body.classList.add('preview-open');}));
 function close(){dialog.close();document.body.classList.remove('preview-open');if(opener?.isConnected)opener.focus({preventScroll:true});}
 document.querySelector('.close-preview').addEventListener('click',close);
 dialog.addEventListener('close',()=>document.body.classList.remove('preview-open'));
 dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)close();});
 document.querySelector('.download-selection').addEventListener('click',()=>{const status=document.querySelector('.selection-status');if(!saved.size){status.textContent='Guarda alguna referencia antes de descargar la selección.';return;}const items=catalog.filter(x=>saved.has(x.id));const payload={title:'The Lawyerist / referencias seleccionadas',references:items.map(({title,source,credit,shot,where,id})=>({id,title,source,credit,toma:shot,aplicacion:where}))};const url=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json;charset=utf-8'}));const link=document.createElement('a');link.href=url;link.download='the-lawyerist-referencias.json';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);status.textContent='Selección descargada: '+items.length+(items.length===1?' referencia.':' referencias.');});
 document.querySelectorAll('.reference-image img').forEach(image=>image.addEventListener('error',()=>{const link=document.createElement('a');link.className='image-source-fallback';link.textContent='Ver esta imagen en su fuente';const item=catalog.find(x=>x.id===image.closest('.reference-card').dataset.id);link.href=item.source;link.target='_blank';link.rel='noopener noreferrer';const button=image.closest('button');button.replaceWith(link);}));
 update();
})();

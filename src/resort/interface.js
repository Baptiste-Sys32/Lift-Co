/* Keep established controls/handlers, arrange them into focused workspaces. */
window.LiftCoInterface=function(){
 const $=id=>document.getElementById(id),panel=$('resortPanel'),tools=panel.querySelector('.resort-tools'),sections=[...panel.querySelectorAll(':scope > .panel-section')].filter(s=>s!==tools);
 const nav=document.createElement('nav');nav.className='workspace-tabs';nav.setAttribute('aria-label','Resort workspace');nav.innerHTML='<button data-view="lines" class="on" aria-pressed="true">Lifts</button><button data-view="terrain" aria-pressed="false">Terrain & routes</button><button data-view="resort" aria-pressed="false">Resort</button>';panel.prepend(nav);for(const button of nav.children)button.setAttribute('aria-controls','workspace-'+button.dataset.view);
 const lines=document.createElement('div'),terrain=document.createElement('div'),resort=document.createElement('div');lines.id='workspace-lines';terrain.id='workspace-terrain';resort.id='workspace-resort';terrain.hidden=resort.hidden=true;
 for(const child of [...panel.children])if(child!==nav&&child!==tools&&!sections.includes(child)&&child.id!=='exportResort'&&!child.classList.contains('sidebar-note'))lines.append(child);
 const undo=tools.querySelector('#sessionUndo').parentElement;undo.classList.add('history-actions');panel.append(undo);
 const operations=$('operations');operations.before(document.createComment('Operations follows selected line'));lines.append(operations);const explanation=operations.querySelector('p:last-child'),details=document.createElement('details');details.className='operations-help';details.innerHTML='<summary>How this line operates</summary>';details.append(explanation);operations.append(details);
 const entrance=$('entranceSelect');resort.append(tools.querySelector('label[for="entranceSelect"]'),entrance);
 const heading=document.createElement('div');heading.className='workspace-intro';heading.innerHTML='<h2>Shape your resort</h2><p class="small">Sculpt snow, draw pistes and connect the mountain.</p>';terrain.append(heading,tools.querySelector('.tool-menu'),$('villagePanel'),$('featureList'),$('earthEditor'));
 for(const s of sections)resort.append(s);resort.append($('exportResort'),panel.querySelector('.sidebar-note'));tools.remove();panel.append(lines,terrain,resort);
 // Shared workbench styles apply after the former wrapper is removed.
 for(const el of [lines,terrain,resort])el.classList.add('workspace','resort-tools');
 function view(name){for(const el of [lines,terrain,resort])el.hidden=el.id!=='workspace-'+name;for(const b of nav.children){const on=b.dataset.view===name;b.classList.toggle('on',on);b.setAttribute('aria-pressed',String(on));}}
 nav.onclick=e=>{if(e.target.dataset.view)view(e.target.dataset.view);};
 for(const id of ['editTerrain','newPiste','newPath'])$(id).addEventListener('click',()=>view('terrain'));
 $('btnBuild').addEventListener('click',()=>view('lines'));
 // Tone down scaffolding text; leave actual controls and connected/snap colours distinct.
 document.querySelector('.brand p').textContent='Upper Snowfields';document.querySelector('.brand .eyebrow').textContent='LIFT CO. / V3';document.querySelector('.brand h1').innerHTML='Mountain operations';
 document.querySelector('#resortBar .place-title .eyebrow').textContent='UPPER SNOWFIELDS';
 document.querySelector('#workspace-lines > .section-heading .eyebrow').textContent='LIFT NETWORK';
 document.querySelector('#workspace-resort .sidebar-note').innerHTML='Worlds save automatically in this browser.<br><a href="./index.html">Original resort ↗</a>';
 const headings=resort.querySelectorAll('.panel-section > .eyebrow');if(headings[0])headings[0].textContent='LIGHT & ATMOSPHERE';if(headings[1])headings[1].textContent='MAP & SAVES';
 const shadow=$('softShadows');shadow.closest('label').hidden=true;shadow.closest('label').nextElementSibling.hidden=true;
 return{view};
};

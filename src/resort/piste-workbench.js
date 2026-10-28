/* Intent editing: two ends, a difficulty, optional mandatory passages. */
window.LiftCoPisteWorkbench=function(api){
 'use strict';
 const $=id=>document.getElementById(id),panel=document.createElement('section');panel.id='pisteWorkbench';panel.hidden=true;
 panel.innerHTML=`<div id="pisteProposalPicker"><label for="pisteProposal">Pistes in this edit</label><select id="pisteProposal"></select></div><header class="piste-intro"><h2>Piste</h2></header>
 <div class="piste-ends"><button id="pisteStart" type="button"><b>01</b><span><strong>Departure</strong><small>Choose on the mountain</small></span><i>↗</i></button><button id="pisteEnd" type="button"><b>02</b><span><strong>Arrival</strong><small>Choose on the mountain</small></span><i>↘</i></button></div>
 <label for="pisteEndpoint">Connection</label><select id="pisteEndpoint"><option value="">Click a station ring or the snow</option></select><button id="pisteSwap" class="secondary-action">Swap ends</button>
 <div class="piste-section"><span class="eyebrow">03 / DIFFICULTY</span><div class="piste-difficulties" role="group" aria-label="Desired difficulty"><button data-difficulty="green"><i></i>Green</button><button data-difficulty="blue"><i></i>Blue</button><button data-difficulty="red"><i></i>Red</button><button data-difficulty="black"><i></i>Black</button></div></div>
 <section class="piste-passages"><div class="piste-section"><span class="eyebrow">PASSAGES</span><button id="pisteAddGuide">Add passage</button></div><ol id="pisteGuideList"></ol></section>
 <section class="piste-nature"><div class="piste-section"><span class="eyebrow">NATURE</span><span class="piste-nature-icon" aria-hidden="true">♧</span></div><label for="pisteNatureDensity">Automatic planting</label><select id="pisteNatureDensity"><option value="none">Open snowfield</option><option value="sparse">A few trees</option><option value="natural">Natural groves</option><option value="woodland">Woodland edges</option></select><div class="row"><button id="pisteShuffleNature">Shuffle</button></div><div class="piste-plant-tools"><button id="pistePlantTrees">Plant trees</button><button id="pistePlaceRocks">Place rocks</button></div><p id="pistePlantHint" role="status"></p><button id="pisteClearGroves" class="secondary-action">Clear planting</button></section>
 <div class="piste-preview" role="status" aria-live="polite"><span class="eyebrow">YOUR PROPOSAL</span><strong id="pisteSummary"></strong><p id="pisteStatus"></p><div id="pisteMetrics"></div></div>
 <label for="pisteName">Run name</label><input id="pisteName" maxlength="48"><label class="piste-test"><input id="pisteTest" type="checkbox" aria-label="Sandbox mode: ignore terrain and guest skill limits" title="Allow any terrain and guest skill level"> Sandbox mode</label>
 <div class="row"><button id="pisteRegenerate">Recalculate</button><button id="pisteOpen"></button></div><button id="pisteDelete" class="danger-button"><svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14M10 11v6M14 11v6"/></svg><span>Delete piste</span></button>`;
 $('earthEditor').before(panel);let mode='start',lastFeature=null;
 const f=()=>api.feature(),plan=()=>f()?.autoPiste;
 const nature=()=>{f().nature??={density:'natural',seed:0,groves:[]};return f().nature;};
 function setMode(value){mode=value;ui();}
 function pick(p,connection){if(!plan())return;
  if(mode==='trees'||mode==='rocks'){const r=api.metrics();if(!r){api.notice('Choose the two ends and generate your run before planting.');return;}if(mode==='trees'&&api.height(p.x,p.z)>920){api.notice('Above the tree line. Add rocks here, or plant trees farther down.');return;}const nearby=window.LiftCoPisteSurface.index([r],120).nearest(p.x,p.z);if(!nearby||nearby.edge>100){api.notice('Plant beside this piste, within 100 m of its edge.');return;}if(nearby.edge<5){api.notice('Plant beside the boundary poles. The ski corridor stays clear.');return;}if(window.LiftCoPisteNature.settings(f()).groves.length>=24){api.notice('This piste supports up to 24 planted groves.');return;}api.decorate(()=>nature().groves.push({id:window.LiftCoResort.id('grove'),x:p.x,z:p.z,type:mode}));return;}
  api.mutate(()=>{const a={x:p.x,z:p.z,connection:connection||null};if(mode==='guide'){if(plan().guides.length>=12){api.notice('Use at most 12 passage points.');return;}plan().guides.push(a);}else{plan()[mode]=a;if(mode==='start')mode=plan().end?'guide':'end';else mode='guide';}});}
 $('pisteNatureDensity').onchange=e=>api.decorate(()=>nature().density=e.target.value);
 $('pisteShuffleNature').onclick=()=>api.decorate(()=>nature().seed=(nature().seed||0)+1);
 $('pistePlantTrees').onclick=()=>setMode(mode==='trees'?'guide':'trees');$('pistePlaceRocks').onclick=()=>setMode(mode==='rocks'?'guide':'rocks');
 $('pisteClearGroves').onclick=()=>api.decorate(()=>nature().groves=[]);
 $('pisteProposal').onchange=e=>api.edit(e.target.value);
 $('pisteStart').onclick=()=>setMode('start');$('pisteEnd').onclick=()=>setMode('end');$('pisteAddGuide').onclick=()=>setMode('guide');
 $('pisteEndpoint').onchange=e=>{const target=api.targets().find(t=>t.id===e.target.value);if(target)pick(target,target.id);};
 $('pisteSwap').onclick=()=>api.mutate(()=>{const data=api.current();window.LiftCoResort.reverseRoute(f(),[...data.paths,...data.pistes,...data.roads]);});
 panel.querySelector('.piste-difficulties').onclick=e=>{const button=e.target.closest('[data-difficulty]');if(button)api.mutate(()=>{f().sign=button.dataset.difficulty;f().width=window.LiftCoPistePlanner.profiles[f().sign].width;});};
 $('pisteName').onchange=e=>api.mutate(()=>f().name=e.target.value.trim()||'New piste');$('pisteTest').onchange=e=>api.mutate(()=>f().testTerrain=e.target.checked);
 $('pisteRegenerate').onclick=api.regenerate;$('pisteDelete').onclick=api.remove;$('pisteOpen').onclick=()=>api.mutate(()=>f().open=f().open===false);
 function ui(){
  const feature=f(),p=plan(),on=api.active()&&!!p;panel.hidden=!on;document.body.classList.toggle('piste-edit',on);if(!on)return;
  if(feature.id!==lastFeature){lastFeature=feature.id;mode=!p.start?'start':!p.end?'end':'guide';}
  const pistes=api.current().pistes;$('pisteProposalPicker').hidden=pistes.length<2;$('pisteProposal').replaceChildren();for(const run of pistes)$('pisteProposal').add(new Option(run.name+(run.autoPiste?.error?' · needs adjustment':''),run.id));$('pisteProposal').value=feature.id;
  // Leave the shared transaction footer visible, hide the old manual point/brush controls.
  $('earthEditor').classList.add('automatic-piste-editor');
  for(const [key,id]of [['start','pisteStart'],['end','pisteEnd']]){const a=p[key],button=$(id);button.classList.toggle('choosing',mode===key);button.setAttribute('aria-pressed',String(mode===key));const t=a?.connection&&api.targets().find(t=>t.id===a.connection);button.querySelector('small').textContent=t?.name||(a?Math.round(a.x)+' / '+Math.round(a.z)+' m':'Click to choose on the mountain');}
  const planting=mode==='trees'||mode==='rocks';if($('constructionHint'))$('constructionHint').textContent=planting?'Click beside the piste.':!p.start?'Choose departure.':!p.end?'Choose arrival.':mode==='guide'?'Click to add a passage.':'Click to replace this end.';const config=window.LiftCoPisteNature.settings(feature);$('pisteNatureDensity').value=config.density;
  for(const [id,kind]of [['pistePlantTrees','trees'],['pistePlaceRocks','rocks']]){const button=$(id),selected=mode===kind;button.classList.toggle('choosing',selected);button.setAttribute('aria-pressed',String(selected));button.disabled=!feature.points.length;}
  $('pisteClearGroves').hidden=!config.groves.length;$('pistePlantHint').textContent=planting?'Click beside the piste.':config.groves.length?config.groves.length+' planted '+(config.groves.length===1?'grove':'groves'):'';
  $('pisteAddGuide').classList.toggle('choosing',mode==='guide');$('pisteEndpoint').replaceChildren(new Option(planting?'Choose Departure or Arrival to change an endpoint':mode==='guide'?'Add a passage at a connection':'Choose '+(mode==='start'?'departure':'arrival'),''));for(const target of api.targets().filter(t=>!t.hiddenSnap||feature.connections?.includes(t.id)))$('pisteEndpoint').add(new Option(target.name,target.id));
  for(const b of panel.querySelectorAll('[data-difficulty]')){const selected=b.dataset.difficulty===feature.sign;b.classList.toggle('selected',selected);b.setAttribute('aria-pressed',String(selected));}
  $('pisteGuideList').replaceChildren();p.guides.forEach((point,i)=>{const li=document.createElement('li'),label=document.createElement('span'),remove=document.createElement('button');label.textContent='Passage '+(i+1)+' · '+Math.round(point.x)+' / '+Math.round(point.z);remove.textContent='Delete';remove.className='danger-button';remove.setAttribute('aria-label','Remove passage '+(i+1));remove.onclick=()=>api.mutate(()=>p.guides.splice(i,1));li.append(label,remove);$('pisteGuideList').append(li);});
  const r=api.metrics(),problem=p.error||(p.needsReview?'A lift changed. Recalculate the proposal.':r&&!feature.testTerrain&&(!r.rating.valid||r.rating.maxAngle>window.LiftCoPistePlanner.profiles[feature.sign].angle+1e-8)?'The finished terrain does not meet this difficulty yet. Add a wider detour or choose a harder run.':'');
  $('pisteSummary').textContent=!p.start?'Choose departure':!p.end?'Choose arrival':problem?'Needs adjustment':r?'Ready':'Calculating';
  $('pisteStatus').textContent=problem||(!p.start||!p.end?'Choose a station ring or a point on the snow.':'');
  panel.querySelector('.piste-preview').classList.toggle('has-error',!!problem);$('pisteMetrics').textContent=r?Math.round(r.length)+' m long · '+Math.round(r.rating.netDrop)+' m descent · '+r.rating.maxAngle.toFixed(1)+'° sustained · '+feature.width+' m wide':'';
  if(document.activeElement!==$('pisteName'))$('pisteName').value=feature.name;$('pisteTest').checked=!!feature.testTerrain;$('pisteOpen').textContent=feature.open===false?'Open piste':'Close piste';$('earthHeading').textContent='Keep this proposal?';$('earthApply').textContent='Build piste';
 }
 return{ui(){if(!(api.active()&&plan())){$('earthEditor').classList.remove('automatic-piste-editor');$('earthApply').textContent='Apply';}ui();},pick};
};

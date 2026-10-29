/* Browser-local UI size. The world canvas and modal settings remain unscaled. */
window.LiftCoUISettings=(()=>{
 'use strict';
 const storageKey='lift-co-interface-v1',scales=[.75,.85,1,1.1],normalize=value=>scales.includes(Number(value))?Number(value):1;
 let scale=1,context=null,layer=null,lastLayout='';
 try{scale=normalize(JSON.parse(localStorage.getItem(storageKey))?.scale);}catch{}
 function resize(){
  if(!context||!document?.body||!layer?.isConnected)return;const width=innerWidth/scale,height=innerHeight/scale;
  layer.style.width=width+'px';layer.style.height=height+'px';layer.style.transform='scale('+scale+')';layer.style.setProperty('--ui-viewport-height',height+'px');layer.style.setProperty('--ui-viewport-width',width+'px');
  const hidden=document.body.classList.contains('ui-hidden'),building=document.body.classList.contains('building'),hud=document.getElementById('hud'),profile=document.getElementById('buildProfile');
  const sidebar=!hidden&&innerWidth>650?hud.offsetWidth*scale:0,bottom=!hidden&&building?profile.offsetHeight*scale:0;
  context.app.style.left=sidebar+'px';context.app.style.bottom=bottom+'px';
  const signature=[innerWidth,innerHeight,scale,sidebar,bottom].join(':');if(signature!==lastLayout){lastLayout=signature;context.resize();}
 }
 function init(ctx){if(context)return api;context=ctx;layer=document.createElement('div');layer.id='interfaceLayer';document.body.append(layer);
  for(const id of ['hud','toggleInterface','resortBar','transport','hint','buildProfile','saveNotice','err','villageDock','villageCursorHint','liftInspector','guestController']){const node=document.getElementById(id);if(node)layer.append(node);}
  window.addEventListener('resize',resize);new MutationObserver(resize).observe(document.body,{attributes:true,attributeFilter:['class']});resize();return api;
 }
 const api={init,resize,storageKey,get scale(){return scale;},get choices(){return scales.slice();},preview(value){scale=normalize(value);resize();return scale;},save(){localStorage.setItem(storageKey,JSON.stringify({scale}));},screenPoint(x,y,width=0,height=0){return{x:Math.max(0,Math.min(innerWidth-width*scale,x))/scale,y:Math.max(0,Math.min(innerHeight-height*scale,y))/scale};}};
 return api;
})();

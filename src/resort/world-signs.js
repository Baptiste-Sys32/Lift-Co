/* Local sandbox presentation. Factories and the original resort keep their defaults. */
window.LiftCoWorldSigns=(()=>{
 function strip(root){let count=0;root.traverse(o=>{if(!o.isMesh&&!o.isSprite)return;const materials=Array.isArray(o.material)?o.material:[o.material],text=m=>!!m?.map?.isCanvasTexture;if(materials.length&&materials.every(text)){o.visible=false;o.userData.worldSign=true;count++;}else if(materials.some(text)){o.material=materials.map(m=>{if(!text(m))return m;const hidden=m.clone();hidden.visible=false;return hidden;});count++;}});return count;}
 return{strip};
})();

// Optional approved endpoint architecture. Missing style retains the native model.
window.LiftCoStationDesigns=(()=>{
 const styles=[
  {id:'delta',label:'Poma Delta / external A-frame',types:['classic','chair-alps5']},
  {id:'princesse',label:'Princesse / timber hall',types:['gondola','arbois','jaillet','princesse-panorama','princesse-touring','gondola-princesse8']},
  {id:'faron',label:'Faron / concrete wedge',types:['solo']},
  {id:'bouquetin',label:'Bouquetin / steel gallery',types:['funitel-rocharbois']}
 ];
 const options=type=>styles.filter(s=>s.types.includes(type));
 const valid=d=>d.stationStyle===undefined||d.stationStyle==='default'||options(d.type).some(s=>s.id===d.stationStyle);
 return{styles,options,valid};
})();

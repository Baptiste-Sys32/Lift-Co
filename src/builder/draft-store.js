// Unfinished construction is separate from the version-3 resort document.
window.LiftCoDraftStore={create({storage,saveKey,types,coordinateLimit=10000}){
 const prefix='lift-co-construction-drafts:v1:'+encodeURIComponent(saveKey)+':',copy=value=>JSON.parse(JSON.stringify(value));let error='';
 function read(value){
  const record=typeof value==='string'?JSON.parse(value):copy(value),d=record?.definition;
  if(record?.format!=='lift-co-construction-draft'||record.version!==1||!d||typeof d.id!=='string'||!d.id||d.id.length>128||typeof d.name!=='string'||d.name.length>128||!types.some(t=>t.id===d.type))throw Error('This is not a supported lift draft.');
  for(const end of ['base','mid','top'])if(d[end]!=null&&(!Array.isArray(d[end])||d[end].length!==2||d[end].some(v=>!Number.isFinite(v)||Math.abs(v)>coordinateLimit)))throw Error('The draft has an unreadable station position.');
  if(!Array.isArray(d.towers)||d.towers.length>60||d.towers.some(t=>!t||!Number.isFinite(t.fraction)||Math.abs(t.fraction)>10||!Number.isFinite(t.height)||Math.abs(t.height)>1000||[t.leanAlong,t.leanAcross].some(v=>v!==undefined&&(!Number.isFinite(v)||Math.abs(v)>90))))throw Error('The draft has unreadable tower settings.');
  if(!Number.isFinite(d.sag)||Math.abs(d.sag)>10||d.stationElevations&&Object.values(d.stationElevations).some(v=>!Number.isFinite(v)||Math.abs(v)>10000))throw Error('The draft has unreadable elevation or cable settings.');
  delete d.preview;delete d.stationGround;record.definition=d;record.editId=typeof record.editId==='string'?record.editId:null;record.updated=Number.isFinite(record.updated)?record.updated:0;
  record.history=(Array.isArray(record.history)?record.history:[]).slice(-10).filter(v=>typeof v==='string');record.redo=(Array.isArray(record.redo)?record.redo:[]).slice(-10).filter(v=>typeof v==='string');
  // History from imported files is optional. Validate it before local Undo can
  // restore it, while allowing drafts whose construction conflicts are editable.
  for(const key of ['history','redo'])record[key]=record[key].filter(v=>{try{read({...record,definition:JSON.parse(v),history:[],redo:[]});return true;}catch{return false;}});
  return record;
 }
 function save(record){try{const value=read(record);value.updated=Date.now();storage().setItem(prefix+encodeURIComponent(value.definition.id),JSON.stringify(value));error='';return value;}catch(e){error='Draft could not be saved: '+e.message;return null;}}
 function list(){const records=[];try{const s=storage();for(let i=0;i<s.length;i++){const key=s.key(i);if(!key?.startsWith(prefix))continue;try{records.push(read(s.getItem(key)));}catch{error='A saved draft could not be read. Your committed resort is unchanged.';}}return records.sort((a,b)=>b.updated-a.updated);}catch(e){error='Draft storage is unavailable: '+e.message;return records;}}
 function remove(id){try{storage().removeItem(prefix+encodeURIComponent(id));error='';return true;}catch(e){error='Draft could not be removed: '+e.message;return false;}}
 return{read,save,list,remove,get error(){return error;},copy};
}};

// Buildable carriers on the empty-map resort. Missing types in older saves are gondolas.
window.LiftCoLiftTypes=[
 {id:'gondola',group:'gondola',order:1,label:'4-person detachable gondola — sliding-door cabin',shortName:'4p sliding-door gondola',defaultColor:0xd94f4f,capacity:4,carrierName:'gondolas',bottomDrop:4.99,halfWidth:1.1,halfLength:1.15,cableSpeed:7.8,stationSpeed:.32,stationPitch:2.65,description:'Four standing passengers · enclosed cabin · sliding doors.'},
 {id:'ridge',isChair:true,group:'chairlift',order:2,label:'6-seat detachable chairlift',shortName:'6-seat detachable chair',capacity:6,carrierName:'chairs',bottomDrop:4.85,halfWidth:1.95,halfLength:1.65,cableSpeed:6,stationSpeed:.55,stationPitch:1.8,description:'Six seated passengers · detachable grip · closely spaced in stations.'},
 {id:'classic',group:'chairlift',order:1,label:'4-seat fixed-grip chairlift',shortName:'4-seat fixed-grip chair',isChair:true,fixedGrip:true,capacity:4,carrierName:'chairs',bottomDrop:4.85,halfWidth:1.45,halfLength:1.65,cableSpeed:1.8,stationSpeed:1.8,stationPitch:10,stationStraight:12,description:'Four seated passengers · fixed grip · adjustable up to 1.8 m/s, including stations.'}
];

// Category order is shared with the construction dropdown. Empty groups stay hidden.
window.LiftCoLiftGroups=[{id:'chairlift',label:'Chairlifts'},{id:'gondola',label:'Monocable gondola lifts'},{id:'tramway',label:'Aerial tramways'},{id:'skilift',label:'Surface lifts'},{id:'funitel',label:'Funitels'}];
if(window.LiftCoGondolaRuntime){
 const common={group:'gondola',capacity:4,carrierName:'gondolas',bottomDrop:4.99,cableSpeed:7.8,stationSpeed:.32,stationPitch:2.85,defaultColor:0xe8e8df};
 window.LiftCoLiftTypes.push(
  {...common,id:'arbois',order:4,label:'4-person detachable gondola — faceted cabin',shortName:'4p faceted gondola',cabinFamily:'arbois',cabinVariant:'A',halfWidth:1.22,halfLength:1.20,description:'Four seated passengers · faceted Arbois cabin · sliding doors with ski pockets.'},
  {...common,id:'jaillet',order:5,label:'4-person detachable gondola — clamshell cabin',shortName:'4p clamshell gondola',cabinFamily:'jaillet',cabinVariant:'C',halfWidth:1.08,halfLength:1.16,description:'Four seated passengers · rounded Full shoulder cabin · whole-shell opening.'},
  {...common,id:'princesse-panorama',order:2,label:'4-person detachable gondola — panoramic cabin',shortName:'4p panoramic gondola',cabinFamily:'princesse',cabinVariant:'A',halfWidth:1.45,halfLength:1.32,stationPitch:3.05,description:'Four seated passengers · broad Panorama cabin · curved glass and dark waist band.'},
  {...common,id:'princesse-touring',order:3,label:'4-person detachable gondola — tall cabin',shortName:'4p tall gondola',cabinFamily:'princesse',cabinVariant:'C',halfWidth:1.42,halfLength:1.32,stationPitch:3.05,description:'Four seated passengers · taller Touring cabin · fuller lower shell.'}
 );
}

// Only pages loading the reversible runtime offer Solo construction.
if(window.LiftCoSoloRuntime)window.LiftCoLiftTypes.push({id:'solo',group:'tramway',order:1,label:'12-person reversible aerial tramway',shortName:'12p reversible tramway',reversible:true,capacity:12,carrierName:'Solo cabins',bottomDrop:6.9,halfWidth:1.1,halfLength:2.25,railX:5.1,stationDrop:7.31,terminalSpacing:24,defaultTowerHeight:45,maxTowerHeight:150,cableSpeed:10.25,stationSpeed:0,description:'Two reversible 12-person cabins · 10.25 m/s cruise · 7 m/s at Heavy Portal pylons · Inclined valley dock · flat or inclined upper dock. Flat arrival requires a natural cliff and 30 m to the last pylon.'});

// Rocharbois stays a separate construction family: fixed grips, paired ropes, shuttle operation.
if(window.LiftCoFunitelRuntime)window.LiftCoLiftTypes.push({id:'funitel-rocharbois',group:'funitel',order:1,label:'75-person reversible funitel — articulated cabin',shortName:'75p reversible funitel',funitel:true,reversible:true,horizontal:true,defaultColor:0x355768,capacity:75,carrierName:'funitel cabins',bottomDrop:3.65,halfWidth:1.5,halfLength:4.25,railX:3.5,terminalSpacing:24,defaultTowerHeight:12,maxTowerHeight:100,cableSpeed:5,stationSpeed:0,description:'Two reversible cabins · three articulated compartments · 75 standing passengers · 5 m/s · twin ropes per cabin. Connect similar-height areas; place towers to clear the terrain.'});

// Approved B carriers. Special layouts are dedicated choices, not toggles on old lifts.
if(window.LiftCoNextRuntime){
 const common={nextModel:true,bottomDrop:4.65,stationSpeed:.65,stationPitch:4.68,group:'chairlift',isChair:true,carrierName:'chairs',railX:3.1,defaultTowerHeight:12,maxTowerHeight:60};
 window.LiftCoLiftTypes.push(
  {...common,id:'chair-arcabulle',family:'arcabulle',order:3,label:'6-seat detachable bubble chairlift — Arcabulle',shortName:'6-seat bubble chair',capacity:6,halfWidth:1.95,halfLength:1.75,cableSpeed:5,defaultColor:0xe8e5dc,description:'Approved Full shoulders chair · six seats · detachable 0.65 m/s station crawl · 5 m/s line.'},
  {...common,id:'chair-alps5',family:'alps5',order:4,label:'2-seat fixed-grip chairlift — Alps-inspired',shortName:'2-seat fixed-grip chair',capacity:2,halfWidth:.75,halfLength:1.45,cableSpeed:1.8,stationSpeed:1.8,stationPitch:10,stationStraight:12,railX:2.2,fixedGrip:true,defaultColor:0xaa706b,description:'Approved Round crown double · period mast and Classic canopy · one speed throughout, up to 1.8 m/s.'},
  {...common,id:'chair-panoramabahn',family:'panoramabahn',order:5,label:'4-seat detachable bubble chairlift — angle station',shortName:'4-seat turning bubble chair',capacity:4,halfWidth:1.35,halfLength:1.7,cableSpeed:5,defaultColor:0x318366,layout:'turn',description:'Approved Deep bubble chair · dedicated open angle transfer · drag the middle ring to bend the line · no passenger access at the turn.'},
  {...common,id:'gondola-princesse8',family:'princesse',isChair:false,group:'gondola',order:6,label:'8-person detachable gondola — passenger mid-station',shortName:'8p mid-station gondola',capacity:8,carrierName:'Palace8 cabins',halfWidth:1.5,halfLength:1.25,bottomDrop:4.04,cableSpeed:6,stationSpeed:.4,stationPitch:3.5,defaultColor:0xe7e5dc,layout:'mid',description:'Approved Broad waist Palace8 · three passenger stations · drag the middle station to bend the line · through riders keep their seats · coupled operation.'}
 );
}

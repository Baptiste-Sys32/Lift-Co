// Buildable carriers on the empty-map resort. Missing types in older saves are gondolas.
window.LiftCoLiftTypes=[
 {id:'gondola',label:'Alpine gondola',shortName:'Gondola',capacity:4,carrierName:'gondolas',bottomDrop:4.99,halfWidth:1.1,halfLength:1.15,cableSpeed:7.8,stationSpeed:.32,stationPitch:2.65,description:'Four standing passengers · enclosed cabin · sliding doors.'},
 {id:'ridge',isChair:true,label:'Ridge chairlift',shortName:'Ridge',capacity:6,carrierName:'chairs',bottomDrop:4.85,halfWidth:1.95,halfLength:1.65,cableSpeed:6,stationSpeed:.55,stationPitch:1.8,description:'Six seated passengers · detachable grip · closely spaced in stations.'},
 {id:'classic',label:'Classic chairlift',shortName:'Classic',isChair:true,fixedGrip:true,capacity:4,carrierName:'chairs',bottomDrop:4.85,halfWidth:1.45,halfLength:1.65,cableSpeed:1.8,stationSpeed:1.8,stationPitch:10,stationStraight:12,description:'Four seated passengers · fixed grip · constant 1.8 m/s, including stations.'}
];

// Only pages loading the reversible runtime offer Solo construction.
if(window.LiftCoSoloRuntime)window.LiftCoLiftTypes.push({id:'solo',label:'Solo téléphérique',shortName:'Solo',reversible:true,capacity:12,carrierName:'Solo cabins',bottomDrop:6.9,halfWidth:1.1,halfLength:2.25,railX:5.1,stationDrop:7.31,terminalSpacing:24,defaultTowerHeight:25,cableSpeed:10.25,stationSpeed:0,description:'Two reversible 12-person cabins · 10.25 m/s cruise · 7 m/s at Heavy Portal pylons · inclined docking cages. Place the upper terminal at a shelf or cliff edge.'});

// Buildable carriers on the empty-map resort. Missing types in older saves are gondolas.
window.LiftCoLiftTypes=[
 {id:'gondola',group:'gondola',order:1,label:'Classic',shortName:'Classic',defaultColor:0xd94f4f,capacity:4,carrierName:'gondolas',bottomDrop:4.99,halfWidth:1.1,halfLength:1.15,cableSpeed:7.8,stationSpeed:.32,stationPitch:2.65,description:'Four standing passengers · enclosed cabin · sliding doors.'},
 {id:'ridge',isChair:true,group:'chairlift',order:2,label:'6-Seater',shortName:'6-Seater',capacity:6,carrierName:'chairs',bottomDrop:4.85,halfWidth:1.95,halfLength:1.65,cableSpeed:6,stationSpeed:.55,stationPitch:1.8,description:'Six seated passengers · detachable grip · closely spaced in stations.'},
 {id:'classic',group:'chairlift',order:1,label:'Classic',shortName:'Classic',isChair:true,fixedGrip:true,capacity:4,carrierName:'chairs',bottomDrop:4.85,halfWidth:1.45,halfLength:1.65,cableSpeed:1.8,stationSpeed:1.8,stationPitch:10,stationStraight:12,description:'Four seated passengers · fixed grip · constant 1.8 m/s, including stations.'}
];

// Category order is shared with the construction dropdown. Empty groups stay hidden.
window.LiftCoLiftGroups=[{id:'chairlift',label:'Chair Lift'},{id:'gondola',label:'Gondola'},{id:'skilift',label:'Ski Lift'}];
if(window.LiftCoGondolaRuntime){
 const common={group:'gondola',capacity:4,carrierName:'gondolas',bottomDrop:4.99,cableSpeed:7.8,stationSpeed:.32,stationPitch:2.85,defaultColor:0xe8e8df};
 window.LiftCoLiftTypes.push(
  {...common,id:'arbois',order:4,label:'Sigma Arbois',shortName:'Sigma Arbois',cabinFamily:'arbois',cabinVariant:'A',halfWidth:1.22,halfLength:1.20,description:'Four seated passengers · faceted Arbois cabin · sliding doors with ski pockets.'},
  {...common,id:'jaillet',order:5,label:'Sigma SP77',shortName:'Sigma SP77',cabinFamily:'jaillet',cabinVariant:'C',halfWidth:1.08,halfLength:1.16,description:'Four seated passengers · rounded Full shoulder cabin · whole-shell opening.'},
  {...common,id:'princesse-panorama',order:2,label:'Panorama',shortName:'Panorama',cabinFamily:'princesse',cabinVariant:'A',halfWidth:1.45,halfLength:1.32,stationPitch:3.05,description:'Four seated passengers · broad Panorama cabin · curved glass and dark waist band.'},
  {...common,id:'princesse-touring',order:3,label:'Touring',shortName:'Touring',cabinFamily:'princesse',cabinVariant:'C',halfWidth:1.42,halfLength:1.32,stationPitch:3.05,description:'Four seated passengers · taller Touring cabin · fuller lower shell.'}
 );
}

// Only pages loading the reversible runtime offer Solo construction.
if(window.LiftCoSoloRuntime)window.LiftCoLiftTypes.push({id:'solo',label:'Solo téléphérique',shortName:'Solo',reversible:true,capacity:12,carrierName:'Solo cabins',bottomDrop:6.9,halfWidth:1.1,halfLength:2.25,railX:5.1,stationDrop:7.31,terminalSpacing:24,defaultTowerHeight:25,cableSpeed:10.25,stationSpeed:0,description:'Two reversible 12-person cabins · 10.25 m/s cruise · 7 m/s at Heavy Portal pylons · inclined docking cages. Place the upper terminal at a shelf or cliff edge.'});

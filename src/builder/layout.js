// Shared layout and rope geometry for the interactive lift-building prototype.
// No Three.js dependency: the 3D view, elevation profile and future game use this model.
(function(global){
'use strict';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function hermite(a,b,ya,yb,ma,mb,x){const d=b-a,t=clamp((x-a)/d,0,1);return (2*t*t*t-3*t*t+1)*ya+(t*t*t-2*t*t+t)*d*ma+(-2*t*t*t+3*t*t)*yb+(t*t*t-t*t)*d*mb;}
class LiftLayout{
 constructor(data={}){this.start=null;this.end=null;this.towers=[];this.nextId=1;this.sag=.55;this.load(data);}
 load(data){this.start=data.start?{...data.start}:null;this.end=data.end?{...data.end}:null;this.towers=(data.towers||[]).map(t=>({...t}));this.nextId=data.nextId||Math.max(0,...this.towers.map(t=>Number(t.id)||0))+1;this.sag=data.sag??.55;this.tautTerminals=!!data.tautTerminals;this.terminalGuides=!!data.terminalGuides;this.rebuild();}
 serialize(){return {version:1,start:this.start?{...this.start}:null,end:this.end?{...this.end}:null,towers:this.towers.map(t=>({...t})),nextId:this.nextId,sag:this.sag,tautTerminals:this.tautTerminals,terminalGuides:this.terminalGuides};}
 get ready(){return !!(this.start&&this.end&&this.length>=30);}
 get supports(){if(!this.ready)return [];return [{id:'start',kind:'station',distance:0,height:this.start.height},...this.towers.map(t=>({...t,kind:'tower',distance:t.fraction*this.length})).sort((a,b)=>a.distance-b.distance),{id:'end',kind:'station',distance:this.length,height:this.end.height}];}
 pointAt(distance,side=0,height){const d=distance;return {x:this.start.x+this.dx*d+this.dz*side,z:this.start.z+this.dz*d-this.dx*side,y:height??this.heightAt(d)};}
 project(x,z){const x0=x-this.start.x,z0=z-this.start.z,distance=x0*this.dx+z0*this.dz;return {distance,fraction:distance/this.length,lateral:x0*this.dz-z0*this.dx};}
 setStation(which,point){const other=this[which==='start'?'end':'start'];if(other&&Math.hypot(point.x-other.x,point.z-other.z)<30)throw Error('Leave at least 30 m between the stations.');if(other&&this.towers.length){const length=Math.hypot(point.x-other.x,point.z-other.z),fractions=[0,...this.towers.map(t=>t.fraction).sort((a,b)=>a-b),1];for(let i=1;i<fractions.length;i++)if((fractions[i]-fractions[i-1])*length<(i===1||i===fractions.length-1?14:10))throw Error('This move would put towers too close together. Move or remove a tower first.');}this[which]={x:point.x,z:point.z,height:this[which]?.height??6};this.rebuild();}
 addTower(distance,height=8){if(!this.ready)throw Error('Place both stations first.');if(distance<14||distance>this.length-14)throw Error('Keep towers at least 14 m from the terminals.');if(this.towers.some(t=>Math.abs(t.fraction*this.length-distance)<10))throw Error('Leave at least 10 m between towers.');const tower={id:this.nextId++,fraction:distance/this.length,height:clamp(height,3,40)};this.towers.push(tower);this.rebuild();return tower.id;}
 moveTower(id,distance){const tower=this.towers.find(t=>t.id===id);if(!tower)return;const ordered=this.towers.filter(t=>t.id!==id).map(t=>t.fraction*this.length),current=tower.fraction*this.length;const before=Math.max(14,...ordered.filter(d=>d<current).map(d=>d+10)),after=Math.min(this.length-14,...ordered.filter(d=>d>current).map(d=>d-10));tower.fraction=clamp(distance,before,after)/this.length;this.rebuild();}
 setHeight(id,height){const h=clamp(Number(height)||3,3,40);if(id==='start'||id==='end'){if(this[id])this[id].height=h;}else{const tower=this.towers.find(t=>t.id===id);if(tower)tower.height=h;}this.rebuild();}
 removeTower(id){this.towers=this.towers.filter(t=>t.id!==id);this.rebuild();}
 rebuild(){
  this.length=this.start&&this.end?Math.hypot(this.end.x-this.start.x,this.end.z-this.start.z):0;
  this.dx=this.length?(this.end.x-this.start.x)/this.length:0;this.dz=this.length?(this.end.z-this.start.z)/this.length:1;
  this.nodes=this.supports;this.transitions=[];if(!this.ready)return;
  // Virtual span intersections are solved so the smoothed rope passes through the
  // player's chosen height at the centre of every sheave train.
  const virtual=this.nodes.map(n=>({...n,y:n.height}));this.virtual=virtual;
  // A terminal head is part of the station, not an extra player-placed tower.
  // Shift the virtual tangent intersection back by half the guide length so
  // a parabolic guide joins a level station to the free span without overshoot.
  const firstRadius=Math.min(this.terminalGuides?3.2:3,(virtual[1].distance-virtual[0].distance)*(this.terminalGuides?.22:.2));
  const lastRadius=Math.min(this.terminalGuides?3.2:3,(virtual.at(-1).distance-virtual.at(-2).distance)*(this.terminalGuides?.22:.2));
  const adjustTerminals=()=>{if(!this.terminalGuides)return;
   const first=virtual[1],last=virtual.at(-2),spanA=first.distance,spanB=this.length-last.distance;
   virtual[0].y=this.start.height-(first.y-this.start.height)/(spanA-firstRadius/2)*firstRadius/2;
   virtual.at(-1).y=this.end.height+(this.end.height-last.y)/(spanB-lastRadius/2)*lastRadius/2;
   // With no towers the two virtual intersections are coupled; solve directly.
   if(virtual.length===2){const m=(this.end.height-this.start.height)/(this.length-(firstRadius+lastRadius)/2);
    virtual[0].y=this.start.height-m*firstRadius/2;virtual[1].y=this.end.height+m*lastRadius/2;}
  };
  const raw=(x)=>this.freeSpan(x);
  const radius=i=>Math.min(2.55,(virtual[i].distance-virtual[i-1].distance)*.22,(virtual[i+1].distance-virtual[i].distance)*.22);
  const transition=i=>{const node=virtual[i],r=radius(i),a=node.distance-r,b=node.distance+r;return {a,b,ya:raw(a),yb:raw(b),ma:this.freeSlope(a),mb:this.freeSlope(b)};};
  for(let pass=0;pass<(this.terminalGuides?24:12);pass++){adjustTerminals();for(let i=1;i<virtual.length-1;i++){
   const t=transition(i),actual=hermite(t.a,t.b,t.ya,t.yb,t.ma,t.mb,virtual[i].distance),r=radius(i),left=virtual[i].distance-virtual[i-1].distance,right=virtual[i+1].distance-virtual[i].distance;
   const weight=1-r/4*(1/left+1/right);virtual[i].y+=(this.nodes[i].height-actual)/weight;
  }
  }
  adjustTerminals();
  for(let i=1;i<virtual.length-1;i++)this.transitions.push(transition(i));
  this.guideLengths={start:firstRadius,end:lastRadius};
  this.transitions.unshift({a:0,b:firstRadius,ya:this.start.height,yb:raw(firstRadius),ma:0,mb:this.freeSlope(firstRadius)});
  const last=this.length-lastRadius;this.transitions.push({a:last,b:this.length,ya:raw(last),yb:this.end.height,ma:this.freeSlope(last),mb:0});
  for(const node of this.nodes){node.compression=node.kind==='tower'&&this.heightAt(node.distance+.3)+this.heightAt(node.distance-.3)-2*this.heightAt(node.distance)>.0001;}
  this.minimumClearance=Infinity;this.lowestDistance=0;
  for(let i=0;i<=Math.ceil(this.length/.4);i++){const s=Math.min(this.length,i*.4),clearance=this.heightAt(s)-4.8;if(clearance<this.minimumClearance){this.minimumClearance=clearance;this.lowestDistance=s;}}
 }
 freeSpan(s){if(s<=0)return this.virtual[0].y;if(s>=this.length)return this.virtual.at(-1).y;for(let i=0;i<this.virtual.length-1;i++){const a=this.virtual[i],b=this.virtual[i+1];if(s>=a.distance&&s<=b.distance){const length=b.distance-a.distance,t=(s-a.distance)/length,sag=this.tautTerminals&&(i===0||i===this.virtual.length-2)?0:this.sag*clamp(length/50,.25,1.8);return a.y+(b.y-a.y)*t-Math.sin(Math.PI*t)*sag;}}return 0;}
 freeSlope(s){const epsilon=.001;return (this.freeSpan(Math.min(this.length,s+epsilon))-this.freeSpan(Math.max(0,s-epsilon)))/(Math.min(this.length,s+epsilon)-Math.max(0,s-epsilon)||1);}
 heightAt(s){if(!this.ready)return 6;if(s<=0)return this.start.height;if(s>=this.length)return this.end.height;for(const t of this.transitions)if(s>=t.a&&s<=t.b)return hermite(t.a,t.b,t.ya,t.yb,t.ma,t.mb,s);return this.freeSpan(s);}
 slopeAt(s){return (this.heightAt(s+.025)-this.heightAt(s-.025))/.05;}
}
global.LiftBuilderCore={LiftLayout,clamp};
})(window);

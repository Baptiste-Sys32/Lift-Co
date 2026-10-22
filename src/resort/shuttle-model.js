/* The vehicle workshop's detailed shuttle, adapted to the fixed passenger contract. */
import * as T from 'three';
import {createVehicle} from '../vehicles/models.js';
export function createShuttleModel(spec){
 const vehicle=createVehicle('shuttle',{color:'#b66543'});vehicle.setSnow(true);
 const seatGeometry=new T.BoxGeometry(.4,.17,.48),backGeometry=new T.BoxGeometry(.4,.6,.1),seatMaterial=new T.MeshStandardMaterial({color:0x526653,roughness:.9}),seats=new T.InstancedMesh(seatGeometry,seatMaterial,24),backs=new T.InstancedMesh(backGeometry,seatMaterial,24),dummy=new T.Object3D();
 for(let i=0;i<spec.capacity;i++){const p=spec.seatAnchors[i];dummy.position.set(p.x,1.25,p.z);dummy.updateMatrix();seats.setMatrixAt(i,dummy.matrix);dummy.position.set(p.x,1.58,p.z-.22);dummy.updateMatrix();backs.setMatrixAt(i,dummy.matrix);}vehicle.root.add(seats,backs);
 spec.wheelRadius=vehicle.wheels[0]?.radius||spec.wheelRadius;
 return{root:vehicle.root,seats:spec.seatAnchors,wheels:vehicle.wheels.map(w=>w.spin),front:vehicle.wheels.filter(w=>w.steer).map(w=>w.pivot),doors:vehicle.doors.map(d=>d.node),
 update(dt,speed,steer,door){vehicle.update(dt,{speed,steer,doorsOpen:door>.1});for(const d of vehicle.doors)d.node.rotation.y=-1.32*door;},
 dispose(){vehicle.dispose();seatGeometry.dispose();backGeometry.dispose();seatMaterial.dispose();}};
}

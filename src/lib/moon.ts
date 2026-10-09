import { Box3, Group, Vector3, Matrix3, Mesh, Vector2, Triangle, Raycaster } from 'three';
/** Preserve authored geometry, material and rotation. Only translate and uniformly scale. */
export function normalizeMoon(scene: Group) {
  const clone = scene.clone(true);
  const bounds = new Box3().setFromObject(clone, true);
  const size = bounds.getSize(new Vector3());
  const diameter = Math.max(size.x, size.y, size.z);
  if (!Number.isFinite(diameter) || diameter <= 0) throw new Error('Moon model has invalid bounds');
  clone.position.sub(bounds.getCenter(new Vector3()));
  const wrapper = new Group(); wrapper.add(clone); wrapper.scale.setScalar(2 / diameter);
  return wrapper;
}
/** Camera fit accounts for the narrower vertical or horizontal field of view. */
export function fitDistance(aspect: number, fov = 45) {
  const halfFov = Math.atan(Math.tan(fov * Math.PI / 360) * Math.min(1, aspect));
  return Math.min(8, Math.max(2.8, 1.12 / Math.sin(halfFov)));
}
/** Geographic vectors to the original model frame; fit from its actual UV/vertex pairs. */
export const geographicFrame = new Matrix3().set(
 -.7237580159665463, .46977050324597036, .505460194876111,
 .5401292991810767, .8415368958164994, -.00871740475657368,
 -.42945858297433964, .2667045692513691, -.8628058867729833
);
export const geographicNorth = new Vector3(0, 1, 0).applyMatrix3(geographicFrame);
export const geographicAlignment = {
 verified: true,
 scope: 'Landmark-calibrated visualization, not survey-grade positioning',
 reason: 'Tycho, Copernicus and Aristarchus establish the texture frame; Mare Crisium and Mare Orientale provide independent regional checks.'
} as const;
/** GLTF UV origin is the image top; this asset has south at the top. */
export function geographicUV(latitude: number, longitude: number) {
 if (!Number.isFinite(latitude) || Math.abs(latitude)>90 || !Number.isFinite(longitude)) throw new Error('Invalid lunar coordinates');
 return new Vector2((((longitude + 180) % 360) + 360) % 360 / 360, latitude / 180 + .5);
}
/** Interpolate the real textured triangle, avoiding spherical guesses on the authored mesh. */
export function pointOnMoon(model: Group, latitude: number, longitude: number): Vector3 | null {
 const uv=geographicUV(latitude,longitude), target=new Vector3(uv.x,uv.y,0);
 let found: Vector3 | null=null;
 model.updateMatrixWorld(true);
 model.traverse(object=>{
  if(found || !(object as Mesh).isMesh) return;
  const geometry=(object as Mesh).geometry, coords=geometry.attributes.uv, positions=geometry.attributes.position, index=geometry.index;
  if(!coords || !positions)return;
  const count=index?.count??positions.count;
  const a=new Vector3(),b=new Vector3(),c=new Vector3(),weights=new Vector3();
  for(let i=0;i<count;i+=3){
   const ia=index?index.getX(i):i,ib=index?index.getX(i+1):i+1,ic=index?index.getX(i+2):i+2;
   a.set(coords.getX(ia),coords.getY(ia),0);b.set(coords.getX(ib),coords.getY(ib),0);c.set(coords.getX(ic),coords.getY(ic),0);
   if(target.x<Math.min(a.x,b.x,c.x)-1e-7 || target.x>Math.max(a.x,b.x,c.x)+1e-7 || target.y<Math.min(a.y,b.y,c.y)-1e-7 || target.y>Math.max(a.y,b.y,c.y)+1e-7)continue;
   if(!Triangle.getBarycoord(target,a,b,c,weights)||Math.min(weights.x,weights.y,weights.z)<-1e-6)continue;
   found=new Vector3().fromBufferAttribute(positions,ia).multiplyScalar(weights.x)
    .addScaledVector(new Vector3().fromBufferAttribute(positions,ib),weights.y)
    .addScaledVector(new Vector3().fromBufferAttribute(positions,ic),weights.z).applyMatrix4(object.matrixWorld);
   break;
  }
 });
 if(found)return found;
 // Polar fan UVs leave small uncovered wedges. Use the calibrated radial direction there.
 const lat=latitude*Math.PI/180,lon=longitude*Math.PI/180;
 const direction=new Vector3(Math.cos(lat)*Math.sin(lon),Math.sin(lat),Math.cos(lat)*Math.cos(lon)).applyMatrix3(geographicFrame).normalize();
 return new Raycaster(direction.clone().multiplyScalar(3),direction.clone().negate()).intersectObject(model,true)[0]?.point.clone()??null;
}



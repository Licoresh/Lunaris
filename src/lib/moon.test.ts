import { it, expect } from 'vitest';
import { Box3, Group, Mesh, SphereGeometry, MeshStandardMaterial, Vector3 } from 'three';
import { normalizeMoon, fitDistance, geographicAlignment, geographicUV, geographicFrame, pointOnMoon } from './moon';
it('centers offset imported geometry and normalizes diameter without mutating the original',()=>{
  const input=new Group();const mesh=new Mesh(new SphereGeometry(4),new MeshStandardMaterial());mesh.position.set(12,-3,8);input.add(mesh);
  const before=new Box3().setFromObject(input);const normalized=normalizeMoon(input);const after=new Box3().setFromObject(normalized);
  expect(after.getCenter(new Vector3()).length()).toBeLessThan(1e-10);expect(after.getSize(new Vector3()).x).toBeCloseTo(2);expect(new Box3().setFromObject(input).equals(before)).toBe(true);expect((normalized.children[0].children[0] as Mesh).geometry).toBe(mesh.geometry);
});
it('fits the complete Moon into both landscape and narrow portrait viewports',()=>{
  for(const aspect of [.55,.8,1,1.7,2.3]){const halfFov=Math.atan(Math.tan(Math.PI/8)*Math.min(1,aspect));expect(fitDistance(aspect)*Math.sin(halfFov)).toBeGreaterThan(1);}
});
it('uses a proper rotation and explicit south-at-top, east-positive UV mapping',()=>{
 expect(geographicAlignment.verified).toBe(true);expect(geographicFrame.determinant()).toBeCloseTo(1,10);
 expect(geographicUV(90,0).toArray()).toEqual([.5,1]);expect(geographicUV(-90,0).toArray()).toEqual([.5,0]);expect(geographicUV(0,90).toArray()).toEqual([.75,.5]);expect(geographicUV(0,-90).toArray()).toEqual([.25,.5]);expect(geographicUV(0,270).toArray()).toEqual([.25,.5]);expect(()=>geographicUV(91,0)).toThrow();
});


import fs from 'node:fs';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { latLonToVector } from './coordinates';
it('maps real GLB landmarks and polar sites onto actual mesh triangles', async()=>{
 const bytes=fs.readFileSync('src/moon.glb'), length=bytes.readUInt32LE(12), json=JSON.parse(bytes.subarray(20,20+length).toString()), binary=bytes.subarray(28+length);
 delete json.images;delete json.textures;delete json.materials;
 for(const mesh of json.meshes)for(const primitive of mesh.primitives)delete primitive.material;
 let encoded=Buffer.from(JSON.stringify(json));encoded=Buffer.concat([encoded,Buffer.alloc((4-encoded.length%4)%4,32)]);
 const header=Buffer.alloc(20);header.write('glTF');header.writeUInt32LE(2,4);header.writeUInt32LE(28+encoded.length+binary.length,8);header.writeUInt32LE(encoded.length,12);header.write('JSON',16);
 const binHeader=Buffer.alloc(8);binHeader.writeUInt32LE(binary.length);binHeader.write('BIN\0',4);const data=Buffer.concat([header,encoded,binHeader,binary]);
 const gltf=await new GLTFLoader().parseAsync(data.buffer.slice(data.byteOffset,data.byteOffset+data.byteLength),'');const model=normalizeMoon(gltf.scene);
 for(const [latitude,longitude] of [[-43.30,-11.22],[23.73,-47.49],[9.62,-20.08],[16.18,59.1],[-19.87,-94.67],[-89.4,233],[-89.8,213],[-86,4],[-80.13,1.44],[-84.79,29.2]]){
  const point=pointOnMoon(model,latitude,longitude);expect(point, latitude+","+longitude).not.toBeNull();expect(point!.length()).toBeGreaterThan(.97);expect(point!.length()).toBeLessThan(1.02);
  const expected=latLonToVector(latitude,longitude,1).applyMatrix3(geographicFrame);expect(point!.angleTo(expected)*180/Math.PI).toBeLessThan(1.2);
 }
},15000);


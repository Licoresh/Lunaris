import fs from 'node:fs';
import crypto from 'node:crypto';
import sharp from 'sharp';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Box3, Vector3 } from 'three';
const file=fs.readFileSync('src/moon.glb');
if(file.toString('utf8',0,4)!=='glTF'||file.readUInt32LE(4)!==2||file.readUInt32LE(8)!==file.length)throw Error('Invalid GLB');
const jsonLength=file.readUInt32LE(12), original=JSON.parse(file.subarray(20,20+jsonLength).toString()), binary=file.subarray(28+jsonLength);
const view=original.bufferViews[original.images[0].bufferView];
const texture=await sharp(binary.subarray(view.byteOffset,view.byteOffset+view.byteLength)).metadata();
// Geometry-only in-memory parse avoids needing browser image APIs. Original bytes remain untouched.
const audit=structuredClone(original);delete audit.images;delete audit.textures;delete audit.materials;for(const m of audit.meshes)for(const p of m.primitives)delete p.material;
let json=Buffer.from(JSON.stringify(audit));json=Buffer.concat([json,Buffer.alloc((4-json.length%4)%4,32)]);
const head=Buffer.alloc(20);head.write('glTF');head.writeUInt32LE(2,4);head.writeUInt32LE(28+json.length+binary.length,8);head.writeUInt32LE(json.length,12);head.write('JSON',16);
const binHead=Buffer.alloc(8);binHead.writeUInt32LE(binary.length);binHead.write('BIN\0',4);const merged=Buffer.concat([head,json,binHead,binary]);
const gltf=await new Promise((resolve,reject)=>new GLTFLoader().parse(merged.buffer.slice(merged.byteOffset,merged.byteOffset+merged.byteLength),'',resolve,reject));
const bounds=new Box3().setFromObject(gltf.scene,true);const dimensions=bounds.getSize(new Vector3());
const report={sha256:crypto.createHash('sha256').update(file).digest('hex'),bytes:file.length,asset:original.asset,bounds:{min:bounds.min.toArray(),max:bounds.max.toArray(),center:bounds.getCenter(new Vector3()).toArray(),dimensions:dimensions.toArray(),normalizationScale:2/Math.max(...dimensions.toArray())},vertices:original.meshes.reduce((s,m)=>s+original.accessors[m.primitives[0].attributes.POSITION].count,0),triangles:original.meshes.reduce((s,m)=>s+original.accessors[m.primitives[0].indices].count/3,0),texture:{width:texture.width,height:texture.height,compressedBytes:view.byteLength,colorSpace:texture.space},materials:original.materials,geographicAlignment:'landmark-calibrated overview; see MOON_MODEL.md'};
fs.writeFileSync('docs/moon-audit.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report.bounds));

const samples=[];gltf.scene.updateMatrixWorld(true);gltf.scene.traverse(o=>{if(!o.isMesh)return;const p=o.geometry.attributes.position,u=o.geometry.attributes.uv;for(let i=0;i<p.count;i+=17){const v=new Vector3().fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld).sub(bounds.getCenter(new Vector3())).normalize();samples.push([u.getX(i),u.getY(i),...v.toArray()]);}});fs.writeFileSync('docs/moon-uv-samples.json',JSON.stringify(samples));

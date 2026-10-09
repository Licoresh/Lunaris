'use client';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, useProgress, Stars } from '@react-three/drei';
import { Component, ReactNode, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { ACESFilmicToneMapping, SRGBColorSpace, Vector3, Quaternion } from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { normalizeMoon, fitDistance, pointOnMoon, geographicNorth, geographicFrame } from '@/lib/moon';
export const MODEL_URL = '/models/moon.glb';
function Loading() { const { progress, active } = useProgress(); return active ? <div className="model-message loading-overlay" role="status">Loading original Moon model<br/>{Math.round(progress)}%</div> : null; }
export type GlobeLocation = { id: string; name: string; latitude: number; longitude: number; kind: string };
const NO_LOCATIONS: GlobeLocation[] = [];
function Scene({ locations, selectedId, onSelect, focus, reset, zoom }: { locations: GlobeLocation[]; selectedId?: string | null; onSelect?: (id:string)=>void; focus: number; reset:number; zoom:{nonce:number;factor:number} }) {
  const { scene } = useGLTF(MODEL_URL);
  const model = useMemo(() => normalizeMoon(scene), [scene]);
  const points=useMemo(()=>locations.flatMap(location=>{const point=pointOnMoon(model,location.latitude,location.longitude);return point?[{...location,point:point.clone().addScaledVector(point.clone().normalize(),.009)}]:[]}),[model,locations]);
  const target=points.find(p=>p.id===selectedId)?.point;
  return <><primitive object={model} dispose={null} onClick={(e: {stopPropagation:()=>void})=>e.stopPropagation()}/>{points.map(p=><mesh key={p.id} position={p.point} onClick={e=>{e.stopPropagation();onSelect?.(p.id)}}><sphereGeometry args={[p.id===selectedId ? .016 : .012,16,12]}/><meshBasicMaterial color={p.id===selectedId?'#ffffff':p.kind==='planned'?'#f4be62':'#5fe8db'}/></mesh>)}<Controls reset={reset} zoom={zoom} target={target} focus={focus}/></>;
}
class Boundary extends Component<{ children: ReactNode; retry: () => void }, { failed: boolean }> {
  state = { failed: false }; static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? <div className="model-error" role="alert"><b>Moon rendering unavailable</b><p>Check WebGL support and the model download, then retry. Mission records remain available.</p><button onClick={this.props.retry}>Retry Moon</button></div> : this.props.children; }
}
function Controls({ reset, zoom, target, focus }: { reset: number; zoom: { nonce: number; factor: number }; target?: Vector3; focus: number }) {
  const motion=useRef<{start:Vector3;rotation:Quaternion;distance:number;t:number}|null>(null);
  const ref = useRef<OrbitControlsImpl>(null); const { camera, size, invalidate } = useThree();
  useEffect(() => { if (!ref.current) return; const aspect = size.width / size.height; const distance = fitDistance(aspect); motion.current=null; camera.up.copy(geographicNorth); camera.position.copy(new Vector3(0,.12,1).normalize().applyMatrix3(geographicFrame).multiplyScalar(distance)); ref.current.target.set(0, 0, 0); ref.current.update(); invalidate(); }, [camera, reset, size.width, size.height, invalidate]);
  useEffect(() => { if (!zoom.nonce || !ref.current) return; motion.current=null; camera.position.setLength(Math.max(1.35, Math.min(8, camera.position.length() * zoom.factor))); ref.current.update(); invalidate(); }, [camera, zoom, invalidate]);
  useEffect(()=>{if(!focus || !target || !ref.current)return;
    const direction=target.clone().normalize(),start=camera.position.clone().normalize();
    const distance=Math.max(2.1,Math.min(4,fitDistance(size.width/size.height)));
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){camera.position.copy(direction.multiplyScalar(distance));ref.current.update();invalidate();return;}
    motion.current={start,rotation:new Quaternion().setFromUnitVectors(start,direction),distance,t:0};invalidate();
  },[focus,target,camera,size.width,size.height,invalidate]);
  useFrame((_,delta)=>{const m=motion.current;if(!m||!ref.current)return;m.t=Math.min(1,m.t+delta/0.8);const t=m.t*m.t*(3-2*m.t);camera.position.copy(m.start).applyQuaternion(new Quaternion().slerp(m.rotation,t)).multiplyScalar(m.distance);ref.current.update();if(m.t===1)motion.current=null;else invalidate();});
  return <OrbitControls onStart={()=>{motion.current=null}} ref={ref} makeDefault enableDamping dampingFactor={.09} enablePan={false} minDistance={1.35} maxDistance={8} rotateSpeed={.55}/>;
}
export default function LunarGlobe({ reset = 0, locations = NO_LOCATIONS, selectedId, onSelect }: { reset?: number; locations?: GlobeLocation[]; selectedId?: string | null; onSelect?: (id:string)=>void }) {
  const [focus,setFocus]=useState(0);
  const selected=locations.find(l=>l.id===selectedId);
  const [localReset, setReset] = useState(0), [attempt, setAttempt] = useState(0), [zoom, setZoom] = useState({ nonce: 0, factor: 1 });
  const retry = () => { useGLTF.clear(MODEL_URL); setAttempt(n => n + 1); };
  return <section className="lunar-stage" aria-label="Interactive original Moon model">
    <div className="stage-heading"><span>THE MOON</span><small>ORIGINAL SKETCHFAB MODEL</small></div>
    <div className="globe-canvas" tabIndex={0} aria-label="Moon: drag to orbit, pinch or scroll to zoom. Use buttons to zoom and reset." onKeyDown={e => { if(e.key==='+'||e.key==='=')setZoom(z=>({nonce:z.nonce+1,factor:.8})); if(e.key==='-')setZoom(z=>({nonce:z.nonce+1,factor:1.25})); }}>
      <Boundary key={attempt} retry={retry}><Canvas frameloop="demand" dpr={[1, 1.5]} camera={{ position: [0, .12, 3.25], fov: 45, near: .01, far: 150 }} gl={{ antialias: true, toneMapping: ACESFilmicToneMapping, outputColorSpace: SRGBColorSpace }} fallback={<div className="model-error">WebGL is unavailable. Mission records are still accessible.</div>}>
        <ambientLight intensity={.65}/><directionalLight position={[4, 3, 5]} intensity={2.4}/>
        <Stars radius={60} depth={20} count={650} factor={1.2} saturation={0} fade speed={0}/>
        <Suspense fallback={null}><Scene locations={locations} selectedId={selectedId} onSelect={onSelect} focus={focus} reset={reset+localReset} zoom={zoom}/></Suspense>
      </Canvas></Boundary><Loading/>
    </div>
    <div className="globe-controls"><button aria-label="Zoom in" onClick={()=>setZoom(z=>({nonce:z.nonce+1,factor:.8}))}>+</button><button aria-label="Zoom out" onClick={()=>setZoom(z=>({nonce:z.nonce+1,factor:1.25}))}>−</button><button onClick={()=>setReset(n=>n+1)}>Reset view</button><button disabled={!selected} onClick={()=>setFocus(n=>n+1)}>Focus selected location</button></div>
    <p className="orbit-help">Drag to orbit · Scroll or pinch to zoom</p>
    <div className="alignment-note"><span>LANDMARK-CALIBRATED OVERVIEW</span><p>Poles and longitude checked against lunar landmarks. Pins show sourced coordinates on the artistic model, not survey-grade terrain.</p>{selected?<p>{selected.name} · {selected.kind} location · {Math.abs(selected.latitude).toFixed(2)}° {selected.latitude<0?'S':'N'}, {Math.abs(selected.longitude).toFixed(2)}° {selected.longitude<0?'W':'E'}</p>:<p>Select a location with published coordinates to enable focus.</p>}<details><summary>Location markers ({locations.length})</summary>{locations.map(l=><button key={l.id} aria-pressed={l.id===selectedId} onClick={()=>{onSelect?.(l.id);setFocus(n=>n+1)}}>{l.name} · {l.kind}</button>)}<p>White: selected · Teal: actual / research · Gold: planned. The Moon hides far-side pins.</p></details></div>
  </section>;
}




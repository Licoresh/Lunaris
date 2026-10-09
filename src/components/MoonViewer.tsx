'use client';

import { Canvas, ThreeEvent, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Component, ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { BufferGeometry, Color, Float32BufferAttribute } from 'three';
import { OrbitControls as Controls } from 'three-stdlib';
import { sites } from '@/lib/sites';
import LunarGlobe from './LunarGlobe';
import ridge from '@/data/terrain-connecting-ridge.json';
import shackleton from '@/data/terrain-shackleton-rim.json';
import malapert from '@/data/terrain-malapert-massif.json';

const globeLocations=sites.map(site=>({id:site.id,name:site.shortName,latitude:site.latitude,longitude:site.longitude,kind:'research'}));
type Props = { selectedId: string; onSelect: (id: string) => void };
type Mode = 'terrain' | 'globe';
type Terrain = typeof ridge;
type Sample = { siteId: string; x: number; z: number; height: number; latitude: number; longitude: number };
const terrains: Record<string, Terrain | undefined> = { 'connecting-ridge': ridge, 'shackleton-rim': shackleton, 'malapert-massif': malapert };
const colors = ['#10274f', '#176984', '#3a9b95', '#94ad60', '#c8af75', '#e8ded0'].map(c => new Color(c));

function sampleTerrain(data: Terrain, x: number, z: number): Sample {
  const n = data.displayGridSize;
  const u = Math.max(0, Math.min(n - 1, (x / 7 + .5) * (n - 1)));
  const v = Math.max(0, Math.min(n - 1, (z / 7 + .5) * (n - 1)));
  const col = Math.min(n - 2, Math.floor(u)), row = Math.min(n - 2, Math.floor(v));
  const fx = u - col, fy = v - row;
  const h = (r: number, c: number) => data.heightsMeters[r * n + c];
  const height = (h(row,col)*(1-fx)+h(row,col+1)*fx)*(1-fy)+(h(row+1,col)*(1-fx)+h(row+1,col+1)*fx)*fy;
  const [left,bottom,right,top] = data.boundsMeters;
  const spacing = (right-left)/n;
  const east = left + spacing/2 + u*spacing;
  const north = top - (top-bottom)/n/2 - v*(top-bottom)/n;
  return {siteId:data.siteId,x,z,height,latitude:(2*Math.atan(Math.hypot(east,north)/(2*1737400))-Math.PI/2)*180/Math.PI,longitude:(Math.atan2(east,north)*180/Math.PI+360)%360};
}

function TerrainMesh({data, markers, exaggeration, onSample, sample}: {data:Terrain;labels:boolean;markers:boolean;exaggeration:number;onSample:(sample:Sample)=>void;sample:Sample|null}) {
  const scale = 7 / ((data.boundsMeters[2]-data.boundsMeters[0]) * (data.displayGridSize-1)/data.displayGridSize);
  const midpoint = (data.minimumMeters+data.maximumMeters)/2;
  const heightY = (height:number) => (height-midpoint)*scale*exaggeration;
  const geometry = useMemo(() => {
    const n=data.displayGridSize, positions:number[]=[], rgb:number[]=[], indices:number[]=[];
    data.heightsMeters.forEach((height,i)=>{
      positions.push((i%n/(n-1)-.5)*7,(height-midpoint)*scale*exaggeration,(Math.floor(i/n)/(n-1)-.5)*7);
      const t=Math.max(0,Math.min(.99999,(height-data.minimumMeters)/(data.maximumMeters-data.minimumMeters)))*5;
      const c=colors[Math.floor(t)].clone().lerp(colors[Math.floor(t)+1],t%1);rgb.push(c.r,c.g,c.b);
    });
    for(let r=0;r<n-1;r++)for(let c=0;c<n-1;c++){const a=r*n+c;indices.push(a,a+n,a+1,a+1,a+n,a+n+1)}
    const result=new BufferGeometry();result.setAttribute('position',new Float32BufferAttribute(positions,3));result.setAttribute('color',new Float32BufferAttribute(rgb,3));result.setIndex(indices);result.computeVertexNormals();return result;
  },[data,midpoint,scale,exaggeration]);
  useEffect(()=>()=>geometry.dispose(),[geometry]);
  const spacing=(data.boundsMeters[2]-data.boundsMeters[0])/data.displayGridSize;
  const x=((data.focusPointMeters[0]-data.boundsMeters[0]-spacing/2)/(spacing*(data.displayGridSize-1))-.5)*7;
  const z=((data.boundsMeters[3]-data.focusPointMeters[1]-spacing/2)/(spacing*(data.displayGridSize-1))-.5)*7;
  const focus=sampleTerrain(data,x,z);
  const pick=(event:ThreeEvent<MouseEvent>)=>{if(event.delta>4)return;event.stopPropagation();onSample(sampleTerrain(data,event.point.x,event.point.z))};
  return <>
    <mesh geometry={geometry} onClick={pick}><meshStandardMaterial vertexColors roughness={1}/></mesh>
    {markers&&<mesh position={[x,heightY(focus.height)+.09,z]} onClick={e=>{e.stopPropagation();onSample(focus)}}><sphereGeometry args={[.065,16,16]}/><meshBasicMaterial color="#ffd16c"/></mesh>}
    {sample&&<mesh position={[sample.x,heightY(sample.height)+.045,sample.z]}><sphereGeometry args={[.04,12,12]}/><meshBasicMaterial color="white"/></mesh>}
  </>;
}

function CameraControls({mode,siteId,reset,zoom}:{mode:Mode;siteId:string;reset:number;zoom:{nonce:number;factor:number}}){
  const controls=useRef<Controls>(null);const {camera}=useThree();
  useEffect(()=>{if(!controls.current)return;controls.current.target.set(0,0,0);camera.position.set(...(mode==='terrain'?[0,6,9]:[0,-2.8,2.6]) as [number,number,number]);controls.current.update()},[camera,mode,siteId,reset]);
  useEffect(()=>{if(!controls.current||!zoom.nonce)return;const target=controls.current.target;const offset=camera.position.clone().sub(target);offset.setLength(Math.max(mode==='terrain'?2:1.4,Math.min(mode==='terrain'?20:8,offset.length()*zoom.factor)));camera.position.copy(target).add(offset);controls.current.update()},[camera,mode,zoom]);
  return <OrbitControls ref={controls} makeDefault enableDamping enablePan={mode==='terrain'} minDistance={mode==='terrain'?2:1.4} maxDistance={mode==='terrain'?20:8} maxPolarAngle={mode==='terrain'?Math.PI*.48:Math.PI} rotateSpeed={.65}/>;
}
class ViewerBoundary extends Component<{children:ReactNode},{failed:boolean}>{state={failed:false};static getDerivedStateFromError(){return {failed:true}}render(){return this.state.failed?<div className="viewer-loading" role="alert">3D rendering is unavailable. Site measurements and comparisons remain available below. Reload to retry.</div>:this.props.children}}

export default function MoonViewer({selectedId,onSelect}:Props){
  const data=terrains[selectedId];const [requestedMode,setMode]=useState<Mode>('terrain');const mode:Mode=requestedMode==='terrain'&&data?'terrain':'globe';
  const [labels,setLabels]=useState(true),[markers,setMarkers]=useState(true),[expanded,setExpanded]=useState(false),[exaggeration,setExaggeration]=useState(1);
  const [reset,setReset]=useState(0),[zoom,setZoom]=useState({nonce:0,factor:1}),[sample,setSample]=useState<Sample|null>(null);
  const currentSample=sample?.siteId===selectedId?sample:null;
  useEffect(()=>{if(!expanded)return;const onKey=(e:KeyboardEvent)=>{if(e.key==='Escape')setExpanded(false)};document.addEventListener('keydown',onKey);return()=>document.removeEventListener('keydown',onKey)},[expanded]);
  const select=(id:string)=>{onSelect(id);setMode(terrains[id]?'terrain':'globe');setSample(null)};
  const doZoom=(factor:number)=>setZoom(value=>({nonce:value.nonce+1,factor}));
  return <section className={`exploration ${expanded?'is-expanded':''}`} aria-label="Interactive Moon explorer">
    <div className="explorer-toolbar">
      <div className="view-modes"><button aria-pressed={mode==='terrain'} disabled={!data} onClick={()=>setMode('terrain')}>Terrain</button><button aria-pressed={mode==='globe'} onClick={()=>setMode('globe')}>Moon overview</button></div>
      <button onClick={()=>setReset(n=>n+1)}>Reset view</button><button disabled={mode==='globe'} onClick={()=>doZoom(.8)} aria-label="Zoom in">＋</button><button disabled={mode==='globe'} onClick={()=>doZoom(1.25)} aria-label="Zoom out">−</button>
      <button disabled={mode==='globe'} aria-pressed={markers} onClick={()=>setMarkers(v=>!v)}>Sites</button><button disabled={mode==='globe'} aria-pressed={labels} onClick={()=>setLabels(v=>!v)}>Labels</button><button aria-pressed={expanded} onClick={()=>setExpanded(v=>!v)}>{expanded?'Close expanded view':'Expand'}</button>
    </div>
    <div className="explorer-sites">{sites.map(site=><button key={site.id} aria-pressed={site.id===selectedId} onClick={()=>select(site.id)}>{site.shortName}<small>{terrains[site.id]?'3D terrain':'Overview only'}</small></button>)}</div>
    <div className="viewer exploration-canvas">
      {mode==='globe'?<LunarGlobe reset={reset} locations={globeLocations} selectedId={selectedId} onSelect={onSelect}/>:<ViewerBoundary><Canvas camera={{position:[0,6,9],fov:45}} dpr={[1,1.5]} fallback={<div className="viewer-loading">WebGL is unavailable. Use the site measurements below.</div>}>
        <color attach="background" args={['#040a10']}/><ambientLight intensity={.7}/><directionalLight position={[-5,5,2]} intensity={1.7}/>
        {data&&<TerrainMesh data={data} markers={markers} labels={labels} exaggeration={exaggeration} sample={currentSample} onSample={setSample}/>}
        <CameraControls mode={mode} siteId={selectedId} reset={reset} zoom={zoom}/>
      </Canvas></ViewerBoundary>}
      {mode==='terrain'&&labels&&<div className="terrain-reference-label"><b>{sites.find(s=>s.id===selectedId)?.shortName}</b><span>Research reference point · gold marker</span></div>}
      {mode==='terrain'&&<div className="explorer-badge">NASA LOLA · elevation terrain</div>}
      {mode==='terrain'&&data&&<div className="elevation-legend"><b>ELEVATION · METERS</b><div/><span>{Math.round(data.minimumMeters).toLocaleString()}</span><span>{Math.round(data.maximumMeters).toLocaleString()}</span><small>5 m source · ≈{Math.round(data.displaySpacingMeters)} m display · {exaggeration}× vertical scale</small></div>}
      {mode==='terrain'&&<p className="viewer-caption">Drag to orbit · Scroll / pinch to zoom{mode==='terrain'?' · Right-drag to pan · Click terrain to inspect':''}</p>}
    </div>
    <div className="explorer-inspector" aria-live="polite">
      <div>{mode==='terrain'?currentSample?<><b>{currentSample.height.toFixed(1)} m</b><span>{Math.abs(currentSample.latitude).toFixed(4)}° S / {currentSample.longitude.toFixed(4)}° E · interpolated display elevation</span></>:<><b>Inspect the surface</b><span>Click any point on the terrain to read its coordinates and elevation.</span></>:<><b>{data?'Choose Terrain to inspect elevations':'Terrain coverage unavailable for Malapert'}</b><span>Select a research site for local 3D exploration.</span></>}</div>
      {mode==='terrain'&&<label>Vertical scale <select value={exaggeration} onChange={e=>setExaggeration(Number(e.target.value))}><option value={1}>1× actual proportions</option><option value={2}>2× relief</option><option value={4}>4× relief</option></select></label>}
    </div>
  </section>;
}


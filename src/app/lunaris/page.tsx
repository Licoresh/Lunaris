'use client';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, CalendarDays, ChevronDown, Database, Info, Menu, Moon, Mountain, RadioTower, ShieldAlert, Sun, X } from 'lucide-react';
import { MetricKey, metricDefinitions, sites } from '@/lib/sites';
const MoonViewer = dynamic(() => import('@/components/MoonViewer'), { ssr: false, loading: () => <div className="viewer-loading">Initializing lunar viewport…</div> });

const PolarMap = dynamic(() => import('@/components/PolarMap'), {ssr:false});
const Simulation = dynamic(() => import('@/components/Simulation'), {ssr:false});
const nav = [['explorer', 'Moon Explorer'], ['planner', 'Mission Planner'], ['comparison', 'Site Comparison'], ['sources', 'Data Sources'], ['methodology', 'Methodology']] as const;
const metricIcons = { illumination: Sun, earthVisibility: RadioTower, elevation: Mountain, slope: ChevronDown };
const coordinate = (value: number, axis: 'lat' | 'lon') => `${Math.abs(value).toFixed(1)}°${axis === 'lat' ? (value < 0 ? 'S' : 'N') : (value < 0 ? 'W' : 'E')}`;
const formatMetric = (metric: typeof sites[number]['metrics'][MetricKey]) => metric.value === null ? 'Unavailable' : `${metric.value.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${metric.unit}`;

export default function Home() {
  const [selectedId, setSelectedId] = useState(sites[0].id); const [compareId, setCompareId] = useState(sites[1].id); const [menuOpen, setMenuOpen] = useState(false); const [analysisRun, setAnalysisRun] = useState(false);
  const [mapMode,setMapMode]=useState(true);
  const [settingsOpen,setSettingsOpen]=useState(false);
  const simulationResultsRef = useRef<HTMLElement>(null);
  const [start, setStart] = useState('2026-11-01'); const [end, setEnd] = useState('2026-11-08');
  const selected = useMemo(() => sites.find((site) => site.id === selectedId) ?? sites[0], [selectedId]);
  const compared = useMemo(() => sites.find((site) => site.id === compareId) ?? sites[1], [compareId]);
  const validDates = Boolean(start && end && (Date.parse(end)-Date.parse(start))/86400000 >= 1 && (Date.parse(end)-Date.parse(start))/86400000 <= 60);
  useEffect(() => { if (analysisRun && validDates) simulationResultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, [analysisRun, validDates]);
  const exportComparison = async () => {
    const {downloadReport}=await import('@/lib/pdf-report');
    downloadReport('Lunar site comparison','lunaris-site-comparison',[
      {heading:'Requested interval',lines:[start+' to '+end+' UTC','Historical NASA metrics only. These values are not a date-specific forecast.']},
      ...[selected,compared].map(site=>({heading:site.shortName,lines:[`Coordinates: ${site.latitude} deg N, ${site.longitude} deg E`,...Object.keys(metricDefinitions).map(key=>`${metricDefinitions[key as MetricKey].label}: ${formatMetric(site.metrics[key as MetricKey])} (${site.metrics[key as MetricKey].source})`),site.coordinateNote,'Coordinate source: '+site.sourceUrl]})),
      {heading:'Interpretation and sources',lines:['Medians inside a 1 km radius around approximate research points. These support regional exploration, not landing safety certification.','NASA terrain: https://pgda.gsfc.nasa.gov/products/78','NASA historical visibility: https://pgda.gsfc.nasa.gov/products/69']}
    ]);
  };
  const selectPrimary = (id: string) => { if(id === selectedId)return; if (id === compareId) setCompareId(selectedId); setSelectedId(id); setAnalysisRun(false); };
  return <main>
    <header className="site-header"><Link className="brand" href="/" aria-label="LUNARIS home"><span className="brand-mark"><Moon size={21} /></span><span><b>LUNARIS</b><small>LUNAR MISSION SYSTEMS</small></span></Link>
      <button className="menu-button" onClick={() => setMenuOpen((value) => !value)} aria-expanded={menuOpen} aria-label="Toggle navigation">{menuOpen ? <X /> : <Menu />}</button>
      <nav className={menuOpen ? 'open' : ''} aria-label="Primary navigation">{nav.map(([id, label]) => <a key={id} href={`#${id}`} onClick={() => setMenuOpen(false)}>{label}</a>)}</nav>
      <a className="header-status validated" href="#sources"><span /> NASA-derived averages active</a>
    </header>

    <div className="page-shell" id="top">
      <section className="hero"><div><p className="eyebrow">SOUTH POLAR DECISION SUPPORT / RESEARCH PREVIEW</p><h1>Read the terrain.<br /><em>Plan with evidence.</em></h1><p className="hero-copy">Explore published lunar south-pole reference sites and compare what the available evidence can - and cannot - tell a mission team.</p></div><div className="hero-orbit" aria-hidden="true"><span>89.4° S</span><i /></div></section>

      <section id="explorer" className="explorer-grid"><div className="section-heading explorer-heading"><div><p className="section-index">01 / MOON EXPLORER</p><h2>South polar terrain explorer</h2></div><p>Pan across NASA polar data, switch layers, and select a research site. Explore the original 3D views with the tab below.</p></div><div className="explorer-map-column"><div className="map-switch"><button aria-pressed={mapMode} onClick={()=>setMapMode(true)}>NASA polar map</button><button aria-pressed={!mapMode} onClick={()=>setMapMode(false)}>3D terrain & Moon</button></div>{mapMode?<PolarMap selectedId={selectedId} onSelect={selectPrimary} onOpenTerrain={id=>{selectPrimary(id);setMapMode(false)}}/>:<MoonViewer selectedId={selectedId} onSelect={selectPrimary} />}</div>
        <aside className={`control-panel${settingsOpen?' settings-open':''}`} id="planner"><div className="panel-title"><span>MISSION CONTROL</span><i>SIMULATION MODE</i></div><h2>{selected.shortName}</h2><p className="coordinates">{coordinate(selected.latitude, 'lat')} &nbsp;/&nbsp; {coordinate(selected.longitude, 'lon')}</p><button className="mission-settings-toggle" aria-expanded={settingsOpen} aria-controls="mission-settings" onClick={()=>setSettingsOpen(!settingsOpen)}>{settingsOpen?'Hide mission settings':'Show mission settings'}</button><div id="mission-settings" className="mission-settings"><p className="site-description">{selected.description}</p>
          <label htmlFor="primary-site">Primary reference site</label><select id="primary-site" value={selectedId} onChange={(event) => selectPrimary(event.target.value)}>{sites.map((site) => <option key={site.id} value={site.id}>{site.shortName}</option>)}</select><div className="site-tabs" aria-label="Quick site selection">{sites.map((site) => <button key={site.id} className={site.id === selectedId ? 'active' : ''} onClick={() => selectPrimary(site.id)}><span>{site.shortName}</span><small>{coordinate(site.latitude, 'lat')}</small></button>)}</div>
          <div className="field-grid"><div><label htmlFor="mission-start">Mission start</label><input id="mission-start" type="date" value={start} onChange={(event) => { setStart(event.target.value); setAnalysisRun(false); }} /></div><div><label htmlFor="mission-end">Mission end</label><input id="mission-end" type="date" value={end} min={start} onChange={(event) => { setEnd(event.target.value); setAnalysisRun(false); }} /></div></div>
          <div className="notice"><ShieldAlert size={18} /><p><b>Try a mission simulation.</b> Explore illustrative Sun and Earth windows using NASA historical averages and simple periodic math. No downloads or live service needed.</p></div>
          {!validDates && <p role="alert" className="date-error">Choose dates spanning 1–60 days.</p>}<button className="run-button" disabled={!validDates} onClick={() => setAnalysisRun(true)}><CalendarDays size={18} /> Run simulation <ArrowRight size={18} /></button>
          <div className="site-source"><span>{selected.pgdaProduct}</span><a href={selected.sourceUrl} target="_blank" rel="noreferrer">Coordinate source ↗</a></div>
        </div></aside>
      </section>

      {analysisRun && validDates && <section ref={simulationResultsRef} id="simulation-results" className="simulation-results" aria-label="Simulation results"><Simulation key={selectedId+start+end} site={selected} start={start} end={end}/></section>}

      <section className="science-section" aria-labelledby="science-heading"><div className="section-heading"><div><p className="section-index">02 / SCIENTIFIC DASHBOARD</p><h2 id="science-heading">Evidence, with its limits visible</h2></div><p>NASA-derived 1 km neighborhood medians. Historical averages remain distinct from mission-date predictions.</p></div>
        <div className="metric-grid">{(Object.keys(metricDefinitions) as MetricKey[]).map((key) => <MetricCard key={key} metricKey={key} site={selected} />)}</div>
      </section>

      <section className="comparison" id="comparison"><div className="section-heading"><div><p className="section-index">03 / SITE COMPARISON</p><h2>Compare on common ground</h2></div><p>No composite score or safety ranking. Only compatible, traceable measurements belong here.</p></div>
        <div className="compare-selectors"><SiteSummary site={selected} label="SITE A" /><button className="versus" aria-label="Swap comparison sites" onClick={() => { setSelectedId(compareId); setCompareId(selectedId); setAnalysisRun(false); }}>A / B</button><div className="compare-choice"><label htmlFor="compare-site">SITE B</label><select id="compare-site" value={compareId} onChange={(event) => setCompareId(event.target.value)}>{sites.filter((site) => site.id !== selectedId).map((site) => <option key={site.id} value={site.id}>{site.shortName}</option>)}</select><p>{coordinate(compared.latitude, 'lat')} / {coordinate(compared.longitude, 'lon')}</p></div></div>
        <button className="export-button" onClick={exportComparison} disabled={!validDates}>Download comparison PDF</button><div className="comparison-table" role="table" aria-label="Scientific site comparison"><div className="comparison-row comparison-head" role="row"><span>MEASUREMENT</span><span>{selected.shortName}</span><span>{compared.shortName}</span></div>{(Object.keys(metricDefinitions) as MetricKey[]).map((key) => <div className="comparison-row" role="row" key={key}><span>{metricDefinitions[key].label}<small>Common definition / 1 km median</small></span><span className={selected.metrics[key].value === null ? 'unavailable' : 'available'}>{formatMetric(selected.metrics[key])}<small>{selected.metrics[key].source}</small></span><span className={compared.metrics[key].value === null ? 'unavailable' : 'available'}>{formatMetric(compared.metrics[key])}<small>{compared.metrics[key].source}</small></span></div>)}</div>
        <div className="tradeoffs"><div><Info size={19} /><div><b>Interpretation</b><p>Values are medians inside a 1 km radius around approximate published research points. They support regional trade-off exploration, not landing safety certification.</p></div></div><ul>{selected.missionNotes.map((note) => <li key={note}>{note}</li>)}</ul></div>
      </section>

      <section className="sources" id="sources"><div><p className="section-index">04 / DATA SOURCES</p><h2>Traceable by design.</h2><p>Source files remain local; the browser receives only compact derived outputs. Unavailable fields remain visible when a matching source product is absent.</p></div><div className="source-list"><Source name="LRO / LOLA" detail="5 m/pixel elevation and slope for Connecting Ridge, Shackleton Rim, Nobile Rim 1, Peak near Shackleton, de Gerlache Rim, and Malapert Massif" href="https://pgda.gsfc.nasa.gov/products/78" /><Source name="NASA PGDA" detail="120 m/pixel historical illumination and Earth visibility" href="https://pgda.gsfc.nasa.gov/products/69" /><Source name="NAIF SPICE" detail="Future date-specific observation geometry; not active" href="https://naif.jpl.nasa.gov/naif/data.html" /><Source name="RenderX / Sketchfab" detail="Original RenderX Sketchfab Moon; landmark-calibrated overview" href="https://sketchfab.com/3d-models/moon-26cc0b7878bb4d919b68e2be399db466" /></div></section>
      <section className="methodology" id="methodology"><Database size={22} /><div><b>Processing boundary</b><p>GeoTIFFs are inspected offline for CRS, scale, units, bounds, NoData and checksums. Coordinates are transformed into lunar south-polar stereographic meters, then valid pixels inside a 1 km circle are summarized by the median.</p></div></section>
      <footer><span>LUNARIS / RESEARCH PROTOTYPE</span><span>NASA data credited to the respective source teams. Not affiliated with NASA.</span></footer>
    </div>
  </main>;
}

function MetricCard({ metricKey, site }: { metricKey: MetricKey; site: typeof sites[number] }) { const Icon = metricIcons[metricKey]; const definition = metricDefinitions[metricKey]; const metric = site.metrics[metricKey]; const available = metric.value !== null; return <article className={`metric-card ${available ? 'has-data' : ''}`}><div className="metric-icon"><Icon size={19} /></div><div className="metric-status">{available ? 'NASA-DERIVED' : 'DATA UNAVAILABLE'}</div><h3>{definition.label}</h3><div className="metric-value">{metric.value !== null ? metric.value.toLocaleString(undefined, { maximumFractionDigits: 2 }) : ' - '} <small>{metric.unit}</small></div>{available && <p className="metric-range">Range {metric.min}–{metric.max} {metric.unit} · {metric.resolutionMeters} m/px source</p>}<p>{definition.detail}</p><footer><span>{metric.source}</span><span>{available ? '1 km median' : 'Not processed'}</span></footer></article>; }
function SiteSummary({ site, label }: { site: typeof sites[number]; label: string }) { return <div className="compare-choice"><label>{label}</label><b>{site.shortName}</b><p>{coordinate(site.latitude, 'lat')} / {coordinate(site.longitude, 'lon')}</p></div>; }
function Source({ name, detail, href }: { name: string; detail: string; href: string }) { return <a href={href} target="_blank" rel="noreferrer"><span><Database size={18} /><b>{name}</b></span><p>{detail}</p><ArrowRight size={17} /></a>; }




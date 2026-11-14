'use client';

import { useMemo, useState } from 'react';
import { type LandingSite } from '@/lib/sites';
import { hoursUntilSet, simulate, simulationStats, solarInputIndex, type SimulationSample } from '@/lib/simulation';

type Scenario = { site: LandingSite; start: string; end: string };
type ScenarioView = Scenario & { samples: SimulationSample[]; label: string };

function duration(hours: number) {
  const minutes = Math.round(hours * 60);
  return `${Math.floor(minutes / 60)} h ${minutes % 60} min`;
}

function nextSetLabel(body: 'sun' | 'earth', samples: SimulationSample[], horizon: number, index: number) {
  const current = samples[index][body];
  const name = body === 'sun' ? 'Sunset' : 'Earthset';
  const until = hoursUntilSet(samples, body, horizon, index);
  if (current <= horizon) return `${name}: below assumed horizon now`;
  return until === null ? `${name}: outside this scenario window` : `${name} in ${duration(until)}`;
}

function ScenarioChart({ scenario, index, horizon }: { scenario: ScenarioView; index: number; horizon: number }) {
  const current = scenario.samples[index];
  const sun = simulationStats(scenario.samples, 'sun', horizon);
  const earth = simulationStats(scenario.samples, 'earth', horizon);
  const input = solarInputIndex(scenario.samples, horizon);
  const y = (value: number) => 150 - value * 7;
  const plot = (body: 'sun' | 'earth') => scenario.samples.map((point, i) => `${i ? 'L' : 'M'}${35 + i / (scenario.samples.length - 1) * 430},${y(point[body])}`).join(' ');

  return <article className="simulation-scenario">
    <header><span>{scenario.label} · {scenario.site.shortName}</span><small>{scenario.start} to {scenario.end} UTC</small></header>
    <div className="sim-stats">
      <div><b>{sun.percent.toFixed(1)}%</b><span>Simulated sunlight</span><small>{sun.hours.toFixed(1)} h in this interval</small></div>
      <div><b>{earth.percent.toFixed(1)}%</b><span>Geometric Earth window</span><small>{earth.hours.toFixed(1)} h · not a link guarantee</small></div>
    </div>
    <svg viewBox="0 0 500 250" role="img" aria-label={`${scenario.label}, simulated Sun and Earth elevation relative to an assumed horizon`}>
      <rect x="35" y="150" width="430" height="75" fill="#172538" />
      <line x1="35" x2="465" y1={y(horizon)} y2={y(horizon)} stroke="#e1d9ee" strokeDasharray="5 5" />
      <text x="35" y={y(horizon) - 6} fill="#ddd" fontSize="11">Assumed horizon {horizon}°</text>
      <path d={plot('sun')} stroke="#ffd27d" fill="none" strokeWidth="2.5" />
      <path d={plot('earth')} stroke="#73d9ef" fill="none" strokeWidth="2.5" />
      <line x1={35 + index / (scenario.samples.length - 1) * 430} x2={35 + index / (scenario.samples.length - 1) * 430} y1="20" y2="225" stroke="white" opacity=".5" />
      {[-10, 0, 10].map(value => <text key={value} x="2" y={y(value) + 4} fill="#a7baca" fontSize="10">{value}°</text>)}
    </svg>
    <p className="sim-current-time">Selected sample · {current.time.slice(0, 16).replace('T', ' ')} UTC</p>
    <div className="sim-readout">☀ Sun {current.sun.toFixed(1)}° · {current.sun > horizon ? 'above' : 'below'} horizon<br />◉ Earth {current.earth.toFixed(1)}° · {current.earth > horizon ? 'above' : 'below'} horizon</div>
    <div className="sim-window-readouts"><span>{nextSetLabel('sun', scenario.samples, horizon, index)}</span><span>{nextSetLabel('earth', scenario.samples, horizon, index)}</span></div>
    <p className="sim-power-index"><b>{input.toFixed(1)}%</b> relative horizontal solar-input index <small>Above-horizon geometry only; not watts or array output.</small></p>
    <p className="sim-longest">Longest clear windows · Sun {sun.longest.toFixed(1)} h · Earth {earth.longest.toFixed(1)} h<br />Dark interval · {sun.belowHours.toFixed(1)} h total · longest {sun.longestBelow.toFixed(1)} h</p>
  </article>;
}

export default function Simulation({ scenarioA, scenarioB }: { scenarioA: Scenario; scenarioB: Scenario }) {
  const [progress, setProgress] = useState(0);
  const [horizon, setHorizon] = useState(0);
  const samplesA = useMemo(() => simulate(scenarioA.site, scenarioA.start, scenarioA.end), [scenarioA]);
  const samplesB = useMemo(() => simulate(scenarioB.site, scenarioB.start, scenarioB.end), [scenarioB]);
  const scenarioViews: ScenarioView[] = [
    { ...scenarioA, label: 'SCENARIO A', samples: samplesA },
    { ...scenarioB, label: 'SCENARIO B', samples: samplesB },
  ];
  const indexA = Math.round(progress * (samplesA.length - 1));
  const indexB = Math.round(progress * (samplesB.length - 1));

  const download = async () => {
    const { downloadReport } = await import('@/lib/pdf-report');
    const sections = scenarioViews.flatMap((scenario) => {
      const sun = simulationStats(scenario.samples, 'sun', horizon);
      const earth = simulationStats(scenario.samples, 'earth', horizon);
      const currentIndex = scenario.label === 'SCENARIO A' ? indexA : indexB;
      const current = scenario.samples[currentIndex];
      return [
        {
          heading: `${scenario.label} · ${scenario.site.shortName}`,
          lines: [
            `Interval: ${scenario.start} to ${scenario.end} UTC`,
            `NASA PGDA Product 69 sunlight baseline: ${scenario.site.metrics.illumination.value ?? 'unavailable'}%`,
            `NASA PGDA Product 69 Earth-visibility baseline: ${scenario.site.metrics.earthVisibility.value ?? 'unavailable'}%`,
            `Simulated sunlight above ${horizon} degree horizon: ${sun.percent.toFixed(1)}%; ${sun.hours.toFixed(1)} hours; longest ${sun.longest.toFixed(1)} hours`,
            `Simulated darkness below the assumed horizon: ${sun.belowHours.toFixed(1)} hours; longest ${sun.longestBelow.toFixed(1)} hours`,
            `Simulated geometric Earth visibility above ${horizon} degree horizon: ${earth.percent.toFixed(1)}%; ${earth.hours.toFixed(1)} hours; longest ${earth.longest.toFixed(1)} hours`,
            `Relative horizontal solar-input index: ${solarInputIndex(scenario.samples, horizon).toFixed(1)}%; not watts or array output`,
            `Selected sample: ${current.time}; Sun ${current.sun.toFixed(2)} degrees; Earth ${current.earth.toFixed(2)} degrees`,
            `Sunset: ${nextSetLabel('sun', scenario.samples, horizon, currentIndex)}`,
            `Earthset: ${nextSetLabel('earth', scenario.samples, horizon, currentIndex)}`,
          ],
        },
        {
          heading: `${scenario.label} daily samples (UTC)`,
          lines: scenario.samples.filter((_, i) => i % 24 === 0).map(sample => `${sample.time.slice(0, 10)}: Sun ${sample.sun.toFixed(2)} degrees; Earth ${sample.earth.toFixed(2)} degrees`),
        },
      ];
    });
    downloadReport('Paired lunar scenarios', 'lunaris-scenarios', [
      ...sections,
      {
        heading: 'NASA data and simulation method',
        lines: [
          'NASA PGDA Product 69 long-term modeled illumination and geometric Earth visibility averages set each scenario curve duty fraction. Candidate coordinates are approximate representative centers.',
          'The 29.53-day and 27.32-day cycles, phase, and assumed horizon are illustrative. The selected dates do not produce actual ephemerides or mission forecasts.',
          'The solar-input index uses the mean positive sine of simulated solar elevation above the assumed horizon. It is a horizontal-collector geometry proxy, not power output.',
          'No terrain shadow, radio link budget, antenna pointing, array design, or operational communications model is included.',
          'https://pgda.gsfc.nasa.gov/products/69',
          'https://pgda.gsfc.nasa.gov/products/78',
        ],
      },
    ]);
  };

  return <section className="simulation" aria-label="Paired illustrative mission scenarios">
    <header className="simulation-header">
      <p className="eyebrow">NASA-DATA-ANCHORED SCENARIO COMPARISON</p>
      <h3>Compare site and date windows</h3>
      <p>NASA long-term averages anchor both scenarios. Curves show illustrative changes, not observed or forecast sky positions.</p>
    </header>
    <div className="simulation-layout">
      <div className="simulation-scenarios">{scenarioViews.map((scenario, i) => <ScenarioChart key={scenario.label} scenario={scenario} index={i === 0 ? indexA : indexB} horizon={horizon} />)}</div>
      <div className="simulation-controls">
        <label>Explore both intervals<input aria-label="Explore both scenario intervals" type="range" min="0" max="1000" value={progress * 1000} onChange={event => setProgress(+event.target.value / 1000)} /><small>Progress is synchronized across each selected date interval.</small></label>
        <label>Assumed local obstruction: {horizon}°<input type="range" min="0" max="8" step="0.5" value={horizon} onChange={event => setHorizon(+event.target.value)} /></label>
        <details>
          <summary>NASA data and model assumptions</summary>
          <p>NASA PGDA Product 69 long-term modeled sunlight and geometric Earth-visibility averages at each approximate candidate center set the fraction of each simulated cycle above the horizon. Product 78 supplies regional LOLA elevation and slope where local rasters overlap.</p>
          <p>The 29.53-day Sun cycle, 27.32-day Earth cycle, phase anchor, and obstruction are demonstration assumptions. The date controls compare scenarios; they do not calculate actual sky positions. The solar-input index is based on the sine of solar elevation above the assumed horizon. It is not watts or array performance. Darkness duration gives energy-storage and thermal-planning context; no equipment temperature is calculated.</p>
          <p>Earth visibility is a geometric opportunity only. Terrain horizons, radio link budgets, antenna pointing, actual power systems, and thermal conditions are outside this simulation.</p>
          <a href="https://pgda.gsfc.nasa.gov/products/69" target="_blank" rel="noreferrer">NASA PGDA illumination and Earth visibility ↗</a> · <a href="https://pgda.gsfc.nasa.gov/products/78" target="_blank" rel="noreferrer">NASA LOLA terrain ↗</a>
        </details>
        <button onClick={download}>Download paired-scenario PDF</button>
      </div>
    </div>
  </section>;
}

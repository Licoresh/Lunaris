import processed from '../data/site-metrics.json';

export type MetricStatus = 'unavailable' | 'nasa-derived';
export type ScientificMetric = { value: number | null; unit: string; status: MetricStatus; source: string; min?: number; max?: number; resolutionMeters?: number; radiusMeters?: number; validPixels?: number };
export type CoordinateBasis = 'published-research-point' | 'raster-footprint-center' | 'approximate-candidate-region-center';
export type LandingSite = {
  id: string; name: string; shortName: string; latitude: number; longitude: number;
  coordinateBasis: CoordinateBasis;
  areaKm2?: number; perimeterKm?: number; terrainRegionId?: string;
  coordinateNote: string; sourceUrl: string; pgdaProduct: string; description: string;
  missionNotes: string[];
  metrics: { elevation: ScientificMetric; slope: ScientificMetric; illumination: ScientificMetric; earthVisibility: ScientificMetric };
};

const unavailable = (unit: string, source: string): ScientificMetric => ({ value: null, unit, status: 'unavailable', source });
type ProcessedKey = 'illumination' | 'earthVisibility' | 'elevation' | 'slope';
type ProcessedMetric = { value: number; min: number; max: number; unit: string; resolutionMeters: number; radiusMeters: number; validPixels: number; status: 'nasa-derived' };
const processedSites = processed.sites as Record<string, { metrics?: Partial<Record<ProcessedKey, ProcessedMetric>> }>;
const derived = (siteId: string, key: ProcessedKey, source: string): ScientificMetric => {
  const metric = processedSites[siteId]?.metrics?.[key];
  return metric ? { value: metric.value, min: metric.min, max: metric.max, unit: metric.unit, resolutionMeters: metric.resolutionMeters, radiusMeters: metric.radiusMeters, validPixels: metric.validPixels, status: metric.status, source } : unavailable(key === 'elevation' ? 'm' : key === 'slope' ? '°' : '%', source);
};

/** Existing high-resolution PGDA study regions, kept separate from the Artemis candidate-region list. */
export const terrainRegions: LandingSite[] = [
  {
    id: 'connecting-ridge', name: 'Connecting Ridge research site', shortName: 'Connecting Ridge', latitude: -89.4, longitude: 233, coordinateBasis: 'published-research-point',
    coordinateNote: 'Approximate Site B research point (NASA/TM - 2007-215025); not a landing ellipse.', sourceUrl: 'https://ntrs.nasa.gov/citations/20070034951', pgdaProduct: 'LOLA Site01',
    description: 'A narrow highland connection near Shackleton studied for favorable polar illumination.',
    missionNotes: ['Narrow ridge geometry makes local slope and hazard mapping essential.', 'Illumination claims require the matching LOLA product and a defined analysis interval.'],
    metrics: { elevation: derived('connecting-ridge', 'elevation', 'LOLA Site01 LDEM'), slope: derived('connecting-ridge', 'slope', 'LOLA Site01 slope'), illumination: derived('connecting-ridge', 'illumination', 'PGDA polar illumination'), earthVisibility: derived('connecting-ridge', 'earthVisibility', 'PGDA Earth visibility') },
  },
  {
    id: 'shackleton-rim', name: 'Shackleton Rim research site', shortName: 'Shackleton Rim', latitude: -89.8, longitude: 213, coordinateBasis: 'published-research-point',
    coordinateNote: 'Approximate Site A1 research point (NASA/TM - 2007-215025); not a landing ellipse.', sourceUrl: 'https://ntrs.nasa.gov/citations/20070034951', pgdaProduct: 'LOLA Site04',
    description: 'A reference point on Shackleton’s rim beside permanently shadowed terrain.',
    missionNotes: ['Nearby shadowed terrain creates sharp thermal and lighting transitions.', 'A visible Earth direction alone does not establish a communications link budget.'],
    metrics: { elevation: derived('shackleton-rim', 'elevation', 'LOLA Site04 LDEM'), slope: derived('shackleton-rim', 'slope', 'LOLA Site04 slope'), illumination: derived('shackleton-rim', 'illumination', 'PGDA polar illumination'), earthVisibility: derived('shackleton-rim', 'earthVisibility', 'PGDA Earth visibility') },
  },
  {
    id: 'malapert-massif', name: 'Malapert Massif research site', shortName: 'Malapert Massif', latitude: -86, longitude: 4, coordinateBasis: 'published-research-point',
    coordinateNote: 'Approximate Site E research point (NASA/TM - 2007-215025); not a landing ellipse.', sourceUrl: 'https://ntrs.nasa.gov/citations/20070034951', pgdaProduct: 'LOLA Site23',
    description: 'A prominent south-polar massif long studied for illumination and Earth visibility.',
    missionNotes: ['Site23 elevation and slope are derived from downloaded NASA LOLA rasters.', 'Regional promise must not be interpreted as a site-level safety finding.'],
    metrics: { elevation: derived('malapert-massif', 'elevation', 'LOLA Site23 LDEM'), slope: derived('malapert-massif', 'slope', 'LOLA Site23 slope'), illumination: derived('malapert-massif', 'illumination', 'PGDA polar illumination'), earthVisibility: derived('malapert-massif', 'earthVisibility', 'PGDA Earth visibility') },
  },
  {
    id: 'nobile-rim-1', name: 'Nobile Rim 1 terrain region', shortName: 'Nobile Rim 1', latitude: -85.4381, longitude: 37.366669, coordinateBasis: 'raster-footprint-center',
    coordinateNote: 'Center of the NASA PGDA Site06 terrain-raster footprint; an exploratory region center, not a published landing coordinate or landing ellipse.', sourceUrl: 'https://pgda.gsfc.nasa.gov/products/78', pgdaProduct: 'LOLA Site06',
    description: 'Exploratory terrain coverage at Nobile Rim 1, centered on the downloaded LOLA raster footprint.',
    missionNotes: ['The comparison point is the raster footprint center, not a touchdown target.', 'The 1 km summary and date display are regional indicators, not a safety or mission-communications assessment.'],
    metrics: { elevation: derived('nobile-rim-1', 'elevation', 'LOLA Site06 LDEM'), slope: derived('nobile-rim-1', 'slope', 'LOLA Site06 slope'), illumination: derived('nobile-rim-1', 'illumination', 'PGDA polar illumination at raster center'), earthVisibility: derived('nobile-rim-1', 'earthVisibility', 'PGDA Earth visibility at raster center') },
  },
  {
    id: 'peak-near-shackleton', name: 'Peak near Shackleton terrain region', shortName: 'Peak near Shackleton', latitude: -88.811008, longitude: 123.690068, coordinateBasis: 'raster-footprint-center',
    coordinateNote: 'Center of the NASA PGDA Site07 terrain-raster footprint; an exploratory region center, not a published landing coordinate or landing ellipse.', sourceUrl: 'https://pgda.gsfc.nasa.gov/products/78', pgdaProduct: 'LOLA Site07',
    description: 'Exploratory terrain coverage near Shackleton, centered on the downloaded LOLA raster footprint.',
    missionNotes: ['The comparison point is the raster footprint center, not a touchdown target.', 'The 1 km summary and date display are regional indicators, not a safety or mission-communications assessment.'],
    metrics: { elevation: derived('peak-near-shackleton', 'elevation', 'LOLA Site07 LDEM'), slope: derived('peak-near-shackleton', 'slope', 'LOLA Site07 slope'), illumination: derived('peak-near-shackleton', 'illumination', 'PGDA polar illumination at raster center'), earthVisibility: derived('peak-near-shackleton', 'earthVisibility', 'PGDA Earth visibility at raster center') },
  },
  {
    id: 'de-gerlache-rim', name: 'de Gerlache Rim terrain region', shortName: 'de Gerlache Rim', latitude: -88.683418, longitude: 292.0679, coordinateBasis: 'raster-footprint-center',
    coordinateNote: 'Center of the NASA PGDA Site11 terrain-raster footprint; an exploratory region center, not a published landing coordinate or landing ellipse.', sourceUrl: 'https://pgda.gsfc.nasa.gov/products/78', pgdaProduct: 'LOLA Site11',
    description: 'Exploratory terrain coverage at de Gerlache Rim, centered on the downloaded LOLA raster footprint.',
    missionNotes: ['The comparison point is the raster footprint center, not a touchdown target.', 'The 1 km summary and date display are regional indicators, not a safety or mission-communications assessment.'],
    metrics: { elevation: derived('de-gerlache-rim', 'elevation', 'LOLA Site11 LDEM'), slope: derived('de-gerlache-rim', 'slope', 'LOLA Site11 slope'), illumination: derived('de-gerlache-rim', 'illumination', 'PGDA polar illumination at raster center'), earthVisibility: derived('de-gerlache-rim', 'earthVisibility', 'PGDA Earth visibility at raster center') },
  },
];

const CANDIDATE_SOURCE = 'https://www.its.ohio.edu/foundations/lunar/';
const CANDIDATES: Array<{ id: string; shortName: string; latitude: number; longitude: number; areaKm2: number; perimeterKm: number; terrain?: 'Site06' | 'Site23' }> = [
  { id: 'peak-near-cabeus-b', shortName: 'Peak near Cabeus B', latitude: -83.6, longitude: 291.3, areaKm2: 397.3, perimeterKm: 79.7 },
  { id: 'haworth', shortName: 'Haworth', latitude: -86.8, longitude: 337.2, areaKm2: 886.6, perimeterKm: 119.1 },
  { id: 'malapert-massif-candidate', shortName: 'Malapert Massif', latitude: -86.0, longitude: 359.8, areaKm2: 439.9, perimeterKm: 83.9, terrain: 'Site23' },
  { id: 'mons-mouton-plateau', shortName: 'Mons Mouton Plateau', latitude: -84.3, longitude: 30.6, areaKm2: 4428.4, perimeterKm: 268.9 },
  { id: 'mons-mouton', shortName: 'Mons Mouton', latitude: -85.4, longitude: 31.7, areaKm2: 255.2, perimeterKm: 63.9 },
  { id: 'nobile-rim-1-candidate', shortName: 'Nobile Rim 1', latitude: -85.4, longitude: 37.3, areaKm2: 398.7, perimeterKm: 79.9, terrain: 'Site06' },
  { id: 'nobile-rim-2', shortName: 'Nobile Rim 2', latitude: -84.0, longitude: 58.8, areaKm2: 397.8, perimeterKm: 79.8 },
  { id: 'de-gerlache-rim-2', shortName: 'de Gerlache Rim 2', latitude: -88.2, longitude: 295.4, areaKm2: 399.8, perimeterKm: 80.0 },
  { id: 'slater-plain', shortName: 'Slater Plain', latitude: -87.2, longitude: 125.5, areaKm2: 399.3, perimeterKm: 79.9 },
];

/** NASA's 2024 down-selected candidate regions; centers are approximate, not touchdown targets or official boundaries. */
export const candidateRegions: LandingSite[] = CANDIDATES.map(({ terrain, ...region }) => ({
  ...region,
  name: `${region.shortName} candidate region`,
  coordinateBasis: 'approximate-candidate-region-center',
  terrainRegionId: terrain === 'Site06' ? 'nobile-rim-1' : terrain === 'Site23' ? 'malapert-massif' : undefined,
  coordinateNote: 'Approximate representative center from the Ohio University Lunar Planner. NASA candidate regions are broad planning areas; this point is not a touchdown target or the official region boundary.',
  sourceUrl: CANDIDATE_SOURCE,
  pgdaProduct: terrain ? `LOLA ${terrain}` : 'No local 5 m LOLA raster at this center',
  description: 'One of NASA’s nine 2024 refined lunar south-pole candidate regions.',
  missionNotes: [
    `NASA’s 2025 candidate-region table reports ${region.areaKm2.toLocaleString()} km² area and ${region.perimeterKm.toFixed(1)} km perimeter.`,
    terrain ? `The approximate center falls inside the local ${terrain} 5 m LOLA raster.` : 'No local 5 m elevation/slope raster covers this approximate center; those fields remain unavailable.',
  ],
  metrics: {
    illumination: derived(region.id, 'illumination', 'NASA PGDA Product 69 · 1 km neighborhood at approximate region center'),
    earthVisibility: derived(region.id, 'earthVisibility', 'NASA PGDA Product 69 · 1 km neighborhood at approximate region center'),
    elevation: derived(region.id, 'elevation', terrain ? `NASA LOLA ${terrain} elevation` : 'No local 5 m LOLA coverage at this center'),
    slope: derived(region.id, 'slope', terrain ? `NASA LOLA ${terrain} slope` : 'No local 5 m LOLA coverage at this center'),
  },
}));

export const sites = candidateRegions;

export const metricDefinitions = {
  illumination: { label: 'Solar illumination', detail: 'Historical modeled average over an 18.6-year lunar nutation cycle. This is not a mission-date forecast.' },
  earthVisibility: { label: 'Earth visibility', detail: 'Historical modeled average geometric Earth line of sight. This is not a guaranteed communications link.' },
  elevation: { label: 'Terrain elevation', detail: 'LOLA surface height in meters. Available only where a local 5 m raster covers the candidate center.' },
  slope: { label: 'Terrain slope', detail: 'Surface inclination in degrees. Available only where a local 5 m raster covers the candidate center.' },
} as const;
export type MetricKey = keyof typeof metricDefinitions;


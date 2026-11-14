import processed from '../data/site-metrics.json';

export type MetricStatus = 'unavailable' | 'nasa-derived';
export type ScientificMetric = { value: number | null; unit: string; status: MetricStatus; source: string; min?: number; max?: number; resolutionMeters?: number; radiusMeters?: number; validPixels?: number };
export type CoordinateBasis = 'published-research-point' | 'raster-footprint-center';
export type LandingSite = {
  id: string; name: string; shortName: string; latitude: number; longitude: number;
  coordinateBasis: CoordinateBasis;
  coordinateNote: string; sourceUrl: string; pgdaProduct: string; description: string;
  missionNotes: string[];
  metrics: { elevation: ScientificMetric; slope: ScientificMetric; illumination: ScientificMetric; earthVisibility: ScientificMetric };
};

const unavailable = (unit: string, source: string): ScientificMetric => ({ value: null, unit, status: 'unavailable', source });
type ProcessedKey = 'illumination' | 'earthVisibility' | 'elevation' | 'slope';
type ProcessedMetric = { value: number; min: number; max: number; unit: string; resolutionMeters: number; radiusMeters: number; validPixels: number; status: 'nasa-derived' };
const derived = (siteId: keyof typeof processed.sites, key: ProcessedKey, source: string): ScientificMetric => {
  const metric = (processed.sites[siteId].metrics as Partial<Record<ProcessedKey, ProcessedMetric>>)[key];
  return metric ? { value: metric.value, min: metric.min, max: metric.max, unit: metric.unit, resolutionMeters: metric.resolutionMeters, radiusMeters: metric.radiusMeters, validPixels: metric.validPixels, status: metric.status, source } : unavailable(key === 'elevation' ? 'm' : key === 'slope' ? '°' : '%', source);
};

/** Three published research points and three PGDA raster centers; none is a certified landing ellipse. Longitudes are positive-east, 0-360. */
export const sites: LandingSite[] = [
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

export const metricDefinitions = {
  illumination: { label: 'Solar illumination', detail: 'Historical modeled average over an 18.6-year lunar nutation cycle. This is not a mission-date forecast.' },
  earthVisibility: { label: 'Earth visibility', detail: 'Historical modeled average geometric Earth line of sight. This is not a guaranteed communications link.' },
  elevation: { label: 'Terrain elevation', detail: 'LOLA surface height in meters in the source product’s lunar reference frame.' },
  slope: { label: 'Terrain slope', detail: 'Local surface inclination in degrees from the validated LOLA slope raster.' },
} as const;
export type MetricKey = keyof typeof metricDefinitions;


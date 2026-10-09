import processed from '../data/site-metrics.json';

export type MetricStatus = 'unavailable' | 'nasa-derived';
export type ScientificMetric = { value: number | null; unit: string; status: MetricStatus; source: string; min?: number; max?: number; resolutionMeters?: number; radiusMeters?: number; validPixels?: number };
export type LandingSite = {
  id: string; name: string; shortName: string; latitude: number; longitude: number;
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

/** Published research reference points, not certified landing ellipses. Positive-east longitudes. */
export const sites: LandingSite[] = [
  {
    id: 'connecting-ridge', name: 'Connecting Ridge research site', shortName: 'Connecting Ridge', latitude: -89.4, longitude: 233,
    coordinateNote: 'Approximate Site B research point (NASA/TM - 2007-215025); not a landing ellipse.', sourceUrl: 'https://ntrs.nasa.gov/citations/20070034951', pgdaProduct: 'LOLA Site01',
    description: 'A narrow highland connection near Shackleton studied for favorable polar illumination.',
    missionNotes: ['Narrow ridge geometry makes local slope and hazard mapping essential.', 'Illumination claims require the matching LOLA product and a defined analysis interval.'],
    metrics: { elevation: derived('connecting-ridge', 'elevation', 'LOLA Site01 LDEM'), slope: derived('connecting-ridge', 'slope', 'LOLA Site01 slope'), illumination: derived('connecting-ridge', 'illumination', 'PGDA polar illumination'), earthVisibility: derived('connecting-ridge', 'earthVisibility', 'PGDA Earth visibility') },
  },
  {
    id: 'shackleton-rim', name: 'Shackleton Rim research site', shortName: 'Shackleton Rim', latitude: -89.8, longitude: 213,
    coordinateNote: 'Approximate Site A1 research point (NASA/TM - 2007-215025); not a landing ellipse.', sourceUrl: 'https://ntrs.nasa.gov/citations/20070034951', pgdaProduct: 'LOLA Site04',
    description: 'A reference point on Shackleton’s rim beside permanently shadowed terrain.',
    missionNotes: ['Nearby shadowed terrain creates sharp thermal and lighting transitions.', 'A visible Earth direction alone does not establish a communications link budget.'],
    metrics: { elevation: derived('shackleton-rim', 'elevation', 'LOLA Site04 LDEM'), slope: derived('shackleton-rim', 'slope', 'LOLA Site04 slope'), illumination: derived('shackleton-rim', 'illumination', 'PGDA polar illumination'), earthVisibility: derived('shackleton-rim', 'earthVisibility', 'PGDA Earth visibility') },
  },
  {
    id: 'malapert-massif', name: 'Malapert Massif research site', shortName: 'Malapert Massif', latitude: -86, longitude: 4,
    coordinateNote: 'Approximate Site E research point (NASA/TM - 2007-215025); not a landing ellipse.', sourceUrl: 'https://ntrs.nasa.gov/citations/20070034951', pgdaProduct: 'LOLA Site23',
    description: 'A prominent south-polar massif long studied for illumination and Earth visibility.',
    missionNotes: ['Site23 elevation and slope are derived from downloaded NASA LOLA rasters.', 'Regional promise must not be interpreted as a site-level safety finding.'],
    metrics: { elevation: derived('malapert-massif', 'elevation', 'LOLA Site23 LDEM'), slope: derived('malapert-massif', 'slope', 'LOLA Site23 slope'), illumination: derived('malapert-massif', 'illumination', 'PGDA polar illumination'), earthVisibility: derived('malapert-massif', 'earthVisibility', 'PGDA Earth visibility') },
  },
];

export const metricDefinitions = {
  illumination: { label: 'Solar illumination', detail: 'Historical modeled average over an 18.6-year lunar nutation cycle. This is not a mission-date forecast.' },
  earthVisibility: { label: 'Earth visibility', detail: 'Historical modeled average geometric Earth line of sight. This is not a guaranteed communications link.' },
  elevation: { label: 'Terrain elevation', detail: 'LOLA surface height in meters in the source product’s lunar reference frame.' },
  slope: { label: 'Terrain slope', detail: 'Local surface inclination in degrees from the validated LOLA slope raster.' },
} as const;
export type MetricKey = keyof typeof metricDefinitions;


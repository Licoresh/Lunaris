import { MathUtils, Vector3 } from 'three';
/** Maps positive-east selenographic coordinates to the app's Y-up display frame. */
export function latLonToVector(latitude: number, longitude: number, radius = 1.02) {
  const lat = MathUtils.degToRad(latitude); const lon = MathUtils.degToRad(longitude);
  return new Vector3(radius * Math.cos(lat) * Math.sin(lon), radius * Math.sin(lat), radius * Math.cos(lat) * Math.cos(lon));
}

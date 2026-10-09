export const MOON_RADIUS=1737400;
export function polarPoint(latitude:number,longitude:number){const r=2*MOON_RADIUS*Math.tan((90+latitude)*Math.PI/360),l=longitude*Math.PI/180;return {x:r*Math.sin(l),y:-r*Math.cos(l)}}
export function polarCoordinate(x:number,y:number){return {latitude:2*Math.atan(Math.hypot(x,y)/(2*MOON_RADIUS))*180/Math.PI-90,longitude:(Math.atan2(x,-y)*180/Math.PI+360)%360}}
export type MapView={x:number;y:number;span:number};
export function constrainMap(view:MapView,bounds:number[]){const [left,bottom,right,top]=bounds;const span=Math.max(4000,Math.min(view.span,right-left,top-bottom));return {span,x:Math.max(left+span/2,Math.min(right-span/2,view.x)),y:Math.max(-top+span/2,Math.min(-bottom-span/2,view.y))}}

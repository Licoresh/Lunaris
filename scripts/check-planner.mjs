const fs=await import('node:fs');
for(const site of ['connecting-ridge','shackleton-rim']){
const r=await fetch(`http://localhost:3000/api/ephemeris?site=${site}&start=2026-11-01&end=2026-11-08`);const data=await r.json();console.log(JSON.stringify({status:r.status,site,samples:data.sun?.length,sun:data.sun?.[0],earth:data.earth?.[0],error:data.error}));if(r.ok)fs.writeFileSync(`docs/horizons-${site}-reference.json`,JSON.stringify(data,null,2));}
const invalid=await fetch('http://localhost:3000/api/ephemeris?site=connecting-ridge&start=2026-02-30&end=2026-03-04');console.log('Invalid interval HTTP',invalid.status);

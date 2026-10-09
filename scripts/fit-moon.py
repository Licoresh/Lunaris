import json,numpy as np
s=np.array(json.load(open('docs/moon-uv-samples.json')))
lon=(s[:,0]-.5)*2*np.pi;lat=(s[:,1]-.5)*np.pi
a=np.stack([np.cos(lat)*np.sin(lon),np.sin(lat),np.cos(lat)*np.cos(lon)],axis=1);b=s[:,2:]
u,d,v=np.linalg.svd(a.T@b);r=u@v
p=a@r;e=np.degrees(np.arccos(np.clip(np.sum(p*b,axis=1),-1,1)))
print('det',np.linalg.det(r),'matrix',r.T.tolist(),'rms',np.sqrt(np.mean(e*e)),'max',max(e),'percentiles',np.percentile(e,[50,95,99]))
json.dump({'matrix':r.T.tolist(),'rmsDegrees':float(np.sqrt(np.mean(e*e))),'maxDegrees':float(max(e)),'samples':len(s),'determinant':float(np.linalg.det(r))},open('docs/moon-transform-fit.json','w'),indent=2)

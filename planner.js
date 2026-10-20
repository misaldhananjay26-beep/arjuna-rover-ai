(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.RoverPlanner = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const DIRECTIONS = [[1,0],[-1,0],[0,1],[0,-1]];
  function key(p) { return `${p.x},${p.y}`; }
  function planRoute({ width, height, start, goal, walls = new Set(), hazards = new Set(), riskWeight = 7 }) {
    if (!Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1) throw new Error('Grid dimensions must be positive integers.');
    const inside = p => Number.isInteger(p.x) && Number.isInteger(p.y) && p.x >= 0 && p.y >= 0 && p.x < width && p.y < height;
    if (!inside(start) || !inside(goal)) throw new Error('Start and goal must be inside the map.');
    const startKey = key(start), goalKey = key(goal);
    if (walls.has(startKey) || walls.has(goalKey)) return { found:false, path:[], distance:null, riskCost:null, totalCost:null };
    const dist = new Map([[startKey, 0]]), prev = new Map(), remaining = new Set([startKey]);
    const maxWeight = Math.max(1, Math.min(9, Number(riskWeight) || 1));
    while (remaining.size) {
      let currentKey = null, best = Infinity;
      for (const candidate of remaining) if (dist.get(candidate) < best) { best = dist.get(candidate); currentKey = candidate; }
      if (currentKey === null) break;
      remaining.delete(currentKey);
      if (currentKey === goalKey) break;
      const [cx, cy] = currentKey.split(',').map(Number);
      for (const [dx, dy] of DIRECTIONS) {
        const next = {x:cx+dx,y:cy+dy};
        if (!inside(next)) continue;
        const nextKey = key(next); if (walls.has(nextKey)) continue;
        const hazardPenalty = hazards.has(nextKey) ? maxWeight : 0;
        const nextCost = best + 1 + hazardPenalty;
        if (nextCost < (dist.get(nextKey) ?? Infinity)) { dist.set(nextKey,nextCost); prev.set(nextKey,currentKey); remaining.add(nextKey); }
      }
    }
    if (!dist.has(goalKey)) return { found:false, path:[], distance:null, riskCost:null, totalCost:null };
    const path=[]; let cursor=goalKey;
    while (cursor !== startKey) { const [x,y]=cursor.split(',').map(Number); path.push({x,y}); cursor=prev.get(cursor); if (!cursor) return {found:false,path:[],distance:null,riskCost:null,totalCost:null}; }
    path.push({x:start.x,y:start.y}); path.reverse();
    const riskCount = path.slice(1).filter(p => hazards.has(key(p))).length;
    return { found:true, path, distance:path.length-1, riskCount, riskCost:riskCount*maxWeight, totalCost:dist.get(goalKey) };
  }
  return { planRoute };
});

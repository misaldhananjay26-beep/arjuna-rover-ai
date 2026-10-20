(() => {
  'use strict';
  const W=12,H=10,START={x:0,y:0},GOAL={x:11,y:9};
  const INITIAL_WALLS=['2,0','2,1','2,2','5,1','5,2','5,3','8,0','8,1','8,2','8,3','3,5','4,5','5,5','9,6','9,7','9,8','1,7','2,7'];
  const hazards=new Set(['4,0','4,1','4,2','7,5','7,6','7,7','10,3','10,4']);
  let walls=new Set(INITIAL_WALLS), rover={...START}, route=[], routeIndex=0, running=false, timer=null, battery=100;
  const $=id=>document.getElementById(id), grid=$('grid');
  const pointKey=p=>`${p.x},${p.y}`;
  function riskWeight(){return Number($('riskSlider').value);}
  function result(){return RoverPlanner.planRoute({width:W,height:H,start:rover,goal:GOAL,walls,hazards,riskWeight:riskWeight()});}
  function status(text,kind){const el=$('statusPill');el.textContent=text;el.className=`pill ${kind}`;}
  function refreshPlan(message){const plan=result();route=plan.path;routeIndex=0;$('distanceMetric').textContent=plan.found?`${plan.distance} tiles`:'—';$('riskMetric').textContent=plan.found?`${plan.riskCount} zones`:'—';$('batteryMetric').textContent=`${Math.max(0,Math.round(battery))}%`;
    if(!plan.found){$('decisionText').textContent='No safe route is available. Clear a wall or create a different map.';status('NO ROUTE','blocked');}
    else {$('decisionText').textContent=message || (plan.riskCount?`Selected ${plan.distance}-tile route; it crosses ${plan.riskCount} risk zone${plan.riskCount===1?'':'s'} at the current safety setting.`:`Selected a ${plan.distance}-tile route that avoids marked risk zones.`);if(!running&&rover.x===START.x&&rover.y===START.y)status('READY','ready');}
    draw();return plan;
  }
  function draw(){grid.innerHTML='';grid.style.setProperty('--cols',W);const routeSet=new Set(route.slice(routeIndex+1).map(pointKey));
    for(let y=0;y<H;y++)for(let x=0;x<W;x++){const p={x,y},k=pointKey(p),cell=document.createElement('button');cell.type='button';cell.className='cell';cell.setAttribute('role','gridcell');cell.setAttribute('aria-label',`Tile ${x+1}, ${y+1}${walls.has(k)?', wall':hazards.has(k)?', risk zone':''}`);
      if(walls.has(k))cell.classList.add('wall');else if(hazards.has(k))cell.classList.add('hazard');if(routeSet.has(k))cell.classList.add('path');if(k===pointKey(rover)){cell.classList.add('rover');cell.textContent='R';cell.setAttribute('aria-label',`Rover at tile ${x+1}, ${y+1}`);}else if(k===pointKey(GOAL)){cell.classList.add('goal');cell.textContent='◎';}else if(hazards.has(k))cell.textContent='!';
      cell.addEventListener('click',()=>toggleWall(p));grid.appendChild(cell);}
  }
  function stopTimer(){if(timer){clearTimeout(timer);timer=null;}running=false;$('runBtn').textContent='▶ Run mission';}
  function toggleWall(p){const k=pointKey(p);if(k===pointKey(rover)||k===pointKey(GOAL))return;if(running){stopTimer();status('SAFE STOP','paused');const safe=refreshPlan('Map changed during motion. Rover stopped; route recomputed before resuming.');if(!safe.found)status('SAFE STOP','blocked');return;}if(walls.has(k))walls.delete(k);else walls.add(k);refreshPlan();}
  function moveOne(){if(!route.length||routeIndex>=route.length-1){stopTimer();if(rover.x===GOAL.x&&rover.y===GOAL.y){status('MISSION DONE','done');$('decisionText').textContent='Target reached. Rover stopped at the goal.';}return false;}
    const next=route[routeIndex+1],k=pointKey(next);if(walls.has(k)){stopTimer();status('SAFE STOP','blocked');refreshPlan('Obstacle detected ahead. Rover stopped; choose a new route.');return false;}
    rover=next;routeIndex++;battery=Math.max(0,battery-1.2-(hazards.has(k)?2:0));$('batteryMetric').textContent=`${Math.round(battery)}%`;draw();if(rover.x===GOAL.x&&rover.y===GOAL.y){stopTimer();status('MISSION DONE','done');$('decisionText').textContent='Target reached. Rover stopped at the goal.';return false;}return true;
  }
  function run(){if(running){stopTimer();status('PAUSED','paused');$('decisionText').textContent='Mission paused. Review the map, then resume when ready.';return;}const plan=refreshPlan();if(!plan.found)return;if(rover.x===GOAL.x&&rover.y===GOAL.y){status('MISSION DONE','done');return;}if(!route.length||routeIndex>=route.length-1){const fresh=result();route=fresh.path;routeIndex=0;}running=true;status('RUNNING','running');$('runBtn').textContent='Ⅱ Pause';const tick=()=>{if(!running)return;if(moveOne()&&running)timer=setTimeout(tick,480);};timer=setTimeout(tick,220);}
  function step(){if(running)stopTimer();let plan=result();if(!plan.found){refreshPlan();return;}if(!route.length||routeIndex>=route.length-1){route=plan.path;routeIndex=0;}if(rover.x===GOAL.x&&rover.y===GOAL.y){status('MISSION DONE','done');return;}status('STEPPING','running');moveOne();if(rover.x!==GOAL.x||rover.y!==GOAL.y){status('PAUSED','paused');}}
  function reset(){stopTimer();walls=new Set(INITIAL_WALLS);rover={...START};battery=100;refreshPlan('Ready. The route minimizes travel plus a configurable penalty for risk zones.');}
  function randomMap(){stopTimer();walls=new Set();for(let y=0;y<H;y++)for(let x=0;x<W;x++){const p={x,y};if(pointKey(p)===pointKey(START)||pointKey(p)===pointKey(GOAL)||hazards.has(pointKey(p)))continue;if(Math.random()<.16)walls.add(pointKey(p));}rover={...START};battery=100;const p=refreshPlan('New map generated. Planner searches for a low-risk route; edit walls by clicking tiles.');if(!p.found){for(let i=0;i<20&&!result().found;i++)randomWallsOnly();refreshPlan('Map regenerated to ensure a navigable mission.');}}
  function randomWallsOnly(){walls=new Set();for(let y=0;y<H;y++)for(let x=0;x<W;x++){const p={x,y},k=pointKey(p);if(k!==pointKey(START)&&k!==pointKey(GOAL)&&!hazards.has(k)&&Math.random()<.12)walls.add(k);}}
  $('runBtn').addEventListener('click',run);$('stepBtn').addEventListener('click',step);$('resetBtn').addEventListener('click',reset);$('randomBtn').addEventListener('click',randomMap);
  $('riskSlider').addEventListener('input',()=>{const v=riskWeight();$('riskValue').textContent=v<=3?'Low':v<=6?'Medium':'High';if(!running)refreshPlan();});
  refreshPlan();
})();

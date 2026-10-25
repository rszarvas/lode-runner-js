// Lode Runner JS - önálló, szerkeszthető korai prototípus.
// A pályák és grafika közelítések, nem az eredeti D64 visszafejtése.
(() => {
const c=document.getElementById('screen'),g=c.getContext('2d');
g.imageSmoothingEnabled=false;
const W=28,H=16,S=8,OX=48,OY=28;
const maps=[
['............................','...............$............','.......$......####.....$....','....#####......H......#####.','......H........H............','..$...H.....$..H...$........','.######..#######..########..','......H...........H.........','......H....$......H..$......','...###########....H######...','......H...........H.........','..$...H..$......$.H......E..','.######H##########H#######..','.......H...........H........','.P.....H...$...$...H...$....','############################'],
['............................','...$...........$.........$..','..#######..#########..#####.','......H........H............','..$...H....$...H...$........','.######..#######..########..','......H...........H.........','......H....$......H..$......','...###########....H######...','......H...........H.........','..$...H..$......$.H.........','.######H##########H#######..','.......H...........H........','.P.....H...$...$...H...$..E.','...#########..############..','############################']
];
let level=0,grid=[],player={x:1,y:14},enemies=[],gold=0,score=0,lives=5,paused=true,holes=new Map(),tick=0;
const keys=new Set();
function tile(x,y){return y<0||y>=H||x<0||x>=W?'X':grid[y][x]}
function set(x,y,v){if(x>=0&&x<W&&y>=0&&y<H)grid[y][x]=v}
function solid(t){return t==='#'||t==='X'}
function load(){
 grid=maps[level%maps.length].map(row=>row.split(''));
 enemies=[];gold=0;holes.clear();
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){
  const t=tile(x,y);
  if(t==='$')gold++;
  if(t==='P'){player={x,y};set(x,y,'.')}
  if(t==='E'){enemies.push({x,y});set(x,y,'.')}
 }
 // Az ideiglenes pályákon az aranyak az elérhető alsó járószintre kerülnek.
 for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(tile(x,y)==='$')set(x,y,'.');
 const wanted=gold;gold=0;
 for(let x=1;x<W-1&&gold<wanted;x++){
  if(tile(x,14)==='.'&&tile(x,15)==='#'&&!(player.x===x&&player.y===14)){
   set(x,14,'$');gold++;
  }
 }
}
function restart(){level=0;score=0;lives=5;paused=false;load()}
function move(a,dx,dy){const nx=a.x+dx,ny=a.y+dy;if(!solid(tile(nx,ny))&&nx>=0&&nx<W&&ny>=0&&ny<H){a.x=nx;a.y=ny;return true}return false}
function gravity(a){const t=tile(a.x,a.y),b=tile(a.x,a.y+1);if(t!=='H'&&t!=='-'&&b!=='H'&&!solid(b))move(a,0,1)}
function dig(dir){const x=player.x+dir,y=player.y+1;if(tile(x,y)==='#'){set(x,y,'.');holes.set(x+','+y,65)}}
function update(){if(paused)return;tick++;let dx=0,dy=0;if(keys.has('ArrowLeft')||keys.has('a'))dx=-1;else if(keys.has('ArrowRight')||keys.has('d'))dx=1;else if(keys.has('ArrowUp')||keys.has('w'))dy=-1;else if(keys.has('ArrowDown')||keys.has('s'))dy=1;
if(dy<0&&(tile(player.x,player.y)==='H'||tile(player.x,player.y-1)==='H')){if(tile(player.x,player.y-1)==='#' && tile(player.x,player.y)==='H')set(player.x,player.y-1,'H');move(player,0,-1);}
else if(dy>0)move(player,0,1);
else if(dx)move(player,dx,0);
gravity(player);
if(tile(player.x,player.y)==='$'){set(player.x,player.y,'.');gold--;score+=100;if(gold===0){level++;load();return}}
if(tick%3===0)for(const e of enemies){const d=Math.sign(player.x-e.x);if(d&&Math.random()<.75)move(e,d,0);else if(player.y<e.y&&tile(e.x,e.y)==='H')move(e,0,-1);gravity(e)}
for(const e of enemies)if(e.x===player.x&&e.y===player.y){lives--;if(lives<=0){paused=true}else load();break}
for(const [k,v] of holes){if(v<=1){const [x,y]=k.split(',').map(Number);set(x,y,'#');holes.delete(k)}else holes.set(k,v-1)}
}
const palette={brick:'#b65850',concrete:'#b4b4b4',ladder:'#e6bd64',rope:'#d3a75d',gold:'#f5d85b',runner:'#80e5f4',enemy:'#ef6d93'};
function rect(x,y,w,h,color){g.fillStyle=color;g.fillRect(x,y,w,h)}
function drawTile(t,x,y){const px=OX+x*S,py=OY+y*S;if(t==='#'){rect(px,py,8,8,'#aa5548');rect(px,py,8,1,'#e89b78');rect(px,py+4,8,1,'#592e37');rect(px+4,py,1,4,'#592e37');rect(px+1,py+1,2,1,'#d77c68');rect(px+5,py+5,2,1,'#d77c68')}else if(t==='X'){rect(px,py,8,8,palette.concrete);rect(px+1,py+1,2,2,'#777')}else if(t==='H'){rect(px+1,py,1,8,palette.ladder);rect(px+6,py,1,8,palette.ladder);rect(px+1,py+2,6,1,palette.ladder);rect(px+1,py+5,6,1,palette.ladder)}else if(t==='-')rect(px,py+3,8,1,palette.rope);else if(t==='$'){rect(px+2,py+1,4,6,palette.gold);rect(px+1,py+3,6,2,palette.gold)}}
function figure(a,color){const x=OX+a.x*S,y=OY+a.y*S;rect(x+3,y,2,2,'#ffe4ae');rect(x+3,y+2,2,3,color);rect(x+1,y+3,2,1,color);rect(x+5,y+3,2,1,color);rect(x+2,y+5,1,2,color);rect(x+5,y+5,1,2,color);rect(x+1,y+7,2,1,color);rect(x+5,y+7,2,1,color)}
function draw(){rect(0,0,320,200,'#000');g.font='8px monospace';g.fillStyle='#fff';g.fillText('LODE RUNNER    SCORE '+String(score).padStart(5,'0'),48,13);g.fillText('LEVEL '+(level+1)+'   LIVES '+lives+'   GOLD '+gold,48,23);for(let y=0;y<H;y++)for(let x=0;x<W;x++)drawTile(tile(x,y),x,y);figure(player,palette.runner);for(const e of enemies)figure(e,palette.enemy);if(paused){rect(80,94,160,17,'#000');g.fillStyle='#fff';g.fillText(lives?'SZÜNET - P / INDÍTÁS':'VÉGE - R / INDÍTÁS',91,105)}}
document.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown',' '].includes(e.key))e.preventDefault();keys.add(e.key);if(e.repeat)return;if(e.key==='z'||e.key==='Z')dig(-1);if(e.key==='x'||e.key==='X')dig(1);if(e.key==='p'||e.key==='P')paused=!paused;if(e.key==='r'||e.key==='R')restart()});
document.addEventListener('keyup',e=>keys.delete(e.key));
document.getElementById('start').onclick=restart;document.getElementById('pause').onclick=()=>paused=!paused;document.getElementById('leftdig').onclick=()=>dig(-1);document.getElementById('rightdig').onclick=()=>dig(1);
load();draw();setInterval(()=>{update();draw()},100);
})();)set(x,y,'.');
const slots=[2,4,6,8,10,12,14,16,18,20,22,24,26,3,5,7,9,11,13,15,17,19,21,23,25];
let placed=0;for(const x of slots){if(placed>=gold)break;if(tile(x,14)==='.'&&tile(x,15)==='#'&&!(player.x===x&&player.y===14)){set(x,14,'
function restart(){level=0;score=0;lives=5;paused=false;load()}
function move(a,dx,dy){const nx=a.x+dx,ny=a.y+dy;if(!solid(tile(nx,ny))&&nx>=0&&nx<W&&ny>=0&&ny<H){a.x=nx;a.y=ny;return true}return false}
function gravity(a){const t=tile(a.x,a.y),b=tile(a.x,a.y+1);if(t!=='H'&&t!=='-'&&b!=='H'&&!solid(b))move(a,0,1)}
function dig(dir){const x=player.x+dir,y=player.y+1;if(tile(x,y)==='#'){set(x,y,'.');holes.set(x+','+y,65)}}
function update(){if(paused)return;tick++;let dx=0,dy=0;if(keys.has('ArrowLeft')||keys.has('a'))dx=-1;else if(keys.has('ArrowRight')||keys.has('d'))dx=1;else if(keys.has('ArrowUp')||keys.has('w'))dy=-1;else if(keys.has('ArrowDown')||keys.has('s'))dy=1;
if(dy<0&&(tile(player.x,player.y)==='H'||tile(player.x,player.y-1)==='H')){if(tile(player.x,player.y-1)==='#' && tile(player.x,player.y)==='H')set(player.x,player.y-1,'H');move(player,0,-1);}
else if(dy>0)move(player,0,1);
else if(dx)move(player,dx,0);
gravity(player);
if(tile(player.x,player.y)==='$'){set(player.x,player.y,'.');gold--;score+=100;if(gold===0){level++;load();return}}
if(tick%3===0)for(const e of enemies){const d=Math.sign(player.x-e.x);if(d&&Math.random()<.75)move(e,d,0);else if(player.y<e.y&&tile(e.x,e.y)==='H')move(e,0,-1);gravity(e)}
for(const e of enemies)if(e.x===player.x&&e.y===player.y){lives--;if(lives<=0){paused=true}else load();break}
for(const [k,v] of holes){if(v<=1){const [x,y]=k.split(',').map(Number);set(x,y,'#');holes.delete(k)}else holes.set(k,v-1)}
}
const palette={brick:'#b65850',concrete:'#b4b4b4',ladder:'#e6bd64',rope:'#d3a75d',gold:'#f5d85b',runner:'#80e5f4',enemy:'#ef6d93'};
function rect(x,y,w,h,color){g.fillStyle=color;g.fillRect(x,y,w,h)}
function drawTile(t,x,y){const px=OX+x*S,py=OY+y*S;if(t==='#'){rect(px,py,8,8,'#aa5548');rect(px,py,8,1,'#e89b78');rect(px,py+4,8,1,'#592e37');rect(px+4,py,1,4,'#592e37');rect(px+1,py+1,2,1,'#d77c68');rect(px+5,py+5,2,1,'#d77c68')}else if(t==='X'){rect(px,py,8,8,palette.concrete);rect(px+1,py+1,2,2,'#777')}else if(t==='H'){rect(px+1,py,1,8,palette.ladder);rect(px+6,py,1,8,palette.ladder);rect(px+1,py+2,6,1,palette.ladder);rect(px+1,py+5,6,1,palette.ladder)}else if(t==='-')rect(px,py+3,8,1,palette.rope);else if(t==='$'){rect(px+2,py+1,4,6,palette.gold);rect(px+1,py+3,6,2,palette.gold)}}
function figure(a,color){const x=OX+a.x*S,y=OY+a.y*S;rect(x+3,y,2,2,'#ffe4ae');rect(x+3,y+2,2,3,color);rect(x+1,y+3,2,1,color);rect(x+5,y+3,2,1,color);rect(x+2,y+5,1,2,color);rect(x+5,y+5,1,2,color);rect(x+1,y+7,2,1,color);rect(x+5,y+7,2,1,color)}
function draw(){rect(0,0,320,200,'#000');g.font='8px monospace';g.fillStyle='#fff';g.fillText('LODE RUNNER    SCORE '+String(score).padStart(5,'0'),48,13);g.fillText('LEVEL '+(level+1)+'   LIVES '+lives+'   GOLD '+gold,48,23);for(let y=0;y<H;y++)for(let x=0;x<W;x++)drawTile(tile(x,y),x,y);figure(player,palette.runner);for(const e of enemies)figure(e,palette.enemy);if(paused){rect(80,94,160,17,'#000');g.fillStyle='#fff';g.fillText(lives?'SZÜNET - P / INDÍTÁS':'VÉGE - R / INDÍTÁS',91,105)}}
document.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown',' '].includes(e.key))e.preventDefault();keys.add(e.key);if(e.repeat)return;if(e.key==='z'||e.key==='Z')dig(-1);if(e.key==='x'||e.key==='X')dig(1);if(e.key==='p'||e.key==='P')paused=!paused;if(e.key==='r'||e.key==='R')restart()});
document.addEventListener('keyup',e=>keys.delete(e.key));
document.getElementById('start').onclick=restart;document.getElementById('pause').onclick=()=>paused=!paused;document.getElementById('leftdig').onclick=()=>dig(-1);document.getElementById('rightdig').onclick=()=>dig(1);
load();draw();setInterval(()=>{update();draw()},100);
})(););placed++}}
gold=placed;
}
function restart(){level=0;score=0;lives=5;paused=false;load()}
function move(a,dx,dy){const nx=a.x+dx,ny=a.y+dy;if(!solid(tile(nx,ny))&&nx>=0&&nx<W&&ny>=0&&ny<H){a.x=nx;a.y=ny;return true}return false}
function gravity(a){const t=tile(a.x,a.y),b=tile(a.x,a.y+1);if(t!=='H'&&t!=='-'&&b!=='H'&&!solid(b))move(a,0,1)}
function dig(dir){const x=player.x+dir,y=player.y+1;if(tile(x,y)==='#'){set(x,y,'.');holes.set(x+','+y,65)}}
function update(){if(paused)return;tick++;let dx=0,dy=0;if(keys.has('ArrowLeft')||keys.has('a'))dx=-1;else if(keys.has('ArrowRight')||keys.has('d'))dx=1;else if(keys.has('ArrowUp')||keys.has('w'))dy=-1;else if(keys.has('ArrowDown')||keys.has('s'))dy=1;
if(dy<0&&(tile(player.x,player.y)==='H'||tile(player.x,player.y-1)==='H')){if(tile(player.x,player.y-1)==='#' && tile(player.x,player.y)==='H')set(player.x,player.y-1,'H');move(player,0,-1);}
else if(dy>0)move(player,0,1);
else if(dx)move(player,dx,0);
gravity(player);
if(tile(player.x,player.y)==='$'){set(player.x,player.y,'.');gold--;score+=100;if(gold===0){level++;load();return}}
if(tick%3===0)for(const e of enemies){const d=Math.sign(player.x-e.x);if(d&&Math.random()<.75)move(e,d,0);else if(player.y<e.y&&tile(e.x,e.y)==='H')move(e,0,-1);gravity(e)}
for(const e of enemies)if(e.x===player.x&&e.y===player.y){lives--;if(lives<=0){paused=true}else load();break}
for(const [k,v] of holes){if(v<=1){const [x,y]=k.split(',').map(Number);set(x,y,'#');holes.delete(k)}else holes.set(k,v-1)}
}
const palette={brick:'#b65850',concrete:'#b4b4b4',ladder:'#e6bd64',rope:'#d3a75d',gold:'#f5d85b',runner:'#80e5f4',enemy:'#ef6d93'};
function rect(x,y,w,h,color){g.fillStyle=color;g.fillRect(x,y,w,h)}
function drawTile(t,x,y){const px=OX+x*S,py=OY+y*S;if(t==='#'){rect(px,py,8,8,'#aa5548');rect(px,py,8,1,'#e89b78');rect(px,py+4,8,1,'#592e37');rect(px+4,py,1,4,'#592e37');rect(px+1,py+1,2,1,'#d77c68');rect(px+5,py+5,2,1,'#d77c68')}else if(t==='X'){rect(px,py,8,8,palette.concrete);rect(px+1,py+1,2,2,'#777')}else if(t==='H'){rect(px+1,py,1,8,palette.ladder);rect(px+6,py,1,8,palette.ladder);rect(px+1,py+2,6,1,palette.ladder);rect(px+1,py+5,6,1,palette.ladder)}else if(t==='-')rect(px,py+3,8,1,palette.rope);else if(t==='$'){rect(px+2,py+1,4,6,palette.gold);rect(px+1,py+3,6,2,palette.gold)}}
function figure(a,color){const x=OX+a.x*S,y=OY+a.y*S;rect(x+3,y,2,2,'#ffe4ae');rect(x+3,y+2,2,3,color);rect(x+1,y+3,2,1,color);rect(x+5,y+3,2,1,color);rect(x+2,y+5,1,2,color);rect(x+5,y+5,1,2,color);rect(x+1,y+7,2,1,color);rect(x+5,y+7,2,1,color)}
function draw(){rect(0,0,320,200,'#000');g.font='8px monospace';g.fillStyle='#fff';g.fillText('LODE RUNNER    SCORE '+String(score).padStart(5,'0'),48,13);g.fillText('LEVEL '+(level+1)+'   LIVES '+lives+'   GOLD '+gold,48,23);for(let y=0;y<H;y++)for(let x=0;x<W;x++)drawTile(tile(x,y),x,y);figure(player,palette.runner);for(const e of enemies)figure(e,palette.enemy);if(paused){rect(80,94,160,17,'#000');g.fillStyle='#fff';g.fillText(lives?'SZÜNET - P / INDÍTÁS':'VÉGE - R / INDÍTÁS',91,105)}}
document.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown',' '].includes(e.key))e.preventDefault();keys.add(e.key);if(e.repeat)return;if(e.key==='z'||e.key==='Z')dig(-1);if(e.key==='x'||e.key==='X')dig(1);if(e.key==='p'||e.key==='P')paused=!paused;if(e.key==='r'||e.key==='R')restart()});
document.addEventListener('keyup',e=>keys.delete(e.key));
document.getElementById('start').onclick=restart;document.getElementById('pause').onclick=()=>paused=!paused;document.getElementById('leftdig').onclick=()=>dig(-1);document.getElementById('rightdig').onclick=()=>dig(1);
load();draw();setInterval(()=>{update();draw()},100);
})();
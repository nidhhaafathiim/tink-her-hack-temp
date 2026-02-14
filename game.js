// Beginner-friendly Match-3 implementation
const COLS = 8, ROWS = 8;
const TILE_TYPES = 6; // number of colors
const EMOJI_MAP = {
    1: '🍎',
    2: '🍋',
    3: '🍇',
    4: '🥝',
    5: '🍊',
    6: '🍓'
};

const levels = [
    { target: 500, moves: 30 },
    { target: 900, moves: 28 },
    { target: 1400, moves: 25 }
];

let grid = []; // grid[r][c] = {type, r, c, special}
let score = 0;
let movesLeft = 0;
let currentLevel = 0;
let boardEl, scoreEl, movesEl, levelEl, goalScoreEl, goalMovesEl;
let pointerDownTile = null;
let busy = false; // lock when animating
let dragState = {dragging:false, startR:null, startC:null, startX:0, startY:0, draggedEl:null, targetEl:null, pointerId:null};

function $(id){return document.getElementById(id)}

function randType(){return Math.ceil(Math.random()*TILE_TYPES)}

function sleep(ms){return new Promise(r=>setTimeout(r,ms))}

function init(){
    boardEl = $('board'); scoreEl = $('score'); movesEl = $('moves'); levelEl = $('level'); goalScoreEl = $('goalScore'); goalMovesEl = $('goalMoves');
    document.getElementById('restartBtn').addEventListener('click', ()=>startLevel(currentLevel));
    document.getElementById('nextBtn').addEventListener('click', ()=>{ $('overlay').classList.add('hidden'); startLevel(currentLevel+1)});
    startLevel(0);
    setupPointerHandlers();
}

function startLevel(idx){
    currentLevel = Math.min(idx, levels.length-1);
    score = 0; movesLeft = levels[currentLevel].moves;
    grid = [];
    createGrid();
    renderGrid(true);
    updateUI();
    $('overlay').classList.add('hidden');
}

function createGrid(){
    // Fill grid with random types avoiding initial matches
    for(let r=0;r<ROWS;r++){
        grid[r]=[];
        for(let c=0;c<COLS;c++){
            let t;
            do{ t = randType() } while(wouldCreateMatchAt(r,c,t));
            grid[r][c] = {r,c,type:t,special:null};
        }
    }
}

function wouldCreateMatchAt(r,c,type){
    // check left two
    if(c>=2 && grid[r][c-1] && grid[r][c-2] && grid[r][c-1].type===type && grid[r][c-2].type===type) return true;
    // check up two
    if(r>=2 && grid[r-1] && grid[r-2] && grid[r-1][c] && grid[r-2][c] && grid[r-1][c].type===type && grid[r-2][c].type===type) return true;
    return false;
}

function renderGrid(firstRender=false){
    boardEl.innerHTML='';
    // compute tile pixel height for fall animation
    const style = getComputedStyle(boardEl);
    const gap = parseFloat(style.getPropertyValue('--tile-gap')) || 6;
    const padding = 12*2; // matches CSS padding
    const tilePx = Math.round((boardEl.clientWidth - padding - (COLS-1)*gap) / COLS);

    for(let r=0;r<ROWS;r++){
        for(let c=0;c<COLS;c++){
            const cell = grid[r][c];
            const div = document.createElement('div');
            div.className = 'tile tile--' + cell.type + (cell.special?(' '+cell.special):'');
            div.dataset.r = r; div.dataset.c = c; div.dataset.type = cell.type;
            // emoji content
            if(cell.special==='power-bomb') div.textContent='✹';
            else if(cell.special==='power-line') div.textContent='⇄';
            else div.textContent = EMOJI_MAP[cell.type] || '';

            // if a fallRows property exists, set initial translate to simulate dropping
            if(cell.fallRows && !firstRender){
                div.style.transform = `translateY(${ -cell.fallRows * tilePx }px)`;
                // trigger transition to 0
                requestAnimationFrame(()=>{ div.classList.add('moving'); div.style.transform = ''; });
                // clear for next time
                delete cell.fallRows;
            } else if(!firstRender){
                div.classList.add('moving');
                requestAnimationFrame(()=>div.classList.remove('moving'));
            }

            boardEl.appendChild(div);
        }
    }
}

function setupPointerHandlers(){
    boardEl.addEventListener('pointerdown', e=>{
        if(busy) return;
        const t = e.target.closest('.tile');
        if(!t) return;
        pointerDownTile = t;
        const r = +t.dataset.r, c = +t.dataset.c;
        dragState.dragging = true;
        dragState.startR = r; dragState.startC = c;
        dragState.startX = e.clientX; dragState.startY = e.clientY;
        dragState.draggedEl = t;
        dragState.pointerId = e.pointerId;
        t.setPointerCapture(e.pointerId);
        t.classList.add('dragging');
    });

    boardEl.addEventListener('pointermove', e=>{
        if(!dragState.dragging) return;
        if(e.pointerId !== dragState.pointerId) return;
        onPointerMove(e);
    });

    boardEl.addEventListener('pointerup', async e=>{
        if(!dragState.dragging) return;
        const fromR = dragState.startR, fromC = dragState.startC;
        const target = dragState.targetEl;
        // release capture
        try{ dragState.draggedEl.releasePointerCapture(dragState.pointerId) }catch(_){}
        dragState.draggedEl.classList.remove('dragging');
        // reset transform
        if(dragState.draggedEl) dragState.draggedEl.style.transform='';
        if(target){
            const toR = +target.dataset.r, toC = +target.dataset.c;
            // perform swap
            await trySwap({r:fromR,c:fromC},{r:toR,c:toC});
            target.classList.remove('drag-target');
        }
        // cleanup
        if(dragState.targetEl) dragState.targetEl.classList.remove('drag-target');
        dragState = {dragging:false, startR:null, startC:null, startX:0, startY:0, draggedEl:null, targetEl:null, pointerId:null};
        pointerDownTile = null;
    });

    // also allow keyboard arrows for demo (optional)
}

function getTilePx(){
    const style = getComputedStyle(boardEl);
    const gap = parseFloat(style.getPropertyValue('--tile-gap')) || 6;
    const padding = 12*2;
    return Math.round((boardEl.clientWidth - padding - (COLS-1)*gap) / COLS);
}

function onPointerMove(e){
    const dx = e.clientX - dragState.startX;
    const dy = e.clientY - dragState.startY;
    // move the dragged element
    if(dragState.draggedEl) dragState.draggedEl.style.transform = `translate(${dx}px, ${dy}px)`;

    const tilePx = getTilePx();
    // threshold for selecting neighbor
    const thresh = tilePx * 0.45;
    let dirR = 0, dirC = 0;
    if(Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > thresh) dirC = dx > 0 ? 1 : -1;
    else if(Math.abs(dy) > thresh) dirR = dy > 0 ? 1 : -1;

    const tr = dragState.startR + dirR, tc = dragState.startC + dirC;
    // clear previous highlight
    if(dragState.targetEl && (!tr || !tc || dragState.targetEl.dataset.r!=tr || dragState.targetEl.dataset.c!=tc)){
        dragState.targetEl.classList.remove('drag-target');
        dragState.targetEl = null;
    }
    if(dirR!==0 || dirC!==0){
        if(tr>=0 && tr<ROWS && tc>=0 && tc<COLS){
            const newEl = tileEl(tr,tc);
            if(newEl && newEl !== dragState.targetEl){
                if(dragState.targetEl) dragState.targetEl.classList.remove('drag-target');
                dragState.targetEl = newEl;
                newEl.classList.add('drag-target');
            }
        }
    }
}

async function trySwap(a,b){
    busy=true;
    const elA = tileEl(a.r,a.c); const elB = tileEl(b.r,b.c);
    animateSwap(elA,elB);
    await sleep(180);
    swapTiles(a,b);
    renderGrid();
    const matches = findAllMatches();
    if(matches.length===0){
        // swap back
        await sleep(80);
        animateSwap(tileEl(a.r,a.c),tileEl(b.r,b.c));
        await sleep(180);
        swapTiles(a,b);
        renderGrid();
        busy=false; return;
    }
    // valid swap -> process
    movesLeft -= 1;
    await resolveMatches();
    updateUI();
    busy=false;
    checkLevelEnd();
}

function tileEl(r,c){ return boardEl.querySelector('[data-r="'+r+'"][data-c="'+c+'"]') }

function animateSwap(el1,el2){
    if(!el1||!el2) return;
    const a = el1.getBoundingClientRect(), b = el2.getBoundingClientRect();
    const dx = b.left - a.left, dy = b.top - a.top;
    el1.style.transform = `translate(${dx}px,${dy}px)`; el2.style.transform = `translate(${-dx}px,${-dy}px)`;
    el1.classList.add('moving'); el2.classList.add('moving');
    setTimeout(()=>{ el1.style.transform=''; el2.style.transform=''; }, 200);
}

function swapTiles(a,b){
    const t = grid[a.r][a.c]; grid[a.r][a.c] = grid[b.r][b.c]; grid[b.r][b.c] = t;
    // update coordinates
    grid[a.r][a.c].r = a.r; grid[a.r][a.c].c = a.c;
    grid[b.r][b.c].r = b.r; grid[b.r][b.c].c = b.c;
}

function findAllMatches(){
    const matches = [];
    // horizontal
    for(let r=0;r<ROWS;r++){
        let run=[grid[r][0]];
        for(let c=1;c<COLS;c++){
            if(grid[r][c].type===run[run.length-1].type) run.push(grid[r][c]);
            else { if(run.length>=3) matches.push(run.slice()); run=[grid[r][c]] }
        }
        if(run.length>=3) matches.push(run.slice());
    }
    // vertical
    for(let c=0;c<COLS;c++){
        let run=[grid[0][c]];
        for(let r=1;r<ROWS;r++){
            if(grid[r][c].type===run[run.length-1].type) run.push(grid[r][c]);
            else { if(run.length>=3) matches.push(run.slice()); run=[grid[r][c]] }
        }
        if(run.length>=3) matches.push(run.slice());
    }
    return matches;
}

async function resolveMatches(){
    while(true){
        const matches = findAllMatches();
        if(matches.length===0) break;
        // mark and score
        const toClear = new Set();
        for(const run of matches){
            // create special on 4 or 5
            if(run.length===4){
                const t = run[0]; // place a line power-up at last pos
                grid[t.r][t.c].special = 'power-line';
            } else if(run.length>=5){
                const t = run[0]; grid[t.r][t.c].special = 'power-bomb';
            }
            for(const cell of run){ toClear.add(cell.r+','+cell.c); }
            score += run.length * 20; // simple scoring
        }
        // animate fade
        for(const key of toClear){ const [r,c]=key.split(',').map(Number); const el=tileEl(r,c); if(el) el.classList.add('fading') }
        await sleep(180);
        // clear cells
        for(const key of toClear){ const [r,c]=key.split(',').map(Number); grid[r][c] = null }
        // collapse and refill
        collapseGrid();
        await sleep(220);
        renderGrid();
        await sleep(220);
    }
}

function collapseGrid(){
    for(let c=0;c<COLS;c++){
        let write = ROWS-1;
        for(let r=ROWS-1;r>=0;r--){
            if(grid[r][c]){
                if(write!==r){
                    // move tile down and record how many rows it fell for animation
                    grid[write][c]=grid[r][c];
                    grid[write][c].r = write;
                    grid[write][c].c = c;
                    grid[write][c].fallRows = r - write;
                } else {
                    grid[write][c].r = r; grid[write][c].c = c;
                }
                write--;
            }
        }
        // fill new tiles at top; give them a fallRows value so they appear to drop in
        for(let r=write;r>=0;r--){
            grid[r][c] = {r,c,type:randType(),special:null};
            // distance to fall: start above board by (r+1) rows so visual drop looks natural
            grid[r][c].fallRows = r+1;
        }
    }
}

function updateUI(){ scoreEl.textContent = score; movesEl.textContent = movesLeft; levelEl.textContent = currentLevel+1; goalScoreEl.textContent=levels[currentLevel].target; goalMovesEl.textContent=levels[currentLevel].moves }

function checkLevelEnd(){
    if(score>=levels[currentLevel].target){
        $('overlayTitle').textContent='Level Complete';
        $('overlayMsg').textContent=`You scored ${score}!`;
        $('overlay').classList.remove('hidden');
    } else if(movesLeft<=0){
        $('overlayTitle').textContent='Level Failed';
        $('overlayMsg').textContent=`Score: ${score}. Try again.`;
        $('overlay').classList.remove('hidden');
    }
}

document.addEventListener('DOMContentLoaded', init);

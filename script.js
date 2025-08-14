const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Set canvas size properly
function resizeCanvas() {
    canvas.width = window.innerWidth - 40;
    canvas.height = window.innerHeight - 150;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// Drawing state
let painting = false;
let tool = "brush";
let brushSize = 5;
let eraserSize = 20;
let color = "#000000";
let history = [];
let redoHistory = [];
let lastX = 0;
let lastY = 0;

// Toolbar
document.getElementById("colorPicker").addEventListener("input", e => color = e.target.value);
document.getElementById("brushSize").addEventListener("input", e => brushSize = e.target.value);
document.getElementById("eraserSize").addEventListener("input", e => eraserSize = e.target.value);
document.getElementById("brushBtn").addEventListener("click", ()=> tool="brush");
document.getElementById("eraserBtn").addEventListener("click", ()=> tool="eraser");

document.getElementById("clearBtn").addEventListener("click", ()=>{
    saveState();
    ctx.clearRect(0,0,canvas.width,canvas.height);
});
document.getElementById("undoBtn").addEventListener("click", undo);
document.getElementById("redoBtn").addEventListener("click", redo);
document.getElementById("downloadBtn").addEventListener("click", ()=>{
    const link = document.createElement("a");
    link.download = "drawing.png";
    link.href = canvas.toDataURL();
    link.click();
});

// Undo/redo
function saveState(){
    history.push(ctx.getImageData(0,0,canvas.width,canvas.height));
    if(history.length>50) history.shift();
    redoHistory = [];
}
function undo(){
    if(history.length>0){
        redoHistory.push(ctx.getImageData(0,0,canvas.width,canvas.height));
        ctx.putImageData(history.pop(),0,0);
    }
}
function redo(){
    if(redoHistory.length>0){
        history.push(ctx.getImageData(0,0,canvas.width,canvas.height));
        ctx.putImageData(redoHistory.pop(),0,0);
    }
}

// Drawing events
canvas.addEventListener("mousedown", startPosition);
canvas.addEventListener("mouseup", endPosition);
canvas.addEventListener("mousemove", draw);
canvas.addEventListener("mouseout", endPosition);

// Touch support
canvas.addEventListener("touchstart", startPosition, {passive:false});
canvas.addEventListener("touchmove", draw, {passive:false});
canvas.addEventListener("touchend", endPosition);

function getXY(e){
    const rect = canvas.getBoundingClientRect();
    if(e.touches){
        return {x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top};
    } else {
        return {x: e.clientX - rect.left, y: e.clientY - rect.top};
    }
}

function startPosition(e){
    e.preventDefault();
    painting = true;
    saveState();
    const pos = getXY(e);
    lastX = pos.x;
    lastY = pos.y;
}

function endPosition(e){
    painting = false;
    ctx.beginPath();
}

function draw(e){
    if(!painting) return;
    e.preventDefault();
    const pos = getXY(e);
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = tool==="brush" ? color : "#ffffff";
    ctx.lineWidth = tool==="brush" ? brushSize : eraserSize;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
    lastX = pos.x;
    lastY = pos.y;
}

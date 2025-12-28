
function handleMouseMove(grid) {
    const listener = (action) => {
    
    const rect = grid.canvas.getBoundingClientRect();
    grid.mouse.xPos = (action.clientX - rect.left) * grid.canvas.dpr;
    grid.mouse.yPos = (action.clientY - rect.top) * grid.canvas.dpr;


    }
    grid.canvas.addEventListener("mousemove", listener);

}

export default handleMouseMove
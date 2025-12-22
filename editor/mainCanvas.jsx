//AI generated POC; this isn't the main implementation of the editor and is hardly my code


import React, { useRef, useEffect } from 'react';


const Canvas = () => {
    const canvasRef = useRef(null);
    useEffect(() => {
        const canvas = canvasRef.current;
        // Track mouse x and y position
        const mouse = { x: 0, y: 0 };
        const margins = { left: 80, bottom: 80, top: 20, right: 20 };
        const gridSize = 25;
        
        // Viewport state
        let zoom = 1;
        let pan = { x: 0, y: 0 };
        let isDragging = false;
        let lastMouse = { x: 0, y: 0 };
        let initialPinchDistance = null;
        let initialZoom = 1;

        const getGridDimensions = (width, height) => {
             const gridWidth = width - margins.left - margins.right;
             const gridHeight = height - margins.top - margins.bottom;
             return { gridWidth, gridHeight };
        }

        const worldToScreen = (worldX, worldY, gridWidth, gridHeight) => {
            const screenX = margins.left + pan.x + (worldX * gridWidth * zoom);
            const screenY = margins.top + pan.y + (worldY * gridHeight * zoom);
            return { x: screenX, y: screenY };
        }

        const screenToWorld = (screenX, screenY, gridWidth, gridHeight) => {
            const worldX = (screenX - margins.left - pan.x) / (gridWidth * zoom);
            const worldY = (screenY - margins.top - pan.y) / (gridHeight * zoom);
            return { x: worldX, y: worldY };
        }

        const handleMouseDown = (e) => {
            isDragging = true;
            lastMouse = { x: e.clientX, y: e.clientY };
        };

        const handleMouseUp = () => {
            isDragging = false;
        };

        const handleMouseMove = (e) => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;

            if (isDragging) {
                const dx = e.clientX - lastMouse.x;
                const dy = e.clientY - lastMouse.y;
                
                const newPanX = pan.x + dx;
                const newPanY = pan.y + dy;

                const displayWidth = canvas.clientWidth;
                const displayHeight = canvas.clientHeight;
                const { gridWidth, gridHeight } = getGridDimensions(displayWidth, displayHeight);

                const minPanX = -gridWidth * zoom + 50; 
                const maxPanX = displayWidth - margins.left - 50;
                const minPanY = -gridHeight * zoom + 50;
                const maxPanY = displayHeight - margins.top - 50;
                
                pan.x = Math.min(Math.max(newPanX, minPanX), maxPanX);
                pan.y = Math.min(Math.max(newPanY, minPanY), maxPanY);

                lastMouse = { x: e.clientX, y: e.clientY };
            }
        };
        
        const handleWheel = (e) => {
            e.preventDefault();
            
            // Check for ctrlKey to differentiate between pinch and scroll on some systems
            // However, browsers (especially Chrome/Safari) treat pinch-zoom as a wheel event with ctrlKey
            // BUT standard wheel zoom is also a common behavior.
            
            // If the user specifically requested "pinch not scroll", they likely mean:
            // - Trackpad pinch (which is often WheelEvent + e.ctrlKey on Chrome/Win, or WebKitGestureEvent on Safari)
            // - Touch pinch (Touch Events)

            // Let's implement standard wheel zoom logic, but refine it.
            // Typically, trackpad pinch fires wheel events with ctrlKey = true.
            
            const rect = canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            // We only zoom if it's a "pinch" (ctrlKey for trackpads in many browsers) OR just standard wheel if acceptable.
            // User query: "it should be a pinch not a scroll" implies they might be scrolling by accident?
            // If they are using a mouse wheel, it usually scrolls the page. Here we prevented default so it zooms.
            // If they want ONLY pinch-to-zoom (trackpad/touch) and NOT mouse wheel zoom:
            
            // For now, let's enable zoom on:
            // 1. Wheel with ctrlKey (Trackpad pinch on many systems)
            // 2. Or if we want to support mouse wheel zoom, we keep it as is.
            // Assuming "pinch not scroll" means they want the standard trackpad pinch behavior.
            
            // Note: On Mac trackpad, standard 2-finger scroll fires wheel events WITHOUT ctrlKey.
            // Pinch fires wheel WITH ctrlKey.
            
            if (e.ctrlKey) {
                // This is likely a pinch gesture on trackpad
                const zoomSensitivity = -0.01; 
                const delta = e.deltaY * zoomSensitivity;
                const newZoom = Math.min(Math.max(0.5, zoom + delta), 5); // Max zoom 0.5 (zoom out) to 5 (zoom in)

                const displayWidth = canvas.clientWidth;
                const displayHeight = canvas.clientHeight;
                const { gridWidth, gridHeight } = getGridDimensions(displayWidth, displayHeight);
                
                const worldX = (mouseX - margins.left - pan.x) / (gridWidth * zoom);
                const worldY = (mouseY - margins.top - pan.y) / (gridHeight * zoom);

                // Apply zoom
                zoom = newZoom;

                // Update pan to keep mouse stationary relative to world
                pan.x = mouseX - margins.left - (worldX * gridWidth * zoom);
                pan.y = mouseY - margins.top - (worldY * gridHeight * zoom);

                // Constrain Pan (Bounds Check)
                // Allow some overscroll? "cant just scroll like so far out of bounds"
                // Let's say we want to keep at least a portion of the grid on screen.
                
                const minPanX = -gridWidth * zoom + 50; // Allow 50px overlap
                const maxPanX = displayWidth - margins.left - 50;
                const minPanY = -gridHeight * zoom + 50;
                const maxPanY = displayHeight - margins.top - 50;

                pan.x = Math.min(Math.max(pan.x, minPanX), maxPanX);
                pan.y = Math.min(Math.max(pan.y, minPanY), maxPanY);

            } else {
                // Normal scroll (pan)
                // Apply delta
                const newPanX = pan.x - e.deltaX;
                const newPanY = pan.y - e.deltaY;
                
                // Constrain Pan
                const displayWidth = canvas.clientWidth;
                const displayHeight = canvas.clientHeight;
                const { gridWidth, gridHeight } = getGridDimensions(displayWidth, displayHeight);
                
                const minPanX = -gridWidth * zoom + 50; 
                const maxPanX = displayWidth - margins.left - 50;
                const minPanY = -gridHeight * zoom + 50;
                const maxPanY = displayHeight - margins.top - 50;
                
                pan.x = Math.min(Math.max(newPanX, minPanX), maxPanX);
                pan.y = Math.min(Math.max(newPanY, minPanY), maxPanY);
            }
        };

        const handleClick = (e) => {
            if (isDragging) return; // distinct drag vs click if needed, though simpler here
            // Note: simple click handling might fire after drag. 
            // In a real app check distance moved.
            
            const rect = canvas.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const clickY = e.clientY - rect.top;
            
            const displayWidth = canvas.clientWidth;
            const displayHeight = canvas.clientHeight;
            const { gridWidth, gridHeight } = getGridDimensions(displayWidth, displayHeight);

            // Use transformed coordinates check
            // Check if click is within grid visual area (clipping logic)
            if (clickX >= margins.left && clickX <= margins.left + gridWidth &&
                clickY >= margins.top && clickY <= margins.top + gridHeight) {
                
                const { x: worldX, y: worldY } = screenToWorld(clickX, clickY, gridWidth, gridHeight);
                
                // Check if inside the logical grid 0..1
                if (worldX >= 0 && worldX <= 1 && worldY >= 0 && worldY <= 1) {
                    const col = Math.floor(worldX * gridSize);
                    const row = Math.floor(worldY * gridSize);
                    
                    console.log(`Clicked cell: Row ${row}, Col ${col}`);
                    console.log(`Value: X ${(col/gridSize).toFixed(1)}, Y ${(row/gridSize).toFixed(1)}`);
                }
            }
        };

        const handleTouchStart = (e) => {
            if (e.touches.length === 2) {
                const touch1 = e.touches[0];
                const touch2 = e.touches[1];
                initialPinchDistance = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);
                initialZoom = zoom;
            } else if (e.touches.length === 1) {
                isDragging = true;
                lastMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            }
        };

        const handleTouchMove = (e) => {
            e.preventDefault(); // Prevent page scroll
            if (e.touches.length === 2 && initialPinchDistance) {
                const touch1 = e.touches[0];
                const touch2 = e.touches[1];
                const currentDistance = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);
                
                const scaleFactor = currentDistance / initialPinchDistance;
                zoom = Math.min(Math.max(0.5, initialZoom * scaleFactor), 5);
                
                // Optional: Center zoom on midpoint of touches (would require more complex pan math here)
            } else if (e.touches.length === 1 && isDragging) {
                const dx = e.touches[0].clientX - lastMouse.x;
                const dy = e.touches[0].clientY - lastMouse.y;
                
                // Update pan
                const newPanX = pan.x + dx;
                const newPanY = pan.y + dy;
                
                // Constrain Pan
                const displayWidth = canvas.clientWidth;
                const displayHeight = canvas.clientHeight;
                const { gridWidth, gridHeight } = getGridDimensions(displayWidth, displayHeight);

                const minPanX = -gridWidth * zoom + 50; 
                const maxPanX = displayWidth - margins.left - 50;
                const minPanY = -gridHeight * zoom + 50;
                const maxPanY = displayHeight - margins.top - 50;

                pan.x = Math.min(Math.max(newPanX, minPanX), maxPanX);
                pan.y = Math.min(Math.max(newPanY, minPanY), maxPanY);

                lastMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            }
        };

        const handleTouchEnd = (e) => {
            if (e.touches.length < 2) {
                initialPinchDistance = null;
            }
            if (e.touches.length === 0) {
                isDragging = false;
            }
        };

        canvas.addEventListener('click', handleClick);
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mousedown', handleMouseDown);
        canvas.addEventListener('mouseup', handleMouseUp);
        canvas.addEventListener('wheel', handleWheel, { passive: false });
        canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
        canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
        canvas.addEventListener('touchend', handleTouchEnd);

        // Clean up on unmount
        if (!canvas) return;
  
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const draw = () => {
            const dpr = window.devicePixelRatio || 1;
            const displayWidth = canvas.clientWidth || window.innerWidth;
            const displayHeight = canvas.clientHeight || window.innerHeight;
            
            if (canvas.width !== displayWidth * dpr || canvas.height !== displayHeight * dpr) {
              canvas.width = displayWidth * dpr;
              canvas.height = displayHeight * dpr;
            }
            ctx.setTransform(1, 0, 0, 1, 0, 0); // reset transform
            ctx.scale(dpr, dpr);
            
            // Clear canvas
            ctx.clearRect(0, 0, displayWidth, displayHeight);
            
            const { gridWidth, gridHeight } = getGridDimensions(displayWidth, displayHeight);

            // Start Clipping for Grid
            ctx.save();
            ctx.beginPath();
            ctx.rect(margins.left, margins.top, gridWidth, gridHeight);
            ctx.clip();

            // Draw Grid
            ctx.beginPath();
            ctx.strokeStyle = "rgba(128, 128, 128, 0.6)"; // Grey with decent opacity
            ctx.lineWidth = 1;

            // Vertical lines
            for (let i = 0; i <= gridSize; i++) {
                // Logical X is i / gridSize (0..1)
                const worldX = i / gridSize;
                const { x } = worldToScreen(worldX, 0, gridWidth, gridHeight);
                
                ctx.moveTo(x, margins.top + pan.y); // Logic: top of grid is 0 worldY
                // Wait, Y lines go from top to bottom of grid
                // Screen Y start: margin.top + pan.y + 0 * height * zoom
                // Screen Y end: margin.top + pan.y + 1 * height * zoom
                
                const startY = margins.top + pan.y;
                const endY = margins.top + pan.y + gridHeight * zoom;

                ctx.moveTo(x, startY);
                ctx.lineTo(x, endY);
            }

            // Horizontal lines
            for (let i = 0; i <= gridSize; i++) {
                const worldY = i / gridSize;
                const { y } = worldToScreen(0, worldY, gridWidth, gridHeight);
                
                const startX = margins.left + pan.x;
                const endX = margins.left + pan.x + gridWidth * zoom;

                ctx.moveTo(startX, y);
                ctx.lineTo(endX, y);
            }
            ctx.stroke();

            // Highlight hovered cell
            // Check if mouse inside clip area
            if (mouse.x >= margins.left && mouse.x <= margins.left + gridWidth &&
                mouse.y >= margins.top && mouse.y <= margins.top + gridHeight) {
                
                const { x: worldX, y: worldY } = screenToWorld(mouse.x, mouse.y, gridWidth, gridHeight);
                
                if (worldX >= 0 && worldX <= 1 && worldY >= 0 && worldY <= 1) {
                    const col = Math.floor(worldX * gridSize);
                    const row = Math.floor(worldY * gridSize);

                    ctx.fillStyle = "rgba(0, 0, 255, 0.1)";
                    // Draw rect at cell position
                    // Cell world start: col / gridSize
                    const cellWorldX = col / gridSize;
                    const cellWorldY = row / gridSize;
                    const { x: cellScreenX, y: cellScreenY } = worldToScreen(cellWorldX, cellWorldY, gridWidth, gridHeight);
                    
                    ctx.fillRect(
                        cellScreenX,
                        cellScreenY,
                        (gridWidth / gridSize) * zoom,
                        (gridHeight / gridSize) * zoom
                    );
                }
            }
            
            ctx.restore(); // End clipping

            // Draw Labels (Outside Clip)
            ctx.font = "12px Arial";
            ctx.fillStyle = "black";
            ctx.textAlign = "right";
            ctx.textBaseline = "middle";
            
            // Calculate where the grid edges are on screen
            const { x: startScreenX, y: startScreenY } = worldToScreen(0, 0, gridWidth, gridHeight);
            const { x: endScreenX, y: endScreenY } = worldToScreen(1, 1, gridWidth, gridHeight);

            // Determine label reference lines (the axis position)
            // If the grid is zoomed out (smaller than view), we might want labels attached to the grid edge?
            // "close next to the grid" implies they should follow the grid lines, not stick to the screen edge.
            
            // Current implementation:
            // Vertical labels (X axis values) are at fixed Y (margins.top + gridHeight + 10) -> Screen bottom edge of viewport
            // Horizontal labels (Y axis values) are at fixed X (margins.left - 10) -> Screen left edge of viewport
            
            // New Request: "axis still have their respective markings next to the lines, not at the bottom and left of the screen, but close next to the grid"
            // This means the labels should move with the grid.
            
            // Vertical lines labels (Bottom of the grid)
            // The bottom of the grid in screen coordinates is: endScreenY
            // We should clamp this? If the grid bottom is off-screen, do we want them at the screen edge?
            // "even if you zoom out... close next to the grid" implies they stick to the grid.
            
            const labelGap = 10;

            for (let i = 0; i <= gridSize; i++) {
                const worldX = i / gridSize;
                const { x } = worldToScreen(worldX, 0, gridWidth, gridHeight);
                
                // Only draw if within visible horizontal range (roughly) + some buffer?
                // Actually, if we are zooming out, we want to see them even if small?
                // Let's keep the visibility check for performance but maybe relax it if needed.
                // Or just check if x is on screen.
                
                if (x >= 0 && x <= displayWidth) {
                     const label = (i / gridSize).toFixed(1);
                     ctx.save();
                     
                     // Position: x is correct (follows the line).
                     // Y position: Should be at the bottom of the grid.
                     // Grid bottom Y = startScreenY + (gridHeight * zoom)
                     
                     const gridBottomY = startScreenY + (gridHeight * zoom);
                     
                     ctx.translate(x, gridBottomY + labelGap);
                     ctx.rotate(Math.PI / 2);
                     ctx.textAlign = "left";
                     ctx.fillText(label, 0, 4);
                     ctx.restore();
                }
            }

            // Horizontal lines labels (Left of the grid)
            for (let i = 0; i <= gridSize; i++) {
                const worldY = i / gridSize;
                const { y } = worldToScreen(0, worldY, gridWidth, gridHeight);

                if (y >= 0 && y <= displayHeight) {
                    const label = (i / gridSize).toFixed(1);
                    ctx.save();
                    
                    // Position: y is correct.
                    // X position: Should be left of the grid.
                    // Grid left X = startScreenX
                    
                    const gridLeftX = startScreenX;

                    ctx.textAlign = "right";
                    ctx.fillText(label, gridLeftX - labelGap, y);
                    ctx.restore();
                }
            }
        };


        // Fix: define animation as a function, avoid polluting outer scope
        function animation() {
            draw();
            requestAnimationFrame(animation);
        }
        animation();


        // Handle window resize
        window.addEventListener('resize', draw);
        return () => {
            window.removeEventListener('resize', draw);
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('click', handleClick);
            canvas.removeEventListener('mousedown', handleMouseDown);
            canvas.removeEventListener('mouseup', handleMouseUp);
            canvas.removeEventListener('wheel', handleWheel);
            canvas.removeEventListener('touchstart', handleTouchStart);
            canvas.removeEventListener('touchmove', handleTouchMove);
            canvas.removeEventListener('touchend', handleTouchEnd);
        }
    }, [])

    return <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width: `100vw`, height: `100vh`, backgroundColor: 'white'}} />;

}


export default Canvas
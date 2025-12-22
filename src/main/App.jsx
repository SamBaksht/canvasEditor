import { useState, useEffect, useRef } from 'react'
import drawPNG from "../assets/draw.png"
import eraserPNG from "../assets/eraser.png"

const imageMap = {
    "draw": drawPNG,
    "erase": eraserPNG
}

class Grid {
    /**
     * Create a box that is 90% of the height and 90% of the width;
    */
    constructor() {

    }

    draw(canvas, ctx) {
        const height = canvas.height;
        const width = canvas.width;
        const marginXStart = width * 0.05;
        const marginXEnd = width * 0.95;
        const marginXRange = marginXEnd - marginXStart;
        const marginYStart = height * 0.05;
        const marginYEnd = height * 0.95;
        const marginYRange = marginYEnd - marginYStart;
        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.strokeStyle = "white";
        
        // Horizontal Lines
        for(let i = 0; i <= 10; i++) {
            ctx.moveTo(marginXStart, marginYStart + (marginYRange / 10) * i);
            ctx.lineTo(marginXEnd, marginYStart + (marginYRange / 10) * i)
        }
        //Vert lines
        for(let i = 0; i <= 10; i++) {
            ctx.moveTo(marginXStart + (marginXRange / 10) * i, marginYStart);
            ctx.lineTo(marginXStart + (marginXRange / 10) * i, marginYEnd)

        }
        ctx.stroke()

        
    }
}

const Canvas = () => {
    const canvasRef = useRef(null);
    const mainDiv = useRef(null);
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        const grid = new Grid();
        function draw() {
            const width = canvas.width;
            const height = canvas.height;
            const ctx = canvas.getContext("2d");
            ctx.clearRect(0, 0, width, height);
            
            
            grid.draw(canvas, ctx)
            
            
            
        }

        function startAnimationLoop() {
            draw();
            requestAnimationFrame(startAnimationLoop);
        }
        requestAnimationFrame(startAnimationLoop);

    }, [])
    return <>
        
        <canvas ref={canvasRef} style={{ position: 'relative', width: `90vw`, height: `90vh`, backgroundColor: 'black'}} />

    </>

}

function SideBar() {
    return <>
        <div className='flex flex-col justify-start w-[10vw] h-[90vh] bg-blue-700'>
            <Buttons />
        </div>
        
    </>
}

function Buttons() {
   const options = ["Draw", "Erase"];
   return <>
            {
                options.map((option, index) => (
                    <div key={index} className="w-full border-gray-500/40 border-2 flex-col flex items-center justify-center h-[15vh] bg-gray-100/90"> 
                        <img src={imageMap[option.toLowerCase()]} alt="Draw" className="h-12 w-12" />
                        {option}
                     </div>
                )

                )
            }
    
    </>
}

function App() {

  return (
    <>
    <div className="flex flex-col justify-center items-center w-screen h-screen bg-blue-600">
        <div className="flex flex-row w-screen h-[90vh] bg-blue-900">
            <SideBar />
            <Canvas />
        </div>
        
        <div className="bg-blue-200 h-[30vh] w-screen">

        </div>
    </div>
    </>
  )
}

export default App

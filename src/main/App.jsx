import { useState, useEffect, useRef } from 'react'
import drawPNG from "../assets/draw.png"
import eraserPNG from "../assets/eraser.png"
import createListeners from './init'

const imageMap = {
    "draw": drawPNG,
    "erase": eraserPNG,
    "text": null,
    "select": null
}

class Grid {
    /**
     * Create a box that is 90% of the height and 90% of the width;
    */
    constructor(canvas) {
        this.canvas = canvas;
        this.mouse = {xPos: 0, yPos: 0}
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
        ctx.strokeStyle = "black";
        ctx.font = "24px Arial";
        ctx.fillStyle = "black";
        ctx.textAlign = "right";
        ctx.textBaseline = "middle";
        // Horizontal Lines
        for(let i = 0; i <= 10; i++) {
            ctx.moveTo(marginXStart, marginYStart + (marginYRange / 10) * i);
            ctx.lineTo(marginXEnd, marginYStart + (marginYRange / 10) * i)
            ctx.fillText(`${i / 10}`, marginXStart - width * 0.02, marginYStart + (marginYRange / 10) * i)
        }
        //Vert lines
        for(let i = 0; i <= 10; i++) {
            ctx.moveTo(marginXStart + (marginXRange / 10) * i, marginYStart);
            ctx.lineTo(marginXStart + (marginXRange / 10) * i, marginYEnd)
            ctx.fillText(`${i / 10}`, marginXStart + (marginXRange / 10) * i, marginYEnd + height * 0.02)
        }
        ctx.stroke()
        ctx.closePath();

        ctx.beginPath();
        ctx.fillStyle = "black";
        if(this.mouse.xPos != 0) {
            ctx.arc(this.mouse.xPos, this.mouse.yPos, 15, 0, Math.PI * 2)
            ctx.fill()
        }
        
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
        const grid = new Grid(canvas);
        const dpr = window.devicePixelRatio || 1;
        canvas.dpr = dpr;
        const displayWidth = canvas.clientWidth || window.innerWidth;
        const displayHeight = canvas.clientHeight || window.innerHeight;
        if (canvas.width !== displayWidth * dpr || canvas.height !== displayHeight * dpr) {
            canvas.width = displayWidth * dpr;
            canvas.height = displayHeight * dpr;
        }
        const ctx = canvas.getContext("2d");
        ctx.setTransform(1, 0, 0, 1, 0, 0); // reset transform
        
        
        function draw() {
            const width = canvas.width;
            const height = canvas.height;
            ctx.clearRect(0, 0, width, height);
            
            
            grid.draw(canvas, ctx)

            
            
        }

        createListeners(grid);

        function startAnimationLoop() {
            draw();
            requestAnimationFrame(startAnimationLoop);
        }
        requestAnimationFrame(startAnimationLoop);

    }, [])
    return <>
        
        <canvas ref={canvasRef} style={{ position: 'relative', width: `95vw`, height: `90vh`, backgroundColor: 'white'}} />

    </>

}

function SideBar() {
    return <>
        <div className='flex flex-col justify-between w-[5vw] h-full bg-gray-100'>
            <Buttons />
        </div>
        
    </>
}

function Buttons() {
   const options = ["Draw", "Erase", "Text", "Select"];
   return <> 
            {
                options.map((option, index) => (
                    <button id={option} key={index} className="h-full w-full">
                    <div className="w-full border-gray-500/40 border-2 flex-col flex items-center justify-center h-full bg-slate-100/90 hover:bg-slate-200/90"> 
                        <img src={imageMap[option.toLowerCase()]} alt={imageMap[option]} className="h-12 w-12" />
                        {option}
                     </div>
                    </button>
                )

                )
            }
    
    </>
}

class Output {
    static base = "const canvas = ";
    
    constructor() {
    }

    static layout() {
        return <>
            <div className="flex flex-1 items-center justify-center">
                <div id="outputBox" className="ml-20 w-[80%] h-[30vh] overflow-scroll bg-blue-950 rounded-xl">
                    <div className="flex flex-col w-full h-[30vh] overflow-scroll text-sm rounded-xl p-1 ring-inset ring-2 ring-white/25">
                        <div className="px-1.5 pt-0.5 text-gray-300 w-full h-fit rounded-xl">
                            main.js
                        </div>
                        <div className="w-full h-full mx-auto bg-slate-50/20 rounded-lg ring-inset ring-2 ring-white/10 mt-1">
                            <code className="text-sm" id="codeEditor">

                            </code>
                        </div>
                    </div>
                </div>
            </div>
        
        </>
    }

    static update() {
        document.getElementById('codeEditor')
        const wordArray = Output.base.split(" ");
        for(let word of wordArray) {
            
        }
    }
}

function App() {

  return (
    <>
    <div className="flex flex-col justify-center items-center w-screen bg-slate-600 overflow-scroll">
        <div className="flex flex-row w-screen h-[90vh] bg-blue-900">
            <SideBar />
            <Canvas />
        </div>
        
        <div className="bg-slate-200 h-fit w-screen flex flex-row p-8">
            <div className="w-[35vw] h-full">
            </div> 
            {Output.layout()}
        </div>
    </div>
    </>
  )
}

export default App

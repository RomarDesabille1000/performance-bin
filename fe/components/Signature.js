import { useEffect, useRef, useState } from "react"
import { useRouter } from 'next/router'
import Link from "next/link";
import { useSignatureStore } from "../store/signature";

export default function Signature({setIsAddingSignature}) {
    const router = useRouter();
    const canvasRef = useRef(0);
    const posRef = useRef({
        x: 0, 
        y: 0,
    })
    const isPainting = useRef(false);
    const ctxRef = useRef(0);
    const [canvasHeight, setCanvasHeight] = useState(0);

    const cnvSize = useRef({
        h: 0,
        w: 0,
    })

    const signatureStore = useSignatureStore();

    useEffect(() => {
        if(window !== undefined)
            drawOnCanvas();
    }, [])

    function drawOnCanvas(){
        cnvSize.current.h = window.innerHeight * 0.5 > 200 ? 200 : window.innerHeight * 0.5;
        cnvSize.current.w = window.innerWidth * 0.9 > 600 ? 600 : window.innerWidth * 0.9;

        canvasRef.current.width = cnvSize.current.w;
        canvasRef.current.height = cnvSize.current.h;

        const ctx = canvasRef.current.getContext("2d");
        setCanvasHeight(cnvSize.current.h);
        ctx.lineWidth = 3;
        ctx.lineCap = "round"
        ctxRef.current = ctx
    }

    const onMouseDown = (e) => {
        isPainting.current = true;
        if(e.type == 'touchmove'){
            posRef.current.x = e.touches[0].clientX;
            posRef.current.y = e.touches[0].clientY;
        }else{
            posRef.current.x = e.clientX;
            posRef.current.y = e.clientY;
        }
    }

    const onMouseMove = (e) => {
        if (!isPainting.current) return;
        drawLine(posRef.current.x, posRef.current.y, e);
        if(e.type == 'touchmove'){
            posRef.current.x = e.touches[0].clientX;
            posRef.current.y = e.touches[0].clientY;
        }else{
            posRef.current.x = e.clientX;
            posRef.current.y = e.clientY;
        }    
    }
    const onMouseUp = (e) => {
        if (!isPainting.current) return;
        isPainting.current = false;
        drawLine(posRef.current.x, posRef.current.y, e);
    }

    const drawLine = (x0, y0, e) => {
        const rect = canvasRef.current.getBoundingClientRect();

        ctxRef.current.beginPath();
        if(e.type == 'touchmove'){
            ctxRef.current.moveTo(x0 - rect.left, y0 - rect.top);
            ctxRef.current.lineTo(e.touches[0].clientX - rect.left, e.touches[0].clientY - rect.top);
        }else{
            ctxRef.current.moveTo(x0 - rect.left, y0 - rect.top);
            ctxRef.current.lineTo(e.clientX - rect.left, e.clientY - rect.top);
        }
        ctxRef.current.stroke();
        ctxRef.current.closePath();
        ctxRef.current.save();
    }

    const clearCanvas = () => {
        ctxRef.current.clearRect(0, 0, cnvSize.current.w, cnvSize.current.h);
    }

    const done = () => {
        const base64ImageData = canvasRef.current.toDataURL("image/png");
        signatureStore.setImage(base64ImageData, cnvSize.current.w, cnvSize.current.h);
        setIsAddingSignature(false)
    }

    return (
        <div className="">
            <canvas 
                ref={canvasRef}
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                onTouchStart={onMouseDown}
                onTouchMove={onMouseMove}
                onTouchEnd={onMouseUp}
                className="canvas mt-2" 
            ></canvas>
            <div
                style={{ marginTop: canvasHeight+'px' }}
                className="pt-5 w-[90%] max-w-[600px] m-auto"
            >
                <div className="font-mono">Draw Your Signature</div>
                <div className="flex justify-end gap-3 pt-2">
                    <button className="btn btn-secondary" 
                        onClick={() => setIsAddingSignature(false)}
                    > 
                        Back
                    </button>
                    <button 
                        className="btn btn-secondary"
                        onClick={clearCanvas}>
                        Clear</button>
                    <button 
                        className="btn btn-primary"
                        onClick={done}>
                            Done
                    </button>
                </div>
            </div>
        </div>
    )
}
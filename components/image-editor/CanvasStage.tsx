
"use client"

import React, { useRef, useEffect, useState } from 'react'
import { Stage, Layer, Image as KonvaImage, Transformer } from 'react-konva'
import useImage from 'use-image'
import Konva from 'konva'

interface CanvasStageProps {
    originalImageUrl: string | null
    resultImageUrl: string | null
}

const URLImage = ({ src, isDraggable, onSelect, isSelected, opacity = 1 }: {
    src: string,
    isDraggable?: boolean,
    onSelect?: () => void,
    isSelected?: boolean,
    opacity?: number
}) => {
    const [image] = useImage(src)
    const shapeRef = useRef<Konva.Image>(null)
    const trRef = useRef<Konva.Transformer>(null)

    useEffect(() => {
        if (isSelected && trRef.current && shapeRef.current) {
            trRef.current.nodes([shapeRef.current])
            trRef.current.getLayer()?.batchDraw()
        }
    }, [isSelected])

    return (
        <React.Fragment>
            <KonvaImage
                image={image}
                ref={shapeRef}
                draggable={isDraggable}
                onClick={onSelect}
                onTap={onSelect}
                opacity={opacity}
            />
            {isSelected && (
                <Transformer
                    ref={trRef}
                    flipEnabled={false}
                    boundBoxFunc={(oldBox, newBox) => {
                        // limit resize
                        if (newBox.width < 5 || newBox.height < 5) {
                            return oldBox
                        }
                        return newBox
                    }}
                />
            )}
        </React.Fragment>
    )
}

export function CanvasStage({ originalImageUrl, resultImageUrl }: CanvasStageProps) {
    const stageRef = useRef<Konva.Stage>(null)
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [stageSize, setStageSize] = useState({ width: 800, height: 600 })

    // Resize observer to fit parent
    useEffect(() => {
        const checkSize = () => {
            const container = document.getElementById('canvas-container')
            if (container) {
                setStageSize({
                    width: container.offsetWidth,
                    height: container.offsetHeight
                })
            }
        }

        checkSize()
        window.addEventListener('resize', checkSize)
        return () => window.removeEventListener('resize', checkSize)
    }, [])

    const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
        e.evt.preventDefault();
        const stage = stageRef.current;
        if (!stage) return;

        const scaleBy = 1.1;
        const oldScale = stage.scaleX();
        const pointer = stage.getPointerPosition();

        if (!pointer) return;

        const mousePointTo = {
            x: (pointer.x - stage.x()) / oldScale,
            y: (pointer.y - stage.y()) / oldScale,
        };

        const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;

        stage.scale({ x: newScale, y: newScale });

        const newPos = {
            x: pointer.x - mousePointTo.x * newScale,
            y: pointer.y - mousePointTo.y * newScale,
        };

        stage.position(newPos);
    };

    return (
        <div id="canvas-container" className="flex-1 bg-zinc-900 overflow-hidden relative" style={{ touchAction: 'none' }}>
            <Stage
                width={stageSize.width}
                height={stageSize.height}
                onWheel={handleWheel}
                draggable
                ref={stageRef}
                className="cursor-move"
                onMouseDown={(e) => {
                    // deselect on empty area click
                    const clickedOnEmpty = e.target === e.target.getStage();
                    if (clickedOnEmpty) {
                        setSelectedId(null);
                    }
                }}
            >
                {/* Base Layer: Original Image */}
                <Layer>
                    {originalImageUrl && (
                        <URLImage
                            src={originalImageUrl}
                            // If result exists, dim the original or keep it as reference?
                            // Let's keep it full visibility, user can overlay
                            // Actually, usually "Remove background" implies we want to see the result isolated or on top.
                            // Let's set opacity lower if we have a result, so we can clearly see the result.
                            opacity={resultImageUrl ? 0.3 : 1}
                        />
                    )}
                </Layer>

                {/* Result Layer */}
                <Layer>
                    {resultImageUrl && (
                        <URLImage
                            src={resultImageUrl}
                            isDraggable
                            isSelected={selectedId === 'result'}
                            onSelect={() => setSelectedId('result')}
                        />
                    )}
                </Layer>

                {/* Overlay Layer - handled by Transformer inside URLImage for now, 
                    but could add guides here if needed */}
            </Stage>

            {!originalImageUrl && (
                <div className="absolute inset-0 flex items-center justify-center text-zinc-500 pointer-events-none">
                    <div className="text-center">
                        <p>Drag & Drop an image here</p>
                        <p className="text-sm opacity-50">or use the toolbar to open</p>
                    </div>
                </div>
            )}
        </div>
    )
}

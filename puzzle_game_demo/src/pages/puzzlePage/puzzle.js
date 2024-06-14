import React, { useState, useEffect, useRef } from 'react';
import image from '../../assets/image1.png';
import './puzzle.css';

function PuzzlePage() {
    const col = 3;
    const row = 2;
    const canvasRef = useRef(null);
    const [pieces, setPieces] = useState([]);
    const [draggedPiece, setDraggedPiece] = useState(null);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [isCompleted, setIsCompleted] = useState(false); // Track puzzle completion
    const imageRef = useRef(null); // Reference for the loaded image

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.src = image;
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height * 2;
            drawGrid(ctx, img.width, img.height * 2, row * 2, col);
            imageRef.current = img; // Store the loaded image
            initializePieces(img, img.width / col, img.height / row, img.height);
        };
    }, []);

    const initializePieces = (img, pieceWidth, pieceHeight, offsetY) => {
        const tempPieces = [];

        // Create pieces in their original positions
        for (let i = 0; i < row; i++) {
            for (let j = 0; j < col; j++) {
                tempPieces.push({
                    id: `${i}-${j}`,
                    x: j * pieceWidth,
                    y: offsetY + i * pieceHeight, // pieces are drawn below the full image
                    width: pieceWidth,
                    height: pieceHeight,
                    correctX: j * pieceWidth,
                    correctY: i * pieceHeight
                });
            }
        }

        // Shuffle the positions of the pieces but keep them within the bottom 3x2 grid
        const shuffledPieces = tempPieces.sort(() => Math.random() - 0.5);
        shuffledPieces.forEach((piece, index) => {
            piece.x = (index % col) * pieceWidth;
            piece.y = offsetY + Math.floor(index / col) * pieceHeight;
        });

        setPieces(shuffledPieces);
        drawPieces(shuffledPieces, img, pieceWidth, pieceHeight);
    };

    const drawGrid = (ctx, width, height, rows, cols) => {
        const cellWidth = width / cols;
        const cellHeight = height / rows;

        ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.lineWidth = 2;

        // Draw vertical lines
        for (let i = 1; i < cols; i++) {
            ctx.beginPath();
            ctx.moveTo(i * cellWidth, 0);
            ctx.lineTo(i * cellWidth, height);
            ctx.stroke();
        }

        // Draw horizontal lines
        for (let j = 1; j < rows; j++) {
            ctx.beginPath();
            ctx.moveTo(0, j * cellHeight);
            ctx.lineTo(width, j * cellHeight);
            ctx.stroke();
        }
    };

    const drawPieces = (pieces, img, pieceWidth, pieceHeight) => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        // Clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw each piece
        pieces.forEach(piece => {
            ctx.drawImage(
                img,
                piece.correctX, piece.correctY, // source x and y
                pieceWidth, pieceHeight, // source width and height
                piece.x, piece.y, // destination x and y
                pieceWidth, pieceHeight // destination width and height
            );
        });

        // Draw the grid on top of everything
        drawGrid(ctx, canvas.width, canvas.height, row * 2, col);
    };

    const handleMouseDown = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        for (let piece of pieces) {
            if (mouseX >= piece.x && mouseX <= piece.x + piece.width &&
                mouseY >= piece.y && mouseY <= piece.y + piece.height) {
                setDraggedPiece(piece);
                setOffset({ x: mouseX - piece.x, y: mouseY - piece.y });
                break;
            }
        }
    };

    const handleMouseMove = (e) => {
        if (!draggedPiece) return;

        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const updatedPieces = pieces.map(piece => 
            piece.id === draggedPiece.id 
            ? { ...piece, x: mouseX - offset.x, y: mouseY - offset.y }
            : piece
        );

        setPieces(updatedPieces);
        drawPieces(updatedPieces, imageRef.current, draggedPiece.width, draggedPiece.height);
    };

    const handleMouseUp = () => {
        if (!draggedPiece) return;

        const pieceWidth = draggedPiece.width;
        const pieceHeight = draggedPiece.height;

        const updatedPieces = pieces.map(piece => {
            if (piece.id === draggedPiece.id) {
                // Snap to grid
                const snapX = Math.round(piece.x / pieceWidth) * pieceWidth;
                const snapY = Math.round(piece.y / pieceHeight) * pieceHeight;

                // Ensure it doesn't snap to the bottom half
                const snappedPiece = {
                    ...piece,
                    x: snapX,
                    y: snapY >= imageRef.current.height ? piece.y : snapY // Prevent snapping to the bottom
                };

                // Check if piece is in correct position
                if (snapX === piece.correctX && snapY === piece.correctY) {
                    return snappedPiece;
                } else {
                    return { ...snappedPiece, x: piece.x, y: piece.y };
                }
            } else {
                return piece;
            }
        });

        setPieces(updatedPieces);
        drawPieces(updatedPieces, imageRef.current, draggedPiece.width, draggedPiece.height);
        setDraggedPiece(null);

        // Check if the puzzle is completed
        if (checkCompletion(updatedPieces)) {
            setIsCompleted(true);
        }
    };

    const checkCompletion = (pieces) => {
        return pieces.every(piece => piece.x === piece.correctX && piece.y === piece.correctY);
    };

    return (
        <div className="puzzle-page">
            <h1>Puzzle Page</h1>
            <canvas
                id="puzzleCanvas"
                ref={canvasRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            ></canvas>
            {isCompleted && (
                <div className="congratulations">
                    <h2>Congratulations! You completed the puzzle!</h2>
                    <a href={image} download="original-image.png">Download Original Image</a>
                </div>
            )}
        </div>
    );
}

export default PuzzlePage;

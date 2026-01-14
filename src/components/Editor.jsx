import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { FaTimes, FaSave, FaLock, FaUnlock, FaEraser, FaTrash, FaPen, FaCircle, FaBroom } from 'react-icons/fa';
import { useStore } from '../context/Store';

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(5px);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const EditorContainer = styled(motion.div)`
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  width: 100%;
  max-width: 800px;
  height: 80vh;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
`;

const Toolbar = styled.div`
  padding: 12px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(15, 23, 42, 0.5);
  flex-wrap: wrap;
  gap: 12px;
  
  @media (max-width: 600px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const TitleInput = styled.input`
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.colors.text};
  font-size: 1.2rem;
  font-weight: 600;
  flex: 1;
  min-width: 150px;
  outline: none;

  &::placeholder {
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

const ActionGroup = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  margin-left: auto;
  
  @media (max-width: 600px) {
    margin-left: 0;
    justify-content: flex-end;
  }
`;

const Button = styled.button`
  background: ${({ theme, variant, active }) =>
        active ? theme.colors.primary :
            variant === 'primary' ? theme.colors.primary : 'rgba(255, 255, 255, 0.1)'};
  color: ${({ theme, variant, active }) =>
        active ? 'white' :
            variant === 'primary' ? 'white' : theme.colors.text};
  border: none;
  padding: 8px 12px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9rem;
  transition: all 0.2s;

  &:hover {
    background: ${({ theme, variant }) => variant === 'primary' ? theme.colors.primaryHover : theme.colors.primary};
    color: white;
  }
`;

const ToolsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px 16px;
  background: rgba(0,0,0,0.2);
  border-radius: 8px;
  overflow-x: auto;
  max-width: 100%;
  
  /* Hide scrollbar for cleaner UI */
  &::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;
`;

const ColorSwatch = styled.div`
  display: flex;
  gap: 8px;
`;

const ColorBtn = styled.button`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid ${({ active, theme }) => active ? theme.colors.text : 'transparent'};
  background: ${({ color }) => color};
  cursor: pointer;
  transition: transform 0.1s;
  
  &:hover {
    transform: scale(1.1);
  }
`;

const ContentArea = styled.div`
  flex: 1;
  position: relative;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.background};
`;

const TextArea = styled.textarea`
  width: 100%;
  height: 100%;
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.colors.text};
  padding: 20px;
  font-size: 1rem;
  line-height: 1.6;
  resize: none;
  outline: none;
  font-family: inherit;
`;

const Canvas = styled.canvas`
  touch-action: none;
  cursor: none;
  width: 100%;
  height: 100%;
`;

const BrushCursor = styled.div`
  position: fixed;
  pointer-events: none;
  border: 1px solid ${({ theme }) => theme.colors.text}; // Contrast with background
  border-radius: 50%;
  transform: translate(-50%, -50%);
  z-index: 9999;
  background: rgba(255, 255, 255, 0.2); // Slight fill to see it better
  box-shadow: 0 0 2px rgba(0,0,0,0.5);
  display: none; // Hidden by default
`;

const COLORS = [
    '#f8fafc', // White/Light
    '#1e293b', // Dark
    '#ef4444', // Red
    '#22c55e', // Green
    '#38bdf8', // Blue
    '#eab308', // Yellow
    '#a855f7', // Purple
];

export default function Editor({ note, onClose }) {
    const { actions, dispatch } = useStore();
    const [title, setTitle] = useState(note.title);
    const [content, setContent] = useState(note.content);
    const [isLocked, setIsLocked] = useState(note.isLocked);

    // Ink State
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [tool, setTool] = useState('pen'); // 'pen' | 'eraser'
    const [brushSize, setBrushSize] = useState(2);
    const [color, setColor] = useState('#fff');

    // Deep copy setup
    const strokes = useRef(Array.isArray(note.content) ? JSON.parse(JSON.stringify(note.content)) : []);
    const currentStroke = useRef(null);

    // Initial config based on theme (default white on dark, or matching passed prop?)
    // Actually we just default to '#fff' in state, but UI lets user change. 
    // Ideally we should sync default ink color with theme if it's a new note? 
    // Let's keep it simple for now.

    const renderStrokes = (ctx, data) => {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        data.forEach(strokeData => {
            // Handle legacy format (array of points) vs new format (object)
            let points, sColor, sWidth, sIsEraser;

            if (Array.isArray(strokeData)) {
                points = strokeData;
                sColor = '#fff'; // Legacy default
                sWidth = 2;
                sIsEraser = false;
            } else {
                points = strokeData.points;
                sColor = strokeData.color;
                sWidth = strokeData.width;
                sIsEraser = strokeData.isEraser;
            }

            if (!points || points.length === 0) return;

            ctx.beginPath();
            ctx.lineWidth = sWidth;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            if (sIsEraser) {
                ctx.globalCompositeOperation = 'destination-out';
            } else {
                ctx.globalCompositeOperation = 'source-over';
                ctx.strokeStyle = sColor;
            }

            ctx.moveTo(points[0].x, points[0].y);
            for (let i = 1; i < points.length; i++) {
                ctx.lineTo(points[i].x, points[i].y);
            }
            ctx.stroke();
        });

        // Reset composite op
        ctx.globalCompositeOperation = 'source-over';
    };

    useEffect(() => {
        if (note.type === 'ink' && canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            renderStrokes(ctx, strokes.current);
        }
    }, [note]);

    useEffect(() => {
        if (note.type === 'ink' && canvasRef.current) {
            const resize = () => {
                const parent = canvasRef.current.parentElement;
                canvasRef.current.width = parent.clientWidth;
                canvasRef.current.height = parent.clientHeight;
                const ctx = canvasRef.current.getContext('2d');
                renderStrokes(ctx, strokes.current);
            };
            resize();
            window.addEventListener('resize', resize);
            return () => window.removeEventListener('resize', resize);
        }
    }, [note.type]);

    const startDrawing = (e) => {
        if (note.type !== 'ink') return;
        setIsDrawing(true);
        const { offsetX, offsetY } = getCoordinates(e);

        currentStroke.current = {
            points: [{ x: offsetX, y: offsetY }],
            color: color,
            width: brushSize,
            isEraser: tool === 'eraser'
        };

        const ctx = canvasRef.current.getContext('2d');
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = brushSize;

        if (tool === 'eraser') {
            ctx.globalCompositeOperation = 'destination-out';
        } else {
            ctx.globalCompositeOperation = 'source-over';
            ctx.strokeStyle = color;
        }

        ctx.beginPath();
        ctx.moveTo(offsetX, offsetY);
    };

    const draw = (e) => {
        if (!isDrawing || !currentStroke.current) return;
        const { offsetX, offsetY } = getCoordinates(e);
        currentStroke.current.points.push({ x: offsetX, y: offsetY });

        const ctx = canvasRef.current.getContext('2d');
        ctx.lineTo(offsetX, offsetY);
        ctx.stroke();
    };

    const stopDrawing = () => {
        if (!isDrawing) return;
        setIsDrawing(false);
        if (currentStroke.current) {
            strokes.current.push(currentStroke.current);
            setContent([...strokes.current]); // Trigger re-render/update
            currentStroke.current = null;
        }
    };

    const getCoordinates = (e) => {
        if (e.touches) {
            const rect = canvasRef.current.getBoundingClientRect();
            return {
                offsetX: e.touches[0].clientX - rect.left,
                offsetY: e.touches[0].clientY - rect.top
            };
        }
        return { offsetX: e.nativeEvent.offsetX, offsetY: e.nativeEvent.offsetY };
    };

    const handleClear = () => {
        const ctx = canvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        strokes.current = [];
        setContent([]);
    };

    // Cursor Logic
    const cursorRef = useRef(null);

    const handleCursorMove = (e) => {
        if (!cursorRef.current) return;
        const { clientX, clientY } = e;
        cursorRef.current.style.left = `${clientX}px`;
        cursorRef.current.style.top = `${clientY}px`;
        cursorRef.current.style.display = 'block';
    };

    const handleCursorLeave = () => {
        if (cursorRef.current) {
            cursorRef.current.style.display = 'none';
        }
        stopDrawing();
    };

    const handleSave = () => {
        dispatch({
            type: actions.UPDATE_NOTE,
            payload: {
                id: note.id,
                title,
                content: note.type === 'ink' ? strokes.current : content,
                isLocked
            }
        });
        onClose();
    };

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this note?')) {
            dispatch({ type: actions.DELETE_NOTE, payload: note.id });
            onClose();
        }
    };

    return (
        <AnimatePresence>
            <Overlay
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleSave}
            >
                <EditorContainer
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 50, opacity: 0 }}
                    onClick={e => e.stopPropagation()}
                    layoutId={`card-${note.id}`}
                >
                    <Toolbar>
                        <TitleInput
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="Note Title"
                        />

                        {note.type === 'ink' && (
                            <ToolsContainer>
                                <Button
                                    active={tool === 'pen'}
                                    onClick={() => setTool('pen')}
                                    title="Pen Tool"
                                >
                                    <FaPen />
                                </Button>
                                <Button
                                    active={tool === 'eraser'}
                                    onClick={() => setTool('eraser')}
                                    title="Eraser Tool"
                                >
                                    <FaEraser />
                                </Button>

                                <Button onClick={handleClear} title="Clear Canvas">
                                    <FaBroom />
                                </Button>

                                <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.2)' }}></div>

                                <input
                                    type="range"
                                    min="1"
                                    max="20"
                                    value={brushSize}
                                    onChange={(e) => setBrushSize(parseInt(e.target.value))}
                                    title={`Brush Size: ${brushSize}px`}
                                />

                                <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.2)' }}></div>

                                <ColorSwatch>
                                    {COLORS.map(c => (
                                        <ColorBtn
                                            key={c}
                                            color={c}
                                            active={color === c}
                                            onClick={() => {
                                                setColor(c);
                                                setTool('pen');
                                            }}
                                            title={c}
                                        />
                                    ))}
                                </ColorSwatch>
                            </ToolsContainer>
                        )}

                        <ActionGroup>
                            <Button onClick={() => setIsLocked(!isLocked)} title={isLocked ? "Unlock Note" : "Lock Note"}>
                                {isLocked ? <FaLock color="#ef4444" /> : <FaUnlock />}
                            </Button>
                            <Button onClick={handleDelete} title="Delete Note">
                                <FaTrash color="#ef4444" />
                            </Button>
                            <Button variant="primary" onClick={handleSave}>
                                <FaSave />
                            </Button>
                            <Button onClick={onClose}>
                                <FaTimes />
                            </Button>
                        </ActionGroup>
                    </Toolbar>

                    <ContentArea>
                        {note.type === 'ink' ? (
                            <>
                                <BrushCursor
                                    ref={cursorRef}
                                    style={{
                                        width: brushSize,
                                        height: brushSize,
                                        borderColor: tool === 'eraser' ? '#fff' : color // Eraser always white border? Or just keep it standard. 
                                        // Actually if tool is eraser, maybe show a different indicator? User just said brush size.
                                        // Let's stick to simple circle using current color or high contrast.
                                    }}
                                />
                                <Canvas
                                    ref={canvasRef}
                                    onMouseDown={startDrawing}
                                    onMouseMove={(e) => {
                                        draw(e);
                                        handleCursorMove(e);
                                    }}
                                    onMouseUp={stopDrawing}
                                    onMouseLeave={handleCursorLeave}
                                    onMouseEnter={(e) => handleCursorMove(e)} // Ensure it shows up immediately
                                    onTouchStart={startDrawing}
                                    onTouchMove={draw}
                                    onTouchEnd={stopDrawing}
                                />
                            </>
                        ) : (
                            <TextArea
                                value={content}
                                onChange={e => setContent(e.target.value)}
                                placeholder="Start typing..."
                                autoFocus
                            />
                        )}
                    </ContentArea>
                </EditorContainer>
            </Overlay>
        </AnimatePresence>
    );
}

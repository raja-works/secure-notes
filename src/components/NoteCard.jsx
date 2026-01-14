import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaLock, FaPen, FaFileAlt, FaTrash, FaPenNib } from 'react-icons/fa';
import { useStore } from '../context/Store';

const Card = styled(motion.div)`
  ${({ theme }) => theme.glass.card};
  padding: 20px;
  border-radius: 16px;
  border-radius: 16px;
  height: 260px; /* Fixed height for uniformity */
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
`;

const Title = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap; // Max one line
  text-align: center; // Centered
  width: 100%;
`;

const Preview = styled.div`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  overflow: hidden;
`;

const TextPreview = styled.p`
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap; // Max one line
    text-align: center;
    width: 100%;
    margin: 0;
`;

const InkPreviewContainer = styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    padding: 8px; /* Add some padding inside preview area */
    
    svg {
        max-width: 100%;
        max-height: 100%;
        width: auto;
        height: auto;
    }
`;

const Meta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const TypeIcon = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const LockedContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  margin: 10px 0;
`;

const DeleteBtn = styled.button`
    background: transparent;
    border: none;
    color: ${({ theme }) => theme.colors.textSecondary};
    padding: 6px;
    border-radius: 50%;
    &:hover {
        background: ${({ theme }) => theme.colors.danger}20; // 20% opacity
        color: ${({ theme }) => theme.colors.danger};
    }
`;

export default function NoteCard({ note, onClick }) {
    const { actions, dispatch } = useStore();

    const handleDelete = (e) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this note?')) {
            dispatch({ type: actions.DELETE_NOTE, payload: note.id });
        }
    };

    const isInk = note.type === 'ink';

    return (
        <Card
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={() => onClick(note)}
        >
            <CardHeader>
                <Title>{note.title || (isInk ? 'Untitled Sketch' : 'Untitled Note')}</Title>
                {note.isLocked && <FaLock size={14} color="#94a3b8" />}
            </CardHeader>

            {note.isLocked ? (
                <LockedContent>
                    <FaLock size={24} />
                    <span>Locked</span>
                </LockedContent>
            ) : (
                <Preview>
                    {isInk ? (
                        <InkPreviewContainer>
                            {/* Render Ink SVG */}
                            {(() => {
                                const strokes = Array.isArray(note.content) ? note.content : [];
                                if (strokes.length === 0) return <span style={{ fontStyle: 'italic', opacity: 0.5 }}>Empty Sketch</span>;

                                // Calculate bounds to frame the SVG
                                let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
                                strokes.forEach(s => {
                                    const points = Array.isArray(s) ? s : s.points;
                                    points.forEach(p => {
                                        if (p.x < minX) minX = p.x;
                                        if (p.y < minY) minY = p.y;
                                        if (p.x > maxX) maxX = p.x;
                                        if (p.y > maxY) maxY = p.y;
                                    });
                                });

                                // Add padding
                                const padding = 20;
                                const width = maxX - minX + padding * 2;
                                const height = maxY - minY + padding * 2;
                                const viewBox = `${minX - padding} ${minY - padding} ${width || 100} ${height || 100}`;

                                return (
                                    <svg viewBox={viewBox} style={{ pointerEvents: 'none' }}>
                                        {strokes.map((stroke, i) => {
                                            const points = Array.isArray(stroke) ? stroke : stroke.points;
                                            const color = stroke.color || '#fff';
                                            const width = stroke.width || 2;
                                            const isEraser = stroke.isEraser;

                                            // If eraser, we might want to skip or draw white? 
                                            // In preview, background is card background.
                                            // Ideally we should match composite operation, but SVG doesn't support destination-out easily without masks.
                                            // For simple preview, maybe just skip eraser strokes or draw them as background color?
                                            // Let's draw as transparent/background color if eraser, largely ignoring it for preview simplicity or approximating it.
                                            if (isEraser) return null;

                                            // Simple path construction
                                            const d = points.reduce((acc, p, index) => {
                                                return acc + (index === 0 ? `M ${p.x} ${p.y}` : ` L ${p.x} ${p.y}`);
                                            }, '');

                                            return (
                                                <path
                                                    key={i}
                                                    d={d}
                                                    stroke={color}
                                                    strokeWidth={width}
                                                    fill="none"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            );
                                        })}
                                    </svg>
                                );
                            })()}
                        </InkPreviewContainer>
                    ) : (
                        <TextPreview>
                            {note.content || "No content"}
                        </TextPreview>
                    )}
                </Preview>
            )}

            <Meta>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', fontSize: '0.75rem' }}>
                    {isInk ? <FaPen size={12} /> : <FaFileAlt size={12} />}
                    <span>
                        {new Date(note.updatedAt || note.createdAt).toLocaleString()}
                    </span>
                </div>
                {!note.isLocked && (
                    <DeleteBtn onClick={handleDelete} title="Delete Note">
                        <FaTrash />
                    </DeleteBtn>
                )}
            </Meta>
        </Card>
    );
}

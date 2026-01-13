import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaLock, FaPen, FaFileAlt, FaTrash, FaPenNib } from 'react-icons/fa';
import { useStore } from '../context/StoreContext';

const Card = styled(motion.div)`
  ${({ theme }) => theme.glass.card};
  padding: 20px;
  border-radius: 16px;
  min-height: 180px;
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
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const Preview = styled.p`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  flex: 1;
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
                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontStyle: 'italic' }}>
                            <FaPenNib /> Ink Content
                        </span>
                    ) : (
                        note.content || "No content"
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

import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaPen, FaFileAlt, FaTimes } from 'react-icons/fa';

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(5px);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const DialogContainer = styled(motion.div)`
  ${({ theme }) => theme.glass.card};
  background: ${({ theme }) => theme.colors.surface};
  padding: 40px;
  border-radius: 24px;
  width: 90%;
  max-width: 500px;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 32px;
  text-align: center;
`;

const Title = styled.h2`
  font-size: 2rem;
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
`;

const OptionsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
`;

const OptionButton = styled.button`
  background: ${({ theme }) => theme.colors.surfaceHighlight};
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: 32px 20px;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  color: ${({ theme }) => theme.colors.text};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-5px);
    border-color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => theme.colors.surfaceHighlight};
    box-shadow: 0 10px 30px -10px ${({ theme }) => theme.colors.primary}40;
  }

  svg {
    font-size: 3rem;
    color: ${({ theme }) => theme.colors.primary};
  }

  span {
    font-size: 1.2rem;
    font-weight: 600;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 1.5rem;
  
  &:hover {
    color: ${({ theme }) => theme.colors.text};
  }
`;

export default function NewNoteDialog({ onClose, onSelect }) {
    return (
        <Overlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
        >
            <DialogContainer
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={e => e.stopPropagation()}
            >
                <CloseButton onClick={onClose}>
                    <FaTimes />
                </CloseButton>
                <Title>Create New Note</Title>
                <OptionsGrid>
                    <OptionButton onClick={() => onSelect('text')}>
                        <FaFileAlt />
                        <span>Text Note</span>
                    </OptionButton>
                    <OptionButton onClick={() => onSelect('ink')}>
                        <FaPen />
                        <span>Sketch</span>
                    </OptionButton>
                </OptionsGrid>
            </DialogContainer>
        </Overlay>
    );
}

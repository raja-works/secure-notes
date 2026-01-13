import styled from 'styled-components';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaLock } from 'react-icons/fa';
import { useStore } from '../context/StoreContext';
import { hashPin } from '../utils/crypto';

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(5px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Card = styled.div`
  ${({ theme }) => theme.glass.card};
  padding: 40px;
  border-radius: 24px;
  width: 100%;
  max-width: 400px;
  text-align: center;
  position: relative;
`;

const IconWrapper = styled.div`
  background: ${({ theme }) => theme.colors.primary}20;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 2rem;
`;

const Title = styled.h2`
  margin-bottom: 12px;
  color: ${({ theme }) => theme.colors.text};
`;

const Message = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 32px;
`;

const PasswordInput = styled.input`
  ${({ theme }) => theme.glass.input};
  width: 100%;
  padding: 16px;
  font-size: 1.2rem;
  text-align: center;
  margin-bottom: 24px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
`;

const Button = styled.button`
  background: ${({ theme, secondary }) => secondary ? 'rgba(255,255,255,0.1)' : theme.colors.primary};
  color: ${({ theme, secondary }) => secondary ? theme.colors.text : 'white'};
  border: none;
  flex: 1;
  padding: 16px;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
      opacity: 0.9;
  }
`;

export default function PinPrompt({ onSuccess, onCancel, message = "Enter PIN to access." }) {
    const { state } = useStore();
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = () => {
        if (!pin) return;

        const hashed = hashPin(pin);

        // Verify against global stored hash
        if (state.pinHash && state.pinHash !== hashed) {
            setError('Incorrect PIN/Password');
            return;
        }

        if (state.globalPin && state.globalPin !== pin) {
            setError('Incorrect PIN/Password');
            return;
        }

        onSuccess();
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSubmit();
        }
    };

    return (
        <Overlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <Card onClick={e => e.stopPropagation()}>
                <IconWrapper>
                    <FaLock />
                </IconWrapper>
                <Title>Restricted Access</Title>
                <Message>{error || message}</Message>

                <PasswordInput
                    type="password"
                    value={pin}
                    onChange={e => setPin(e.target.value)}
                    placeholder="Enter PIN/Password"
                    autoFocus
                    onKeyDown={handleKeyDown}
                />

                <ButtonGroup>
                    <Button secondary onClick={onCancel}>Cancel</Button>
                    <Button onClick={handleSubmit}>Unlock</Button>
                </ButtonGroup>
            </Card>
        </Overlay>
    );
}

import styled from 'styled-components';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaLock } from 'react-icons/fa';
import { useStore } from '../context/Store';
import { hashPin } from '../utils/crypto';

const LockContainer = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${({ theme }) => theme.colors.background};
  z-index: 999;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const LockCard = styled.div`
  ${({ theme }) => theme.glass.card};
  padding: 40px;
  border-radius: 24px;
  width: 100%;
  max-width: 400px;
  text-align: center;
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
  box-sizing: border-box;
  display: block;
  padding: 16px;
  font-size: 1.2rem;
  text-align: center;
  margin-bottom: 24px;
`;

const Button = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  width: 100%;
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

export default function AppLock() {
    const { state, dispatch, actions } = useStore();
    const [pin, setPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [isSettingMode, setIsSettingMode] = useState(!state.hasPin);
    const [error, setError] = useState('');

    const handleUnlock = () => {
        if (!pin) return;

        const hashed = hashPin(pin);

        // Verify against stored hash if available
        if (state.pinHash && state.pinHash !== hashed) {
            setError('Incorrect PIN/Password');
            return;
        }

        // Fallback check against memory pin if available
        if (state.globalPin && state.globalPin !== pin) {
            setError('Incorrect PIN/Password');
            return;
        }

        dispatch({ type: actions.UNLOCK_APP, payload: pin });
    };

    const handleSetPin = () => {
        if (pin.length < 4) {
            setError('PIN must be at least 4 characters');
            return;
        }

        if (pin !== confirmPin) {
            setError('PINs do not match');
            return;
        }

        dispatch({ type: actions.SET_PIN, payload: pin });
        dispatch({ type: actions.UNLOCK_APP, payload: pin });
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            isSettingMode ? handleSetPin() : handleUnlock();
        }
    };

    return (
        <LockContainer>
            <LockCard>
                <IconWrapper>
                    <FaLock />
                </IconWrapper>
                <Title>{isSettingMode ? "Setup Security" : "Locked"}</Title>
                <Message>{isSettingMode ? "Create a secure PIN or Password." : (error || "Enter PIN/Password to unlock.")}</Message>

                <PasswordInput
                    type="password"
                    value={pin}
                    onChange={e => setPin(e.target.value)}
                    placeholder={isSettingMode ? "Enter new PIN/Password" : "Enter PIN/Password"}
                    autoFocus
                    onKeyDown={handleKeyDown}
                />

                {isSettingMode && (
                    <PasswordInput
                        type="password"
                        value={confirmPin}
                        onChange={e => setConfirmPin(e.target.value)}
                        placeholder="Confirm PIN/Password"
                        onKeyDown={handleKeyDown}
                    />
                )}

                <Button onClick={isSettingMode ? handleSetPin : handleUnlock}>
                    {isSettingMode ? "Set Security" : "Unlock"}
                </Button>
            </LockCard>
        </LockContainer>
    );
}

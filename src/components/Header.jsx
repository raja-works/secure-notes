import styled from 'styled-components';
import { useRef, useState } from 'react';
import { FaSearch, FaLock, FaUnlock, FaCloudDownloadAlt, FaCloudUploadAlt, FaPlus, FaMoon, FaSun, FaFont } from 'react-icons/fa';
import { useStore } from '../context/StoreContext';
import { exportBackup, importBackup } from '../utils/backup';

const HeaderContainer = styled.header`
  ${({ theme }) => theme.glass.card};
  padding: 16px 20px;
  border-radius: 16px;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;

  @media (max-width: 600px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary}, #08de90ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
`;

const SearchContainer = styled.div`
  position: relative;
  flex: 1;
  max-width: 400px;
`;

const SearchInput = styled.input`
  ${({ theme }) => theme.glass.input};
  width: 100%;
  padding-left: 40px;
`;

const SearchIcon = styled(FaSearch)`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Actions = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const IconButton = styled.button`
  background: ${({ theme, active }) => active ? theme.colors.primary : 'rgba(255, 255, 255, 0.1)'};
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme, active }) => active ? 'white' : theme.colors.text};
  transition: all 0.2s;
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.colors.primary};
    transform: translateY(-2px);
    color: white;
  }
`;

const FontSelect = styled.select`
  appearance: none;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  padding: 8px 12px;
  border-radius: 8px;
  color: ${({ theme }) => theme.colors.text};
  font-family: inherit;
  cursor: pointer;
  outline: none;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  option {
    background: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text};
  }
`;

export default function Header({ onAddNote }) {
  const { state, dispatch, actions } = useStore();
  const fileInputRef = useRef(null);

  const handleSearch = (e) => {
    dispatch({ type: actions.SET_SEARCH, payload: e.target.value });
  };

  const handleBackup = () => {
    exportBackup(state);
  };

  const handleRestoreClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const pinToUse = state.globalPin;

    if (!pinToUse) {
      alert("Please unlock the app to import backups.");
      return;
    }

    importBackup(file, pinToUse, (data) => {
      if (confirm(`Restore ${data.length} notes? This will overwrite existing notes.`)) {
        dispatch({ type: actions.IMPORT_DATA, payload: { notes: data } });
      }
    });
    e.target.value = null;
  };

  const handleLockToggle = () => {
    if (state.isAppLocked) {
      dispatch({ type: actions.UNLOCK_APP });
    } else {
      if (state.hasPin) {
        dispatch({ type: actions.SET_APP_LOCK, payload: true });
      } else {
        alert("Please set a PIN first (Mock: PIN set to 1234)");
        dispatch({ type: actions.SET_PIN, payload: '1234' });
      }
    }
  };

  const toggleTheme = () => {
    const newMode = state.themeMode === 'light' ? 'dark' : 'light';
    dispatch({ type: actions.SET_THEME, payload: newMode });
  };

  const handleFontChange = (e) => {
    dispatch({ type: actions.SET_FONT, payload: e.target.value });
  };

  const fonts = [
    'Inter', 'Open Sans', 'Roboto', 'Lato', 'Montserrat', 'Lora',
    'Garamond', 'Georgia', 'Helvetica', 'Arial', 'Calibri'
  ];

  return (
    <HeaderContainer>
      <Title>Secure Notes</Title>
      <SearchContainer>
        <SearchIcon />
        <SearchInput
          placeholder="Search encrypted notes..."
          onChange={handleSearch}
          value={state.searchQuery}
        />
      </SearchContainer>
      <Actions>
        <FontSelect value={state.fontFamily} onChange={handleFontChange} title="Change Font">
          {fonts.map(font => (
            <option key={font} value={font}>{font}</option>
          ))}
        </FontSelect>

        <IconButton onClick={toggleTheme} title={state.themeMode === 'light' ? "Switch to Dark Mode" : "Switch to Light Mode"}>
          {state.themeMode === 'light' ? <FaMoon /> : <FaSun />}
        </IconButton>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: 'none' }}
          accept=".json,.enc"
        />
        <IconButton title="Backup" onClick={handleBackup}>
          <FaCloudDownloadAlt />
        </IconButton>
        <IconButton title="Restore" onClick={handleRestoreClick}>
          <FaCloudUploadAlt />
        </IconButton>
        <IconButton onClick={handleLockToggle} title={state.isAppLocked ? "Unlock App" : "Lock App"}>
          {state.isAppLocked ? <FaLock /> : <FaUnlock />}
        </IconButton>
        <IconButton onClick={onAddNote} active title="Add Note">
          <FaPlus />
        </IconButton>
      </Actions>
    </HeaderContainer>
  );
}

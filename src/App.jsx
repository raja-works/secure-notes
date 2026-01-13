import styled, { ThemeProvider } from 'styled-components';
import { useState, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { FaStickyNote } from 'react-icons/fa';
import { useStore } from './context/StoreContext';
import { lightTheme, darkTheme } from './styles/theme';
import { GlobalStyles } from './styles/GlobalStyles';
import Header from './components/Header';
import NoteCard from './components/NoteCard';
import Editor from './components/Editor';
import AppLock from './components/AppLock';
import PinPrompt from './components/PinPrompt';
import NewNoteDialog from './components/NewNoteDialog';

const AppContainer = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  padding-bottom: 100px;
  position: relative;
  z-index: 1;
`;

const BackgroundDecoration = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-15deg);
  font-size: 80vh;
  color: ${({ theme }) => theme.colors.primary};
  opacity: 0.03;
  z-index: 0;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const NotesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
`;

const EmptyState = styled.div`
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-align: center;
  gap: 16px;
`;

function App() {
  const { state, dispatch, actions } = useStore();
  const [selectedNote, setSelectedNote] = useState(null);
  const [noteToUnlock, setNoteToUnlock] = useState(null);
  const [showNewNoteDialog, setShowNewNoteDialog] = useState(false);

  // Compute theme based on store state
  const currentTheme = useMemo(() => {
    const baseTheme = state.themeMode === 'light' ? lightTheme : darkTheme;
    return {
      ...baseTheme,
      fontFamily: state.fontFamily || 'Inter'
    };
  }, [state.themeMode, state.fontFamily]);

  const filteredNotes = state.notes.filter(note => {
    const q = state.searchQuery.toLowerCase();
    // Only search content if NOT locked
    const contentMatch = !note.isLocked && typeof note.content === 'string' && note.content.toLowerCase().includes(q);
    return note.title.toLowerCase().includes(q) || contentMatch;
  });

  const handleAddNoteClick = () => {
    setShowNewNoteDialog(true);
  };

  const handleCreateNote = (type) => {
    setShowNewNoteDialog(false);
    const newNote = {
      id: crypto.randomUUID(),
      title: type === 'ink' ? 'New Sketch' : 'New Note',
      content: type === 'ink' ? [] : '',
      type
    };
    dispatch({
      type: actions.ADD_NOTE,
      payload: newNote
    });
    setSelectedNote(newNote);
  };

  const handleNoteClick = (note) => {
    if (note.isLocked) {
      setNoteToUnlock(note);
    } else {
      setSelectedNote(note);
    }
  };

  const handleUnlockSuccess = () => {
    setSelectedNote(noteToUnlock);
    setNoteToUnlock(null);
  };

  return (
    <ThemeProvider theme={currentTheme}>
      <GlobalStyles />
      <BackgroundDecoration>
        <FaStickyNote />
      </BackgroundDecoration>
      <AppContainer>
        <Header onAddNote={handleAddNoteClick} />

        <NotesGrid>
          <AnimatePresence mode='popLayout'>
            {filteredNotes.length > 0 ? (
              filteredNotes.map(note => (
                <NoteCard key={note.id} note={note} onClick={handleNoteClick} />
              ))
            ) : (
              <EmptyState>
                <img src="/masked-icon.svg" width="64" style={{ opacity: 0.5 }} alt="" />
                <p>{state.searchQuery ? "No matching notes found." : "No notes yet. Create one!"}</p>
              </EmptyState>
            )}
          </AnimatePresence>
        </NotesGrid>

        <AnimatePresence>
          {showNewNoteDialog && (
            <NewNoteDialog
              onClose={() => setShowNewNoteDialog(false)}
              onSelect={handleCreateNote}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {selectedNote && (
            <Editor
              key="editor"
              note={selectedNote}
              onClose={() => setSelectedNote(null)}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {noteToUnlock && (
            <PinPrompt
              key="pin-prompt"
              message="Enter PIN/Password to view locked note."
              onSuccess={handleUnlockSuccess}
              onCancel={() => setNoteToUnlock(null)}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {(state.isAppLocked || !state.hasPin) && <AppLock />}
        </AnimatePresence>
      </AppContainer>
    </ThemeProvider>
  )
}

export default App

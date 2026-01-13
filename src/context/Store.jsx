import { createContext, useContext, useReducer, useEffect } from 'react';

import { hashPin } from '../utils/crypto';

const StoreContext = createContext();

const initialState = {
    isAppLocked: false, // Default to false for now, will toggle if PIN is set
    hasPin: false,
    globalPin: null, // In a real app this should be hashed/salted
    notes: [], // Array of { id, title, content, type: 'text'|'ink', isLocked, createdAt, updatedAt }
    searchQuery: '',
    themeMode: 'dark', // 'light' | 'dark'
    fontFamily: 'Inter', // Default font

};

const ACTIONS = {
    ADD_NOTE: 'ADD_NOTE',
    UPDATE_NOTE: 'UPDATE_NOTE',
    DELETE_NOTE: 'DELETE_NOTE',
    SET_APP_LOCK: 'SET_APP_LOCK',
    SET_PIN: 'SET_PIN',
    UNLOCK_APP: 'UNLOCK_APP',
    IMPORT_DATA: 'IMPORT_DATA',
    SET_SEARCH: 'SET_SEARCH',
    SET_THEME: 'SET_THEME',
    SET_FONT: 'SET_FONT'
};

function reducer(state, action) {
    switch (action.type) {
        case ACTIONS.ADD_NOTE:
            return {
                ...state,
                notes: [
                    {
                        id: crypto.randomUUID(),
                        title: '',
                        content: '',
                        type: 'text',
                        isLocked: false,
                        createdAt: Date.now(),
                        updatedAt: Date.now(),
                        ...action.payload
                    },
                    ...state.notes
                ]
            };
        case ACTIONS.UPDATE_NOTE:
            return {
                ...state,
                notes: state.notes.map(note =>
                    note.id === action.payload.id
                        ? { ...note, ...action.payload, updatedAt: Date.now() }
                        : note
                )
            };
        case ACTIONS.DELETE_NOTE:
            return {
                ...state,
                notes: state.notes.filter(note => note.id !== action.payload)
            };
        case ACTIONS.SET_APP_LOCK:
            return { ...state, isAppLocked: action.payload };
        case ACTIONS.UNLOCK_APP:
            return { ...state, isAppLocked: false, globalPin: action.payload };
        case ACTIONS.SET_PIN:
            // payload is plain pin. We store it in memory (globalPin) for session encryption
            // We also compute a hash for persistence verification
            return {
                ...state,
                globalPin: action.payload,
                pinHash: hashPin(action.payload), // We need to import hashPin or move it here. For now assume it's imported or available.
                hasPin: true
            };
        case ACTIONS.IMPORT_DATA:
            return { ...state, notes: action.payload.notes || state.notes };
        case ACTIONS.SET_SEARCH:
            return { ...state, searchQuery: action.payload };
        case ACTIONS.SET_THEME:
            return { ...state, themeMode: action.payload };
        case ACTIONS.SET_FONT:
            return { ...state, fontFamily: action.payload };
        default:
            return state;
    }
}

export function StoreProvider({ children }) {
    // Load from local storage initially (mock persistence for now)
    const [state, dispatch] = useReducer(reducer, initialState, (initial) => {
        try {
            const localData = localStorage.getItem('secure-notes-data');
            if (localData) {
                const parsed = JSON.parse(localData);
                // Security: Must lock app on reload to force PIN entry (to recover session key)
                if (parsed.hasPin) {
                    parsed.isAppLocked = true;
                }
                return { ...initialState, ...parsed };
            }
            return initial;
        } catch {
            return initial;
        }
    });

    // Sync to local storage
    useEffect(() => {
        // secure: do not persist the actual globalPin
        const { globalPin, ...stateToPersist } = state;
        try {
            localStorage.setItem('secure-notes-data', JSON.stringify(stateToPersist));
        } catch (e) {
            console.error("Failed to save to local storage (likely quota exceeded)", e);
            alert("Warning: Storage quota exceeded. Recent changes may not be saved locally.");
        }
    }, [state]);

    const value = {
        state,
        dispatch,
        actions: ACTIONS
    };

    return (
        <StoreContext.Provider value={value}>
            {children}
        </StoreContext.Provider>
    );
}

export const useStore = () => useContext(StoreContext);

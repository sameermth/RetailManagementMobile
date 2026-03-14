import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
    isLoading: boolean;
    theme: 'light' | 'dark';
    sidebarOpen: boolean;
    currentModal: string | null;
    toast: {
        visible: boolean;
        message: string;
        type: 'success' | 'error' | 'info' | 'warning';
    };
}

const initialState: UIState = {
    isLoading: false,
    theme: 'light',
    sidebarOpen: false,
    currentModal: null,
    toast: {
        visible: false,
        message: '',
        type: 'info',
    },
};

const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
        setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
            state.theme = action.payload;
        },
        toggleSidebar: (state) => {
            state.sidebarOpen = !state.sidebarOpen;
        },
        openModal: (state, action: PayloadAction<string>) => {
            state.currentModal = action.payload;
        },
        closeModal: (state) => {
            state.currentModal = null;
        },
        showToast: (state, action: PayloadAction<{ message: string; type: UIState['toast']['type'] }>) => {
            state.toast = {
                visible: true,
                message: action.payload.message,
                type: action.payload.type,
            };
        },
        hideToast: (state) => {
            state.toast.visible = false;
        },
    },
});

export const {
    setLoading,
    setTheme,
    toggleSidebar,
    openModal,
    closeModal,
    showToast,
    hideToast,
} = uiSlice.actions;

export default uiSlice.reducer;

import { createSlice } from '@reduxjs/toolkit';

export const uiSlice = createSlice({
    name: 'ui',
    initialState: {
        isDateModalOpen: false,
        isCategoryModalOpen: false,
    },
    reducers: {
        onOpenDateModal: ( state ) => {
            state.isDateModalOpen = true;
        },
        onCloseDateModal: ( state ) => {
            state.isDateModalOpen = false;
        },
         onOpenCategoryModal: (state) => {
            state.isCategoryModalOpen = true;
        },
        onCloseCategoryModal: (state) => {
            state.isCategoryModalOpen = false;
        },
    }
});


// Action creators are generated for each case reducer function
export const { 
    onOpenDateModal, 
    onCloseDateModal, 
    onOpenCategoryModal, 
    onCloseCategoryModal
} = uiSlice.actions;
import { useDispatch, useSelector } from 'react-redux';
import { onCloseDateModal, onOpenDateModal, onOpenCategoryModal, onCloseCategoryModal, onOpenShareModal, onCloseShareModal } from '../store';


export const useUiStore = () => {

    const dispatch = useDispatch();

        const { 
            isDateModalOpen, isCategoryModalOpen, isShareModalOpen 
        } = useSelector( state => state.ui ); 

    const openDateModal = () => {
        dispatch( onOpenDateModal() )
    }

    const closeDateModal = () => {
        dispatch( onCloseDateModal() )
    }

    const toggleDateModal = () => {
        (isDateModalOpen)
            ? openDateModal()
            : closeDateModal();
    }

    const openCategoryModal = () => {
        dispatch( onOpenCategoryModal() );
    }

    const closeCategoryModal = () => {
        dispatch( onCloseCategoryModal() );
    }

    const openShareModal = () => { dispatch( onOpenShareModal() ); }
    const closeShareModal = () => { dispatch( onCloseShareModal() ); }

    return {
        //* Propiedades
        isDateModalOpen,
        isCategoryModalOpen,
        isShareModalOpen, 

        //* Métodos
        closeDateModal,
        openDateModal,
        toggleDateModal,
        openCategoryModal,   
        closeCategoryModal, 
        openShareModal, 
        closeShareModal, 
    }

}



import { useDispatch, useSelector } from 'react-redux';
import { onCloseDateModal, onOpenDateModal, onOpenCategoryModal, onCloseCategoryModal } from '../store';


export const useUiStore = () => {

    const dispatch = useDispatch();

        const { 
            isDateModalOpen, isCategoryModalOpen 
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



    return {
        //* Propiedades
        isDateModalOpen,
        isCategoryModalOpen,

        //* Métodos
        closeDateModal,
        openDateModal,
        toggleDateModal,
        openCategoryModal,   
        closeCategoryModal, 
    }

}



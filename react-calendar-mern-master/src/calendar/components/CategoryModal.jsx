
import React, { useState } from 'react';
import Modal from 'react-modal';
import Swal from 'sweetalert2';

import { useUiStore, useCalendarStore } from '../../hooks'; 

const customStyles = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
    },
};
Modal.setAppElement('#root'); 

export const CategoryModal = () => {
    
    // 1. 상태 및 훅 가져오기
    // useUiStore에서 CategoryModal 상태를 관리할 새로운 변수와 함수가 필요.
    const { isCategoryModalOpen, closeCategoryModal } = useUiStore(); 
    const { startSavingCategory } = useCalendarStore(); // 카테고리 저장 함수 

    const [formSubmitted, setFormSubmitted] = useState(false);
    
    // 캘린더 이름과 색상을 저장할 상태
    const [formValues, setFormValues] = useState({
        name: '',
        color: '#007bff', 
    });

    // 2. 입력값 변경 핸들러
    const onInputChanged = ({ target }) => {
        setFormValues({
            ...formValues,
            [target.name]: target.value
        });
    }

    // 3. 모달 닫기 핸들러
    const onCloseModal = () => {
        closeCategoryModal();
        setFormSubmitted(false); // 닫을 때 제출 상태 초기화
        setFormValues({ name: '', color: '#007bff' }); // 폼 값 초기화
    }

    // 4. 폼 제출 핸들러 (저장)
    const onSubmit = async( event ) => {
        event.preventDefault();
        setFormSubmitted(true);

        // 유효성 검사
        if ( formValues.name.trim().length === 0 ) {
            Swal.fire('경고', '캘린더 이름을 입력해 주세요.', 'error');
            return;
        }

        // 다음 단계: useCalendarStore의 startSavingCategory 함수를 호출하여 API에 저장
        await startSavingCategory( formValues ); 
        
        // 성공 후 모달 닫기
        onCloseModal();
    }

    return (
        <Modal  
            isOpen={ isCategoryModalOpen }
            onRequestClose={ onCloseModal }
            style={ customStyles }
            className="modal"
            overlayClassName="modal-fondo"
            closeTimeoutMS={200}
        >
            <h1> 새 캘린더 추가 </h1>
            <hr />
            <form className="container" onSubmit={onSubmit}>

                {/* 캘린더 이름 입력 */}
                <div className="form-group mb-3">
                    <label className="form-label">캘린더 이름</label>
                    <input 
                        type="text" 
                        className={`form-control ${ (formSubmitted && formValues.name.trim().length === 0) ? 'is-invalid' : '' }`}
                        placeholder="예: 회사, 개인 일정, 운동"
                        name="name"
                        autoComplete="off"
                        value={formValues.name}
                        onChange={onInputChanged}
                    />
                </div>
                
                {/* 색상 선택 */}
                <div className="form-group mb-4">
                    <label className="form-label">색상 선택</label>
                    <div className="d-flex align-items-center">
                        <input 
                            type="color" 
                            className="form-control form-control-color me-3"
                            name="color"
                            value={formValues.color}
                            onChange={onInputChanged}
                            title="캘린더 색상"
                            style={{ height: '38px', width: '50px' }}
                        />
                        <span style={{ color: formValues.color, fontWeight: 'bold' }}>
                            {formValues.color}
                        </span>
                    </div>
                </div>


                <button
                    type="submit"
                    className="btn btn-primary btn-block w-100"
                >
                    <i className="far fa-save"></i>
                    <span> 저장</span>
                </button>

            </form>

        </Modal>
    );
}
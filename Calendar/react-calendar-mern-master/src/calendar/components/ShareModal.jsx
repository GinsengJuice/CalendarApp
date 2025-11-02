
import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import Swal from 'sweetalert2';
import { useCalendarStore } from '../../hooks'; // 경로에 맞게 수정
import { useUiStore } from '../../hooks'; // useUiStore 훅 임포트

// 모달 스타일 (CategoryModal과 동일)
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


export const ShareModal = ({ selectedCalendar }) => { // 캘린더 정보를 props로 받습니다.

    // 1. 훅에서 필요한 상태와 함수 가져오기
    const { startSharingCalendar } = useCalendarStore();
    const { isShareModalOpen, closeShareModal } = useUiStore(); // useUiStore에 추가된 상태/함수 사용
    
    // 2. 폼 상태 관리
    const [formValues, setFormValues] = useState({
        invitedEmail: '',
        role: 'viewer', // 기본값: 보기 권한
    });

    // 모달이 열릴 때마다 폼 초기화
    useEffect(() => {
        setFormValues({
            invitedEmail: '',
            role: 'viewer',
        });
    }, [isShareModalOpen]); // 모달 상태가 바뀔 때마다 초기화

    const onInputChange = ({ target }) => {
        setFormValues({
            ...formValues,
            [target.name]: target.value
        });
    }

    const onSubmit = async (event) => {
        event.preventDefault();

        if (!formValues.invitedEmail || formValues.invitedEmail.trim().length < 5) {
            Swal.fire('경고', '유효한 이메일 주소를 입력해주세요.', 'warning');
            return;
        }

        // 캘린더 공유 로직 호출
        await startSharingCalendar(
            selectedCalendar.id,        // 공유할 캘린더 ID
            formValues.invitedEmail,    // 초대할 이메일
            formValues.role             // 부여할 권한
        );
        
        // 성공 여부와 관계없이 모달 닫기
        closeShareModal();
    }

    return (
        <Modal
            isOpen={ isShareModalOpen } // useUiStore 상태 사용
            onRequestClose={ closeShareModal }
            style={ customStyles }
            className="modal"
            overlayClassName="modal-fondo"
            closeTimeoutMS={ 200 }
        >
            <h3> 캘린더 공유하기: { selectedCalendar?.name } </h3>
            <hr />

            <form className="container" onSubmit={ onSubmit }>
                
                <div className="form-group mb-2">
                    <label>초대할 사용자 이메일</label>
                    <input 
                        type="email" 
                        className="form-control"
                        placeholder="user@example.com"
                        name="invitedEmail"
                        value={ formValues.invitedEmail }
                        onChange={ onInputChange }
                    />
                </div>

                <div className="form-group mb-2">
                    <label>부여할 권한</label>
                    <select
                        className="form-control"
                        name="role"
                        value={ formValues.role }
                        onChange={ onInputChange }
                    >
                        <option value="viewer">보기 권한 (Viewer)</option>
                        <option value="editor">수정 권한 (Editor)</option>
                    </select>
                </div>

                <hr />
                <button
                    type="submit"
                    className="btn btn-outline-primary btn-block w-100"
                >
                    <i className="fas fa-share-alt"></i>
                    <span> 공유하기</span>
                </button>

            </form>
        </Modal>
    );
}
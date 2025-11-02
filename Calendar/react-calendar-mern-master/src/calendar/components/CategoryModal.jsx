import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import Swal from 'sweetalert2';
import { ShareModal } from './ShareModal'; 
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

// 헬퍼 함수: 카테고리 로드 상태에 따라 폼 초기값 설정
const getCategoryInitialValues = (categories) => {
    const defaultColor = categories.length > 0 ? categories[0].color : '#007bff';
    return { id: null, name: '', color: defaultColor };
}

export const CategoryModal = () => {
    
    const { isCategoryModalOpen, closeCategoryModal, openShareModal } = useUiStore(); 
    const { startSavingCategory, activeCategory, categories, setActiveCategory, startDeletingCategory } = useCalendarStore(); 
 
    const [formSubmitted, setFormSubmitted] = useState(false);
    
    // 캘린더 이름과 색상을 저장할 상태
    const [formValues, setFormValues] = useState(getCategoryInitialValues(categories));

    // activeCategory 변경 또는 모달 상태 변경 시 폼 값 초기화/설정
    useEffect(() => {
        console.log("Active Category State:", activeCategory);
       
        if (isCategoryModalOpen) {
            // 모달이 열린 상태
            if (activeCategory) {
                // A. 수정 모드
                const itemId = activeCategory.id || activeCategory._id;   
                setFormValues({
                    id: itemId || null,
                    name: activeCategory.name || '',
                    color: activeCategory.color || '#007bff',
                });
                return; 
            } else {
                // B. 생성 모드 (모달이 열렸는데 activeCategory가 null일 때)
                setFormValues(getCategoryInitialValues(categories));
            }
        }
        
    }, [activeCategory, isCategoryModalOpen, categories]); 

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
        setFormSubmitted(false); 
        setActiveCategory(null); // Redux 상태에서 activeCategory를 null로 설정
        // 폼 값 초기화: Redux 상태에 의존하지 않고 명시적으로 초기화
        setFormValues(getCategoryInitialValues(categories));
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

        console.log("폼 값:", formValues); 
        console.log("수정 모드 ID:", formValues.id);
        console.log("API 호출 전 ID:", formValues.id);        

        // ID가 null이면 생성, ID가 있으면 수정으로 useCalendarStore에서 처리됩니다.
        await startSavingCategory( formValues ); 
        
        // 성공 후 모달 닫기
        onCloseModal();
    }

    const onDelete = () => {
        const categoryId = formValues.id;
        if (!categoryId) {
            Swal.fire('오류', '삭제할 캘린더를 선택해야 합니다.', 'error');
            return;
        }

        // 사용자에게 삭제 확인 받기
        Swal.fire({
            title: '정말 삭제하시겠습니까?',
            text: "해당 캘린더와 관련된 모든 이벤트가 삭제됩니다.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: '삭제!',
            cancelButtonText: '취소'
        }).then(async (result) => {
            if (result.isConfirmed) {
                // 삭제 함수 호출 (startDeletingCategory는 activeCategory의 ID를 사용함)
                console.log("삭제 API 호출 시작");
                // activeCategory를 사용하여 삭제 (useCalendarStore의 startDeletingCategory 로직에 따름)
                await startDeletingCategory(); 
                // 모달 닫기
                closeCategoryModal(); 
            }
        })
    }

    return (
        <>
        <Modal  
            isOpen={ isCategoryModalOpen }
            onRequestClose={ onCloseModal }
            style={ customStyles }
            className="modal"
            overlayClassName="modal-fondo"
            closeTimeoutMS={200}
        >
            <h1> {activeCategory ? '캘린더 수정' : '새 캘린더 추가'} </h1> 
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

<hr />
                {/* 캘린더가 ID를 가지고 있을 때만(수정 모드) 공유 버튼 표시 */}
                {
                    ( formValues.id )
                        && (
                            <button
                                type="button" 
                                className="btn btn-warning btn-block"
                                // 🚨 접근성 수정: aria-label 추가
                                aria-label="캘린더 공유하기" 
                                onClick={ openShareModal } 
                                style={{
                                    float: 'right', 
                                    marginLeft: '10px'
                                }}
                            >
                                <i className="fas fa-share-alt" aria-hidden="true"></i> {/* 🚨 접근성 수정: 아이콘 숨김 */}
                                <span> 캘린더 공유하기</span>
                            </button>
                        )
                }

            <div className="d-grid gap-2">
                  <button
                    type="submit"
                    className="btn btn-outline-primary btn-block"
                    // 🚨 접근성 수정: aria-label 추가
                    aria-label={activeCategory ? '캘린더 수정 저장' : '새 캘린더 저장'}
                >
                    <i className="far fa-save" aria-hidden="true"></i>
                   <span> {activeCategory ? ' 수정' : ' 저장'}</span>
                </button>

                {/* 삭제 버튼: activeCategory가 있을 때만 표시 (수정 모드일 때) */}
            { activeCategory && ( 
                <button
                    type="button"
                    className="btn btn-outline-danger btn-block mt-2"
                    // 🚨 접근성 수정: aria-label 추가
                    aria-label="캘린더 삭제"
                    onClick={onDelete}
                >
                    <i className="far fa-trash-alt" aria-hidden="true"></i>
                    <span> 삭제</span>
                </button>
            )}
        </div>  

            </form>

        </Modal>

    {/* ShareModal 컴포넌트 렌더링 */}
        {
            ( formValues.id ) && (
                <ShareModal 
                    selectedCalendar={ formValues } 
                />
                )
            }
        </>
    );
}

import React from 'react';
import { useCalendarStore, useUiStore } from '../../hooks'; // 경로에 맞게 수정
import { MiniCalendar } from './MiniCalendar'; 

export const CalendarSidebar = () => {

    // 훅에서 필요한 상태와 함수를 가져옵니다.
    const { 
        categories, 
        activeCategoryIds, 
        toggleCategoryFilter, 
        setActiveCategory,
        // ✨ 새로 추가된 전체 토글 함수
        startToggleAllCategories 
    } = useCalendarStore();
    const { openCategoryModal } = useUiStore();

    // 카테고리 ID를 추출하는 헬퍼 함수
    const getCategoryId = (category) => category.id || category._id;

    // 모든 카테고리가 활성화되었는지 확인 (전체 토글 버튼용)
    const isAllActive = categories.length > 0 && activeCategoryIds.length === categories.length;

    // 1. 카테고리 필터링 (체크박스 클릭 시 작동)
    const handleCategoryToggle = (categoryId) => {
        toggleCategoryFilter(categoryId);
    };

    // 2. 카테고리 수정 모달 열기 (항목 이름/색상 영역 클릭 시 작동)
    const handleCategoryClick = (category) => {
        if (category.isShared) return;
        setActiveCategory(category); 
        openCategoryModal();         
    };
    
    // 3. 새 캘린더 추가 버튼 핸들러
    const handleNewCategory = () => {
        setActiveCategory(null);
        openCategoryModal(); 
    }

    return (
        <div 
            className="calendar-sidebar p-3" 
            // 레이아웃 스타일
            style={{ 
                width: '250px', 
                borderRight: '1px solid #ccc', 
                minHeight: '100%',
                backgroundColor: '#f8f9fa' 
            }}
        >
            {/* 1. 미니 달력 자리 */}
            <div className="mb-4" style={{width:'100%'}}>
                <h4>미니 달력</h4>
                <MiniCalendar /> 
                <hr />
            </div>

            {/* 2. 캘린더 목록 (카테고리 필터) */}
            <div>
                <h5>내 캘린더 목록</h5>
                
                {/* ✨ 전체 선택/해제 체크박스 섹션 */}
                {categories.length > 0 && (
                    <div className="form-check list-group-item d-flex align-items-center p-2 mb-2" style={{ border: '1px dashed #ccc' }}>
                        <input
                            className="form-check-input me-2"
                            type="checkbox"
                            id="check-all"
                            checked={isAllActive} 
                            onChange={startToggleAllCategories} // 전체 토글 함수 호출
                            // 클릭 시 이벤트 전파 중단 불필요
                        />
                        <label 
                            htmlFor="check-all" 
                            className="form-check-label" 
                            style={{ flexGrow: 1, fontWeight: 'bold' }}
                        >
                            전체 캘린더 보기/숨기기
                        </label>
                    </div>
                )}
                
                <div className="list-group">
                    {categories.map((category, index) => {
                        // 🚨 수정: ID 통일. category.id나 category._id를 사용합니다.
                        const categoryId = getCategoryId(category); 
                        const isChecked = activeCategoryIds.includes(categoryId);

                        return (
                        <div 
                            key={categoryId} // ID를 key로 사용
                            className="form-check list-group-item d-flex align-items-center p-2"
                            style={{ cursor: 'pointer', border: 'none' }}
                        >
                            {/* Input의 onChange는 필터링 토글만 담당 */}
                            <input
                                className="form-check-input me-2"
                                type="checkbox"
                                id={`check-${categoryId}`}
                                checked={isChecked} // isChecked 상태 사용
                                onChange={() => handleCategoryToggle(categoryId)} // 🚨 수정: 통일된 categoryId 전달
                                onClick={(e) => e.stopPropagation()}                             
                            />
                            
                            {/* Label에 모달 열기 이벤트 연결 (수정 모드 진입) */}
                            <label 
                                // 🚨 수정: 클릭 시 모달만 열고 체크박스 토글 방지
                                onClick={(e) => {
                                    e.preventDefault(); 
                                    e.stopPropagation(); 
                                    handleCategoryClick(category); 
                                }}
                                className="form-check-label" 
                                htmlFor={`check-${categoryId}`}
                                style={{
                                    color: category.color, 
                                    // 🚨 수정: 체크 상태에 따라 스타일 변경
                                    textDecoration: isChecked ? 'none' : 'line-through',
                                    opacity: isChecked ? 1 : 0.6,
                                    fontWeight: 'bold',
                                    flexGrow: 1 
                                }}
                            >
                                {category.name}
                                {category.isShared && (
                                <small className="text-muted ms-2 fw-normal">
                                (공유됨 - {category.shareRole === 'editor' ? '수정 가능' : '보기 전용'})
                                </small>
                )}
                                </label>
                                
                            {/* 카테고리 색상 표시 */}
                            <span 
                                style={{
                                    width: '10px',
                                    height: '10px',
                                    borderRadius: '50%',
                                    backgroundColor: category.color
                                }}
                            ></span>
                        </div>
                    );
                })}
                </div>
                {categories.length === 0 && (
                    <p className="text-muted mt-2">로딩 중이거나 카테고리가 없습니다.</p>
                )}
            </div>
            
            <hr />

            {/* 3. 새 캘린더 추가 버튼 */}
            <div className="mt-4">
                <button 
                    className="btn btn-sm btn-outline-success w-100"
                    onClick={handleNewCategory} // 새 캘린더 추가 모달 열기
                >
                    + 새 캘린더 추가
                </button>
            </div>
        </div>
    );
}

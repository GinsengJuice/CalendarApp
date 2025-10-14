
import React from 'react';
import { useCalendarStore, useUiStore } from '../../hooks';
// 미니 캘린더는 나중에 추가 가능.
// import { MiniCalendar } from './MiniCalendar'; 

export const CalendarSidebar = () => {

    //필요한 상태와 함수를 훅에서 가져옴.
    const { categories, activeCategoryIds, toggleCategoryFilter } = useCalendarStore();
    const { openCategoryModal } = useUiStore();

    //카테고리 체크박스 클릭 핸들러
    const handleCategoryToggle = (categoryId) => {
        toggleCategoryFilter(categoryId);
    };

    const handleNewCategory = () => {
        openCategoryModal(); 
    }

    return (
        <div 
            className="calendar-sidebar p-3" 
            // 레이아웃을 위한 기본 스타일 
            style={{ 
                width: '250px', 
                borderRight: '1px solid #ccc', 
                minHeight: '100%',
                backgroundColor: '#f8f9fa' 
            }}
        >
            {/* 1. 미니 달력 자리 */}
            <div className="mb-4">
                <h4>Mini Calendar</h4>
                <hr />
            </div>

            {/* 2. 캘린더 목록 (카테고리 필터) */}
            <div>
                <h5>내 캘린더 목록</h5>
                <div className="list-group">
                    {categories.map(category => (
                        <div 
                            key={category.id} 
                            className="form-check list-group-item d-flex align-items-center p-2"
                            style={{ cursor: 'pointer', border: 'none' }}
                            onClick={() => handleCategoryToggle(category.id)}
                        >
                            <input
                                className="form-check-input me-2"
                                type="checkbox"
                                id={`check-${category.id}`}
                                // activeCategoryIds에 ID가 있는지 확인하여 체크 상태 설정
                                checked={activeCategoryIds.includes(category.id)} 
                                onChange={() => {}} 
                            />
                            <label 
                                className="form-check-label" 
                                htmlFor={`check-${category.id}`}
                                style={{
                                    color: category.color, // 카테고리 색상 적용
                                    textDecoration: activeCategoryIds.includes(category.id) ? 'none' : 'line-through', // 비활성화 시 줄 긋기
                                    opacity: activeCategoryIds.includes(category.id) ? 1 : 0.6,
                                    fontWeight: 'bold',
                                    flexGrow: 1 // 공간 채우기
                                }}
                            >
                                {category.name}
                            </label>
                            {/* 카테고리 색상을 작은 원으로 표시 */}
                            <span 
                                style={{
                                    width: '10px',
                                    height: '10px',
                                    borderRadius: '50%',
                                    backgroundColor: category.color
                                }}
                            ></span>
                        </div>
                    ))}
                </div>
                {categories.length === 0 && (
                    <p className="text-muted mt-2">로딩 중이거나 카테고리가 없습니다.</p>
                )}
            </div>
            
            <hr />

            {/* 3. 새 캘린더 추가 버튼 */}
            <div className="mt-4">
                <button className="btn btn-sm btn-outline-success w-100"
                        onClick={handleNewCategory}
                >
                    + 새 캘린더 추가
                </button>
            </div>
        </div>
    );
}
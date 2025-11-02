import { useDispatch , useSelector } from 'react-redux';
import Swal from 'sweetalert2';
import { convertEventsToDateEvents } from '../helpers'; // 경로 확인 필요
import {  
    onAddNewEvent, onDeleteEvent, onSetActiveEvent, onUpdateEvent, onLoadEvents, 
    onLoadCategories, onToggleCategory, onSetActiveCategory, onSetCurrentDate, 
    onSetActiveCategoryIds 
} from '../store'; 
import { calendarApi } from '../api';

// useUiStore의 closeDateModal 함수가 이곳에 없으므로, 해당 훅을 임포트하거나
// 함수를 인수로 받거나, 이 훅의 책임 범위 밖으로 분리해야 합니다.
// 현재는 모달 닫기 로직은 CalendarModal.jsx의 onSubmit에서 처리합니다.

export const useCalendarStore = () => {

    const dispatch = useDispatch();
    const { events, activeEvent, categories = [], activeCategoryIds, activeCategory, currentDate } = useSelector(state => state.calendar); 
    const { user } = useSelector(state => state.auth);
    
    const setActiveEvent = (calendarEvent) => {
        dispatch(onSetActiveEvent(calendarEvent));
    }

    // ---------------- 일정(Event) 관리 ----------------

    const startSavingEvent = async( calendarEvent ) => {
        try {
            if( calendarEvent.id ) {
                // 수정
                await calendarApi.put(`/events/${calendarEvent.id}`, calendarEvent);
                dispatch( onUpdateEvent({ ...calendarEvent }) );
                
            } else {
                // 생성
                const { data } = await calendarApi.post('/events', calendarEvent);
                
                // 서버에서 부여된 ID를 포함하여 새 이벤트 객체를 만듭니다.
                const newEvent = { 
                    ...calendarEvent, 
                    _id: data.evento._id,
                    id: data.evento._id // fullCalendar 호환을 위해 id도 추가 
                };
                
                // Redux Store에 새 이벤트를 추가합니다. (옵션: 아래 startLoadingEvents가 처리하므로 불필요할 수 있음)
                dispatch( onAddNewEvent(newEvent) ); 
            }
            
            // 🚀 핵심 수정: 일정 추가/수정 후 이벤트를 다시 로드하여 달력 화면을 업데이트합니다.
            // 이 호출이 없다면, 달력은 새 일정을 보여주지 않습니다.
            await startLoadingEvents();
            
            // 모달 닫기는 CalendarModal.jsx의 onSubmit 함수에서 처리하도록 합니다.
            
        } catch (error) {
            console.log(error);
            Swal.fire('저장 오류', error.response?.data?.msg || '일정 저장 중 오류가 발생했습니다.', 'error');
        }
    }

    const startDeletingEvent = async () => {
        try {
            await calendarApi.delete(`/events/${activeEvent.id}`);
            dispatch(onDeleteEvent());
        } catch (error) {
            console.log(error);
            // 한국어 현지화
            Swal.fire('삭제 오류', error.response?.data?.msg || '일정 삭제 중 오류가 발생했습니다.', 'error');
        }
    }

    const startLoadingEvents = async () => {
        try {
            const { data } = await calendarApi.get('/events');
            const events = convertEventsToDateEvents(data.eventos);
            dispatch(onLoadEvents(events));
        } catch (error) {
            // 한국어 현지화
            console.log('이벤트 로드 오류', error); 
        }
    }

    // ---------------- 카테고리(캘린더 목록) 관리 ----------------

    // 카테고리 저장 (생성/수정)
    const startSavingCategory = async(category) => {
        try {
            if (category.id) {
                // 수정
                await calendarApi.put(`/categories/${category.id}`, category);
            } else {
                // 생성
                const { data } = await calendarApi.post('/categories', category);
                category.id = data.category._id; // 서버에서 받은 ID 설정 (_id 사용)
            }
            // 로컬 스토어 업데이트
            await startLoadingCategories();
        } catch (error) {
            console.log(error);
            Swal.fire('오류', error.response?.data?.msg || '카테고리 저장 중 오류', 'error');
        }
    }

    // 카테고리 삭제
    const startDeletingCategory = async () => {
        // 백엔드에서 _id를 사용하는 것이 일반적이므로 activeCategory._id를 사용합니다.
        const categoryId = activeCategory?._id; 
        if (!activeCategory || !categoryId) return;
        try {
            await calendarApi.delete(`/categories/${categoryId}`);
            // 삭제 후 목록 새로고침
            await startLoadingCategories();
        } catch (error) {
            console.log(error);
            Swal.fire('오류', error.response?.data?.msg || '카테고리 삭제 중 오류', 'error');
        }
    }
    
    // 전체 카테고리 필터링 토글 기능
    const startToggleAllCategories = () => {
        const allCategoryIds = categories.map(cat => cat._id);
        const shouldDeactivateAll = activeCategoryIds.length === allCategoryIds.length;
        
        if ( shouldDeactivateAll ) {
            dispatch( onSetActiveCategoryIds([]) );
        } else {
            dispatch( onSetActiveCategoryIds(allCategoryIds) );
        }
    }


    const toggleCategoryFilter = (categoryId) => { 
        dispatch(onToggleCategory(categoryId));
    }

    const setActiveCategory = (category) => {
        dispatch(onSetActiveCategory(category));
    }

    const startLoadingCategories = async () => {
        try {
            const { data } = await calendarApi.get('/categories');
            dispatch(onLoadCategories(data.categories));
        } catch (error) {
            // 한국어 현지화
            console.log('카테고리 로드 오류', error); 
        }
    }

    // ---------------- 캘린더 공유 ----------------
    const startSharingCalendar = async(calendarId, invitedEmail, role) => {
        try {
            await calendarApi.post('/share', { calendarId, invitedEmail, role });
            Swal.fire('공유 성공', `[${invitedEmail}]님에게 캘린더 공유가 완료되었습니다.`, 'success');
        } catch (error) {
            console.log(error);
            // 한국어 현지화
            Swal.fire('공유 실패', error.response?.data?.msg || '공유 요청 중 오류 발생', 'error');
        }
    }

    // ---------------- 현재 날짜 설정 ----------------
    const startSettingCurrentDate = (date) => {
        dispatch(onSetCurrentDate(date));
    }

    return {
        //* 상태
        activeEvent,
        events,
        categories,
        activeCategoryIds,
        activeCategory,
        currentDate,
        hasEventSelected: !!activeEvent,

        startDeletingEvent,
        setActiveEvent,
        setActiveCategory,
        startSavingEvent,
        startLoadingEvents,
        startLoadingCategories,
        startSharingCalendar,
        startSettingCurrentDate,
        startSavingCategory,
        startDeletingCategory,
        toggleCategoryFilter,
        startToggleAllCategories, 
    }
}
import { createSlice } from '@reduxjs/toolkit';

export const calendarSlice = createSlice({
    name: 'calendar',
    initialState: {
        isLoadingEvents: true,
        events: [],
        activeEvent: null,
        categories: [], 
        isLoadingCategories: true,
        activeCategoryIds: [],
        activeCategory: null,
        currentDate: new Date(),
    },
    reducers: {
        onSetActiveEvent: ( state, { payload }) => {
            state.activeEvent = payload;
        },
        onAddNewEvent: ( state, { payload }) => {
            state.events.push( payload );
            state.activeEvent = null;
        },
        onUpdateEvent: ( state, { payload } ) => {
            state.events = state.events.map( event => {
                if ( event.id === payload.id ) {
                    return payload;
                }

                return event;
            });
        },
        onDeleteEvent: ( state ) => {
            if ( state.activeEvent ) {
                state.events = state.events.filter( event => event.id !== state.activeEvent.id );
                state.activeEvent = null;
            }
        },
        onLoadEvents: (state, { payload = [] }) => {
            state.isLoadingEvents = false;
            // 이전에 중복으로 쌓이지 않도록 state.events를 초기화합니다.
            state.events = []; 
            payload.forEach( event => {
                const exists = state.events.some( dbEvent => dbEvent.id === event.id );
                if ( !exists ) {
                    state.events.push( event )
                }
            })
        },
        
        onLoadCategories: (state, { payload = [] }) => {
            state.isLoadingCategories = false;
            state.categories = payload;
            // 🚨 수정: 카테고리 로드 시 _id를 사용하여 필터링 ID 목록을 채웁니다.
            state.activeCategoryIds = payload.map(cat => cat._id); 
        },

        onToggleCategory: (state, { payload: categoryId }) => {
            const isIdActive = state.activeCategoryIds.includes(categoryId);

            if (isIdActive) {
                state.activeCategoryIds = state.activeCategoryIds.filter(id => id !== categoryId);
            } else {
                state.activeCategoryIds = [...state.activeCategoryIds, categoryId]; 
            }
        },

        onSetActiveCategory: ( state, { payload }) => {
            state.activeCategory = payload;
        },

        onSetCurrentDate: (state, { payload }) => {
            state.currentDate = payload;
        },
        
        onLogoutCalendar: ( state ) => {
            state.isLoadingEvents = true,
            state.events      = []
            state.activeEvent = null,
            state.currentDate = new Date(), // 로그아웃 시 현재 날짜 초기화
            state.categories = [],
            state.activeCategoryIds = [];
            state.isLoadingCategories = true
        },
        onSetActiveCategoryIds: (state, action) => {
            state.activeCategoryIds = action.payload; 
        },
    }
});

export const { 
    onSetActiveEvent,
    onAddNewEvent, 
    onUpdateEvent, 
    onDeleteEvent,
    onLoadEvents,
    onLoadCategories,
    onToggleCategory, 
    onSetActiveCategory,
    onLogoutCalendar,
    onSetCurrentDate,
    onSetActiveCategoryIds
} = calendarSlice.actions;

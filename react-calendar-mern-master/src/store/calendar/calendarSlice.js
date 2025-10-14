import { createSlice } from '@reduxjs/toolkit';

/*
import { addHours } from 'date-fns';
 const tempEvent =   {
    _id: new Date().getTime(),
    title: 'Cumpleaños del Jefe',
    notes: 'Hay que comprar el pastel',
    start: new Date(),
    end: addHours( new Date(), 2 ),
    bgColor: '#fafafa',
    user: {
      _id: '123',
      name: 'Fernando'
    }
}; */


export const calendarSlice = createSlice({
    name: 'calendar',
    initialState: {
        isLoadingEvents: true,
        events: [
            //tempEvent
        ],
        activeEvent: null,
        categories: [], 
        isLoadingCategories: true, // 카테고리 로딩 상태
        activeCategoryIds: [],
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
            // state.events = payload;
            payload.forEach( event => {
                const exists = state.events.some( dbEvent => dbEvent.id === event.id );
                if ( !exists ) {
                    state.events.push( event )
                }
            })
        },
        //  카테고리 목록을 저장하는 새 리듀서
        onLoadCategories: (state, { payload = [] }) => {
            state.isLoadingCategories = false;
            state.categories = payload;
            state.activeCategoryIds = payload.map(cat => cat.id); 
        },

        onToggleCategory: (state, { payload: categoryId }) => {
            if (state.activeCategoryIds.includes(categoryId)) {
                // 이미 활성화된 경우: 목록에서 제거 (비활성화)
                state.activeCategoryIds = state.activeCategoryIds.filter(id => id !== categoryId);
            } else {
                // 비활성화된 경우: 목록에 추가 (활성화)
                state.activeCategoryIds.push(categoryId);
            }
        },

        onLogoutCalendar: ( state ) => {
            state.isLoadingEvents = true,
            state.events      = []
            state.activeEvent = null,
            // 로그아웃 시 카테고리도 초기화
            state.categories = [],
            state.activeCategoryIds = [];
            state.isLoadingCategories = true
        }
    }
});


// Action creators are generated for each case reducer function
export const { 
    onSetActiveEvent,
     onAddNewEvent, 
     onUpdateEvent, 
     onDeleteEvent,
     onLoadEvents,
    onLoadCategories,
    onToggleCategory, 
     onLogoutCalendar
     } = calendarSlice.actions;
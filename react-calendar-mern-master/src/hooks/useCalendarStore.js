import { useDispatch , useSelector } from 'react-redux';
import Swal from 'sweetalert2';
import { convertEventsToDateEvents } from '../helpers';
import {  onAddNewEvent , onDeleteEvent, onSetActiveEvent, onUpdateEvent, onLoadEvents, onLoadCategories, onToggleCategory } from '../store';
import { calendarApi } from '../api';

export const useCalendarStore = () => {
  
    const dispatch = useDispatch();
    const { events, activeEvent, categories, activeCategoryIds } = useSelector( state => state.calendar ); 
    const { user } = useSelector( state => state.auth );

    const setActiveEvent = ( calendarEvent ) => {
        dispatch( onSetActiveEvent( calendarEvent ) )
    } 

    const startSavingEvent = async( calendarEvent ) => {
        // TODO: Update evenet

        try {
                // Todo bien
            if( calendarEvent.id ) {
                // Actualizando
                await calendarApi.put(`/events/${ calendarEvent.id }`, calendarEvent );
                dispatch( onUpdateEvent({ ...calendarEvent }) );
                return;
            } 
                // Creando
                const { data } = await calendarApi.post('/events', calendarEvent );
                dispatch( onAddNewEvent({ ...calendarEvent, id: data.evento.id, user }) );
            
        } catch (error) {
            console.log(error);
            Swal.fire('Error al guardar', error.response.data.msg, 'error');
            
        }
        
        
    }

    const startDeletingEvent = async () => {
       // Todo: Llegar al backend
       try {
        await calendarApi.delete(`/events/${ activeEvent.id }` );
        dispatch( onDeleteEvent() );
    } catch (error) {
        console.log(error);
        Swal.fire('Error al eliminar', error.response.data.msg, 'error');
    }
    }
    

    const startLoadingEvents = async() => {
        try {
            
            const { data } = await calendarApi.get('/events');
            const events = convertEventsToDateEvents( data.eventos );          
            dispatch( onLoadEvents( events ) );


        } catch (error) {
          console.log('Error cargando eventos');
          console.log(error)
        }
    }

    const toggleCategoryFilter = ( categoryId ) => {
        dispatch( onToggleCategory( categoryId ) );
    }
    
    const startLoadingCategories = async() => {
    try {
        // 백엔드 API의 '/categories' 엔드포인트 호출
        const { data } = await calendarApi.get('/categories'); 
        
        // 서버에서 받은 categories 데이터를 Redux Store에 디스패치
        dispatch( onLoadCategories( data.categories ) ); 

    } catch (error) {
        console.log('Error al cargar categorias');
        console.log(error);
    }
}

    //새 카테고리를 저장하고 목록을 업데이트하는 함수
    const startSavingCategory = async( category ) => {
        try {
            // POST 요청: 백엔드의 /api/categories 라우트 호출
            const { data } = await calendarApi.post('/categories', category);
            
            // 저장 성공 시: 카테고리 목록 전체를 다시 불러옴.
            await startLoadingCategories(); 

            Swal.fire('성공', '새 캘린더가 추가되었습니다.', 'success');
            
        } catch (error) {
            console.log(error);
            Swal.fire('오류', error.response.data.msg || '카테고리 저장 중 오류 발생', 'error');
        }
    }

    return {
        //* Propiedades
        activeEvent,
        events,
        categories,
        activeCategoryIds,  
        hasEventSelected: !!activeEvent,

        //* Métodos
        startDeletingEvent,
        setActiveEvent,
        startSavingEvent,
        startLoadingEvents,
        startLoadingCategories,
        toggleCategoryFilter, 
        startSavingCategory, 
    }
}
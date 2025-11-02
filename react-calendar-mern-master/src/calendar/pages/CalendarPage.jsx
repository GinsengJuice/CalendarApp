import { useState, useEffect  } from 'react';
import { Calendar } from 'react-big-calendar'
import 'react-big-calendar/lib/css/react-big-calendar.css';


import { Navbar, CalendarEvent, CalendarModal, FabAddNew , FabDelete, CategoryModal} from '../';

import { localizer , getMessagesKO } from '../../helpers';
import { CalendarSidebar } from '../components/CalendarSidebar';
import { useUiStore, useCalendarStore, useAuthStore  } from '../../hooks';


export const CalendarPage = () => {

  const { user } = useAuthStore();
  const { openDateModal} = useUiStore();
  const { events, setActiveEvent, startLoadingEvents, startLoadingCategories, activeCategoryIds } = useCalendarStore();
  const [ lastView, setLastView ] = useState(localStorage.getItem('lastView') || 'week' );

  // 필터링된 이벤트 목록 생성
  const filteredEvents = events.filter(event => 
        activeCategoryIds.includes(event.calendarId)
  );

  const eventStyleGetter = ( event, start, end, isSelected ) => {
    const backgroundColor = event.calendarColor 
        ? event.calendarColor // DB에서 색상이 있다면 그걸 사용
        : '#347CF7';          // 없다면 기존 기본색 사용

  
    const style = {
      backgroundColor: backgroundColor, // 동적으로 계산된 색상 적용
      borderRadius: '0px',
      opacity: 0.8,
      color: 'white'
    }
  
    return {
      style
    }
  }
  
  const onDoubleClick = ( event ) => {
     console.log({ doubleClick: event });
    openDateModal();
  }
  
  const onSelect = ( event ) => {
     console.log({ click: event });
    setActiveEvent( event );
  }
  
  const onViewChanged = ( event ) => {
   // console.log({ viewChanged: event });
     localStorage.setItem('lastView', event );
    setLastView( event )
  }

  useEffect(() => {
    startLoadingEvents();
    startLoadingCategories(); 
  }, [])


  return (
    <>
      <Navbar />
     <div className="d-flex flex-grow-1" style={{ height: 'calc(100vh - 56px)' }}> 
          
          <CalendarSidebar /> 
          
          <div className="flex-grow-1"> 
              <Calendar
                  culture='ko' 
                  localizer={localizer}
                  events={filteredEvents} // 필터링된 이벤트 사용 
                  defaultView={ lastView }
                  startAccessor="start"
                  endAccessor="end"
                  style={{ height: '100%' }} 
                  messages={ getMessagesKO()} 
                  eventPropGetter={ eventStyleGetter }
                  components={{
                      event: CalendarEvent
                  }}
                  onDoubleClickEvent={ onDoubleClick }
                  onSelectEvent={ onSelect }
                  onView={ onViewChanged }
              />
          </div>

      </div>
    <CalendarModal/>
    <CategoryModal/>
    <FabAddNew/>
    <FabDelete/>
    </>
  )
}

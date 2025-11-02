import { useState, useEffect  } from 'react';
import { Calendar } from 'react-big-calendar'
import 'react-big-calendar/lib/css/react-big-calendar.css';


// ✨ 수정: ShareModal 임포트 추가
import { Navbar, CalendarEvent, CalendarModal, FabAddNew , FabDelete, CategoryModal, ShareModal} from '../'; 

import { localizer , getMessagesKO } from '../../helpers';
import { CalendarSidebar } from '../components/CalendarSidebar';
// ✨ useCalendarStore에서 activeCategory를 가져오도록 수정
import { useUiStore, useCalendarStore, useAuthStore  } from '../../hooks'; 


export const CalendarPage = () => {

  const { user } = useAuthStore();
  const { openDateModal} = useUiStore();
  const { 
    events, 
    setActiveEvent, 
    startLoadingEvents, 
    startLoadingCategories, 
    activeCategoryIds, 
    currentDate, 
    startSettingCurrentDate,
    activeCategory // ✨ activeCategory 상태를 가져옵니다.
} = useCalendarStore();

  const [ lastView, setLastView ] = useState(localStorage.getItem('lastView') || 'week' );

  // 🚨 수정: 필터링 로직을 유연하게 만듭니다. event.calendarId가 객체일 수도, 문자열 ID일 수도 있습니다.
  const filteredEvents = events.filter(event => {
      // calendarId가 객체일 경우 (_id 속성 접근), 문자열일 경우 그대로 사용
      const eventCategoryId = event.calendarId?._id || event.calendarId;
      return activeCategoryIds.includes(eventCategoryId);
  });

  const eventStyleGetter = ( event, start, end, isSelected ) => {
    // 🚨 수정: calendarColor가 객체 안에 있을 경우를 대비해 처리합니다.
    const backgroundColor = event.calendarColor 
        ? event.calendarColor 
        : '#347CF7';          

  
    const style = {
      backgroundColor: backgroundColor, 
      borderRadius: '0px',
      opacity: 0.8,
      color: 'white'
    }
  
    return {
      style
    }
  }
  
const onNavigate = ( newDate ) => {
        startSettingCurrentDate(newDate);
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
                  date={currentDate}
                  onNavigate={onNavigate} 
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

    {/* ✨ ShareModal 렌더링: activeCategory가 있을 때만 렌더링하고, 해당 정보를 prop으로 전달 */}
    { activeCategory && (
        <ShareModal selectedCalendar={activeCategory} />
    )}
    </>
  )
}

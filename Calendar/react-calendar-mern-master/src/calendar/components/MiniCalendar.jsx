
import React from 'react';
import DatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css'; 
import ko from 'date-fns/locale/ko'; 
import { useCalendarStore } from '../../hooks'; // 경로 확인 필요

// date-fns의 한국어 로케일 등록
registerLocale( 'ko', ko);

export const MiniCalendar = () => {

    // useCalendarStore에서 현재 날짜 상태와 날짜 변경 함수를 가져옵니다.
    const { currentDate, startSettingCurrentDate } = useCalendarStore();

    // 사용자가 미니 달력에서 날짜를 선택했을 때 실행되는 핸들러
    const onDateChange = (date) => {
        if (date) {
            // 선택된 날짜로 Redux 상태를 업데이트합니다. (메인 캘린더 시점 변경)
            startSettingCurrentDate(date); 
        }
    }

    return (
        <div className="mini-calendar-wrapper">
            <DatePicker
                selected={currentDate} // Redux 상태의 날짜 표시
                onChange={onDateChange} // 날짜 변경 핸들러 연결
                inline // 캘린더를 인라인으로 항상 보이게 함
                locale="ko" // 한국어 지역화 적용
                dateFormat="yyyy/MM/dd" 
                calendarClassName="mini-calendar-custom" // 커스텀 CSS 클래스
            />
        </div>
    );
}
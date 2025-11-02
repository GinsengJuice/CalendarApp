import { useMemo, useState, useEffect } from 'react';
import { addHours, differenceInSeconds } from 'date-fns';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import Modal from 'react-modal';
import DatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useCalendarStore, useUiStore } from '../../hooks';
import ko from 'date-fns/locale/ko';

registerLocale('ko', ko);

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

// 초기 폼 상태를 반환하는 헬퍼 함수
const getInitialFormValues = (categories) => {
    // 💡 수정 1: categories가 비어있을 경우를 대비하여 ID와 Color를 처리합니다.
    const defaultCategoryId = categories.length > 0 ? categories[0]._id : '';
    const defaultCategoryColor = categories.length > 0 ? categories[0].color : '#007bff';

    return {
        title: '',
        notes: '',
        start: new Date(),
        end: addHours(new Date(), 2),
        calendarColor: defaultCategoryColor,
        calendarId: defaultCategoryId,
    };
};


export const CalendarModal = () => {
    const { isDateModalOpen, closeDateModal } = useUiStore();
    // activeEvent와 categories를 사용합니다.
    const { activeEvent, startSavingEvent, categories } = useCalendarStore();

    // 💡 수정 2: categories가 로드된 후 첫 번째 카테고리를 저장합니다.
    // MongoDB ID는 일반적으로 _id 필드에 있으므로, _id를 사용합니다.
    const initialCategoryData = useMemo(() => {
        if (categories.length === 0) {
            return { _id: 'temp_id', color: '#007bff', name: '임시 기본' };
        }
        // 첫 번째 카테고리를 기본값으로 사용
        return categories[0];
    }, [categories]);

    const [formSubmitted, setFormSubmitted] = useState(false);
    
    // 💡 수정 3: useState 초기화 시 initialCategoryData가 아닌 getInitialFormValues를 사용합니다.
    const [formValues, setFormValues] = useState(getInitialFormValues(categories));
    
    // 제목 유효성 클래스
    const titleClass = useMemo(() => {
        if (!formSubmitted) return '';
        return formValues.title.trim().length > 0 ? '' : 'is-invalid';
    }, [formValues.title, formSubmitted]);

    // activeEvent 변경 및 카테고리 로드 시 폼 값 설정
    useEffect(() => {
        // 💡 수정 4: 카테고리가 로드되지 않았다면 아무것도 하지 않습니다. (초기 로딩 시점 처리)
        if (categories.length === 0 && activeEvent === null) return;
        
        if (activeEvent !== null) {
            // 수정 모드: activeEvent의 calendarId를 기준으로 카테고리를 찾습니다.
            // activeEvent.calendarId는 이벤트 객체에 저장된 _id 값입니다.
            const eventCategory = categories.find(cat => cat._id === activeEvent.calendarId);

            setFormValues({
                // activeEvent의 모든 속성 복사 (start, end, title, notes, id 등)
                ...activeEvent, 
                // DB에서 받아온 _id를 calendarId로 사용합니다. (이벤트 모델에 따라 calendarId로 저장되었다고 가정)
                calendarId: activeEvent.calendarId || initialCategoryData._id,
                // 찾은 카테고리 색상 적용
                calendarColor: eventCategory ? eventCategory.color : initialCategoryData.color,
            });
        } else {
            // 새 이벤트 생성 모드: 로드된 첫 번째 카테고리를 기본값으로 설정
            const initialValues = getInitialFormValues(categories);
            setFormValues(initialValues);
        }
    }, [activeEvent, categories, initialCategoryData]); // 의존성 배열에 initialCategoryData 추가

    // 입력값 변경
    const onInputChanged = ({ target }) => {
        const newValue = target.value;
        const name = target.name;

        if (name === 'calendarId') {
            // 💡 수정 5: 카테고리 ID(_id)를 기준으로 카테고리를 찾습니다.
            const selectedCategory = categories.find(cat => cat._id === newValue);
            let newColor = selectedCategory ? selectedCategory.color : formValues.calendarColor;
            
            setFormValues(prev => ({
                ...prev,
                calendarColor: newColor, 
                [name]: newValue  
            }));
            return;
        }

        setFormValues(prev => ({
            ...prev,
            [name]: newValue,
        }));
    };

    // 날짜 변경
    const onDateChanged = (date, field) => {
        setFormValues(prev => ({
            ...prev,
            [field]: date,
        }));
    };

    // 모달 닫기
    const onCloseModal = () => {
        closeDateModal();
        setFormSubmitted(false);
        // 💡 수정 6: 모달 닫을 때, 로드된 최신 카테고리를 기준으로 초기화
        setFormValues(getInitialFormValues(categories)); 
    };

    // 폼 제출
    const onSubmit = async event => {
        event.preventDefault();
        setFormSubmitted(true);

        // 💡 수정 7: categories가 로드되었음에도 calendarId가 없다면, 유효성 검사
        if (categories.length > 0 && !formValues.calendarId) {
            Swal.fire('경고', '캘린더를 선택해 주세요.', 'error');
            return;
        }
        
        // 💡 주의: categories가 로드되지 않은 상태(length === 0)에서 저장을 시도하면 
        // calendarId가 빈 문자열('')일 수 있으나, 이 경우 백엔드에서 에러 발생 예상

        // 제목 공백 검사
        if (formValues.title.trim().length === 0) {
            Swal.fire('경고', '제목을 입력해주세요', 'error');
            return;
        }

        // 날짜 검사
        const difference = differenceInSeconds(formValues.end, formValues.start);
        if (isNaN(difference) || difference <= 0) {
            Swal.fire('잘못된 날짜', '입력된 날짜를 다시 확인해 주세요.', 'error');
            return;
        }

        await startSavingEvent(formValues);
        onCloseModal();
    };

    return (
        <Modal
            isOpen={isDateModalOpen}
            onRequestClose={onCloseModal}
            style={customStyles}
            className="modal"
            overlayClassName="modal-fondo"
            closeTimeoutMS={200}
        >
            <h1>{activeEvent ? '이벤트 수정' : '새 이벤트'}</h1>
            <hr />
            <form className="container" onSubmit={onSubmit}>
                {/* 시작 날짜 */}
                <div className="form-group mb-2">
                    <label>시작 날짜 및 시간</label>
                    <DatePicker
                        selected={formValues.start}
                        onChange={date => onDateChanged(date, 'start')}
                        className="form-control"
                        dateFormat="Pp"
                        showTimeSelect
                        locale="ko"
                        timeCaption="시간"
                    />
                </div>

                {/* 종료 날짜 */}
                <div className="form-group mb-2">
                    <label>종료 날짜 및 시간</label>
                    <DatePicker
                        minDate={formValues.start}
                        selected={formValues.end}
                        onChange={date => onDateChanged(date, 'end')}
                        className="form-control"
                        dateFormat="Pp"
                        showTimeSelect
                        locale="ko"
                        timeCaption="시간"
                    />
                </div>

                {/* 카테고리 선택 */}
                <div className="form-group mb-2">
                    <label>캘린더 목록</label>
                    {/* 💡 categories가 로드되면 선택 상자를 표시합니다. */}
                    {categories.length === 0 ? (
                        <p className="form-text text-danger">⚠️ 카테고리 목록을 로드할 수 없습니다. 새 카테고리를 먼저 생성해주세요.</p>
                    ) : (
                        <select
                            className="form-control"
                            name="calendarId"
                            value={formValues.calendarId}
                            onChange={onInputChanged}
                        >
                            {categories.map((cat) => (
                                <option 
                                    key={cat._id} 
                                    value={cat._id} // 💡 핵심 수정: MongoDB ID인 `_id`를 값으로 사용합니다.
                                >
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    )}
                </div>

                {/* 색상 미리보기 */}
                <div className="form-group mb-2">
                    <label>이벤트 색상 미리보기</label>
                    <div
                        style={{
                            height: '38px',
                            borderRadius: '4px',
                            backgroundColor: formValues.calendarColor,
                            border: '1px solid #ced4da',
                            display: 'flex',
                            alignItems: 'center',
                            paddingLeft: '10px',
                        }}
                    >
                        <small style={{ color: 'white', textShadow: '1px 1px 2px black' }}>
                            현재 색상: {formValues.calendarColor}
                        </small>
                    </div>
                </div>

                {/* 제목 */}
                <div className="form-group mb-2">
                    <label>제목</label>
                    <input
                        type="text"
                        className={`form-control ${titleClass}`}
                        placeholder="이벤트 제목"
                        name="title"
                        autoComplete="off"
                        value={formValues.title}
                        onChange={onInputChanged}
                    />
                    <small className="form-text text-muted">간단한 설명</small>
                </div>

                {/* 메모 */}
                <div className="form-group mb-2">
                    <textarea
                        className="form-control"
                        placeholder="상세 메모"
                        rows="5"
                        name="notes"
                        value={formValues.notes}
                        onChange={onInputChanged}
                    ></textarea>
                    <small className="form-text text-muted">추가 정보</small>
                </div>

                {/* 저장 버튼 */}
                <button type="submit" className="btn btn-outline-primary btn-block">
                    <i className="far fa-save"></i>
                    <span> 저장</span>
                </button>
            </form>
        </Modal>
    );
};
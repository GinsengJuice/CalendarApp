
import {useMemo, useState, useEffect} from 'react';
import { addHours, differenceInSeconds } from 'date-fns';

import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

import Modal from 'react-modal';

import DatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import { useCalendarStore , useUiStore } from '../../hooks';

import ko from 'date-fns/locale/ko';
registerLocale( 'ko', ko);

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



export const CalendarModal = () => {

    const  { isDateModalOpen , closeDateModal} =  useUiStore();

    const { activeEvent , startSavingEvent , categories } = useCalendarStore();
    

    const defaultCategory = { id: 'default', color: '#007bff' };
    const initialCategory = categories.length > 0 ? categories[0] : defaultCategory;
    
    const [ formSubmitted, setFormSubmitted ] = useState(false);

    const [formValues, setFormValues] = useState({
        title: '',
        notes: '',
        start: new Date(),
        end: addHours( new Date(), 2),
        calendarColor: initialCategory.color, 
        calendarId: initialCategory.id,
    });

    const titleClass = useMemo(() => {
        if ( !formSubmitted ) return '';

        return ( formValues.title.length > 0 )
            ? ''
            : 'is-invalid';

    }, [ formValues.title, formSubmitted ])


    useEffect(() => {
        if ( activeEvent !== null ) {
            setFormValues({ 
                ...activeEvent, 
                // activeEvent가 있을 때, calendarColor와 calendarId도 함께 설정
                calendarColor: activeEvent.calendarColor || initialCategory.color,
                calendarId: activeEvent.calendarId || initialCategory.id,
            });
        }    
        // categories를 종속성 배열에 추가하여, API로 카테고리가 로드될 때 formValues가 초기화
    }, [ activeEvent, categories ]); 


    // onInputChanged 함수 수정: 카테고리 변경 시 색상도 함께 업데이트
    const onInputChanged = ({ target }) => {
        let newColor = formValues.calendarColor;
        let newValue = target.value;

        // 카테고리 ID가 변경되면, 해당 카테고리의 색상도 함께 변경
        if (target.name === 'calendarId') {
            const selectedCategory = categories.find(cat => cat.id === target.value);
            if (selectedCategory) {
                newColor = selectedCategory.color;
            }
            // color와 id를 한 번에 업데이트
            setFormValues(prev => ({
                ...prev,
                calendarColor: newColor, 
                [target.name]: newValue
            }));
            return; 
        }
        
        // 기타 필드 변경 (title, notes 등)
        setFormValues({
            ...formValues,
            [target.name]: newValue
        });
    }

    const onDateChanged = ( event, changing ) => {
        setFormValues({
            ...formValues,
            [changing]: event
        })
    }

    const onCloseModal = () => {
        console.log('cerrando modal');
        closeDateModal();
    }

    const onSubmit = async( event ) => {
        event.preventDefault();
        setFormSubmitted(true);

        const difference = differenceInSeconds( formValues.end, formValues.start );
        
        if ( isNaN( difference ) || difference <= 0 ) {
            Swal.fire('Fechas incorrectas','Revisar las fechas ingresadas','error');
            console.log('Error en fechas');
            return;
        }

        if ( formValues.title.length <= 0 ) return;
        
        console.log(formValues);
        await startSavingEvent( formValues );
        closeDateModal();                   
        setFormSubmitted(false);

    }    

  return (
    <Modal  
        isOpen={ isDateModalOpen }
        onRequestClose={ onCloseModal }
        style={ customStyles }
        className="modal"
        overlayClassName="modal-fondo"
        closeTimeoutMS={200}
        
    >
        <h1> Nuevo evento </h1>
<hr />
<form className="container" onSubmit= {onSubmit}>

    <div className="form-group mb-2">
        <label>Fecha y hora inicio</label>
        <DatePicker
         selected={ formValues.start }
         onChange={ (event) => onDateChanged(event, 'start') }
         className="form-control"
         dateFormat="Pp"
         showTimeSelect
         locale="es"
         timeCaption="Hora"
        />
    </div>

    <div className="form-group mb-2">
        <label>Fecha y hora fin</label>
        <DatePicker
        minDate={ formValues.start }
        selected={ formValues.end}
         onChange={ (event) => onDateChanged(event, 'end') }
         className="form-control"
         dateFormat="Pp"
         showTimeSelect
         locale="ko"
         timeCaption="Hora"
        />
    </div>

    {/* 캘린더 카테고리 선택 */}
    <div className="form-group mb-2">
        <label>캘린더 목록 (카테고리 선택)</label>
        {/* API 로딩 중이거나 카테고리가 없을 경우를 대비하여 방어 코드 추가 */}
        {categories.length === 0 ? (
             <p className="form-text text-muted">카테고리 목록을 로드하는 중입니다...</p>
        ) : (
            <select
                className="form-control"
                name="calendarId"
                value={formValues.calendarId}
                onChange={onInputChanged}
            >
                {/* Redux Store에서 가져온 실제 카테고리 데이터를 반복 */}
                {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                        {cat.name}
                    </option>
                ))}
            </select>
        )}
    </div>

    {/* 색상 미리보기 (카테고리에 따라 자동 업데이트) */}
    {/* ========================================================= */}
    <div className="form-group mb-2">
        <label>이벤트 색상 미리보기</label>
        <div style={{
            height: '38px', 
            borderRadius: '4px', 
            // 선택된 캘린더 색상을 배경색으로 사용
            backgroundColor: formValues.calendarColor, 
            border: '1px solid #ced4da',
            display: 'flex',
            alignItems: 'center',
            paddingLeft: '10px'
        }}>
            <small style={{ color: 'white', textShadow: '1px 1px 2px black' }}>
                현재 색상: {formValues.calendarColor}
            </small>
        </div>
    </div>

    <hr />
    <div className="form-group mb-2">
        <label>Titulo y notas</label>
        <input 
            type="text" 
            className={`form-control ${ titleClass }`}
            placeholder="Título del evento"
            name="title"
            autoComplete="off"
            value={formValues.title}
            onChange={onInputChanged}
        />
        <small id="emailHelp" className="form-text text-muted">Una descripción corta</small>
    </div>

    <div className="form-group mb-2">
        <textarea 
            type="text" 
            className="form-control"
            placeholder="Notas"
            rows="5"
            name="notes"
            value={formValues.notes}
            onChange={onInputChanged}
        ></textarea>
        <small id="emailHelp" className="form-text text-muted">Información adicional</small>
    </div>

    <button
        type="submit"
        className="btn btn-outline-primary btn-block"
    >
        <i className="far fa-save"></i>
        <span> Guardar</span>
    </button>

</form>

    </Modal>
  )
}
// models/Evento.js (수정 후)

const { Schema, model } = require('mongoose');

const EventoSchema = Schema({

    title: {
        type: String,
        required: true
    },
    notes: {
        type: String,       
    },
    start: {
        type: Date,
        required: true
    },
    end: {
        type: Date,
        required: true
    },
    
    // 1. 이벤트 색상 정의
    calendarColor: { 
        type: String,
        default: '#007bff' 
    },
    
    //  2. calendarId 정의 수정 (카테고리 ID를 참조하도록 수정) 
    calendarId: { 
        type: Schema.Types.ObjectId, 
        ref: 'CalendarCategory',     
        required: true             
    },
    
    // 3. 소유자 필드는 하나만 유지
    user: { 
        type: Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    }
});

EventoSchema.method('toJSON', function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
});


module.exports = model('Evento', EventoSchema );
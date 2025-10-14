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
    user: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },
     calendarColor: { // 1. 캘린더에 표시될 이벤트의 색상 (예: #1E88E5)
        type: String,
        default: '#007bff' // 기본 색상 설정
    },
    calendarId: { // 2. 어떤 카테고리(캘린더 목록)에 속하는지 구분하는 ID
        type: String,
        default: 'default-calendar' // '내 캘린더'와 같이 기본 카테고리 ID 설정
    },
    // =========================================================

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

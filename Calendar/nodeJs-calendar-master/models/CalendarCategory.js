// models/CalendarCategory.js

const { Schema, model } = require('mongoose');

const CalendarCategorySchema = Schema({
    name: {
        type: String,
        required: true,
    },
    color: {
        type: String,
        required: true,
        default: '#007bff' // 카테고리 기본 색상 (예: 파란색)
    },
    user: { // 이 카테고리를 만든 사용자
        type: Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    }
});

CalendarCategorySchema.method('toJSON', function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id; 
    return object;
});

module.exports = model('CalendarCategory', CalendarCategorySchema );
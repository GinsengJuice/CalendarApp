
const { Schema, model } = require('mongoose');

const CalendarShareSchema = Schema({
    // 공유 대상이 되는 캘린더 (CalendarCategory 모델 참조)
    calendar: {
        type: Schema.Types.ObjectId,
        ref: 'CalendarCategory',
        required: true
    },
    // 초대받은 사용자 (Usuario 모델 참조)
    user: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },
    // 부여된 권한 (viewer: 보기 전용, editor: 수정 가능)
    role: {
        type: String,
        enum: ['viewer', 'editor'], 
        default: 'viewer',
        required: true
    },
    // 공유를 설정한 사용자 (관리자)
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    }
});

CalendarShareSchema.method('toJSON', function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
});

module.exports = model('CalendarShare', CalendarShareSchema );
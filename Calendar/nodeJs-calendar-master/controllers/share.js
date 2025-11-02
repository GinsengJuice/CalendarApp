
const { response } = require('express');
const Usuario = require('../models/Usuario'); // 사용자 모델
const CalendarShare = require('../models/CalendarShare'); // 공유 모델

const shareCalendar = async( req, res = response ) => {
    const { calendarId, invitedEmail, role } = req.body;
    
    try {
        // 1. 초대할 사용자(invitedEmail)가 존재하는지 확인
        const invitedUser = await Usuario.findOne({ email: invitedEmail });
        if (!invitedUser) {
            return res.status(404).json({
                ok: false,
                msg: '초대하려는 이메일 주소의 사용자를 찾을 수 없습니다.'
            });
        }

        // 2. 이미 공유된 상태인지 확인
        const exists = await CalendarShare.findOne({
            calendar: calendarId,
            user: invitedUser.id
        });

        if (exists) {
            return res.status(400).json({
                ok: false,
                msg: '이미 해당 캘린더가 이 사용자에게 공유되어 있습니다.'
            });
        }
        
        // 3. 새로운 공유 객체 생성 및 저장
        const calendarShare = new CalendarShare({
            calendar: calendarId,
            user: invitedUser.id, 
            role: role,           
            owner: req.uid        
        });

        const shareSaved = await calendarShare.save();

        res.json({
            ok: true,
            msg: `[${invitedEmail}]님에게 캘린더 공유가 완료되었습니다.`,
            share: shareSaved
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: '캘린더 공유 중 서버 오류가 발생했습니다.'
        });
    }
}

module.exports = {
    shareCalendar
}
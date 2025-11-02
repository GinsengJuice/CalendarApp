const { response } = require('express');
const Evento = require('../models/Evento');
const CalendarShare = require('../models/CalendarShare'); // ✨ CalendarShare 모델 임포트

const getEventos = async( req, res = response ) => {
    // 현재 사용자 ID
    const currentUserId = req.uid;

    try {
        // 1. 현재 사용자가 공유받은 모든 캘린더 ID를 찾습니다.
        // user 필드(초대받은 사용자)가 currentUserId와 일치하는 문서를 찾습니다.
        const sharedEntries = await CalendarShare.find({ user: currentUserId });

        // 공유받은 캘린더의 ID만 추출합니다.
        const sharedCalendarIds = sharedEntries.map(entry => entry.calendar);

        // 2. 이벤트 조회 조건을 정의합니다.
        // Evento.find({ $or: [조건1, 조건2] })
        const events = await Evento.find({
            $or: [
                // 조건 1: 사용자가 직접 소유한 이벤트
                { user: currentUserId },
                
                // 조건 2: 사용자가 공유받은 캘린더에 속한 이벤트
                { calendarId: { $in: sharedCalendarIds } } 
            ]
        })
        // 이벤트 생성자는 제외하고, 캘린더 정보를 populate 해야 합니다.
        // 하지만 Evento 모델에 'calendarId'만 있고 'user'만 populate 하는 것으로 보아, 
        // 일단 user 정보만 populate 합니다. (기존 로직 유지)
        .populate('user','name'); 

        res.json({
            ok: true,
            eventos: events // 변수명을 'eventos'로 통일 (기존 로직 유지)
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: '이벤트 조회 중 서버 오류가 발생했습니다.'
        });
    }
}


const crearEvento = async( req, res = response ) => {    
   
    const { user: reqUser, ...eventData } = req.body; 
    
    const evento = new Evento(eventData); // user 필드가 제거된 깨끗한 데이터로 객체 생성

    try {
        //  JWT 토큰에서 가져온 유효한 ID로 user 필드를 덮어쓰기
        evento.user = req.uid;
        
        const eventoGuardado = await evento.save();

        res.json({
            ok: true,
            evento: eventoGuardado
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            ok: false,
            msg: '이벤트 생성 오류가 발생했습니다.'
        });
    }
}

const actualizarEvento = async ( req, res = response ) => {   
    
    const eventoId = req.params.id;
    const uid = req.uid;
    
    try {

        const evento = await Evento.findById( eventoId );

        if ( !evento ) {
            return res.status(404).json({
                ok: false,
                msg: '해당 ID를 가진 이벤트가 존재하지 않습니다.'
            });
        }

        // --- ✨ 권한 확인 로직 (기존) ---
        const isOwner = evento.user.toString() === uid;

        if ( !isOwner ) {
            // 1. 소유자가 아닌 경우: 공유받은 편집 권한이 있는지 확인
            const calendarId = evento.calendarId; 
            
            const shareEntry = await CalendarShare.findOne({
                user: uid, // 현재 사용자
                calendar: calendarId, // 이벤트가 속한 캘린더
                role: 'editor' // 편집 권한이 있어야 함
            });

            // 2. 소유자도 아니고, 편집 권한도 없다면 거부
            if (!shareEntry) {
                return res.status(401).json({
                    ok: false,
                    msg: '이 이벤트를 수정할 권한이 없습니다.'
                });
            }
        }
        // --- 권한 확인 로직 종료 ---

        const nuevoEvento = {
            ...req.body,
            // 🚨 수정된 부분: 이벤트의 원 소유자 ID(evento.user)를 그대로 유지합니다.
            user: evento.user 
        }

        const eventoActualizado = await Evento.findByIdAndUpdate( eventoId, nuevoEvento, { new: true } );

        res.json({
            ok: true,
            evento: eventoActualizado
        });

        
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: '서버 오류가 발생했습니다. 관리자에게 문의하세요.'
        });
    }

}

const eliminarEvento = async( req, res = response ) => {    
 
    const eventoId = req.params.id;
    const uid = req.uid;

    try {

        const evento = await Evento.findById( eventoId );

        if ( !evento ) {
            return res.status(404).json({
                ok: false,
                msg: '해당 ID를 가진 이벤트가 존재하지 않습니다.'
            });
        }
        
        // --- ✨ 권한 확인 로직 (기존) ---
        const isOwner = evento.user.toString() === uid;

        if ( !isOwner ) {
            // 1. 소유자가 아닌 경우: 공유받은 편집 권한이 있는지 확인
            const calendarId = evento.calendarId; 
            
            const shareEntry = await CalendarShare.findOne({
                user: uid, // 현재 사용자
                calendar: calendarId, // 이벤트가 속한 캘린더
                role: 'editor' // 편집 권한이 있어야 함
            });

            // 2. 소유자도 아니고, 편집 권한도 없다면 거부
            if (!shareEntry) {
                return res.status(401).json({
                    ok: false,
                    msg: '이 이벤트를 삭제할 권한이 없습니다.'
                });
            }
        }
        // --- 권한 확인 로직 종료 ---


        await Evento.findByIdAndDelete( eventoId );

        res.json({ ok: true });

        
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: '서버 오류가 발생했습니다. 관리자에게 문의하세요.'
        });
    }
}

module.exports = {
    getEventos,
    crearEvento,
    actualizarEvento,
    eliminarEvento
}


const { Router } = require('express');
const { check } = require('express-validator');
const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar-jwt');
const { shareCalendar } = require('../controllers/share');

const router = Router();

// 모든 API는 JWT 검증을 거치도록 설정
router.use( validarJWT ); 

// 캘린더 공유(초대) API
router.post('/',
    [
        check('calendarId', '캘린더 ID는 필수입니다.').isMongoId(),
        check('invitedEmail', '유효한 이메일 주소가 필요합니다.').isEmail(),
        check('role', '유효한 권한이 필요합니다.').isIn(['viewer', 'editor']),
        validarCampos
    ],
    shareCalendar
);

module.exports = router;

const { Router } = require('express');
const { validarJWT } = require('../middlewares/validar-jwt');
const { getCategories, createCategory } = require('../controllers/categories');
const { check } = require('express-validator');
const { validarCampos } = require('../middlewares/validar-campos');

const router = Router();

// 모든 API는 JWT 검증을 거치도록 설정
router.use( validarJWT ); 

// 캘린더 카테고리 목록 조회
router.get('/', getCategories); 

// 새로운 캘린더 카테고리 생성 (색상과 이름 포함)
router.post('/',
    [
        check('name', '카테고리 이름은 필수입니다.').not().isEmpty(),
        check('color', '색상 코드는 필수입니다.').not().isEmpty(),
        validarCampos
    ],
    createCategory
);

module.exports = router;
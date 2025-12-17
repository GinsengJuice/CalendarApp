
const { Router } = require('express');
const { validarJWT } = require('../middlewares/validar-jwt'); // JWT 미들웨어 경로 확인
const { handleAIChat } = require('../controllers/aiController');

const router = Router();

router.post('/chat', validarJWT, handleAIChat); 

module.exports = router;
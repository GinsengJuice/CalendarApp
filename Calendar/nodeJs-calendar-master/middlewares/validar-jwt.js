const { response } = require('express');
const jwt = require('jsonwebtoken');

const validarJWT = ( req, res = response, next ) => {

    
    // OPTIONS 요청은 실제 데이터 요청 전의 보안 검사이므로 토큰 검증 없이 통과시킵니다.
    if (req.method === 'OPTIONS') {
        return next();
    }
   

    // x-token headers
    const token = req.header('x-token');

    if ( !token ) {
        return res.status(401).json({
            ok: false,
            msg: '요청 헤더에 토큰이 없습니다.' 
        });
    }

    try {
        
        // 토큰 검증 및 페이로드 추출
        const { uid, name } = jwt.verify(
            token,
            process.env.SECRET_JWT_SEED // 환경 변수를 사용하여 비밀 키 검증
        );

        // 검증 성공 시 요청 객체에 사용자 ID와 이름을 추가합니다.
        req.uid = uid;
        req.name = name;


    } catch (error) {
        return res.status(401).json({
            ok: false,
            msg: '유효하지 않은 토큰입니다.' 
        });
    }

    next();
}


module.exports = {
    validarJWT
}
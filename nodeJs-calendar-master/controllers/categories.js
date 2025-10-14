
const { response } = require('express');
const CalendarCategory = require('../models/CalendarCategory');

// 사용자 본인의 모든 카테고리 목록을 가져오는 함수
const getCategories = async( req, res = response ) => {
    
    // JWT에서 얻은 사용자 ID (req.uid)를 사용하여 해당 사용자의 카테고리만 가져옵니다.
    const categories = await CalendarCategory.find({ user: req.uid });

    res.json({
        ok: true,
        categories
    });
}

// 새로운 카테고리를 생성하는 함수 (예: 사용자가 '여행' 카테고리를 새로 만들 때)
const createCategory = async( req, res = response ) => {
    
    const category = new CalendarCategory( req.body );
    
    try {
        category.user = req.uid; // 카테고리 소유자를 현재 로그인된 사용자로 설정
        
        const categorySaved = await category.save();

        res.json({
            ok: true,
            category: categorySaved
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: '카테고리 생성 오류'
        });
    }
}

module.exports = {
    getCategories,
    createCategory
}
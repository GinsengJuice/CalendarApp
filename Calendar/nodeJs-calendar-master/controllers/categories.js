
const { response } = require('express');
const CalendarCategory = require('../models/CalendarCategory');
const Event = require('../models/Evento'); 
const CalendarShare = require('../models/CalendarShare');

// 사용자 본인의 모든 카테고리 목록을 가져오는 함수
const getCategories = async( req, res = response ) => {
    const uid = req.uid;

    try {
        const ownedCategories = await CalendarCategory.find({ user: uid });
        
        // CalendarShare 모델을 참조하는 로직에서 오류가 발생했을 가능성이 높습니다.
        const sharedEntries = await CalendarShare.find({ user: uid });
        
        const sharedCategoryIds = sharedEntries.map(entry => entry.calendar); 

        // 공유 받은 카테고리 객체 조회
        const sharedCategories = await CalendarCategory.find({ 
            _id: { $in: sharedCategoryIds },
            user: { $ne: uid } 
        });

        // 공유 캘린더 플래그 및 권한 추가 (오류 방지)
        const formattedSharedCategories = sharedCategories.map(cat => {
            const entry = sharedEntries.find(entry => entry.calendar.toString() === cat._id.toString());

            return {
                ...cat.toObject(),
                isShared: true, 
                shareRole: entry ? entry.role : 'viewer'
            };
        });
        
        const allCategories = [...ownedCategories.map(c => c.toObject()), ...formattedSharedCategories];

        res.json({ ok: true, categories: allCategories });
        
    } catch (error) {
        // 500 에러를 유발하는 로직 대신, 이 로그를 확인하여 원인을 찾습니다.
        console.log("CRITICAL ERROR IN getCategories:", error); 
        res.status(500).json({
            ok: false,
            msg: '카테고리 로드 중 서버 내부 오류가 발생했습니다. 로그를 확인하세요.'
        });
    }
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

const updateCategory = async( req, res = response ) => {
    
    // URL 파라미터에서 카테고리 ID를 가져옵니다. (PUT /api/categories/:id)
    const categoryId = req.params.id;
    const uid = req.uid; // 현재 로그인된 사용자 ID

    try {
        // 1. 수정하려는 카테고리가 존재하는지 확인
        const category = await CalendarCategory.findById( categoryId );

        if ( !category ) {
            return res.status(404).json({
                ok: false,
                msg: '수정하려는 캘린더 카테고리가 존재하지 않습니다.'
            });
        }
        
        // 2. 현재 로그인된 사용자가 카테고리의 소유자인지 확인 (보안)
        if ( category.user.toString() !== uid ) {
            return res.status(401).json({
                ok: false,
                msg: '해당 캘린더 카테고리를 수정할 권한이 없습니다.'
            });
        }

        // 3. 업데이트할 데이터 준비 (사용자 ID는 변경하지 않음)
        const newCategory = {
            ...req.body,
            user: uid // 소유자는 변경하지 않고 유지
        }

        // 4. DB 업데이트 및 결과 반환
        const categoryUpdated = await CalendarCategory.findByIdAndUpdate( 
            categoryId, 
            newCategory, 
            { new: true } // { new: true }를 사용하여 업데이트된 문서를 반환하도록 설정
        );

        res.json({
            ok: true,
            category: categoryUpdated
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: '카테고리 수정 오류'
        });
    }
}

const deleteCategory = async( req, res = response ) => {
    
    const categoryId = req.params.id; // URL 파라미터에서 ID 가져오기
    const uid = req.uid; // 현재 로그인된 사용자 ID

    try {
        // 1. 삭제하려는 카테고리가 존재하는지 확인
        const category = await CalendarCategory.findById( categoryId );

        if ( !category ) {
            return res.status(404).json({
                ok: false,
                msg: '삭제하려는 캘린더 카테고리가 존재하지 않습니다.'
            });
        }
        
        // 2. 현재 로그인된 사용자가 카테고리의 소유자인지 확인 (보안)
        if ( category.user.toString() !== uid ) {
            return res.status(401).json({
                ok: false,
                msg: '해당 캘린더 카테고리를 삭제할 권한이 없습니다.'
            });
        }

        // 3. DB에서 카테고리 삭제
        await CalendarCategory.findByIdAndDelete( categoryId );
        
        // 해당 카테고리의 모든 이벤트 삭제
        await Event.deleteMany({ calendarId: categoryId });

        res.json({
            ok: true,
            msg: '캘린더 카테고리와 관련된 이벤트가 성공적으로 삭제되었습니다.'
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: '카테고리 삭제 오류'
        });
    }
}

module.exports = {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
}
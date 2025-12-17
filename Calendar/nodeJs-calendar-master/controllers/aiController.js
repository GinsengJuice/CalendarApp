// controllers/aiController.js
require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const mongoose = require('mongoose'); 

//  모델 파일
const Event = require('../models/Evento'); 

//  새 키 (AIza...qdc) 유지
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// =======================================================
// 1. 실제 DB 연동 (종료시간 자동 계산 + 화면 표시 해결)
// =======================================================
const createCalendarEvent = async ({ title, startTime, endTime, userId }) => {
    console.log(`[Real-DB] 일정 생성 요청: ${title}, ${startTime} ~ ${endTime || '미지정'}`);
    
    try {
        // 1. 시작 시간 포맷팅
        const start = new Date(startTime);
        
        // [핵심 수정] 종료 시간(endTime)이 없으면 시작 시간 + 1시간으로 자동 설정
        let end;
        if (endTime) {
            end = new Date(endTime);
        } else {
            console.log(" 종료 시간이 없어서 1시간 뒤로 자동 설정합니다.");
            end = new Date(start.getTime() + (60 * 60 * 1000)); // 1시간 추가
        }

        const newEvent = new Event({
            title: title,
            start: start,
            end: end, //  이제 절대 비어있을 수 없음
            
            //  화면 표시를 위한 ID 변환 및 고정
            user: new mongoose.Types.ObjectId(userId),       
            calendarId: new mongoose.Types.ObjectId("6907636b6c4d370e4555fd06"), // 사용자님 캘린더 ID 고정
            
            calendarColor: "#007bff", 
            notes: "AI 생성 일정" 
        });

        await newEvent.save(); 
        console.log(`[Real-DB] 저장 성공! (ID: ${newEvent._id})`);

        return { 
            message: `"${title}" 일정이 ${startTime.substring(0, 10)} ${startTime.substring(11, 16)}부터 1시간 동안 잡혔습니다. (새로고침 해주세요)`
        };
    } catch (error) {
        console.error("DB 저장 에러:", error); 
        return { message: "일정은 만들었으나 DB 저장 형식 오류가 발생했습니다." };
    }
};

const getEventsByDate = async ({ startDate, endDate, userId }) => {
    try {
        const events = await Event.find({
            calendarId: new mongoose.Types.ObjectId("6907636b6c4d370e4555fd06"), // 조회할 때도 ID 고정
            start: { $gte: startDate, $lte: endDate }
        });

        if (events.length === 0) return { message: "일정이 없습니다." };

        return events.map(e => ({
            title: e.title,
            start: e.start,
            end: e.end
        }));
    } catch (error) {
        return { message: "조회 실패" };
    }
};

const availableFunctions = { createCalendarEvent, getEventsByDate };

// =======================================================
// 2. 도구 정의
// =======================================================
const tools = [{
    functionDeclarations: [
        {
            name: "createCalendarEvent",
            description: "일정을 생성합니다.",
            parameters: {
                type: "OBJECT",
                properties: {
                    title: { type: "STRING" },
                    startTime: { type: "STRING" },
                    endTime: { type: "STRING" },
                    userId: { type: "STRING" }
                },
                required: ["title", "startTime", "userId"] // endTime은 필수 아님 (코드에서 처리함)
            }
        },
        {
            name: "getEventsByDate",
            description: "일정을 조회합니다.",
            parameters: {
                type: "OBJECT",
                properties: {
                    startDate: { type: "STRING" },
                    endDate: { type: "STRING" },
                    userId: { type: "STRING" }
                },
                required: ["userId"]
            }
        }
    ]
}];

// =======================================================
// 3. 채팅 핸들러 (2.5-flash + 새 키 조합)
// =======================================================
const handleAIChat = async (req, res) => {
    const { message, userId, currentDateTime } = req.body; 

    if (!message || !userId || !currentDateTime) { 
         return res.status(400).json({ msg: '필수 정보 누락' });
    }

    try {
        // console.log(" AI 요청 시작...");
        const prompt = `
[System]
당신은 캘린더 비서입니다. 현재 시각: ${currentDateTime}.
사용자 ID(${userId})를 사용하여 함수를 호출하세요.
---
User: ${message}
`;

        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.5-flash", 
            tools: tools 
        });

        const chat = model.startChat({ history: [] });
        const result = await chat.sendMessage(prompt);
        const response = result.response;

        const functionCalls = response.functionCalls();

        if (functionCalls && functionCalls.length > 0) {
            const call = functionCalls[0];
            const { name, args } = call;

            if (availableFunctions[name]) {
                const functionResult = await availableFunctions[name](args);
                return res.json({ 
                    aiResponse: functionResult.message || "완료",
                    isFunctionCall: true 
                });
            }
        }

        return res.json({ 
            aiResponse: response.text(),
            isFunctionCall: false
        });

    } catch (error) {
        console.error('AI Error:', error);
        return res.status(500).json({ msg: 'AI 오류', error: error.message });
    }
};

module.exports = { handleAIChat };
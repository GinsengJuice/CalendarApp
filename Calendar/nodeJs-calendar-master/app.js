import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import calendarRoutes from "./routes/calendar.routes.js";
import eventRoutes from "./routes/events.js"; 
import categoryRoutes from "./routes/categories.js";

const app = express();
app.use(cors()); // 모든 도메인 허용 (테스트용)
app.use(express.json());

// MongoDB Atlas 연결
mongoose.connect(
  "mongodb+srv://sumin:T42%2A4KRrpwhejpB@cluster0.mongodb.net/calendarDB?retryWrites=true&w=majority"
)
.then(() => console.log("MongoDB connected"))
.catch(err => console.log(err));

// 라우터 연결
app.use("/api/calendars", calendarRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/categories", categoryRoutes); 

// 서버 시작
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

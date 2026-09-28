import dotenv from "dotenv";
import dns from "node:dns";
import express from "express";
import cors from "cors";

// Routes
import userRoutes from "./user/user.routes.js";

import facultyAttendanceRoutes from "./user/facultyAttendance/facultyAttendance.routes.js"
import authRoutes from "./auth/auth.routes.js";
import institutionRoutes from "./institution/institution.routes.js";
import departmentRoutes from "./department/department.routes.js";
import programmeRoutes from "./programme/programme.routes.js";
import programmeSeatLimitRoutes from "./ProgrammeSeatLimit/programmeSeatLimit.routes.js";
import batchRoutes from "./batch/batch.routes.js"
import classRoutes from "./class/class.routes.js";
import subjectRoutes from "./subject/subject.routes.js";
import studentRoutes from "./student/student.route.js"
import transportRoutes from "./transport/transport.routes.js";
import examRoutes from "./exams/exam.route.js"
import timetableRoutes from "./timetable/timetable.route.js"
import CalendarRoutes from "./academic-calendar/route.js"
import  AttendanceRoutes from "./attendance/route.js";
import feeallocationRoutes from "./fees-allocation/route.js"
import enquiryRoutes from "./enquiry/enquiry.routes.js"

// library 
import LibraryRoutes from "./Library/Librarycurd/library.routes.js";
import BookRoutes from "./Library/Bookcurd/book.routes.js"
import bookDistributionRoutes from "./Library/BookDistribution/bookDistribution.route.js"


// club
import ClubeRoutes from "./Club/Clubcurd/club.routes.js"
import ClubPostRoutes from "./Club/ClubPost/clubPost.routes.js";
import clubPostLikeRoutes from "./Club/ClubPostLike/clubPostLike.routes.js";
import clubPostCommentRoutes from "./Club/ClubPostComment/clubPostComment.routes.js";
// club

// exam cell 

import ExamHallRoutes from "./exams/examcell/examHall/examHall.routes.js";
import ExamDeskArrangementRoutes from "./exams/examcell/examDeskArrangement/examDeskArrangement.routes.js";
import ExamHallStudentPoolRoutes from "./exams/examcell/examHallStudentPool/examHallStudentPool.routes.js";
import examHallStudentAllocationRouter from "./exams/examcell/examHallStudentAllocation/examHallStudentAllocation.routes.js"
import masterTimetableRoutes from "./exams/MasterTimetable/masterTimetable.routes.js";
import internalMarkRoutes from "./exams/examcell/InternalMark/InternalMark.routes.js"


// exam cell 



// library 

// id card section 
import idCardTemplateRoutes from "./IDCardTemplate/routes/idCardTemplateRoutes/idCardTemplateRoutes.js";
import idCardAssignmentRoutes from "./IDCardTemplate/routes/idCardAssignmentRoutes/idCardAssignmentRoutes.js";
import identityRoutes
  from "./IDCardTemplate/routes/identityRoutes/identityRoutes.js";

  import idCardTemplateAssignmentRoutes
  from "./IDCardTemplate/routes/idCardTemplateAssignment/idCardTemplateAssignment.routes.js";
import connecTtoDB from "./database/db.js";

// Environment
dotenv.config();

dns.setServers(["8.8.8.8", "1.1.1.1"]);

connecTtoDB();

// Create Express App
const app = express();

/* ===========================
   Global Middlewares
=========================== */

// CORS
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Parse JSON Body
// ID-card templates contain Fabric.js canvas JSON,
// image data, fonts/properties, front + back designs, etc.
// Allow a sufficiently large request without reducing
// the actual template/export quality.

app.use(
  express.json({
    limit: "50mb",
  })
);

// Parse Form Data
app.use(
  express.urlencoded({
    extended: true,
    limit: "50mb",
  })
);

// Debug (optional - remove later)
app.use((req, res, next) => {
  console.log("Method :", req.method);
  console.log("URL    :", req.originalUrl);
  console.log("Headers:", req.headers["content-type"]);
  console.log("Body   :", req.body);
  next();
});

/* ===========================
   Routes
=========================== */




// profile pic api 

app.use(
  "/uploads",
  express.static("uploads")
);

// profile pic api 

app.use("/api/auth", authRoutes);

app.use("/api/users", userRoutes);

app.use(
  "/api/faculty-attendance",
  facultyAttendanceRoutes
);

app.use("/api/institutions", institutionRoutes);

app.use("/api/departments", departmentRoutes);

app.use("/api/programmes", programmeRoutes);

app.use(
  "/api/programme-seat-limits",
  programmeSeatLimitRoutes
);

app.use("/api/classes", classRoutes);

app.use("/api/enquiry",enquiryRoutes)


app.use("/api/students",studentRoutes);

app.use("/api/subjects", subjectRoutes);

app.get("/api/subjects-test", (req, res) => {
  res.json({
    success: true,
    message: "Subject route system is working",
  });
});

app.use("/api/transport",transportRoutes);

app.use("/api/exams",examRoutes);

app.use("/api/timetable",timetableRoutes)

app.use("/api/calendar",CalendarRoutes)

app.use("/api/Attendance",AttendanceRoutes)

app.use("/api/fees-allocation",feeallocationRoutes)


app.use("/api/batch",batchRoutes)

// id card section 
app.use( "/api/id-card/templates",idCardTemplateRoutes);

app.use("/api/id-card/assignments",idCardAssignmentRoutes);

app.use("/api/id-card/identities",identityRoutes);

app.use("/api/id-card/template-assignments",idCardTemplateAssignmentRoutes);





// id card section 


// feeallocationRoutes



// library 
app.use("/api/library",LibraryRoutes);
// BookRoutes curd
app.use("/api/book",BookRoutes);
// bookDistributionRoutes
app.use("/api/book-distribution",bookDistributionRoutes);


// ClubeRoutes


app.use("/api/clubs",ClubeRoutes);
app.use("/api",ClubPostRoutes);

app.use("/api",clubPostLikeRoutes);


app.use("/api",clubPostCommentRoutes);


// exam cell 

app.use("/api/examcell",ExamHallRoutes);

app.use("/api/examcell",ExamDeskArrangementRoutes);


app.use("/api/exam-hall-student-pools",ExamHallStudentPoolRoutes);


app.use(
  "/api/exam-hall-student-allocation",
  examHallStudentAllocationRouter
);

app.use("/api/master-timetables",masterTimetableRoutes);




app.use(
  "/api/internal-marks",
  internalMarkRoutes
);














/* ===========================
   Health Check
=========================== */

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Server is running successfully",
  });
});

/* ===========================
   Start Server
=========================== */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running at port ${PORT}`);
});
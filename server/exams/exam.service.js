import mongoose from "mongoose";
import ExamSession from "./model/examSession.model.js";
import ExamPaper from "./model/examPaper.model.js";
import ExamTitle from "./model/examTitle.model.js";
import Class  from "../class/class.model.js"
import Student from "../student/student.model.js"
import StudentExamMark from "../exams/model/studentExamMark.model.js"
import {
  getCurrentSemesterSubjectsService,
} from "../subject/subject.service.js";

import programmeStructure from "../subject/ProgrammeStructureSchema/programmeStructureSchema.model.js";
import subject from "../subject/subject.model.js"

import { getCurrentSemesterSubjects } from "../subject/currentSemester.helper.js";

// EXAM TITLE 

//create exam title 
export const createExamTitleService =
  async (examData) => {
    // Normalize Input
    examData.title =
      examData.title?.trim();

    // Check Duplicate
    const existingExamTitle =
      await ExamTitle.findOne({
        institutionId:
          examData.institutionId,

        title: examData.title,

        isDeleted: {
          $ne: true,
        },
      });

    if (existingExamTitle) {
      throw new Error(
        "Exam title already exists for this institution."
      );
    }

    // Create Exam Title
    const examTitle =
      await ExamTitle.create(
        examData
      );

    return examTitle;
  };
//get all exam title 
export const getAllExamTitleService =
  async (query) => {
    const {
      page = 1,
      limit = 10,
      search = "",
      institutionId,
    } = query;

    const currentPage =
      Number(page);

    const pageLimit =
      Number(limit);

    // Base Filter
    const filter = {
      isDeleted: {
        $ne: true,
      },
    };

    // Institution Filter
    if (institutionId) {
      filter.institutionId =
        institutionId;
    }

    // Search
    if (search) {
      filter.title = {
        $regex: search.trim(),
        $options: "i",
      };
    }

    // Total Count
    const totalRecords =
      await ExamTitle.countDocuments(
        filter
      );

    // Fetch Data
    const examTitles =
      await ExamTitle.find(filter)
        .populate(
          "institutionId",
          "institutionName"
        )
        .sort({
          createdAt: -1,
        })
        .skip(
          (currentPage - 1) *
            pageLimit
        )
        .limit(pageLimit);

    return {
      currentPage,

      totalPages:
        Math.ceil(
          totalRecords /
            pageLimit
        ),

      totalRecords,

      limit: pageLimit,

      data: examTitles,
    };
  };
  //   get single exam title 
export const getSingleExamTitleService =
  async (examTitleId) => {
    // Validate ObjectId
    if (
      !mongoose.Types.ObjectId.isValid(
        examTitleId
      )
    ) {
      throw new Error(
        "Invalid exam title ID."
      );
    }

    // Fetch Exam Title
    const examTitle =
      await ExamTitle.findOne({
        _id: examTitleId,
        isDeleted: {
          $ne: true,
        },
      }).populate(
        "institutionId",
        "institutionName"
      );

    if (!examTitle) {
      throw new Error(
        "Exam title not found."
      );
    }

    return examTitle;
  };
//update exam title 
export const updateExamTitleService =
  async (
    examTitleId,
    updateData
  ) => {
    // Validate ObjectId
    if (
      !mongoose.Types.ObjectId.isValid(
        examTitleId
      )
    ) {
      throw new Error(
        "Invalid exam title ID."
      );
    }

    // Find Existing Record
    const existingExamTitle =
      await ExamTitle.findOne({
        _id: examTitleId,
        isDeleted: {
          $ne: true,
        },
      });

    if (!existingExamTitle) {
      throw new Error(
        "Exam title not found."
      );
    }

    // Normalize Title
    if (updateData.title) {
      updateData.title =
        updateData.title.trim();
    }

    // Prevent Institution Change
    delete updateData.institutionId;

    // Check Duplicate Title
    if (updateData.title) {
      const duplicateTitle =
        await ExamTitle.findOne({
          _id: {
            $ne: examTitleId,
          },

          institutionId:
            existingExamTitle.institutionId,

          title:
            updateData.title,

          isDeleted: {
            $ne: true,
          },
        });

      if (duplicateTitle) {
        throw new Error(
          "Exam title already exists for this institution."
        );
      }
    }

    // Update
    const updatedExamTitle =
      await ExamTitle.findOneAndUpdate(
        {
          _id: examTitleId,
          isDeleted: {
            $ne: true,
          },
        },
        updateData,
        {
          returnDocument:
            "after",
          runValidators: true,
        }
      );

    return updatedExamTitle;
  };
//delete exam title 
export const deleteExamTitleService =
  async (examTitleId) => {
    // Validate ObjectId
    if (
      !mongoose.Types.ObjectId.isValid(
        examTitleId
      )
    ) {
      throw new Error(
        "Invalid exam title ID."
      );
    }

    // Check Existing Record
    const existingExamTitle =
      await ExamTitle.findOne({
        _id: examTitleId,
        isDeleted: {
          $ne: true,
        },
      });

    if (!existingExamTitle) {
      throw new Error(
        "Exam title not found."
      );
    }

    // Soft Delete
    const deletedExamTitle =
      await ExamTitle.findOneAndUpdate(
        {
          _id: examTitleId,
          isDeleted: {
            $ne: true,
          },
        },
        {
          isDeleted: true,
          deletedAt: new Date(),
        },
        {
          returnDocument: "after",
        }
      );

    return deletedExamTitle;
  };
//restore Elma title 
export const restoreExamTitleService =
  async (examTitleId) => {
    // Validate ObjectId
    if (
      !mongoose.Types.ObjectId.isValid(
        examTitleId
      )
    ) {
      throw new Error(
        "Invalid exam title ID."
      );
    }

    // Check Deleted Record
    const existingExamTitle =
      await ExamTitle.findOne({
        _id: examTitleId,
        isDeleted: true,
      });

    if (!existingExamTitle) {
      throw new Error(
        "Deleted exam title not found."
      );
    }

    // Restore
    const restoredExamTitle =
      await ExamTitle.findOneAndUpdate(
        {
          _id: examTitleId,
          isDeleted: true,
        },
        {
          isDeleted: false,
          deletedAt: null,
        },
        {
          returnDocument: "after",
          runValidators: true,
        }
      );

    return restoredExamTitle;
  };
//delete peramanantly function 
export const permanentDeleteExamTitleService =
  async (examTitleId) => {
    // Validate ObjectId
    if (
      !mongoose.Types.ObjectId.isValid(
        examTitleId
      )
    ) {
      throw new Error(
        "Invalid exam title ID."
      );
    }

    // Check Record Exists
    const examTitle =
      await ExamTitle.findById(
        examTitleId
      );

    if (!examTitle) {
      throw new Error(
        "Exam title not found."
      );
    }

    // Must be in Recycle Bin
    if (!examTitle.isDeleted) {
      throw new Error(
        "Please move the exam title to the recycle bin before permanently deleting it."
      );
    }

    // Optional Safety Check
    const usedInSession =
      await ExamSession.findOne({
        examTitleId,
        isDeleted: {
          $ne: true,
        },
      });

    if (usedInSession) {
      throw new Error(
        "This exam title is already used in an exam session and cannot be permanently deleted."
      );
    }

    // Permanent Delete
    await ExamTitle.findByIdAndDelete(
      examTitleId
    );

    return;
  };








//   exam session + exam paper 
export const createExamSessionService =
  async (sessionData, userId) => {

    const mongoSession =
      await mongoose.startSession();

    mongoSession.startTransaction();

    try {

      const {

        examTitleId,

        institutionId,

        departmentId,

        classId,

      } = sessionData;

      // ==================== CHECK EXAM TITLE ====================

      const examTitle =
        await ExamTitle.findOne({

          _id:
            examTitleId,

          institutionId,

          isDeleted: {
            $ne: true,
          },

        }).session(
          mongoSession
        );

      if(!examTitle){

        throw new Error(
          "Exam title not found."
        );

      }

// ==================== FETCH CURRENT SEMESTER SUBJECTS ====================

const { subjects } =
  await getCurrentSemesterSubjects(
    classId
  );

if(!subjects.length){

  throw new Error(
    "No active subjects found for this class."
  );

}

      // ==================== FIND EXAM SESSION ====================

      let examSession =
        await ExamSession.findOne({

          examTitleId,

          classId,

          isDeleted:{
            $ne:true,
          },

        }).session(
          mongoSession
        );

      // ==================== CREATE SESSION ====================

      if(!examSession){

        const createdSession =
          await ExamSession.create(

            [

              {

                examTitleId,

                institutionId,

                departmentId,

                classId,

createdBy:
  userId.userId,

              }

            ],

            {

              session:
                mongoSession,

            }

          );

        examSession =
          createdSession[0];

      }

      // ==================== CREATE PAPERS ====================

   for(

  let index = 0;

  index < subjects.length;

  index++

){

      const subject =
  subjects[index];

        const existingPaper =
          await ExamPaper.findOne({

            examSessionId:
              examSession._id,

subjectId:
  subject._id,
            isDeleted:{
              $ne:true,
            }

          }).session(
            mongoSession
          );

        if(existingPaper){

          continue;

        }

        await ExamPaper.create(

          [

            {

              examSessionId:
                examSession._id,
subjectId:
  subject._id,

            conductedMark: null,

              displayOrder:
                index + 1,

       createdBy:
  userId.userId,

            }

          ],

          {

            session:
              mongoSession,

          }

        );

      }

      await mongoSession.commitTransaction();

      mongoSession.endSession();

      return examSession;

    } catch(error){

      await mongoSession.abortTransaction();

      mongoSession.endSession();

      throw error;

    }

  };


//   get all exam session 
export const getAllExamSessionService =
  async (query) => {

    const {

      page = 1,

      limit = 10,

      search = "",

      institutionId,

      departmentId,

      classId,

      published,

    } = query;

    const currentPage =
      Number(page);

    const pageLimit =
      Number(limit);

    const filter = {

      isDeleted: {
        $ne: true,
      },

    };

    if(institutionId){

      filter.institutionId =
        institutionId;

    }

    if(departmentId){

      filter.departmentId =
        departmentId;

    }

    if(classId){

      filter.classId =
        classId;

    }

    if(published === "true"){

      filter.published =
        true;

    }

    if(published === "false"){

      filter.published =
        false;

    }

    if(search){

      const titles =
        await ExamTitle.find({

          title: {

            $regex:
              search.trim(),

            $options:
              "i",

          },

          isDeleted: {

            $ne: true,

          },

        }).select("_id");

      filter.examTitleId = {

        $in:

          titles.map(

            (item)=>

              item._id

          ),

      };

    }

    const totalRecords =
      await ExamSession.countDocuments(

        filter

      );

    const sessions =
      await ExamSession.find(

        filter

      )

      .populate(

        "examTitleId",

        "title"

      )

      .populate(

        "institutionId",

        "institutionName"

      )

      .populate(

        "departmentId",

        "departmentName"

      )

      .populate({

        path: "classId",

        select:

          "year section programme",

        populate: {

          path: "programme",

          select:

            "programmeName",

        },

      })

      .sort({

        createdAt: -1,

      })

      .skip(

        (currentPage - 1) *

        pageLimit

      )

      .limit(

        pageLimit

      )

      .lean();

    const data =
      sessions.map(

        (session)=>({

          _id:
            session._id,

          examTitleId:
            session.examTitleId?._id,

          examTitle:
            session.examTitleId?.title,

          institutionId:
            session.institutionId?._id,

          institution:
            session.institutionId?.institutionName,

          departmentId:
            session.departmentId?._id,

          department:
            session.departmentId?.departmentName,

          class:
            session.classId,

          published:
            session.published,

          createdAt:
            session.createdAt,

        })

      );

    return {

      currentPage,

      totalPages:

        Math.ceil(

          totalRecords /

          pageLimit

        ),

      totalRecords,

      limit:
        pageLimit,

      data,

    };

  };

  
//   get single exam session 
// ==================== GET SINGLE EXAM SESSION ====================
export const getSingleExamSessionService =
  async (examSessionId) => {

    // ==================== VALIDATE OBJECT ID ====================

    if(

      !mongoose.Types.ObjectId.isValid(

        examSessionId

      )

    ){

      throw new Error(

        "Invalid exam session ID."

      );

    }

    // ==================== FETCH EXAM SESSION ====================

    const examSession =
      await ExamSession.findOne({

        _id:
          examSessionId,

        isDeleted:{
          $ne:true,
        },

      })

      .populate(

        "examTitleId",

        "title"

      )

      .populate(

        "institutionId",

        "institutionName"

      )

      .populate(

        "departmentId",

        "departmentName"

      )

      .populate({

        path:"classId",

        select:
          "year section programme",

        populate:{

          path:"programme",

          select:
            "programmeName",

        },

      })

      .populate(

        "createdBy",

        "fullName"

      )

      .populate(

        "publishedBy",

        "fullName"

      )

      .lean();

    if(!examSession){

      throw new Error(

        "Exam session not found."

      );

    }

    // ==================== FETCH EXAM PAPERS ====================

    const papers =
      await ExamPaper.find({

        examSessionId,

        isDeleted:{
          $ne:true,
        },

      })

      .populate(

        "subjectId",

        "subjectName subjectCode"

      )

      .sort({

        displayOrder:1,

      })

      .lean();

    // ==================== RETURN ====================

    return {

      _id:
        examSession._id,

      examTitle:{

        _id:
          examSession.examTitleId?._id,

        title:
          examSession.examTitleId?.title,

      },

      institution:{

        _id:
          examSession.institutionId?._id,

        institutionName:
          examSession.institutionId?.institutionName,

      },

      department:{

        _id:
          examSession.departmentId?._id,

        departmentName:
          examSession.departmentId?.departmentName,

      },

      class:
        examSession.classId,

      published:
        examSession.published,

      publishedAt:
        examSession.publishedAt,

      createdBy:
        examSession.createdBy,

      publishedBy:
        examSession.publishedBy,

      createdAt:
        examSession.createdAt,

      papers,

    };

  };


//   update exam session function
// ==================== UPDATE EXAM SESSION ====================
export const updateExamSessionService =
  async (
    examSessionId,
    updateData,
    userId
  ) => {

    const mongoSession =
      await mongoose.startSession();

    mongoSession.startTransaction();

    try {

      // ==================== VALIDATE OBJECT ID ====================

      if(

        !mongoose.Types.ObjectId.isValid(

          examSessionId

        )

      ){

        throw new Error(

          "Invalid exam session ID."

        );

      }

      // ==================== FETCH SESSION ====================

      const existingSession =
        await ExamSession.findOne({

          _id:
            examSessionId,

          isDeleted:{
            $ne:true,
          },

        }).session(
          mongoSession
        );

      if(!existingSession){

        throw new Error(

          "Exam session not found."

        );

      }

      // ==================== PROTECTED FIELDS ====================

      delete updateData.institutionId;
      delete updateData.departmentId;
      delete updateData.classId;
      delete updateData.createdBy;
      delete updateData.papers;

      // ==================== UPDATE EXAM TITLE ====================

      if(updateData.examTitleId){

        const duplicate =
          await ExamSession.findOne({

            _id:{
              $ne:examSessionId,
            },

            examTitleId:
              updateData.examTitleId,

            classId:
              existingSession.classId,

            isDeleted:{
              $ne:true,
            },

          }).session(
            mongoSession
          );

        if(duplicate){

          throw new Error(

            "Exam session already exists for this class."

          );

        }

        existingSession.examTitleId =
          updateData.examTitleId;

      }

      // ==================== UPDATE PUBLISH STATUS ====================

if(updateData.published === true){

    existingSession.published = true;

    existingSession.publishedBy =
      userId;

    existingSession.publishedAt =
      new Date();

}

      await existingSession.save({

        session:
          mongoSession,

      });

      await mongoSession.commitTransaction();

      mongoSession.endSession();

      return existingSession;

    } catch(error){

      await mongoSession.abortTransaction();

      mongoSession.endSession();

      throw error;

    }

  };

// delete exam session 
// ==================== DELETE EXAM SESSION ====================
export const deleteExamSessionService =
  async (examSessionId) => {

    // ==================== VALIDATE OBJECT ID ====================

    if(

      !mongoose.Types.ObjectId.isValid(

        examSessionId

      )

    ){

      throw new Error(

        "Invalid exam session ID."

      );

    }

    const mongoSession =
      await mongoose.startSession();

    mongoSession.startTransaction();

    try{

      // ==================== CHECK SESSION ====================

      const examSession =
        await ExamSession.findOne({

          _id:
            examSessionId,

          isDeleted:{
            $ne:true,
          },

        }).session(
          mongoSession
        );

      if(!examSession){

        throw new Error(

          "Exam session not found."

        );

      }

      // ==================== GET PAPER IDS ====================

      const papers =
        await ExamPaper.find({

          examSessionId,

          isDeleted:{
            $ne:true,
          },

        })
        .select("_id")
        .session(
          mongoSession
        );

      const paperIds =
        papers.map(
          (paper)=>paper._id
        );

      // ==================== SOFT DELETE SESSION ====================

      await ExamSession.findByIdAndUpdate(

        examSessionId,

        {

          isDeleted:true,

          deletedAt:new Date(),

        },

        {

          session:
            mongoSession,

        }

      );

      // ==================== SOFT DELETE PAPERS ====================

      await ExamPaper.updateMany(

        {

          examSessionId,

          isDeleted:{
            $ne:true,
          },

        },

        {

          $set:{

            isDeleted:true,

            deletedAt:new Date(),

          },

        },

        {

          session:
            mongoSession,

        }

      );

      // ==================== SOFT DELETE STUDENT MARKS ====================

      await StudentExamMark.updateMany(

        {

          examPaperId:{
            $in:paperIds,
          },

          isDeleted:{
            $ne:true,
          },

        },

        {

          $set:{

            isDeleted:true,

            deletedAt:new Date(),

          },

        },

        {

          session:
            mongoSession,

        }

      );

      await mongoSession.commitTransaction();

      mongoSession.endSession();

      return;

    }catch(error){

      await mongoSession.abortTransaction();

      mongoSession.endSession();

      throw error;

    }

  };

// restore exam session 
// ==================== RESTORE EXAM SESSION ====================
export const restoreExamSessionService =
  async (examSessionId) => {

    // ==================== VALIDATE OBJECT ID ====================

    if(

      !mongoose.Types.ObjectId.isValid(

        examSessionId

      )

    ){

      throw new Error(

        "Invalid exam session ID."

      );

    }

    const mongoSession =
      await mongoose.startSession();

    mongoSession.startTransaction();

    try{

      // ==================== CHECK DELETED SESSION ====================

      const examSession =
        await ExamSession.findOne({

          _id:
            examSessionId,

          isDeleted:true,

        }).session(
          mongoSession
        );

      if(!examSession){

        throw new Error(

          "Deleted exam session not found."

        );

      }

      // ==================== GET PAPER IDS ====================

      const papers =
        await ExamPaper.find({

          examSessionId,

        })
        .select("_id")
        .session(
          mongoSession
        );

      const paperIds =
        papers.map(
          (paper)=>paper._id
        );

      // ==================== RESTORE SESSION ====================

      await ExamSession.findByIdAndUpdate(

        examSessionId,

        {

          isDeleted:false,

          deletedAt:null,

        },

        {

          session:
            mongoSession,

        }

      );

      // ==================== RESTORE PAPERS ====================

      await ExamPaper.updateMany(

        {

          examSessionId,

          isDeleted:true,

        },

        {

          $set:{

            isDeleted:false,

            deletedAt:null,

          },

        },

        {

          session:
            mongoSession,

        }

      );

      // ==================== RESTORE STUDENT MARKS ====================

      await StudentExamMark.updateMany(

        {

          examPaperId:{

            $in:paperIds,

          },

          isDeleted:true,

        },

        {

          $set:{

            isDeleted:false,

            deletedAt:null,

          },

        },

        {

          session:
            mongoSession,

        }

      );

      await mongoSession.commitTransaction();

      mongoSession.endSession();

      return;

    }catch(error){

      await mongoSession.abortTransaction();

      mongoSession.endSession();

      throw error;

    }

  };


//   delete from the db exam session and exam paper 
// ==================== PERMANENT DELETE EXAM SESSION ====================
export const permanentDeleteExamSessionService =
  async (examSessionId) => {

    // ==================== VALIDATE OBJECT ID ====================

    if(

      !mongoose.Types.ObjectId.isValid(

        examSessionId

      )

    ){

      throw new Error(

        "Invalid exam session ID."

      );

    }

    const mongoSession =
      await mongoose.startSession();

    mongoSession.startTransaction();

    try{

      // ==================== CHECK DELETED SESSION ====================

      const examSession =
        await ExamSession.findOne({

          _id:
            examSessionId,

          isDeleted:true,

        }).session(
          mongoSession
        );

      if(!examSession){

        throw new Error(

          "Deleted exam session not found."

        );

      }

      // ==================== GET PAPER IDS ====================

      const papers =
        await ExamPaper.find({

          examSessionId,

        })
        .select("_id")
        .session(
          mongoSession
        );

      const paperIds =
        papers.map(
          (paper)=>paper._id
        );

      // ==================== DELETE STUDENT MARKS ====================

      await StudentExamMark.deleteMany(

        {

          examPaperId:{
            $in:paperIds,
          },

        },

        {

          session:
            mongoSession,

        }

      );

      // ==================== DELETE EXAM PAPERS ====================

      await ExamPaper.deleteMany(

        {

          examSessionId,

        },

        {

          session:
            mongoSession,

        }

      );

      // ==================== DELETE EXAM SESSION ====================

      await ExamSession.findByIdAndDelete(

        examSessionId,

        {

          session:
            mongoSession,

        }

      );

      await mongoSession.commitTransaction();

      mongoSession.endSession();

      return;

    }catch(error){

      await mongoSession.abortTransaction();

      mongoSession.endSession();

      throw error;

    }

  };


// get exam session by class id 
// ==================== GET EXAM TITLES BY CLASS ====================
export const getExamSessionsByClassService =
  async (classId) => {

    // ==================== VALIDATE OBJECT ID ====================

    if(

      !mongoose.Types.ObjectId.isValid(

        classId

      )

    ){

      throw new Error(

        "Invalid class ID."

      );

    }

    // ==================== CHECK CLASS ====================

    const classData =
      await Class.findById(
        classId
      );

    if(!classData){

      throw new Error(

        "Class not found."

      );

    }

    // ==================== FETCH EXAM SESSIONS ====================

    const examSessions =
      await ExamSession.find({

        classId,

        isDeleted:{
          $ne:true,
        },

      })

      .populate(

        "examTitleId",

        "title"

      )

      .sort({

        createdAt:-1,

      })

      .lean();

    // ==================== RETURN ====================

    return examSessions.map(

      (session)=>({

        examSessionId:
          session._id,

        examTitleId:
          session.examTitleId?._id,

        examTitle:
          session.examTitleId?.title,

        published:
          session.published,

        publishedAt:
          session.publishedAt,

      })

    );

  };





// ==========================================================
// SAVE STUDENT EXAM MARKS
// ==========================================================

export const saveStudentExamMarksService =
  async (markData, userId) => {

    const {
      examPaperId,
      conductedMark,
      marks,
    } = markData;


    // ========================================================
    // VALIDATE EXAM PAPER ID
    // ========================================================

    if (
      !mongoose.Types.ObjectId.isValid(
        examPaperId
      )
    ) {

      throw new Error(
        "Invalid exam paper ID."
      );

    }


    // ========================================================
    // VALIDATE CONDUCTED MARK
    // ========================================================

    if (
      conductedMark === null ||
      conductedMark === undefined ||
      conductedMark <= 0
    ) {

      throw new Error(
        "Conducted mark must be greater than zero."
      );

    }


    // ========================================================
    // VALIDATE MARKS ARRAY
    // ========================================================

    if (
      !Array.isArray(marks) ||
      marks.length === 0
    ) {

      throw new Error(
        "Marks array is required."
      );

    }


    // ========================================================
    // FIND EXAM PAPER
    // ========================================================

    const examPaper =
      await ExamPaper.findOne({

        _id: examPaperId,

        isDeleted: {
          $ne: true,
        },

      });


    if (!examPaper) {

      throw new Error(
        "Exam paper not found."
      );

    }


    // ========================================================
    // FIND EXAM SESSION
    // ========================================================

    const examSession =
      await ExamSession.findOne({

        _id: examPaper.examSessionId,

        isDeleted: {
          $ne: true,
        },

      });


    if (!examSession) {

      throw new Error(
        "Exam session not found."
      );

    }


    // ========================================================
    // SAVE / LOCK CONDUCTED MARK
    // ========================================================

    const markCount =
      await StudentExamMark.countDocuments({

        examPaperId,

        isDeleted: {
          $ne: true,
        },

      });


    // ========================================================
    // FIRST TIME CONDUCTED MARK
    // ========================================================

    if (
      examPaper.conductedMark === null ||
      examPaper.conductedMark === undefined
    ) {

      examPaper.conductedMark =
        conductedMark;

      await examPaper.save();

    }


    // ========================================================
    // CONDUCTED MARK ALREADY EXISTS
    // ========================================================

    else {

      if (
        markCount > 0 &&
        examPaper.conductedMark !==
          conductedMark
      ) {

        throw new Error(
          `Conducted mark is already locked as ${examPaper.conductedMark}.`
        );

      }

    }


    // ========================================================
    // SAVE STUDENT MARKS
    // ========================================================

    const result = [];


    for (const item of marks) {

      // ------------------------------------------------------
      // VALIDATE STUDENT
      // ------------------------------------------------------

      if (
        !mongoose.Types.ObjectId.isValid(
          item.studentId
        )
      ) {

        throw new Error(
          `Invalid student ID: ${item.studentId}`
        );

      }


      // ------------------------------------------------------
      // FIND STUDENT
      // ------------------------------------------------------

      const student =
        await Student.findById(
          item.studentId
        );


      if (!student) {

        throw new Error(
          `Student not found : ${item.studentId}`
        );

      }


      // ------------------------------------------------------
      // VALIDATE OBTAINED MARK
      // ------------------------------------------------------

      if (
        item.obtainedMark !== null &&
        item.obtainedMark !== undefined &&
        item.obtainedMark >
          examPaper.conductedMark
      ) {

        throw new Error(
          `${student.studentName} mark exceeds conducted mark.`
        );

      }


      // ======================================================
      // FIND EXISTING MARK
      // ======================================================

      let existingMark =
        await StudentExamMark.findOne({

          examPaperId,

          studentId:
            item.studentId,

          isDeleted: {
            $ne: true,
          },

        });


      // ======================================================
      // UPDATE EXISTING MARK
      // ======================================================

      if (existingMark) {

        existingMark.obtainedMark =
          item.obtainedMark;

        existingMark.updatedBy =
          userId;

        await existingMark.save();

        result.push(
          existingMark
        );

      }


      // ======================================================
      // CREATE NEW MARK
      // ======================================================

      else {

        const createdMark =
          await StudentExamMark.create({

            examPaperId,

            studentId:
              item.studentId,

            obtainedMark:
              item.obtainedMark,

            enteredBy:
              userId,

          });


        result.push(
          createdMark
        );

      }

    }


    // ========================================================
    // PUBLISH EXAM SESSION
    // ========================================================
    // Marks have successfully been saved at this point.
    // Now make the result visible to students.

    examSession.published = true;

    examSession.publishedBy =
      userId;

    examSession.publishedAt =
      new Date();


    await examSession.save();


    // ========================================================
    // RESPONSE
    // ========================================================

    return {

      examSessionId:
        examSession._id,

      published:
        examSession.published,

      publishedBy:
        examSession.publishedBy,

      publishedAt:
        examSession.publishedAt,

      marks:
        result,

    };

  };


  // get exam paper data by id 
// ==================== GET STUDENT EXAM MARKS ====================
export const getStudentExamMarksService =
  async (examPaperId) => {

    // ==================== VALIDATE OBJECT ID ====================

    if(

      !mongoose.Types.ObjectId.isValid(

        examPaperId

      )

    ){

      throw new Error(

        "Invalid exam paper ID."

      );

    }

    // ==================== FETCH EXAM PAPER ====================

    const examPaper =
      await ExamPaper.findOne({

        _id:
          examPaperId,

        isDeleted:{
          $ne:true,
        },

      })

      .populate(

        "subjectId",

        "subjectName subjectCode"

      )

      .populate({

        path:"examSessionId",

        populate:[

          {

            path:"examTitleId",

            select:"title",

          },

          {

            path:"classId",

            select:

              "programme year section",

            populate:{

              path:"programme",

              select:

                "programmeName",

            },

          },

        ],

      })

      .lean();

    if(!examPaper){

      throw new Error(

        "Exam paper not found."

      );

    }

    // ==================== FETCH STUDENTS ====================

    const students =
      await Student.find({

        classId:
          examPaper.examSessionId.classId._id,

      })

      .select(

        "studentName registerNumber"

      )

      .sort({

        registerNumber:1,

      })

      .lean();

    // ==================== FETCH SAVED MARKS ====================

    const savedMarks =
      await StudentExamMark.find({

        examPaperId,

        isDeleted:{
          $ne:true,
        },

      })

      .lean();

    // ==================== CREATE MARK MAP ====================

    const markMap =
      new Map();

    savedMarks.forEach(

      (item)=>{

        markMap.set(

          item.studentId.toString(),

          item

        );

      }

    );

    // ==================== MERGE STUDENTS ====================

    const mergedStudents =
      students.map(

        (student)=>{

          const savedMark =
            markMap.get(

              student._id.toString()

            );

          return{

            studentId:
              student._id,

            registerNumber:
              student.registerNumber,

            studentName:
              student.studentName,

            obtainedMark:
              savedMark?.obtainedMark ?? null,

            markId:
              savedMark?._id ?? null,

          };

        }

      );

    // ==================== RETURN ====================

    return{

      examPaperId:
        examPaper._id,

      examSessionId:
        examPaper.examSessionId._id,

      exam:{

        examTitle:
          examPaper.examSessionId.examTitleId?.title,

        subject:
          examPaper.subjectId?.subjectName,

        subjectCode:
          examPaper.subjectId?.subjectCode,

        conductedMark:
          examPaper.conductedMark,

        class:
          examPaper.examSessionId.classId,

      },

      students:
        mergedStudents,

    };

  };
  // update exam marks function 
 // ==================== UPDATE STUDENT EXAM MARKS ====================
export const updateStudentExamMarksService =
  async (
    markData,
    userId
  ) => {

    const {

      examPaperId,

      conductedMark,

      marks,

    } = markData;

    // ==================== VALIDATE OBJECT ID ====================

    if(

      !mongoose.Types.ObjectId.isValid(

        examPaperId

      )

    ){

      throw new Error(

        "Invalid exam paper ID."

      );

    }

    // ==================== FETCH EXAM PAPER ====================

    const examPaper =
      await ExamPaper.findOne({

        _id:
          examPaperId,

        isDeleted:{
          $ne:true,
        },

      });

    if(!examPaper){

      throw new Error(

        "Exam paper not found."

      );

    }

    // ==================== UPDATE CONDUCTED MARK ====================

if(

  conductedMark !== undefined

){

  if(conductedMark <= 0){

    throw new Error(

      "Conducted mark must be greater than zero."

    );

  }

  examPaper.conductedMark =
    conductedMark;

  await examPaper.save();

}

    // ==================== VALIDATE MARKS ====================

    if(

      !Array.isArray(marks) ||

      marks.length === 0

    ){

      throw new Error(

        "Marks array is required."

      );

    }

    const updatedMarks = [];

    // ==================== UPDATE MARKS ====================

    for(const item of marks){

      const student =
        await Student.findById(

          item.studentId

        );

      if(!student){

        throw new Error(

          `Student not found : ${item.studentId}`

        );

      }

      // ==================== VALIDATE MARK ====================

      if(

        item.obtainedMark !== null &&

        item.obtainedMark > examPaper.conductedMark

      ){

        throw new Error(

          `${student.studentName} mark exceeds conducted mark.`

        );

      }

      const updatedMark =
        await StudentExamMark.findOneAndUpdate(

          {

            examPaperId,

            studentId:
              item.studentId,

            isDeleted:{
              $ne:true,
            },

          },

          {

            obtainedMark:
              item.obtainedMark,

            updatedBy:
              userId,

          },

          {

            new:true,

            runValidators:true,

          }

        );

      if(!updatedMark){

        throw new Error(

          `Marks not found for ${student.studentName}.`

        );

      }

      updatedMarks.push(

        updatedMark

      );

    }

    return updatedMarks;

  };
  // delete exam results
  // ==================== DELETE STUDENT EXAM MARKS ====================
export const deleteStudentExamMarksService =
  async (examPaperId) => {

    // ==================== VALIDATE OBJECT ID ====================

    if(

      !mongoose.Types.ObjectId.isValid(

        examPaperId

      )

    ){

      throw new Error(

        "Invalid exam paper ID."

      );

    }

    // ==================== CHECK EXAM PAPER ====================

    const examPaper =
      await ExamPaper.findOne({

        _id:
          examPaperId,

        isDeleted:{
          $ne:true,
        },

      });

    if(!examPaper){

      throw new Error(

        "Exam paper not found."

      );

    }

    // ==================== SOFT DELETE MARKS ====================

    const result =
      await StudentExamMark.updateMany(

        {

          examPaperId,

          isDeleted:{
            $ne:true,
          },

        },

        {

          $set:{

            isDeleted:true,

            deletedAt:new Date(),

          },

        }

      );

    return{

      deletedCount:
        result.modifiedCount,

    };

  };


  // ==================== RESTORE STUDENT EXAM MARKS ====================
export const restoreStudentExamMarksService =
  async (examPaperId) => {

    if(
      !mongoose.Types.ObjectId.isValid(
        examPaperId
      )
    ){
      throw new Error(
        "Invalid exam paper ID."
      );
    }

    const examPaper =
      await ExamPaper.findOne({

        _id:examPaperId,

        isDeleted:{
          $ne:true,
        },

      });

    if(!examPaper){

      throw new Error(
        "Exam paper not found."
      );

    }

    const result =
      await StudentExamMark.updateMany(

        {

          examPaperId,

          isDeleted:true,

        },

        {

          $set:{

            isDeleted:false,

            deletedAt:null,

          },

        }

      );

    return{

      restoredCount:
        result.modifiedCount,

    };

  };

  // ==================== PERMANENT DELETE STUDENT EXAM MARKS ====================
export const permanentDeleteStudentExamMarksService =
  async (examPaperId) => {

    if(
      !mongoose.Types.ObjectId.isValid(
        examPaperId
      )
    ){
      throw new Error(
        "Invalid exam paper ID."
      );
    }

    const examPaper =
      await ExamPaper.findOne({

        _id:examPaperId,

      });

    if(!examPaper){

      throw new Error(
        "Exam paper not found."
      );

    }

    const result =
      await StudentExamMark.deleteMany({

        examPaperId,

      });

    return{

      deletedCount:
        result.deletedCount,

    };

  };

  // ==================== GET EXAM PAPER LIST ====================
// ======================================================
// GET EXAM PAPER LIST
// ======================================================

export const getExamPaperListService = async (
  classId,
  examTitleId,
  user
) => {

  // ======================================================
  // VALIDATE CLASS ID
  // ======================================================

  if (
    !mongoose.Types.ObjectId.isValid(classId)
  ) {
    throw new Error(
      "Invalid class ID."
    );
  }


  // ======================================================
  // VALIDATE EXAM TITLE ID
  // ======================================================

  if (
    !mongoose.Types.ObjectId.isValid(examTitleId)
  ) {
    throw new Error(
      "Invalid exam title ID."
    );
  }


  // ======================================================
  // FIND CLASS
  // ======================================================

  const classData =
    await Class.findOne({

      _id: classId,

      isDeleted: false,

      isActive: true,

    }).select(
      "institution department programme batchId"
    );


  if (!classData) {

    throw new Error(
      "Class not found."
    );

  }


  // ======================================================
  // VALIDATE CLASS DEPARTMENT
  // ======================================================

  if (!classData.department) {

    throw new Error(
      "Department is not assigned to this class."
    );

  }


  // ======================================================
  // FETCH CURRENT SEMESTER SUBJECTS
  // ======================================================

  const {
    subjects,
    studyYear,
    currentSemester,
    batch,
  } =
    await getCurrentSemesterSubjectsService(
      classId
    );


  // ======================================================
  // CHECK SUBJECTS
  // ======================================================

  if (
    !subjects ||
    subjects.length === 0
  ) {

    throw new Error(
      "No active subjects found for this class."
    );

  }


  // ======================================================
  // FIND EXISTING EXAM SESSION
  // ======================================================

  let examSession =
    await ExamSession.findOne({

      classId,

      examTitleId,

      isDeleted: {
        $ne: true,
      },

    });


  // ======================================================
  // CREATE EXAM SESSION
  // ======================================================

  if (!examSession) {

    examSession =
      await ExamSession.create({

        examTitleId,

        // Get institution from CLASS
        institutionId:
          classData.institution,

        // Get department from CLASS
        // NOT user.department
        departmentId:
          classData.department,

        classId,

        createdBy:
          user.userId,

      });

  }


  // ======================================================
  // CREATE MISSING EXAM PAPERS
  // ======================================================

  for (
    let index = 0;
    index < subjects.length;
    index++
  ) {

    const subject =
      subjects[index];


    // ====================================================
    // CHECK EXISTING PAPER
    // ====================================================

    const exists =
      await ExamPaper.findOne({

        examSessionId:
          examSession._id,

        subjectId:
          subject._id,

        isDeleted: {
          $ne: true,
        },

      });


    if (exists) {

      continue;

    }


    // ====================================================
    // CREATE EXAM PAPER
    // ====================================================

    await ExamPaper.create({

      examSessionId:
        examSession._id,

      subjectId:
        subject._id,

      conductedMark:
        null,

      displayOrder:
        index + 1,

      createdBy:
        user.userId,

    });

  }


  // ======================================================
  // FETCH EXAM PAPERS
  // ======================================================

  const papers =
    await ExamPaper.find({

      examSessionId:
        examSession._id,

      isDeleted: {
        $ne: true,
      },

    })

      .populate(
        "subjectId",
        "subjectName subjectCode"
      )

      .sort({
        displayOrder: 1,
      });


  // ======================================================
  // BUILD RESPONSE
  // ======================================================

  const result = [];


  for (
    const paper
    of papers
  ) {

    // ====================================================
    // FIND FIRST MARK
    // ====================================================

    const firstMark =
      await StudentExamMark.findOne({

        examPaperId:
          paper._id,

        isDeleted: {
          $ne: true,
        },

      })

        .populate(
          "enteredBy",
          "fullName"
        );


    // ====================================================
    // BUILD RESULT
    // ====================================================

    result.push({

      examPaperId:
        paper._id,

      subjectId:
        paper.subjectId?._id ??
        null,

      subjectCode:
        paper.subjectId?.subjectCode ??
        null,

      subjectName:
        paper.subjectId?.subjectName ??
        null,

      conductedMark:
        paper.conductedMark,

      completed:
        !!firstMark,

      facultyId:
        firstMark?.enteredBy?._id ??
        null,

      facultyName:
        firstMark?.enteredBy?.fullName ??
        null,

      enteredAt:
        firstMark?.createdAt ??
        null,

    });

  }


  // ======================================================
  // RETURN
  // ======================================================

  return {

    batch,

    studyYear,

    currentSemester,

    examSessionId:
      examSession._id,

    papers:
      result,

  };

};

  // ==================== GET EXAM RESULT REPORT ====================
export const getExamResultReportService =
  async (examPaperId) => {

    // ==================== VALIDATE ====================

    if(
      !mongoose.Types.ObjectId.isValid(
        examPaperId
      )
    ){

      throw new Error(
        "Invalid exam paper ID."
      );

    }

    // ==================== FETCH EXAM PAPER ====================

    const examPaper =
      await ExamPaper.findOne({

        _id:
          examPaperId,

        isDeleted:{
          $ne:true,
        },

      })

      .populate(

        "subjectId",

        "subjectName subjectCode"

      )

      .populate({

        path:"examSessionId",

        populate:[

          {

            path:"examTitleId",

            select:"title",

          },

          {

            path:"classId",

            select:

              "programme year section",

            populate:{

              path:"programme",

              select:

                "programmeName",

            },

          },

        ],

      });

    if(!examPaper){

      throw new Error(

        "Exam paper not found."

      );

    }

    // ==================== FETCH STUDENT MARKS ====================

    const marks =
      await StudentExamMark.find({

        examPaperId,

        isDeleted:{
          $ne:true,
        },

      })

      .populate(

        "studentId",

        "studentName registerNumber"

      )

      .populate(

        "enteredBy",

        "fullName"

      )

      .sort({

        createdAt:1,

      });
      // ==================== TOTAL CLASS STUDENTS ====================

const totalStudents =
  await Student.countDocuments({

    classId:
      examPaper.examSessionId.classId._id,

  });

    // ==================== CALCULATE SUMMARY ====================

    let highest = 0;

    let lowest = null;

    let total = 0;

    let enteredCount = 0;

    const students = [];

    for(const item of marks){

      const mark =
        item.obtainedMark;

      if(mark !== null){

        enteredCount++;

        total += mark;

        if(mark > highest){

          highest = mark;

        }

        if(

          lowest === null ||

          mark < lowest

        ){

          lowest = mark;

        }

      }

      students.push({

        studentId:
          item.studentId._id,

        registerNumber:
          item.studentId.registerNumber,

        studentName:
          item.studentId.studentName,

        obtainedMark:
          mark,

      });

    }

    // ==================== RETURN ====================

    return{

      examPaperId:
        examPaper._id,

   examTitle:
  examPaper.examSessionId
  .examTitleId?.title,

subjectName:
    examPaper.subjectId?.subjectName,

subjectCode:
    examPaper.subjectId?.subjectCode,
      class:
        examPaper.examSessionId
        .classId,

      conductedMark:
        examPaper.conductedMark,

   facultyId:

  marks.length > 0

  ?

  marks[0].enteredBy?._id

  :

  null,

facultyName:

  marks.length > 0

  ?

  marks[0].enteredBy?.fullName

  :

  null,         

      summary:{

        totalStudents,

        enteredMarks:
          enteredCount,

        highest,

        lowest,

        average:

          enteredCount

          ?

          Number(

            (

              total /

              enteredCount

            ).toFixed(2)

          )

          :

          0,

      },

      students,

    };

  };

  // ======================================================
// GET COMPLETE EXAM RESULTS FOR ONE STUDENT
// ======================================================

export const getStudentExamResultService = async (studentId) => {

  // ==========================================================
  // VALIDATE STUDENT ID
  // ==========================================================

  if (!mongoose.Types.ObjectId.isValid(studentId)) {
    throw new Error("Invalid student ID.");
  }


  // ==========================================================
  // FIND STUDENT
  // ==========================================================

  const student = await Student.findOne({
    _id: studentId,
    isDeleted: { $ne: true },
  })
    .select(
      "studentName registerNumber studentEmail classId"
    )
    .lean();


  if (!student) {
    throw new Error("Student not found.");
  }


  // ==========================================================
  // FIND STUDENT MARKS
  // ==========================================================

  const marks = await StudentExamMark.find({
    studentId: studentId,
    isDeleted: { $ne: true },
  })
    .populate({
      path: "examPaperId",

      select:
        "_id examSessionId subjectId conductedMark displayOrder isDeleted",

      populate: [
        {
          path: "subjectId",

          select:
            "_id subjectName subjectCode",
        },

        {
          path: "examSessionId",

          select:
            "_id examTitleId published publishedAt isDeleted",

          populate: {
            path: "examTitleId",

            select:
              "_id title",
          },
        },
      ],
    })
    .sort({
      createdAt: 1,
    })
    .lean();


  // ==========================================================
  // DEBUG - CHECK MARKS
  // ==========================================================

  console.log("\n========================================");
  console.log("STUDENT EXAM RESULT DEBUG");
  console.log("========================================");

  console.log("Student ID:", studentId);

  console.log("Student Name:", student.studentName);

  console.log("Total Marks Found:", marks.length);

  console.log(
    "Marks Data:",
    JSON.stringify(marks, null, 2)
  );

  console.log("========================================\n");


  // ==========================================================
  // GROUP RESULTS BY EXAM
  // ==========================================================

  const examMap = new Map();


  for (const mark of marks) {

    console.log("\n----------------------------------------");
    console.log("PROCESSING MARK");
    console.log("----------------------------------------");

    console.log("Mark ID:", mark._id);

    console.log("Student ID:", mark.studentId);

    console.log(
      "Obtained Mark:",
      mark.obtainedMark
    );


    // --------------------------------------------------------
    // EXAM PAPER
    // --------------------------------------------------------

    const paper = mark.examPaperId;

    console.log(
      "Exam Paper:",
      paper
    );


    if (!paper) {

      console.log(
        "❌ SKIPPED: examPaperId not found"
      );

      continue;
    }


    // --------------------------------------------------------
    // EXAM SESSION
    // --------------------------------------------------------

    const session = paper.examSessionId;

    console.log(
      "Exam Session:",
      session
    );


    if (!session) {

      console.log(
        "❌ SKIPPED: examSessionId not found"
      );

      continue;
    }


    // --------------------------------------------------------
    // PUBLISHED STATUS
    // --------------------------------------------------------

    console.log(
      "Published:",
      session.published
    );

    console.log(
      "Session Deleted:",
      session.isDeleted
    );


    // --------------------------------------------------------
    // ONLY SHOW PUBLISHED EXAMS
    // --------------------------------------------------------

    if (
      session.published !== true ||
      session.isDeleted === true
    ) {

      console.log(
        "❌ SKIPPED: Exam is not published or is deleted"
      );

      continue;
    }


    // --------------------------------------------------------
    // EXAM TITLE
    // --------------------------------------------------------

    const title = session.examTitleId;

    console.log(
      "Exam Title:",
      title
    );


    if (!title) {

      console.log(
        "❌ SKIPPED: examTitleId not found"
      );

      continue;
    }


    // --------------------------------------------------------
    // RESULT ACCEPTED
    // --------------------------------------------------------

    console.log(
      "✅ RESULT ACCEPTED"
    );


    const sessionId =
      session._id.toString();


    // ========================================================
    // CREATE EXAM GROUP
    // ========================================================

    if (!examMap.has(sessionId)) {

      console.log(
        "Creating new exam group:",
        sessionId
      );


      examMap.set(
        sessionId,
        {
          examSessionId:
            session._id,

          examTitleId:
            title._id,

          examTitle:
            title.title,

          published:
            session.published,

          publishedAt:
            session.publishedAt,

          subjects: [],
        }
      );

    }


    // ========================================================
    // ADD SUBJECT RESULT
    // ========================================================

    examMap
      .get(sessionId)
      .subjects
      .push({

        examPaperId:
          paper._id,

        subjectId:
          paper.subjectId?._id ?? null,

        subjectCode:
          paper.subjectId?.subjectCode ?? null,

        subjectName:
          paper.subjectId?.subjectName ?? null,

        conductedMark:
          paper.conductedMark ?? null,

        obtainedMark:
          mark.obtainedMark ?? null,

        displayOrder:
          paper.displayOrder ?? 999,

      });


    console.log(
      "✅ Subject result added"
    );

  }


  // ==========================================================
  // CONVERT MAP TO ARRAY
  // ==========================================================

  const results =
    Array.from(
      examMap.values()
    );


  // ==========================================================
  // DEBUG - FINAL RESULTS
  // ==========================================================

  console.log("\n========================================");
  console.log("FINAL EXAM RESULTS");
  console.log("========================================");

  console.log(
    "Total Exams:",
    results.length
  );

  console.log(
    JSON.stringify(
      results,
      null,
      2
    )
  );

  console.log("========================================\n");


  // ==========================================================
  // SORT SUBJECTS
  // ==========================================================

  for (const exam of results) {

    exam.subjects.sort(
      (a, b) =>
        a.displayOrder -
        b.displayOrder
    );


    exam.subjects =
      exam.subjects.map(
        ({
          displayOrder,
          ...subject
        }) => subject
      );

  }


  // ==========================================================
  // SORT EXAMS BY PUBLISHED DATE
  // ==========================================================

  results.sort(
    (a, b) => {

      const dateA =
        a.publishedAt
          ? new Date(a.publishedAt)
          : new Date(0);


      const dateB =
        b.publishedAt
          ? new Date(b.publishedAt)
          : new Date(0);


      return dateA - dateB;

    }
  );


  // ==========================================================
  // RESPONSE
  // ==========================================================

  return {

    student: {

      id:
        student._id,

      registerNumber:
        student.registerNumber,

      studentName:
        student.studentName,

      studentEmail:
        student.studentEmail,

    },

    results,

  };

};
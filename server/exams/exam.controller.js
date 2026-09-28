import {
  createExamTitleService,
  getAllExamTitleService,
   getSingleExamTitleService,
     updateExamTitleService,
     deleteExamTitleService,
     restoreExamTitleService,
     permanentDeleteExamTitleService,

    //  exam session +paper
    getStudentExamResultService,
    createExamSessionService,
    getAllExamSessionService,
    getSingleExamSessionService,
    updateExamSessionService,
    deleteExamSessionService,
    restoreExamSessionService,
    permanentDeleteExamSessionService,
    getExamSessionsByClassService,


    // STD MARK UPLOAD
    saveStudentExamMarksService,
    getStudentExamMarksService,
    updateStudentExamMarksService,
    deleteStudentExamMarksService,

    restoreStudentExamMarksService,
permanentDeleteStudentExamMarksService,
getExamPaperListService,
getExamResultReportService
} from "./exam.service.js";








// EXAM TITLE 

// create exam title 
export const createExamTitle =
  async (req, res) => {
    try {
      const examTitle =
        await createExamTitleService(
          req.body
        );

      return res.status(201).json({
        success: true,

        message:
          "Exam title created successfully.",

        data: examTitle,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,

        message:
          error.message,
      });
    }
  };
//   get all exam title 
export const getAllExamTitle =
  async (req, res) => {
    try {
      const result =
        await getAllExamTitleService(
          req.query
        );

      return res.status(200).json({
        success: true,

        message:
          "Exam titles fetched successfully.",

        currentPage:
          result.currentPage,

        totalPages:
          result.totalPages,

        totalRecords:
          result.totalRecords,

        limit:
          result.limit,

        data:
          result.data,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,

        message:
          error.message,
      });
    }
  };
// get single exam title
export const getSingleExamTitle =
  async (req, res) => {
    try {
      const examTitle =
        await getSingleExamTitleService(
          req.params.id
        );

      return res.status(200).json({
        success: true,

        message:
          "Exam title fetched successfully.",

        data: examTitle,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,

        message:
          error.message,
      });
    }
  };
// update exam title
export const updateExamTitle =
  async (req, res) => {
    try {
      const examTitle =
        await updateExamTitleService(
          req.params.id,
          req.body
        );

      return res.status(200).json({
        success: true,

        message:
          "Exam title updated successfully.",

        data: examTitle,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,

        message:
          error.message,
      });
    }
  };
// delete exam title 
export const deleteExamTitle =
  async (req, res) => {
    try {
      const examTitle =
        await deleteExamTitleService(
          req.params.id
        );

      return res.status(200).json({
        success: true,

        message:
          "Exam title moved to recycle bin successfully.",

        data: examTitle,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,

        message:
          error.message,
      });
    }
  };
//   restore exam title
export const restoreExamTitle =
  async (req, res) => {
    try {
      const examTitle =
        await restoreExamTitleService(
          req.params.id
        );

      return res.status(200).json({
        success: true,

        message:
          "Exam title restored successfully.",

        data: examTitle,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,

        message:
          error.message,
      });
    }
  };
// delete permanantly
export const permanentDeleteExamTitle =
  async (req, res) => {
    try {
      await permanentDeleteExamTitleService(
        req.params.id
      );

      return res.status(200).json({
        success: true,

        message:
          "Exam title permanently deleted successfully.",
      });
    } catch (error) {
      return res.status(400).json({
        success: false,

        message:
          error.message,
      });
    }
  };  










//   exam session + exam paper 
export const createExamSession =
  async (req, res) => {
    try {

      console.log(req.user);

      const examSession =
        await createExamSessionService(
          req.body,
          req.user
        );

      return res.status(201).json({
        success: true,
        message: "Exam session created successfully.",
        data: examSession,
      });

    } catch (error) {

      return res.status(400).json({
        success: false,
        message: error.message,
      });

    }
  };
//   get all exam session 
export const getAllExamSession =
  async (req, res) => {
    try {
      const result =
        await getAllExamSessionService(
          req.query
        );

      return res.status(200).json({
        success: true,

        message:
          "Exam sessions fetched successfully.",

        currentPage:
          result.currentPage,

        totalPages:
          result.totalPages,

        totalRecords:
          result.totalRecords,

        limit:
          result.limit,

        data: result.data,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,

        message:
          error.message,
      });
    }
  };
//   get single exam session
export const getSingleExamSession =
  async (req, res) => {
    try {
      const examSession =
        await getSingleExamSessionService(
          req.params.id
        );

      return res.status(200).json({
        success: true,
        message:
          "Exam session fetched successfully.",
        data: examSession,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message:
          error.message,
      });
    }
  };
//  update exam session and exam paper function 
export const updateExamSession =
  async (req, res) => {
    try {
      const result =
        await updateExamSessionService(
    req.params.examSessionId,
    req.body,
    req.user.userId
);

      return res.status(200).json({
        success: true,

        message:
          "Exam session updated successfully.",

        data: result,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,

        message:
          error.message,
      });
    }
  };
// delete exam session 
export const deleteExamSession =
  async (req, res) => {
    try {
      await deleteExamSessionService(
        req.params.id
      );

      return res.status(200).json({
        success: true,

        message:
          "Exam session moved to recycle bin successfully.",
      });
    } catch (error) {
      return res.status(400).json({
        success: false,

        message:
          error.message,
      });
    }
  };
//   restore exam session 
export const restoreExamSession =
  async (req, res) => {
    try {
      await restoreExamSessionService(
        req.params.id
      );

      return res.status(200).json({
        success: true,

        message:
          "Exam session restored successfully.",
      });
    } catch (error) {
      return res.status(400).json({
        success: false,

        message:
          error.message,
      });
    }
  };
//   dellete from db exam session and exam paper
export const permanentDeleteExamSession =
  async (req, res) => {
    try {
      await permanentDeleteExamSessionService(
        req.params.id
      );

      return res.status(200).json({
        success: true,

        message:
          "Exam session permanently deleted successfully.",
      });
    } catch (error) {
      return res.status(400).json({
        success: false,

        message:
          error.message,
      });
    }
  };
//   get exam session by class id 
export const getExamSessionsByClass =
  async (req, res) => {
    try {
      const result =
        await getExamSessionsByClassService(
          req.params.classId
        );

      return res.status(200).json({
        success: true,

        message:
          "Exam sessions fetched successfully.",

        data: result,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,

        message:
          error.message,
      });
    }
  };








// POST STD MARK 
// ==========================================================
// SAVE STUDENT EXAM MARKS
// ==========================================================

export const saveStudentExamMarks =
  async (req, res) => {

    try {

      // ======================================================
      // DEBUG USER
      // ======================================================

      console.log(
        "USER =>",
        req.user
      );


      // ======================================================
      // SAVE MARKS
      // ======================================================

      const result =
        await saveStudentExamMarksService(

          req.body,

          req.user.userId

        );


      // ======================================================
      // SUCCESS RESPONSE
      // ======================================================

      return res.status(200).json({

        success: true,

        message:
          "Student marks saved and result published successfully.",

        data:
          result,

      });

    } catch (error) {

      // ======================================================
      // ERROR
      // ======================================================

      console.error(
        "SAVE STUDENT EXAM MARKS ERROR:",
        error
      );


      return res.status(400).json({

        success: false,

        message:
          error.message,

      });

    }

  }; 
  // new repo
  // get exam paper result
  export const getStudentExamMarks =
  async (req, res) => {
    try {
      const result =
        await getStudentExamMarksService(
          req.params.id
        );

      return res.status(200).json({
        success: true,

        message:
          "Student marks fetched successfully.",

        data: result,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,

        message:
          error.message,
      });
    }
  };
  // update exam results 
export const updateStudentExamMarks =
  async (req, res) => {
    try {
      const result =
   await updateStudentExamMarksService(
    req.body,
    req.user.userId
);

      return res.status(200).json({
        success: true,

        message:
          "Student marks updated successfully.",

        data: result,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,

        message:
          error.message,
      });
    }
  };
// delete exam results function 
export const deleteStudentExamMarks =
  async (req, res) => {
    try {
      const result =
        await deleteStudentExamMarksService(
          req.params.examPaperId
        );

      return res.status(200).json({
        success: true,
        message:
          "Student marks deleted successfully.",
        deletedCount:
          result.deletedCount,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message:
          error.message,
      });
    }
  };

// restore the exam result
export const restoreStudentExamMarks =
  async (req, res) => {

    try{

      const result =
        await restoreStudentExamMarksService(

          req.params.examPaperId

        );

      return res.status(200).json({

        success:true,

        message:
          "Student marks restored successfully.",

        restoredCount:
          result.restoredCount,

      });

    }catch(error){

      return res.status(400).json({

        success:false,

        message:
          error.message,

      });

    }

  };

//  delete the exam result from the db 
export const permanentDeleteStudentExamMarks =
  async (req,res)=>{

    try{

      const result =
        await permanentDeleteStudentExamMarksService(

          req.params.examPaperId

        );

      return res.status(200).json({

        success:true,

        message:
          "Student marks permanently deleted successfully.",

        deletedCount:
          result.deletedCount,

      });

    }catch(error){

      return res.status(400).json({

        success:false,

        message:
          error.message,

      });

    }

  };


  // get exam paper 
// ======================================================
// GET EXAM PAPER LIST
// ======================================================

// ======================================================
// GET EXAM PAPER LIST
// ======================================================

export const getExamPaperList =
  async (req, res) => {

    try {

      const {
        classId,
        examTitleId,
      } = req.query;


      // ==================================================
      // VALIDATE CLASS ID
      // ==================================================

      if (!classId) {

        return res.status(400).json({

          success: false,

          message:
            "Class ID is required.",

        });

      }


      // ==================================================
      // VALIDATE EXAM TITLE ID
      // ==================================================

      if (!examTitleId) {

        return res.status(400).json({

          success: false,

          message:
            "Exam title ID is required.",

        });

      }


      // ==================================================
      // GET EXAM PAPERS
      // ==================================================

      const result =
        await getExamPaperListService(

          classId,

          examTitleId,

          req.user

        );


      // ==================================================
      // RESPONSE
      // ==================================================

      return res.status(200).json({

        success: true,

        message:
          "Exam papers fetched successfully.",

        count:
          result.length,

        data:
          result,

      });

    } catch (error) {

      return res.status(400).json({

        success: false,

        message:
          error.message,

      });

    }

  };

  // get exam result paper 
  export const getExamResultReport =
  async (req,res)=>{

    try{

      const result =
        await getExamResultReportService(

          req.params.examPaperId

        );

      return res.status(200).json({

        success:true,

        message:
          "Exam result report fetched successfully.",

        data:
          result,

      });

    }catch(error){

      return res.status(400).json({

        success:false,

        message:
          error.message,

      });

    }

  };


  // ======================================================
// GET COMPLETE EXAM RESULTS FOR STUDENT
// ======================================================

// ======================================================
// STUDENT EXAM RESULT
// ======================================================

export const getStudentExamResult = async (
  req,
  res
) => {

  try {

    const { studentId } = req.params;

    if (!studentId) {

      return res.status(400).json({

        success: false,

        message:
          "Student ID is required.",

      });

    }


    const result =
      await getStudentExamResultService(
        studentId
      );


    return res.status(200).json({

      success: true,

      data: result,

    });

  } catch (error) {

    console.error(
      "GET STUDENT EXAM RESULT ERROR:",
      error
    );


    return res.status(500).json({

      success: false,

      message:
        error.message ||
        "Failed to fetch student exam results.",

    });

  }

};
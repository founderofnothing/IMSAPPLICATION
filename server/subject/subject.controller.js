import {
  createProgrammeStructureService,
  addSemesterService,
  removeSemesterService,
  getProgrammeStructureService,

  createSubjectService,
  getSubjectsService,
  updateSubjectService,
  deleteSubjectService,
  getProgrammeBatchesService,

  restoreSubjectService,
  getDeletedSubjectsService,
  permanentDeleteSubjectService,
  updateCurrentSemesterService,
  getCurrentSemesterSubjectsService

} from "./subject.service.js";








// ==================== CREATE PROGRAMME STRUCTURE ====================
export const createProgrammeStructure =
  async (req, res) => {

    try {

      const programmeStructure =
        await createProgrammeStructureService(

          req.body.programmeId,

          req.user

        );

      return res.status(201).json({

        success: true,

        message:
          "Programme structure created successfully.",

        data:
          programmeStructure,

      });

    } catch (error) {

      return res.status(400).json({

        success: false,

        message:
          error.message,

      });

    }

  };
  // ==================== ADD SEMESTER ====================
export const addSemester =
  async (req, res) => {

    try {

      const programmeStructure =
        await addSemesterService(

          req.params.programmeId,

          req.body.studyYear

        );

      return res.status(200).json({

        success: true,

        message:
          "Semester added successfully.",

        data:
          programmeStructure,

      });

    } catch (error) {

      return res.status(400).json({

        success: false,

        message:
          error.message,

      });

    }

  };
  // ==================== REMOVE SEMESTER ====================
export const removeSemester =
  async (req, res) => {

    try {

      const programmeStructure =
        await removeSemesterService(

          req.params.programmeId,

          req.body.studyYear,

          req.body.semesterNumber

        );

      return res.status(200).json({

        success: true,

        message:
          "Semester removed successfully.",

        data:
          programmeStructure,

      });

    } catch (error) {

      return res.status(400).json({

        success: false,

        message:
          error.message,

      });

    }

  };
  // ==================== GET PROGRAMME STRUCTURE ====================
export const getProgrammeStructure =
  async (req, res) => {

    try {

      const programmeStructure =
        await getProgrammeStructureService(
          req.params.programmeId
        );

      return res.status(200).json({

        success: true,

        data:
          programmeStructure,

      });

    } catch (error) {

      return res.status(404).json({

        success: false,

        message:
          error.message,

      });

    }

  };



  // ==================== CREATE SUBJECT ====================

export const createSubject = async (
  req,
  res
) => {

  try {

    const subject =
      await createSubjectService(

        req.body,

        req.user

      );

    return res.status(201).json({

      success: true,

      message:
        "Subject created successfully.",

      data:
        subject,

    });

  } catch (error) {

    return res.status(400).json({

      success: false,

      message:
        error.message,

    });

  }

};
// get subject 
export const getSubjects = async (
  req,
  res
) => {

  try {

    const subjects =
      await getSubjectsService(

        req.params.programmeId,

        req.params.studyYear,

        req.params.semesterNumber

      );

    return res.status(200).json({

      success: true,

      count:
        subjects.length,

      data:
        subjects,

    });

  } catch (error) {

    return res.status(404).json({

      success: false,

      message:
        error.message,

    });

  }

};


// update subject 
export const updateSubject = async (
  req,
  res
) => {

  try {

    const subject =
      await updateSubjectService(

        req.params.id,

        req.body

      );

    return res.status(200).json({

      success: true,

      message:
        "Subject updated successfully.",

      data:
        subject,

    });

  } catch (error) {

    return res.status(400).json({

      success: false,

      message:
        error.message,

    });

  }

};

// ==================== DELETE SUBJECT ====================

export const deleteSubject = async (
  req,
  res
) => {

  try {

    await deleteSubjectService(

      req.params.id

    );

    return res.status(200).json({

      success: true,

      message:
        "Subject deleted successfully.",

    });

  } catch (error) {

    return res.status(404).json({

      success: false,

      message:
        error.message,

    });

  }

};



export const restoreSubject = async (req, res) => {
  try {

    const subject = await restoreSubjectService(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Subject restored successfully.",
      data: subject,
    });

  } catch (error) {

    return res.status(400).json({
      success: false,
      message: error.message,
    });

  }
};


// ==================== GET DELETED SUBJECTS ====================
export const getDeletedSubjects =
  async (
    req,
    res
  ) => {

    try {

      const subjects =
        await getDeletedSubjectsService(
          req.user
        );

      return res.status(200).json({

        success: true,

        count:
          subjects.length,

        data:
          subjects,

      });

    } catch (error) {

      return res.status(500).json({

        success: false,

        message:
          error.message,

      });

    }

};




export const permanentDeleteSubject =
  async (
    req,
    res
  ) => {

    try {

      await permanentDeleteSubjectService(
        req.params.id
      );

      return res.status(200).json({

        success: true,

        message:
          "Subject permanently deleted.",

      });

    } catch (error) {

      return res.status(400).json({

        success: false,

        message:
          error.message,

      });

    }

};


// ==================== UPDATE CURRENT SEMESTER ====================

// ==================== UPDATE CURRENT SEMESTER ====================
export const updateCurrentSemester = async (
  req,
  res
) => {

  console.log(
    "CURRENT SEMESTER BODY:",
    req.body
  );

  console.log(
    "CURRENT SEMESTER PARAMS:",
    req.params
  );

  try {

    const programmeStructure =
      await updateCurrentSemesterService(
        req.params.programmeId,
        req.params.batchId,
        req.body.semesterNumber
      );

    return res.status(200).json({
      success: true,
      message:
        "Current semester updated successfully.",
      data: programmeStructure,
    });

  } catch (error) {

    return res.status(400).json({
      success: false,
      message: error.message,
    });

  }
};

export const getProgrammeBatches = async (
  req,
  res
) => {

  try {

    const batches =
      await getProgrammeBatchesService(
        req.params.programmeId
      );

    return res.status(200).json({

      success: true,

      count: batches.length,

      data: batches,

    });

  } catch (error) {

    return res.status(400).json({

      success: false,

      message: error.message,

    });

  }

};


// ==================== GET CURRENT SEMESTER SUBJECTS ====================

// ==================== GET CURRENT SEMESTER SUBJECTS ====================

export const getCurrentSemesterSubjects =
  async (
    req,
    res
  ) => {

    try {

      const data =
        await getCurrentSemesterSubjectsService(
          req.params.classId
        );

      return res.status(200).json({

        success: true,

        data,

      });

    } catch (error) {

      return res.status(500).json({

        success: false,

        message:
          error.message,

      });

    }

  };









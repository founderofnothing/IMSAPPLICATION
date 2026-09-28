import {
     createClassService ,
  getAllClassesService,
    updateClassService,
      deleteClassService,
      getClassesByDepartmentService,
  getMyClassesService,
  getDeletedClassesService,
  restoreClassService,
  permanentDeleteClassService,
  getSingleClassService,
  getMyClassService,
  assignClassInchargeService,
  
getMyInstitutionClassesService
} from "./class.service.js";



// create class function
export const createClass = async (req, res) => {
  try {
    const newClass = await createClassService({
      ...req.body,
      institution: req.user.institution,
    });

    return res.status(201).json({
      success: true,
      message: "Class created successfully",
      data: newClass,
    });

  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};


// get all classes 
export const getAllClasses = async (
  req,
  res
) => {
  try {
    const classes =
      await getAllClassesService();

    return res.status(200).json({
      success: true,
      count: classes.length,
      data: classes,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// get my insitution classes
// get classes for logged-in institution
export const getMyInstitutionClasses = async (req, res) => {
  try {
    const classes =
      await getMyInstitutionClassesService(
        req.user.institution,
        req.query
      );

    return res.status(200).json({
      success: true,
      count: classes.length,
      data: classes,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// get single classes
// ==================== GET SINGLE CLASS ====================

export const getSingleClass = async (req, res) => {
  try {
    const result = await getSingleClassService(
      req.params.id
    );

    // Security check
    if (
      result.class.institution._id.toString() !==
      req.user.institution.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You cannot access this class.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Class fetched successfully.",
      data: result.class,
      studentCount: result.studentCount,
      students: result.students,
    });

  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

// update classes fuction 
export const updateClass = async (
  req,
  res
) => {
  try {
    const updatedClass =
      await updateClassService(
        req.params.id,
        req.body
      );

    return res.status(200).json({
      success: true,
      message: "Class updated successfully",
      data: updatedClass,
    });

  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};


// delete classes function 
export const deleteClass = async (
  req,
  res
) => {
  try {
    await deleteClassService(
      req.params.id
    );

    return res.status(200).json({
      success: true,
      message: "Class deleted successfully",
    });

  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};


// get classes by department 

export const getClassesByDepartment =
  async (req, res) => {
    try {
      const classes =
        await getClassesByDepartmentService(
          req.params.departmentId
        );

      return res.status(200).json({
        success: true,
        count: classes.length,
        data: classes,
      });

    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };


  // get classes by user jwt 

  export const getMyClasses = async (
  req,
  res
) => {
  try {
    const classes =
      await getMyClassesService(
        req.user.department
      );

    return res.status(200).json({
      success: true,
      count: classes.length,
      data: classes,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// get all deleted class
export const getDeletedClasses =
  async (req, res) => {
    try {

      const classes =
        await getDeletedClassesService();

      return res.status(200).json({
        success: true,

        message:
          classes.length > 0
            ? "Deleted classes fetched successfully."
            : "No deleted classes found.",

        count:
          classes.length,

        data:
          classes,
      });

    } catch (error) {

      return res.status(400).json({
        success: false,
        message:
          error.message,
      });

    }
  };


  // restore class function 
  export const restoreClass =
  async (req, res) => {

    try {

      const classData =
        await restoreClassService(
          req.params.id
        );

      return res.status(200).json({
        success: true,

        message:
          "Class restored successfully.",

        data:
          classData,
      });

    } catch (error) {

      return res.status(400).json({
        success: false,

        message:
          error.message,
      });

    }
  };



  // delete class form db
  export const permanentDeleteClass =
  async (req, res) => {

    try {

      await permanentDeleteClassService(
        req.params.id
      );

      return res.status(200).json({

        success: true,

        message:
          "Class permanently deleted successfully.",

      });

    } catch (error) {

      return res.status(400).json({

        success: false,

        message:
          error.message,

      });

    }
  };


export const assignClassIncharge = async (
  req,
  res
) => {

  try {

    const { id } = req.params;

    const {
      classIncharge,
    } = req.body;


    const updatedClass =
      await assignClassInchargeService(
        id,
        classIncharge || null,
        req.user.institution
      );


    return res.status(200).json({

      success: true,

      message:
        classIncharge
          ? "Class incharge assigned successfully."
          : "Class incharge removed successfully.",

      data: updatedClass,

    });

  } catch (error) {

    return res.status(400).json({

      success: false,

      message: error.message,

    });

  }

};

// =====================================================
// GET MY CLASS
// =====================================================

export const getMyClass = async (req, res) => {

  try {

    const data =
      await getMyClassService(
        req.user
      );


    return res.status(200).json({

      success: true,

      message:
        "My class fetched successfully.",

      data,

    });

  } catch (error) {

    // ================================================
    // NO CLASS
    // ================================================

    if (
      error.message ===
      "No class is assigned to you as class incharge."
    ) {

      return res.status(404).json({

        success: false,

        message:
          error.message,

        data: null,

      });

    }


    // ================================================
    // INVALID USER
    // ================================================

    if (
      error.message ===
        "Invalid user ID." ||
      error.message ===
        "User information not found."
    ) {

      return res.status(400).json({

        success: false,

        message:
          error.message,

      });

    }


    // ================================================
    // OTHER ERROR
    // ================================================

    return res.status(500).json({

      success: false,

      message:
        error.message,

    });

  }

};
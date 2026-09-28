import mongoose from "mongoose";
import {
    
   createProgrammeService,
  getAllProgrammesService,
  updateProgrammeService,
  deleteProgrammeService,
  getDeletedProgrammesService,
  restoreProgrammeService,
  permanentDeleteProgrammeService,
  getProgrammesByDepartmentService,
  getMyDepartmentProgrammesService,
  getProgrammeDetailsService,
  getInstitutionProgrammesWithStudentCountService

 
} from "./programme.service.js";



// ============================================================
// GET INSTITUTION PROGRAMMES WITH STUDENT COUNT
// ============================================================

export const getInstitutionProgrammesWithStudentCount =
  async (req, res) => {
    try {
      const institutionId = req.user.institution;

      if (!institutionId) {
        return res.status(400).json({
          success: false,
          message: "Institution not found in token.",
        });
      }

      const programmes =
        await getInstitutionProgrammesWithStudentCountService(
          institutionId
        );

      return res.status(200).json({
        success: true,
        count: programmes.length,
        data: programmes,
      });
    } catch (error) {
      console.error(
        "GET INSTITUTION PROGRAMMES ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };


  export const getProgrammeDetails =
  async (req, res) => {
    try {
      const { id } = req.params;

      const institutionId =
        req.user.institution;

      if (!institutionId) {
        return res.status(400).json({
          success: false,
          message: "Institution not found in token.",
        });
      }

      const programme =
        await getProgrammeDetailsService(
          id,
          institutionId
        );

      return res.status(200).json({
        success: true,
        data: programme,
      });
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
  };



// post programme function
export const createProgramme = async (
  req,
  res
) => {
  try {
    const programme = await createProgrammeService(
      req.body
    );

    return res.status(201).json({
      success: true,
      message: "Programme created successfully",
      data: programme,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// get all programme function 
export const getAllProgrammes = async (
    req,
    res
  ) => {
    try {
      const programmes =
        await getAllProgrammesService();
  
      return res.status(200).json({
        success: true,
        count: programmes.length,
        data: programmes,
      });
  
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

  // update programme function 
  export const updateProgramme = async (
  req,
  res
) => {
  try {
    const programme =
      await updateProgrammeService(
        req.params.id,
        req.body
      );

    return res.status(200).json({
      success: true,
      message:
        "Programme updated successfully",
      data: programme,
    });

  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// delete programme function 
export const deleteProgramme = async (
  req,
  res
) => {
  try {
    await deleteProgrammeService(
      req.params.id
    );

    return res.status(200).json({
      success: true,
      message:
  "Programme moved to recycle bin successfully",
    });

  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};
// get the deleted programme form the recycle bin 
export const getDeletedProgrammes =
  async (req, res) => {
    try {
      const programmes =
        await getDeletedProgrammesService();

      return res.status(200).json({
        success: true,
        count:
          programmes.length,
        data: programmes,
      });

    } catch (error) {
      return res.status(500).json({
        success: false,
        message:
          error.message,
      });
    }
};
// restore the deleted programme
export const restoreProgramme =
  async (req, res) => {
    try {
      const programme =
        await restoreProgrammeService(
          req.params.id
        );

      return res.status(200).json({
        success: true,
        message:
          "Programme restored successfully.",
        data: programme,
      });

    } catch (error) {
      return res.status(400).json({
        success: false,
        message:
          error.message,
      });
    }
};
// delete the programme from the db 
export const permanentDeleteProgramme =
  async (req, res) => {
    try {
      await permanentDeleteProgrammeService(
        req.params.id
      );

      return res.status(200).json({
        success: true,
        message:
          "Programme permanently deleted.",
      });

    } catch (error) {
      return res.status(404).json({
        success: false,
        message:
          error.message,
      });
    }
};
// get all the programme from the department 
export const getProgrammesByDepartment =
  async (req, res) => {
    try {
      const programmes =
        await getProgrammesByDepartmentService(
          req.params.departmentId
        );

      return res.status(200).json({
        success: true,
        count:
          programmes.length,
        data: programmes,
      });

    } catch (error) {
      return res.status(500).json({
        success: false,
        message:
          error.message,
      });
    }
};


// ==================== GET MY DEPARTMENT PROGRAMMES ====================
export const getMyDepartmentProgrammes =
  async (req, res) => {

    try {

      const programmes =
        await getMyDepartmentProgrammesService(
          req.user
        );

      return res.status(200).json({

        success: true,

        count:
          programmes.length,

        data:
          programmes,

      });

    } catch (error) {

      return res.status(500).json({

        success: false,

        message:
          error.message,

      });

    }

};
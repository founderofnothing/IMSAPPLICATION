import { 
  
  createInstitutionService,
  getAllInstitutionsService,
  getInstitutionByIdService,
  updateInstitutionService,
  deleteInstitutionService,
  getDeletedInstitutionsService,
  restoreInstitutionService,
  permanentDeleteInstitutionService,
  getMyInstitutionService,
  getDepartmentsByInstitutionService,
} from "./institution.service.js";





// create institution
export const createInstitution = async (req, res) => {
  try {
    const institution =
      await createInstitutionService(req.body);

    return res.status(201).json({
      success: true,
      message: "Institution created successfully",
      data: institution,
    });

  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
// get all institution 
export const getAllInstitutions = async (req, res) => {
    try {
      const institutions =
        await getAllInstitutionsService();
  
      return res.status(200).json({
        success: true,
        count: institutions.length,
        data: institutions,
      });
  
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
};
//   get single institution by id 
export const getInstitutionById = async (
    req,
    res
  ) => {
    try {
      const institution =
        await getInstitutionByIdService(
          req.params.id
        );
  
      return res.status(200).json({
        success: true,
        data: institution,
      });
  
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
};

// update institution 
export const updateInstitution = async (
  req,
  res
) => {
  try {

    const institution =
      await updateInstitutionService(
        req.params.id,
        req.body
      );

    return res.status(200).json({
      success: true,
      message:
        "Institution updated successfully",
      data: institution,
    });

  } catch (error) {

    return res.status(400).json({
      success: false,
      message: error.message,
    });

  }
};
// delete institution function 
export const deleteInstitution = async (
    req,
    res
  ) => {
    try {
      await deleteInstitutionService(
        req.params.id
      );
  
      return res.status(200).json({
        success: true,
        message:
          "Institution deleted successfully",
      });
  
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
};  
// get all deleted insitution 
export const getDeletedInstitutions =
  async (req, res) => {
    try {
      const institutions =
        await getDeletedInstitutionsService();

      return res.status(200).json({
        success: true,
        count: institutions.length,
        data: institutions,
      });

    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
};
// restore the deleted institution
export const restoreInstitution =
  async (req, res) => {
    try {
      const institution =
        await restoreInstitutionService(
          req.params.id
        );

      return res.status(200).json({
        success: true,
        message:
          "Institution restored successfully.",
        data: institution,
      });

    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
};
// delete the insitution from the db
export const permanentDeleteInstitution =
  async (req, res) => {
    try {
      await permanentDeleteInstitutionService(
        req.params.id
      );

      return res.status(200).json({
        success: true,
        message:
          "Institution permanently deleted.",
      });

    } catch (error) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
};












//   // GET INSTITUTION FROM JWT

export const getMyInstitution = async (
    req,
    res
  ) => {
    try {
      const institution =
        await getMyInstitutionService(
          req.user.institution
        );
  
      return res.status(200).json({
        success: true,
        data: institution,
      });
  
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
};


  // get dpt by int id
  export const getDepartmentsByInstitution = async (
  req,
  res
) => {
  try {
    const { institutionId } = req.params;

    const departments =
      await getDepartmentsByInstitutionService(
        institutionId
      );

    return res.status(200).json({
      success: true,
      message: "Departments fetched successfully",
      data: departments,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
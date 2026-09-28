import { 
    createDepartmentService,
  getAllDepartmentsService,
  getDepartmentByIdService,
  updateDepartmentService,
  deleteDepartmentService,

  getDeletedDepartmentsService,
  restoreDepartmentService,
  permanentDeleteDepartmentService,
  getDepartmentOverviewService,

  getMyDepartmentService,

} from "./department.service.js";


export const getDepartmentOverviewController = async (
  req,
  res
) => {

  try {

    const {
      departmentId,
    } = req.params;

    const {
      studentPage,
      studentLimit,
      facultyPage,
      facultyLimit,
    } = req.query;


    const data =
      await getDepartmentOverviewService(
        departmentId,
        {
          studentPage,
          studentLimit,
          facultyPage,
          facultyLimit,
        }
      );


    return res.status(200).json({

      success: true,

      message:
        "Department overview fetched successfully.",

      data,

    });

  } catch (error) {

    return res.status(400).json({

      success: false,

      message:
        error.message ||
        "Failed to fetch department overview.",

    });

  }
};


// post  department function
export const createDepartment = async (
  req,
  res
) => {
  try {
    const department =
      await createDepartmentService(
        req.body
      );

    return res.status(201).json({
      success: true,
      message:
        "Department created successfully",
      data: department,
    });

  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// get all department 

export const getAllDepartments = async (
  req,
  res
) => {
  try {
    const departments =
      await getAllDepartmentsService();

    return res.status(200).json({
      success: true,
      count: departments.length,
      data: departments,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// get single department
export const getDepartmentById = async (
  req,
  res
) => {
  try {
    const department =
      await getDepartmentByIdService(
        req.params.id
      );

    return res.status(200).json({
      success: true,
      data: department,
    });

  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};


// update department controlller 
export const updateDepartment = async (
  req,
  res
) => {
  try {
    const updatedDepartment =
      await updateDepartmentService(
        req.params.id,
        req.body
      );

    return res.status(200).json({
      success: true,
      message:
        "Department updated successfully",
      data: updatedDepartment,
    });

  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};


// delete function 
export const deleteDepartment = async (
  req,
  res
) => {
  try {
    await deleteDepartmentService(
      req.params.id
    );

    return res.status(200).json({
      success: true,
      message:
        "Department deleted successfully",
    });

  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

// get all deleted department 
export const getDeletedDepartments =
  async (req, res) => {
    try {

      const departments =
        await getDeletedDepartmentsService();

      return res.status(200).json({
        success: true,
        count:
          departments.length,

        data: departments,
      });

    } catch (error) {

      return res.status(500).json({
        success: false,
        message:
          error.message,
      });
    }
};
// restore the deleted department 
export const restoreDepartment =
  async (req, res) => {
    try {

      const department =
        await restoreDepartmentService(
          req.params.id
        );

      return res.status(200).json({
        success: true,
        message:
          "Department restored successfully.",

        data:
          department,
      });

    } catch (error) {

      return res.status(400).json({
        success: false,
        message:
          error.message,
      });
    }
};
// deleted from the db
export const permanentDeleteDepartment =
  async (req, res) => {
    try {

      await permanentDeleteDepartmentService(
        req.params.id
      );

      return res.status(200).json({
        success: true,
        message:
          "Department permanently deleted.",
      });

    } catch (error) {

      return res.status(404).json({
        success: false,
        message:
          error.message,
      });
    }
};

// get dpt info with jwt 

export const getMyDepartment = async (
  req,
  res
) => {
  try {
   console.log(
  "Department:",
  req.user.department
);

const department =
  await getMyDepartmentService(
    req.user.department
  );

    return res.status(200).json({
      success: true,
      data: department,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
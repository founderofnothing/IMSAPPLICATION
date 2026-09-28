import { 
  createUserService ,
  updateUserService,
 getAllFacultyService,

getAssignableStaffService,
// single faculty by id 
getUserByIdService,
getUserProfile,

//  soft delete user 
softDeleteUserService,
// get user for recycle bin 
getDeletedUsersService,
// restore the deleted user
restoreUserService,
// delete from the db permanantly 
permanentDeleteUserService,

updateMyProfileService,
 getUGTeachingFacultyService,
  getPGTeachingFacultyService,

getMyDepartmentTeachingFacultyService,
      getMyInstitutionTeachingFacultyService,
} from "./user.service.js";



// create user function 
export const createUser = async (
  req,
  res
) => {
  try {
 
if (req.body.profile) {
  if (
    typeof req.body.profile ===
    "string"
  ) {
    req.body.profile =
      JSON.parse(
        req.body.profile
      );
  }
}
    console.log("========== CREATE ==========");

console.log("FILE");
console.log(req.file);

console.log("BODY");
console.log(req.body);

console.log("============================");


const payload = {
  ...req.body,
  profileImage: req.file
    ? `/uploads/profile/${req.file.filename}`
    : null,
};

const user =
  await createUserService(
    payload
  );

    return res.status(201).json({
      success: true,
      message:
        "User created successfully",
      data: user,
    });

  } catch (error) {
    console.error(error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
// update all user function 
export const updateUser = async (
  req,
  res
) => {
  try {

 if (req.body.profile) {

      req.body.profile =
        JSON.parse(
          req.body.profile
        );

    }



  const payload = {
  ...req.body,
};

if (req.file) {

  payload.profileImage =
    `/uploads/profile/${req.file.filename}`;

}

const user =
  await updateUserService(
    req.params.id,
    payload
  );

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: user,
    });

  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
// get all faculty
export const getAllFaculty =
  async (
    req,
    res
  ) => {
    try {

      const result =
        await getAllFacultyService(
          req.query
        );

      return res.status(200).json({
        success: true,

        statistics:
          result.statistics,

        pagination: {
          currentPage:
            result.currentPage,

          totalPages:
            result.totalPages,

          totalRecords:
            result.totalRecords,
        },

        data:
          result.faculties,
      });

    } catch (error) {

      return res.status(400).json({
        success: false,
        message:
          error.message,
      });
    }
  };
  // get all faculty (hr version )
export const getAssignableStaff = async (
  req,
  res
) => {
  try {

    const result =
      await getAssignableStaffService(
        req.query
      );

    return res.status(200).json({

      success: true,

      statistics:
        result.statistics,

      pagination: {

        currentPage:
          result.currentPage,

        totalPages:
          result.totalPages,

        totalRecords:
          result.totalRecords,

      },

      data:
        result.staffs,

    });

  } catch (error) {

    return res.status(500).json({

      success: false,

      message:
        error.message,

    });

  }
};

// GET SINGLE USER
// ===============================


export const getUserById = async (req, res) => {

  try {

    const user = await getUserByIdService(
      req.params.id
    );


    return res.status(200).json({

      success: true,

      message: "User profile fetched successfully.",

      data: user,

    });


  } catch (error) {

    console.error(
      "getUserById error:",
      error
    );


    return res.status(404).json({

      success: false,

      message: error.message,

    });

  }

};





export const getMyProfile = async (req, res) => {
  try {
    console.log("REQ USER:", req.user);

  const user = await getUserProfile(
    req.user.userId
);

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};













// SOFT DELETE USER 
export const softDeleteUser = async (
  req,
  res
) => {
  try {
    const result =
      await softDeleteUserService(
        req.params.userId
      );

    return res.status(200).json({
      success: true,
      message: result.message,
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};


// RESTORE THE DELETED USER 
export const restoreUser = async (
  req,
  res
) => {
  try {
    const result =
      await restoreUserService(
        req.params.userId
      );

    return res.status(200).json({
      success: true,
      message: result.message,
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// FETCH ALL THE DELETED USER FOR RECYCLYE BIN 
export const getDeletedUsers = async (
  req,
  res
) => {
  try {
    const result =
      await getDeletedUsersService(
        req.query
      );

    return res.status(200).json({
      success: true,
      message:
        "Deleted users fetched successfully",
      data: result,
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};



// DELETE THE USER FROM THE BIN AND DB
export const permanentDeleteUser = async (
  req,
  res
) => {
  try {
    const result =
      await permanentDeleteUserService(
        req.params.userId
      );

    return res.status(200).json({
      success: true,
      message: result.message,
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};


























// fetch faculty by institution
export const getMyInstitutionTeachingFaculty =
  async (req, res) => {
    try {
      const page =
        parseInt(req.query.page) || 1;

      const limit =
        parseInt(req.query.limit) || 10;


        console.log(req.user.institution)
const result =
await getMyInstitutionTeachingFacultyService(
  req.user.institution,
  {
    page,
    limit,
    search: req.query.search || "",
    department: req.query.department || null,
    gender: req.query.gender || null,
    designation: req.query.designation || null,
    maritalStatus: req.query.maritalStatus || null,
    bloodGroup: req.query.bloodGroup || null,
  }
);

      return res.status(200).json({
        success: true,
message:
  result.totalRecords > 0
    ? "Institution teaching faculty fetched successfully."
    : "No teaching faculty found in this institution.",
        currentPage:
          result.currentPage,

        totalPages:
          result.totalPages,

        totalRecords:
          result.totalRecords,

        limit:
          result.limit,

        data:
          result.faculties,
      });

    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };
// fetch faculty by dpt  add the filter
export const getMyDepartmentTeachingFaculty = async (req, res) => {
  try {
    const result = await getMyDepartmentTeachingFacultyService(
      req.user.department,
      req.query
    );

    return res.status(200).json({
      success: true,

      message:
        result.totalRecords > 0
          ? "Teaching faculty fetched successfully."
          : "No teaching faculty found.",

      // =========================================
      // PAGINATION
      // =========================================

      currentPage: result.currentPage,
      totalPages: result.totalPages,
      totalRecords: result.totalRecords,
      limit: result.limit,

      // =========================================
      // FACULTY STATISTICS
      // =========================================

      totalFaculty: result.totalFaculty,
      maleFaculty: result.maleFaculty,
      femaleFaculty: result.femaleFaculty,

      // =========================================
      // FILTER OPTIONS
      // =========================================

      designationOptions: result.designationOptions,

      // =========================================
      // FACULTY LIST
      // =========================================

      data: result.faculties,
    });
  } catch (error) {
    console.error(
      "getMyDepartmentTeachingFaculty error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



  

// ============================================================
// UPDATE MY OWN PROFILE
// ============================================================

export const updateMyProfile = async (
  req,
  res
) => {

  try {

    // ========================================================
    // AUTHENTICATION CHECK
    // ========================================================

    if (!req.user?.userId) {

      return res.status(401).json({

        success: false,

        message:
          "Authentication required.",

      });

    }


    // ========================================================
    // PARSE PROFILE DATA
    // ========================================================
    // When using multipart/form-data,
    // profile arrives as a JSON string.

    let profile = req.body.profile;

    if (
      profile &&
      typeof profile === "string"
    ) {

      try {

        profile =
          JSON.parse(profile);

      } catch (error) {

        return res.status(400).json({

          success: false,

          message:
            "Invalid profile data format.",

        });

      }

    }


    // ========================================================
    // BUILD PAYLOAD
    // ========================================================

    const payload = {

      fullName:
        req.body.fullName,

      email:
        req.body.email,

      phone:
        req.body.phone,

      password:
        req.body.password,

      profile,

    };


    // ========================================================
    // PROFILE IMAGE
    // ========================================================
    // multer stores uploaded file in req.file

    if (req.file) {

      payload.profileImage =
        `/uploads/profile/${req.file.filename}`;

    }


    // ========================================================
    // UPDATE PROFILE
    // ========================================================

    const updatedProfile =
      await updateMyProfileService(

        req.user.userId,

        payload

      );


    // ========================================================
    // RESPONSE
    // ========================================================

    return res.status(200).json({

      success: true,

      message:
        "Profile updated successfully.",

      data:
        updatedProfile,

    });

  } catch (error) {

    console.error(
      "updateMyProfile error:",
      error
    );


    // ========================================================
    // VALIDATION / BUSINESS ERROR
    // ========================================================

    return res.status(400).json({

      success: false,

      message:
        error.message,

    });

  }

};



// get ug faculty for principal dashboard 
// ============================================================
// GET UG TEACHING FACULTY
// ============================================================

export const getUGTeachingFaculty = async (
  req,
  res
) => {

  try {

    const result =
      await getUGTeachingFacultyService({

        page:
          req.query.page || 1,

        limit:
          req.query.limit || 10,

        search:
          req.query.search || "",

        institution:
          req.query.institution || null,

        department:
          req.query.department || null,

        designation:
          req.query.designation || null,

      });


    return res.status(200).json({

      success: true,

      message:
        result.totalRecords > 0
          ? "UG teaching faculty fetched successfully."
          : "No UG teaching faculty found.",

      level:
        result.level,

      currentPage:
        result.currentPage,

      totalPages:
        result.totalPages,

      totalRecords:
        result.totalRecords,

      limit:
        result.limit,

      data:
        result.faculties,

    });

  } catch (error) {

    console.error(
      "getUGTeachingFaculty error:",
      error
    );

    return res.status(500).json({

      success: false,

      message:
        error.message,

    });

  }

};


// ============================================================
// GET PG TEACHING FACULTY
// ============================================================

export const getPGTeachingFaculty = async (
  req,
  res
) => {

  try {

    const result =
      await getPGTeachingFacultyService({

        page:
          req.query.page || 1,

        limit:
          req.query.limit || 10,

        search:
          req.query.search || "",

        institution:
          req.query.institution || null,

        department:
          req.query.department || null,

        designation:
          req.query.designation || null,

      });


    return res.status(200).json({

      success: true,

      message:
        result.totalRecords > 0
          ? "PG teaching faculty fetched successfully."
          : "No PG teaching faculty found.",

      level:
        result.level,

      currentPage:
        result.currentPage,

      totalPages:
        result.totalPages,

      totalRecords:
        result.totalRecords,

      limit:
        result.limit,

      data:
        result.faculties,

    });

  } catch (error) {

    console.error(
      "getPGTeachingFaculty error:",
      error
    );

    return res.status(500).json({

      success: false,

      message:
        error.message,

    });

  }

};
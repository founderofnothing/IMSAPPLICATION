import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import User from "../user/models/user.model.js"
import TeachingFaculty from "../user/models/teachingFaculty.model.js"
import NonTeachingFaculty from "../user/models/nonTeachingFaculty.model.js"



// create user function 
export const createUserService = async (
  payload
) => {
  const session =
    await mongoose.startSession();

  try {
    session.startTransaction();

    const {
      fullName,
      email,
      phone,
      password,
      role,
      profileImage,

      institution,
      department,

      profile,
    } = payload;


    console.log("SERVICE PROFILE IMAGE");

console.log(profileImage);

    // Check existing email
    const existingUser =
      await User.findOne({
        email,
      }).session(session);

    if (existingUser) {
      throw new Error(
        "Email already exists"
      );
    }

    // Hash password
    const hashedPassword =
      await bcrypt.hash(password, 10);

    // Create User
    const createdUsers =
      await User.create(
        [
{
  fullName,
  email,
  phone,
  password: hashedPassword,
  role,
  profileImage,
  institution,

  department:
    role === "teaching_faculty"
      ? department
      : null,
},
        ],
        { session }
      );

    const createdUser =
      createdUsers[0];

    // Teaching Faculty
    if (role === "teaching_faculty") {
      if (!profile) {
        throw new Error(
          "Profile is required"
        );
      }

      await TeachingFaculty.create(
        [
          {
            userId:
              createdUser._id,

            ...profile,

            department:
              profile.designation ===
              "principal"
                ? null
                : department,
          },
        ],
        { session }
      );
    }

    // Non Teaching Faculty
    if (
      role ===
      "non_teaching_faculty"
    ) {
      if (!profile) {
        throw new Error(
          "Profile is required"
        );
      }

      await NonTeachingFaculty.create(
        [
          {
            userId:
              createdUser._id,

            ...profile,
          },
        ],
        { session }
      );
    }

    await session.commitTransaction();

    return createdUser;

  } catch (error) {
    await session.abortTransaction();
    throw error;

  } finally {
    session.endSession();
  }
};
// update users function 
export const updateUserService = async (
  userId,
  payload
) => {
  const session =
    await mongoose.startSession();

  try {
    session.startTransaction();

    const {
      fullName,
      email,
      phone,
      password,
      role,
      profileImage,
      institution,
      department,
      profile,
    } = payload;

    // Find User
    const existingUser =
      await User.findById(userId).session(session);

  // Prevent changing faculty category
if (
  existingUser.role !== role
) {

  if (
    existingUser.role === "teaching_faculty" &&
    role === "non_teaching_faculty"
  ) {

    throw new Error(
      "Teaching Faculty cannot be changed to Non-Teaching Faculty."
    );

  }

  if (
    existingUser.role === "non_teaching_faculty" &&
    role === "teaching_faculty"
  ) {

    throw new Error(
      "Non-Teaching Faculty cannot be changed to Teaching Faculty."
    );

  }

}

    // Check duplicate email
    if (
      email &&
      email !== existingUser.email
    ) {
      const emailExists =
        await User.findOne({
          email,
          _id: { $ne: userId },
        }).session(session);

      if (emailExists) {
        throw new Error(
          "Email already exists"
        );
      }
    }

    // Hash password if changed
    let hashedPassword =
      existingUser.password;

    if (password) {
      hashedPassword =
        await bcrypt.hash(
          password,
          10
        );
    }

    // Update User
await User.findByIdAndUpdate(
  userId,
  {
    fullName,
    email,
    phone,
    password: hashedPassword,
    role,

    ...(profileImage && {
      profileImage,
    }),

    institution,

    department:
      role === "teaching_faculty"
        ? department
        : null,
  },
      {
        returnDocument: "after",
        session,
      }
    );

    // Update Teaching Faculty
    if (
      existingUser.role ===
      "teaching_faculty"
    ) {
      if (!profile) {
        throw new Error(
          "Profile is required"
        );
      }

      await TeachingFaculty.findOneAndUpdate(
        {
          userId,
        },
        {
          ...profile,

          department:
            profile.designation ===
            "principal"
              ? null
              : department,
        },
        {
          returnDocument: "after",
          session,
        }
      );
    }

    // Update Non Teaching Faculty
    if (
      existingUser.role ===
      "non_teaching_faculty"
    ) {
      if (!profile) {
        throw new Error(
          "Profile is required"
        );
      }

await NonTeachingFaculty.findOneAndUpdate(
  {
    userId,
  },
  {
    ...profile,

    department: department || null,
  },
  {
    returnDocument: "after",
    session,
  }
);
    }

    await session.commitTransaction();

    return await User.findById(
      userId
    );

  } catch (error) {
    await session.abortTransaction();
    throw error;

  } finally {
    session.endSession();
  }
};



// ============================================================
// GET ALL FACULTY
// ============================================================

export const getAllFacultyService =
  async ({
    page = 1,
    limit = 10,
    search = "",
    type,
    institution,
    department,
    designation,
    gender,
  }) => {

    page = Number(page);
    limit = Number(limit);

    const skip =
      (page - 1) * limit;

    let faculties = [];


    // ==========================================================
    // TEACHING FACULTY
    // ==========================================================

    if (
      !type ||
      type === "teaching"
    ) {

      const teaching =
        await TeachingFaculty.aggregate([

          // ----------------------------------------------------
          // GET USER
          // ----------------------------------------------------

          {
            $lookup: {
              from: "users",
              localField: "userId",
              foreignField: "_id",
              as: "user",
            },
          },


          // ----------------------------------------------------
          // UNWIND USER
          // ----------------------------------------------------

          {
            $unwind: "$user",
          },


          // ----------------------------------------------------
          // FILTER
          // ----------------------------------------------------

          {
            $match: {

              isDeleted: false,

              "user.isDeleted": false,


              ...(institution && {
                "user.institution":
                  new mongoose.Types.ObjectId(
                    institution
                  ),
              }),


              ...(department && {
                department:
                  new mongoose.Types.ObjectId(
                    department
                  ),
              }),


              ...(designation && {
                designation,
              }),


              ...(gender && {
                gender,
              }),


              ...(search && {
                $or: [

                  {
                    employeeId: {
                      $regex: search,
                      $options: "i",
                    },
                  },

                  {
                    "user.fullName": {
                      $regex: search,
                      $options: "i",
                    },
                  },

                  {
                    "user.email": {
                      $regex: search,
                      $options: "i",
                    },
                  },

                ],
              }),

            },
          },


          // ----------------------------------------------------
          // PROJECT
          // ----------------------------------------------------

{
  $project: {

    facultyId: "$_id",

    userId: "$user._id",

    employeeId: 1,

    designation: 1,

    gender: 1,

    teachingExperience: 1,

    facultyType: "Teaching",

    user: {
      fullName: "$user.fullName",
      email: "$user.email",
      profileImage: "$user.profileImage",
    },

  },
}

        ]);


      faculties.push(
        ...teaching
      );

    }


    // ==========================================================
    // NON-TEACHING FACULTY
    // ==========================================================

    if (
      !type ||
      type === "non_teaching"
    ) {

      const nonTeaching =
        await NonTeachingFaculty.aggregate([

          // ----------------------------------------------------
          // GET USER
          // ----------------------------------------------------

          {
            $lookup: {
              from: "users",
              localField: "userId",
              foreignField: "_id",
              as: "user",
            },
          },


          // ----------------------------------------------------
          // UNWIND USER
          // ----------------------------------------------------

          {
            $unwind: "$user",
          },


          // ----------------------------------------------------
          // FILTER
          // ----------------------------------------------------

          {
            $match: {

              isDeleted: false,

              "user.isDeleted": false,


              ...(institution && {
                "user.institution":
                  new mongoose.Types.ObjectId(
                    institution
                  ),
              }),


              ...(department && {
                department:
                  new mongoose.Types.ObjectId(
                    department
                  ),
              }),


              ...(designation && {
                designation,
              }),


              ...(gender && {
                gender,
              }),


              ...(search && {
                $or: [

                  {
                    employeeId: {
                      $regex: search,
                      $options: "i",
                    },
                  },

                  {
                    "user.fullName": {
                      $regex: search,
                      $options: "i",
                    },
                  },

                  {
                    "user.email": {
                      $regex: search,
                      $options: "i",
                    },
                  },

                ],
              }),

            },
          },


          // ----------------------------------------------------
          // PROJECT
          // ----------------------------------------------------

          {
            $project: {

              // NonTeachingFaculty document ID
              facultyId: "$_id",

              // User document ID
              userId: "$user._id",

              employeeId: 1,

              designation: 1,

              gender: 1,

              facultyType:
                "Non Teaching",


              user: {

                fullName:
                  "$user.fullName",

                email:
                  "$user.email",

                profileImage:
                  "$user.profileImage",

              },

            },
          },

        ]);


      faculties.push(
        ...nonTeaching
      );

    }


    // ==========================================================
    // STATISTICS
    // ==========================================================

    const totalFaculty =
      faculties.length;


    const maleCount =
      faculties.filter(
        (faculty) =>
          faculty.gender ===
          "male"
      ).length;


    const femaleCount =
      faculties.filter(
        (faculty) =>
          faculty.gender ===
          "female"
      ).length;


    const teachingCount =
      faculties.filter(
        (faculty) =>
          faculty.facultyType ===
          "Teaching"
      ).length;


    const nonTeachingCount =
      faculties.filter(
        (faculty) =>
          faculty.facultyType ===
          "Non Teaching"
      ).length;


      const ugFacultyCount =
  faculties.filter(
    (faculty) =>
      faculty.facultyType === "Teaching" &&
      faculty.teachingExperience?.some(
        (experience) =>
          experience.level === "UG" ||
          experience.level === "Both"
      )
  ).length;


const pgFacultyCount =
  faculties.filter(
    (faculty) =>
      faculty.facultyType === "Teaching" &&
      faculty.teachingExperience?.some(
        (experience) =>
          experience.level === "PG" ||
          experience.level === "Both"
      )
  ).length;


const bothLevelFacultyCount =
  faculties.filter(
    (faculty) =>
      faculty.facultyType === "Teaching" &&
      faculty.teachingExperience?.some(
        (experience) =>
          experience.level === "Both"
      )
  ).length;

    // ==========================================================
    // PAGINATION
    // ==========================================================

    const paginated =
      faculties.slice(
        skip,
        skip + limit
      );


    // ==========================================================
    // RESPONSE
    // ==========================================================

    return {

      statistics: {

        totalFaculty,

        teachingCount,

        nonTeachingCount,

        maleCount,

        femaleCount,

          ugFacultyCount,

  pgFacultyCount,

      },


      faculties:
        paginated,


      currentPage:
        page,


      totalPages:
        Math.ceil(
          totalFaculty /
            limit
        ),


      totalRecords:
        totalFaculty,

    };

  };


// ============================================================
// GET USER ID FROM FACULTY PROFILE ID
// ============================================================

export const getFacultyUserIdService =
  async ({
    facultyId,
    type,
  }) => {

    if (!facultyId) {

      throw new Error(
        "Faculty ID is required."
      );

    }


    // ==========================================================
    // TEACHING FACULTY
    // ==========================================================

    if (
      !type ||
      type === "teaching"
    ) {

      const teachingFaculty =
        await TeachingFaculty
          .findById(
            facultyId
          )
          .select(
            "userId"
          )
          .lean();


      if (
        teachingFaculty?.userId
      ) {

        return {

          facultyId,

          userId:
            teachingFaculty.userId,

          facultyType:
            "Teaching",

        };

      }

    }


    // ==========================================================
    // NON-TEACHING FACULTY
    // ==========================================================

    if (
      !type ||
      type === "non_teaching"
    ) {

      const nonTeachingFaculty =
        await NonTeachingFaculty
          .findById(
            facultyId
          )
          .select(
            "userId"
          )
          .lean();


      if (
        nonTeachingFaculty?.userId
      ) {

        return {

          facultyId,

          userId:
            nonTeachingFaculty.userId,

          facultyType:
            "Non Teaching",

        };

      }

    }


    // ==========================================================
    // NOT FOUND
    // ==========================================================

    throw new Error(
      "Faculty user information not found."
    );

  };


// hr fetch all faculty (not the high level faculty)
export const getAssignableStaffService = async ({
  page = 1,
  limit = 10,
  institution,
  department,
  designation,
  gender,
  search = "",
}) => {

  page = Number(page);
  limit = Number(limit);

  const skip = (page - 1) * limit;

  const teachingDesignations = [
    "hod",
    "professor",
    "associate_professor",
    "assistant_professor",
    "lecturer",
  ];

  const nonTeachingDesignations = [
    "lab_incharge",
    "office_assistant",
    "admission_officer",
  ];

  const teachingPipeline = [
{
  $lookup: {
    from: "users",
    localField: "userId",
    foreignField: "_id",
    as: "user",
  },
},

{
  $unwind: "$user",
},

{
  $lookup: {
    from: "institutions",
    localField: "user.institution",
    foreignField: "_id",
    as: "institution",
  },
},

{
  $unwind: {
    path: "$institution",
    preserveNullAndEmptyArrays: true,
  },
},

{
  $lookup: {
    from: "departments",
    localField: "department",
    foreignField: "_id",
    as: "department",
  },
},

    {
 $match: {

  isDeleted: false,

  "user.isDeleted": false,

  designation: {
    $in: teachingDesignations,
  },

  ...(institution && {
    "user.institution":
      new mongoose.Types.ObjectId(institution),
  }),

  ...(department && {
    "department._id":
      new mongoose.Types.ObjectId(department),
  }),

        ...(designation && {
          designation,
        }),

        ...(gender && {
          gender,
        }),

        ...(search && {
          $or: [

            {
              employeeId: {
                $regex: search,
                $options: "i",
              },
            },

            {
              "user.fullName": {
                $regex: search,
                $options: "i",
              },
            },

            {
              "user.email": {
                $regex: search,
                $options: "i",
              },
            },

          ],
        }),

      },
    },

{
$project: {
  userId: "$user._id",

  employeeId: 1,
  designation: 1,
  gender: 1,

  facultyType: "Teaching",

  user: {
    fullName: "$user.fullName",
    email: "$user.email",
    profileImage: "$user.profileImage",
  },
},
} 

  ];

  const nonTeachingPipeline = [

    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user",
      },
    },

    {
      $unwind: "$user",
    },

    {
      $lookup: {
        from: "departments",
        localField: "department",
        foreignField: "_id",
        as: "department",
      },
    },

    {
      $unwind: {
        path: "$department",
        preserveNullAndEmptyArrays: true,
      },
    },

    {
   $match: {

  isDeleted: false,

  "user.isDeleted": false,

  designation: {
    $in: nonTeachingDesignations,
  },

  ...(institution && {
    "user.institution":
      new mongoose.Types.ObjectId(institution),
  }),

  ...(department && {
    "department._id":
      new mongoose.Types.ObjectId(department),
  }),

        ...(designation && {
          designation,
        }),

        ...(gender && {
          gender,
        }),

        ...(search && {

          $or: [

            {
              employeeId: {
                $regex: search,
                $options: "i",
              },
            },

            {
              "user.fullName": {
                $regex: search,
                $options: "i",
              },
            },

            {
              "user.email": {
                $regex: search,
                $options: "i",
              },
            },

          ],

        }),

      },
    },

{
  $project: {
    userId: "$user._id",

    employeeId: 1,
    designation: 1,
    gender: 1,

    facultyType: "Non Teaching",

    user: {
      fullName: "$user.fullName",
      email: "$user.email",
      profileImage: "$user.profileImage",
    },
  },
}

  ];

  const teaching =
    await TeachingFaculty.aggregate(
      teachingPipeline
    );

  const nonTeaching =
    await NonTeachingFaculty.aggregate(
      nonTeachingPipeline
    );

  const staffs = [
    ...teaching,
    ...nonTeaching,
  ];

  staffs.sort((a, b) =>
    a.user.fullName.localeCompare(
      b.user.fullName
    )
  );

  const totalRecords =
    staffs.length;

  const maleCount =
    staffs.filter(
      item =>
        item.gender === "male"
    ).length;

  const femaleCount =
    staffs.filter(
      item =>
        item.gender === "female"
    ).length;

  const teachingCount =
    staffs.filter(
      item =>
        item.facultyType ===
        "Teaching"
    ).length;

  const nonTeachingCount =
    staffs.filter(
      item =>
        item.facultyType ===
        "Non Teaching"
    ).length;

  const paginated =
    staffs.slice(
      skip,
      skip + limit
    );

  return {

    statistics: {

      totalStaff:
        totalRecords,

      teachingCount,

      nonTeachingCount,

      maleCount,

      femaleCount,

    },

    staffs: paginated,

    currentPage: page,

    totalPages: Math.ceil(
      totalRecords / limit
    ),

    totalRecords,

  };

};


// GET SINGLE USER
// ===============================



export const getUserByIdService = async (userId) => {

  // =========================================================
  // USER INFORMATION
  // =========================================================

  const user = await User.findById(userId)
    .select(
      `
      fullName
      email
      phone
      role
      institution
      department
      profileImage
      `
    )
    .lean();


  if (!user) {
    throw new Error("User not found");
  }


  // =========================================================
  // PROFILE
  // =========================================================

  let profile = null;


  // =========================================================
  // TEACHING FACULTY
  // =========================================================

  if (user.role === "teaching_faculty") {

    profile = await TeachingFaculty.findOne({
      userId: userId,
      isDeleted: false,
    })
      .select(
        `
        employeeId
        designation
        department

        fatherOrSpouseName
        dateOfBirth
        gender
        maritalStatus
        nationality
        bloodGroup

        communicationAddress
        permanentAddress

        differentlyAbled
        disabilityPercentage

        emergencyContact

        academicQualifications

        phd

        teachingExperience

        totalTeachingExperience
        totalResearchExperience

        publications
        publicationSummary

        books
        conferences
        projects
        patents

        consultancy

        academicAchievements

        professionalMemberships

        additionalResponsibilities

        subjectsTaught

        researchAreas

        technicalSkills

        languagesKnown

        references

        declarationAccepted

        documents
        `
      )
      .lean();

  }


  // =========================================================
  // NON-TEACHING FACULTY
  // =========================================================

  if (user.role === "non_teaching_faculty") {

    profile = await NonTeachingFaculty.findOne({
      userId: userId,
      isDeleted: false,
    })
      .select(
        `
        employeeId
        designation
        gender
        `
      )
      .lean();

  }


  // =========================================================
  // FINAL RESPONSE
  // =========================================================

  return {
    ...user,

    profile,
  };
};


// user profile
// ============================================================
// GET MY COMPLETE PROFILE
// ============================================================

export const getUserProfile = async (userId) => {

  // ==========================================================
  // VALIDATE USER ID
  // ==========================================================

  if (
    !mongoose.Types.ObjectId.isValid(
      userId
    )
  ) {

    throw new Error(
      "Invalid user ID."
    );

  }


  // ==========================================================
  // GET USER
  // ==========================================================

  const user =
    await User.findOne({

      _id: userId,

      isDeleted: false,

    })
      .select(
        "-password"
      )
      .populate(
        "institution",
        "institutionName institutionCode"
      )
      .populate(
        "department",
        "departmentName"
      );


  if (!user) {

    throw new Error(
      "User not found."
    );

  }


  // ==========================================================
  // TEACHING FACULTY
  // ==========================================================

  if (
    user.role ===
    "teaching_faculty"
  ) {

    const teachingFaculty =
      await TeachingFaculty.findOne({

        userId: user._id,

        isDeleted: false,

      })
        .populate(
          "department",
          "departmentName"
        )
        .lean();


    if (!teachingFaculty) {

      throw new Error(
        "Teaching faculty profile not found."
      );

    }


    // ========================================================
    // MERGE USER + TEACHING FACULTY
    // ========================================================

    const userData =
      user.toObject();


    delete teachingFaculty._id;

    delete teachingFaculty.userId;


    return {

      ...userData,

      ...teachingFaculty,

      // ------------------------------------------------------
      // KEEP USER DEPARTMENT AS ORGANIZATION DEPARTMENT
      // ------------------------------------------------------

      department:
        userData.department,

    };

  }


  // ==========================================================
  // NON-TEACHING FACULTY
  // ==========================================================

  if (
    user.role ===
    "non_teaching_faculty"
  ) {

    const nonTeachingFaculty =
      await NonTeachingFaculty.findOne({

        userId: user._id,

        isDeleted: false,

      }).lean();


    if (!nonTeachingFaculty) {

      throw new Error(
        "Non-teaching faculty profile not found."
      );

    }


    const userData =
      user.toObject();


    delete nonTeachingFaculty._id;

    delete nonTeachingFaculty.userId;


    return {

      ...userData,

      ...nonTeachingFaculty,

      department:
        userData.department,

    };

  }


  // ==========================================================
  // OTHER USER TYPES
  // ==========================================================

  return user.toObject();

};











// SOFT DELETE USER 
export const softDeleteUserService = async (
  userId
) => {
  const session =
    await mongoose.startSession();

  try {
    session.startTransaction();

    // Find User
    const user =
      await User.findById(userId).session(
        session
      );

    if (!user) {
      throw new Error(
        "User not found"
      );
    }

    // Soft Delete User
    user.isDeleted = true;
    user.deletedAt = new Date();

    await user.save({ session });

    // Teaching Faculty
    if (
      user.role ===
      "teaching_faculty"
    ) {
      await TeachingFaculty.findOneAndUpdate(
        {
          userId: user._id,
        },
        {
          isDeleted: true,
          deletedAt: new Date(),
        },
        {
          session,
        }
      );
    }

    // Non Teaching Faculty
    if (
      user.role ===
      "non_teaching_faculty"
    ) {
      await NonTeachingFaculty.findOneAndUpdate(
        {
          userId: user._id,
        },
        {
          isDeleted: true,
          deletedAt: new Date(),
        },
        {
          session,
        }
      );
    }

    await session.commitTransaction();

    return {
      message:
        "User moved to recycle bin successfully",
    };

  } catch (error) {

    await session.abortTransaction();

    throw error;

  } finally {

    session.endSession();

  }
};
// RESTORE THE DELETED USER 
export const restoreUserService = async (
  userId
) => {
  const session =
    await mongoose.startSession();

  try {
    session.startTransaction();

    // Find User
    const user = await User.findById(
      userId
    ).session(session);

    if (!user) {
      throw new Error(
        "User not found"
      );
    }

    // Restore User
    user.isDeleted = false;
    user.deletedAt = null;

    await user.save({ session });

    // Teaching Faculty
    if (
      user.role ===
      "teaching_faculty"
    ) {
      await TeachingFaculty.findOneAndUpdate(
        {
          userId: user._id,
        },
        {
          isDeleted: false,
          deletedAt: null,
        },
        {
          session,
        }
      );
    }

    // Non Teaching Faculty
    if (
      user.role ===
      "non_teaching_faculty"
    ) {
      await NonTeachingFaculty.findOneAndUpdate(
        {
          userId: user._id,
        },
        {
          isDeleted: false,
          deletedAt: null,
        },
        {
          session,
        }
      );
    }

    await session.commitTransaction();

    return {
      message:
        "User restored successfully",
    };

  } catch (error) {

    await session.abortTransaction();

    throw error;

  } finally {

    session.endSession();

  }
};
// FETCH ALL THE DELETED USER FOR RECYCLYE BIN 
export const getDeletedUsersService = async ({
  page = 1,
  limit = 10,
  search = "",
  type,
}) => {
  page = Number(page);
  limit = Number(limit);

  const skip = (page - 1) * limit;

  let faculties = [];

  // Teaching Faculty
  if (!type || type === "teaching") {
    const teaching = await TeachingFaculty.aggregate([
      {
        $match: {
          isDeleted: true,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $match: {
          "user.isDeleted": true,

          ...(search && {
            $or: [
              {
                employeeId: {
                  $regex: search,
                  $options: "i",
                },
              },
              {
                "user.fullName": {
                  $regex: search,
                  $options: "i",
                },
              },
              {
                "user.email": {
                  $regex: search,
                  $options: "i",
                },
              },
            ],
          }),
        },
      },
      {
        $project: {
          employeeId: 1,
          designation: 1,
          deletedAt: 1,

          facultyType: {
            $literal: "Teaching",
          },

          user: {
            _id: "$user._id",
            fullName: "$user.fullName",
            email: "$user.email",
            profileImage: "$user.profileImage",
          },
        },
      },
    ]);

    faculties.push(...teaching);
  }

  // Non Teaching Faculty
  if (!type || type === "non_teaching") {
    const nonTeaching =
      await NonTeachingFaculty.aggregate([
        {
          $match: {
            isDeleted: true,
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $unwind: "$user",
        },
        {
          $match: {
            "user.isDeleted": true,

            ...(search && {
              $or: [
                {
                  employeeId: {
                    $regex: search,
                    $options: "i",
                  },
                },
                {
                  "user.fullName": {
                    $regex: search,
                    $options: "i",
                  },
                },
                {
                  "user.email": {
                    $regex: search,
                    $options: "i",
                  },
                },
              ],
            }),
          },
        },
        {
          $project: {
            employeeId: 1,
            designation: 1,
            deletedAt: 1,

            facultyType: {
              $literal: "Non Teaching",
            },

            user: {
              _id: "$user._id",
              fullName: "$user.fullName",
              email: "$user.email",
              profileImage: "$user.profileImage",
            },
          },
        },
      ]);

    faculties.push(...nonTeaching);
  }

  faculties.sort((a, b) =>
    new Date(b.deletedAt) -
    new Date(a.deletedAt)
  );

  const totalRecords = faculties.length;

  const paginated = faculties.slice(
    skip,
    skip + limit
  );

  return {
    users: paginated,

    currentPage: page,

    totalPages: Math.ceil(
      totalRecords / limit
    ),

    totalRecords,
  };
};
// DELETE THE USER FROM THE BIN AND DB
export const permanentDeleteUserService = async (
  userId
) => {
  const session =
    await mongoose.startSession();

  try {
    session.startTransaction();

    const user =
      await User.findById(userId).session(
        session
      );

    if (!user) {
      throw new Error(
        "User not found"
      );
    }

    // Delete Teaching Faculty
    if (
      user.role ===
      "teaching_faculty"
    ) {
      await TeachingFaculty.findOneAndDelete(
        {
          userId: user._id,
        },
        { session }
      );
    }

    // Delete Non Teaching Faculty
    if (
      user.role ===
      "non_teaching_faculty"
    ) {
      await NonTeachingFaculty.findOneAndDelete(
        {
          userId: user._id,
        },
        { session }
      );
    }

    // Delete User
    await User.findByIdAndDelete(
      user._id,
      {
        session,
      }
    );

    await session.commitTransaction();

    return {
      message:
        "User permanently deleted successfully",
    };

  } catch (error) {

    await session.abortTransaction();

    throw error;

  } finally {

    session.endSession();

  }
};






















// fetch faculty by institution
export const getMyInstitutionTeachingFacultyService = async (
  institution,
  {
    page = 1,
    limit = 10,
    search = "",
    department,
    gender,
    designation,
    maritalStatus,
    bloodGroup,
  }
) => {
  page = Number(page);
  limit = Number(limit);

  console.log("PAGE :", page);
console.log("LIMIT:", limit);
console.log("SKIP :", (page - 1) * limit);

  const skip = (page - 1) * limit;

  const pipeline = [
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "userId",
      },
    },
    {
      $unwind: "$userId",
    },
{
  $match: {
    isDeleted: false,

    "userId.isDeleted": false,

    "userId.institution":
      new mongoose.Types.ObjectId(
        institution
      ),

    "userId.role":
      "teaching_faculty",
  },
},
  ];

  // Teaching Faculty Filters
  if (department) {
    pipeline.push({
      $match: {
        department:
          new mongoose.Types.ObjectId(
            department
          ),
      },
    });
  }

  if (gender) {
    pipeline.push({
      $match: {
        gender,
      },
    });
  }

  if (designation) {
    pipeline.push({
      $match: {
        designation,
      },
    });
  }

  if (maritalStatus) {
    pipeline.push({
      $match: {
        maritalStatus,
      },
    });
  }

  if (bloodGroup) {
    pipeline.push({
      $match: {
        bloodGroup,
      },
    });
  }

  // Search
  if (search) {
    pipeline.push({
      $match: {
        $or: [
          {
            "userId.fullName": {
              $regex: search,
              $options: "i",
            },
          },
          {
            "userId.email": {
              $regex: search,
              $options: "i",
            },
          },
          {
            employeeId: {
              $regex: search,
              $options: "i",
            },
          },
        ],
      },
    });
  }

  // Populate Department
  pipeline.push(
    {
      $lookup: {
        from: "departments",
        localField: "department",
        foreignField: "_id",
        as: "department",
      },
    },
    {
      $unwind: {
        path: "$department",
        preserveNullAndEmptyArrays: true,
      },
    }
  );

pipeline.push({
  $project: {
    _id: 1,

    employeeId: 1,
    designation: 1,
    gender: 1,
    bloodGroup: 1,

    userId: {
      _id: "$userId._id",
      fullName: "$userId.fullName",
      email: "$userId.email",
      phone: "$userId.phone",
      profileImage: "$userId.profileImage",
      institution: "$userId.institution",
      department: "$userId.department",
    },
  },
});


  // Count
  const countPipeline = [
    ...pipeline,
    {
      $count: "totalRecords",
    },
  ];

  const countResult =
    await TeachingFaculty.aggregate(
      countPipeline
    );

  const totalRecords =
    countResult.length > 0
      ? countResult[0].totalRecords
      : 0;

  // Pagination
  pipeline.push(
    {
      $skip: skip,
    },
    {
      $limit: limit,
    }
  );

  const faculties =
    await TeachingFaculty.aggregate(
      pipeline
    );

  return {
    faculties,
    currentPage: page,
    totalPages: Math.ceil(
      totalRecords / limit
    ),
    totalRecords,
    limit,
  };
};


// fetch faculty by dpt
// fetch teaching faculty by department
// fetch teaching faculty by department
export const getMyDepartmentTeachingFacultyService = async (
  department,
  {
    page = 1,
    limit = 10,
    search = "",
    gender,
    designation,
    maritalStatus,
    bloodGroup,
  }
) => {
  page = Math.max(Number(page) || 1, 1);
  limit = Math.max(Number(limit) || 10, 1);

  const skip = (page - 1) * limit;

  const departmentObjectId =
    new mongoose.Types.ObjectId(department);

  // =========================================================
  // BASE PIPELINE
  // =========================================================

  const basePipeline = [
    {
      $match: {
        department: departmentObjectId,
        isDeleted: false,
      },
    },

    // Get user information
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "userId",
      },
    },

    {
      $unwind: "$userId",
    },

    // Ignore deleted users
    {
      $match: {
        "userId.isDeleted": false,
      },
    },
  ];

  // =========================================================
  // OVERALL FACULTY COUNTS
  // These counts are NOT affected by search/filter.
  // =========================================================

  const countPipeline = [
    ...basePipeline,

    {
      $group: {
        _id: null,

        totalFaculty: {
          $sum: 1,
        },

        maleFaculty: {
          $sum: {
            $cond: [
              {
                $eq: [
                  {
                    $toLower: {
                      $ifNull: ["$gender", ""],
                    },
                  },
                  "male",
                ],
              },
              1,
              0,
            ],
          },
        },

        femaleFaculty: {
          $sum: {
            $cond: [
              {
                $eq: [
                  {
                    $toLower: {
                      $ifNull: ["$gender", ""],
                    },
                  },
                  "female",
                ],
              },
              1,
              0,
            ],
          },
        },
      },
    },
  ];

  const countResult =
    await TeachingFaculty.aggregate(
      countPipeline
    );

  const overallCounts =
    countResult.length > 0
      ? countResult[0]
      : {
          totalFaculty: 0,
          maleFaculty: 0,
          femaleFaculty: 0,
        };

  // =========================================================
  // DESIGNATION OPTIONS
  // Used for designation dropdown.
  // =========================================================

  const designationPipeline = [
    ...basePipeline,

    {
      $match: {
        designation: {
          $exists: true,
          $nin: [null, ""],
        },
      },
    },

    {
      $group: {
        _id: "$designation",
      },
    },

    {
      $sort: {
        _id: 1,
      },
    },
  ];

  const designationResult =
    await TeachingFaculty.aggregate(
      designationPipeline
    );

  const designationOptions =
    designationResult.map(
      (item) => item._id
    );

  // =========================================================
  // FILTER / SEARCH PIPELINE
  // This pipeline controls the faculty table.
  // =========================================================

  const pipeline = [...basePipeline];

  // =========================================================
  // SEARCH
  //
  // Search:
  // 1. Faculty name
  // 2. Employee ID
  // 3. Email
  // =========================================================

  if (search && search.trim()) {
    const searchValue = search.trim();

    pipeline.push({
      $match: {
        $or: [
          // Faculty name
          {
            "userId.fullName": {
              $regex: searchValue,
              $options: "i",
            },
          },

          // Employee ID
          {
            employeeId: {
              $regex: searchValue,
              $options: "i",
            },
          },

          // Email
          {
            "userId.email": {
              $regex: searchValue,
              $options: "i",
            },
          },
        ],
      },
    });
  }

  // =========================================================
  // GENDER FILTER
  // =========================================================

  if (gender && gender.trim()) {
    pipeline.push({
      $match: {
        gender: {
          $regex: `^${gender.trim()}$`,
          $options: "i",
        },
      },
    });
  }

  // =========================================================
  // DESIGNATION FILTER
  // =========================================================

  if (designation && designation.trim()) {
    pipeline.push({
      $match: {
        designation: {
          $regex: `^${designation.trim()}$`,
          $options: "i",
        },
      },
    });
  }

  // =========================================================
  // MARITAL STATUS FILTER
  // =========================================================

  if (maritalStatus && maritalStatus.trim()) {
    pipeline.push({
      $match: {
        maritalStatus: {
          $regex: `^${maritalStatus.trim()}$`,
          $options: "i",
        },
      },
    });
  }

  // =========================================================
  // BLOOD GROUP FILTER
  // =========================================================

  if (bloodGroup && bloodGroup.trim()) {
    pipeline.push({
      $match: {
        bloodGroup: {
          $regex: `^${bloodGroup.trim()}$`,
          $options: "i",
        },
      },
    });
  }

  // =========================================================
  // TOTAL RECORDS AFTER SEARCH + FILTER
  // =========================================================

  const filteredCountPipeline = [
    ...pipeline,
    {
      $count: "totalRecords",
    },
  ];

  const filteredCountResult =
    await TeachingFaculty.aggregate(
      filteredCountPipeline
    );

  const totalRecords =
    filteredCountResult.length > 0
      ? filteredCountResult[0].totalRecords
      : 0;

  // =========================================================
  // RESPONSE DATA
  // =========================================================

  pipeline.push({
    $project: {
      _id: 1,

      employeeId: 1,
      designation: 1,
      gender: 1,
      maritalStatus: 1,
      bloodGroup: 1,

      userId: {
        _id: "$userId._id",
        fullName: "$userId.fullName",
        email: "$userId.email",
        phone: "$userId.phone",
        profileImage: "$userId.profileImage",
        institution: "$userId.institution",
        department: "$userId.department",
      },
    },
  });

  // =========================================================
  // SORT
  // =========================================================

  pipeline.push({
    $sort: {
      "userId.fullName": 1,
    },
  });

  // =========================================================
  // PAGINATION
  // =========================================================

  pipeline.push(
    {
      $skip: skip,
    },
    {
      $limit: limit,
    }
  );

  // =========================================================
  // FETCH FACULTY
  // =========================================================

  const faculties =
    await TeachingFaculty.aggregate(
      pipeline
    );

  // =========================================================
  // FINAL RESPONSE
  // =========================================================

  return {
    faculties,

    // Overall department faculty statistics
    totalFaculty:
      overallCounts.totalFaculty || 0,

    maleFaculty:
      overallCounts.maleFaculty || 0,

    femaleFaculty:
      overallCounts.femaleFaculty || 0,

    // Current filtered table statistics
    totalRecords,

    currentPage: page,

    totalPages:
      Math.ceil(totalRecords / limit),

    limit,

    // Dropdown options
    designationOptions,
  };
};

// ============================================================
// UPDATE MY OWN PROFILE
// ============================================================

export const updateMyProfileService = async (
  userId,
  payload
) => {

  const session =
    await mongoose.startSession();

  try {

    session.startTransaction();

    // ========================================================
    // FIND CURRENT USER
    // ========================================================

    const existingUser =
      await User.findOne({
        _id: userId,
        isDeleted: false,
        status: "active",
      }).session(session);

    if (!existingUser) {
      throw new Error(
        "User not found or inactive."
      );
    }


    // ========================================================
    // GET EDITABLE USER FIELDS
    // ========================================================

    const {
      fullName,
      email,
      phone,
      password,
      profileImage,
      profile,
    } = payload;


    // ========================================================
    // CHECK EMAIL DUPLICATE
    // ========================================================

    if (
      email &&
      email !== existingUser.email
    ) {

      const emailExists =
        await User.findOne({

          email,

          _id: {
            $ne: userId,
          },

          isDeleted: false,

        }).session(session);


      if (emailExists) {

        throw new Error(
          "Email already exists."
        );

      }

    }


    // ========================================================
    // PREPARE USER UPDATE
    // ========================================================

    const userUpdate = {};


    if (
      fullName !== undefined
    ) {

      userUpdate.fullName =
        fullName;

    }


    if (
      email !== undefined
    ) {

      userUpdate.email =
        email;

    }


    if (
      phone !== undefined
    ) {

      userUpdate.phone =
        phone;

    }


    // ========================================================
    // PASSWORD
    // ========================================================

    if (
      password &&
      password.trim()
    ) {

      userUpdate.password =
        await bcrypt.hash(
          password,
          10
        );

    }


    // ========================================================
    // PROFILE IMAGE
    // ========================================================

    if (
      profileImage
    ) {

      userUpdate.profileImage =
        profileImage;

    }


    // ========================================================
    // UPDATE USER
    // ========================================================

    if (
      Object.keys(userUpdate)
        .length > 0
    ) {

      await User.findByIdAndUpdate(

        userId,

        {
          $set: userUpdate,
        },

        {
          session,

          new: true,

          runValidators: true,
        }

      );

    }


    // ========================================================
    // TEACHING FACULTY PROFILE
    // ========================================================

    if (
      existingUser.role ===
      "teaching_faculty"
    ) {

      if (
        profile !== undefined
      ) {

        // ----------------------------------------------------
        // ONLY THESE FIELDS CAN BE CHANGED
        // ----------------------------------------------------

        const allowedFields = [

          "fatherOrSpouseName",

          "dateOfBirth",

          "gender",

          "maritalStatus",

          "nationality",

          "bloodGroup",

          "communicationAddress",

          "permanentAddress",

          "emergencyContact",

          "academicQualifications",

          "phd",

          "teachingExperience",

          "totalTeachingExperience",

          "totalResearchExperience",

          "publications",

          "publicationSummary",

          "books",

          "conferences",

          "projects",

          "patents",

          "consultancy",

          "academicAchievements",

          "professionalMemberships",

          "additionalResponsibilities",

          "subjectsTaught",

          "researchAreas",

          "technicalSkills",

          "languagesKnown",

          "references",

          "declarationAccepted",

          "documents",

        ];


        const facultyUpdate = {};


        // ----------------------------------------------------
        // PICK ONLY ALLOWED FIELDS
        // ----------------------------------------------------

        for (
          const field
          of allowedFields
        ) {

          if (
            profile[field] !==
            undefined
          ) {

            facultyUpdate[field] =
              profile[field];

          }

        }


        // ----------------------------------------------------
        // UPDATE TEACHING FACULTY
        // ----------------------------------------------------

        if (
          Object.keys(
            facultyUpdate
          ).length > 0
        ) {

          await TeachingFaculty.findOneAndUpdate(

            {
              userId,

              isDeleted: false,
            },

            {
              $set:
                facultyUpdate,
            },

            {
              session,

              new: true,

              runValidators: true,
            }

          );

        }

      }

    }


    // ========================================================
    // NON-TEACHING FACULTY
    // ========================================================

    if (
      existingUser.role ===
      "non_teaching_faculty"
    ) {

      if (
        profile !== undefined
      ) {

        const allowedFields = [

          "fatherOrSpouseName",

          "dateOfBirth",

          "gender",

          "maritalStatus",

          "nationality",

          "bloodGroup",

          "communicationAddress",

          "permanentAddress",

          "emergencyContact",

          "documents",

        ];


        const facultyUpdate = {};


        for (
          const field
          of allowedFields
        ) {

          if (
            profile[field] !==
            undefined
          ) {

            facultyUpdate[field] =
              profile[field];

          }

        }


        if (
          Object.keys(
            facultyUpdate
          ).length > 0
        ) {

          await NonTeachingFaculty.findOneAndUpdate(

            {
              userId,

              isDeleted: false,
            },

            {
              $set:
                facultyUpdate,
            },

            {
              session,

              new: true,

              runValidators: true,
            }

          );

        }

      }

    }


    // ========================================================
    // COMMIT TRANSACTION
    // ========================================================

    await session.commitTransaction();


    // ========================================================
    // RETURN UPDATED PROFILE
    // ========================================================

    return await getUserByIdService(
      userId
    );

  } catch (error) {

    await session.abortTransaction();

    throw error;

  } finally {

    session.endSession();

  }

};




// principal dashboard ug faculty api 

// ============================================================
// GET UG TEACHING FACULTY
// ============================================================

export const getUGTeachingFacultyService = async ({
  page = 1,
  limit = 10,
  search = "",
  institution,
  department,
  designation,
}) => {
  return getTeachingFacultyByLevelService({
    level: "UG",
    page,
    limit,
    search,
    institution,
    department,
    designation,
  });
};


// ============================================================
// GET PG TEACHING FACULTY
// ============================================================

export const getPGTeachingFacultyService = async ({
  page = 1,
  limit = 10,
  search = "",
  institution,
  department,
  designation,
}) => {
  return getTeachingFacultyByLevelService({
    level: "PG",
    page,
    limit,
    search,
    institution,
    department,
    designation,
  });
};


// ============================================================
// INTERNAL FACULTY LEVEL SERVICE
// ============================================================

const getTeachingFacultyByLevelService = async ({
  level,
  page = 1,
  limit = 10,
  search = "",
  institution,
  department,
  designation,
}) => {

  page = Math.max(Number(page) || 1, 1);
  limit = Math.max(Number(limit) || 10, 1);

  const skip = (page - 1) * limit;

  // ----------------------------------------------------------
  // VALIDATE LEVEL
  // ----------------------------------------------------------

  if (!["UG", "PG"].includes(level)) {
    throw new Error("Invalid faculty level.");
  }

  // ----------------------------------------------------------
  // BASE MATCH
  // ----------------------------------------------------------

  const matchStage = {
    isDeleted: false,

    // Faculty must have at least one experience
    // applicable to this level.
    teachingExperience: {
      $elemMatch: {
        level: {
          $in: [level, "Both"],
        },
      },
    },
  };

  // ----------------------------------------------------------
  // INSTITUTION FILTER
  // ----------------------------------------------------------

  if (institution) {

    if (
      !mongoose.Types.ObjectId.isValid(
        institution
      )
    ) {
      throw new Error(
        "Invalid institution ID."
      );
    }

    matchStage["user.institution"] =
      new mongoose.Types.ObjectId(
        institution
      );
  }

  // ----------------------------------------------------------
  // DEPARTMENT FILTER
  // ----------------------------------------------------------

  if (department) {

    if (
      !mongoose.Types.ObjectId.isValid(
        department
      )
    ) {
      throw new Error(
        "Invalid department ID."
      );
    }

    matchStage.department =
      new mongoose.Types.ObjectId(
        department
      );
  }

  // ----------------------------------------------------------
  // DESIGNATION FILTER
  // ----------------------------------------------------------

  if (designation) {
    matchStage.designation =
      designation;
  }

  // ----------------------------------------------------------
  // SEARCH
  // ----------------------------------------------------------

  const searchStage =
    search && search.trim()
      ? {
          $or: [
            {
              employeeId: {
                $regex: search.trim(),
                $options: "i",
              },
            },

            {
              "user.fullName": {
                $regex: search.trim(),
                $options: "i",
              },
            },

            {
              "user.email": {
                $regex: search.trim(),
                $options: "i",
              },
            },
          ],
        }
      : null;

  // ==========================================================
  // BASE PIPELINE
  // ==========================================================

  const basePipeline = [

    // --------------------------------------------------------
    // GET USER
    // --------------------------------------------------------

    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user",
      },
    },

    // --------------------------------------------------------
    // UNWIND USER
    // --------------------------------------------------------

    {
      $unwind: "$user",
    },

    // --------------------------------------------------------
    // ACTIVE FACULTY + LEVEL FILTER
    // --------------------------------------------------------

    {
      $match: {
        ...matchStage,

        "user.isDeleted": false,

        "user.status": "active",

        "user.role": "teaching_faculty",
      },
    },

    // --------------------------------------------------------
    // SEARCH
    // --------------------------------------------------------

    ...(searchStage
      ? [
          {
            $match: searchStage,
          },
        ]
      : []),

    // --------------------------------------------------------
    // GET DEPARTMENT
    // --------------------------------------------------------

    {
      $lookup: {
        from: "departments",
        localField: "department",
        foreignField: "_id",
        as: "departmentData",
      },
    },

    {
      $unwind: {
        path: "$departmentData",
        preserveNullAndEmptyArrays: true,
      },
    },
  ];

  // ==========================================================
  // COUNT
  // ==========================================================

  const countResult =
    await TeachingFaculty.aggregate([
      ...basePipeline,

      {
        $count: "totalRecords",
      },
    ]);

  const totalRecords =
    countResult.length > 0
      ? countResult[0].totalRecords
      : 0;

  // ==========================================================
  // FACULTY DATA
  // ==========================================================

  const faculties =
    await TeachingFaculty.aggregate([

      ...basePipeline,

      // ------------------------------------------------------
      // SORT BY FACULTY NAME
      // ------------------------------------------------------

      {
        $sort: {
          "user.fullName": 1,
        },
      },

      // ------------------------------------------------------
      // PAGINATION
      // ------------------------------------------------------

      {
        $skip: skip,
      },

      {
        $limit: limit,
      },

      // ------------------------------------------------------
      // RESPONSE FIELDS
      // ------------------------------------------------------

      {
        $project: {

          // TeachingFaculty ID
          facultyId: "$_id",

          // User ID
          // This is what frontend will use
          // to open the single profile.
          userId: "$user._id",

          employeeId: 1,

          designation: 1,

          gender: 1,

          totalTeachingExperience: 1,

          subjectsTaught: 1,

          researchAreas: 1,

          // Current requested level
          facultyLevel: {
            $literal: level,
          },

          // Department
          department: {
            _id: "$departmentData._id",
            departmentName:
              "$departmentData.departmentName",
          },

          // User information
          user: {
            fullName: "$user.fullName",

            email: "$user.email",

            profileImage:
              "$user.profileImage",
          },
        },
      },
    ]);

  // ==========================================================
  // RESPONSE
  // ==========================================================

  return {

    level,

    faculties,

    currentPage: page,

    totalPages:
      Math.ceil(
        totalRecords / limit
      ),

    totalRecords,

    limit,
  };
};
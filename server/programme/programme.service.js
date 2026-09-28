import mongoose from "mongoose";

import Programme from "./programme.model.js";
import Department from "../department/department.model.js";



import Student from "../student/student.model.js";


// ============================================================
// GET ALL PROGRAMMES WITH STUDENT COUNT
// ============================================================
export const getInstitutionProgrammesWithStudentCountService =
  async (institutionId) => {

    const institutionObjectId =
      new mongoose.Types.ObjectId(institutionId);

    const programmes = await Programme.aggregate([
      // --------------------------------------------------------
      // 1. Only active programmes
      // --------------------------------------------------------
      {
        $match: {
          isDeleted: false,
        },
      },

      // --------------------------------------------------------
      // 2. Link Department
      // --------------------------------------------------------
      {
        $lookup: {
          from: "departments",
          localField: "department",
          foreignField: "_id",
          as: "departmentInfo",
        },
      },

      // --------------------------------------------------------
      // 3. Convert department array into object
      // --------------------------------------------------------
      {
        $unwind: {
          path: "$departmentInfo",
          preserveNullAndEmptyArrays: true,
        },
      },

      // --------------------------------------------------------
      // 4. Link students using programmeId
      // --------------------------------------------------------
      {
        $lookup: {
          from: "students",
let: {
  programmeId: "$_id",
  institutionId: institutionObjectId,
},
          pipeline: [
{
  $match: {
    $expr: {
      $and: [
        {
          $eq: [
            "$programmeId",
            "$$programmeId",
          ],
        },
        {
          $eq: [
            "$institutionId",
            "$$institutionId",
          ],
        },
      ],
    },
  },
},

            {
              $project: {
                _id: 1,
              },
            },
          ],

          as: "students",
        },
      },

      // --------------------------------------------------------
      // 5. Convert students array into count
      // --------------------------------------------------------
      {
        $addFields: {
          studentCount: {
            $size: "$students",
          },
        },
      },

      // --------------------------------------------------------
      // 6. Return only required fields
      // --------------------------------------------------------
      {
        $project: {
          _id: 1,
          programmeName: 1,
          programmeCode: 1,
          programmeType: 1,
          duration: 1,

          department: {
            _id: "$departmentInfo._id",
            departmentName:
              "$departmentInfo.departmentName",
          },

          studentCount: 1,

          createdAt: 1,
          updatedAt: 1,
        },
      },

      // --------------------------------------------------------
      // 7. Sort
      // --------------------------------------------------------
      {
        $sort: {
          programmeName: 1,
        },
      },
    ]);

    return programmes;
  };


  // ============================================================
// GET SINGLE PROGRAMME DETAILS
// ============================================================

export const getProgrammeDetailsService =
  async (programmeId, institutionId) => {
    const programmes = await Programme.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(programmeId),
          isDeleted: false,
        },
      },

      {
        $lookup: {
          from: "departments",
          localField: "department",
          foreignField: "_id",
          as: "departmentInfo",
        },
      },

      {
        $unwind: {
          path: "$departmentInfo",
          preserveNullAndEmptyArrays: true,
        },
      },

      {
        $lookup: {
          from: "students",
          let: {
            programmeId: "$_id",
            institutionId: institutionId,
          },

          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: [
                        "$programmeId",
                        "$$programmeId",
                      ],
                    },
                    {
                      $eq: [
                        "$institutionId",
                        "$$institutionId",
                      ],
                    },
                  ],
                },
              },
            },
          ],

          as: "students",
        },
      },

      {
        $addFields: {
          studentCount: {
            $size: "$students",
          },
        },
      },

      {
        $project: {
          _id: 1,
          programmeName: 1,
          programmeCode: 1,
          programmeType: 1,
          duration: 1,

          department: {
            _id: "$departmentInfo._id",
            departmentName:
              "$departmentInfo.departmentName",
          },

          statistics: {
            studentCount: "$studentCount",
          },
        },
      },
    ]);

    if (!programmes.length) {
      throw new Error("Programme not found");
    }

    return programmes[0];
  };

// create programme  
export const createProgrammeService = async (
  programmeData
) => {
  const {
    programmeName,
    programmeCode,
    programmeType,
    department,
    duration,
  } = programmeData;

  // Check if programme code already exists
const existingProgramme =
  await Programme.findOne({
    programmeCode,
    isDeleted: false,
  });

  if (existingProgramme) {
    throw new Error("Programme code already exists");
  }

  // Check if department exists
const existingDepartment =
  await Department.findOne({
    _id: department,
    isDeleted: false,
  });

  if (!existingDepartment) {
    throw new Error("Department not found");
  }

  // Create programme
  const programme = await Programme.create({
    programmeName,
    programmeCode,
    programmeType,
    department,
    duration,
  });

  // Push programme ID into Department.programmes
  await Department.findByIdAndUpdate(
    department,
    {
      $push: {
        programmes: programme._id,
      },
    }
  );

  return programme;
};
// get all programme 
export const getAllProgrammesService = async () => {
    const programmes = await Programme.find({
          isDeleted: false,
    })
      .populate(
        "department",
        "departmentName"
      );
  
    return programmes;
  };
  // update the programme function 
  export const updateProgrammeService = async (
  programmeId,
  updateData
) => {
  // Find existing programme
const existingProgramme =
  await Programme.findOne({
    _id: programmeId,
    isDeleted: false,
  });

  if (!existingProgramme) {
    throw new Error("Programme not found");
  }

  // Check if department is being changed
  if (
    updateData.department &&
    updateData.department.toString() !==
      existingProgramme.department.toString()
  ) {
    // Remove programme from old department
    await Department.findByIdAndUpdate(
      existingProgramme.department,
      {
        $pull: {
          programmes: existingProgramme._id,
        },
      }
    );

    // Add programme to new department
    await Department.findByIdAndUpdate(
      updateData.department,
      {
        $push: {
          programmes: existingProgramme._id,
        },
      }
    );
  }

  if (updateData.department) {
  const departmentExists =
    await Department.findOne({
      _id:
        updateData.department,

      isDeleted:
        false,
    });

  if (!departmentExists) {
    throw new Error(
      "Department not found"
    );
  }
}
  // Update programme
  const updatedProgramme =
    await Programme.findByIdAndUpdate(
      programmeId,
      updateData,
      {
        returnDocument: "after",
        runValidators: true,
      }
    ).populate(
      "department",
      "departmentName"
    );

  return updatedProgramme;
};
// delete programme function 
export const deleteProgrammeService = async (
  programmeId
) => {
  // Find the programme
 const programme =
  await Programme.findOne({
    _id: programmeId,
    isDeleted: false,
  });

  if (!programme) {
    throw new Error("Programme not found");
  }

  // Remove programme from Department.programmes
  await Department.findByIdAndUpdate(
    programme.department,
    {
      $pull: {
        programmes: programme._id,
      },
    }
  );

  const deletedProgramme =
  await Programme.findByIdAndUpdate(
    programmeId,
    {
      isDeleted: true,
      deletedAt:
        new Date(),
    },
    {
      returnDocument:
        "after",
    }
  );

return deletedProgramme;

};
// get alll deleted programme
export const getDeletedProgrammesService =
  async () => {
    const programmes =
      await Programme.find({
        isDeleted: true,
      }).populate(
        "department",
        "departmentName"
      );

    return programmes;
  };
// restore the deleted programme
export const restoreProgrammeService =
  async (programmeId) => {

    const programme =
      await Programme.findOne({
        _id: programmeId,
        isDeleted: true,
      });

    if (!programme) {
      throw new Error(
        "Programme not found."
      );
    }

    return await Programme.findByIdAndUpdate(
      programmeId,
      {
        isDeleted: false,
        deletedAt: null,
      },
      {
        returnDocument:
          "after",
      }
    );
};
// delete the programme from the db
export const permanentDeleteProgrammeService =
  async (programmeId) => {

    const programme =
      await Programme.findById(
        programmeId
      );

    if (!programme) {
      throw new Error(
        "Programme not found."
      );
    }

    await Department.findByIdAndUpdate(
      programme.department,
      {
        $pull: {
          programmes:
            programme._id,
        },
      }
    );

    return await Programme.findByIdAndDelete(
      programmeId
    );
};



// fetch programme by dpt ?
export const getProgrammesByDepartmentService =
  async (
    departmentId
  ) => {

    return await Programme.find({
      department:
        departmentId,

      isDeleted:
        false,
    }).select(
      "programmeName programmeCode programmeType"
    );

};


// ==================== GET MY DEPARTMENT PROGRAMMES by jwt ====================
export const getMyDepartmentProgrammesService =
  async (user) => {

    // ==================== VALIDATE JWT ====================

    if (!user.department) {
      throw new Error(
        "Department not found in token."
      );
    }

    // ==================== FETCH PROGRAMMES ====================

    const programmes =
      await Programme.find({

        department:
          user.department,

        isDeleted: false,

      })
        .select(
          "programmeName programmeCode programmeType duration"
        )
        .sort({
          programmeName: 1,
        });

    return programmes;

};
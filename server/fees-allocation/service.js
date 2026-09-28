import mongoose from "mongoose";
import FeeStructure from "./model/feeStructure.model.js";
import Class from "../class/class.model.js";

import StudentFeeAllocation from "./model/studentFeeAllocation.model.js";
import Student from "../student/student.model.js"
import FeePayment from "../fees-allocation/model/feePayment.model.js"
import Department from "../department/department.model.js"
import Programme from "../programme/programme.model.js"
import Batch from "../batch/batch.model.js"

// create fees structure
// ==================== CREATE FEE STRUCTURE ====================
export const createFeeStructureService = async (
  feeData,
  user
) => {
  const {
    programmeId,
    batchId,
    year,
    academicYear,
    feeItems,
  } = feeData;

  // ==================== VALIDATE IDS ====================

  if (
    !mongoose.Types.ObjectId.isValid(
      programmeId
    )
  ) {
    throw new Error(
      "Invalid programme ID."
    );
  }

  if (
    !mongoose.Types.ObjectId.isValid(
      batchId
    )
  ) {
    throw new Error(
      "Invalid batch ID."
    );
  }

  // ==================== VALIDATE STUDY YEAR ====================

  const studyYear =
    Number(year);

  if (
    !Number.isInteger(studyYear) ||
    studyYear < 1
  ) {
    throw new Error(
      "Invalid study year."
    );
  }

  // ==================== VALIDATE ACADEMIC YEAR ====================

  const normalizedAcademicYear =
    academicYear?.trim();

  if (!normalizedAcademicYear) {
    throw new Error(
      "Academic year is required."
    );
  }

  // ==================== VALIDATE FEE ITEMS ====================

  if (
    !Array.isArray(feeItems) ||
    feeItems.length === 0
  ) {
    throw new Error(
      "At least one fee item is required."
    );
  }

  for (const item of feeItems) {
    if (
      !item.title ||
      !item.title.trim()
    ) {
      throw new Error(
        "Fee item title is required."
      );
    }

    if (
      typeof item.amount !== "number" ||
      !Number.isFinite(item.amount) ||
      item.amount < 0
    ) {
      throw new Error(
        "Fee item amount must be a valid number."
      );
    }
  }

  // ==================== FIND PROGRAMME ====================

  const programme =
    await Programme.findOne({
      _id: programmeId,
      isDeleted: false,
    });

  if (!programme) {
    throw new Error(
      "Programme not found."
    );
  }

  // ==================== CHECK PROGRAMME DEPARTMENT ====================

  if (!programme.department) {
    throw new Error(
      "Programme does not have a department."
    );
  }

  // ==================== FIND DEPARTMENT ====================

  const department =
    await Department.findOne({
      _id: programme.department,
      isDeleted: false,
    });

  if (!department) {
    throw new Error(
      "Department not found for this programme."
    );
  }

  // ==================== CHECK DEPARTMENT INSTITUTION ====================

  if (!department.institution) {
    throw new Error(
      "Department does not have an institution."
    );
  }

  // ==================== DERIVE OWNERSHIP ====================

  const departmentId =
    department._id;

  const institutionId =
    department.institution;

  // ==================== FIND BATCH ====================

  const batch =
    await Batch.findOne({
      _id: batchId,
      isDeleted: false,
    });

  if (!batch) {
    throw new Error(
      "Batch not found."
    );
  }

  // ==================== VERIFY BATCH INSTITUTION ====================

  if (
    batch.institutionId &&
    batch.institutionId.toString() !==
      institutionId.toString()
  ) {
    throw new Error(
      "Batch and programme belong to different institutions."
    );
  }

  // ==================== VALIDATE STUDY YEAR AGAINST PROGRAMME ====================

  if (
    programme.duration &&
    studyYear >
      Number(programme.duration)
  ) {
    throw new Error(
      `Study year cannot exceed programme duration of ${programme.duration} years.`
    );
  }

  // ==================== PREVENT DUPLICATE ====================

  const existingStructure =
    await FeeStructure.findOne({
      institutionId,

      programmeId,

      batchId,

      year: studyYear,

      academicYear:
        normalizedAcademicYear,

      isDeleted: false,
    });

  if (existingStructure) {
    throw new Error(
      "Fee structure already exists for this programme, batch, year and academic year."
    );
  }

  // ==================== NORMALIZE FEE ITEMS ====================

  const normalizedFeeItems =
    feeItems.map((item) => ({
      title:
        item.title.trim(),

      amount:
        item.amount,
    }));

  // ==================== CALCULATE TOTAL ====================

  const totalAmount =
    normalizedFeeItems.reduce(
      (sum, item) =>
        sum + item.amount,
      0
    );

  // ==================== CREATE FEE STRUCTURE ====================

  const feeStructure =
    await FeeStructure.create({
      institutionId,

      departmentId,

      programmeId,

      batchId,

      year:
        studyYear,

      academicYear:
        normalizedAcademicYear,

      feeItems:
        normalizedFeeItems,

      totalAmount,

      createdBy:
        user.userId,
    });

  // ==================== RETURN ====================

  return feeStructure;
};
//   get fees detail by class id 
// ==================== GET ALL FEE STRUCTURES ====================

export const getAllFeeStructuresService = async () => {

  // ==================== FETCH ALL ACTIVE FEE STRUCTURES ====================
  // Accountant is ERP-wide.
  // Institution is not taken from JWT here.

  const feeStructures =
    await FeeStructure.find({
      isDeleted: false,
    })

      // Institution
      .populate(
        "institutionId",
        "institutionName institutionCode"
      )

      // Department
      .populate(
        "departmentId",
        "departmentName departmentCode"
      )

      // Programme
      .populate(
        "programmeId",
        "programmeName programmeCode programmeType"
      )

      // Batch
      .populate(
        "batchId",
        "batchName admissionYear graduationYear currentYear status"
      )

      // Created By
      .populate(
        "createdBy",
        "fullName"
      )

      .sort({
        createdAt: -1,
      })

      .lean();


      // ==================== CHECK ASSIGNMENT STATUS ====================

const feeStructureIds =
  feeStructures.map(
    (feeStructure) =>
      feeStructure._id
  );


const assignedFeeStructureIds =
  await StudentFeeAllocation.distinct(
    "feeStructureId",
    {
      feeStructureId: {
        $in: feeStructureIds,
      },
    }
  );


const assignedSet =
  new Set(
    assignedFeeStructureIds.map(
      (id) =>
        id.toString()
    )
  );


const feeStructuresWithStatus =
  feeStructures.map(
    (feeStructure) => ({

      ...feeStructure,

      isAssigned:
        assignedSet.has(
          feeStructure._id.toString()
        ),

    })
  );
  // ==================== RETURN ====================

return {

  feeStructures:
    feeStructuresWithStatus,

  totalRecords:
    feeStructuresWithStatus.length,

};
};
//   update fees structure 
// ==================== UPDATE FEE STRUCTURE ====================
export const updateFeeStructureService = async (
  feeStructureId,
  feeData
) => {

  // ==================== VALIDATE FEE STRUCTURE ID ====================

  if (
    !mongoose.Types.ObjectId.isValid(
      feeStructureId
    )
  ) {
    throw new Error(
      "Invalid fee structure ID."
    );
  }


  // ==================== FIND EXISTING FEE STRUCTURE ====================

  const feeStructure =
    await FeeStructure.findOne({
      _id: feeStructureId,
      isDeleted: false,
    });

  if (!feeStructure) {
    throw new Error(
      "Fee structure not found."
    );
  }


  // ==================== GET UPDATED VALUES ====================

  const programmeId =
    feeData.programmeId ??
    feeStructure.programmeId;

  const batchId =
    feeData.batchId ??
    feeStructure.batchId;

  const studyYear =
    feeData.year !== undefined
      ? Number(feeData.year)
      : Number(feeStructure.year);

  const normalizedAcademicYear =
    feeData.academicYear !== undefined
      ? feeData.academicYear?.trim()
      : feeStructure.academicYear?.trim();

  const feeItems =
    feeData.feeItems ??
    feeStructure.feeItems;


  // ==================== VALIDATE IDS ====================

  if (
    !mongoose.Types.ObjectId.isValid(
      programmeId
    )
  ) {
    throw new Error(
      "Invalid programme ID."
    );
  }

  if (
    !mongoose.Types.ObjectId.isValid(
      batchId
    )
  ) {
    throw new Error(
      "Invalid batch ID."
    );
  }


  // ==================== VALIDATE STUDY YEAR ====================

  if (
    !Number.isInteger(studyYear) ||
    studyYear < 1
  ) {
    throw new Error(
      "Invalid study year."
    );
  }


  // ==================== VALIDATE ACADEMIC YEAR ====================

  if (!normalizedAcademicYear) {
    throw new Error(
      "Academic year is required."
    );
  }


  // ==================== VALIDATE FEE ITEMS ====================

  if (
    !Array.isArray(feeItems) ||
    feeItems.length === 0
  ) {
    throw new Error(
      "At least one fee item is required."
    );
  }

  for (const item of feeItems) {

    if (
      !item.title ||
      !item.title.trim()
    ) {
      throw new Error(
        "Fee item title is required."
      );
    }

    const amount =
      Number(item.amount);

    if (
      !Number.isFinite(amount) ||
      amount < 0
    ) {
      throw new Error(
        "Fee item amount must be a valid number."
      );
    }
  }


  // ==================== FIND PROGRAMME ====================

  const programme =
    await Programme.findOne({
      _id: programmeId,
      isDeleted: false,
    });

  if (!programme) {
    throw new Error(
      "Programme not found."
    );
  }


  // ==================== CHECK PROGRAMME DEPARTMENT ====================

  if (!programme.department) {
    throw new Error(
      "Programme does not have a department."
    );
  }


  // ==================== FIND DEPARTMENT ====================

  const department =
    await Department.findOne({
      _id:
        programme.department,

      isDeleted: false,
    });

  if (!department) {
    throw new Error(
      "Department not found for this programme."
    );
  }


  // ==================== CHECK DEPARTMENT INSTITUTION ====================

  if (!department.institution) {
    throw new Error(
      "Department does not have an institution."
    );
  }


  // ==================== DERIVE OWNERSHIP ====================

  const departmentId =
    department._id;

  const institutionId =
    department.institution;


  // ==================== FIND BATCH ====================

  const batch =
    await Batch.findOne({
      _id: batchId,
      isDeleted: false,
    });

  if (!batch) {
    throw new Error(
      "Batch not found."
    );
  }


  // ==================== VERIFY BATCH INSTITUTION ====================

  if (
    batch.institutionId &&
    batch.institutionId.toString() !==
      institutionId.toString()
  ) {
    throw new Error(
      "Batch and programme belong to different institutions."
    );
  }


  // ==================== VALIDATE STUDY YEAR AGAINST PROGRAMME ====================

  if (
    programme.duration &&
    studyYear > programme.duration
  ) {
    throw new Error(
      `Study year cannot exceed programme duration of ${programme.duration} years.`
    );
  }


  // ==================== PREVENT DUPLICATE ====================

  const existingStructure =
    await FeeStructure.findOne({

      _id: {
        $ne: feeStructureId,
      },

      institutionId,

      programmeId,

      batchId,

      year:
        studyYear,

      academicYear:
        normalizedAcademicYear,

      isDeleted: false,
    });

  if (existingStructure) {
    throw new Error(
      "Fee structure already exists for this programme, batch, year and academic year."
    );
  }


  // ==================== NORMALIZE FEE ITEMS ====================

  const normalizedFeeItems =
    feeItems.map(
      (item) => ({
        title:
          item.title.trim(),

        amount:
          Number(item.amount),
      })
    );


  // ==================== CALCULATE TOTAL ====================

  const totalAmount =
    normalizedFeeItems.reduce(
      (sum, item) =>
        sum + item.amount,
      0
    );


  // ==================== UPDATE FEE STRUCTURE ====================

  feeStructure.institutionId =
    institutionId;

  feeStructure.departmentId =
    departmentId;

  feeStructure.programmeId =
    programmeId;

  feeStructure.batchId =
    batchId;

  feeStructure.year =
    studyYear;

  feeStructure.academicYear =
    normalizedAcademicYear;

  feeStructure.feeItems =
    normalizedFeeItems;

  feeStructure.totalAmount =
    totalAmount;


  // ==================== SAVE ====================

  await feeStructure.save();


  // ==================== RETURN ====================

  return feeStructure;
};
//   delete fees structure function 
// ==================== DELETE FEE STRUCTURE ====================
export const deleteFeeStructureService = async (
  feeStructureId
) => {

  // ==================== VALIDATE ID ====================

  if (
    !mongoose.Types.ObjectId.isValid(
      feeStructureId
    )
  ) {
    throw new Error(
      "Invalid fee structure ID."
    );
  }


  // ==================== FIND FEE STRUCTURE ====================

  const feeStructure =
    await FeeStructure.findOne({
      _id: feeStructureId,
      isDeleted: false,
    });

  if (!feeStructure) {
    throw new Error(
      "Fee structure not found."
    );
  }


  // ==================== CHECK ALLOCATIONS ====================

  const allocationExists =
    await StudentFeeAllocation.exists({
      feeStructureId:
        feeStructure._id,
    });

  if (allocationExists) {
    throw new Error(
      "Cannot delete this fee structure because it has already been allocated to students."
    );
  }


  // ==================== SOFT DELETE ====================

  feeStructure.isDeleted = true;
  feeStructure.deletedAt =
    new Date();

  await feeStructure.save();


  // ==================== RETURN ====================

  return feeStructure;
};

//   restore fees structure
// ==================== RESTORE FEE STRUCTURE ====================
export const restoreFeeStructureService = async (
  feeStructureId
) => {

  // ==================== VALIDATE ID ====================

  if (
    !mongoose.Types.ObjectId.isValid(
      feeStructureId
    )
  ) {
    throw new Error(
      "Invalid fee structure ID."
    );
  }


  // ==================== FIND DELETED STRUCTURE ====================

  const feeStructure =
    await FeeStructure.findOne({
      _id: feeStructureId,
      isDeleted: true,
    });

  if (!feeStructure) {
    throw new Error(
      "Deleted fee structure not found."
    );
  }


  // ==================== CHECK DUPLICATE ====================

  const existingStructure =
    await FeeStructure.findOne({

      _id: {
        $ne: feeStructureId,
      },

      institutionId:
        feeStructure.institutionId,

      programmeId:
        feeStructure.programmeId,

      batchId:
        feeStructure.batchId,

      year:
        feeStructure.year,

      academicYear:
        feeStructure.academicYear,

      isDeleted: false,
    });


  if (existingStructure) {
    throw new Error(
      "An active fee structure already exists for this programme, batch, year and academic year."
    );
  }


  // ==================== RESTORE ====================

  feeStructure.isDeleted = false;
  feeStructure.deletedAt = null;

  await feeStructure.save();


  // ==================== RETURN ====================

  return feeStructure;
};

//   delete fees strucutre from db
// ==================== PERMANENT DELETE FEE STRUCTURE ====================
export const permanentDeleteFeeStructureService = async (
  feeStructureId
) => {

  // ==================== VALIDATE ID ====================

  if (
    !mongoose.Types.ObjectId.isValid(
      feeStructureId
    )
  ) {
    throw new Error(
      "Invalid fee structure ID."
    );
  }


  // ==================== FIND IN RECYCLE BIN ====================

  const feeStructure =
    await FeeStructure.findOne({
      _id: feeStructureId,
      isDeleted: true,
    });

  if (!feeStructure) {
    throw new Error(
      "Fee structure not found in recycle bin."
    );
  }


  // ==================== CHECK ALLOCATIONS ====================

  const allocationExists =
    await StudentFeeAllocation.exists({
      feeStructureId:
        feeStructure._id,
    });

  if (allocationExists) {
    throw new Error(
      "Cannot permanently delete this fee structure because it has been allocated to students."
    );
  }


  // ==================== PERMANENT DELETE ====================

  await FeeStructure.deleteOne({
    _id:
      feeStructure._id,

    isDeleted: true,
  });


  // ==================== RETURN ====================

  return feeStructure;
};


// ==================== GET DELETED FEE STRUCTURES ====================
export const getDeletedFeeStructuresService = async () => {

  // ==================== FETCH DELETED STRUCTURES ====================
  // Accountant is common across institutions,
  // so return deleted structures across the ERP.

  const feeStructures =
    await FeeStructure.find({
      isDeleted: true,
    })

      .populate(
        "institutionId",
        "institutionName institutionCode"
      )

      .populate(
        "departmentId",
        "departmentName departmentCode"
      )

      .populate(
        "programmeId",
        "programmeName programmeCode programmeType"
      )

      .populate(
        "batchId",
        "batchName currentYear"
      )

      .populate(
        "createdBy",
        "fullName"
      )

      .sort({
        deletedAt: -1,
      })

      .lean();


  // ==================== RETURN ====================

  return {
    feeStructures,

    totalRecords:
      feeStructures.length,
  };
};






// FEES ALLOCATION 

//   fees allocation 
// ==================== ASSIGN FEES TO STUDENTS ====================
export const assignFeesToStudentsService = async (
  feeStructureId,
  user
) => {

  // ==================== VALIDATE FEE STRUCTURE ID ====================

  if (
    !mongoose.Types.ObjectId.isValid(
      feeStructureId
    )
  ) {
    throw new Error(
      "Invalid fee structure ID."
    );
  }


  // ==================== FIND FEE STRUCTURE ====================

  const feeStructure =
    await FeeStructure.findOne({
      _id: feeStructureId,
      isDeleted: false,
      isActive: true,
    });

  if (!feeStructure) {
    throw new Error(
      "Fee structure not found."
    );
  }


  // ==================== FIND BATCH ====================

  const batch =
    await Batch.findOne({
      _id: feeStructure.batchId,
      isDeleted: false,
    });

  if (!batch) {
    throw new Error(
      "Batch not found for this fee structure."
    );
  }


  // ==================== VERIFY BATCH OWNERSHIP ====================

  if (
    batch.institutionId &&
    batch.institutionId.toString() !==
      feeStructure.institutionId.toString()
  ) {
    throw new Error(
      "Batch and fee structure belong to different institutions."
    );
  }


  // ==================== VERIFY CURRENT STUDY YEAR ====================

  if (
    Number(batch.currentYear) !==
    Number(feeStructure.year)
  ) {
    throw new Error(
      `This fee structure belongs to study year ${feeStructure.year}, but the batch is currently in study year ${batch.currentYear}.`
    );
  }


  // ==================== FIND MATCHING STUDENTS ====================
  //
  // No class filter.
  //
  // Example:
  // B.Com / 2026 batch
  //
  // Section A
  // Section B
  // Section C
  //
  // All matching students are included.

  const students =
    await Student.find({

      institutionId:
        feeStructure.institutionId,

      departmentId:
        feeStructure.departmentId,

      programmeId:
        feeStructure.programmeId,

      batchId:
        feeStructure.batchId,

      isDeleted: {
        $ne: true,
      },

    })
      .select(
        "_id institutionId departmentId programmeId batchId classId"
      )
      .lean();


  // ==================== CHECK STUDENTS ====================

  if (
    students.length === 0
  ) {
    throw new Error(
      "No students found for this programme and batch."
    );
  }


  // ==================== STUDENT IDS ====================

  const studentIds =
    students.map(
      (student) =>
        student._id
    );


  // ==================== FIND EXISTING ALLOCATIONS ====================
  //
  // Prevent this SAME fee structure from being
  // allocated twice to the same student.
  //
  // We intentionally use feeStructureId here
  // instead of only academicYear.

  const existingAllocations =
    await StudentFeeAllocation.find({

      studentId: {
        $in: studentIds,
      },

      feeStructureId:
        feeStructure._id,

    })
      .select(
        "studentId"
      )
      .lean();


  // ==================== EXISTING STUDENT SET ====================

  const allocatedStudentIds =
    new Set(
      existingAllocations.map(
        (allocation) =>
          allocation.studentId.toString()
      )
    );


  // ==================== STUDENTS TO ALLOCATE ====================

  const studentsToAllocate =
    students.filter(
      (student) =>
        !allocatedStudentIds.has(
          student._id.toString()
        )
    );


  // ==================== ALREADY FULLY ALLOCATED ====================

  if (
    studentsToAllocate.length === 0
  ) {
    throw new Error(
      "This fee structure has already been allocated to all eligible students."
    );
  }


  // ==================== PREPARE FEE ITEMS ====================

  const feeItems =
    feeStructure.feeItems.map(
      (item) => ({

     title: item.title,

totalAmount: item.amount,

paidAmount: 0,

pendingAmount: item.amount,

      })
    );


  // ==================== PREPARE ALLOCATIONS ====================

  const allocations =
    studentsToAllocate.map(
      (student) => ({

        academicYear:
          feeStructure.academicYear,

        studentId:
          student._id,

        feeStructureId:
          feeStructure._id,

        institutionId:
          feeStructure.institutionId,

        departmentId:
          feeStructure.departmentId,

        // Preserve student's actual class.
        // This allows class-wise finance reports later.
        classId:
          student.classId,

        feeItems,

        totalAmount:
          feeStructure.totalAmount,

        paidAmount: 0,

        pendingAmount:
          feeStructure.totalAmount,

        status:
          "Pending",

        assignedBy:
          user.userId,

      })
    );


  // ==================== BULK INSERT ====================

  const createdAllocations =
    await StudentFeeAllocation.insertMany(
      allocations
    );


  // ==================== RETURN ====================

  return {

    totalEligibleStudents:
      students.length,

    alreadyAllocated:
      existingAllocations.length,

    newlyAllocated:
      createdAllocations.length,

    allocations:
      createdAllocations,

  };
};

// ==================== RESET FEE ALLOCATION ====================

export const resetFeeAllocationService = async (
  feeStructureId
) => {

  // ==================== VALIDATE ID ====================

  if (
    !mongoose.Types.ObjectId.isValid(
      feeStructureId
    )
  ) {
    throw new Error(
      "Invalid fee structure ID."
    );
  }


  // ==================== FIND FEE STRUCTURE ====================

  const feeStructure =
    await FeeStructure.findOne({
      _id: feeStructureId,
      isDeleted: false,
    });

  if (!feeStructure) {
    throw new Error(
      "Fee structure not found."
    );
  }


  // ==================== FIND ALLOCATIONS ====================

  const allocations =
    await StudentFeeAllocation.find({
      feeStructureId,
    })
      .select(
        "_id studentId paidAmount"
      )
      .lean();


  if (allocations.length === 0) {
    throw new Error(
      "No student fee allocations found for this fee structure."
    );
  }


  // ==================== GET ALLOCATION IDS ====================

  const allocationIds =
    allocations.map(
      (allocation) =>
        allocation._id
    );


  // ==================== CHECK PAYMENT RECORDS ====================

  const paymentExists =
    await FeePayment.exists({
      studentFeeAllocationId: {
        $in: allocationIds,
      },
    });


  if (paymentExists) {
    throw new Error(
      "Cannot reset this fee allocation because payments have already been recorded."
    );
  }


  // ==================== EXTRA SAFETY CHECK ====================

  const hasPaidAmount =
    allocations.some(
      (allocation) =>
        Number(
          allocation.paidAmount
        ) > 0
    );


  if (hasPaidAmount) {
    throw new Error(
      "Cannot reset this fee allocation because paid amounts exist."
    );
  }


  // ==================== DELETE ALLOCATIONS ====================

  const result =
    await StudentFeeAllocation.deleteMany({
      feeStructureId,
    });


  // ==================== RETURN ====================

  return {
    feeStructureId:

      feeStructure._id,

    removedAllocations:
      result.deletedCount,
  };
};
// get fees alocation by class id 
// ==================== GET CLASS FEE ALLOCATIONS ====================
export const getClassFeeAllocationsService = async (
  classId,
  academicYear,
  page = 1,
  limit = 10
) => {

  // ==================== VALIDATE CLASS ID ====================

  if (
    !mongoose.Types.ObjectId.isValid(
      classId
    )
  ) {
    throw new Error(
      "Invalid class ID."
    );
  }


  // ==================== VALIDATE ACADEMIC YEAR ====================

  const normalizedAcademicYear =
    academicYear?.trim();

  if (!normalizedAcademicYear) {
    throw new Error(
      "Academic year is required."
    );
  }


  // ==================== FIND CLASS ====================

  const classData =
    await Class.findOne({
      _id: classId,
      isDeleted: false,
      isActive: true,
    })
      .select(
        "_id institution department programme batchId section"
      )
      .lean();

  if (!classData) {
    throw new Error(
      "Class not found."
    );
  }


  // ==================== VALIDATE INSTITUTION ====================

  if (!classData.institution) {
    throw new Error(
      "Class does not have an institution."
    );
  }


  // ==================== PAGINATION ====================

  const currentPage =
    Math.max(
      Number(page) || 1,
      1
    );

  const pageLimit =
    Math.max(
      Number(limit) || 10,
      1
    );

  const skip =
    (currentPage - 1) *
    pageLimit;


  // ==================== QUERY ====================

  const query = {
    classId:
      classData._id,

    institutionId:
      classData.institution,

    academicYear:
      normalizedAcademicYear,
  };


  // ==================== FETCH DATA ====================

  const [
    totalRecords,
    allocations,
    stats,
  ] = await Promise.all([

    // ==================== COUNT ====================

    StudentFeeAllocation.countDocuments(
      query
    ),


    // ==================== STUDENTS ====================

    StudentFeeAllocation.find(
      query
    )
      .populate(
        "studentId",
        "registerNumber studentName studentEmail"
      )
      .populate(
        "classId",
        "section"
      )
      .populate(
        "feeStructureId",
        "programmeId batchId year academicYear"
      )
      .sort({
        createdAt: 1,
      })
      .skip(skip)
      .limit(pageLimit)
      .lean(),


    // ==================== FINANCIAL STATS ====================

    StudentFeeAllocation.aggregate([
      {
        $match: {
          classId:
            new mongoose.Types.ObjectId(
              classId
            ),

          institutionId:
            new mongoose.Types.ObjectId(
              classData.institution
            ),

          academicYear:
            normalizedAcademicYear,
        },
      },

      {
        $group: {
          _id: null,

          totalFees: {
            $sum:
              "$totalAmount",
          },

          totalPaid: {
            $sum:
              "$paidAmount",
          },

          totalPending: {
            $sum:
              "$pendingAmount",
          },

          fullyPaidStudents: {
            $sum: {
              $cond: [
                {
                  $eq: [
                    "$status",
                    "Paid",
                  ],
                },
                1,
                0,
              ],
            },
          },

          partiallyPaidStudents: {
            $sum: {
              $cond: [
                {
                  $eq: [
                    "$status",
                    "Partially Paid",
                  ],
                },
                1,
                0,
              ],
            },
          },

          pendingStudents: {
            $sum: {
              $cond: [
                {
                  $eq: [
                    "$status",
                    "Pending",
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]),
  ]);


  // ==================== NO DATA ====================

  if (totalRecords === 0) {
    throw new Error(
      "No fee allocations found."
    );
  }


  // ==================== DEFAULT STATS ====================

  const feeStats =
    stats[0] || {
      totalFees: 0,
      totalPaid: 0,
      totalPending: 0,
      fullyPaidStudents: 0,
      partiallyPaidStudents: 0,
      pendingStudents: 0,
    };


  // ==================== RETURN ====================

  return {
    allocations,

    stats: {
      totalStudents:
        totalRecords,

      totalFees:
        feeStats.totalFees,

      totalPaid:
        feeStats.totalPaid,

      totalPending:
        feeStats.totalPending,

      fullyPaidStudents:
        feeStats.fullyPaidStudents,

      partiallyPaidStudents:
        feeStats.partiallyPaidStudents,

      pendingStudents:
        feeStats.pendingStudents,
    },

    pagination: {
      totalRecords,

      totalPages:
        Math.ceil(
          totalRecords /
          pageLimit
        ),

      currentPage,

      limit:
        pageLimit,
    },
  };
};
//   get student fees details
// ==================== GET STUDENT FEE ALLOCATION ====================

export const getStudentFeeAllocationService = async (
  studentId,
  academicYear
) => {

  // ==================== VALIDATE STUDENT ID ====================

  if (
    !mongoose.Types.ObjectId.isValid(
      studentId
    )
  ) {
    throw new Error(
      "Invalid student ID."
    );
  }


  // ==================== VALIDATE ACADEMIC YEAR ====================

  const normalizedAcademicYear =
    academicYear?.trim();

  if (!normalizedAcademicYear) {
    throw new Error(
      "Academic year is required."
    );
  }


  // ==================== FIND ALLOCATION ====================

  const allocation =
    await StudentFeeAllocation.findOne({
      studentId,
      academicYear:
        normalizedAcademicYear,
    })
      .populate(
        "studentId",
        "registerNumber studentName studentEmail"
      )
      .populate(
        "feeStructureId",
        "programmeId batchId year academicYear"
      )
      .populate(
        "assignedBy",
        "fullName"
      );


  // ==================== NOT FOUND ====================

  if (!allocation) {
    throw new Error(
      "Fee allocation not found."
    );
  }


  // ==================== RETURN ====================

  return allocation;
};
//   payment function 
// ==================== COLLECT FEE PAYMENT ====================
export const collectFeePaymentService = async (
  paymentData,
  user
) => {

  const session =
    await mongoose.startSession();

  try {

    let result;

    await session.withTransaction(
      async () => {

        // ==================== VALIDATE ALLOCATION ID ====================

        if (
          !mongoose.Types.ObjectId.isValid(
            paymentData.studentFeeAllocationId
          )
        ) {
          throw new Error(
            "Invalid fee allocation ID."
          );
        }


        // ==================== VALIDATE AMOUNT ====================

        const amount =
          Number(paymentData.amount);

        if (
          !Number.isFinite(amount) ||
          amount <= 0
        ) {
          throw new Error(
            "Invalid payment amount."
          );
        }


        // ==================== FIND ALLOCATION ====================
        // Accountant is ERP-wide.
        // Do NOT filter using user.institution.

        const allocation =
          await StudentFeeAllocation.findOne({
            _id:
              paymentData.studentFeeAllocationId,
          }).session(session);

        if (!allocation) {
          throw new Error(
            "Fee allocation not found."
          );
        }


        // ==================== CHECK ALREADY PAID ====================

        if (
          allocation.pendingAmount <= 0 ||
          allocation.status === "Paid"
        ) {
          throw new Error(
            "Fees have already been fully paid."
          );
        }


        // ==================== CHECK OVERPAYMENT ====================

        if (
          amount >
          allocation.pendingAmount
        ) {
          throw new Error(
            "Payment amount exceeds pending amount."
          );
        }


        // ==================== VALIDATE PAYMENT MODE ====================

        const validPaymentModes = [
          "Cash",
          "UPI",
          "Card",
          "Bank Transfer",
          "Cheque",
        ];

        if (
          !validPaymentModes.includes(
            paymentData.paymentMode
          )
        ) {
          throw new Error(
            "Invalid payment mode."
          );
        }


        // ==================== GENERATE RECEIPT ====================

        const receiptNumber =
          `RCP-${Date.now()}-${Math.floor(
            Math.random() * 100000
          )}`;


          // ==================== DISTRIBUTE PAYMENT ====================

let remainingPayment =
  amount;

const paymentBreakdown =
  [];

for (const item of allocation.feeItems) {

  if (
    remainingPayment <= 0
  ) {
    break;
  }

  if (
    item.pendingAmount <= 0
  ) {
    continue;
  }

  const payable =
    Math.min(
      remainingPayment,
      item.pendingAmount
    );

  item.paidAmount +=
    payable;

  item.pendingAmount -=
    payable;

paymentBreakdown.push({

  title: item.title,

  totalAmount: item.totalAmount,

  paidAmount: payable,

  pendingAmount: item.pendingAmount,

});

  remainingPayment -=
    payable;

}
        // ==================== CREATE PAYMENT ====================
        // Institution/department/class/year come
        // from the allocation itself.

        const [payment] =
          await FeePayment.create(
            [
              {
                studentFeeAllocationId:
                  allocation._id,

                receiptNumber,

                studentId:
                  allocation.studentId,

                institutionId:
                  allocation.institutionId,

                departmentId:
                  allocation.departmentId,

                classId:
                  allocation.classId,

                academicYear:
                  allocation.academicYear,

            amount,

paymentBreakdown,

paymentMode:
  paymentData.paymentMode,
                remarks:
                  paymentData.remarks?.trim() || "",

                receivedBy:
                  user.userId,
              },
            ],
            {
              session,
            }
          );


 // ==================== UPDATE ALLOCATION ====================

allocation.paidAmount +=
  amount;

allocation.pendingAmount -=
  amount;

if (
  allocation.pendingAmount < 0
) {
  allocation.pendingAmount = 0;
}


// ==================== UPDATE STATUS ====================

if (
  allocation.pendingAmount === 0
) {

  allocation.status =
    "Paid";

} else if (
  allocation.paidAmount > 0
) {

  allocation.status =
    "Partially Paid";

} else {

  allocation.status =
    "Pending";

}   

        // ==================== SAVE ALLOCATION ====================

        await allocation.save({
          session,
        });


        // ==================== POPULATE STUDENT ====================

        await allocation.populate(
          "studentId",
          "registerNumber studentName"
        );


        // ==================== RESULT ====================

        result = {
          payment,
          allocation,
        };
      }
    );


    return result;

  } finally {

    await session.endSession();

  }
};

// ==================== SEARCH STUDENT FEE ALLOCATION ====================
export const searchStudentFeeAllocationService =
  async (
    institutionId,
    registerNumber,
    academicYear
  ) => {

    // ==================== VALIDATE INPUT ====================

    if (
      !mongoose.Types.ObjectId.isValid(
        institutionId
      )
    ) {
      throw new Error(
        "Invalid institution ID."
      );
    }

    if (
      !registerNumber?.trim()
    ) {
      throw new Error(
        "Register number is required."
      );
    }

    if (
      !academicYear?.trim()
    ) {
      throw new Error(
        "Academic year is required."
      );
    }


    // ==================== FIND STUDENT ====================

    const student =
      await Student.findOne({

        institutionId,

        registerNumber:
          registerNumber.trim(),

        isDeleted: false,

      })
        .select(
          "_id studentName registerNumber studentEmail profilePhoto programmeId batchId classId"
        )
        .populate(
          "programmeId",
          "programmeName programmeCode"
        )
        .populate(
  "departmentId",
  "departmentName"
)
        .populate(
          "batchId",
          "batchName"
        )
        .lean();

    if (!student) {
      throw new Error(
        "Student not found."
      );
    }


    // ==================== FIND FEE ALLOCATION ====================

    const allocation =
      await StudentFeeAllocation.findOne({

        studentId:
          student._id,

        academicYear:
          academicYear.trim(),

      })
        .populate(
          "feeStructureId",
          "academicYear year"
        )
        .lean();

    if (!allocation) {
      throw new Error(
        "No fee allocation found for this academic year."
      );
    }


    // ==================== RETURN ====================

    return {

      studentFeeAllocationId:
        allocation._id,

      studentId:
        student._id,

      profilePhoto:
        student.profilePhoto,

      registerNumber:
        student.registerNumber,

      studentName:
        student.studentName,

      studentEmail:
        student.studentEmail,

      programme:
        student.programmeId,

      batch:
        student.batchId,

      academicYear:
        allocation.academicYear,

      studyYear:
        allocation.feeStructureId?.year,

      feeItems:
        allocation.feeItems,

      totalAmount:
        allocation.totalAmount,

      paidAmount:
        allocation.paidAmount,

      pendingAmount:
        allocation.pendingAmount,

      status:
        allocation.status,

    };

  };


  // PAYMENT HISTORY  of student 
// ==================== STUDENT PAYMENT HISTORY ====================
export const getStudentPaymentHistoryService = async (
  studentId,
  academicYear
) => {

  // ==================== VALIDATE STUDENT ID ====================

  if (
    !mongoose.Types.ObjectId.isValid(
      studentId
    )
  ) {
    throw new Error(
      "Invalid student ID."
    );
  }


  // ==================== BUILD QUERY ====================

  const query = {
    studentId,
  };


  // Optional academic year filter
  if (
    academicYear &&
    academicYear.trim()
  ) {
    query.academicYear =
      academicYear.trim();
  }


  // ==================== FETCH PAYMENTS ====================

  const payments =
    await FeePayment.find(
      query
    )
      .populate(
        "studentId",
        "registerNumber studentName studentEmail"
      )
      .populate(
        "receivedBy",
        "fullName"
      )
      .populate(
        "studentFeeAllocationId",
        "academicYear totalAmount paidAmount pendingAmount status"
      )
      .sort({
        paidAt: -1,
      })
      .lean();


  // ==================== NO PAYMENT HISTORY ====================

  if (
    payments.length === 0
  ) {
    throw new Error(
      "No payment history found."
    );
  }


  // ==================== CALCULATE TOTAL PAID ====================

  const totalPaid =
    payments.reduce(
      (sum, payment) =>
        sum + payment.amount,
      0
    );


  // ==================== RETURN ====================

  return {
    student:
      payments[0].studentId,

    totalPayments:
      payments.length,

    totalPaid,

    payments,
  };
};



  // principal finance report 
// ==================== PRINCIPAL FINANCE DASHBOARD ====================

// ==================== PRINCIPAL FINANCE DASHBOARD ====================

export const getFinanceDashboardService = async (
  filters,
  institutionId
) => {

  const {
    academicYear,
    departmentId,
    classId,
    search,
    receiptNumber,
    range,
    from,
    to,
    page = 1,
    limit = 10,
  } = filters;


  // ==========================================================
  // VALIDATION
  // ==========================================================

  if (
    !mongoose.Types.ObjectId.isValid(
      institutionId
    )
  ) {
    throw new Error(
      "Invalid institution ID."
    );
  }


  if (
    !academicYear ||
    !academicYear.trim()
  ) {
    throw new Error(
      "Academic year is required."
    );
  }


  if (
    departmentId &&
    !mongoose.Types.ObjectId.isValid(
      departmentId
    )
  ) {
    throw new Error(
      "Invalid department ID."
    );
  }


  if (
    classId &&
    !mongoose.Types.ObjectId.isValid(
      classId
    )
  ) {
    throw new Error(
      "Invalid class ID."
    );
  }


  // ==========================================================
  // PAGINATION
  // ==========================================================

  const currentPage =
    Math.max(
      Number(page) || 1,
      1
    );

  const pageLimit =
    Math.max(
      Number(limit) || 10,
      1
    );


  // ==========================================================
  // NORMALIZED ACADEMIC YEAR
  // ==========================================================

  const normalizedAcademicYear =
    academicYear.trim();


  // ==========================================================
  // BASE ALLOCATION QUERY
  // ==========================================================

  const allocationQuery = {

    institutionId,

    academicYear:
      normalizedAcademicYear,

  };


  // ==========================================================
  // BASE PAYMENT QUERY
  // ==========================================================

  const paymentQuery = {

    institutionId,

    academicYear:
      normalizedAcademicYear,

  };


  // ==========================================================
  // DEPARTMENT FILTER
  // ==========================================================

  if (departmentId) {

    allocationQuery.departmentId =
      departmentId;

    paymentQuery.departmentId =
      departmentId;

  }


  // ==========================================================
  // CLASS FILTER
  // ==========================================================

  if (classId) {

    allocationQuery.classId =
      classId;

    paymentQuery.classId =
      classId;

  }


  // ==========================================================
  // PAYMENT DATE FILTER
  // ==========================================================

  const hasDateFilter =
    range ||
    from ||
    to;


  if (hasDateFilter) {

    paymentQuery.paidAt = {};


    // --------------------------------------------------------
    // TODAY
    // --------------------------------------------------------

    if (
      range === "today"
    ) {

      const start =
        new Date();

      start.setHours(
        0,
        0,
        0,
        0
      );

      paymentQuery.paidAt.$gte =
        start;

    }


    // --------------------------------------------------------
    // LAST 7 DAYS
    // --------------------------------------------------------

    if (
      range === "week"
    ) {

      const start =
        new Date();

      start.setDate(
        start.getDate() - 7
      );

      start.setHours(
        0,
        0,
        0,
        0
      );

      paymentQuery.paidAt.$gte =
        start;

    }


    // --------------------------------------------------------
    // LAST 30 DAYS
    // --------------------------------------------------------

    if (
      range === "month"
    ) {

      const start =
        new Date();

      start.setDate(
        start.getDate() - 30
      );

      start.setHours(
        0,
        0,
        0,
        0
      );

      paymentQuery.paidAt.$gte =
        start;

    }


    // --------------------------------------------------------
    // CUSTOM FROM
    // --------------------------------------------------------

    if (from) {

      const fromDate =
        new Date(from);

      if (
        Number.isNaN(
          fromDate.getTime()
        )
      ) {
        throw new Error(
          "Invalid from date."
        );
      }

      fromDate.setHours(
        0,
        0,
        0,
        0
      );

      paymentQuery.paidAt.$gte =
        fromDate;

    }


    // --------------------------------------------------------
    // CUSTOM TO
    // --------------------------------------------------------

    if (to) {

      const toDate =
        new Date(to);

      if (
        Number.isNaN(
          toDate.getTime()
        )
      ) {
        throw new Error(
          "Invalid to date."
        );
      }

      toDate.setHours(
        23,
        59,
        59,
        999
      );

      paymentQuery.paidAt.$lte =
        toDate;

    }

  }


  // ==========================================================
  // RECEIPT SEARCH
  // ==========================================================

  if (
    receiptNumber &&
    receiptNumber.trim()
  ) {

    const receiptPayments =
      await FeePayment.find({

        ...paymentQuery,

        receiptNumber: {
          $regex:
            receiptNumber.trim(),

          $options:
            "i",
        },

      })
        .select(
          "studentId"
        )
        .lean();


    allocationQuery.studentId = {

      $in:
        receiptPayments.map(
          (payment) =>
            payment.studentId
        ),

    };

  }


  // ==========================================================
  // FETCH ALLOCATIONS
  // ==========================================================

  let allocations =
    await StudentFeeAllocation.find(
      allocationQuery
    )

      .populate(
        "studentId",
        "registerNumber studentName studentEmail"
      )

      .populate(
        "departmentId",
        "departmentName departmentCode"
      )

      .populate({
        path:
          "classId",

        select:
          "programme batchId section",

        populate: [

          {
            path:
              "programme",

            select:
              "programmeName programmeCode programmeType",

          },

          {
            path:
              "batchId",

            select:
              "batchName currentYear",

          },

        ],

      })

      .lean();


  // ==========================================================
  // STUDENT SEARCH
  // ==========================================================

  if (
    search &&
    search.trim()
  ) {

    const searchValue =
      search
        .trim()
        .toLowerCase();


    allocations =
      allocations.filter(
        (item) =>

          item.studentId
            ?.registerNumber
            ?.toLowerCase()
            .includes(
              searchValue
            )

          ||

          item.studentId
            ?.studentName
            ?.toLowerCase()
            .includes(
              searchValue
            )

          ||

          item.studentId
            ?.studentEmail
            ?.toLowerCase()
            .includes(
              searchValue
            )

      );

  }


  // ==========================================================
  // OVERALL FEE STATISTICS
  // ==========================================================

  const totalStudents =
    allocations.length;


  const paidStudents =
    allocations.filter(
      (item) =>
        item.status ===
        "Paid"
    ).length;


  const partiallyPaidStudents =
    allocations.filter(
      (item) =>
        item.status ===
        "Partially Paid"
    ).length;


  const pendingStudents =
    allocations.filter(
      (item) =>
        item.status ===
        "Pending"
    ).length;


  const totalFees =
    allocations.reduce(
      (sum, item) =>
        sum +
        Number(
          item.totalAmount || 0
        ),
      0
    );


  const totalPaid =
    allocations.reduce(
      (sum, item) =>
        sum +
        Number(
          item.paidAmount || 0
        ),
      0
    );


  const totalPending =
    allocations.reduce(
      (sum, item) =>
        sum +
        Number(
          item.pendingAmount || 0
        ),
      0
    );


  // ==========================================================
  // FETCH PAYMENTS
  // ==========================================================

  const payments =
    await FeePayment.find(
      paymentQuery
    )
      .select(
        "amount paidAt receiptNumber paymentMode studentId"
      )
      .lean();


  // ==========================================================
  // COLLECTION AMOUNT
  // ==========================================================

  const collectionAmount =
    payments.reduce(
      (sum, payment) =>
        sum +
        Number(
          payment.amount || 0
        ),
      0
    );


  // ==========================================================
  // COLLECTION TREND
  // ==========================================================

  const collectionTrendResult =
    await FeePayment.aggregate([

      {
        $match:
          paymentQuery,
      },

      {
        $group: {

          _id: {

            $dateToString: {

              format:
                "%Y-%m-%d",

              date:
                "$paidAt",

            },

          },

          amount: {

            $sum:
              "$amount",

          },

          transactionCount: {

            $sum:
              1,

          },

        },

      },

      {

        $sort: {

          "_id":
            1,

        },

      },

    ]);


  const collectionTrend =
    collectionTrendResult.map(
      (item) => ({

        date:
          item._id,

        amount:
          Number(
            item.amount || 0
          ),

        transactionCount:
          item.transactionCount,

      })
    );


  // ==========================================================
  // GITHUB STYLE COLLECTION ACTIVITY
  // ==========================================================

  const activityResult =
    await FeePayment.aggregate([

      {
        $match:
          paymentQuery,
      },

      {
        $group: {

          _id: {

            $dateToString: {

              format:
                "%Y-%m-%d",

              date:
                "$paidAt",

            },

          },

          amount: {

            $sum:
              "$amount",

          },

        },

      },

      {

        $sort: {

          "_id":
            1,

        },

      },

    ]);


  // ----------------------------------------------------------
  // FIND MAXIMUM DAILY COLLECTION
  // ----------------------------------------------------------

  const maxDailyCollection =
    activityResult.reduce(
      (
        max,
        item
      ) =>
        Math.max(
          max,
          Number(
            item.amount || 0
          )
        ),
      0
    );


  // ----------------------------------------------------------
  // CREATE ACTIVITY LEVEL
  // ----------------------------------------------------------

  const collectionActivity =
    activityResult.map(
      (item) => {

        const amount =
          Number(
            item.amount || 0
          );


        let level = 0;


        if (
          amount > 0 &&
          maxDailyCollection > 0
        ) {

          const ratio =
            amount /
            maxDailyCollection;


          if (
            ratio <= 0.25
          ) {

            level = 1;

          } else if (
            ratio <= 0.50
          ) {

            level = 2;

          } else if (
            ratio <= 0.75
          ) {

            level = 3;

          } else {

            level = 4;

          }

        }


        return {

          date:
            item._id,

          amount,

          level,

        };

      }
    );


  // ==========================================================
  // PAGINATION
  // ==========================================================

  const skip =
    (currentPage - 1) *
    pageLimit;


  const students =
    allocations
      .slice(
        skip,
        skip + pageLimit
      )
      .map(
        (item) => ({

          allocationId:
            item._id,

          studentId:
            item.studentId?._id,

          registerNumber:
            item.studentId
              ?.registerNumber,

          studentName:
            item.studentId
              ?.studentName,

          studentEmail:
            item.studentId
              ?.studentEmail,

          department:
            item.departmentId
              ?.departmentName,

          programme:
            item.classId
              ?.programme
              ? {

                  id:
                    item.classId
                      .programme
                      ._id,

                  name:
                    item.classId
                      .programme
                      .programmeName,

                  code:
                    item.classId
                      .programme
                      .programmeCode,

                  type:
                    item.classId
                      .programme
                      .programmeType,

                }

              : null,

          batch:
            item.classId
              ?.batchId
              ? {

                  id:
                    item.classId
                      .batchId
                      ._id,

                  name:
                    item.classId
                      .batchId
                      .batchName,

                }

              : null,

          studyYear:
            item.classId
              ?.batchId
              ?.currentYear ??
            null,

          section:
            item.classId
              ?.section ??
            null,

          totalAmount:
            item.totalAmount,

          paidAmount:
            item.paidAmount,

          pendingAmount:
            item.pendingAmount,

          status:
            item.status,

        })
      );


  // ==========================================================
  // RETURN
  // ==========================================================

  return {

    academicYear:
      normalizedAcademicYear,


    summary: {

      totalStudents,

      paidStudents,

      partiallyPaidStudents,

      pendingStudents,


      // Total amount assigned
      totalFees,


      // Total actually collected
      collectedFees:
        totalPaid,


      // Total still pending
      pendingFees:
        totalPending,


      // Collection during selected date range
      periodCollection:
        collectionAmount,


      transactionCount:
        payments.length,

    },


    collectionTrend,

    collectionActivity,


    students,


    pagination: {

      currentPage,

      totalPages:
        Math.ceil(
          totalStudents /
            pageLimit
        ),

      totalRecords:
        totalStudents,

      limit:
        pageLimit,

    },

  };

};

  // hod finance report 
// ==================== HOD FINANCE DASHBOARD ====================

export const getDepartmentFinanceDashboardService = async (
  filters,
  institutionId,
  departmentId
) => {
  const {
    academicYear,
    classId,
    search,
    receiptNumber,
    range,
    from,
    to,
    page = 1,
    limit = 10,
  } = filters;


  // ==================== VALIDATION ====================

  if (
    !mongoose.Types.ObjectId.isValid(
      institutionId
    )
  ) {
    throw new Error(
      "Invalid institution ID."
    );
  }

  if (
    !mongoose.Types.ObjectId.isValid(
      departmentId
    )
  ) {
    throw new Error(
      "Invalid department ID."
    );
  }

  if (
    !academicYear ||
    !academicYear.trim()
  ) {
    throw new Error(
      "Academic year is required."
    );
  }

  if (
    classId &&
    !mongoose.Types.ObjectId.isValid(
      classId
    )
  ) {
    throw new Error(
      "Invalid class ID."
    );
  }


  // ==================== PAGINATION ====================

  const currentPage =
    Math.max(
      Number(page) || 1,
      1
    );

  const pageLimit =
    Math.max(
      Number(limit) || 10,
      1
    );


  // ==================== BASE QUERIES ====================

  const allocationQuery = {
    institutionId,

    departmentId,

    academicYear:
      academicYear.trim(),
  };

  const paymentQuery = {
    institutionId,

    departmentId,

    academicYear:
      academicYear.trim(),
  };


  // ==================== CLASS FILTER ====================

  if (classId) {
    allocationQuery.classId =
      classId;

    paymentQuery.classId =
      classId;
  }


  // ==================== PAYMENT DATE FILTER ====================

  if (
    range ||
    from ||
    to
  ) {
    paymentQuery.paidAt = {};

    if (range === "today") {
      const start =
        new Date();

      start.setHours(
        0,
        0,
        0,
        0
      );

      paymentQuery.paidAt.$gte =
        start;
    }

    if (range === "week") {
      const week =
        new Date();

      week.setDate(
        week.getDate() - 7
      );

      paymentQuery.paidAt.$gte =
        week;
    }

    if (range === "month") {
      const month =
        new Date();

      month.setMonth(
        month.getMonth() - 1
      );

      paymentQuery.paidAt.$gte =
        month;
    }

    if (from) {
      const fromDate =
        new Date(from);

      if (
        Number.isNaN(
          fromDate.getTime()
        )
      ) {
        throw new Error(
          "Invalid from date."
        );
      }

      paymentQuery.paidAt.$gte =
        fromDate;
    }

    if (to) {
      const end =
        new Date(to);

      if (
        Number.isNaN(
          end.getTime()
        )
      ) {
        throw new Error(
          "Invalid to date."
        );
      }

      end.setHours(
        23,
        59,
        59,
        999
      );

      paymentQuery.paidAt.$lte =
        end;
    }
  }


  // ==================== RECEIPT SEARCH ====================

  if (
    receiptNumber &&
    receiptNumber.trim()
  ) {
    const receiptPayments =
      await FeePayment.find({
        ...paymentQuery,

        receiptNumber: {
          $regex:
            receiptNumber.trim(),

          $options:
            "i",
        },
      })
        .select(
          "studentId"
        )
        .lean();

    allocationQuery.studentId = {
      $in:
        receiptPayments.map(
          (payment) =>
            payment.studentId
        ),
    };
  }


  // ==================== FETCH ALLOCATIONS ====================

  let allocations =
    await StudentFeeAllocation.find(
      allocationQuery
    )

      .populate(
        "studentId",
        "registerNumber studentName studentEmail"
      )

      .populate({
        path: "classId",

        select:
          "programme batchId section",

        populate: [
          {
            path:
              "programme",

            select:
              "programmeName programmeCode programmeType",
          },

          {
            path:
              "batchId",

            select:
              "batchName currentYear",
          },
        ],
      })

      .lean();


  // ==================== STUDENT SEARCH ====================

  if (
    search &&
    search.trim()
  ) {
    const searchValue =
      search
        .trim()
        .toLowerCase();

    allocations =
      allocations.filter(
        (item) =>
          item.studentId
            ?.registerNumber
            ?.toLowerCase()
            .includes(
              searchValue
            ) ||

          item.studentId
            ?.studentName
            ?.toLowerCase()
            .includes(
              searchValue
            )
      );
  }


  // ==================== FEE STATISTICS ====================

  const totalStudents =
    allocations.length;

  const paidStudents =
    allocations.filter(
      (item) =>
        item.status ===
        "Paid"
    ).length;

  const partiallyPaidStudents =
    allocations.filter(
      (item) =>
        item.status ===
        "Partially Paid"
    ).length;

  const pendingStudents =
    allocations.filter(
      (item) =>
        item.status ===
        "Pending"
    ).length;

  const totalFees =
    allocations.reduce(
      (sum, item) =>
        sum +
        Number(
          item.totalAmount || 0
        ),
      0
    );

  const totalPaid =
    allocations.reduce(
      (sum, item) =>
        sum +
        Number(
          item.paidAmount || 0
        ),
      0
    );

  const totalPending =
    allocations.reduce(
      (sum, item) =>
        sum +
        Number(
          item.pendingAmount || 0
        ),
      0
    );


  // ==================== COLLECTION STATISTICS ====================

  const payments =
    await FeePayment.find(
      paymentQuery
    )
      .select(
        "amount"
      )
      .lean();

  const collectionAmount =
    payments.reduce(
      (sum, payment) =>
        sum +
        Number(
          payment.amount || 0
        ),
      0
    );


  // ==================== PAGINATION ====================

  const skip =
    (currentPage - 1) *
    pageLimit;

  const students =
    allocations
      .slice(
        skip,
        skip + pageLimit
      )
      .map(
        (item) => ({
          allocationId:
            item._id,

          studentId:
            item.studentId?._id,

          registerNumber:
            item.studentId
              ?.registerNumber,

          studentName:
            item.studentId
              ?.studentName,

          studentEmail:
            item.studentId
              ?.studentEmail,

          programme:
            item.classId
              ?.programme
              ? {
                  id:
                    item.classId
                      .programme
                      ._id,

                  name:
                    item.classId
                      .programme
                      .programmeName,

                  code:
                    item.classId
                      .programme
                      .programmeCode,

                  type:
                    item.classId
                      .programme
                      .programmeType,
                }
              : null,

          batch:
            item.classId
              ?.batchId
              ? {
                  id:
                    item.classId
                      .batchId
                      ._id,

                  name:
                    item.classId
                      .batchId
                      .batchName,
                }
              : null,

          studyYear:
            item.classId
              ?.batchId
              ?.currentYear ??
            null,

          section:
            item.classId
              ?.section ??
            null,

          totalAmount:
            item.totalAmount,

          paidAmount:
            item.paidAmount,

          pendingAmount:
            item.pendingAmount,

          status:
            item.status,
        })
      );


  // ==================== RETURN ====================

  return {
    academicYear:
      academicYear.trim(),

    summary: {
      totalStudents,

      paidStudents,

      partiallyPaidStudents,

      pendingStudents,

      totalFees,

      totalPaid,

      totalPending,

      collectionAmount,

      transactionCount:
        payments.length,
    },

    students,

    pagination: {
      currentPage,

      totalPages:
        Math.ceil(
          totalStudents /
            pageLimit
        ),

      totalRecords:
        totalStudents,

      limit:
        pageLimit,
    },
  };
};




// ================== ERP FINANCE DASHBOARD ====================

export const admgetFinanceDashboardService = async (
  filters
) => {
  const {
    academicYear,
    institutionId,
    departmentId,
    classId,
    search,
    receiptNumber,
    range,
    from,
    to,
    page = 1,
    limit = 10,
  } = filters;


  // ==================== VALIDATION ====================

  if (
    !academicYear ||
    !academicYear.trim()
  ) {
    throw new Error(
      "Academic year is required."
    );
  }


  // ==================== VALIDATE OPTIONAL FILTER IDS ====================

  if (
    institutionId &&
    !mongoose.Types.ObjectId.isValid(
      institutionId
    )
  ) {
    throw new Error(
      "Invalid institution ID."
    );
  }

  if (
    departmentId &&
    !mongoose.Types.ObjectId.isValid(
      departmentId
    )
  ) {
    throw new Error(
      "Invalid department ID."
    );
  }

  if (
    classId &&
    !mongoose.Types.ObjectId.isValid(
      classId
    )
  ) {
    throw new Error(
      "Invalid class ID."
    );
  }


  // ==================== PAGINATION ====================

  const currentPage =
    Math.max(
      Number(page) || 1,
      1
    );

  const pageLimit =
    Math.max(
      Number(limit) || 10,
      1
    );


  // ==================== BASE QUERIES ====================

  const allocationQuery = {
    academicYear:
      academicYear.trim(),
  };

  const paymentQuery = {
    academicYear:
      academicYear.trim(),
  };


  // ==================== OPTIONAL FILTERS ====================

  if (institutionId) {
    allocationQuery.institutionId =
      institutionId;

    paymentQuery.institutionId =
      institutionId;
  }

  if (departmentId) {
    allocationQuery.departmentId =
      departmentId;

    paymentQuery.departmentId =
      departmentId;
  }

  if (classId) {
    allocationQuery.classId =
      classId;

    paymentQuery.classId =
      classId;
  }


  // ==================== PAYMENT DATE FILTER ====================

  if (
    range ||
    from ||
    to
  ) {
    paymentQuery.paidAt = {};

    if (range === "today") {
      const start =
        new Date();

      start.setHours(
        0,
        0,
        0,
        0
      );

      paymentQuery.paidAt.$gte =
        start;
    }

    if (range === "week") {
      const week =
        new Date();

      week.setDate(
        week.getDate() - 7
      );

      paymentQuery.paidAt.$gte =
        week;
    }

    if (range === "month") {
      const month =
        new Date();

      month.setMonth(
        month.getMonth() - 1
      );

      paymentQuery.paidAt.$gte =
        month;
    }

    if (from) {
      const fromDate =
        new Date(from);

      if (
        Number.isNaN(
          fromDate.getTime()
        )
      ) {
        throw new Error(
          "Invalid from date."
        );
      }

      paymentQuery.paidAt.$gte =
        fromDate;
    }

    if (to) {
      const end =
        new Date(to);

      if (
        Number.isNaN(
          end.getTime()
        )
      ) {
        throw new Error(
          "Invalid to date."
        );
      }

      end.setHours(
        23,
        59,
        59,
        999
      );

      paymentQuery.paidAt.$lte =
        end;
    }
  }


  // ==================== RECEIPT SEARCH ====================

  if (
    receiptNumber &&
    receiptNumber.trim()
  ) {
    const receiptPayments =
      await FeePayment.find({
        ...paymentQuery,

        receiptNumber: {
          $regex:
            receiptNumber.trim(),

          $options:
            "i",
        },
      })
        .select(
          "studentId"
        )
        .lean();

    allocationQuery.studentId = {
      $in:
        receiptPayments.map(
          (payment) =>
            payment.studentId
        ),
    };
  }


  // ==================== FETCH ALLOCATIONS ====================

  let allocations =
    await StudentFeeAllocation.find(
      allocationQuery
    )

      .populate(
        "studentId",
        "registerNumber studentName studentEmail"
      )

      .populate(
        "institutionId",
        "institutionName institutionCode"
      )

      .populate(
        "departmentId",
        "departmentName departmentCode"
      )

      .populate({
        path: "classId",

        select:
          "programme batchId section",

        populate: [
          {
            path:
              "programme",

            select:
              "programmeName programmeCode programmeType",
          },

          {
            path:
              "batchId",

            select:
              "batchName currentYear",
          },
        ],
      })

      .lean();


  // ==================== STUDENT SEARCH ====================

  if (
    search &&
    search.trim()
  ) {
    const searchValue =
      search
        .trim()
        .toLowerCase();

    allocations =
      allocations.filter(
        (item) =>
          item.studentId
            ?.registerNumber
            ?.toLowerCase()
            .includes(
              searchValue
            ) ||

          item.studentId
            ?.studentName
            ?.toLowerCase()
            .includes(
              searchValue
            )
      );
  }


  // ==================== OVERALL SUMMARY ====================

  const totalStudents =
    allocations.length;

  const paidStudents =
    allocations.filter(
      (item) =>
        item.status ===
        "Paid"
    ).length;

  const partiallyPaidStudents =
    allocations.filter(
      (item) =>
        item.status ===
        "Partially Paid"
    ).length;

  const pendingStudents =
    allocations.filter(
      (item) =>
        item.status ===
        "Pending"
    ).length;

  const totalAmount =
    allocations.reduce(
      (sum, item) =>
        sum +
        Number(
          item.totalAmount || 0
        ),
      0
    );

  const totalPaid =
    allocations.reduce(
      (sum, item) =>
        sum +
        Number(
          item.paidAmount || 0
        ),
      0
    );

  const totalPending =
    allocations.reduce(
      (sum, item) =>
        sum +
        Number(
          item.pendingAmount || 0
        ),
      0
    );


  // ==================== COLLECTION SUMMARY ====================

  const payments =
    await FeePayment.find(
      paymentQuery
    )
      .select(
        "amount"
      )
      .lean();

  const periodCollection =
    payments.reduce(
      (sum, payment) =>
        sum +
        Number(
          payment.amount || 0
        ),
      0
    );


  // ==================== INSTITUTION SUMMARY ====================

  const institutionMap =
    new Map();

  for (const item of allocations) {
    const institution =
      item.institutionId;

    if (!institution) {
      continue;
    }

    const key =
      institution._id.toString();

    if (
      !institutionMap.has(
        key
      )
    ) {
      institutionMap.set(
        key,
        {
          institutionId:
            institution._id,

          institutionName:
            institution.institutionName,

          institutionCode:
            institution.institutionCode,

          totalStudents: 0,

          totalAmount: 0,

          totalPaid: 0,

          totalPending: 0,
        }
      );
    }

    const summary =
      institutionMap.get(
        key
      );

    summary.totalStudents +=
      1;

    summary.totalAmount +=
      Number(
        item.totalAmount || 0
      );

    summary.totalPaid +=
      Number(
        item.paidAmount || 0
      );

    summary.totalPending +=
      Number(
        item.pendingAmount || 0
      );
  }

  const institutions =
    Array.from(
      institutionMap.values()
    );


  // ==================== PAGINATION ====================

  const skip =
    (currentPage - 1) *
    pageLimit;

  const students =
    allocations
      .slice(
        skip,
        skip + pageLimit
      )
      .map(
        (item) => ({
          allocationId:
            item._id,

          studentId:
            item.studentId?._id,

          registerNumber:
            item.studentId
              ?.registerNumber,

          studentName:
            item.studentId
              ?.studentName,

          studentEmail:
            item.studentId
              ?.studentEmail,

          institution:
            item.institutionId
              ?.institutionName,

          department:
            item.departmentId
              ?.departmentName,

          programme:
            item.classId
              ?.programme
              ? {
                  id:
                    item.classId
                      .programme
                      ._id,

                  name:
                    item.classId
                      .programme
                      .programmeName,

                  code:
                    item.classId
                      .programme
                      .programmeCode,

                  type:
                    item.classId
                      .programme
                      .programmeType,
                }
              : null,

          batch:
            item.classId
              ?.batchId
              ? {
                  id:
                    item.classId
                      .batchId
                      ._id,

                  name:
                    item.classId
                      .batchId
                      .batchName,
                }
              : null,

          studyYear:
            item.classId
              ?.batchId
              ?.currentYear ??
            null,

          section:
            item.classId
              ?.section ??
            null,

          totalAmount:
            item.totalAmount,

          paidAmount:
            item.paidAmount,

          pendingAmount:
            item.pendingAmount,

          status:
            item.status,
        })
      );


  // ==================== RETURN ====================

  return {
    academicYear:
      academicYear.trim(),

    overallSummary: {
      totalStudents,

      paidStudents,

      partiallyPaidStudents,

      pendingStudents,

      totalAmount,

      totalPaid,

      totalPending,
    },

    collectionSummary: {
      periodCollection,

      transactionCount:
        payments.length,
    },

    institutions,

    students,

    pagination: {
      currentPage,

      totalPages:
        Math.ceil(
          totalStudents /
            pageLimit
        ),

      totalRecords:
        totalStudents,

      limit:
        pageLimit,
    },
  };
};





// ==========================================================
// PRINCIPAL FINANCE DASHBOARD
// ==========================================================

export const getPrincipalFinanceService = async ({
  institutionId,
  academicYear,
  page = 1,
  limit = 10,
  startDate,
  endDate,
  search = "",
  classId,
  departmentId,
  status,
}) => {

  page = Number(page);
  limit = Number(limit);

  const skip = (page - 1) * limit;

  const institutionObjectId =
    new mongoose.Types.ObjectId(
      institutionId
    );


  // ==========================================================
  // DATE FILTER
  // ==========================================================

  let paymentDateFilter = {};

  if (startDate || endDate) {

    paymentDateFilter = {};

    if (startDate) {
      paymentDateFilter.$gte =
        new Date(startDate);
    }

    if (endDate) {

      const end = new Date(endDate);

      end.setHours(
        23,
        59,
        59,
        999
      );

      paymentDateFilter.$lte = end;
    }
  }


  // ==========================================================
  // ALLOCATION FILTER
  // ==========================================================

  const allocationMatch = {

    institutionId:
      institutionObjectId,

    ...(academicYear && {
      academicYear,
    }),

    ...(classId && {
      classId:
        new mongoose.Types.ObjectId(
          classId
        ),
    }),

    ...(departmentId && {
      departmentId:
        new mongoose.Types.ObjectId(
          departmentId
        ),
    }),

    ...(status && {
      status,
    }),
  };


  // ==========================================================
  // SEARCH FILTER
  // ==========================================================

  let studentIds = null;

  if (search) {

    const students =
      await Student.find({

        institutionId:
          institutionObjectId,

        isDeleted: false,

        $or: [

          {
            studentName: {
              $regex: search,
              $options: "i",
            },
          },

          {
            registerNumber: {
              $regex: search,
              $options: "i",
            },
          },

          {
            studentEmail: {
              $regex: search,
              $options: "i",
            },
          },

        ],

      })
        .select("_id")
        .lean();

    studentIds =
      students.map(
        (student) =>
          student._id
      );


    allocationMatch.studentId = {
      $in: studentIds,
    };
  }


  // ==========================================================
  // SUMMARY
  // ==========================================================

  const summaryResult =
    await StudentFeeAllocation.aggregate([

      {
        $match:
          allocationMatch,
      },

      {
        $group: {

          _id: null,

          totalStudents: {
            $sum: 1,
          },

          paidStudents: {
            $sum: {
              $cond: [
                {
                  $eq: [
                    "$status",
                    "Paid",
                  ],
                },
                1,
                0,
              ],
            },
          },

          partiallyPaidStudents: {
            $sum: {
              $cond: [
                {
                  $eq: [
                    "$status",
                    "Partially Paid",
                  ],
                },
                1,
                0,
              ],
            },
          },

          pendingStudents: {
            $sum: {
              $cond: [
                {
                  $eq: [
                    "$status",
                    "Pending",
                  ],
                },
                1,
                0,
              ],
            },
          },

          totalFees: {
            $sum: "$totalAmount",
          },

          collectedFees: {
            $sum: "$paidAmount",
          },

          pendingFees: {
            $sum: "$pendingAmount",
          },

        },

      },

    ]);


  const summary =
    summaryResult[0] || {

      totalStudents: 0,

      paidStudents: 0,

      partiallyPaidStudents: 0,

      pendingStudents: 0,

      totalFees: 0,

      collectedFees: 0,

      pendingFees: 0,

    };


  // ==========================================================
  // PAYMENT MATCH
  // ==========================================================

  const paymentMatch = {

    institutionId:
      institutionObjectId,

    ...(academicYear && {
      academicYear,
    }),

    ...(Object.keys(
      paymentDateFilter
    ).length > 0 && {
      paidAt:
        paymentDateFilter,
    }),

    ...(departmentId && {
      departmentId:
        new mongoose.Types.ObjectId(
          departmentId
        ),
    }),

    ...(classId && {
      classId:
        new mongoose.Types.ObjectId(
          classId
        ),
    }),

    ...(studentIds && {
      studentId: {
        $in: studentIds,
      },
    }),
  };


  // ==========================================================
  // PERIOD COLLECTION
  // ==========================================================

  const paymentSummary =
    await FeePayment.aggregate([

      {
        $match:
          paymentMatch,
      },

      {
        $group: {

          _id: null,

          periodCollection: {
            $sum: "$amount",
          },

          transactionCount: {
            $sum: 1,
          },

        },
      },

    ]);


  const periodData =
    paymentSummary[0] || {

      periodCollection: 0,

      transactionCount: 0,

    };


  // ==========================================================
  // COLLECTION TREND
  // ==========================================================

  const collectionTrend =
    await FeePayment.aggregate([

      {
        $match:
          paymentMatch,
      },

      {
        $group: {

          _id: {

            $dateToString: {

              format:
                "%Y-%m-%d",

              date:
                "$paidAt",

            },

          },

          amount: {
            $sum: "$amount",
          },

          transactionCount: {
            $sum: 1,
          },

        },
      },

      {
        $sort: {
          _id: 1,
        },
      },

      {
        $project: {

          _id: 0,

          date: "$_id",

          amount: 1,

          transactionCount: 1,

        },

      },

    ]);


  // ==========================================================
  // COLLECTION ACTIVITY
  // ==========================================================

// ==========================================================
// COLLECTION ACTIVITY
// ==========================================================

const collectionActivity =
  await FeePayment.aggregate([

    // ======================================================
    // PAYMENT FILTER
    // ======================================================

    {
      $match:
        paymentMatch,
    },


    // ======================================================
    // GROUP BY DATE + STUDENT
    //
    // If a student makes multiple payments on
    // the same day, combine them into one entry.
    // ======================================================

    {
      $group: {

        _id: {

          date: {
            $dateToString: {

              format:
                "%Y-%m-%d",

              date:
                "$paidAt",

            },
          },

          studentId:
            "$studentId",

        },

        amount: {
          $sum: "$amount",
        },

        transactionCount: {
          $sum: 1,
        },

      },
    },


    // ======================================================
    // GET STUDENT INFORMATION
    // ======================================================

    {
      $lookup: {

        from: "students",

        localField:
          "_id.studentId",

        foreignField:
          "_id",

        as: "student",

      },
    },


    // ======================================================
    // CONVERT STUDENT ARRAY TO OBJECT
    // ======================================================

    {
      $unwind: {

        path:
          "$student",

        preserveNullAndEmptyArrays:
          true,

      },
    },


    // ======================================================
    // GROUP BACK BY DATE
    // ======================================================

    {
      $group: {

        _id:
          "$_id.date",


        // --------------------------------------------------
        // TOTAL COLLECTION FOR THAT DAY
        // --------------------------------------------------

        amount: {
          $sum:
            "$amount",
        },


        // --------------------------------------------------
        // TOTAL PAYMENT TRANSACTIONS FOR THAT DAY
        // --------------------------------------------------

        transactionCount: {
          $sum:
            "$transactionCount",
        },


        // --------------------------------------------------
        // STUDENTS WHO PAID THAT DAY
        // --------------------------------------------------

        students: {

          $push: {

            studentId:
              "$_id.studentId",

            studentName:
              "$student.studentName",

            registerNumber:
              "$student.registerNumber",

            amount:
              "$amount",

            transactionCount:
              "$transactionCount",

          },

        },

      },

    },


    // ======================================================
    // SORT BY DATE
    // ======================================================

    {
      $sort: {

        _id: 1,

      },

    },


    // ======================================================
    // FINAL RESPONSE SHAPE
    // ======================================================

    {
      $project: {

        _id: 0,

        date:
          "$_id",

        amount: 1,

        transactionCount: 1,

        students: 1,

      },

    },

  ]);


  // ==========================================================
  // TOTAL RECORDS
  // ==========================================================

  const totalRecords =
    summary.totalStudents;


  const totalPages =
    Math.ceil(
      totalRecords / limit
    );


  // ==========================================================
  // STUDENT ALLOCATIONS
  // ==========================================================

  const allocations =
    await StudentFeeAllocation.find(
      allocationMatch
    )

      .populate(
        "studentId",
        "studentName registerNumber studentEmail"
      )

      .populate(
        "departmentId",
        "departmentName"
      )

      .populate(
        "feeStructureId",
        "programmeId batchId year"
      )

      .skip(skip)

      .limit(limit)

      .sort({
        createdAt: -1,
      })

      .lean();


  // ==========================================================
  // FORMAT DATA
  // ==========================================================

  const data =
    allocations.map(
      (allocation) => {

        const student =
          allocation.studentId;

        const department =
          allocation.departmentId;


        return {

          allocationId:
            allocation._id,

          studentId:
            student?._id || null,

          registerNumber:
            student?.registerNumber ||
            null,

          studentName:
            student?.studentName ||
            null,

          studentEmail:
            student?.studentEmail ||
            null,

          department:
            department?.departmentName ||
            null,

          totalAmount:
            allocation.totalAmount,

          paidAmount:
            allocation.paidAmount,

          pendingAmount:
            allocation.pendingAmount,

          status:
            allocation.status,

        };

      }
    );


  // ==========================================================
  // FINAL RESPONSE
  // ==========================================================

  return {

    academicYear,

    summary: {

      totalStudents:
        summary.totalStudents,

      paidStudents:
        summary.paidStudents,

      partiallyPaidStudents:
        summary.partiallyPaidStudents,

      pendingStudents:
        summary.pendingStudents,

      totalFees:
        summary.totalFees,

      collectedFees:
        summary.collectedFees,

      pendingFees:
        summary.pendingFees,

      periodCollection:
        periodData.periodCollection,

      transactionCount:
        periodData.transactionCount,

    },

    collectionTrend,

    collectionActivity,

    pagination: {

      currentPage:
        page,

      totalPages,

      totalRecords,

      limit,

    },

    data,

  };

};
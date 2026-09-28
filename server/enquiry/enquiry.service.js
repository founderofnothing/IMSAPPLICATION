import mongoose from "mongoose";
import fs from "fs";
import xlsx from "xlsx";

import generateApplicationNumber from "../utils/generateApplicationNumber.js";
import Enquiry from "./enquiry.model.js";
import Institution from "../institution/institution.model.js";
import Department from "../department/department.model.js";
import Programme from "../programme/programme.model.js";
import Student from "../student/student.model.js";

import Batch from "../batch/batch.model.js"

import { ENQUIRY_IMPORT_FIELDS } from "./enquiry.bulk.config.js";

import { ENQUIRY_HEADER_ALIASES } from "./enquiry.bulk.alias.js";

import { ENQUIRY_REQUIRED_HEADERS } from "./enquiry.bulk.required.js";

import {
  GENDER_ENUM,
  ENQUIRY_SOURCE_ENUM,
  STATUS_ENUM,
} from "./enquiry.bulk.enums.js";

// create enquiry 
export const createEnquiryService = async (
  enquiryData,
  user
) => {

  // Get Institution from JWT

enquiryData.institutionId =
  user.institution;
console.log(user.institution)
// Get Creator from JWT

enquiryData.createdBy =
  user.userId;

  // Validate Institution

  const institution =
    await Institution.findOne({
      _id:
        enquiryData.institutionId,

      isDeleted:
        false,
    });

  if (!institution) {
    throw new Error(
      "Institution not found."
    );
  }

  // Validate Department

  const department =
    await Department.findOne({
      _id:
        enquiryData.departmentId,

      isDeleted:
        false,
    });

  if (!department) {
    throw new Error(
      "Department not found."
    );
  }

  // Validate Programme

  const programme =
    await Programme.findOne({
      _id:
        enquiryData.programmeId,

      isDeleted:
        false,
    });

  if (!programme) {
    throw new Error(
      "Programme not found."
    );
  }

  // Normalize Email

  if (
    enquiryData.studentEmail
  ) {
    enquiryData.studentEmail =
      enquiryData.studentEmail
        .toLowerCase()
        .trim();
  }

  // Create Enquiry

  const enquiry =
    await Enquiry.create(
      enquiryData
    );

  return enquiry;
};
// get all enquiry
export const getAllEnquiriesService =
  async ({
    page = 1,
    limit = 10,
    search = "",
    status,
    departmentId,
    programmeId,
    studentEmail,
    studentMobile,
    gender,
    enquirySource,
  }) => {

    const query = {
      isDeleted: false,
    };

    if (search) {
      query.studentName = {
        $regex: search,
        $options: "i",
      };
    }

    if (status) {
      query.status = status;
    }

    if (departmentId) {
      query.departmentId =
        departmentId;
    }

    if (programmeId) {
      query.programmeId =
        programmeId;
    }

    if (studentEmail) {
      query.studentEmail = {
        $regex:
          studentEmail,
        $options: "i",
      };
    }

    if (studentMobile) {
      query.studentMobile = {
        $regex:
          studentMobile,
        $options: "i",
      };
    }

    if (gender) {
      query.gender = gender;
    }

    if (enquirySource) {
      query.enquirySource =
        enquirySource;
    }

    const skip =
      (page - 1) * limit;

    const total =
      await Enquiry.countDocuments(
        query
      );

    const enquiries =
      await Enquiry.find(query)
        .populate(
          "institutionId",
          "institutionName institutionCode"
        )
        .populate(
          "departmentId",
          "departmentName"
        )
        .populate(
          "programmeId",
          "programmeName programmeType"
        )
        .populate(
          "createdBy",
          "fullName email"
        )
        .populate(
          "convertedBy",
          "fullName email"
        )
        .sort({
          createdAt: -1,
        })
        .skip(skip)
        .limit(limit);

    return {
      enquiries,
      total,
      page,
      totalPages:
        Math.ceil(
          total / limit
        ),
    };
};
// get enquiry by id 
export const getEnquiryByIdService =
  async (
    enquiryId
  ) => {

    const enquiry =
      await Enquiry.findOne({
        _id: enquiryId,
        isDeleted: false,
      })
        .populate(
          "institutionId",
          "institutionName institutionCode"
        )
        .populate(
          "departmentId",
          "departmentName"
        )
        .populate(
          "programmeId",
          "programmeName programmeType"
        );

    if (!enquiry) {
      throw new Error(
        "Enquiry not found."
      );
    }

    return enquiry;
};
// update the enquiry 
export const updateEnquiryService =
  async (
    enquiryId,
    updateData,
    user
  ) => {

    const enquiry =
      await Enquiry.findOne({
        _id: enquiryId,
        isDeleted: false,
      });

    if (!enquiry) {
      throw new Error(
        "Enquiry not found."
      );
    }

    if (
      updateData.studentEmail
    ) {
      updateData.studentEmail =
        updateData.studentEmail
          .toLowerCase()
          .trim();
    }
    updateData.updatedBy =
  user.userId;

    return await Enquiry.findByIdAndUpdate(
      enquiryId,
      updateData,
      {
        returnDocument:
          "after",

        runValidators:
          true,
      }
    );
};
// delete enquiry
export const deleteEnquiryService =
  async (enquiryId) => {

    const enquiry =
      await Enquiry.findOne({
        _id: enquiryId,
        isDeleted: false,
      });

    if (!enquiry) {

      throw new Error(
        "Enquiry not found."
      );

    }

    // Prevent deleting converted enquiries

    if (
      enquiry.status === "Converted"
    ) {

      throw new Error(
        "Converted enquiries cannot be deleted."
      );

    }

    return await Enquiry.findByIdAndUpdate(
      enquiryId,
      {
        isDeleted: true,
        deletedAt: new Date(),
      },
      {
        returnDocument: "after",
      }
    );

};

// recycle bin 
// Recycle bin - get deleted enquiries
// for logged-in user's institution

// Recycle Bin
// Get deleted enquiries for logged-in institution
// Supports search, gender and department filters

export const getDeletedEnquiriesService =
  async (
    institutionId,
    {
      search = "",
      gender,
      departmentId,
    } = {}
  ) => {

    const query = {
      institutionId,
      isDeleted: true,
    };


    // ==============================
    // SEARCH BY STUDENT NAME
    // ==============================

    if (search?.trim()) {

      query.studentName = {
        $regex: search.trim(),
        $options: "i",
      };

    }


    // ==============================
    // FILTER BY GENDER
    // ==============================

    if (gender) {

      query.gender = gender;

    }


    // ==============================
    // FILTER BY DEPARTMENT
    // ==============================

    if (departmentId) {

      query.departmentId =
        departmentId;

    }


    // ==============================
    // FETCH DELETED ENQUIRIES
    // ==============================

    return await Enquiry.find(query)

      .populate(
        "institutionId",
        "institutionName institutionCode"
      )

      .populate(
        "departmentId",
        "departmentName"
      )

      .populate(
        "programmeId",
        "programmeName programmeType"
      )

      .sort({
        deletedAt: -1,
      });

};


// restore the enquiry 
export const restoreEnquiryService =
  async (
    enquiryId
  ) => {

    const enquiry =
      await Enquiry.findOne({
        _id: enquiryId,
        isDeleted: true,
      });

    if (!enquiry) {
      throw new Error(
        "Enquiry not found."
      );
    }

    return await Enquiry.findByIdAndUpdate(
      enquiryId,
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


// delete the enquiary permanantly 
export const permanentDeleteEnquiryService =
  async (
    enquiryId
  ) => {

    const enquiry =
      await Enquiry.findById(
        enquiryId
      );

    if (!enquiry) {
      throw new Error(
        "Enquiry not found."
      );
    }

    return await Enquiry.findByIdAndDelete(
      enquiryId
    );
};


// get my insitution enquiary 
export const getMyInstitutionEnquiriesService =
  async (

    institutionId,

    {

      page = 1,

      limit = 10,

      search = "",

      status,

      departmentId,

      programmeId,

      enquirySource,

    }

  ) => {

    const query = {

      institutionId,

      isDeleted: false,

    };

    // ==================== SEARCH ====================

    if (search) {

      query.studentName = {

        $regex: search,

        $options: "i",

      };

    }

    // ==================== FILTERS ====================

    if (status) {

      query.status = status;

    }

    if (departmentId) {

      query.departmentId =
        departmentId;

    }

    if (programmeId) {

      query.programmeId =
        programmeId;

    }

    if (enquirySource) {

      query.enquirySource =
        enquirySource;

    }

    // ==================== PAGINATION ====================

    const skip =
      (page - 1) * limit;

    const total =
      await Enquiry.countDocuments(
        query
      );

    const enquiries =
      await Enquiry.find(query)

        .populate(

          "departmentId",

          "departmentName"

        )

        .populate(

          "programmeId",

          "programmeName programmeType"

        )

        .populate(

          "createdBy",

          "fullName email"

        )

        .sort({

          createdAt: -1,

        })

        .skip(skip)

        .limit(limit);

    // ==================== STATISTICS ====================

    const statsQuery = {

      institutionId,

      isDeleted: false,

    };

    const totalEnquiries =
      await Enquiry.countDocuments(
        statsQuery
      );

    const totalConversions =
      await Enquiry.countDocuments({

        ...statsQuery,

        status: "Converted",

      });

    const startOfWeek =
      new Date();

    startOfWeek.setHours(

      0,

      0,

      0,

      0

    );

    startOfWeek.setDate(

      startOfWeek.getDate() -

      startOfWeek.getDay()

    );

    const weeklyEnquiries =
      await Enquiry.countDocuments({

        ...statsQuery,

        createdAt: {

          $gte: startOfWeek,

        },

      });

    // ==================== RETURN ====================

    return {

      enquiries,

      total,

      page,

      totalPages:
        Math.ceil(total / limit),

      stats: {

        totalEnquiries,

        weeklyEnquiries,

        totalConversions,

      },

    };

  };

// get enquiary by status


// convert the enquiary by status 
// convert the enquiry into student
export const convertEnquiryService =
 

async (
    enquiryId,
    conversionData,
    user
  ) => {

    // Validate Enquiry

    const enquiry =
      await Enquiry.findOne({
        _id: enquiryId,
        isDeleted: false,
      });

    if (!enquiry) {
      throw new Error(
        "Enquiry not found."
      );
    }

    // Prevent Duplicate Conversion

    if (
      enquiry.status ===
      "Converted"
    ) {
      throw new Error(
        "Enquiry already converted."
      );
    }

    // Validate Batch

    const batch =
      await Batch.findOne({
        _id:
          conversionData.batchId,

        isDeleted:
          false,
      });

    if (!batch) {
      throw new Error(
        "Batch not found."
      );
    }

    // Generate Application Number

    const applicationNumber =
      await generateApplicationNumber();

    // Build Student Data

    const studentData = {
      // Academic References

      institutionId:
        enquiry.institutionId,

      departmentId:
        enquiry.departmentId,

      programmeId:
        enquiry.programmeId,

      batchId:
        conversionData.batchId,

      // Basic Details

      studentName:
        enquiry.studentName,

      dateOfBirth:
        enquiry.dateOfBirth,

      gender:
        enquiry.gender,

      // Contact Details

      studentMobile:
        enquiry.studentMobile,

      studentEmail:
        enquiry.studentEmail,

      parentMobile:
        enquiry.parentMobile,

      // Admission Details

      applicationNumber,

      // Conversion Form Fields

      fatherGuardianName:
        conversionData.fatherGuardianName,

      religion:
        conversionData.religion,

      communityCategory:
        conversionData.communityCategory,
    };

    // Create Student

    const student =
      await Student.create(
        studentData
      );

    // Update Enquiry

    enquiry.status =
      "Converted";

    enquiry.studentId =
      student._id;

    enquiry.convertedAt =
      new Date();

    enquiry.convertedBy =
      user.userId;

    await enquiry.save();

    // Return Both

    return {
      enquiry,
      student,
    };
};


// get my own enquiary 
// export const getEnquiriesByStatusService =
//   async (
//     status,
//     {
//       page = 1,
//       limit = 10,
//       search = "",
//       departmentId,
//       programmeId,
//     }
//   ) => {

//     const query = {
//       status,
//       isDeleted: false,
//     };

//     // Search by Student Name

//     if (search) {
//       query.studentName = {
//         $regex: search,
//         $options: "i",
//       };
//     }

//     // Filter by Department

//     if (departmentId) {
//       query.departmentId =
//         departmentId;
//     }

//     // Filter by Programme

//     if (programmeId) {
//       query.programmeId =
//         programmeId;
//     }

//     // Pagination

//     const skip =
//       (page - 1) * limit;

//     // Total Records

//     const total =
//       await Enquiry.countDocuments(
//         query
//       );

//     // Fetch Data

//     const enquiries =
//       await Enquiry.find(query)
//         .populate(
//           "institutionId",
//           "institutionName institutionCode"
//         )
//         .populate(
//           "departmentId",
//           "departmentName"
//         )
//         .populate(
//           "programmeId",
//           "programmeName programmeType"
//         )
//         .populate(
//           "createdBy",
//           "fullName email"
//         )
//         .populate(
//           "convertedBy",
//           "fullName email"
//         )
//         .sort({
//           createdAt: -1,
//         })
//         .skip(skip)
//         .limit(limit);

//     return {
//       enquiries,
//       total,
//       page,
//       totalPages:
//         Math.ceil(
//           total / limit
//         ),
//     };
// };

// get the convertion static across single instituion 
export const getEnquiriesByStatusService =
  async (
    institutionId,
    status,
    {
      page = 1,
      limit = 10,
      search = "",
      departmentId,
      programmeId,
    }
  ) => {

    page = Number(page);
    limit = Number(limit);

    const query = {
      institutionId,
      status,
      isDeleted: false,
    };

    // Search by Student Name
    if (search) {
      query.studentName = {
        $regex: search,
        $options: "i",
      };
    }

    // Filter by Department
    if (departmentId) {
      query.departmentId =
        departmentId;
    }

    // Filter by Programme
    if (programmeId) {
      query.programmeId =
        programmeId;
    }

    // Pagination
    const skip =
      (page - 1) * limit;

    // Total filtered records
    const total =
      await Enquiry.countDocuments(
        query
      );

    // Fetch converted enquiries
    const enquiries =
      await Enquiry.find(query)
        .populate(
          "institutionId",
          "institutionName institutionCode"
        )
        .populate(
          "departmentId",
          "departmentName"
        )
        .populate(
          "programmeId",
          "programmeName programmeType"
        )
        .populate(
          "createdBy",
          "fullName email"
        )
        .populate(
          "convertedBy",
          "fullName email"
        )
        .sort({
          convertedAt: -1,
        })
        .skip(skip)
        .limit(limit);


    // ==================================
    // CONVERSION STATS
    // ==================================

    const institutionQuery = {
      institutionId,
      isDeleted: false,
    };


    // Total Enquiries
    const totalEnquiries =
      await Enquiry.countDocuments(
        institutionQuery
      );


    // Total Conversions
    const totalConversions =
      await Enquiry.countDocuments({
        ...institutionQuery,
        status: "Converted",
      });


    // Start of current week
    const startOfWeek =
      new Date();

    startOfWeek.setHours(
      0,
      0,
      0,
      0
    );

    startOfWeek.setDate(
      startOfWeek.getDate() -
      startOfWeek.getDay()
    );


    // Conversions made this week
    const weeklyConversions =
      await Enquiry.countDocuments({
        ...institutionQuery,

        status: "Converted",

        convertedAt: {
          $gte: startOfWeek,
        },
      });


    // ==================================
    // RETURN
    // ==================================

    return {

      enquiries,

      total,

      page,

      totalPages:
        Math.ceil(
          total / limit
        ),

      stats: {

        totalConversions,

        weeklyConversions,

        totalEnquiries,

      },

    };

};

// get the convertion static across all instituion 
// ==========================================
// GET ALL CONVERTED ENQUIRIES
// ALL INSTITUTIONS
// ==========================================
export const getAllConvertedEnquiriesService =
  async (
    {
      page = 1,
      limit = 10,
      search = "",
      institutionId,
      departmentId,
      programmeId,
    }
  ) => {

    page = Number(page);
    limit = Number(limit);

    const query = {
      status: "Converted",
      isDeleted: false,
    };


    // Search by Student Name

    if (search) {
      query.studentName = {
        $regex: search,
        $options: "i",
      };
    }


    // Filter by Institution

    if (institutionId) {
      query.institutionId =
        institutionId;
    }


    // Filter by Department

    if (departmentId) {
      query.departmentId =
        departmentId;
    }


    // Filter by Programme

    if (programmeId) {
      query.programmeId =
        programmeId;
    }


    // Pagination

    const skip =
      (page - 1) * limit;


    // Total filtered converted records

    const total =
      await Enquiry.countDocuments(
        query
      );


    // Fetch converted enquiries

    const enquiries =
      await Enquiry.find(query)

        .populate(
          "institutionId",
          "institutionName institutionCode"
        )

        .populate(
          "departmentId",
          "departmentName"
        )

        .populate(
          "programmeId",
          "programmeName programmeType"
        )

        .populate(
          "createdBy",
          "fullName email"
        )

        .populate(
          "convertedBy",
          "fullName email"
        )

        .sort({
          convertedAt: -1,
        })

        .skip(skip)

        .limit(limit);


    // ==================================
    // GLOBAL CONVERSION STATS
    // ==================================

    const baseQuery = {
      isDeleted: false,
    };


    // Total Enquiries - all institutions

    const totalEnquiries =
      await Enquiry.countDocuments(
        baseQuery
      );


    // Total Conversions - all institutions

    const totalConversions =
      await Enquiry.countDocuments({
        ...baseQuery,
        status: "Converted",
      });


    // Start of current week

    const startOfWeek =
      new Date();

    startOfWeek.setHours(
      0,
      0,
      0,
      0
    );

    startOfWeek.setDate(
      startOfWeek.getDate() -
      startOfWeek.getDay()
    );


    // Conversions made this week

    const weeklyConversions =
      await Enquiry.countDocuments({

        ...baseQuery,

        status: "Converted",

        convertedAt: {
          $gte: startOfWeek,
        },

      });


    // ==================================
    // RETURN
    // ==================================

    return {

      enquiries,

      total,

      page,

      totalPages:
        Math.ceil(
          total / limit
        ),

      stats: {

        totalConversions,

        weeklyConversions,

        totalEnquiries,

      },

    };

};






// ==========================================
// TEXT NORMALIZER
// ==========================================

const normalizeText = (value) => {

  if (
    value === undefined ||
    value === null
  ) {

    return "";

  }

  return String(value)
    .trim()
    .replace(/\s+/g, " ");

};

// ==========================================
// EMAIL NORMALIZER
// ==========================================
const normalizeEmail = (email) => {

  if (
    !email
  ) {

    return "";

  }

  return String(email)
    .trim()
    .toLowerCase();

};
// ==========================================
// PHONE NORMALIZER
// ==========================================
const normalizePhone = (mobile) => {

  if (
    !mobile
  ) {

    return "";

  }

  return String(mobile)
    .replace(/\D/g, "")
    .trim();

};

// ==========================================
// GENDER NORMALIZER
// ==========================================
const normalizeGender = (gender) => {

  if (
    !gender
  ) {

    return "";

  }

  const value =
    String(gender)
      .trim()
      .toLowerCase();

  if (
    value === "male" ||
    value === "m"
  ) {

    return "Male";

  }

  if (
    value === "female" ||
    value === "f"
  ) {

    return "Female";

  }

  if (
    value === "other" ||
    value === "o"
  ) {

    return "Other";

  }

  return String(gender).trim();

};

// ==========================================
// STATUS NORMALIZER
// ==========================================
const normalizeStatus = (status) => {

  if (
    !status
  ) {

    return "New";

  }

  const value =
    String(status)
      .trim()
      .toLowerCase();

  if (
    value === "new"
  ) {

    return "New";

  }

  if (
    value === "interested"
  ) {

    return "Interested";

  }

  if (
    value === "follow up" ||
    value === "follow-up" ||
    value === "followup"
  ) {

    return "Follow Up";

  }

  if (
    value === "converted"
  ) {

    return "Converted";

  }

  if (
    value === "rejected"
  ) {

    return "Rejected";

  }

  return String(status).trim();

};

// ==========================================
// ENQUIRY SOURCE NORMALIZER
// ==========================================

const normalizeEnquirySource = (source) => {

  if (
    !source
  ) {

    return "Walk-In";

  }

  const value =
    String(source)
      .trim()
      .toLowerCase();

  if (
    value === "walk in" ||
    value === "walk-in" ||
    value === "walkin"
  ) {

    return "Walk-In";

  }

  if (
    value === "phone" ||
    value === "call"
  ) {

    return "Phone";

  }

  if (
    value === "website" ||
    value === "web"
  ) {

    return "Website";

  }

  if (
    value === "social media" ||
    value === "socialmedia" ||
    value === "social"
  ) {

    return "Social Media";

  }

  if (
    value === "reference" ||
    value === "ref"
  ) {

    return "Reference";

  }

  if (
    value === "other"
  ) {

    return "Other";

  }

  return String(source).trim();

};
// ==========================================
// DATE NORMALIZER
// ==========================================
const normalizeDate = (value) => {

  if (
    !value
  ) {

    return null;

  }

  const text =
    String(value)
      .trim();

  // DD-MM-YYYY / DD/MM/YYYY / DD.MM.YYYY

  const match =
    text.match(

      /^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/

    );

  if (match) {

    const [

      ,

      day,

      month,

      year

    ] = match;

    return new Date(

      Number(year),

      Number(month) - 1,

      Number(day)

    );

  }

  // YYYY-MM-DD

  const iso =
    new Date(text);

  if (

    !isNaN(

      iso.getTime()

    )

  ) {

    return iso;

  }

  return null;

};

// ==========================================
// REQUIRED FIELD VALIDATION
// ==========================================
const validateRequiredFields = (
  enquiry
) => {

  const errors = [];

  ENQUIRY_REQUIRED_HEADERS.forEach(

    (field) => {

      if (

        enquiry[field] === undefined ||

        enquiry[field] === null ||

        String(
          enquiry[field]
        ).trim() === ""

      ) {

        errors.push({

          field,

          reason:
            `${field} is required.`

        });

      }

    }

  );

  return errors;

};

// ==========================================
// EMAIL VALIDATION
// ==========================================
const validateEmail = (
  email
) => {

  if (
    !email
  ) {

    return true;

  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    .test(email);

};

// ==========================================
// MOBILE VALIDATION
// ==========================================

const validatePhone = (
  mobile
) => {

  if (
    !mobile
  ) {

    return false;

  }

  return /^[6-9]\d{9}$/
    .test(mobile);

};


export const bulkUploadEnquiriesService = async (
  file,
  user
) => {

  if (!file) {

    throw new Error(
      "Excel file is required."
    );

  }

  const session =
    await mongoose.startSession();

  session.startTransaction();
  
try {
const workbook =
  xlsx.readFile(
    file.path
  );
console.log("FILE:", file);
console.log("FILE PATH:", file?.path);
console.log("FILE BUFFER:", file?.buffer);
  const worksheet =
    workbook.Sheets[
      workbook.SheetNames[0]
    ];

const sheetData =
  xlsx.utils.sheet_to_json(
    worksheet,
    {
      header: 1,
      defval: "",
      raw: false,
    }
  );

  if (!sheetData.length) {

    throw new Error(
      "Uploaded Excel file is empty."
    );

  }

  const headerWarnings = [];

const importedWithWarnings = [];

const failedEnquiries = [];

const originalHeaders =
  sheetData[0];

  const normalizedHeaders =
  originalHeaders.map((header)=>

    String(header || "")
      .trim()
      .replace(/\s+/g," ")

  );

  const headerMap = {};

const mappedHeaders = [];

Object.entries(
  ENQUIRY_HEADER_ALIASES
).forEach(

([field, aliases]) => {

  aliases.forEach((alias) => {

    headerMap[
      alias
        .trim()
        .toLowerCase()
    ] = field;

  });

});

normalizedHeaders.forEach(
(header) => {

const key =
header
.toLowerCase();

mappedHeaders.push(

headerMap[key] ||

null

);

});


const duplicateHeaders = [];

mappedHeaders.forEach((field,index)=>{

  if(!field) return;

  const firstIndex =
    mappedHeaders.indexOf(field);

  if(firstIndex !== index){

    duplicateHeaders.push({

      type:"DUPLICATE_HEADER",

      severity:"error",

      header:
        normalizedHeaders[index],

      mappedField:field,

      firstOccurrence:
        normalizedHeaders[firstIndex],

    });

  }

});

if(duplicateHeaders.length){

  throw {

    success:false,

    message:
      "Duplicate Excel headers found.",

    duplicateHeaders,

  };

}

normalizedHeaders.forEach(

(header,index)=>{

if(mappedHeaders[index])
return;

headerWarnings.push({

type:"UNRECOGNIZED_HEADER",

severity:"warning",

column:String.fromCharCode(
65+index
),

receivedHeader:header,

reason:
"This Excel header is not recognized.",

action:
"Column will be ignored."

});

});

const missingHeaders = [];

ENQUIRY_REQUIRED_HEADERS.forEach(

(field)=>{

if(

!mappedHeaders.includes(field)

){

missingHeaders.push(field);

}

});

if(missingHeaders.length){

  throw{

    success:false,

    message:
      "Required Excel headers are missing.",

    missingHeaders,

  };

}

const rows =
  sheetData.slice(1);

const enquiriesToInsert = [];

for (

const [

rowIndex,
row

] of rows.entries()

) {

const isEmptyRow =
row.every(

(cell)=>

String(cell || "")
.trim()===""

);

if(isEmptyRow)
continue;

const excelRow =
rowIndex + 2;

const enquiry = {};

const rowErrors = [];

const rowWarnings = [];

mappedHeaders.forEach(

(field,columnIndex)=>{

if(!field)
return;

enquiry[field] =
row[columnIndex];

});

// ==========================================
// NORMALIZE VALUES
// ==========================================

enquiry.studentName =
normalizeText(
  enquiry.studentName
);

enquiry.parentName =
normalizeText(
  enquiry.parentName
);

enquiry.department =
normalizeText(
  enquiry.department
);

enquiry.programme =
normalizeText(
  enquiry.programme
);

enquiry.address =
normalizeText(
  enquiry.address
);

enquiry.remarks =
normalizeText(
  enquiry.remarks
);

if(enquiry.studentEmail){

  enquiry.studentEmail =
    normalizeEmail(
      enquiry.studentEmail
    );

  if(

    !validateEmail(
      enquiry.studentEmail
    )

  ){

  rowWarnings.push({

  field: "studentEmail",

  receivedValue:
    enquiry.studentEmail,

  reason:
    "Invalid student email format. Email was ignored."

});

    enquiry.studentEmail = null;

  }

}



enquiry.studentMobile =
normalizePhone(
  enquiry.studentMobile
);

if(

  !validatePhone(
    enquiry.studentMobile
  )

){

rowErrors.push({

  field:"studentMobile",

  receivedValue:
    enquiry.studentMobile,

  reason:
    "Invalid student mobile number."

});

}

if(enquiry.parentMobile){

  enquiry.parentMobile =
    normalizePhone(
      enquiry.parentMobile
    );

}

if(

  enquiry.parentMobile &&

  !validatePhone(
    enquiry.parentMobile
  )

){

rowWarnings.push({

  field:"parentMobile",

  receivedValue:
    enquiry.parentMobile,

  reason:
    "Invalid parent mobile number."

});

}

enquiry.gender =
normalizeGender(
  enquiry.gender
);

enquiry.status =
normalizeStatus(
  enquiry.status
);

enquiry.enquirySource =
normalizeEnquirySource(
  enquiry.enquirySource
);

enquiry.dateOfBirth =
normalizeDate(
  enquiry.dateOfBirth
);

if (

  !enquiry.dateOfBirth

) {

rowErrors.push({

  field:"dateOfBirth",

  receivedValue:
    row[mappedHeaders.indexOf("dateOfBirth")],

  reason:
    "Invalid date format."

});

}

if(enquiry.followUpDate){

  const normalizedFollowUpDate =
    normalizeDate(
      enquiry.followUpDate
    );

  if(!normalizedFollowUpDate){

rowWarnings.push({

  field:"followUpDate",

  receivedValue:
    row[mappedHeaders.indexOf("followUpDate")],

  reason:
    "Invalid follow-up date. Value was ignored."

});

    enquiry.followUpDate = null;

  }else{

    enquiry.followUpDate =
      normalizedFollowUpDate;

  }

}

// ==========================================
// REQUIRED FIELD VALIDATION
// ==========================================

rowErrors.push(

  ...validateRequiredFields(
    enquiry
  )

);

if(rowErrors.length){

  failedEnquiries.push({

    row: excelRow,

    studentName:
      enquiry.studentName || "Unknown",

    studentMobile:
      enquiry.studentMobile || null,

    errors: rowErrors,

    warnings: rowWarnings,

  });

  continue;

}

    console.log("Excel Department:", enquiry.department);
console.log("User Institution:", user.institution);
const department =
  await Department.findOne({

    departmentName: {
      $regex: `^${enquiry.department}$`,
      $options: "i",
    },

    institution:
      user.institution,

    isDeleted: false,

  }).lean();

  console.log("Department Result:", department);

if(!department){

  failedEnquiries.push({

    row: excelRow,

    studentName:
      enquiry.studentName,

    studentMobile:
      enquiry.studentMobile,

    errors:[

      {

        field: "department",

        reason: "Department not found."

      }

    ],

    warnings: rowWarnings,

  });

  continue;

}

console.log("Excel Programme:", enquiry.programme);
console.log("Department ID:", department._id);
const programme =
  await Programme.findOne({

    programmeName: {
      $regex: `^${enquiry.programme}$`,
      $options: "i",
    },

    department:
      department._id,

    isDeleted: false,

  }).lean();

  console.log("Programme Result:", programme);

if(!programme){

  failedEnquiries.push({

    row: excelRow,

    studentName:
      enquiry.studentName,

    studentMobile:
      enquiry.studentMobile,

    errors: [

      {

        field: "programme",

        reason: "Programme not found."

      }

    ],

    warnings: rowWarnings,

  });

  continue;

}

// ==========================================
// ASSIGN DATABASE REFERENCES
// ==========================================

enquiry.institutionId =
  user.institution;

enquiry.departmentId =
  department._id;

enquiry.programmeId =
  programme._id;

enquiry.createdBy =
  user.userId;

  delete enquiry.department;

delete enquiry.programme;

// ==========================================
// DUPLICATE ENQUIRY CHECK
// ==========================================

const existingEnquiry =
  await Enquiry.exists({

    institutionId:
      user.institution,

    studentMobile:
      enquiry.studentMobile,

    isDeleted: false,

  });

if(existingEnquiry){

  failedEnquiries.push({

    row: excelRow,

    studentName:
      enquiry.studentName,

    studentMobile:
      enquiry.studentMobile,

    errors: [

      {

        field: "studentMobile",

reason:
"Mobile number already exists."

      }

    ],

    warnings: rowWarnings,

  });

  continue;

}

if(enquiry.studentEmail){

  const existingEmail =
    await Enquiry.exists({

      institutionId:
        user.institution,

      studentEmail:
        enquiry.studentEmail,

      isDeleted: false,

    });

  if(existingEmail){

rowWarnings.push({

  field: "studentEmail",

  receivedValue:
    enquiry.studentEmail,

  reason:
    "Student email already exists in another enquiry."

});

  }

}

// ==========================================
// ADD ENQUIRY FOR INSERT
// ==========================================

if(rowWarnings.length){

  importedWithWarnings.push({

    row: excelRow,

    studentName:
      enquiry.studentName,

    studentMobile:
      enquiry.studentMobile,

    warnings: rowWarnings,

  });

}
enquiriesToInsert.push({

  ...enquiry,

});

}

// ==========================================
// BULK INSERT
// ==========================================

if(enquiriesToInsert.length){

  await Enquiry.insertMany(

    enquiriesToInsert,

    {

      session,

    }

  );

}

await session.commitTransaction();

await session.endSession();

const warningCount =

  headerWarnings.length +

  importedWithWarnings.reduce(

    (total, item) =>

      total + item.warnings.length,

    0

  );

return {

  success: true,

  message:
    failedEnquiries.length
      ? "Enquiry bulk upload completed with some rejected rows."
      : "Enquiry bulk upload completed successfully.",

  totalRows: rows.length,

  insertedCount: enquiriesToInsert.length,

  failedCount: failedEnquiries.length,

  warningCount,

  headerWarnings,

  importedWithWarnings,

  failedEnquiries,

};

}
catch (error) {

  if (
    session.inTransaction()
  ) {

    await session.abortTransaction();

  }

  await session.endSession();

  throw error;

}






};
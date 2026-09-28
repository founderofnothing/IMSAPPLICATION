import {
  createEnquiryService,
  getAllEnquiriesService,
  getEnquiryByIdService,
  updateEnquiryService,
  deleteEnquiryService,

  getDeletedEnquiriesService,
  restoreEnquiryService,
  permanentDeleteEnquiryService,

  getMyInstitutionEnquiriesService,
  getEnquiriesByStatusService,
//   getMyEnquiriesService,

  convertEnquiryService,
  getAllConvertedEnquiriesService,
  bulkUploadEnquiriesService
} from "./enquiry.service.js";


// create enquiary 
export const createEnquiry = async (
  req,
  res
) => {
  try {

       console.log("BODY:", req.body);
    console.log("USER:", req.user);


    const enquiry =
      await createEnquiryService(
        req.body,
        req.user
      );

    return res.status(201).json({
      success: true,
      message:
        "Enquiry created successfully.",
      data: enquiry,
    });

  } catch (error) {

    return res.status(400).json({
      success: false,
      message:
        error.message,
    });
  }
};

// get all enquiry
export const getAllEnquiries =
  async (req, res) => {
    try {

    const enquiries =
  await getAllEnquiriesService(
    req.query
  );

    return res.status(200).json({
  success: true,
  count: enquiries.total,
  page: enquiries.page,
  totalPages:
    enquiries.totalPages,
  data:
    enquiries.enquiries,
});

    } catch (error) {

      return res.status(500).json({
        success: false,
        message:
          error.message,
      });
    }
};



// get my institution enquiries
export const getMyInstitutionEnquiries =
  async (req, res) => {

    try {

      const enquiries =
        await getMyInstitutionEnquiriesService(

          req.user.institution,

          req.query

        );

      return res.status(200).json({

        success: true,

        count:
          enquiries.total,

        page:
          enquiries.page,

        totalPages:
          enquiries.totalPages,

        stats:
          enquiries.stats,

        data:
          enquiries.enquiries,

      });

    } catch (error) {

      return res.status(500).json({

        success: false,

        message:
          error.message,

      });

    }

  };

// get my enquiry 
// get my enquiries
export const getMyEnquiries =
  async (req, res) => {
    try {

     const enquiries =
  await getMyEnquiriesService(
    req.user.userId,
    req.query
  );

    return res.status(200).json({
  success: true,
  count: enquiries.total,
  page: enquiries.page,
  totalPages:
    enquiries.totalPages,
  data:
    enquiries.enquiries,
});

    } catch (error) {

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
};

// get enquiry by status
// get enquiries by status
export const getEnquiriesByStatus =
  async (req, res) => {
    try {

      const enquiries =
        await getEnquiriesByStatusService(
          req.params.status,
          req.query
        );

      return res.status(200).json({
        success: true,
        count:
          enquiries.total,
        page:
          enquiries.page,
        totalPages:
          enquiries.totalPages,
        data:
          enquiries.enquiries,
      });

    } catch (error) {

      return res.status(500).json({
        success: false,
        message:
          error.message,
      });
    }
};

// get enquiry by id
export const getEnquiryById =
  async (req, res) => {
    try {

      const enquiry =
        await getEnquiryByIdService(
          req.params.id
        );

      return res.status(200).json({
        success: true,
        data: enquiry,
      });

    } catch (error) {

      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
};

// update enquiry
export const updateEnquiry =
  async (req, res) => {
    try {

      const enquiry =
        await updateEnquiryService(
          req.params.id,
          req.body,
          req.user
        );

      return res.status(200).json({
        success: true,
        message:
          "Enquiry updated successfully.",
        data: enquiry,
      });

    } catch (error) {

      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
};


// delete enquiry
export const deleteEnquiry =
  async (req, res) => {
    try {

      await deleteEnquiryService(
        req.params.id
      );

      return res.status(200).json({
        success: true,
        message:
          "Enquiry deleted successfully.",
      });

    } catch (error) {

      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
};


// get deleted enquiries
// Get deleted enquiries
// Get deleted enquiries
export const getDeletedEnquiries =
  async (req, res) => {

    try {

      const enquiries =
        await getDeletedEnquiriesService(
          req.user.institution,
          req.query
        );

      return res.status(200).json({

        success: true,

        count:
          enquiries.length,

        data:
          enquiries,

      });

    } catch (error) {

      return res.status(500).json({

        success: false,

        message:
          error.message,

      });

    }

};


// restore enquiry
export const restoreEnquiry =
  async (req, res) => {
    try {

      const enquiry =
        await restoreEnquiryService(
          req.params.id
        );

      return res.status(200).json({
        success: true,
        message:
          "Enquiry restored successfully.",
        data:
          enquiry,
      });

    } catch (error) {

      return res.status(400).json({
        success: false,
        message:
          error.message,
      });
    }
};


// permanently delete enquiry
export const permanentDeleteEnquiry =
  async (req, res) => {
    try {

      await permanentDeleteEnquiryService(
        req.params.id
      );

      return res.status(200).json({
        success: true,
        message:
          "Enquiry permanently deleted.",
      });

    } catch (error) {

      return res.status(404).json({
        success: false,
        message:
          error.message,
      });
    }
};


// convert enquiry
export const convertEnquiry =
  async (req, res) => {
    try {

const result =
  await convertEnquiryService(
    req.params.id,
    req.body,
    req.user
  );

      return res.status(200).json({
        success: true,
        message:
          "Enquiry converted successfully.",
       data: result
      });

    } catch (error) {

      return res.status(400).json({
        success: false,
        message:
          error.message,
      });
    }
};


export const getConvertedEnquiries =
  async (req, res) => {

    try {

      const result =
        await getEnquiriesByStatusService(

          req.user.institution,

          "Converted",

          req.query

        );


      return res.status(200).json({

        success: true,

        count:
          result.total,

        page:
          result.page,

        totalPages:
          result.totalPages,

        stats:
          result.stats,

        data:
          result.enquiries,

      });


    } catch (error) {

      return res.status(500).json({

        success: false,

        message:
          error.message,

      });

    }

};

// get the conveted static across all instituion 
// ==========================================
// GET ALL CONVERTED ENQUIRIES
// ==========================================

export const getAllConvertedEnquiries =
  async (req, res) => {

    try {

      const result =
        await getAllConvertedEnquiriesService(
          req.query
        );


      return res.status(200).json({

        success: true,

        count:
          result.total,

        page:
          result.page,

        totalPages:
          result.totalPages,

        stats:
          result.stats,

        data:
          result.enquiries,

      });


    } catch (error) {

      return res.status(500).json({

        success: false,

        message:
          error.message,

      });

    }

};


// bulk enquiry upoad
export const bulkUploadEnquiries = async (
  req,
  res
) => {

  try {

    if (!req.file) {

      return res
        .status(400)
        .json({

          success: false,

          message:
            "Excel file is required.",

        });

    }

    const result =
      await bulkUploadEnquiriesService(

        req.file,

        req.user

      );

    return res
      .status(200)
      .json(result);

  } catch (error) {

    console.error(
      "Bulk Enquiry Upload Error:",
      error
    );

    if (
      error.success === false
    ) {

      return res
        .status(400)
        .json(error);

    }

    return res
      .status(500)
      .json({

        success: false,

        message:
          error.message ||

          "Failed to upload enquiries.",

      });

  }

};
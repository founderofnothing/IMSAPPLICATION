import {
  createFeeStructureService,
  getAllFeeStructuresService,
  updateFeeStructureService,
  deleteFeeStructureService,
  restoreFeeStructureService,
  permanentDeleteFeeStructureService,
  getDeletedFeeStructuresService,
  assignFeesToStudentsService,
  resetFeeAllocationService,
  getClassFeeAllocationsService,
  getStudentFeeAllocationService,
  collectFeePaymentService,
searchStudentFeeAllocationService,
getManagementStudentPaymentHistoryService,

  getStudentPaymentHistoryService,
getPrincipalFinanceService,
  getFinanceDashboardService,
  getDepartmentFinanceDashboardService,
  admgetFinanceDashboardService,
} from "./service.js";








// create fees structure 
export const createFeeStructure =
async (req, res) => {
    try {

      const feeStructure =
        await createFeeStructureService(
          req.body,
          req.user
        );

      return res.status(201).json({
        success: true,

        message:
          "Fee structure created successfully.",

        data:
          feeStructure,
      });

    } catch (error) {

      return res.status(400).json({
        success: false,

        message:
          error.message,
      });
    }
};

// ==================== GET ALL FEE STRUCTURES ====================
export const getAllFeeStructures =
  async (req, res) => {
    try {

   const result =
  await getAllFeeStructuresService();

return res.status(200).json({
  success: true,
  message: "Fee structures fetched successfully.",
  count: result.totalRecords,
  data: result.feeStructures,
});

    } catch (error) {

      return res.status(400).json({
        success: false,

        message:
error.message,
});
}
};
// ==================== UPDATE FEE STRUCTURE ====================
export const updateFeeStructure =
  async (req, res) => {
    try {

     const feeStructure =
  await updateFeeStructureService(
    req.params.id,
    req.body
  );

      return res.status(200).json({
        success: true,

        message:
          "Fee structure updated successfully.",

        data:
          feeStructure,
      });

    } catch (error) {

      return res.status(400).json({
        success: false,

        message:
          error.message,
      });
    }
  };


//   delete fees structure function 
// ==================== SOFT DELETE FEE STRUCTURE ====================
export const deleteFeeStructure =
  async (req, res) => {
    try {

    const feeStructure =
  await deleteFeeStructureService(
    req.params.id
  );

      return res.status(200).json({
        success: true,

        message:
          "Fee structure deleted successfully.",

        data:
          feeStructure,
      });

    } catch (error) {

      return res.status(400).json({
        success: false,

        message:
          error.message,
      });
    }
  };


//   restore fees structure
export const restoreFeeStructure =
  async (req, res) => {
    try {

    const feeStructure =
  await restoreFeeStructureService(
    req.params.id
  );

      return res.status(200).json({
        success: true,

        message:
          "Fee structure restored successfully.",

        data:
          feeStructure,
      });

    } catch (error) {

      return res.status(400).json({
        success: false,

        message:
          error.message,
      });
    }
  };
//   delete fees stucture from db
// ==================== PERMANENT DELETE FEE STRUCTURE ====================
export const permanentDeleteFeeStructure =
  async (req, res) => {
    try {

     const feeStructure =
  await permanentDeleteFeeStructureService(
    req.params.id
  );

      return res.status(200).json({
        success: true,

        message:
          "Fee structure permanently deleted.",

        data:
          feeStructure,
      });

    } catch (error) {

      return res.status(400).json({
        success: false,

        message:
          error.message,
      });
    }
  };

// ==================== GET DELETED FEE STRUCTURES ====================
export const getDeletedFeeStructures =
  async (req, res) => {
    try {

      const result =
        await getDeletedFeeStructuresService();

      return res.status(200).json({
        success: true,

        message:
          "Deleted fee structures fetched successfully.",

        count:
          result.totalRecords,

        data:
          result.feeStructures,
      });

    } catch (error) {

      return res.status(400).json({
        success: false,

        message:
          error.message,
      });
    }
  };




// ==================== ASSIGN FEES TO STUDENTS ====================

export const assignFeesToStudents =
  async (req, res) => {

    try {

      const {
        feeStructureId,
      } = req.body;


      // ==================== SERVICE ====================

      const result =
        await assignFeesToStudentsService(
          feeStructureId,
          req.user
        );


      // ==================== RESPONSE ====================

      return res.status(201).json({

        success: true,

        message:
          "Fees assigned successfully.",

        data: {

          totalEligibleStudents:
            result.totalEligibleStudents,

          alreadyAllocated:
            result.alreadyAllocated,

          newlyAllocated:
            result.newlyAllocated,

        },

      });

    } catch (error) {

      return res.status(400).json({

        success: false,

        message:
          error.message,

      });

    }
  };

  // ==================== RESET FEE ALLOCATION ====================
export const resetFeeAllocation =
  async (req, res) => {

    try {

      const {
        feeStructureId,
      } = req.params;


      // ==================== RESET ALLOCATION ====================

      const result =
        await resetFeeAllocationService(
          feeStructureId
        );


      // ==================== RESPONSE ====================

      return res.status(200).json({

        success: true,

        message:
          "Fee allocation reset successfully.",

        data: {

          feeStructureId:
            result.feeStructureId,

          removedAllocations:
            result.removedAllocations,

        },

      });

    } catch (error) {

      return res.status(400).json({

        success: false,

        message:
          error.message,

      });

    }
  };
//   get fees alocation by class id 
// ==================== GET CLASS FEE ALLOCATIONS ====================
export const getClassFeeAllocations =
  async (req, res) => {
    try {

      const page =
        Number(req.query.page) || 1;

      const limit =
        Number(req.query.limit) || 10;


      const result =
        await getClassFeeAllocationsService(
          req.params.classId,
          req.query.academicYear,
          page,
          limit
        );


      return res.status(200).json({
        success: true,

        academicYear:
          req.query.academicYear,

        class: {
          section:
            result.allocations[0]
              ?.classId?.section,
        },

        // Complete class fee statistics
        stats:
          result.stats,

        pagination:
          result.pagination,

        data:
          result.allocations.map(
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

              totalAmount:
                item.totalAmount,

              paidAmount:
                item.paidAmount,

              pendingAmount:
                item.pendingAmount,

              status:
                item.status,
            })
          ),
      });

    } catch (error) {

      return res.status(400).json({
        success: false,

        message:
          error.message,
      });
    }
  };
//  ==================== GET STUDENT FEE ALLOCATION ====================
export const getStudentFeeAllocation =
  async (req, res) => {
    try {

      const allocation =
     await getStudentFeeAllocationService(
  req.params.studentId,
  req.query.academicYear
);

      return res.status(200).json({
        success: true,

        data: {
          allocationId:
            allocation._id,

          studentId:
            allocation.studentId?._id,

          registerNumber:
            allocation.studentId
              ?.registerNumber,

          studentName:
            allocation.studentId
              ?.studentName,

          studentEmail:
            allocation.studentId
              ?.studentEmail,

          academicYear:
            allocation.academicYear,

          totalAmount:
            allocation.totalAmount,

          paidAmount:
            allocation.paidAmount,

          pendingAmount:
            allocation.pendingAmount,

          status:
            allocation.status,

          feeItems:
            allocation.feeItems,

          class: {
            year:
              allocation.classId
                ?.year,

            section:
              allocation.classId
                ?.section,
          },

          feeStructure:
            allocation.feeStructureId,

          assignedBy:
            allocation.assignedBy
              ?.fullName,
        },
      });

    } catch (error) {

      return res.status(400).json({
        success: false,

        message:
          error.message,
      });
    }
  };
//   payment function
// ==================== COLLECT FEE PAYMENT ====================
export const collectFeePayment =
  async (req, res) => {
    try {

      const result =
        await collectFeePaymentService(
          req.body,
          req.user
        );

      return res.status(201).json({
        success: true,

        message:
          "Payment collected successfully.",

        data: {
          receiptNumber:
            result.payment.receiptNumber,

          allocationId:
            result.allocation._id,

          registerNumber:
            result.allocation
              .studentId
              ?.registerNumber,

          studentName:
            result.allocation
              .studentId
              ?.studentName,

          academicYear:
            result.payment
              .academicYear,

          amountPaid:
            result.payment.amount,

          totalAmount:
            result.allocation
              .totalAmount,

          paidAmount:
            result.allocation
              .paidAmount,

          pendingAmount:
            result.allocation
              .pendingAmount,

          status:
            result.allocation
              .status,

          paymentMode:
            result.payment
              .paymentMode,

          paidAt:
            result.payment
              .paidAt,
        },
      });

    } catch (error) {

      return res.status(400).json({
        success: false,

        message:
          error.message,
      });
    }
  };
  // ==================== SEARCH STUDENT FEE ====================
export const searchStudentFeeAllocation =
  async (req, res) => {

    try {

      const {
        institutionId,
        registerNumber,
        academicYear,
      } = req.query;

      const result =
        await searchStudentFeeAllocationService(

          institutionId,

          registerNumber,

          academicYear

        );

      return res.status(200).json({

        success: true,

        message:
          "Student fee details fetched successfully.",

        data: result,

      });

    } catch (error) {

      return res.status(400).json({

        success: false,

        message:
          error.message,

      });

    }

  };


// ==================== MANAGEMENT - STUDENT PAYMENT HISTORY ====================

export const getManagementStudentPaymentHistory = async (
  req,
  res
) => {
  try {
    const result =
      await getManagementStudentPaymentHistoryService(
        req.params.studentId,
        req.query.academicYear
      );

    return res.status(200).json({
      success: true,

      student: {
        studentId:
          result.student?._id,

        registerNumber:
          result.student?.registerNumber,

        studentName:
          result.student?.studentName,

        studentEmail:
          result.student?.studentEmail,
      },

      totalPayments:
        result.totalPayments,

      totalPaid:
        result.totalPaid,

      data:
        result.payments.map(
          (payment) => ({
            paymentId:
              payment._id,

            receiptNumber:
              payment.receiptNumber,

            academicYear:
              payment.academicYear,

            amount:
              payment.amount,

            paymentMode:
              payment.paymentMode,

            receivedBy:
              payment.receivedBy
                ?.fullName,

            remarks:
              payment.remarks,

            paidAt:
              payment.paidAt,

            allocation:
              payment.studentFeeAllocationId,
          })
        ),
    });

  } catch (error) {
    return res.status(400).json({
      success: false,

      message:
        error.message,
    });
  }
};



//  ==================== GET STUDENT PAYMENT HISTORY ====================
export const getStudentPaymentHistory = async (
  req,
  res
) => {
  try {
    const result =
      await getStudentPaymentHistoryService(
        req.params.studentId,
        req.query.academicYear
      );

    // ==================== FEES HIDDEN ====================

    if (!result.feesVisible) {
      return res.status(200).json({
        success: true,

        student: {
          studentId:
            result.student?._id,

          registerNumber:
            result.student?.registerNumber,

          studentName:
            result.student?.studentName,

          studentEmail:
            result.student?.studentEmail,
        },

        feesVisible: false,

        totalPayments: "N/A",

        totalPaid: "N/A",

        data: "N/A",
      });
    }

    // ==================== FEES VISIBLE ====================

    return res.status(200).json({
      success: true,

      student: {
        studentId:
          result.student?._id,

        registerNumber:
          result.student?.registerNumber,

        studentName:
          result.student?.studentName,

        studentEmail:
          result.student?.studentEmail,
      },

      feesVisible: true,

      totalPayments:
        result.totalPayments,

      totalPaid:
        result.totalPaid,

      data:
        result.payments.map(
          (payment) => ({
            paymentId:
              payment._id,

            receiptNumber:
              payment.receiptNumber,

            academicYear:
              payment.academicYear,

            amount:
              payment.amount,

            paymentMode:
              payment.paymentMode,

            receivedBy:
              payment.receivedBy
                ?.fullName,

            remarks:
              payment.remarks,

            paidAt:
              payment.paidAt,

            allocation:
              payment.studentFeeAllocationId,
          })
        ),
    });

  } catch (error) {
    return res.status(400).json({
      success: false,

      message:
        error.message,
    });
  }
};



// principal finance report 
// ==================== PRINCIPAL FINANCE DASHBOARD ====================

export const getFinanceDashboard =
  async (req, res) => {

    try {

      const result =
        await getFinanceDashboardService(
          req.query,
          req.user.institution
        );


      return res.status(200).json({

        success: true,

        academicYear:
          result.academicYear,


        // ==================== SUMMARY ====================

        summary:
          result.summary,


        // ==================== COLLECTION TREND ====================

        collectionTrend:
          result.collectionTrend,


        // ==================== GITHUB STYLE ACTIVITY ====================

        collectionActivity:
          result.collectionActivity,


        // ==================== PAGINATION ====================

        pagination:
          result.pagination,


        // ==================== STUDENT DATA ====================

        data:
          result.students,

      });

    } catch (error) {

      console.error(
        "GET PRINCIPAL FINANCE DASHBOARD ERROR:",
        error
      );


      return res.status(400).json({

        success: false,

        message:
          error.message,

      });

    }

  };
  // hod finance report 
// ==================== HOD FINANCE DASHBOARD ====================
export const getDepartmentFinanceDashboard =
  async (req, res) => {
    try {

const result =
  await getDepartmentFinanceDashboardService(
    req.query,
    req.user.institution,
    req.user.department
  );

      return res.status(200).json({
        success: true,

        academicYear:
          result.academicYear,

        summary:
          result.summary,

        pagination:
          result.pagination,

        data:
          result.students,
      });

    } catch (error) {

      return res.status(400).json({
        success: false,

        message:
          error.message,
      });
    }
  };
//  ==================== SUPREME ADMIN FINANCE DASHBOARD ====================
export const admgetFinanceDashboard =
  async (req, res) => {
    try {

      const result =
        await admgetFinanceDashboardService(
          req.query
        );

      return res.status(200).json({
        success: true,

        academicYear:
          result.academicYear,

        overallSummary:
          result.overallSummary,

        collectionSummary:
          result.collectionSummary,

        // Finance breakdown for each institution
        institutions:
          result.institutions,

        pagination:
          result.pagination,

        data:
          result.students,
      });

    } catch (error) {

      return res.status(400).json({
        success: false,

        message:
          error.message,
      });
    }
  };
// ==========================================================
// PRINCIPAL FINANCE DASHBOARD
// ==========================================================
export const getPrincipalFinance =
  async (
    req,
    res
  ) => {

    try {

      // ======================================================
      // INSTITUTION FROM JWT
      // ======================================================

      const institutionId =
        req.user.institution;


      if (!institutionId) {

        return res.status(400).json({

          success: false,

          message:
            "Institution information not found.",

        });

      }


      // ======================================================
      // QUERY PARAMETERS
      // ======================================================

      const {

        academicYear,

        page = 1,

        limit = 10,

        startDate,

        endDate,

        search = "",

        classId,

        departmentId,

        status,

      } = req.query;


      // ======================================================
      // SERVICE
      // ======================================================

      const result =
        await getPrincipalFinanceService({

          institutionId,

          academicYear,

          page:
            Number(page),

          limit:
            Number(limit),

          startDate,

          endDate,

          search,

          classId,

          departmentId,

          status,

        });


      // ======================================================
      // RESPONSE
      // ======================================================

      return res.status(200).json({

        success: true,

        academicYear:
          result.academicYear,

        summary:
          result.summary,

        collectionTrend:
          result.collectionTrend,

        collectionActivity:
          result.collectionActivity,

        pagination:
          result.pagination,

        data:
          result.data,

      });

    } catch (error) {

      console.error(
        "GET PRINCIPAL FINANCE ERROR:",
        error
      );


      return res.status(500).json({

        success: false,

        message:
          error.message,

      });

    }

  };
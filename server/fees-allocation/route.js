import express from "express";

import {
  createFeeStructure,
  getAllFeeStructures,
  updateFeeStructure,
  deleteFeeStructure,
  restoreFeeStructure,
  permanentDeleteFeeStructure,
  getDeletedFeeStructures,

  assignFeesToStudents,
   resetFeeAllocation,
  getClassFeeAllocations,
  getStudentFeeAllocation,
  collectFeePayment,
  searchStudentFeeAllocation,
  getManagementStudentPaymentHistory,
  getStudentPaymentHistory,

  getFinanceDashboard,
  getPrincipalFinance,
  getDepartmentFinanceDashboard,
  admgetFinanceDashboard,
} from "./controller.js";

import {
  protect,
} from "../middleware/auth.middleware.js";

import {
  authorize,
  authorizeDesignation,
  authorizeNonTeachingDesignation
} from "../middleware/role.middleware.js";

const router =
  express.Router();




// Create Fee Structure
router.post("/structure",protect,authorize("non_teaching_faculty"),authorizeNonTeachingDesignation("accountant"),createFeeStructure);
// Get all active fee structures
router.get(
  "/structure",
  protect,
  authorize("non_teaching_faculty"),
  authorizeNonTeachingDesignation("accountant"),
  getAllFeeStructures
);

// Get soft deleted fee structures
router.get(
  "/structure/bin",
  protect,
  authorize("non_teaching_faculty"),
  authorizeNonTeachingDesignation("accountant"),
  getDeletedFeeStructures
);  


// restore fees structure
router.put("/structure/restore/:id",protect,authorize("non_teaching_faculty"),authorizeNonTeachingDesignation("accountant"),restoreFeeStructure);
// update fees structure 
router.put("/structure/:id",protect,authorize("non_teaching_faculty"),authorizeNonTeachingDesignation("accountant"),updateFeeStructure);
// delete fees structure 
router.delete("/structure/:id",protect,authorize("non_teaching_faculty"),authorizeNonTeachingDesignation("accountant"),deleteFeeStructure);
// delete from db
router.delete("/structure/permanent/:id",protect,authorize("non_teaching_faculty"),authorizeNonTeachingDesignation("accountant"),permanentDeleteFeeStructure);





// fees allocation
router.post("/allocation/assign",protect,authorize("non_teaching_faculty"),authorizeNonTeachingDesignation("accountant"),assignFeesToStudents);


// ==================== RESET FEE ALLOCATION ====================

router.delete(
  "/allocation/reset/:feeStructureId",
  protect,
  authorize("non_teaching_faculty"),
  authorizeNonTeachingDesignation("accountant"),
  resetFeeAllocation
);

// get class fees allocation info 
router.get(
  "/allocation/class/:classId",
  protect,
  authorize(
    "non_teaching_faculty"
  ),
  getClassFeeAllocations
);


router.get("/allocation/student/:studentId",protect,authorize("non_teaching_faculty"),authorizeNonTeachingDesignation("accountant"),getStudentFeeAllocation);

// ==================== SEARCH STUDENT FEE ====================

router.get(
  "/payment/search",
  protect,
  authorize("non_teaching_faculty"),
  authorizeNonTeachingDesignation("accountant"),
  searchStudentFeeAllocation
);
//  payment function
router.post("/payment",protect,authorize("non_teaching_faculty"),collectFeePayment);




router.get(
  "/payment/management/student/:studentId",
  protect,
  authorize(
    "non_teaching_faculty",
    "teaching_faculty"
  ),
  getStudentPaymentHistory

);


// PAYMENT HISTORY
router.get(
  "/payment/student/:studentId",
  protect,
  authorize(
    "non_teaching_faculty",
    "teaching_faculty"
  ),
    getManagementStudentPaymentHistory

);

router.get(
  "/principal/dashboard",
  protect,
  authorize("teaching_faculty"),
  getPrincipalFinance
);


// principal finance report 
router.get("/finance/dashboard",protect,authorize("teaching_faculty"),authorizeDesignation("principal"),getFinanceDashboard);
// hod finance report 
router.get("/finance/department-dashboard",protect,authorize("teaching_faculty"),authorizeDesignation("hod"),getDepartmentFinanceDashboard);
// admin finance reports
router.get(
  "/finance/admin-dashboard",
  protect,
  admgetFinanceDashboard
);

export default router;
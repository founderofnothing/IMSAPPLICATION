import express from "express";

import {
  createUser,
  getAllFaculty,
  softDeleteUser,
  getDeletedUsers,
  restoreUser,
  permanentDeleteUser,
  getAssignableStaff,
  getUserById,
  getMyProfile,
  updateMyProfile,
  getMyDepartmentTeachingFaculty,
  getMyInstitutionTeachingFaculty,
  updateUser,

  getUGTeachingFaculty,
getPGTeachingFaculty
} from "./user.controller.js";

import {
  authorize,
  authorizeDesignation,
} from "../middleware/role.middleware.js";

import {
  profileUpload,
} from "../middleware/upload.middleware.js";

import {
  protect,
} from "../middleware/auth.middleware.js";

const router = express.Router();


// =====================================================
// 1. CREATE USER
// =====================================================

router.post(
  "/create",
  // protect,
  profileUpload.single("profileImage"),
  createUser
);


// =====================================================
// 2. CURRENT USER / MY PROFILE
// =====================================================

// GET MY PROFILE
router.get(
  "/my-profile",
  protect,
  getMyProfile
);

// UPDATE MY PROFILE
router.put(
  "/my-profile",
  protect,
  profileUpload.single("profileImage"),
  updateMyProfile
);


// =====================================================
// 3. FACULTY LIST
// =====================================================

// Get all faculty
router.get(
  "/faculty",
  protect,
  getAllFaculty
);




router.get(
  "/faculty/teaching/ug",
  protect,
  getUGTeachingFaculty
);


// =====================================================
// PG TEACHING FACULTY
// =====================================================

router.get(
  "/faculty/teaching/pg",
  protect,
  getPGTeachingFaculty
);





// HR assignable staff
router.get(
  "/assignable-staff",
  protect,
  getAssignableStaff
);


// =====================================================
// 4. FACULTY BY ORGANIZATION
// =====================================================

// Principal → teaching faculty in institution
router.get(
  "/my-institution",
  protect,
  getMyInstitutionTeachingFaculty
);

// HOD → teaching faculty in department
router.get(
  "/my-department",
  protect,
  authorize("teaching_faculty"),
  authorizeDesignation("hod"),
  getMyDepartmentTeachingFaculty
);


// =====================================================
// 5. RECYCLE BIN
// =====================================================

// Get deleted users
router.get(
  "/recycle-bin",
  protect,
  getDeletedUsers
);


// =====================================================
// 6. RESTORE USER
// =====================================================

router.put(
  "/:userId/restore",
  protect,
  restoreUser
);


// =====================================================
// 7. PERMANENT DELETE USER
// =====================================================

router.delete(
  "/:userId/permanent",
  protect,
  permanentDeleteUser
);


// =====================================================
// 8. SOFT DELETE USER
// =====================================================

router.delete(
  "/:userId",
  protect,
  softDeleteUser
);


// =====================================================
// 9. UPDATE USER BY ID
// =====================================================

// IMPORTANT:
// This MUST come after /my-profile.
//
// Otherwise:
//
// PUT /my-profile
//
// would become:
//
// req.params.id = "my-profile"
//
// and MongoDB would throw:
//
// Cast to ObjectId failed for value "my-profile"

router.put(
  "/:id",
  protect,
  profileUpload.single("profileImage"),
  updateUser
);


// =====================================================
// 10. GET USER BY ID
// =====================================================

// IMPORTANT:
// Keep this LAST because /:id is a dynamic route.

router.get(
  "/:id",
  protect,
  getUserById
);


export default router;
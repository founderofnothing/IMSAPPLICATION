import {
  createClubService,
  getClubsService,
  getClubByIdService,
  updateClubService,
  deleteClubService,
  getDeletedClubsService,
  clubLoginService,
  restoreClubService,
  permanentlyDeleteClubService
} from "./club.service.js";

// ==========================================
// CREATE CLUB
// ==========================================
// ==========================================
// CREATE CLUB
// ==========================================

export const createClub = async (req, res) => {

  try {

    const {
      clubName,
      shortTag,
      description,
      inchargeId,
    } = req.body;

    // ==========================================
    // VALIDATION
    // ==========================================

    if (
      !clubName ||
      !shortTag ||
      !description ||
      !inchargeId
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Club name, short tag, description and incharge are required.",
      });
    }

    // ==========================================
    // CREATE CLUB
    // ==========================================

    const club = await createClubService({
      clubName,
      shortTag,
      description,

      // Institution comes from logged-in user JWT
      institutionId: req.user.institution,

      // Selected teaching faculty user ID
      inchargeId,
    });

    return res.status(201).json({
      success: true,
      message: "Club created successfully.",
      data: club,
    });

  } catch (error) {

    console.error(
      "Create Club Error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "Failed to create club.",
    });
  }
};

// ==========================================
// GET ALL CLUBS
// ==========================================
export const getClubs = async (
  req,
  res
) => {

  try {

    const clubs =
      await getClubsService();

    return res.status(200).json({
      success: true,
      message:
        "Clubs fetched successfully.",
      data: clubs,
    });

  } catch (error) {

    console.error(
      "Get Clubs Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to fetch clubs.",
    });
  }
};

// ==========================================
// GET SINGLE CLUB
// ==========================================
export const getClubById = async (
  req,
  res
) => {

  try {

    const { clubId } =
      req.params;

    const club =
      await getClubByIdService(
        clubId
      );

    return res.status(200).json({
      success: true,
      message:
        "Club fetched successfully.",
      data: club,
    });

  } catch (error) {

    console.error(
      "Get Club Error:",
      error
    );

    return res.status(404).json({
      success: false,
      message:
        error.message ||
        "Club not found.",
    });
  }
};

// ==========================================
// UPDATE CLUB
// ==========================================
export const updateClub = async (req, res) => {

  try {

    const { clubId } = req.params;

    const {
      clubName,
      shortTag,
      description,
      inchargeId,
    } = req.body;

    // ==========================================
    // VALIDATION
    // ==========================================

    if (
      !clubName &&
      !shortTag &&
      !description &&
      !inchargeId
    ) {
      return res.status(400).json({
        success: false,
        message:
          "At least one field is required to update the club.",
      });
    }

    // ==========================================
    // UPDATE CLUB
    // ==========================================

    const updatedClub =
      await updateClubService({
        clubId,
        clubName,
        shortTag,
        description,
        inchargeId,
      });

    // ==========================================
    // SUCCESS RESPONSE
    // ==========================================

    return res.status(200).json({
      success: true,
      message:
        "Club updated successfully.",
      data: updatedClub,
    });

  } catch (error) {

    console.error(
      "Update Club Error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "Failed to update club.",
    });
  }
};

// ==========================================
// SOFT DELETE CLUB
// ==========================================

export const deleteClub = async (req, res) => {

  try {

    const { clubId } = req.params;

    const deletedClub =
      await deleteClubService({
        clubId,
      });

    return res.status(200).json({
      success: true,
      message:
        "Club moved to recycle bin successfully.",
      data: deletedClub,
    });

  } catch (error) {

    console.error(
      "Delete Club Error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "Failed to delete club.",
    });
  }
};


// ==========================================
// GET DELETED CLUBS
// RECYCLE BIN
// ==========================================

export const getDeletedClubs = async (
  req,
  res
) => {

  try {

    const clubs =
      await getDeletedClubsService();

    return res.status(200).json({
      success: true,
      message:
        "Deleted clubs fetched successfully.",
      data: clubs,
    });

  } catch (error) {

    console.error(
      "Get Deleted Clubs Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to fetch deleted clubs.",
    });
  }
};


// ==========================================
// RESTORE CLUB
// ==========================================

export const restoreClub = async (
  req,
  res
) => {

  try {

    const { clubId } = req.params;

    const restoredClub =
      await restoreClubService({
        clubId,
      });

    return res.status(200).json({
      success: true,
      message:
        "Club restored successfully.",
      data: restoredClub,
    });

  } catch (error) {

    console.error(
      "Restore Club Error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "Failed to restore club.",
    });
  }
};


// ==========================================
// PERMANENTLY DELETE CLUB
// ==========================================

export const permanentlyDeleteClub = async (
  req,
  res
) => {

  try {

    const { clubId } = req.params;

    const deletedClub =
      await permanentlyDeleteClubService({
        clubId,
      });

    return res.status(200).json({
      success: true,
      message:
        "Club permanently deleted from database.",
      data: deletedClub,
    });

  } catch (error) {

    console.error(
      "Permanent Delete Club Error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "Failed to permanently delete club.",
    });
  }
};


// import {
//   clubLoginService,
// } from "./Club.service.js";


// =========================================================
// CLUB LOGIN
// =========================================================

export const clubLogin = async (
  req,
  res
) => {

  try {

    const {
      clubId,
      email,
      password,
    } = req.body;


    // =====================================================
    // LOGIN
    // =====================================================

    const result =
      await clubLoginService({
        clubId,
        email,
        password,
      });


    // =====================================================
    // SUCCESS
    // =====================================================

    return res.status(200).json({

      success: true,

      message:
        "Club login successful.",

      data: result,

    });

  } catch (error) {

    console.error(
      "Club Login Error:",
      error
    );


    // =====================================================
    // CLUB INCHARGE AUTHORIZATION ERROR
    // =====================================================

    if (
      error.message ===
      "You are not the incharge of this club."
    ) {

      return res.status(403).json({

        success: false,

        code:
          "CLUB_INCHARGE_REQUIRED",

        message:
          error.message,

      });

    }


    // =====================================================
    // LOGIN ERROR
    // =====================================================

    return res.status(401).json({

      success: false,

      message:
        error.message ||
        "Club login failed.",

    });

  }

};
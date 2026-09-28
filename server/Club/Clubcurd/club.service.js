import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import Club from "./Club.model.js";
import User from "../../user/models/user.model.js";


// =========================================================
// CREATE CLUB
// =========================================================

export const createClubService = async ({
  clubName,
  shortTag,
  description,
  institutionId,
  inchargeId,
}) => {

  // =======================================================
  // VALIDATION
  // =======================================================

  if (!clubName?.trim()) {
    throw new Error(
      "Club name is required."
    );
  }

  if (!shortTag?.trim()) {
    throw new Error(
      "Club short tag is required."
    );
  }

  if (!description?.trim()) {
    throw new Error(
      "Club description is required."
    );
  }

  if (!institutionId) {
    throw new Error(
      "Institution is required."
    );
  }

  if (!inchargeId) {
    throw new Error(
      "Club incharge is required."
    );
  }


  // =======================================================
  // CHECK INCHARGE USER
  // =======================================================

  const incharge =
    await User.findOne({
      _id: inchargeId,
      isDeleted: false,
    });

  if (!incharge) {
    throw new Error(
      "Club incharge not found."
    );
  }


  // =======================================================
  // CHECK DUPLICATE CLUB
  // =======================================================

  const existingClub =
    await Club.findOne({
      clubName: clubName.trim(),
      institutionId,
      isDeleted: false,
    });

  if (existingClub) {
    throw new Error(
      "A club with this name already exists in this institution."
    );
  }


  // =======================================================
  // CREATE CLUB
  // =======================================================

  const club =
    await Club.create({

      clubName:
        clubName.trim(),

      shortTag:
        shortTag.trim().toUpperCase(),

      description:
        description.trim(),

      institutionId,

      inchargeId,

    });


  // =======================================================
  // POPULATE INCHARGE
  // =======================================================

  await club.populate(
    "inchargeId",
    "fullName email profileImage"
  );


  return club;
};


// =========================================================
// GET ALL ACTIVE CLUBS
// =========================================================

export const getClubsService = async ({
  institutionId,
}) => {

  const filter = {
    isDeleted: false,
  };


  if (institutionId) {
    filter.institutionId =
      institutionId;
  }


  const clubs =
    await Club.find(filter)
      .populate(
        "institutionId",
        "institutionName institutionCode"
      )
      .populate(
        "inchargeId",
        "fullName email profileImage"
      )
      .sort({
        createdAt: -1,
      });


  return clubs;
};


// =========================================================
// GET SINGLE CLUB
// =========================================================

export const getClubByIdService = async ({
  clubId,
}) => {

  const club =
    await Club.findOne({
      _id: clubId,
      isDeleted: false,
    })
      .populate(
        "institutionId",
        "institutionName institutionCode"
      )
      .populate(
        "inchargeId",
        "fullName email profileImage"
      );


  if (!club) {
    throw new Error(
      "Club not found."
    );
  }


  return club;
};


// =========================================================
// UPDATE CLUB
// =========================================================

export const updateClubService = async ({
  clubId,
  clubName,
  shortTag,
  description,
  institutionId,
  inchargeId,
}) => {

  const club =
    await Club.findOne({
      _id: clubId,
      isDeleted: false,
    });


  if (!club) {
    throw new Error(
      "Club not found."
    );
  }


  // =======================================================
  // CLUB NAME
  // =======================================================

  if (
    clubName !== undefined
  ) {

    if (!clubName.trim()) {
      throw new Error(
        "Club name cannot be empty."
      );
    }

    club.clubName =
      clubName.trim();

  }


  // =======================================================
  // SHORT TAG
  // =======================================================

  if (
    shortTag !== undefined
  ) {

    if (!shortTag.trim()) {
      throw new Error(
        "Club short tag cannot be empty."
      );
    }

    club.shortTag =
      shortTag.trim().toUpperCase();

  }


  // =======================================================
  // DESCRIPTION
  // =======================================================

  if (
    description !== undefined
  ) {

    if (!description.trim()) {
      throw new Error(
        "Club description cannot be empty."
      );
    }

    club.description =
      description.trim();

  }


  // =======================================================
  // INSTITUTION
  // =======================================================

  if (
    institutionId !== undefined
  ) {

    club.institutionId =
      institutionId;

  }


  // =======================================================
  // INCHARGE
  // =======================================================

  if (
    inchargeId !== undefined
  ) {

    const incharge =
      await User.findOne({
        _id: inchargeId,
        isDeleted: false,
      });

    if (!incharge) {
      throw new Error(
        "Club incharge not found."
      );
    }

    club.inchargeId =
      inchargeId;

  }


  // =======================================================
  // SAVE
  // =======================================================

  await club.save();


  // =======================================================
  // POPULATE
  // =======================================================

  await club.populate(
    "institutionId",
    "institutionName institutionCode"
  );

  await club.populate(
    "inchargeId",
    "fullName email profileImage"
  );


  return club;
};


// =========================================================
// SOFT DELETE CLUB
// =========================================================

export const deleteClubService = async ({
  clubId,
}) => {

  const club =
    await Club.findOne({
      _id: clubId,
      isDeleted: false,
    });


  if (!club) {
    throw new Error(
      "Club not found."
    );
  }


  club.isDeleted =
    true;

  club.deletedAt =
    new Date();


  await club.save();


  return club;
};


// =========================================================
// GET DELETED CLUBS
// =========================================================

export const getDeletedClubsService =
  async () => {

    const clubs =
      await Club.find({
        isDeleted: true,
      })
        .populate(
          "institutionId",
          "institutionName institutionCode"
        )
        .populate(
          "inchargeId",
          "fullName email profileImage"
        )
        .sort({
          deletedAt: -1,
        });


    return clubs;
  };


// =========================================================
// RESTORE CLUB
// =========================================================

export const restoreClubService =
  async ({
    clubId,
  }) => {

    const club =
      await Club.findOne({
        _id: clubId,
        isDeleted: true,
      });


    if (!club) {
      throw new Error(
        "Deleted club not found."
      );
    }


    club.isDeleted =
      false;

    club.deletedAt =
      null;


    await club.save();


    return club;
  };


// =========================================================
// PERMANENTLY DELETE CLUB
// =========================================================

export const permanentlyDeleteClubService =
  async ({
    clubId,
  }) => {

    const club =
      await Club.findOne({
        _id: clubId,
        isDeleted: true,
      });


    if (!club) {
      throw new Error(
        "Deleted club not found."
      );
    }


    await Club.deleteOne({
      _id: clubId,
    });


    return club;
  };


// =========================================================
// CLUB LOGIN
// =========================================================
//
// Login requires ONLY:
//
// email
// password
//
// The service automatically finds the Club using:
//
// Club.inchargeId === User._id
//
// =========================================================

export const clubLoginService = async ({
  email,
  password,
}) => {

  // =======================================================
  // VALIDATION
  // =======================================================

  if (!email?.trim()) {
    throw new Error(
      "Email is required."
    );
  }

  if (!password) {
    throw new Error(
      "Password is required."
    );
  }


  // =======================================================
  // FIND ACTIVE USER
  // =======================================================

  const user =
    await User.findOne({
      email:
        email.trim().toLowerCase(),

      isDeleted: false,
    });


  if (!user) {
    throw new Error(
      "Invalid email or password."
    );
  }


  // =======================================================
  // VERIFY PASSWORD
  // =======================================================

  const isPasswordMatched =
    await bcrypt.compare(
      password,
      user.password
    );


  if (!isPasswordMatched) {
    throw new Error(
      "Invalid email or password."
    );
  }


  // =======================================================
  // FIND CLUB ASSIGNED TO THIS USER
  // =======================================================

  const club =
    await Club.findOne({
      inchargeId: user._id,
      isDeleted: false,
    });


  // =======================================================
  // USER IS NOT CLUB INCHARGE
  // =======================================================

  if (!club) {
    throw new Error(
      "You are not assigned as an incharge of any club."
    );
  }


  // =======================================================
  // UPDATE LAST LOGIN
  // =======================================================

  user.lastLogin =
    new Date();

  await user.save();


  // =======================================================
  // GENERATE CLUB JWT
  // =======================================================

  const token =
    jwt.sign(

      {

        // ===============================================
        // MASTER USER ID
        // ===============================================

        userId:
          user._id,


        // ===============================================
        // USER INFORMATION
        // ===============================================

        role:
          user.role,

        institution:
          user.institution,

        department:
          user.department,


        // ===============================================
        // CLUB ID
        // ===============================================

        clubId:
          club._id,


        // ===============================================
        // AUTH TYPE
        // ===============================================

        authType:
          "club",

      },

      process.env.JWT_SECRET,

      {

        expiresIn:
          "7d",

      }

    );


  // =======================================================
  // RETURN CLUB LOGIN DATA
  // =======================================================

  return {

    token,

    user: {

      userId:
        user._id,

      fullName:
        user.fullName,

      email:
        user.email,

      role:
        user.role,

      institution:
        user.institution,

      department:
        user.department,

      profileImage:
        user.profileImage || null,

    },


    club: {

      _id:
        club._id,

      clubName:
        club.clubName,

      shortTag:
        club.shortTag,

      description:
        club.description,

      institutionId:
        club.institutionId,

      inchargeId:
        club.inchargeId,

    },

  };

};
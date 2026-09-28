import User from "../user/models/user.model.js";
// import NonTeachingFaculty from "../non-teaching-faculty/models/nonTeachingFaculty.model.js";
// import TeachingFaculty from "../teaching-faculty/models/teachingFaculty.model.js";

import TeachingFaculty from "./../user/models/teachingFaculty.model.js"
import NonTeachingFaculty from "./../user/models/nonTeachingFaculty.model.js"

import bcrypt from "bcryptjs";
import generateToken from "../utils/generateToken.js";

export const loginService = async (
  loginData
) => {

  const { email, password } =
    loginData;

const user = await User.findOne({
  email,
  isDeleted: false,
});

  if (!user) {
    throw new Error(
      "Invalid email or password"
    );
  }

  const isPasswordMatched =
    await bcrypt.compare(
      password,
      user.password
    );

  if (!isPasswordMatched) {
    throw new Error(
      "Invalid email or password"
    );
  }

  user.lastLogin = new Date();

  await user.save();

  let designation = null;

  // Teaching Faculty
  if (
    user.role ===
    "teaching_faculty"
  ) {

    const faculty =
      await TeachingFaculty.findOne({
        userId: user._id,
      });

    designation =
      faculty?.designation || null;
  }

  // Non Teaching Faculty
  if (
    user.role ===
    "non_teaching_faculty"
  ) {

    const staff =
      await NonTeachingFaculty.findOne({
        userId: user._id,
      });

    designation =
      staff?.designation || null;
  }

  const token =
    generateToken(user);

  return {
    token,

    user: {
      userId:
        user._id,

      fullName:
        user.fullName,

      role:
        user.role,

      designation,

      institution:
        user.institution,

      // department:
      //   user.department,
    },
  };
};
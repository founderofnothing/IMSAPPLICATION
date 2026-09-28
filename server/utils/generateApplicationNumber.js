import Student from "../student/student.model.js";

const generateApplicationNumber =
  async () => {

    // Get Current Year

    const year =
      new Date().getFullYear();

    // Count Students

    const totalStudents =
      await Student.countDocuments();

    // Increment Count

    const nextNumber =
      totalStudents + 1;

    // Pad Number

    const paddedNumber =
      String(
        nextNumber
      ).padStart(
        4,
        "0"
      );

    // Generate Number

    return `APP-${year}-${paddedNumber}`;
};

export default generateApplicationNumber;
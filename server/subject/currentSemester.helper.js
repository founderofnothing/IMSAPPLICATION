import mongoose from "mongoose";
import Class from "../class/class.model.js";
import ProgrammeStructure from "../subject/ProgrammeStructureSchema/programmeStructureSchema.model.js";
import Subject from "./subject.model.js";

export const getCurrentSemesterSubjects =
  async (classId) => {

    if (!mongoose.Types.ObjectId.isValid(classId)) {
      throw new Error("Invalid class ID.");
    }

    const classData = await Class.findOne({
      _id: classId,
      isDeleted: false,
    }).populate(
      "programme",
      "programmeName programmeCode"
    );

    if (!classData) {
      throw new Error("Class not found.");
    }

    const programmeStructure =
      await ProgrammeStructure.findOne({
        programmeId: classData.programme,
        isDeleted: false,
      });

    if (!programmeStructure) {
      throw new Error("Programme structure not found.");
    }

    if (!programmeStructure.currentSemester) {
      throw new Error("Current semester is not configured.");
    }

    let studyYear = null;

    for (const year of programmeStructure.structure) {

      const semester =
        year.semesters.find(
          (item) =>
            item.semesterNumber ===
            programmeStructure.currentSemester
        );

      if (semester) {
        studyYear = year.studyYear;
        break;
      }

    }

    if (!studyYear) {
      throw new Error(
        "Current semester mapping not found."
      );
    }

    const subjects =
      await Subject.find({
        programmeId: classData.programme,
        studyYear,
        semesterNumber:
          programmeStructure.currentSemester,
        isDeleted: false,
        isActive: true,
      })
      .sort({
        subjectCode: 1,
      });

    return {

      classData,

      programmeStructure,

      studyYear,

      currentSemester:
        programmeStructure.currentSemester,

      subjects,

    };

  };
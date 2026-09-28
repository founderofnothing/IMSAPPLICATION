import XLSX from "xlsx";
import mongoose from "mongoose";
import AcademicCalendar from "./model/academicCalendar.js";
import CalendarEvent from "./model/calendarEvent.js";







// ACC CALENDER FUNCTION 



// create acc calender function 
export const createAcademicCalendarService =
  async (calendarData, user) => {
    const {
      academicYear,
      semesterName,
      semesterNumber,
      startDate,
      endDate,
    } = calendarData;

    const institutionId =
      user.institution;

    // Validate Dates
    if (
      new Date(startDate) >=
      new Date(endDate)
    ) {
      throw new Error(
        "End date must be greater than start date."
      );
    }

    // Prevent Duplicate Semester
    const existingCalendar =
      await AcademicCalendar.findOne({
        institutionId,

        academicYear,

        semesterNumber,

        isDeleted: {
          $ne: true,
        },
      });

    if (existingCalendar) {
      throw new Error(
        "Academic calendar already exists."
      );
    }

    // Prevent Overlapping Dates
    const overlappingCalendar =
      await AcademicCalendar.findOne({
        institutionId,

        isDeleted: {
          $ne: true,
        },

        isActive: true,

        startDate: {
          $lte: endDate,
        },

        endDate: {
          $gte: startDate,
        },
      });

    if (overlappingCalendar) {
      throw new Error(
        "This semester overlaps with an existing academic calendar."
      );
    }

    // Create Calendar
    const calendar =
      await AcademicCalendar.create({
        institutionId,

        academicYear,

        semesterName,

        semesterNumber,

        startDate,

        endDate,

        createdBy:
          user.userId,
      });

    return calendar;
  };
  // get calendar by institution id 
export const getAcademicCalendarsService =
  async (institutionId) => {
    const calendars =
      await AcademicCalendar.find({
        institutionId,

        isDeleted: {
          $ne: true,
        },
      })
        .select(
          "academicYear semesterName semesterNumber startDate endDate isActive createdAt"
        )
        .sort({
          startDate: -1,
        });

    return calendars;
  };
// update calender function
export const updateAcademicCalendarService =
  async (
    calendarId,
    calendarData,
    user
  ) => {
    const {
      academicYear,
      semesterName,
      semesterNumber,
      startDate,
      endDate,
      isActive,
    } = calendarData;

    const institutionId =
      user.institution;

    // Validate ObjectId
    if (
      !mongoose.Types.ObjectId.isValid(
        calendarId
      )
    ) {
      throw new Error(
        "Invalid calendar ID."
      );
    }

    // Find Calendar
   const calendar =
  await AcademicCalendar.findOne({
    _id: calendarId,

    institutionId,

    isDeleted: {
      $ne: true,
    },
  });

    if (!calendar) {
      throw new Error(
        "Academic calendar not found."
      );
    }

    // Validate Dates
    if (
      new Date(startDate) >=
      new Date(endDate)
    ) {
      throw new Error(
        "End date must be greater than start date."
      );
    }

    // Prevent Duplicate Semester
    const existingCalendar =
  await AcademicCalendar.findOne({
    _id: {
      $ne: calendarId,
    },

    institutionId,

    academicYear,

    semesterNumber,

    isDeleted: {
      $ne: true,
    },
  });

    if (existingCalendar) {
      throw new Error(
        "Academic calendar already exists."
      );
    }

    // Prevent Overlapping Dates
    const overlappingCalendar =
      await AcademicCalendar.findOne({
        _id: {
          $ne: calendarId,
        },

        institutionId,

        isActive: true,

        startDate: {
          $lte: endDate,
        },

        endDate: {
          $gte: startDate,
        },
      });

    if (overlappingCalendar) {
      throw new Error(
        "This semester overlaps with another academic calendar."
      );
    }

    // Update
    calendar.academicYear =
      academicYear;

    calendar.semesterName =
      semesterName;

    calendar.semesterNumber =
      semesterNumber;

    calendar.startDate =
      startDate;

    calendar.endDate =
      endDate;

    calendar.isActive =
      isActive;

    await calendar.save();

    return calendar;
  };
  // delete acc calendar function 
export const deleteAcademicCalendarService =
  async (
    calendarId,
    institutionId
  ) => {

    // Validate ID
    if (
      !mongoose.Types.ObjectId.isValid(
        calendarId
      )
    ) {
      throw new Error(
        "Invalid calendar ID."
      );
    }

    // Find Calendar
    const calendar =
      await AcademicCalendar.findOne({
        _id: calendarId,

        institutionId,

        isDeleted: {
          $ne: true,
        },
      });

    if (!calendar) {
      throw new Error(
        "Academic calendar not found."
      );
    }

    // Soft Delete
    calendar.isDeleted = true;

    calendar.deletedAt =
      new Date();

    await calendar.save();

    return calendar;
  };
  // restore acc calendar function 
export const restoreAcademicCalendarService =
  async (
    calendarId,
    institutionId
  ) => {

    // Validate ID
    if (
      !mongoose.Types.ObjectId.isValid(
        calendarId
      )
    ) {
      throw new Error(
        "Invalid calendar ID."
      );
    }

    // Find Deleted Calendar
    const calendar =
      await AcademicCalendar.findOne({
        _id: calendarId,

        institutionId,

        isDeleted: true,
      });

    if (!calendar) {
      throw new Error(
        "Deleted academic calendar not found."
      );
    }

    // Prevent Overlapping Dates
    const overlappingCalendar =
      await AcademicCalendar.findOne({
        _id: {
          $ne: calendarId,
        },

        institutionId,

        isDeleted: {
          $ne: true,
        },

        isActive: true,

        startDate: {
          $lte:
            calendar.endDate,
        },

        endDate: {
          $gte:
            calendar.startDate,
        },
      });

    if (overlappingCalendar) {
      throw new Error(
        "Cannot restore because the semester overlaps with another active calendar."
      );
    }

    // Restore
    calendar.isDeleted =
      false;

    calendar.deletedAt =
      null;

    await calendar.save();

    return calendar;
  };
  // delete from db acc calendar function 
export const deleteAcademicCalendarFromDBService =
  async (
    calendarId,
    institutionId
  ) => {

    // Validate ID
    if (
      !mongoose.Types.ObjectId.isValid(
        calendarId
      )
    ) {
      throw new Error(
        "Invalid calendar ID."
      );
    }

    // Find Deleted Calendar
    const calendar =
      await AcademicCalendar.findOne({
        _id: calendarId,

        institutionId,

        isDeleted: true,
      });

    if (!calendar) {
      throw new Error(
        "Deleted academic calendar not found."
      );
    }

    // Permanent Delete
    await AcademicCalendar.findByIdAndDelete(
      calendarId
    );

    return true;
  };



  // UPLOAD CALENDAR EVENT 
  export const uploadCalendarEventsService =
  async (
    calendarId,
    filePath,
    user
  ) => {

    const calendar =
      await AcademicCalendar.findOne({
        _id: calendarId,

        institutionId:
          user.institution,

        isDeleted: {
          $ne: true,
        },
      });

    if (!calendar) {
      throw new Error(
        "Academic calendar not found."
      );
    }

    const workbook =
      XLSX.readFile(filePath);

    const sheet =
      workbook.Sheets[
        workbook.SheetNames[0]
      ];

    const rows =
      XLSX.utils.sheet_to_json(
        sheet
      );

    const events = rows.map(
      (row) => ({
        calendarId,

        title:
          row.title,

        eventType:
          row.eventType,

        startDate:
          row.startDate,

        endDate:
          row.endDate,

        description:
          row.description || "",

        color:
          row.color ||
          "#3B82F6",

        createdBy:
          user.userId,
      })
    );

    const createdEvents =
      await CalendarEvent.insertMany(
        events
      );

    return createdEvents;
  };

  // get calender events by calendar id
  export const getCalendarEventsService =
  async (calendarId) => {
    const events =
      await CalendarEvent.find({
        calendarId,
      })
        .select(
          "title eventType startDate endDate description color"
        )
        .sort({
          startDate: 1,
        });

    return events;
  };

  // update calendar event function 
  export const updateCalendarEventsService =
  async (
    calendarId,
    filePath,
    user
  ) => {

    if (
      !mongoose.Types.ObjectId.isValid(
        calendarId
      )
    ) {
      throw new Error(
        "Invalid calendar ID."
      );
    }

    const workbook =
      XLSX.readFile(
        filePath
      );

    const sheet =
      workbook.Sheets[
        workbook.SheetNames[0]
      ];

    const rows =
      XLSX.utils.sheet_to_json(
        sheet
      );

    const updatedEvents = [];

    for (const row of rows) {

      const existingEvent =
        await CalendarEvent.findOne({
          calendarId,

          title:
            row.title,

          startDate:
            new Date(
              row.startDate
            ),

          endDate:
            new Date(
              row.endDate
            ),
        });

      if (existingEvent) {

        existingEvent.eventType =
          row.eventType;

        existingEvent.description =
          row.description || "";

        existingEvent.color =
          row.color ||
          "#3B82F6";

        await existingEvent.save();

        updatedEvents.push(
          existingEvent
        );

      } else {

        const newEvent =
          await CalendarEvent.create({
            calendarId,

            title:
              row.title,

            eventType:
              row.eventType,

            startDate:
              row.startDate,

            endDate:
              row.endDate,

            description:
              row.description || "",

            color:
              row.color ||
              "#3B82F6",

            createdBy:
              user.userId,
          });

        updatedEvents.push(
          newEvent
        );
      }
    }

    return updatedEvents;
  };
  // delete calender event function
  export const deleteCalendarEventsService =
  async (calendarId) => {

    // Validate ID
    if (
      !mongoose.Types.ObjectId.isValid(
        calendarId
      )
    ) {
      throw new Error(
        "Invalid calendar ID."
      );
    }

    // Check Events Exist
    const eventCount =
      await CalendarEvent.countDocuments({
        calendarId,
      });

    if (!eventCount) {
      throw new Error(
        "No events found for this calendar."
      );
    }

    // Delete All Events
    await CalendarEvent.deleteMany({
      calendarId,
    });

    return true;
  };
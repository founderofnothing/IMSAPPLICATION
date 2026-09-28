import {
   createAcademicCalendarService,
   getAcademicCalendarsService,
   updateAcademicCalendarService,
   deleteAcademicCalendarService,
   restoreAcademicCalendarService,
   deleteAcademicCalendarFromDBService,


// calendar events
   uploadCalendarEventsService,
   getCalendarEventsService,
   updateCalendarEventsService,
   deleteCalendarEventsService
} from "./service.js";






// create acc calender function 
export const createAcademicCalendar =
  async (req, res) => {
    try {
      const calendar =
        await createAcademicCalendarService(
          req.body,
          req.user
        );

      return res.status(201).json({
        success: true,

        message:
          "Academic calendar created successfully.",

        data: calendar,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,

        message:
          error.message,
      });
    }
  };
  // get calendar by institution id 
export const getAcademicCalendars =
  async (req, res) => {
    try {
      const calendars =
        await getAcademicCalendarsService(
          req.user.institution
        );

      return res.status(200).json({
        success: true,

        count:
          calendars.length,

        data: calendars,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,

        message:
          error.message,
      });
    }
  };
  // update function of calender
  export const updateAcademicCalendar =
  async (req, res) => {
    try {
      const calendar =
        await updateAcademicCalendarService(
          req.params.id,
          req.body,
          req.user
        );

      return res.status(200).json({
        success: true,

        message:
          "Academic calendar updated successfully.",

        data: calendar,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,

        message:
          error.message,
      });
    }
  };
  // delete acc calendar function 
export const deleteAcademicCalendar =
  async (req, res) => {
    try {
      await deleteAcademicCalendarService(
        req.params.id,
        req.user.institution
      );

      return res.status(200).json({
        success: true,

        message:
          "Academic calendar deleted successfully.",
      });
    } catch (error) {
      return res.status(400).json({
        success: false,

        message:
          error.message,
      });
    }
  };
    // restore acc calendar function 
export const restoreAcademicCalendar =
  async (req, res) => {
    try {
      const calendar =
        await restoreAcademicCalendarService(
          req.params.id,
          req.user.institution
        );

      return res.status(200).json({
        success: true,

        message:
          "Academic calendar restored successfully.",

        data: calendar,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,

        message:
          error.message,
      });
    }
  };
  // delete from db acc calendar function 
export const deleteAcademicCalendarFromDB =
  async (req, res) => {
    try {
      await deleteAcademicCalendarFromDBService(
        req.params.id,
        req.user.institution
      );

      return res.status(200).json({
        success: true,

        message:
          "Academic calendar deleted permanently.",
      });
    } catch (error) {
      return res.status(400).json({
        success: false,

        message:
          error.message,
      });
    }
  };




  // UPLOAD CALENDAR EVENT 
  export const uploadCalendarEvents =
  async (req, res) => {
    try {
      const events =
        await uploadCalendarEventsService(
          req.body.calendarId,
          req.file.path,
          req.user
        );

      return res.status(201).json({
        success: true,

        message:
          "Calendar events uploaded successfully.",

        count:
          events.length,

        data: events,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,

        message:
          error.message,
      });
    }
  };
  // get calender events by calendar id
  export const getCalendarEvents =
  async (req, res) => {
    try {
      const events =
        await getCalendarEventsService(
          req.params.calendarId
        );

      return res.status(200).json({
        success: true,

        message:
          "Calendar events fetched successfully.",

        data: events,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,

        message:
          error.message,
      });
    }
  };
  // update calendar event function 
export const updateCalendarEvents =
  async (req, res) => {
    try {
      const events =
        await updateCalendarEventsService(
          req.body.calendarId,
          req.file.path,
          req.user
        );

      return res.status(200).json({
        success: true,

        message:
          "Calendar events updated successfully.",

        data: events,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,

        message:
          error.message,
      });
    }
  };
  // delete calender delete function 
  export const deleteCalendarEvents =
  async (req, res) => {
    try {

      await deleteCalendarEventsService(
        req.params.calendarId
      );

      return res.status(200).json({
        success: true,

        message:
          "Calendar events deleted successfully.",
      });

    } catch (error) {

      return res.status(400).json({
        success: false,

        message:
          error.message,
      });
    }
  };
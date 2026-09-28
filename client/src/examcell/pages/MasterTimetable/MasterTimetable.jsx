import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import { toast } from "react-toastify";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import {
  PlusIcon,
  XIcon,
  PencilSimpleLineIcon,
  TrashSimpleIcon,
  CalendarBlankIcon,
} from "@phosphor-icons/react";

import API from "../../../api/axios";

import "./mastertimetable.css";

const MasterTimetable = () => {

  const navigate = useNavigate();

  const { id } = useParams();

  // =========================================================
  // MODE
  // =========================================================

  const isCreateMode = !id;

  // =========================================================
  // MASTER TIMETABLE
  // =========================================================

  const [timetable, setTimetable] = useState(null);

  const [loading, setLoading] = useState(false);

  const [creatingTimetable, setCreatingTimetable] =
    useState(false);

  // =========================================================
  // INSTITUTION
  // =========================================================

  const [institution, setInstitution] = useState(null);

  // =========================================================
  // EXAMINATION HEADER
  // =========================================================

  const [examTitles, setExamTitles] = useState([]);

  const [examTitleId, setExamTitleId] = useState("");

  const [semesterType, setSemesterType] =
    useState("");

  const [academicYear, setAcademicYear] =
    useState("");

  // =========================================================
  // STUDY YEAR
  // =========================================================

  const [selectedYear, setSelectedYear] =
    useState("");

  const [classes, setClasses] = useState([]);

  const [loadingClasses, setLoadingClasses] =
    useState(false);

  // =========================================================
  // DATE / SESSION POPUP
  // =========================================================

  const [showDatePopup, setShowDatePopup] =
    useState(false);

  const [editingDateId, setEditingDateId] =
    useState(null);

  const [dateForm, setDateForm] = useState({
    date: "",
    sessionCount: 1,
    sessions: [
      {
        startTime: "",
        endTime: "",
      },
    ],
  });

  const [savingDate, setSavingDate] =
    useState(false);

  // =========================================================
  // SUBJECT POPUP
  // =========================================================

  const [showSubjectPopup, setShowSubjectPopup] =
    useState(false);

  const [selectedCell, setSelectedCell] =
    useState(null);

  const [selectedClass, setSelectedClass] =
    useState(null);

  const [classSubjects, setClassSubjects] =
    useState([]);

  const [loadingSubjects, setLoadingSubjects] =
    useState(false);

  const [savingCell, setSavingCell] =
    useState(false);

  // =========================================================
  // CURRENT TIMETABLE ID
  // =========================================================

  const timetableId =
    timetable?._id || id || "";

  // =========================================================
  // FETCH INSTITUTION
  // =========================================================

  const fetchInstitution = async () => {
    try {

      const response = await API.get(
        "/institutions/my-institution"
      );

      setInstitution(
        response.data?.data || null
      );

    } catch (error) {

      console.error(
        "FETCH INSTITUTION ERROR:",
        error.response?.data || error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to fetch institution details."
      );

    }
  };

  // =========================================================
  // FETCH EXAM TITLES
  // =========================================================

  const fetchExamTitles = async () => {
    try {

      const response = await API.get(
        "/exams/exam-title"
      );

      setExamTitles(
        response.data?.data || []
      );

    } catch (error) {

      console.error(
        "FETCH EXAM TITLES ERROR:",
        error.response?.data || error
      );

      setExamTitles([]);

      toast.error(
        error.response?.data?.message ||
          "Failed to fetch examination titles."
      );

    }
  };

  // =========================================================
  // CREATE MASTER TIMETABLE
  // =========================================================

// =========================================================
// CREATE MASTER TIMETABLE
// =========================================================

const createTimetable = async () => {

  // =========================
  // VALIDATION
  // =========================

  if (!examTitleId) {
    toast.warning("Select examination.");
    return;
  }

  if (!semesterType) {
    toast.warning("Select semester.");
    return;
  }

  if (!academicYear.trim()) {
    toast.warning("Enter academic year.");
    return;
  }

  try {

    setCreatingTimetable(true);

    // =========================
    // CREATE
    // =========================

    const response = await API.post(
      "/master-timetables",
      {
        examTitleId,
        semesterType,
        academicYear: academicYear.trim(),
      }
    );

    const createdTimetable =
      response.data?.data;

    // =========================
    // VERIFY RESPONSE
    // =========================

    if (!createdTimetable?._id) {
      throw new Error(
        "Master timetable ID was not returned."
      );
    }

    // =========================
    // STORE CREATED TIMETABLE
    // =========================

    setTimetable(
      createdTimetable
    );

    // =========================
    // STORE INSTITUTION
    // =========================

    if (
      createdTimetable?.institutionId
    ) {

      setInstitution(
        createdTimetable.institutionId
      );

    }

    // =========================
    // KEEP HEADER VALUES
    // =========================

    if (
      createdTimetable?.examTitleId?._id
    ) {

      setExamTitleId(
        createdTimetable.examTitleId._id
      );

    }

    if (
      createdTimetable?.semesterType
    ) {

      setSemesterType(
        createdTimetable.semesterType
      );

    }

    if (
      createdTimetable?.academicYear
    ) {

      setAcademicYear(
        createdTimetable.academicYear
      );

    }

    // =========================
    // SUCCESS
    // =========================

    toast.success(
      response.data?.message ||
        "Master timetable created successfully."
    );

    // =========================
    // MOVE TO EDIT PAGE
    // =========================

    navigate(
      `/examcell/master-timetables/${createdTimetable._id}`
    );

  } catch (error) {

    console.error(
      "CREATE MASTER TIMETABLE ERROR:",
      error.response?.data || error
    );

    toast.error(
      error.response?.data?.message ||
        error.message ||
        "Failed to create master timetable."
    );

  } finally {

    setCreatingTimetable(false);

  }
};

  // =========================================================
  // FETCH MASTER TIMETABLE
  // =========================================================

  const fetchMasterTimetable = async (
    timetableIdToFetch
  ) => {

    if (!timetableIdToFetch) {
      return;
    }

    try {

      setLoading(true);

      const response = await API.get(
        `/master-timetables/${timetableIdToFetch}`
      );

      const data =
        response.data?.data || null;

      if (!data) {

        throw new Error(
          "Master timetable data was not returned."
        );
      }

      setTimetable(data);

      // =====================================================
      // INSTITUTION
      // =====================================================

      if (data?.institutionId) {

        setInstitution(
          data.institutionId
        );

      }

      // =====================================================
      // EXAMINATION
      // =====================================================

      if (data?.examTitleId?._id) {

        setExamTitleId(
          data.examTitleId._id
        );

      } else if (
        typeof data?.examTitleId === "string"
      ) {

        setExamTitleId(
          data.examTitleId
        );

      }

      // =====================================================
      // SEMESTER
      // =====================================================

      if (data?.semesterType) {

        setSemesterType(
          data.semesterType
        );

      }

      // =====================================================
      // ACADEMIC YEAR
      // =====================================================

      if (data?.academicYear) {

        setAcademicYear(
          data.academicYear
        );

      }

    } catch (error) {

      console.error(
        "FETCH MASTER TIMETABLE ERROR:",
        error.response?.data || error
      );

      setTimetable(null);

      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch master timetable."
      );

    } finally {

      setLoading(false);

    }
  };

  // =========================================================
  // UPDATE MASTER TIMETABLE HEADER
  // =========================================================

  const updateTimetableHeader = async () => {

    if (!timetableId) {
      return;
    }

    try {

      setLoading(true);

      const response = await API.put(
        `/master-timetables/${timetableId}`,
        {
          examTitleId,
          semesterType,
          academicYear,
        }
      );

      const updatedTimetable =
        response.data?.data;

      /*
       * IMPORTANT:
       * Keep the entire returned timetable.
       *
       * This prevents dates/sessions/schedules
       * from disappearing after updating the header.
       */

      setTimetable(
        updatedTimetable
      );

      // Make sure institution remains available
      if (
        updatedTimetable?.institutionId
      ) {

        setInstitution(
          updatedTimetable.institutionId
        );

      }

      toast.success(
        response.data?.message ||
          "Timetable header updated successfully."
      );

    } catch (error) {

      console.error(
        "UPDATE MASTER TIMETABLE ERROR:",
        error.response?.data || error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to update timetable header."
      );

    } finally {

      setLoading(false);

    }
  };

  // =========================================================
  // LOAD CLASSES BY YEAR
  // =========================================================

  const fetchClassesByYear = async (
    year
  ) => {

    if (!year) {

      setClasses([]);

      return;
    }

    try {

      setLoadingClasses(true);

      const response = await API.get(
        "/master-timetables/classes/by-year",
        {
          params: {
            year,
          },
        }
      );

      setClasses(
        response.data?.data || []
      );

    } catch (error) {

      console.error(
        "FETCH CLASSES ERROR:",
        error.response?.data || error
      );

      setClasses([]);

      toast.error(
        error.response?.data?.message ||
          "Failed to fetch classes."
      );

    } finally {

      setLoadingClasses(false);

    }
  };

  // =========================================================
  // YEAR CHANGE
  // =========================================================

  const handleYearChange = async (
    e
  ) => {

    const year =
      e.target.value;

    setSelectedYear(year);

    setSelectedCell(null);

    setSelectedClass(null);

    setClassSubjects([]);

    await fetchClassesByYear(year);
  };

  // =========================================================
  // RESET DATE FORM
  // =========================================================

  const resetDateForm = () => {

    setDateForm({
      date: "",
      sessionCount: 1,
      sessions: [
        {
          startTime: "",
          endTime: "",
        },
      ],
    });

    setEditingDateId(null);
  };

  // =========================================================
  // OPEN ADD DATE POPUP
  // =========================================================

  const openAddDatePopup = () => {

    resetDateForm();

    setShowDatePopup(true);
  };

  // =========================================================
  // OPEN EDIT DATE POPUP
  // =========================================================

  const openEditDatePopup = (
    timetableDate
  ) => {

    setEditingDateId(
      timetableDate._id
    );

    setDateForm({
      date: formatDateInput(
        timetableDate.date
      ),

      sessionCount:
        timetableDate.sessions?.length ||
        1,

      sessions:
        timetableDate.sessions?.map(
          (session) => ({
            startTime:
              session.startTime || "",

            endTime:
              session.endTime || "",
          })
        ) || [
          {
            startTime: "",
            endTime: "",
          },
        ],
    });

    setShowDatePopup(true);
  };

  // =========================================================
  // DATE FORM CHANGE
  // =========================================================

  const handleDateFormChange = (
    e
  ) => {

    const {
      name,
      value,
    } = e.target;

    setDateForm(
      (prev) => ({
        ...prev,
        [name]: value,
      })
    );
  };

  // =========================================================
  // SESSION COUNT CHANGE
  // =========================================================

  const handleSessionCountChange = (
    e
  ) => {

    const count =
      Number(e.target.value);

    setDateForm(
      (prev) => {

        const currentSessions =
          prev.sessions || [];

        const sessions =
          Array.from(
            {
              length: count,
            },
            (_, index) =>
              currentSessions[index] || {
                startTime: "",
                endTime: "",
              }
          );

        return {
          ...prev,

          sessionCount:
            count,

          sessions,
        };
      }
    );
  };

  // =========================================================
  // SESSION TIME CHANGE
  // =========================================================

  const handleSessionChange = (
    index,
    field,
    value
  ) => {

    setDateForm(
      (prev) => ({
        ...prev,

        sessions:
          prev.sessions.map(
            (
              session,
              sessionIndex
            ) =>
              sessionIndex === index
                ? {
                    ...session,
                    [field]:
                      value,
                  }
                : session
          ),
      })
    );
  };

  // =========================================================
  // SAVE DATE
  // =========================================================

  const saveTimetableDate = async () => {

    if (!timetableId) {

      toast.warning(
        "Create the master timetable first."
      );

      return;
    }

    if (!dateForm.date) {

      toast.warning(
        "Select examination date."
      );

      return;
    }

    if (
      !dateForm.sessions?.length
    ) {

      toast.warning(
        "Add at least one session."
      );

      return;
    }

    const invalidSession =
      dateForm.sessions.some(
        (session) =>
          !session.startTime ||
          !session.endTime
      );

    if (invalidSession) {

      toast.warning(
        "Enter start and end time for every session."
      );

      return;
    }

    try {

      setSavingDate(true);

      let response;

      if (editingDateId) {

        response = await API.put(
          `/master-timetables/${timetableId}/dates/${editingDateId}`,
          {
            date:
              dateForm.date,

            sessions:
              dateForm.sessions,
          }
        );

      } else {

        response = await API.post(
          `/master-timetables/${timetableId}/dates`,
          {
            date:
              dateForm.date,

            sessions:
              dateForm.sessions,
          }
        );

      }

      setTimetable(
        response.data?.data
      );

      toast.success(
        response.data?.message ||
          "Examination date saved successfully."
      );

      setShowDatePopup(false);

      resetDateForm();

    } catch (error) {

      console.error(
        "SAVE DATE ERROR:",
        error.response?.data || error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to save examination date."
      );

    } finally {

      setSavingDate(false);

    }
  };

  // =========================================================
  // DELETE DATE
  // =========================================================

  const deleteTimetableDate = async (
    dateId
  ) => {

    if (!timetableId || !dateId) {
      return;
    }

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this examination date?"
      );

    if (!confirmed) {
      return;
    }

    try {

      setLoading(true);

      const response =
        await API.delete(
          `/master-timetables/${timetableId}/dates/${dateId}`
        );

      setTimetable(
        response.data?.data
      );

      toast.success(
        response.data?.message ||
          "Examination date deleted successfully."
      );

    } catch (error) {

      console.error(
        "DELETE DATE ERROR:",
        error.response?.data || error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to delete examination date."
      );

    } finally {

      setLoading(false);

    }
  };

  // =========================================================
  // GET SUBJECTS FOR CLASS
  // =========================================================

  const fetchSubjectsForClass = async (
    classId
  ) => {

    if (!timetableId || !classId) {
      return;
    }

    try {

      setLoadingSubjects(true);

      const response =
        await API.get(
          `/master-timetables/${timetableId}/classes/${classId}/subjects`
        );

      setClassSubjects(
        response.data?.data?.subjects ||
          []
      );

    } catch (error) {

      console.error(
        "FETCH SUBJECTS ERROR:",
        error.response?.data || error
      );

      setClassSubjects([]);

      toast.error(
        error.response?.data?.message ||
          "Failed to fetch class subjects."
      );

    } finally {

      setLoadingSubjects(false);

    }
  };

  // =========================================================
  // OPEN SUBJECT POPUP
  // =========================================================

  const openSubjectPopup = async (
    classData,
    timetableDate,
    session
  ) => {

    if (!timetableId) {
      return;
    }

    setSelectedClass(
      classData
    );

    setSelectedCell({
      classId:
        classData._id,

      classData,

      dateId:
        timetableDate._id,

      date:
        timetableDate.date,

      sessionId:
        session._id,

      session,
    });

    setShowSubjectPopup(true);

    await fetchSubjectsForClass(
      classData._id
    );
  };

  // =========================================================
  // FIND EXISTING SCHEDULE
  // =========================================================

  const getCellSchedule = (
    classId,
    dateId,
    sessionId
  ) => {

    if (
      !timetable?.schedules
    ) {
      return null;
    }

    return timetable.schedules.find(
      (schedule) =>
        schedule.classId?.toString() ===
          classId?.toString() &&
        schedule.dateId?.toString() ===
          dateId?.toString() &&
        schedule.sessionId?.toString() ===
          sessionId?.toString()
    );
  };

  // =========================================================
  // GET SUBJECT DETAILS
  // =========================================================

  const getSubjectById = (
    subjectId
  ) => {

    return classSubjects.find(
      (subject) =>
        subject._id?.toString() ===
        subjectId?.toString()
    );
  };

  // =========================================================
  // ASSIGN SUBJECT
  // =========================================================

  const assignSubjectToCell = async (
    subjectId
  ) => {

    if (
      !timetableId ||
      !selectedCell ||
      !subjectId
    ) {
      return;
    }

    try {

      setSavingCell(true);

      const response =
        await API.post(
          `/master-timetables/${timetableId}/schedules`,
          {
            classId:
              selectedCell.classId,

            subjectId,

            dateId:
              selectedCell.dateId,

            sessionId:
              selectedCell.sessionId,
          }
        );

      setTimetable(
        response.data?.data
      );

      toast.success(
        response.data?.message ||
          "Subject assigned successfully."
      );

      setShowSubjectPopup(false);

      setSelectedCell(null);

      setSelectedClass(null);

      setClassSubjects([]);

    } catch (error) {

      console.error(
        "ASSIGN SUBJECT ERROR:",
        error.response?.data || error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to assign subject."
      );

    } finally {

      setSavingCell(false);

    }
  };

  // =========================================================
  // CHANGE SUBJECT
  // =========================================================

  const changeSubjectInCell = async (
    subjectId
  ) => {

    if (
      !timetableId ||
      !selectedCell?.scheduleId ||
      !subjectId
    ) {
      return;
    }

    try {

      setSavingCell(true);

      const response =
        await API.put(
          `/master-timetables/${timetableId}/schedules/${selectedCell.scheduleId}`,
          {
            subjectId,
          }
        );

      setTimetable(
        response.data?.data
      );

      toast.success(
        response.data?.message ||
          "Subject changed successfully."
      );

      setShowSubjectPopup(false);

      setSelectedCell(null);

      setSelectedClass(null);

      setClassSubjects([]);

    } catch (error) {

      console.error(
        "CHANGE SUBJECT ERROR:",
        error.response?.data || error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to change subject."
      );

    } finally {

      setSavingCell(false);

    }
  };

  // =========================================================
  // REMOVE SUBJECT
  // =========================================================

  const removeSubjectFromCell = async (
    scheduleId
  ) => {

    if (
      !timetableId ||
      !scheduleId
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        "Remove this subject from the timetable cell?"
      );

    if (!confirmed) {
      return;
    }

    try {

      setSavingCell(true);

      const response =
        await API.delete(
          `/master-timetables/${timetableId}/schedules/${scheduleId}`
        );

      setTimetable(
        response.data?.data
      );

      toast.success(
        response.data?.message ||
          "Subject removed successfully."
      );

      setShowSubjectPopup(false);

      setSelectedCell(null);

      setSelectedClass(null);

      setClassSubjects([]);

    } catch (error) {

      console.error(
        "REMOVE SUBJECT ERROR:",
        error.response?.data || error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to remove subject."
      );

    } finally {

      setSavingCell(false);

    }
  };

  // =========================================================
  // FORMAT DATE FOR INPUT
  // =========================================================

  const formatDateInput = (
    value
  ) => {

    if (!value) {
      return "";
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "";
    }

    const year =
      date.getFullYear();

    const month =
      String(
        date.getMonth() + 1
      ).padStart(2, "0");

    const day =
      String(
        date.getDate()
      ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  // =========================================================
  // FORMAT INSTITUTION ADDRESS
  // =========================================================

  const formatInstitutionAddress = (
    address
  ) => {

    if (!address) {
      return "Institution Address";
    }

    if (typeof address === "string") {
      return address;
    }

    return [
      address.addressLine1,
      address.addressLine2,
      address.city,
      address.district,
      address.state,
      address.pincode,
      address.country,
    ]
      .filter(Boolean)
      .join(", ") ||
      "Institution Address";
  };

  // =========================================================
  // FORMAT DISPLAY DATE
  // =========================================================

  const formatDisplayDate = (
    value
  ) => {

    if (!value) {
      return "-";
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "-";
    }

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // =========================================================
  // GET ALL GRID COLUMNS
  // =========================================================

  const gridColumns = useMemo(() => {

    if (
      !timetable?.dates
    ) {
      return [];
    }

    return timetable.dates.flatMap(
      (date) =>
        (date.sessions || []).map(
          (session) => ({
            date,
            session,
          })
        )
    );

  }, [timetable]);

  // =========================================================
  // OPEN CELL
  // =========================================================

  const handleCellClick = async (
    classData,
    date,
    session
  ) => {

    const schedule =
      getCellSchedule(
        classData._id,
        date._id,
        session._id
      );

    await openSubjectPopup(
      classData,
      date,
      session
    );

    if (schedule) {

      setSelectedCell(
        (prev) => ({
          ...prev,

          scheduleId:
            schedule._id,

          existingSubjectId:
            schedule.subjectId,
        })
      );
    }
  };

  // =========================================================
  // INITIAL FETCH
  // =========================================================

  useEffect(() => {

    fetchInstitution();

    fetchExamTitles();

    if (id) {

      fetchMasterTimetable(id);

    } else {

      // Fresh create page
      setTimetable(null);
      setSelectedYear("");
      setClasses([]);

    }

  }, [id]);

  // =========================================================
  // GENERATE MASTER TIMETABLE PDF
  // =========================================================

  const generateMasterTimetablePDF = () => {

    if (!timetableId) {

      toast.warning(
        "Create the master timetable first."
      );

      return;
    }

    if (!timetable?.dates?.length) {

      toast.warning(
        "Add examination days before generating PDF."
      );

      return;
    }

    if (!classes?.length) {

      toast.warning(
        "Select a study year and load classes first."
      );

      return;
    }

    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    const pageWidth =
      pdf.internal.pageSize.getWidth();

    const pageHeight =
      pdf.internal.pageSize.getHeight();

    // =====================================================
    // HEADER
    // =====================================================

    pdf.setFont(
      "helvetica",
      "bold"
    );

    pdf.setFontSize(16);

    pdf.text(
      (
        institution?.institutionName ||
        "INSTITUTION NAME"
      ).toUpperCase(),

      pageWidth / 2,
      15,

      {
        align: "center",
      }
    );

    // Address

    pdf.setFont(
      "helvetica",
      "normal"
    );

    pdf.setFontSize(8);

    const address =
      formatInstitutionAddress(
        institution?.address
      );

    pdf.text(
      address,
      pageWidth / 2,
      21,
      {
        align: "center",
      }
    );

    // =====================================================
    // TITLE
    // =====================================================

    pdf.setFont(
      "helvetica",
      "bold"
    );

    pdf.setFontSize(12);

    pdf.text(
      "MASTER EXAMINATION TIME TABLE",
      pageWidth / 2,
      30,
      {
        align: "center",
      }
    );

    // =====================================================
    // EXAMINATION DETAILS
    // =====================================================

    pdf.setFont(
      "helvetica",
      "normal"
    );

    pdf.setFontSize(8);

    const examTitle =
      timetable?.examTitleId?.examTitle ||
      timetable?.examTitleId?.title ||
      "Examination";

    const details =
      `${examTitle}  |  Academic Year: ${
        timetable?.academicYear || "-"
      }  |  Semester: ${
        timetable?.semesterType || "-"
      }`;

    pdf.text(
      details,
      pageWidth / 2,
      36,
      {
        align: "center",
      }
    );

    // =====================================================
    // BUILD TABLE HEADER
    // =====================================================

    const tableHead = [

      [
        {
          content: "CLASS",
          rowSpan: 2,
        },

        ...timetable.dates.flatMap(
          (date) => [

            {
              content:
                formatDisplayDate(
                  date.date
                ),

              colSpan:
                date.sessions?.length ||
                1,
            },

          ]
        ),
      ],

      [
        ...timetable.dates.flatMap(
          (date) =>
            (
              date.sessions || []
            ).map(
              (session) =>
                `${session.startTime} - ${session.endTime}`
            )
        ),
      ],

    ];

    // =====================================================
    // BUILD TABLE BODY
    // =====================================================

    const tableBody =
      classes.map(
        (classData) => {

          const row = [];

          row.push(
            [
              classData.programme
                ?.programmeName ||
                "Programme",

              classData.section
                ? `Section ${classData.section}`
                : "",
            ]
              .filter(Boolean)
              .join("\n")
          );

          timetable.dates.forEach(
            (date) => {

              (
                date.sessions || []
              ).forEach(
                (session) => {

                  const schedule =
                    getCellSchedule(
                      classData._id,
                      date._id,
                      session._id
                    );

                  let cellValue = "";

                  if (schedule) {

                    const subject =
                      typeof schedule.subjectId ===
                      "object"

                        ? schedule.subjectId

                        : getSubjectById(
                            schedule.subjectId
                          );

                    if (subject) {

                      cellValue =
                        [
                          subject.subjectCode,
                          subject.subjectName,
                        ]
                          .filter(Boolean)
                          .join("\n");

                    }

                  }

                  row.push(
                    cellValue
                  );

                }
              );

            }
          );

          return row;
        }
      );

    // =====================================================
    // TABLE
    // =====================================================

    autoTable(
      pdf,
      {
        startY: 42,

        head: tableHead,

        body: tableBody,

        theme: "grid",

        styles: {
          font: "helvetica",

          fontSize: 7,

          cellPadding: 3,

          valign: "middle",

          halign: "center",

          lineWidth: 0.2,

          lineColor: [
            180,
            180,
            180,
          ],

          textColor: [
            23,
            19,
            25,
          ],
        },

        headStyles: {
          fillColor: [
            217,
            217,
            217,
          ],

          textColor: [
            23,
            19,
            25,
          ],

          fontStyle: "bold",

          halign: "center",

          valign: "middle",
        },

        columnStyles: {

          0: {
            cellWidth: 38,

            halign: "left",

            fontStyle: "bold",
          },

        },

        bodyStyles: {
          minCellHeight: 16,
        },

        didParseCell: (
          data
        ) => {

          if (
            data.section ===
              "body" &&
            data.column.index === 0
          ) {

            data.cell.styles.fillColor =
              [
                245,
                245,
                245,
              ];

          }

          if (
            data.section ===
              "body" &&
            data.column.index > 0 &&
            data.cell.text.length > 0
          ) {

            data.cell.styles.fontStyle =
              "normal";

          }

        },

        margin: {
          top: 42,

          right: 10,

          bottom: 18,

          left: 10,
        },

        pageBreak: "auto",

        showHead: "everyPage",
      }
    );

    // =====================================================
    // FOOTER
    // =====================================================

    const pageCount =
      pdf.internal.getNumberOfPages();

    for (
      let page = 1;
      page <= pageCount;
      page++
    ) {

      pdf.setPage(page);

      pdf.setFont(
        "helvetica",
        "normal"
      );

      pdf.setFontSize(7);

      pdf.setTextColor(
        100,
        100,
        100
      );

      pdf.text(
        `Generated on ${new Date().toLocaleDateString(
          "en-IN"
        )}`,

        10,

        pageHeight - 8
      );

      pdf.text(
        `Page ${page} of ${pageCount}`,

        pageWidth - 10,

        pageHeight - 8,

        {
          align: "right",
        }
      );

    }

    // =====================================================
    // SAVE
    // =====================================================

    const safeExamTitle =
      String(examTitle)
        .replace(
          /[^a-zA-Z0-9-_]/g,
          "_"
        );

    pdf.save(
      `Master_Examination_Timetable_${safeExamTitle}.pdf`
    );
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="mastertimetable_page">

      {/* =====================================================
                          PAGE HEADER
      ===================================================== */}

      <div className="mastertimetable_page_header">

        <div className="mastertimetable_header_left">

          <h2 className="mastertimetable_page_title">
            Master Examination Timetable
          </h2>

          <p className="mastertimetable_page_subtitle">
            Create and manage the examination timetable
            using an Excel-style timetable grid.
          </p>

        </div>

      </div>

      {/* =====================================================
                    INSTITUTION / EXAM HEADER
      ===================================================== */}

      <div className="mastertimetable_document_header">

        <div className="mastertimetable_institution_block">

          <h1 className="mastertimetable_institution_name">

            {
              institution?.institutionName ||
              "Institution Name"
            }

          </h1>

          <p className="mastertimetable_institution_address">

            {formatInstitutionAddress(
              institution?.address
            )}

          </p>

        </div>

        <div className="mastertimetable_document_title">

          <h2>
            MASTER EXAMINATION TIME TABLE
          </h2>

          {
            timetable?.examTitleId && (

              <p>

                {
                  timetable.examTitleId.examTitle ||
                  timetable.examTitleId.title ||
                  "Examination"
                }

              </p>

            )
          }

        </div>

      </div>

      {/* =====================================================
                    TIMETABLE HEADER CONTROLS
      ===================================================== */}

      <div className="mastertimetable_setup_card">

        <div className="mastertimetable_setup_grid">

          {/* ACADEMIC YEAR */}

          <div className="mastertimetable_form_field">

            <label>
              Academic Year
            </label>

            <input
              type="text"
              placeholder="2025-2026"
              value={academicYear}
              onChange={(e) =>
                setAcademicYear(
                  e.target.value
                )
              }
              disabled={
                !!timetableId
              }
            />

          </div>

          {/* SEMESTER */}

          <div className="mastertimetable_form_field">

            <label>
              Semester
            </label>

            <select
              value={semesterType}
              onChange={(e) =>
                setSemesterType(
                  e.target.value
                )
              }
              disabled={
                !!timetableId
              }
            >

              <option value="">
                Select Semester
              </option>

              <option value="Odd">
                Odd
              </option>

              <option value="Even">
                Even
              </option>

            </select>

          </div>

          {/* EXAMINATION */}

          <div className="mastertimetable_form_field">

            <label>
              Examination
            </label>

            <select
              value={examTitleId}
              onChange={(e) =>
                setExamTitleId(
                  e.target.value
                )
              }
              disabled={
                !!timetableId
              }
            >

              <option value="">
                Select Examination
              </option>

              {examTitles.map(
                (exam) => (

                  <option
                    key={exam._id}
                    value={exam._id}
                  >

                    {
                      exam.examTitle ||
                      exam.title ||
                      exam.name
                    }

                  </option>

                )
              )}

            </select>

          </div>

          {/* STUDY YEAR */}

          <div className="mastertimetable_form_field">

            <label>
              Study Year
            </label>

            <select
              value={selectedYear}
              onChange={
                handleYearChange
              }
              disabled={
                !timetableId
              }
            >

              <option value="">
                Select Year
              </option>

              <option value="1">
                First Year
              </option>

              <option value="2">
                Second Year
              </option>

              <option value="3">
                Third Year
              </option>

              <option value="4">
                Fourth Year
              </option>

            </select>

          </div>

        </div>

        {/* CREATE / UPDATE */}

        <div className="mastertimetable_setup_actions">

          {!timetableId ? (

            <button
              type="button"
              className="mastertimetable_primary_btn"
              onClick={
                createTimetable
              }
              disabled={
                creatingTimetable
              }
            >

              {creatingTimetable
                ? "Creating..."
                : "Create Master Timetable"}

            </button>

          ) : (

            <button
              type="button"
              className="mastertimetable_secondary_btn"
              onClick={
                updateTimetableHeader
              }
              disabled={
                loading
              }
            >

              Update Header

            </button>

          )}

        </div>

      </div>

      {/* =====================================================
                         DATE TOOLBAR
      ===================================================== */}

      {timetableId && (

        <div className="mastertimetable_toolbar">

          <div>

            <h3>
              Examination Schedule
            </h3>

            <span>
              {
                timetable?.dates?.length || 0
              } Examination Days
            </span>

          </div>

          <div className="mastertimetable_toolbar_actions">

            <button
              type="button"
              className="mastertimetable_secondary_btn"
              onClick={
                generateMasterTimetablePDF
              }
            >

              Print PDF

            </button>

            <button
              type="button"
              className="mastertimetable_add_date_btn"
              onClick={
                openAddDatePopup
              }
            >

              <PlusIcon size={18} />

              Add Examination Day

            </button>

          </div>

        </div>

      )}

      {/* =====================================================
                        EMPTY TIMETABLE
      ===================================================== */}

      {timetableId &&
        !timetable?.dates?.length && (

          <div className="mastertimetable_empty_state">

            <CalendarBlankIcon
              size={42}
            />

            <h3>
              No Examination Days Added
            </h3>

            <p>
              Add an examination day and define
              its sessions to start building the
              master timetable.
            </p>

            <button
              type="button"
              onClick={
                openAddDatePopup
              }
            >

              <PlusIcon size={18} />

              Add Examination Day

            </button>

          </div>

        )}

      {/* =====================================================
                       EXCEL STYLE GRID
      ===================================================== */}

      {timetableId &&
        timetable?.dates?.length > 0 && (

          <div className="mastertimetable_grid_wrapper">

            <table className="mastertimetable_grid">

              <thead>

                <tr>

                  <th
                    rowSpan="2"
                    className="mastertimetable_class_header"
                  >

                    CLASS

                  </th>

                  {timetable.dates.map(
                    (date) => (

                      <th
                        key={date._id}
                        colSpan={
                          date.sessions?.length ||
                          1
                        }
                        className="mastertimetable_date_header"
                      >

                        <div className="mastertimetable_date_header_content">

                          <strong>

                            {
                              formatDisplayDate(
                                date.date
                              )
                            }

                          </strong>

                          <div className="mastertimetable_date_actions">

                            <button
                              type="button"
                              title="Edit date"
                              onClick={() =>
                                openEditDatePopup(
                                  date
                                )
                              }
                            >

                              <PencilSimpleLineIcon
                                size={15}
                              />

                            </button>

                            <button
                              type="button"
                              title="Delete date"
                              onClick={() =>
                                deleteTimetableDate(
                                  date._id
                                )
                              }
                            >

                              <TrashSimpleIcon
                                size={15}
                              />

                            </button>

                          </div>

                        </div>

                      </th>

                    )
                  )}

                </tr>

                <tr>

                  {timetable.dates.flatMap(
                    (date) =>
                      (
                        date.sessions ||
                        []
                      ).map(
                        (session) => (

                          <th
                            key={
                              `${date._id}-${session._id}`
                            }
                            className="mastertimetable_session_header"
                          >

                            {session.startTime}

                            {" - "}

                            {session.endTime}

                          </th>

                        )
                      )
                  )}

                </tr>

              </thead>

              <tbody>

                {loadingClasses ? (

                  <tr>

                    <td
                      colSpan={
                        gridColumns.length +
                        1
                      }
                      className="mastertimetable_loading_cell"
                    >

                      Loading classes...

                    </td>

                  </tr>

                ) : classes.length > 0 ? (

                  classes.map(
                    (
                      classData
                    ) => (

                      <tr
                        key={
                          classData._id
                        }
                      >

                        <td className="mastertimetable_class_cell">

                          <div className="mastertimetable_class_info">

                            <strong>

                              {
                                classData.programme
                                  ?.programmeName ||
                                "Programme"
                              }

                            </strong>

                            <span>

                              Section{" "}

                              {
                                classData.section ||
                                "-"
                              }

                            </span>

                          </div>

                        </td>

                        {gridColumns.map(
                          ({
                            date,
                            session,
                          }) => {

                            const schedule =
                              getCellSchedule(
                                classData._id,
                                date._id,
                                session._id
                              );

                            const subject =
                              typeof schedule?.subjectId ===
                              "object"

                                ? schedule.subjectId

                                : getSubjectById(
                                    schedule?.subjectId
                                  );

                            return (

                              <td
                                key={
                                  `${classData._id}-${date._id}-${session._id}`
                                }

                                className={
                                  schedule
                                    ? "mastertimetable_subject_cell mastertimetable_subject_cell_filled"
                                    : "mastertimetable_subject_cell"
                                }

                                onClick={() =>
                                  handleCellClick(
                                    classData,
                                    date,
                                    session
                                  )
                                }
                              >

                                {schedule ? (

                                  <div className="mastertimetable_subject_content">

                                    <strong>
                                      {subject?.subjectCode}
                                    </strong>

                                    <span>
                                      {subject?.subjectName}
                                    </span>

                                  </div>

                                ) : (

                                  <div className="mastertimetable_empty_cell">

                                    <PlusIcon
                                      size={18}
                                    />

                                    <span>
                                      Assign Subject
                                    </span>

                                  </div>

                                )}

                              </td>

                            );

                          }
                        )}

                      </tr>

                    )
                  )

                ) : (

                  <tr>

                    <td
                      colSpan={
                        gridColumns.length +
                        1
                      }
                      className="mastertimetable_empty_grid"
                    >

                      {selectedYear
                        ? "No active classes found for the selected year."
                        : "Select a study year to load classes."}

                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

        )}

      {/* =====================================================
                       DATE POPUP
      ===================================================== */}

      {showDatePopup && (

        <div
          className="mastertimetable_popup_overlay"
          onClick={() => {

            if (
              savingDate
            ) {
              return;
            }

            setShowDatePopup(
              false
            );

            resetDateForm();

          }}
        >

          <div
            className="mastertimetable_date_popup"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="mastertimetable_popup_header">

              <div>

                <h3>

                  {
                    editingDateId
                      ? "Edit Examination Day"
                      : "Add Examination Day"
                  }

                </h3>

                <p>

                  Select the examination date
                  and configure its sessions.

                </p>

              </div>

              <XIcon
                size={22}
                onClick={() => {

                  if (
                    savingDate
                  ) {
                    return;
                  }

                  setShowDatePopup(
                    false
                  );

                  resetDateForm();

                }}
              />

            </div>

            <div className="mastertimetable_popup_body">

              <div className="mastertimetable_form_field">

                <label>
                  Examination Date
                </label>

                <input
                  type="date"
                  name="date"
                  value={
                    dateForm.date
                  }
                  onChange={
                    handleDateFormChange
                  }
                />

              </div>

              <div className="mastertimetable_form_field">

                <label>
                  Number of Sessions
                </label>

                <select
                  value={
                    dateForm.sessionCount
                  }
                  onChange={
                    handleSessionCountChange
                  }
                >

                  <option value="1">
                    1 Session
                  </option>

                  <option value="2">
                    2 Sessions
                  </option>

                  <option value="3">
                    3 Sessions
                  </option>

                  <option value="4">
                    4 Sessions
                  </option>

                  <option value="5">
                    5 Sessions
                  </option>

                  <option value="6">
                    6 Sessions
                  </option>

                  <option value="7">
                    7 Sessions
                  </option>

                  <option value="8">
                    8 Sessions
                  </option>

                  <option value="9">
                    9 Sessions
                  </option>

                  <option value="10">
                    10 Sessions
                  </option>

                </select>

              </div>

              <div className="mastertimetable_sessions_section">

                <div className="mastertimetable_sessions_header">

                  <h4>
                    Session Timings
                  </h4>

                  <span>
                    {
                      dateForm.sessions.length
                    } Sessions
                  </span>

                </div>

                <div className="mastertimetable_session_list">

                  {dateForm.sessions.map(
                    (
                      session,
                      index
                    ) => (

                      <div
                        key={index}
                        className="mastertimetable_session_form"
                      >

                        <div className="mastertimetable_session_number">

                          Session{" "}
                          {index + 1}

                        </div>

                        <div className="mastertimetable_form_field">

                          <label>
                            Start Time
                          </label>

                          <input
                            type="time"
                            value={
                              session.startTime
                            }
                            onChange={(e) =>
                              handleSessionChange(
                                index,
                                "startTime",
                                e.target.value
                              )
                            }
                          />

                        </div>

                        <div className="mastertimetable_form_field">

                          <label>
                            End Time
                          </label>

                          <input
                            type="time"
                            value={
                              session.endTime
                            }
                            onChange={(e) =>
                              handleSessionChange(
                                index,
                                "endTime",
                                e.target.value
                              )
                            }
                          />

                        </div>

                      </div>

                    )
                  )}

                </div>

              </div>

            </div>

            <div className="mastertimetable_popup_footer">

              <button
                type="button"
                className="mastertimetable_cancel_btn"
                disabled={
                  savingDate
                }
                onClick={() => {

                  setShowDatePopup(
                    false
                  );

                  resetDateForm();

                }}
              >

                Cancel

              </button>

              <button
                type="button"
                className="mastertimetable_primary_btn"
                disabled={
                  savingDate
                }
                onClick={
                  saveTimetableDate
                }
              >

                {savingDate
                  ? "Saving..."
                  : editingDateId
                  ? "Update Day"
                  : "Add Day"}

              </button>

            </div>

          </div>

        </div>

      )}

      {/* =====================================================
                     SUBJECT POPUP
      ===================================================== */}

      {showSubjectPopup &&
        selectedCell && (

          <div
            className="mastertimetable_popup_overlay"
            onClick={() => {

              if (
                savingCell
              ) {
                return;
              }

              setShowSubjectPopup(
                false
              );

              setSelectedCell(
                null
              );

              setSelectedClass(
                null
              );

            }}
          >

            <div
              className="mastertimetable_subject_popup"
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              <div className="mastertimetable_popup_header">

                <div>

                  <h3>
                    Select Subject
                  </h3>

                  <p>

                    {
                      selectedClass
                        ?.programme
                        ?.programmeName ||
                      "Class"
                    }

                    {" — Section "}

                    {
                      selectedClass
                        ?.section ||
                      "-"
                    }

                  </p>

                </div>

                <XIcon
                  size={22}
                  onClick={() => {

                    if (
                      savingCell
                    ) {
                      return;
                    }

                    setShowSubjectPopup(
                      false
                    );

                    setSelectedCell(
                      null
                    );

                    setSelectedClass(
                      null
                    );

                  }}
                />

              </div>

              <div className="mastertimetable_subject_popup_body">

                <div className="mastertimetable_cell_information">

                  <span>
                    Date
                  </span>

                  <strong>

                    {
                      formatDisplayDate(
                        selectedCell.date
                      )
                    }

                  </strong>

                  <span>
                    Session
                  </span>

                  <strong>

                    {
                      selectedCell.session
                        ?.startTime
                    }

                    {" - "}

                    {
                      selectedCell.session
                        ?.endTime
                    }

                  </strong>

                </div>

                {loadingSubjects ? (

                  <div className="mastertimetable_subject_loading">

                    Loading subjects...

                  </div>

                ) : classSubjects.length > 0 ? (

                  <div className="mastertimetable_subject_list">

                    {classSubjects.map(
                      (
                        subject
                      ) => {

                        const isScheduled =
                          subject.isScheduled;

                        const isCurrent =
                          selectedCell
                            .existingSubjectId
                            ?.toString() ===
                          subject._id?.toString();

                        return (

                          <div
                            key={
                              subject._id
                            }

                            className={
                              isCurrent
                                ? "mastertimetable_subject_option mastertimetable_subject_option_current"
                                : isScheduled
                                ? "mastertimetable_subject_option mastertimetable_subject_option_disabled"
                                : "mastertimetable_subject_option"
                            }
                          >

                            <div>

                              <strong>

                                {
                                  subject.subjectCode
                                }

                              </strong>

                              <span>

                                {
                                  subject.subjectName
                                }

                              </span>

                              {
                                isScheduled &&
                                subject.scheduledAt && (

                                  <small>

                                    Already scheduled on{" "}

                                    {
                                      formatDisplayDate(
                                        subject
                                          .scheduledAt
                                          .date
                                      )
                                    }

                                    {" • "}

                                    {
                                      subject
                                        .scheduledAt
                                        .startTime
                                    }

                                    {" - "}

                                    {
                                      subject
                                        .scheduledAt
                                        .endTime
                                    }

                                  </small>

                                )
                              }

                            </div>

                            {isCurrent ? (

                              <span className="mastertimetable_subject_current_badge">

                                Current

                              </span>

                            ) : isScheduled ? (

                              <span className="mastertimetable_subject_scheduled_badge">

                                Scheduled

                              </span>

                            ) : (

                              <button
                                type="button"
                                className="mastertimetable_assign_subject_btn"
                                disabled={
                                  savingCell
                                }

                                onClick={() => {

                                  if (
                                    selectedCell.scheduleId
                                  ) {

                                    changeSubjectInCell(
                                      subject._id
                                    );

                                  } else {

                                    assignSubjectToCell(
                                      subject._id
                                    );

                                  }

                                }}
                              >

                                {
                                  savingCell
                                    ? "Saving..."
                                    : selectedCell.scheduleId
                                    ? "Change"
                                    : "Assign"
                                }

                              </button>

                            )}

                          </div>

                        );

                      }
                    )}

                  </div>

                ) : (

                  <div className="mastertimetable_subject_empty">

                    No active subjects found
                    for this class.

                  </div>

                )}

              </div>

              {selectedCell.scheduleId && (

                <div className="mastertimetable_subject_popup_footer">

                  <button
                    type="button"
                    className="mastertimetable_remove_subject_btn"
                    disabled={
                      savingCell
                    }
                    onClick={() =>
                      removeSubjectFromCell(
                        selectedCell.scheduleId
                      )
                    }
                  >

                    <TrashSimpleIcon
                      size={17}
                    />

                    Remove Subject

                  </button>

                </div>

              )}

            </div>

          </div>

        )}

    </div>
  );
};

export default MasterTimetable;
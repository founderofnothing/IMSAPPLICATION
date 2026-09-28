import { useEffect, useState } from "react";
import API from "../../../api/axios";
import { toast } from "react-toastify";
import AcademicTimetable from "../AcademicTimetable/AcademicTimetable";
// import "./AttendancePage.css";
import "./attendancepage.css"

const AttendancePage = () => {

  // ==================== FILTER ====================

  const [departments, setDepartments] =
    useState([]);

  const [selectedDepartment, setSelectedDepartment] =
    useState("");

  const [classes, setClasses] =
    useState([]);

  const [selectedClass, setSelectedClass] =
    useState("");

  const [attendanceDate, setAttendanceDate] =
    useState(
      new Date()
        .toISOString()
        .split("T")[0]
    );

  // ==================== TIMETABLE ====================

  const [timetable, setTimetable] =
    useState(null);

  const [attendanceStatus, setAttendanceStatus] =
    useState([]);

  // ==================== ATTENDANCE ====================

  const [selectedCell, setSelectedCell] =
    useState(null);

  const [students, setStudents] =
    useState([]);

  const [attendance, setAttendance] =
    useState([]);

  const [isEditMode, setIsEditMode] =
    useState(false);

  // ==================== BULK ====================

  const [bulkStatus, setBulkStatus] =
    useState("");

  // ==================== LOADING ====================

  const [loading, setLoading] =
    useState(false);

  // ==================== FETCH DEPARTMENTS ====================
const fetchDepartments =
  async () => {

    try {

      const response =
        await API.get(
          "/departments"
        );

      setDepartments(

        response.data.data ||

        []

      );

    } catch (error) {

      toast.error(

        error.response?.data?.message ||

        "Failed to fetch departments."

      );

    }

  };

  // ==================== FETCH CLASSES ====================
const fetchClasses =
  async (departmentId) => {

    try {

      const response =
        await API.get(

          `/classes/department/${departmentId}`

        );

      setClasses(

        response.data.data.classes ||

        []

      );

    } catch (error) {

      toast.error(

        error.response?.data?.message ||

        "Failed to fetch classes."

      );

    }

  };

// ==================== FETCH TIMETABLE ====================
const fetchTimetable =
  async (classId) => {

    try {

      const response =
        await API.get(

          `/timetable/class/${classId}`

        );
        setTimetable(
  response.data.data
);

console.log(
  response.data.data
);

      setTimetable(

        response.data.data

      );

    } catch (error) {

      if (

        error.response?.status === 404

      ) {

        setTimetable(null);

        toast.info(

          error.response.data.message

        );

        return;

      }

      toast.error(

        error.response?.data?.message ||

        "Failed to fetch timetable."

      );

    }

  };

  // ==================== FETCH ATTENDANCE STATUS ====================
const fetchAttendanceStatus =
  async (

    classId,

    attendanceDate

  ) => {

    try {

      const response =
        await API.get(

          `/attendance/status`,

          {

            params: {

              classId,

              attendanceDate,

            },

          }

        );
        console.log(response.data.data);

      setAttendanceStatus(

        response.data.data ||

        []

      );

    } catch (error) {

      toast.error(

        error.response?.data?.message ||

        "Failed to fetch attendance status."

      );

    }

  };
  // ==================== GET ATTENDANCE STATUS ====================
const getAttendanceStatus =
  (
    dayOrder,
    periodNumber
  ) => {

    return attendanceStatus.find(

      (item) =>

        item.dayOrder ===
          dayOrder &&

        item.periodNumber ===
          periodNumber

    );

  };


// ==================== HANDLE CELL CLICK ====================
const handleCellClick =
  async (

    day,

    period

  ) => {

    const subject =

      period.subjectId;

    const status =

      getAttendanceStatus(

        day.dayOrder,

        period.periodNumber

      );

    setSelectedCell({

      classId:
        selectedClass,

      attendanceDate,

      dayOrder:
        day.dayOrder,

      periodNumber:
        period.periodNumber,

      subjectId:
        subject?._id,

      subjectCode:
        subject?.subjectCode,

      subjectName:
        subject?.subjectName,

      attendanceCompleted:
        !!status,

      facultyName:
        status?.facultyName || "",

    });

    // ==================== ATTENDANCE EXISTS ====================

if (status) {

  console.log("Attendance Exists");

  await fetchAttendance(

    selectedClass,

    attendanceDate,

    day.dayOrder,

    period.periodNumber

  );

}

else {

  console.log("No Attendance - Fetch Students");

  await fetchStudents(selectedClass);

}

  };

// ==================== FETCH STUDENTS ====================

const fetchStudents =
  async (classId) => {

    try {

      const response =
        await API.get(

          `/students/class/studentlist/${classId}`

        );

      console.log(
        response.data
      );

      const studentList =

        response.data.data.map(

          (student)=>({

            studentId:
              student._id,

            registerNumber:
              student.registerNumber,

            studentName:
              student.studentName,

            status:
              "",

            remarks:
              "",

          })

        );

      console.log(
        studentList
      );

      setStudents(
        studentList
      );

      setAttendance([]);

      setIsEditMode(
        false
      );

    } catch (error) {

      console.log(error);

      toast.error(

        error.response?.data?.message ||

        "Failed to fetch students."

      );

    }

  };

// ==================== FETCH ATTENDANCE ====================
const fetchAttendance =
  async (

    classId,

    attendanceDate,

    dayOrder,

    periodNumber

  ) => {

    console.log({

  classId,

  attendanceDate,

  dayOrder,

  periodNumber,

});

    try {

      const response =
        await API.get(

          "/Attendance",

          {

            params: {

              classId,

              attendanceDate,

              dayOrder,

              periodNumber,

            },

          }

        );

      const attendanceData =
        response.data.data;

      setAttendance(
        attendanceData
      );

      const studentList =

        attendanceData.students.map(

          (student)=>({

            studentId:
              student.studentId._id,

            registerNumber:
              student.studentId.registerNumber,

            studentName:
              student.studentId.studentName,

            status:
              student.status,

            remarks:
              student.remarks,

          })

        );

      setStudents(
        studentList
      );

      setIsEditMode(
        true
      );

    } catch (error) {

      if (

        error.response?.status === 400

      ) {

        return false;

      }

      toast.error(

        error.response?.data?.message ||

        "Failed to fetch attendance."

      );

      return false;

    }

    return true;

  };

  // ==================== SAVE ATTENDANCE ====================
const saveAttendance = async () => {

  try {

    const hasEmptyStatus =

      students.some(

        (student)=>

          !student.status

      );

    if(hasEmptyStatus){

      toast.warning(

        "Please mark attendance for all students."

      );

      return;

    }

    const payload = {

      classId:
        selectedCell.classId,

      attendanceDate:
        selectedCell.attendanceDate,

      dayOrder:
        selectedCell.dayOrder,

      periodNumber:
        selectedCell.periodNumber,

      students:
        students.map((student)=>({

          studentId:
            student.studentId,

          status:
            student.status,

        })),

    };

    console.log(payload);

    const response =

      await API.post(

        "/attendance",

        payload

      );

toast.success(
  response.data.message
);

await fetchAttendanceStatus(
  selectedClass,
  attendanceDate
);

const updatedStatus = {

  attendanceCompleted: true,

  facultyName:
    response.data.data.facultyId?.fullName ||

    "You",

};

setSelectedCell((prev)=>({

  ...prev,

  ...updatedStatus,

}));

setStudents([]);

setAttendance([]);

setBulkStatus("");

setIsEditMode(false);

  } catch (error) {

    toast.error(

      error.response?.data?.message ||

      "Failed to save attendance."

    );

  }

};

  // ==================== DELETE ATTENDANCE ====================

  const deleteAttendance =
    async () => {

    };

  // ==================== BULK APPLY ====================
const applyBulkAttendance = () => {

  if(!bulkStatus){

    toast.warning(
      "Select a bulk status."
    );

    return;

  }

  const updatedStudents =

    students.map((student)=>({

      ...student,

      status: bulkStatus,

    }));

  setStudents(
    updatedStudents
  );

};

  // ==================== CLEAR ALL ====================
const clearAttendance = () => {

  const updatedStudents =

    students.map((student)=>({

      ...student,

      status: "",

      remarks: "",

    }));

  setStudents(
    updatedStudents
  );

  setBulkStatus("");

};

  // ==================== INITIAL LOAD ====================

  useEffect(() => {

    fetchDepartments();

  }, []);

  // ==================== UI ====================

  return (

    <div className="attendance-page">

      {/* ==================== FILTER ==================== */}

      <div className="attendance-filter">

      <select

value={
  selectedDepartment
}

onChange={(e)=>{

  const departmentId =
    e.target.value;

  setSelectedDepartment(
    departmentId
  );

  setSelectedClass("");

  setClasses([]);

  if(departmentId){

    fetchClasses(
      departmentId
    );

  }

}}

>

<option value="">

Select Department

</option>

{

departments.map(

(department)=>(

<option

key={
department._id
}

value={
department._id
}

>

{

department.departmentName

}

</option>

)

)

}

</select>

<select

value={
  selectedClass
}

onChange={(e)=>{

  const classId =
    e.target.value;

  setSelectedClass(
    classId
  );

  if(classId){

    fetchTimetable(
      classId
    );

    fetchAttendanceStatus(

      classId,

      attendanceDate

    );

  }

}}

>

<option value="">

Select Class

</option>

{

classes.map(

(classItem)=>(

<option

key={
classItem._id
}

value={
classItem._id
}

>

{

classItem.programme?.programmeName

}

{" - "}

{

classItem.batchId?.batchName

}

{" - Section "}

{

classItem.section

}

</option>

)

)

}

</select>

      <input

type="date"

value={
  attendanceDate
}

onChange={(e)=>{

  const date =
    e.target.value;

  setAttendanceDate(
    date
  );

  if(selectedClass){

    fetchAttendanceStatus(

      selectedClass,

      date

    );

  }

}}
/>

      </div>

      {/* ==================== TIMETABLE ==================== */}

     <AcademicTimetable

  mode="attendance"

  periodConfiguration={
    timetable?.periodConfiguration
  }

  timetableData={
    timetable?.timetable
  }

  attendanceStatus={
    attendanceStatus
  }

  onCellClick={
    handleCellClick
  }

/>

      {/* ==================== ATTENDANCE PANEL ==================== */}

<div className="attendance-panel">

  {!selectedCell ? (

    <p>Select a subject from the timetable.</p>

  ) : selectedCell.attendanceCompleted ? (

    <div className="attendance-header">

      <h3>
        {selectedCell.subjectCode} - {selectedCell.subjectName}
      </h3>

      <p>
        Day {selectedCell.dayOrder} | Period {selectedCell.periodNumber}
      </p>

      <p>
        Attendance already taken by <strong>{selectedCell.facultyName}</strong>
      </p>

    </div>

    

  ) : (


    
<>

  <div className="attendance-bulk">

    <select
      value={bulkStatus}
      onChange={(e)=>setBulkStatus(e.target.value)}
    >

      <option value="">

        Bulk Status

      </option>

      <option value="present">

        Present

      </option>

      <option value="absent">

        Absent

      </option>

    </select>

    <button
      onClick={applyBulkAttendance}
    >

      Apply To All

    </button>

    <button
      onClick={clearAttendance}
    >

      Clear All

    </button>

  </div>

  <table className="attendance-table">

    <thead>

      <tr>

        <th>

          Register No

        </th>

        <th>

          Student Name

        </th>

        <th>

          Status

        </th>

    

      </tr>

    </thead>

    <tbody>

      {

        students.map((student,index)=>(

          <tr
            key={student.studentId}
          >

            <td>

              {

                student.registerNumber

              }

            </td>

            <td>

              {

                student.studentName

              }

            </td>

            <td>

              <select

                value={
                  student.status
                }

                onChange={(e)=>{

                  const updated =

                    [...students];

                  updated[index].status =

                    e.target.value;

                  setStudents(updated);

                }}

              >

                <option value="">

                  Select

                </option>

                <option value="present">

                  Present

                </option>

                <option value="absent">

                  Absent

                </option>

              </select>

            </td>

           

          </tr>

        ))

      }

    </tbody>

  </table>

  <div className="attendance-action">

  <button
    onClick={saveAttendance}
  >

    Save Attendance

  </button>

</div>

</>

  )}

</div>

    </div>

  );

};

export default AttendancePage;
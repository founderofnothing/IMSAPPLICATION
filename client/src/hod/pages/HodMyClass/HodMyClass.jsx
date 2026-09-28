import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import API from "../../../api/axios";

import {
  ArrowLeftIcon,
  UsersThreeIcon,
  GraduationCapIcon,
  UserIcon,
} from "@phosphor-icons/react";

import "./HodMyClass.css";


const HodMyClass = () => {
    const navigate = useNavigate();

  // =========================================================
  // STATE
  // =========================================================

  const [myClass, setMyClass] = useState(null);

  const [students, setStudents] = useState([]);

  const [studentCount, setStudentCount] =
    useState(0);

  const [loading, setLoading] =
    useState(true);


  // =========================================================
  // FETCH MY CLASS
  // =========================================================

  const fetchMyClass = async () => {

    try {

      setLoading(true);

      const response = await API.get(
        "/classes/my-class"
      );


      const data =
        response.data.data;


      // ===================================================
      // SET CLASS
      // ===================================================

      setMyClass(
        data.class
      );


      // ===================================================
      // SET STUDENTS
      // ===================================================

      setStudents(
        data.students || []
      );


      // ===================================================
      // SET COUNT
      // ===================================================

      setStudentCount(
        data.studentCount || 0
      );


    } catch (error) {

      console.error(
        "Fetch my class error:",
        error
      );


      toast.error(
        error.response?.data?.message ||
        "Failed to fetch your class."
      );


      setMyClass(null);

      setStudents([]);

      setStudentCount(0);


    } finally {

      setLoading(false);

    }

  };


  // =========================================================
  // FETCH ON PAGE LOAD
  // =========================================================

  useEffect(() => {

    fetchMyClass();

  }, []);


  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {

    return (

      <div className="hod_my_class_page">

        <div className="hod_my_class_loading">

          Loading your class...

        </div>

      </div>

    );

  }


  // =========================================================
  // NO CLASS
  // =========================================================

  if (!myClass) {

    return (

      <div className="hod_my_class_page">

        <div className="hod_my_class_empty">

          <UsersThreeIcon
            size={42}
          />

          <h3>
            No Class Assigned
          </h3>

          <p>
            You are currently not assigned
            as a class incharge.
          </p>

        </div>

      </div>

    );

  }


  // =========================================================
  // HELPERS
  // =========================================================

  const getStudentInitial = (
    name
  ) => {

    return (
      name
        ?.charAt(0)
        ?.toUpperCase() ||
      "S"
    );

  };


  // =========================================================
  // RENDER
  // =========================================================

  return (

    <div className="hod_my_class_page">


      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="hod_my_class_header">

        <div>

          <span className="hod_my_class_eyebrow">
            CLASS MANAGEMENT
          </span>

          <h1>
            My Class
          </h1>

          <p>
            Manage and view students assigned
            to your class.
          </p>

        </div>

      </div>


      {/* =====================================================
          CLASS SUMMARY
      ===================================================== */}

      <section className="hod_my_class_summary">


        {/* CLASS */}

        <div className="hod_my_class_summary_item">

          <div className="hod_my_class_summary_icon">

            <GraduationCapIcon />

          </div>

          <div>

            <span>
              CLASS
            </span>

            <strong>
              {myClass.programme?.programmeName ||
                "Class"}
            </strong>

          </div>

        </div>


        {/* BATCH */}

        <div className="hod_my_class_summary_item">

          <div className="hod_my_class_summary_icon">

            <GraduationCapIcon />

          </div>

          <div>

            <span>
              BATCH
            </span>

            <strong>
              {myClass.batchId?.batchName ||
                "Not available"}
            </strong>

          </div>

        </div>


        {/* SECTION */}

        <div className="hod_my_class_summary_item">

          <div className="hod_my_class_summary_icon">

            <UsersThreeIcon />

          </div>

          <div>

            <span>
              SECTION
            </span>

            <strong>
              {myClass.section ||
                "General"}
            </strong>

          </div>

        </div>


        {/* STUDENTS */}

        <div className="hod_my_class_summary_item">

          <div className="hod_my_class_summary_icon">

            <UsersThreeIcon />

          </div>

          <div>

            <span>
              STUDENTS
            </span>

            <strong>
              {studentCount}
            </strong>

          </div>

        </div>

      </section>


      {/* =====================================================
          CLASS INFORMATION
      ===================================================== */}

      <section className="hod_my_class_card">

        <div className="hod_my_class_section_header">

          <div className="hod_my_class_section_icon">

            <GraduationCapIcon />

          </div>

          <div>

            <h2>
              Class Information
            </h2>

            <p>
              Academic details of your assigned class.
            </p>

          </div>

        </div>


        <div className="hod_my_class_info_grid">


          <div className="hod_my_class_info_item">

            <span>
              Institution
            </span>

            <strong>
              {myClass.institution?.institutionName ||
                "Not available"}
            </strong>

          </div>


          <div className="hod_my_class_info_item">

            <span>
              Department
            </span>

            <strong>
              {myClass.department?.departmentName ||
                "Not available"}
            </strong>

          </div>


          <div className="hod_my_class_info_item">

            <span>
              Programme
            </span>

            <strong>
              {myClass.programme?.programmeName ||
                "Not available"}
            </strong>

          </div>


          <div className="hod_my_class_info_item">

            <span>
              Programme Code
            </span>

            <strong>
              {myClass.programme?.programmeCode ||
                "Not available"}
            </strong>

          </div>


          <div className="hod_my_class_info_item">

            <span>
              Programme Type
            </span>

            <strong>
              {myClass.programme?.programmeType ||
                "Not available"}
            </strong>

          </div>


          <div className="hod_my_class_info_item">

            <span>
              Current Year
            </span>

            <strong>
              {myClass.batchId?.currentYear
                ? `Year ${myClass.batchId.currentYear}`
                : "Not available"}
            </strong>

          </div>

        </div>

      </section>


      {/* =====================================================
          STUDENTS
      ===================================================== */}

      <section className="hod_my_class_card">

        <div className="hod_my_class_section_header">

          <div className="hod_my_class_section_icon">

            <UsersThreeIcon />

          </div>

          <div>

            <h2>
              Students
            </h2>

            <p>
              Students currently assigned to your class.
            </p>

          </div>


          <div className="hod_my_class_count_badge">

            {studentCount}

            <span>
              Students
            </span>

          </div>

        </div>


        {/* =================================================
            STUDENT TABLE
        ================================================= */}

        {students.length > 0 ? (

          <div className="hod_my_class_table_wrapper">

            <table className="hod_my_class_table">

              <thead>

                <tr>

                  <th>
                    #
                  </th>

                  <th>
                    Student
                  </th>

                  <th>
                    Register Number
                  </th>

                  <th>
                    Student Type
                  </th>

                  <th>
                    Gender
                  </th>

                  <th>
                    Status
                  </th>

                </tr>

              </thead>


              <tbody>

                {students.map(
                  (student, index) => (

<tr
  key={student._id}
  onClick={() =>
    navigate(
      `/hod/students/profile/${student._id}`
    )
  }
  className="hod_my_class_student_row"
>

                      <td>
                        {index + 1}
                      </td>


                      <td>

                        <div className="hod_my_class_student">

                          <div className="hod_my_class_student_avatar">

                            {student.profilePhoto ? (

                              <img
                                src={
                                  student.profilePhoto
                                }
                                alt={
                                  student.studentName
                                }
                              />

                            ) : (

                              getStudentInitial(
                                student.studentName
                              )

                            )}

                          </div>


                          <div>

                            <strong>
                              {student.studentName}
                            </strong>

                            <span>
                              {student.studentEmail ||
                                "No email"}
                            </span>

                          </div>

                        </div>

                      </td>


                      <td>

                        {student.registerNumber ||
                          "Not assigned"}

                      </td>


                      <td>

                        <span className="hod_my_class_type_badge">

                          {student.studentType ||
                            "UG"}

                        </span>

                      </td>


                      <td>

                        {student.gender ||
                          "Not provided"}

                      </td>


                      <td>

                        <span className="hod_my_class_status_badge">

                          {student.admissionStatus ||
                            "Unknown"}

                        </span>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        ) : (

          <div className="hod_my_class_no_students">

            <UserIcon
              size={34}
            />

            <h3>
              No Students Found
            </h3>

            <p>
              There are currently no students
              assigned to this class.
            </p>

          </div>

        )}

      </section>

    </div>

  );

};


export default HodMyClass;
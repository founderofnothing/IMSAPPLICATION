import React, { useEffect, useState } from "react";
import API from "./../../../../api/axios";
import { toast } from "react-toastify";
import { NavLink } from "react-router-dom";
import "./SubjectPage.css";

const SubjectPage = () => {

  // ==================== STATE ====================

  const [programmes, setProgrammes] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

    // ==================== PROGRAMME STRUCTURE ====================

const [selectedProgramme, setSelectedProgramme] =
  useState(null);

const [programmeStructure, setProgrammeStructure] =
  useState(null);

const [showStructureModal, setShowStructureModal] =
  useState(false);

const [structureLoading, setStructureLoading] =
  useState(false);

  // ==================== SUBJECTS ====================

const [selectedStudyYear, setSelectedStudyYear] =
  useState(null);

const [selectedSemester, setSelectedSemester] =
  useState(null);

const [subjects, setSubjects] =
  useState([]);

const [subjectLoading, setSubjectLoading] =
  useState(false);


  const [structureExists, setStructureExists] =
  useState(false);


const [editingSubject, setEditingSubject] =
  useState(null);

const [subjectForm, setSubjectForm] =
  useState({

    subjectName: "",

    subjectCode: "",

    subjectScore: "",

    subjectType: "Major",

  });

  // ================= SUBJECT POPUP =================

const [showSubjectPopup, setShowSubjectPopup] =
  useState(false);

const [subjectMode, setSubjectMode] =
  useState("create");



const resetSubjectForm = () => {

  setSubjectForm({

    subjectName: "",

    subjectCode: "",

    subjectScore: "",

    subjectType: "Major",

  });

};
  // ==================== FETCH PROGRAMMES ====================

  const fetchProgrammes = async () => {

    try {

      setLoading(true);

      const response =
        await API.get(
          "/programmes/my-department"
        );

      setProgrammes(
        response.data.data || []
      );

    } catch (error) {

      toast.error(

        error.response?.data?.message ||

        "Failed to fetch programmes."

      );

    } finally {

      setLoading(false);

    }

  };


// ==================== CREATE PROGRAMME STRUCTURE ====================
const createProgrammeStructure = async () => {

  if (!selectedProgramme?._id) {

    toast.error(
      "Please select a programme first."
    );

    return;
  }

  try {

    setStructureLoading(true);

    const response = await API.post(
      "/subjects/create-structure",
      {
        programmeId:
          selectedProgramme._id,
      }
    );

    console.log(
      "PROGRAMME STRUCTURE CREATED:",
      response.data
    );

    toast.success(
      response.data?.message ||
      "Programme structure created successfully."
    );

    // Structure now exists
    setStructureExists(true);

    // Refresh the newly created structure
    await fetchProgrammeStructure(
      selectedProgramme
    );

  } catch (error) {

    console.error(
      "CREATE PROGRAMME STRUCTURE ERROR:",
      error
    );

    toast.error(
      error.response?.data?.message ||
      error.message ||
      "Failed to create programme structure."
    );

  } finally {

    setStructureLoading(false);

  }

};


  // ==================== FETCH PROGRAMME STRUCTURE ====================
// ==================== FETCH PROGRAMME STRUCTURE ====================
const fetchProgrammeStructure = async (programme) => {

  try {

    setStructureLoading(true);

    setSelectedProgramme(programme);

    const response = await API.get(
      `/subjects/programme/${programme._id}`
    );

    setProgrammeStructure(
      response.data.data
    );

    setStructureExists(true);

    setShowStructureModal(true);

  } catch (error) {

    // Structure does not exist yet
    if (
      error.response?.status === 404 &&
      error.response?.data?.message ===
        "Programme structure not found."
    ) {

      setProgrammeStructure(null);

      setStructureExists(false);

      setShowStructureModal(true);

      return;
    }

    toast.error(
      error.response?.data?.message ||
      "Failed to load programme structure."
    );

  } finally {

    setStructureLoading(false);

  }

};



const addSemester = async (studyYear) => {

  try {

   await API.patch(
  `/subjects/${selectedProgramme._id}/add-semester`,
  {
    studyYear,
  }
);

    toast.success(
      "Semester added successfully."
    );

    fetchProgrammeStructure(
      selectedProgramme
    );

  } catch (error) {

    toast.error(

      error.response?.data?.message ||

      "Failed to add semester."

    );

  }

};

const removeSemester = async (
  studyYear,
  semesterNumber
) => {

  try {

   await API.patch(
  `/subjects/${selectedProgramme._id}/remove-semester`,
  {
    studyYear,
    semesterNumber,
  }
);

    toast.success(
      "Semester removed successfully."
    );

    fetchProgrammeStructure(
      selectedProgramme
    );

  } catch (error) {

    toast.error(

      error.response?.data?.message ||

      "Failed to remove semester."

    );

  }

};
// ==================== FETCH SUBJECTS ====================
const fetchSubjects = async (
  studyYear,
  semesterNumber
) => {

  try {

    setSubjectLoading(true);

const response =
  await API.get(
    `/subjects/getsubject/programme/${selectedProgramme._id}/study-year/${studyYear}/semester/${semesterNumber}`
  );

    setSelectedStudyYear(
      studyYear
    );

    setSelectedSemester(
      semesterNumber
    );

    setSubjects(
      response.data.data || []
    );

  } catch (error) {

    toast.error(

      error.response?.data?.message ||

      "Failed to fetch subjects."

    );

  } finally {

    setSubjectLoading(false);

  }

};


// ==================== SAVE / UPDATE SUBJECT ====================
const saveSubject = async () => {

  try {

    if (editingSubject) {

      // ==================== UPDATE ====================

      await API.put(

        `/subjects/update/${editingSubject._id}`,

        {

          subjectName:
            subjectForm.subjectName,

          subjectCode:
            subjectForm.subjectCode,

          subjectScore:
            Number(subjectForm.subjectScore),

          subjectType:
            subjectForm.subjectType,

          isActive: true,

        }

      );

      toast.success(
        "Subject updated successfully."
      );

    } else {

      // ==================== CREATE ====================

      await API.post(

        "/subjects/create",

        {

          programmeId:
            selectedProgramme._id,

          studyYear:
            selectedStudyYear,

          semesterNumber:
            selectedSemester,

          subjectName:
            subjectForm.subjectName,

          subjectCode:
            subjectForm.subjectCode,

          subjectScore:
            Number(subjectForm.subjectScore),

          subjectType:
            subjectForm.subjectType,

        }

      );

      toast.success(
        "Subject created successfully."
      );

    }

    // ==================== RESET ====================

  setShowSubjectPopup(false);

    setEditingSubject(null);

    setSubjectForm({

      subjectName: "",

      subjectCode: "",

      subjectScore: "",

      subjectType: "Major",

    });

    fetchSubjects(

      selectedStudyYear,

      selectedSemester

    );

  } catch (error) {

    toast.error(

      error.response?.data?.message ||

      "Operation failed."

    );

  }

};

// ==================== EDIT SUBJECT ====================
const handleEditSubject = (
  subject
) => {

  setEditingSubject(subject);

  setSubjectForm({

    subjectName:
      subject.subjectName,

    subjectCode:
      subject.subjectCode,

    subjectScore:
      subject.subjectScore,

    subjectType:
      subject.subjectType,

  });

 setSubjectMode("update");

setShowSubjectPopup(true);

};

// ==================== DELETE SUBJECT ====================
const handleDeleteSubject = async (
  subjectId
) => {

  const confirmDelete =
    window.confirm(
      "Are you sure you want to delete this subject?"
    );

  if (!confirmDelete) return;

  try {

    await API.delete(
      `/subjects/delete/${subjectId}`
    );

    toast.success(
      "Subject deleted successfully."
    );

    fetchSubjects(
      selectedStudyYear,
      selectedSemester
    );

  } catch (error) {

    toast.error(

      error.response?.data?.message ||

      "Failed to delete subject."

    );

  }

};
  // ==================== INITIAL LOAD ====================

  useEffect(() => {

    fetchProgrammes();

  }, []);

  // ==================== UI ====================

  return (

    <div className="subject-page">

      {/* ==================== HEADER ==================== */}
<NavLink to="/hod/SubjectPage/bin" className="subject_recyclebin">
  <h2>recycle bin</h2>
</NavLink>
      <div className="page-header">

        <h2>
          Subject Management
        </h2>

        <p>
          Select a programme to manage
          semesters and subjects.
        </p>

      </div>

      {/* ==================== PROGRAMMES ==================== */}

      <div className="programme-list">

        {

          loading ? (

            <h4>
              Loading Programmes...
            </h4>

          ) : programmes.length === 0 ? (

            <h4>
              No programmes found.
            </h4>

          ) : (

            programmes.map(

              (programme) => (

             <div
  key={programme._id}
  className="programme-card"
  onClick={() =>
    fetchProgrammeStructure(
      programme
    )
  }
>

                  <h3>
                    {programme.programmeName}
                  </h3>

                  <p>

                    Code :

                    {" "}

                    {programme.programmeCode}

                  </p>

                  <p>

                    Type :

                    {" "}

                    {programme.programmeType}

                  </p>

                  <p>

                    Duration :

                    {" "}

                    {programme.duration}

                    {" "}

                    Years

                  </p>

                </div>

              )

            )

          )

        }

      </div>

      {
showStructureModal && (

<div className="structure-modal">

<div className="hod_subject_structure_wrapper">

  {/* ================= LEFT PANEL ================= */}

  <div className="hod_subject_left_panel">

    <div className="hod_subject_modal_header">

      <div>

        <h2>

          {selectedProgramme?.programmeName}

        </h2>

        <p>

          Subject Structure

        </p>

      </div>

      <button
        onClick={() =>
          setShowStructureModal(false)
        }
      >

        ✕

      </button>

    </div>

{
  structureLoading ? (

    <div className="hod_subject_structure_loading">

      <h3>Loading...</h3>

    </div>

  ) : !structureExists ? (

    <div className="hod_subject_structure_empty">

      <h3>
        Programme Structure Not Created
      </h3>

      <p>
        This programme does not have an academic
        structure yet.
      </p>

      <button
        className="hod_subject_create_structure_btn"
        onClick={createProgrammeStructure}
      >
        + Create Programme Structure
      </button>

    </div>

  ) : (

    programmeStructure?.structure?.map(

      (year) => (

        <div
          key={year.studyYear}
          className="hod_subject_year_card"
        >

          <div className="hod_subject_year_header">

            <h3>
              Year {year.studyYear}
            </h3>

            <button
              onClick={() =>
                addSemester(year.studyYear)
              }
            >
              + Semester
            </button>

          </div>

          <div className="hod_subject_semester_list">

            {
              year.semesters.length === 0 ? (

                <p>
                  No Semester
                </p>

              ) : (

                year.semesters.map(

                  (semester) => (

                    <div
                      key={semester.semesterNumber}
                      className="hod_subject_semester_item"
                    >

                      <button
                        className="hod_subject_semester_btn"
                        onClick={() =>
                          fetchSubjects(
                            year.studyYear,
                            semester.semesterNumber
                          )
                        }
                      >
                        Semester {semester.semesterNumber}
                      </button>

                      <button
                        className="hod_subject_remove_semester"
                        onClick={() =>
                          removeSemester(
                            year.studyYear,
                            semester.semesterNumber
                          )
                        }
                      >
                        ✕
                      </button>

                    </div>

                  )

                )

              )
            }

          </div>

        </div>

      )

    )

  )
} 

  </div>

  {/* ================= RIGHT PANEL ================= */}

  <div className="hod_subject_right_panel">

<div className="hod_subject_right_header">

  <div>

    <h2>

      {selectedSemester
        ? `Year ${selectedStudyYear} • Semester ${selectedSemester}`
        : "Select a Semester"}

    </h2>

    <p>

      Manage subjects for the selected semester.

    </p>

  </div>

  {selectedSemester && (

    <button
      className="hod_subject_add_subject_btn"
onClick={() => {

  resetSubjectForm();

  setEditingSubject(null);

  setSubjectMode("create");

  setShowSubjectPopup(true);

}}
    >

      + Add Subject

    </button>

  )}

</div>


<div className="hod_subject_workspace">

  {selectedSemester === null ? (

    <div className="hod_subject_empty_state">

      <h3>Select a Semester</h3>

      <p>
        Choose a semester from the left panel to manage subjects.
      </p>

    </div>

  ) : subjectLoading ? (

    <div className="hod_subject_loading">

      <h3>Loading Subjects...</h3>

    </div>

  ) : (

    <>

      {/* ================= SUBJECT FORM ================= */}

   

      {/* ================= SUBJECT LIST ================= */}

      <div className="hod_subject_list_wrapper">

        {subjects.length === 0 ? (

          <div className="hod_subject_empty_state">

            <h3>No Subjects</h3>

            <p>
              Create your first subject for this semester.
            </p>

          </div>

        ) : (

subjects.map((subject) => (

  <div
    key={subject._id}
    className="hod_subject_card"
  >

    <div className="hod_subject_card_top">

      <div>

        <h3>

          {subject.subjectCode}

        </h3>

        <p>

          {subject.subjectName}

        </p>

      </div>

      <span className="hod_subject_type">

        {subject.subjectType}

      </span>

    </div>

    <div className="hod_subject_card_bottom">

      <div className="hod_subject_marks">

        Maximum Marks :

        <strong>

          {" "}

          {subject.subjectScore}

        </strong>

      </div>

      <div className="hod_subject_actions">

        <button
          className="hod_subject_edit_btn"
          onClick={() =>
            handleEditSubject(subject)
          }
        >

          ✏ Edit

        </button>

        <button
          className="hod_subject_delete_btn"
          onClick={() =>
            handleDeleteSubject(subject._id)
          }
        >

          🗑 Delete

        </button>

      </div>

    </div>

  </div>

))

        )}

      </div>

    </>

  )}

</div>


  </div>

</div>


</div>

)
}


{
showSubjectPopup && (

<div className="hod_subject_popup_overlay">

<div className="hod_subject_popup_wrapper">

{/* Header */}

<div className="hod_subject_popup_header">

<div>

<h2>

{subjectMode==="create"

? "Create Subject"

: "Update Subject"}

</h2>

<p>

Manage semester subjects

</p>

</div>

<button

onClick={()=>{

setShowSubjectPopup(false);

resetSubjectForm();

setEditingSubject(null);

}}

>

✕

</button>

</div>

{/* Body */}

<div className="hod_subject_popup_body">

<div className="hod_subject_popup_grid">

<div className="hod_subject_popup_field">

<label>

Subject Name

</label>

<input

value={subjectForm.subjectName}

onChange={(e)=>

setSubjectForm({

...subjectForm,

subjectName:e.target.value,

})

}

/>

</div>

<div className="hod_subject_popup_field">

<label>

Subject Code

</label>

<input

value={subjectForm.subjectCode}

onChange={(e)=>

setSubjectForm({

...subjectForm,

subjectCode:e.target.value.toUpperCase(),

})

}

/>

</div>

<div className="hod_subject_popup_field">

<label>

Maximum Marks

</label>

<input

type="number"

value={subjectForm.subjectScore}

onChange={(e)=>

setSubjectForm({

...subjectForm,

subjectScore:e.target.value,

})

}

/>

</div>

<div className="hod_subject_popup_field">

<label>

Subject Type

</label>

<select

value={subjectForm.subjectType}

onChange={(e)=>

setSubjectForm({

...subjectForm,

subjectType:e.target.value,

})

}

>

<option value="Major">

Major

</option>

<option value="Non-Major">

Non-Major

</option>

</select>

</div>

</div>

</div>

{/* Footer */}

<div className="hod_subject_popup_footer">

<button

className="hod_subject_cancel_btn"

onClick={()=>{

setShowSubjectPopup(false);

resetSubjectForm();

setEditingSubject(null);

}}

>

Cancel

</button>

<button
  className="hod_subject_save_btn"
  onClick={saveSubject}
>
  {subjectMode === "create"
    ? "Create Subject"
    : "Update Subject"}
</button>

</div>

</div>

</div>

)
}

    </div>

  );

};

export default SubjectPage;
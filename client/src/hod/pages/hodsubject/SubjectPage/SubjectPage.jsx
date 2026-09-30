import React,{useEffect,useState} from "react";
import API from "../../../../api/axios";
import {toast} from "react-toastify";
import "./SubjectPage.css";

const SubjectPage=()=>{
const [programmes,setProgrammes]=useState([]);
const [loading,setLoading]=useState(false);

const [selectedProgramme,setSelectedProgramme]=useState(null);
const [programmeStructure,setProgrammeStructure]=useState(null);
const [structureExists,setStructureExists]=useState(false);
const [showStructureModal,setShowStructureModal]=useState(false);
const [structureLoading,setStructureLoading]=useState(false);

const [selectedStudyYear,setSelectedStudyYear]=useState(null);
const [selectedSemester,setSelectedSemester]=useState(null);

const [selectedSyllabusType,setSelectedSyllabusType]=useState("CURRENT");

const [subjects,setSubjects]=useState([]);
const [subjectLoading,setSubjectLoading]=useState(false);

const [showSubjectPopup,setShowSubjectPopup]=useState(false);
const [subjectMode,setSubjectMode]=useState("create");
const [editingSubject,setEditingSubject]=useState(null);

const [subjectForm,setSubjectForm]=useState({
subjectName:"",
subjectCode:"",
subjectScore:"",
subjectType:"Major"
});

/* =========================================================
   FETCH PROGRAMMES
========================================================= */

const fetchProgrammes=async()=>{
try{
setLoading(true);

const response=await API.get(
"/programmes/my-department"
);

setProgrammes(
response.data.data||[]
);

}catch(error){
console.error(
"FETCH PROGRAMMES ERROR:",
error
);

toast.error(
error.response?.data?.message||
"Failed to fetch programmes."
);

}finally{
setLoading(false);
}
};

/* =========================================================
   FETCH PROGRAMME STRUCTURE
========================================================= */

const fetchProgrammeStructure=async(programme)=>{
try{
setStructureLoading(true);

setSelectedProgramme(programme);

const response=await API.get(
`/subjects/programme/${programme._id}`
);

setProgrammeStructure(
response.data.data
);

setStructureExists(true);

setSelectedStudyYear(null);
setSelectedSemester(null);
setSelectedSyllabusType("CURRENT");
setSubjects([]);

setShowStructureModal(true);

}catch(error){

if(
error.response?.status===404&&
error.response?.data?.message===
"Programme structure not found."
){
setProgrammeStructure(null);
setStructureExists(false);

setSelectedStudyYear(null);
setSelectedSemester(null);
setSelectedSyllabusType("CURRENT");
setSubjects([]);

setShowStructureModal(true);

return;
}

console.error(
"FETCH PROGRAMME STRUCTURE ERROR:",
error
);

toast.error(
error.response?.data?.message||
"Failed to load programme structure."
);

}finally{
setStructureLoading(false);
}
};

/* =========================================================
   CREATE PROGRAMME STRUCTURE
========================================================= */

const createProgrammeStructure=async()=>{
if(!selectedProgramme?._id){
toast.error(
"Please select a programme first."
);
return;
}

try{
setStructureLoading(true);

const response=await API.post(
"/subjects/create-structure",
{
programmeId:selectedProgramme._id
}
);

toast.success(
response.data?.message||
"Programme structure created successfully."
);

setStructureExists(true);

await fetchProgrammeStructure(
selectedProgramme
);

}catch(error){
console.error(
"CREATE PROGRAMME STRUCTURE ERROR:",
error
);

toast.error(
error.response?.data?.message||
error.message||
"Failed to create programme structure."
);

}finally{
setStructureLoading(false);
}
};

/* =========================================================
   ADD SEMESTER
========================================================= */

const addSemester=async(studyYear)=>{
if(!selectedProgramme?._id)return;

try{
setStructureLoading(true);

await API.patch(
`/subjects/${selectedProgramme._id}/add-semester`,
{
studyYear
}
);

toast.success(
"Semester added successfully."
);

await fetchProgrammeStructure(
selectedProgramme
);

}catch(error){
console.error(
"ADD SEMESTER ERROR:",
error
);

toast.error(
error.response?.data?.message||
"Failed to add semester."
);

}finally{
setStructureLoading(false);
}
};

/* =========================================================
   REMOVE SEMESTER
========================================================= */

const removeSemester=async(
studyYear,
semesterNumber
)=>{
if(!selectedProgramme?._id)return;

try{
setStructureLoading(true);

await API.patch(
`/subjects/${selectedProgramme._id}/remove-semester`,
{
studyYear,
semesterNumber
}
);

toast.success(
"Semester removed successfully."
);

if(
selectedStudyYear===studyYear&&
selectedSemester===semesterNumber
){
setSelectedStudyYear(null);
setSelectedSemester(null);
setSubjects([]);
}

await fetchProgrammeStructure(
selectedProgramme
);

}catch(error){
console.error(
"REMOVE SEMESTER ERROR:",
error
);

toast.error(
error.response?.data?.message||
"Failed to remove semester."
);

}finally{
setStructureLoading(false);
}
};

/* =========================================================
   FETCH SUBJECTS
========================================================= */

const fetchSubjects=async(
studyYear,
semesterNumber,
syllabusType=selectedSyllabusType
)=>{
if(!selectedProgramme?._id)return;

try{
setSubjectLoading(true);

const response=await API.get(
`/subjects/getsubject/programme/${selectedProgramme._id}/study-year/${studyYear}/semester/${semesterNumber}?syllabusType=${syllabusType}`
);

setSelectedStudyYear(studyYear);
setSelectedSemester(semesterNumber);

setSubjects(
response.data.data||[]
);

}catch(error){
console.error(
"FETCH SUBJECTS ERROR:",
error
);

setSubjects([]);

toast.error(
error.response?.data?.message||
"Failed to fetch subjects."
);

}finally{
setSubjectLoading(false);
}
};

/* =========================================================
   SEMESTER CLICK
========================================================= */

const handleSemesterClick=(
studyYear,
semesterNumber
)=>{
setSelectedStudyYear(studyYear);
setSelectedSemester(semesterNumber);

setSelectedSyllabusType(
"CURRENT"
);

fetchSubjects(
studyYear,
semesterNumber,
"CURRENT"
);
};

/* =========================================================
   SYLLABUS CHANGE
========================================================= */

const handleSyllabusChange=(
syllabusType
)=>{
if(
selectedStudyYear===null||
selectedSemester===null
){
return;
}

setSelectedSyllabusType(
syllabusType
);

fetchSubjects(
selectedStudyYear,
selectedSemester,
syllabusType
);
};

/* =========================================================
   RESET SUBJECT FORM
========================================================= */

const resetSubjectForm=()=>{
setSubjectForm({
subjectName:"",
subjectCode:"",
subjectScore:"",
subjectType:"Major"
});
};

/* =========================================================
   OPEN CREATE SUBJECT
========================================================= */

const openCreateSubject=()=>{
if(
selectedStudyYear===null||
selectedSemester===null
){
toast.error(
"Please select a semester first."
);
return;
}

setEditingSubject(null);

setSubjectMode(
"create"
);

resetSubjectForm();

setShowSubjectPopup(
true
);
};

/* =========================================================
   OPEN EDIT SUBJECT
========================================================= */

const openEditSubject=(subject)=>{
setEditingSubject(subject);

setSubjectMode(
"update"
);

setSubjectForm({
subjectName:
subject.subjectName||"",

subjectCode:
subject.subjectCode||"",

subjectScore:
subject.subjectScore??"",

subjectType:
subject.subjectType||"Major"
});

setShowSubjectPopup(
true
);
};

/* =========================================================
   CLOSE SUBJECT POPUP
========================================================= */

const closeSubjectPopup=()=>{
setShowSubjectPopup(false);

setEditingSubject(null);

resetSubjectForm();
};

/* =========================================================
   SAVE / UPDATE SUBJECT
========================================================= */

const saveSubject=async()=>{
if(
!selectedProgramme?._id||
selectedStudyYear===null||
selectedSemester===null
){
toast.error(
"Please select a semester first."
);
return;
}

if(
!subjectForm.subjectName.trim()
){
toast.error(
"Subject name is required."
);
return;
}

if(
!subjectForm.subjectCode.trim()
){
toast.error(
"Subject code is required."
);
return;
}

if(
!subjectForm.subjectScore
){
toast.error(
"Maximum marks is required."
);
return;
}

try{

/* ============================
   UPDATE
============================ */

if(editingSubject){

await API.put(
`/subjects/update/${editingSubject._id}`,
{
subjectName:
subjectForm.subjectName.trim(),

subjectCode:
subjectForm.subjectCode
.trim()
.toUpperCase(),

subjectScore:
Number(
subjectForm.subjectScore
),

subjectType:
subjectForm.subjectType,

isActive:true
}
);

toast.success(
"Subject updated successfully."
);

}

/* ============================
   CREATE
============================ */

else{

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
subjectForm.subjectName.trim(),

subjectCode:
subjectForm.subjectCode
.trim()
.toUpperCase(),

subjectScore:
Number(
subjectForm.subjectScore
),

subjectType:
subjectForm.subjectType,

syllabusType:
selectedSyllabusType
}
);

toast.success(
`${selectedSyllabusType==="CURRENT"
?"Current"
:"Old"} syllabus subject created successfully.`
);

}

closeSubjectPopup();

await fetchSubjects(
selectedStudyYear,
selectedSemester,
selectedSyllabusType
);

}catch(error){
console.error(
"SAVE SUBJECT ERROR:",
error
);

toast.error(
error.response?.data?.message||
"Operation failed."
);
}
};

/* =========================================================
   DELETE SUBJECT
========================================================= */

const handleDeleteSubject=async(
subjectId
)=>{
const confirmed=
window.confirm(
"Are you sure you want to delete this subject?"
);

if(!confirmed)return;

try{

await API.delete(
`/subjects/delete/${subjectId}`
);

toast.success(
"Subject deleted successfully."
);

await fetchSubjects(
selectedStudyYear,
selectedSemester,
selectedSyllabusType
);

}catch(error){
console.error(
"DELETE SUBJECT ERROR:",
error
);

toast.error(
error.response?.data?.message||
"Failed to delete subject."
);
}
};

/* =========================================================
   INITIAL LOAD
========================================================= */

useEffect(()=>{
fetchProgrammes();
},[]);

/* =========================================================
   UI
========================================================= */

return(
<>
{/* =====================================================
    PORTRAIT ROTATE SCREEN
===================================================== */}

<div className="rotate-device-screen">

<div className="rotate-device-content">

<div className="rotate-device-illustration">

<div className="rotate-phone-portrait"></div>

<div className="rotate-arrow"></div>

<div className="rotate-phone-landscape"></div>

</div>

<h2 className="rotate-device-title">
ROTATE PHONE
</h2>

<p className="rotate-device-description">
This application works best in landscape mode
</p>

</div>

</div>

{/* =====================================================
    MAIN SUBJECT PAGE
===================================================== */}

<div className="subject-page">

{/* ===================================================
    PAGE HEADER
=================================================== */}

<div className="subject-page-header">

<div>

<h1>
Subject Management
</h1>

<p>
Manage programme semesters and syllabus subjects.
</p>

</div>

</div>

{/* ===================================================
    PROGRAMMES
=================================================== */}

<div className="programme-list">

{loading?(
<div className="page-loading">

<h3>
Loading Programmes...
</h3>

</div>
):programmes.length===0?(
<div className="page-empty">

<h3>
No programmes found.
</h3>

</div>
):(
programmes.map(
(programme)=>(
<button
type="button"
key={programme._id}
className="programme-card"
onClick={()=>
fetchProgrammeStructure(
programme
)
}
>

<h3>
{programme.programmeName}
</h3>

<div className="programme-card-code">
{programme.programmeCode}
</div>

<div className="programme-card-meta">

<span>
Type
</span>

<strong>
{programme.programmeType}
</strong>

</div>

<div className="programme-card-meta">

<span>
Duration
</span>

<strong>
{programme.duration} Years
</strong>

</div>

</button>
)
)
)}

</div>

{/* ===================================================
    PROGRAMME STRUCTURE MODAL
=================================================== */}

{showStructureModal&&(
<div className="structure-modal-overlay">

<div className="structure-modal">

<div className="structure-layout">

{/* =================================================
    LEFT SIDEBAR
================================================= */}

<aside className="structure-sidebar">

<div className="structure-sidebar-header">

<div>

<h2>
{selectedProgramme?.programmeName}
</h2>

<p>
Programme Structure
</p>

</div>

<button
type="button"
className="modal-close-btn"
onClick={()=>
setShowStructureModal(false)
}
>
×
</button>

</div>

{/* ===============================================
    STRUCTURE CONTENT
=============================================== */}

{structureLoading?(
<div className="structure-loading">

<p>
Loading...
</p>

</div>
):!structureExists?(
<div className="structure-empty">

<h3>
Programme Structure Not Created
</h3>

<p>
This programme does not have an academic structure yet.
</p>

<button
type="button"
className="create-structure-btn"
onClick={
createProgrammeStructure
}
>
+ Create Programme Structure
</button>

</div>
):(
<div className="structure-years">

{programmeStructure?.structure?.map(
(year)=>(
<div
className="year-section"
key={year.studyYear}
>

<div className="year-section-header">

<h3>
Year {year.studyYear}
</h3>

<button
type="button"
onClick={()=>
addSemester(
year.studyYear
)
}
>
+ Semester
</button>

</div>

<div className="semester-list">

{year.semesters?.length===0?(
<p className="no-semesters">
No Semester
</p>
):(
year.semesters.map(
(semester)=>(
<div
className="semester-row"
key={
semester.semesterNumber
}
>

<button
type="button"
className={`semester-btn ${
selectedStudyYear===
year.studyYear&&
selectedSemester===
semester.semesterNumber
?"active"
:""
}`}
onClick={()=>
handleSemesterClick(
year.studyYear,
semester.semesterNumber
)
}
>
Semester {
semester.semesterNumber
}
</button>

<button
type="button"
className="remove-semester-btn"
onClick={()=>
removeSemester(
year.studyYear,
semester.semesterNumber
)
}
>
×
</button>

</div>
)
)
)}

</div>

</div>
)
)}

</div>
)}

</aside>

{/* =================================================
    RIGHT SUBJECT WORKSPACE
================================================= */}

<section className="subject-workspace">

{/* ===============================================
    SUBJECT HEADER
=============================================== */}

<div className="subject-workspace-header">

<div className="subject-heading">

<h2>

{selectedSemester
?`Year ${selectedStudyYear} • Semester ${selectedSemester}`
:"Select a Semester"}

</h2>

<p>

{selectedSemester
?`Manage ${
selectedSyllabusType==="CURRENT"
?"current"
:"old"
} syllabus subjects.`
:"Choose a semester to manage subjects."}

</p>

</div>

{/* =============================================
    SYLLABUS + ADD BUTTONS
============================================= */}

{selectedSemester&&(
<div className="subject-header-actions">

<div className="syllabus-switch">

<button
type="button"
className={
selectedSyllabusType===
"CURRENT"
?"active"
:""
}
onClick={()=>
handleSyllabusChange(
"CURRENT"
)
}
>
Current Syllabus
</button>

<button
type="button"
className={
selectedSyllabusType===
"OLD"
?"active"
:""
}
onClick={()=>
handleSyllabusChange(
"OLD"
)
}
>
Old Syllabus
</button>

</div>

<button
type="button"
className="add-subject-btn"
onClick={
openCreateSubject
}
>
+ Add Subject
</button>

</div>
)}

</div>

{/* ===============================================
    SUBJECT WORKSPACE
=============================================== */}

<div className="subject-workspace-content">

{/* =============================================
    NO SEMESTER
============================================= */}

{selectedSemester===null?(
<div className="workspace-empty">

<div className="workspace-empty-icon">
📚
</div>

<h3>
Select a Semester
</h3>

<p>
Choose a semester from the left panel to manage its subjects.
</p>

</div>

):subjectLoading?(
<div className="workspace-loading">

<div className="loading-spinner"></div>

<p>
Loading Subjects...
</p>

</div>

):subjects.length===0?(
<div className="workspace-empty">

<div className="workspace-empty-icon">

{selectedSyllabusType===
"CURRENT"
?"📘"
:"📕"}

</div>

<h3>

No {
selectedSyllabusType===
"CURRENT"
?"Current"
:"Old"
} Syllabus Subjects

</h3>

<p>
There are no subjects created for this syllabus in the selected semester.
</p>

<button
type="button"
className="empty-add-btn"
onClick={
openCreateSubject
}
>
+ Create {
selectedSyllabusType===
"CURRENT"
?"Current"
:"Old"
} Subject
</button>

</div>

):(
<div className="subject-list">

{subjects.map(
(subject)=>(
<article
className="subject-card"
key={subject._id}
>

<div className="subject-card-top">

<div className="subject-info">

<span className="subject-code">
{subject.subjectCode}
</span>

<h3>
{subject.subjectName}
</h3>

</div>

<span className="subject-type">
{subject.subjectType}
</span>

</div>

<div className="subject-card-bottom">

<div className="subject-score">

<span>
Maximum Marks
</span>

<strong>
{subject.subjectScore}
</strong>

</div>

<div className="subject-actions">

<button
type="button"
className="edit-subject-btn"
onClick={()=>
openEditSubject(
subject
)
}
>
Edit
</button>

<button
type="button"
className="delete-subject-btn"
onClick={()=>
handleDeleteSubject(
subject._id
)
}
>
Delete
</button>

</div>

</div>

</article>
)
)}

</div>
)}

</div>

</section>

</div>

</div>

</div>
)}

{/* =====================================================
    CREATE / UPDATE SUBJECT POPUP
===================================================== */}

{showSubjectPopup&&(
<div className="subject-popup-overlay">

<div className="subject-popup">

{/* ===============================================
    POPUP HEADER
=============================================== */}

<div className="subject-popup-header">

<div>

<div className="popup-syllabus-badge">

{selectedSyllabusType===
"CURRENT"
?"CURRENT SYLLABUS"
:"OLD SYLLABUS"}

</div>

<h2>

{subjectMode==="create"
?"Create Subject"
:"Update Subject"}

</h2>

<p>

{subjectMode==="create"
?`This subject will be created under the ${
selectedSyllabusType==="CURRENT"
?"current"
:"old"
} syllabus.`
:"Update the selected subject details."}

</p>

</div>

<button
type="button"
className="popup-close-btn"
onClick={
closeSubjectPopup
}
>
×
</button>

</div>

{/* ===============================================
    POPUP BODY
=============================================== */}

<div className="subject-popup-body">

<div className="subject-form-grid">

{/* SUBJECT NAME */}

<div className="form-field full-width">

<label>
Subject Name
</label>

<input
type="text"
value={
subjectForm.subjectName
}
placeholder="Enter subject name"
onChange={(e)=>
setSubjectForm(
(prev)=>({
...prev,
subjectName:
e.target.value
})
)
}
/>

</div>

{/* SUBJECT CODE */}

<div className="form-field">

<label>
Subject Code
</label>

<input
type="text"
value={
subjectForm.subjectCode
}
placeholder="Enter subject code"
onChange={(e)=>
setSubjectForm(
(prev)=>({
...prev,
subjectCode:
e.target.value
.toUpperCase()
})
)
}
/>

</div>

{/* MAXIMUM MARKS */}

<div className="form-field">

<label>
Maximum Marks
</label>

<input
type="number"
min="1"
value={
subjectForm.subjectScore
}
placeholder="100"
onChange={(e)=>
setSubjectForm(
(prev)=>({
...prev,
subjectScore:
e.target.value
})
)
}
/>

</div>

{/* SUBJECT TYPE */}

<div className="form-field full-width">

<label>
Subject Type
</label>

<select
value={
subjectForm.subjectType
}
onChange={(e)=>
setSubjectForm(
(prev)=>({
...prev,
subjectType:
e.target.value
})
)
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

{/* ===============================================
    POPUP FOOTER
=============================================== */}

<div className="subject-popup-footer">

<button
type="button"
className="cancel-btn"
onClick={
closeSubjectPopup
}
>
Cancel
</button>

<button
type="button"
className="save-btn"
onClick={
saveSubject
}
>
{
subjectMode==="create"
?"Create Subject"
:"Update Subject"
}
</button>

</div>

</div>

</div>
)}

</div>
</>
);
};

export default SubjectPage;
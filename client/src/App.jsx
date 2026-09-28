import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import "./App.css"
// Auth Guard
import RoleProtectedRoute from "./protectedRoute/RoleProtectedRoute"; // Ensure folder name case matches exact directory

// Layouts
import HRLayout from "./hr/components/Layout/HRLayout";
import AddmissioncellLayout from "./addmissioncell/component/layout/AddmissioncellLayout";
import Layout from "./principal/component/layout/Layout";
import HodLayout from "./hod/component/layout/HodLayout";
import FacultyLayout from "./faculty/component/layout/FacultyLayout";

// Login Page
import LoginPage from "./loginpage/LoginPage";

// HR Pages
import Facultypage from "./hr/pages/faculty/Facultypage";
import FacultyProfile from "./hr/pages/faculty/facultyprofile/FacultyProfile";
import FacultyBin from "./hr/pages/faculty/bin/FacultyBin";
import BusDriver from "./hr/pages/bus driver/BusDriver";
import BusDriverProfile from "./hr/pages/bus driver/BusDriverProfile/BusDriverProfile";
import BusDriverBin from "./hr/pages/bus driver/bin/BusDriverBin";
import BusInfo from "./hr/pages/bus info/BusInfo";
import BusInfoBin from "./hr/pages/bus info/bin/BusInfoBin";
import BusInfoProfile from "./hr/pages/bus info/singlebusinfo/BusInfoProfile";
import BusRoutePage from "./hr/pages/route creation/BusRoutePage";
import BusRouteBin from "./hr/pages/route creation/bin/BusRouteBin";
import StudentAssignmentBus from "./hr/pages/stdbusassign/StudentAssignmentBus";

// Admission Cell Pages
import HomePage from "./addmissioncell/pages/homepage/HomePage";
import Batch from "./addmissioncell/pages/batch/Batch";
import BinBatch from "./addmissioncell/pages/batch/bin/BinBatch";
import Enquiry from "./addmissioncell/pages/enquiry/Enquiry";
import EnquiryView from "./addmissioncell/pages/enquiry/EnquiryView/EnquiryView";
import AddmissioncellProfile from "./addmissioncell/component/profile/Addmissioncellprofile";
import Recyclebinenquiry from "./addmissioncell/pages/enquiry/bin/Recyclebinenquiry"






// hod 
import SubjectPage from "./hod/pages/hodsubject/SubjectPage/SubjectPage"
import TimetableClassPage from "./hod/pages/timetable/TimetableClassPage"
import AttendancePage from "./hod/pages/AttendancePage/AttendancePage"
// import IDCardStudentList from "./hod/pages/IDCardStudentList/IDCardStudentList"
import IDCardStudentList  from "./hod/pages/IDCardStudentList/IDCardStudentList"
// OFFICE

import OfficeLayout from "./office/component/officelayout/OfficeLayout";
import Officehome from "./office/pages/homepage/Officehome";
import IDCardTemplates from "./office/IDCard/pages/IDCardTemplates/IDCardTemplates";

// Other Role Pages
import Principalhomepage from "./principal/pages/homepage/Principalhomepage";
import HodHomepage from "./hod/pages/homepage/HodHomepage";
import FacultyHomepage from "./faculty/pages/homepage/FacultyHomepage";
import ConvertedEnquiry from "./addmissioncell/pages/ConvertedEnquiry/ConvertedEnquiry";
import ClassAllocation from "./addmissioncell/pages/ClassAllocation/ClassAllocation"
import ClassManagement from "./addmissioncell/pages/ClassAllocation/class-management/ClassManagement"
import StudentCreate from "./addmissioncell/pages/StudentCreate/StudentCreate";
import AcchomePage from "./accountant/pages/homepages/AcchomePage";
import CashierHomepage from "./cashier/pages/homepage/CashierHomepage";
import FeeStructure from "./accountant/pages/FeeStructure/FeeStructure";
import FeeStructureBin from "./accountant/pages/FeeStructure/FeeStructureBin/FeeStructureBin";
import AccountantLayout from "./accountant/component/layout/AccountantLayout";
import FeeAllocation from "./accountant/pages/FeeAllocation/FeeAllocation";
import ClassFeeDetails from "./accountant/pages/ClassFeeDetails/ClassFeeDetails"
import StudentFeeDetails from "./accountant/pages/StudentFeeDetails/StudentFeeDetails";
import PaymentCollection from "./accountant/pages/PaymentCollection/PaymentCollection"
import SubjectRecycleBin from "./hod/pages/hodsubject/SubjectRecycleBin/SubjectRecycleBin";
import AcademicSession from "./hod/pages/AcademicSession/AcademicSession";
import TimetablePage from "./hod/pages/TimetablePage/TimetablePage";
import ExamResultPage from "./hod/pages/ExamResultPage/ExamResultPage";
import IDCardDesigner from "./office/IDCard/pages/IDCardDesigner";
import ExamHomepage from "./examcell/pages/homepage/ExamHomepage";
import ExamcellLayout from "./examcell/component/layout/ExamcellLayout";
import ExamHallPage from "./examcell/pages/examhall/ExamHallPage";
import ExamhallList from "./examcell/pages/examhalllist/ExamhallList";
import DeskArrangement from "./examcell/pages/DeskArrangement/DeskArrangement";
import HallList from "./examcell/pages/deskalocation/halllist/HallList"
import ExamHallAllocation from "./examcell/pages/deskalocation/ExamHallAllocation/ExamHallAllocation";
import ExamTitlePage from "./examcell/pages/examtitle/ExamTitlePage"


import SingleFacultyProfile from "./principal/pages/SingleFacultyProfile/SingleFacultyProfile";
import SingleStudentProfile from "./principal/pages/principalSingleStudentProfile/SingleStudentProfile";


import LibaryLayout from "./library/component/layout/LibraryLayout"
import Libraryhomepage from "./library/pages/home/Libraryhomepage"
import Bookcurd from "./library/pages/bookcurd/Bookcurd";
import LibraryFaculty from "./library/pages/libraryfaculty/LibraryFaculty";
import LibraryStudent from "./library/pages/librarystudent/LibraryStudent";
import BookrecycleBin from "./library/pages/bookrecyclebin/BookrecycleBin";
import BookbulkUploadandUpdate from "./library/component/bulkbook/BookbulkUploadandUpdate";
import LibraryLayout from "./library/component/layout/LibraryLayout";

import BookHolder from "./library/pages/bookholder/BookHolder";
import StudentPage from "./principal/pages/student/PrincipalStudentPage";
import FinancePage from "./principal/pages/finance/PrincipalFinancePage";
import PrincipalFacultyPage from "./principal/pages/faculty/PrincipalFacultyPage";
import PrincipalStudentPage from "./principal/pages/student/PrincipalStudentPage";
import PrincipalFinancePage from "./principal/pages/finance/PrincipalFinancePage";
import PrincipalExamResult from "./principal/pages/examresult/PrincipalExamResult";
import TransportationPage from "./principal/pages/transportation/TransportationPage";
import ConvertedStudentProfile from "./addmissioncell/pages/ConvertedStudentProfile/ConvertedStudentProfile";
import AddmissioncellStudentProfile from "./addmissioncell/pages/addmissioncellstudentprofile/AddmissioncellStudentProfile";
import DepartmentStudents from "./hod/pages/DepartmentStudents/DepartmentStudents";
import MyDepartmentFaculty from "./hod/pages/MyDepartmentFaculty/MyDepartmentFaculty";
// import FacultyProfile from "./hod/pages/FacultyProfile/FacultyProfile"
import HodFacultyProfile from "./hod/pages/FacultyProfile/HodFacultyProfile"
import StudentProfile from "./hod/pages/StudentProfile/StudentProfile";
import HodMyClass from "./hod/pages/HodMyClass/HodMyClass";
import InternalMarkEntry from "./hod/pages/InternalMarkEntry/InternalMarkEntry"
import MyProfile from "./hod/pages/MyProfile/MyProfile";
import ClubPage from "./hod/pages/ClubPage/ClubPage";
import MasterTimetable from "./examcell/pages/MasterTimetable/MasterTimetable";
import MasterTimetableList from "./examcell/pages/MasterTimetableList/MasterTimetableList";
import ClubLogin from "./hod/pages/ClubLogin/ClubLogin";
import DepartmentPage from "./principal/pages/DepartmentPage/DepartmentPage";
import PrincipalProgrammePage from "./principal/pages/ProgrammePage/PrincipalProgrammePage";
import PrincipalProfile from "./principal/pages/PrincipalProfile/PrincipalProfile";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Login Route */}
        <Route path="/" element={<LoginPage />} />

        {/* HR Routes */}
        <Route
          path="/hr"
          element={
            <RoleProtectedRoute allowedRoles={["hr"]}>
              <HRLayout />
            </RoleProtectedRoute>
          }
        >
          <Route index element={<Facultypage />} />
          <Route path="bin" element={<FacultyBin />} />
          <Route path="faculty/profile/:id" element={<FacultyProfile />} />
          <Route path="BusDriver" element={<BusDriver />} />
          <Route path="BusDriver/profile/:id" element={<BusDriverProfile />} />
          <Route path="BusDriver/bin" element={<BusDriverBin />} />
          <Route path="BusInfo" element={<BusInfo />} />
          <Route path="BusInfo/bin" element={<BusInfoBin />} />
          <Route path="BusInfo/profile/:id" element={<BusInfoProfile />} />
          <Route path="BusRoutePage" element={<BusRoutePage />} />
          <Route path="BusRoutePage/bin" element={<BusRouteBin />} />
          <Route path="studentbus" element={<StudentAssignmentBus />} />
        </Route>


 {/* accountant Routes */}
        <Route
          path="/accountant"
          element={
            <RoleProtectedRoute allowedRoles={["accountant"]}>
              <AccountantLayout />
            </RoleProtectedRoute>
          }
        >
          <Route index element={<AcchomePage />} />
          <Route path="FeeStructure" element={<FeeStructure />} />
          {/* fees strucutre bin  */}
          <Route path="FeeStructure/bin" element={<FeeStructureBin />} />
          {/* fees assign  */}
          <Route path="FeeAllocation" element={<FeeAllocation />} />
          {/* fetch class static  */}
          <Route path="ClassFeeDetails" element={<ClassFeeDetails />} />
{/* single student fees info  */}
<Route path="student-fees/:studentId"element={<StudentFeeDetails />}/>
{/* cash counter */}
<Route path="PaymentCollection"element={<PaymentCollection />}/>

          <Route path="faculty/profile/:id" element={<FacultyProfile />} />
          <Route path="BusDriver" element={<BusDriver />} />
        </Route>

         {/* cashier Routes */}
        <Route
          path="/cashier"
          element={
            <RoleProtectedRoute allowedRoles={["cashier"]}>
              <Layout />
            </RoleProtectedRoute>
          }
        >
          <Route index element={<CashierHomepage />} />
          <Route path="bin" element={<FacultyBin />} />
          <Route path="faculty/profile/:id" element={<FacultyProfile />} />
          <Route path="BusDriver" element={<BusDriver />} />
        </Route>





        {/* Admission Cell Routes */}
{/* Admission Cell Routes */}
<Route
  path="/admission-cell"
  element={
    <RoleProtectedRoute allowedRoles={["admission_officer"]}>
      <AddmissioncellLayout />
    </RoleProtectedRoute>
  }
>
  <Route index element={<HomePage />} />

  <Route path="batch" element={<Batch />} />

  <Route path="batchbin" element={<BinBatch />} />

  <Route path="Enquiry" element={<Enquiry />} />

  <Route
    path="Enquiry/:id"
    element={<EnquiryView />}
  />

  <Route
    path="Enquiry/bin"
    element={<Recyclebinenquiry />}
  />

  {/* Conversion */}
  <Route
    path="Convertion"
    element={<ConvertedEnquiry />}
  />

  <Route
    path="Convertion/:id"
    element={<ConvertedStudentProfile />}
  />

  {/* Class Allocation */}
  <Route
    path="classAllocation"
    element={<ClassAllocation />}
  />

  {/* Class Management */}
  <Route
    path="class-management/:classId"
    element={<ClassManagement />}
  />

  {/* Single Student Profile */}
  <Route
    path="student/:id"
    element={<AddmissioncellStudentProfile />}
  />

  {/* Student Create */}
  <Route
    path="createstudent"
    element={<StudentCreate />}
  />

  <Route
    path="BusDriver"
    element={<BusDriver />}
  />

  <Route
    path="profile"
    element={<AddmissioncellProfile />}
  />
</Route>

        {/* Principal Routes */}
        <Route
          path="/principal"
          element={
            <RoleProtectedRoute allowedRoles={["principal"]}>
              <Layout />
            </RoleProtectedRoute>
          }
        >
          <Route index element={<Principalhomepage />} />

          <Route path="Facultypage" element={<PrincipalFacultyPage />} />


            {/* Single Faculty Profile */}
  <Route
    path="faculty/:id"
    element={<SingleFacultyProfile />}
  />

  
<Route
  path="StudentPage"
  element={<PrincipalStudentPage />}
/>

<Route
  path="StudentPage/:studentId"
  element={<SingleStudentProfile />}
/>
          <Route path="FinancePage" element={<PrincipalFinancePage />} />
          <Route path="ExamResultPage" element={<PrincipalExamResult />} />

          <Route path="DepartmentPage" element={<DepartmentPage />} />

          <Route path="PrincipalProgrammePage" element={<PrincipalProgrammePage />} />


          <Route path="transportation" element={<TransportationPage />} />

          

          

         
          <Route path="PrincipalProfile" element={<PrincipalProfile />} />
        </Route>

        {/* HOD Routes */}
{/* HOD Routes */}
<Route
  path="/hod"
  element={
    <RoleProtectedRoute allowedRoles={["hod"]}>
      <HodLayout />
    </RoleProtectedRoute>
  }
>
  <Route index element={<HodHomepage />} />

  <Route path="bin" element={<FacultyBin />} />

  <Route
    path="AcademicSession"
    element={<AcademicSession />}
  />

  <Route
    path="SubjectPage"
    element={<SubjectPage />}
  />

  <Route
    path="SubjectPage/bin"
    element={<SubjectRecycleBin />}
  />

  <Route
    path="TimetableClassPage"
    element={<TimetableClassPage />}
  />

  {/* IMPORTANT: relative path */}
  <Route
    path="timetable/:classId"
    element={<TimetablePage />}
  />

  <Route
    path="AttendancePage"
    element={<AttendancePage />}
  />

  <Route
    path="ExamResultPage"
    element={<ExamResultPage />}
  />

  <Route
    path="DepartmentStudents"
    element={<DepartmentStudents />}
  />

    <Route
    path="DepartmentStudents"
    element={<DepartmentStudents />}
  />

<Route 
  path="students/profile/:studentId" 
  element={<StudentProfile />} 
/>



  <Route
    path="MyDepartmentFaculty"
    element={<MyDepartmentFaculty />}
  />

  {/* FACULTY PROFILE */}
  <Route
    path="department-faculty/:id"
    element={<HodFacultyProfile />}
  />

    <Route
    path="myclass"
    element={<HodMyClass />}
  />





      <Route
    path="InternalMarkEntry"
    element={<InternalMarkEntry/>}
  />


      <Route
    path="MyProfile"
    element={<MyProfile/>}



  />



  <Route
    path="IDCardStudentList"
    element={<IDCardStudentList />}
  />
</Route>



<Route
  path="/club/login"
  element={<ClubLogin />}
/>

<Route
  path="/club/:clubId"
  element={<ClubPage />}
/>





        {/* Professor / Faculty Routes */}
        <Route
          path="/professor"
          element={
            <RoleProtectedRoute allowedRoles={["professor"]}>
              <FacultyLayout />
            </RoleProtectedRoute>
          }
        >
          <Route index element={<FacultyHomepage />} />
          <Route path="bin" element={<FacultyBin />} />
          <Route path="faculty/profile/:id" element={<FacultyProfile />} />
          <Route path="BusDriver" element={<BusDriver />} />
        </Route>



                {/*office*/}
        <Route
          path="/office_assistant"
          element={
            <RoleProtectedRoute allowedRoles={["office_assistant"]}>
              <OfficeLayout />
            </RoleProtectedRoute>
          }
        >
          <Route index element={<Officehome />} />

          <Route
  path="IDCardTemplates"
  element={<IDCardTemplates />}
/>


<Route
  path="IDCardDesigner/:templateId?"
  element={<IDCardDesigner />}
/>

          
          <Route path="faculty/profile/:id" element={<FacultyProfile />} />
          <Route path="BusDriver" element={<BusDriver />} />
        </Route>


                {/*library*/}

                <Route
          path="/library"
          element={
            <RoleProtectedRoute allowedRoles={["librarian"]}>
              <LibraryLayout/>
            </RoleProtectedRoute>
          }
        >
          <Route index element={<Libraryhomepage/>} />


          <Route path="booklist" element={<Bookcurd />} />

<Route
  path="book/:bookId"
  element={<BookHolder />}
/>

          <Route path="BookrecycleBin" element={<BookrecycleBin />} />

          <Route path="BookbulkUploadandUpdate" element={<BookbulkUploadandUpdate />} />


          <Route path="LibraryFaculty" element={<LibraryFaculty />} />
          <Route path="LibraryStudent" element={<LibraryStudent />} />


          
          <Route path="faculty/profile/:id" element={<FacultyProfile />} />
          <Route path="BusDriver" element={<BusDriver />} />
        </Route>




{/* exam cell */}
              <Route
          path="/examcell"
          element={
            <RoleProtectedRoute allowedRoles={["examcell"]}>
              <ExamcellLayout />
            </RoleProtectedRoute>
          }
        >
          <Route index element={<ExamHomepage />} />


          <Route path="examtitle" element={<ExamTitlePage />} />

          <Route path="ExamHallPage" element={<ExamHallPage />} />
          <Route path="ExamhallList" element={<ExamhallList />} />
      <Route path=":hallId/desk-arrangement"element={<DeskArrangement />}/>

          {/* <Route path="MasterTimetableList" element={<MasterTimetableList />} /> */}


      <Route
  path="master-timetables"
  element={
    <MasterTimetableList />
  }
/>

<Route
  path="master-timetables/create"
  element={
    <MasterTimetable />
  }
/>

<Route
  path="master-timetables/:id"
  element={
    <MasterTimetable />
  }
/>



<Route
  path=":examSessionId/HallList"
  element={<HallList />}
/>
<Route
  path=":examSessionId/hall/:hallId/allocation"
  element={<ExamHallAllocation />}
/>





          
          <Route path="faculty/profile/:id" element={<FacultyProfile />} />
          <Route path="BusDriver" element={<BusDriver />} />
        </Route>

        {/* Fallback Catch-All Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
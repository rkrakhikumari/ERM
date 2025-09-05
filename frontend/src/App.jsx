import { Routes, Route, Outlet } from "react-router-dom";
import Register from "./components/Register";
import Login from "./components/Login";
import ResetRequest from "./components/ResetRequest";
import ResetPassword from "./components/ResetPassword";
import Profile from "./components/Profile/Profile";

import EmployeesList from "./components/Employees/EmployeesList";
import EmployeeForm from "./components/Employees/EmployeeForm";
import EmployeeDetail from "./components/Employees/EmployeeDetail";

import ProjectsLayout from "./components/Projects/ProjectsLayout";
import ProjectList from "./components/Projects/ProjectList";
import ProjectForm from "./components/Projects/ProjectForm";
import ProjectDetail from "./components/Projects/ProjectDetail";
import ProjectAssignment from "./components/Projects/ProjectAssignment";
import TasksList from "./components/Projects/TasksList";
import AddTaskForm from "./components/Projects/AddTaskForm";
import EditTaskForm from "./components/Projects/EditTaskForm";

import TeamsLayout from "./components/Teams/TeamsLayout";
import TeamList from "./components/Teams/TeamList";
import TeamForm from "./components/Teams/TeamForm";
import TeamDetail from "./components/Teams/TeamDetail";

import PayrollLayout from "./components/Payroll/PayrollLayout";
import PayrollDashboard from "./components/Payroll/PayrollDashboard";

import Layout from "./components/Layout";
import ProtectedRoute from "./auth/ProtectedRoute";
import "./App.css";

import LeaveManagement from "./components/Leave/LeaveManagement";

import MyAttendance from './components/Attendance/MyAttendance';
import MyTimesheets from './components/Timesheets/MyTimesheets';
import EmployeeTimesheets from './components/Timesheets/EmployeeTimesheets';
import AdminAttendanceLogs from './components/Attendance/AdminAttendanceLogs';

import AssetsLayout from "./components/Assets/AssetsLayout";
import AssetList from "./components/Assets/AssetList";
import AssetRequestForm from "./components/Assets/AssetRequestForm";
import EmployeeAssets from "./components/Assets/EmployeeAssets";
import AssetForm from "./components/Assets/AssetForm"; 
import AssetRequestsList from "./components/Assets/AssetRequestsList";

import PerformanceLayout from "./components/Performance/PerformanceLayout";
import CreateReviewCycle from "./components/Performance/CreateReviewCycle";
import DefineGoals from "./components/Performance/DefineGoals";
import ViewGoals from "./components/Performance/ViewGoals";
import SubmitFeedback from "./components/Performance/SubmitFeedback";
import ReviewSummary from "./components/Performance/ReviewSummary";
import ExportReview from "./components/Performance/ExportReview";

import NotificationList from './components/Notification/NotificationList';

import Dashboard from "./components/Admin/Dashboard";
import Settings from "./components/Admin/Settings";
import Metrics from "./components/Admin/Metrics";
function EmployeesLayout() {
  return (
    <div className="">
      <Outlet />
    </div>
  );
}

function PerformanceOutlet() {
  return <Outlet />;
}

function App() {
  return (
    <Routes>
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/reset-request" element={<ResetRequest />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route
        element={
          <ProtectedRoute>
            <div className="min-h-screen">
              <Layout />
            </div>
          </ProtectedRoute>
        }
      >

        <Route path="/attendance" element={<MyAttendance />} />
        <Route path="/timesheets" element={<MyTimesheets />} />
        <Route path="/timesheets/:employeeId" element={<EmployeeTimesheets />} />
        <Route path="/admin/attendance-logs" element={<AdminAttendanceLogs />} />

        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/admin/settings" element={<Settings />} />
        <Route path="/admin/metrics" element={<Metrics />} />

        <Route path="/profile" element={<Profile />} />


        <Route path="/assets" element={<AssetsLayout />}>
          <Route index element={<AssetList />} />
          <Route path="new" element={<AssetForm />} /> 
          <Route path="requests" element={<AssetRequestsList/>} />
          <Route path=":employeeId" element={<EmployeeAssets />} />
          <Route path="request" element={<AssetRequestForm />} />
        </Route>

        <Route path="/payroll" element={<PayrollLayout />}>
          <Route index element={<PayrollDashboard />} />
        </Route>

        <Route path="/employees" element={<EmployeesLayout />}>
          <Route path="/employees" element={<EmployeesList />} />
          <Route path="new" element={<EmployeeForm />} />
          <Route path="edit/:id" element={<EmployeeForm />} />
          <Route path=":id" element={<EmployeeDetail />} />
        </Route>

        <Route path="/projects" element={<ProjectsLayout />}>
          <Route index element={<ProjectList />} />
          <Route path="new" element={<ProjectForm />} />
          <Route path=":id" element={<ProjectDetail />} />
          <Route path=":id/tasks" element={<TasksList />} />
          <Route path=":id/tasks/new" element={<AddTaskForm />} />
          <Route path=":id/assign" element={<ProjectAssignment />} />
        </Route>
        <Route path="tasks/:task_id/edit" element={<EditTaskForm />} />

        <Route path="/teams" element={<TeamsLayout />}>
          <Route index element={<TeamList />} />
          <Route path="new" element={<TeamForm />} />
          <Route path=":id" element={<TeamDetail />} />
        </Route>

        <Route path="/leaves" element={<LeaveManagement />} />
        <Route path="/notification" element={<NotificationList />} />

        <Route path="/performance/*" element={<PerformanceLayout />}>
          <Route path="create-cycle" element={<CreateReviewCycle />} />
          <Route path="define-goals" element={<DefineGoals />} />
          <Route path="view-goals" element={<ViewGoals />} />
          <Route path="submit-feedback" element={<SubmitFeedback />} />
          <Route path="summary" element={<ReviewSummary />} />
          <Route path="export" element={<ExportReview />} />
        </Route>
      </Route>
      <Route path="*" element={<Login />} />
    </Routes>
  );
}

export default App;
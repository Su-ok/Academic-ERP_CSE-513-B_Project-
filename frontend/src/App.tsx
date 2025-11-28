import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import AuthCallback from "./pages/AuthCallback";
import InvalidAccess from "./pages/InvalidAccess";
import Employee from "./pages/Employee";
import ProtectedRoute from "./components/ProtectedRoute";
import ViewBills from "./pages/bills/ViewBills";
import AddBill from "./pages/bills/AddBill";
import UpdateBill from "./pages/bills/UpdateBill";
import DeleteBill from "./pages/bills/DeleteBill";
import AssignToRoll from "./pages/studentbills/AssignToRoll";
import AssignToDomain from "./pages/studentbills/AssignToDomain";
import StudentBillsView from "./pages/studentbills/StudentBillsView";
import DeleteStudentBill from "./pages/studentbills/DeleteStudentBill";
import DeleteSpecificBill from "./pages/studentbills/DeleteSpecificBill";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/oauth-callback" element={<AuthCallback />} />
        <Route
          path="/invalid-access"
          element={
            <ProtectedRoute>
              <InvalidAccess />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employee"
          element={
            <ProtectedRoute requireFinance={true}>
              <Employee />
            </ProtectedRoute>
          }
        >
          <Route path="bills/all" element={<ViewBills />} />
          <Route path="bills/add" element={<AddBill />} />
          <Route path="bills/update" element={<UpdateBill />} />
          <Route path="bills/delete" element={<DeleteBill />} />
          <Route path="student-bills/assign-roll" element={<AssignToRoll />} />
          <Route path="student-bills/assign-domain" element={<AssignToDomain />} />
          <Route path="student-bills/view" element={<StudentBillsView />} />
          <Route path="student-bills/delete-student" element={<DeleteStudentBill />} />
          <Route path="student-bills/delete-specific" element={<DeleteSpecificBill />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

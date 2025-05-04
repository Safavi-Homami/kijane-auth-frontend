import React from "react";
import { Routes, Route } from "react-router-dom";
import CourseList from "./pages/CourseList";
import CourseDetail from "./pages/CourseDetail";
import ArrayMethodsDemo from "./pages/ArrayMethodsDemo";
import AddCourseForm from "./pages/AddCourseForm";

import "./App.css";

function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<CourseList />} />
        <Route path="/courses/:id" element={<CourseDetail />} />
        <Route path="/arrays" element={<ArrayMethodsDemo />} />
        <Route path="/add-course" element={<AddCourseForm />} />

      </Routes>
    </div>
  );
}

export default App;

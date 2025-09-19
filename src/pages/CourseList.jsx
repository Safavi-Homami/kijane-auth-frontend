import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../CourseStyles.css";
import api from "../api"; // deine konfigurierte Axios-Instanz

// ✅ shadcn/ui – nur UI, keine Logikänderung
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function CourseList() {
  const [courses, setCourses] = useState([]);
  const [roles, setRoles] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    console.log("Token:", token);

    // Kurse laden (wie vorher)
    api
      .get("/courses")
      .then((response) => setCourses(response.data))
      .catch((error) => console.error("Fehler beim Laden der Kurse:", error));

    // Rollen laden (wie vorher)
    if (token) {
      api
        .get("/auth/me")
        .then((response) => {
          const userRoles = response.data.roles || [];
          console.log("User-Rollen:", userRoles);
          setRoles(userRoles);
        })
        .catch((error) => console.error("Fehler beim Laden der Rolle:", error));
    }
  }, []);

  const canAddCourse =
    roles.includes("ADMIN") ||
    roles.includes("MANAGER") ||
    roles.includes("EDITOR");

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-xl md:text-2xl font-semibold">Kurse</h1>

          {canAddCourse && (
            <Button asChild>
              <Link to="/add-course">+ Neuen Kurs hinzufügen</Link>
            </Button>
          )}
        </div>

        {/* Laden/leer wie zuvor – nur optisch angenehmer */}
        {courses.length === 0 ? (
          <p className="mt-6 text-slate-600">Lade Kurse...</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-6">
            {courses.map((course, i) => {
              const id = course.id ?? i;
              return (
                <Card
                  key={id}
                  className="rounded-2xl shadow-sm hover:shadow-md transition"
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base line-clamp-2">
                      {course.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-slate-600 line-clamp-3">
                      {course.description}
                    </p>

                    <Button
                      className="w-full"
                      onClick={() => navigate(`/courses/${course.id}`)}
                    >
                      Details ansehen
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default CourseList;

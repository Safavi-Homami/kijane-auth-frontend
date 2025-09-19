import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api";

// ✅ shadcn/ui – nur UI, keine Logikänderung
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function CourseDetail() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    console.log("🪪 Token in CourseDetail:", token);

    api
      .get(`/courses/${id}`)
      .then((response) => {
        console.log("✅ Kurs geladen:", response.data);
        setCourse(response.data);
      })
      .catch((error) => {
        console.error("❌ Fehler beim Laden des Kurses:", error);
        if (error.response) {
          console.error("📛 Status:", error.response.status);
          console.error("📛 Header:", error.config.headers);
          if (error.response.status === 401) {
            alert("⚠️ Nicht autorisiert – bitte erneut einloggen.");
          } else if (error.response.status === 403) {
            alert("🚫 Zugriff verweigert.");
          }
        }
      });
  }, [id]);

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100">
        <div className="mx-auto max-w-4xl px-4 py-10">
          <p className="text-slate-600">Lade Kursdetails...</p>
        </div>
      </div>
    );
  }

  console.log("📦 Aktueller Kurs im Render:", course);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100">
      <div className="mx-auto max-w-4xl px-4 py-10">
        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl md:text-2xl">
              {course.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-700">{course.description}</p>

            {Array.isArray(course.authorNames) && course.authorNames.length > 0 && (
              <div>
                <h4 className="font-semibold mb-1">Autoren</h4>
                <ul className="list-disc ml-5 text-slate-700">
                  {course.authorNames.map((name, index) => (
                    <li key={index}>{name}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="pt-2">
              <Button asChild variant="outline">
                <Link to="/courses">Zurück zur Kursliste</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default CourseDetail;

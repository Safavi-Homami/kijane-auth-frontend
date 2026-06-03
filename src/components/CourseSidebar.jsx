import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";


function CourseSidebar({ course }) {
  if (!course) return null;

  return (
    <Card className="rounded-2xl shadow-md sticky top-24 overflow-hidden">

      {/* 🔥 COURSE IMAGE */}
      {course.imageUrl && (
        <img
          src={`http://localhost:8080${course.imageUrl}`}
          alt={course.title}
          className="w-full h-40 object-cover"
        />
      )}

      <CardContent className="space-y-4 p-4">

        {/* 🔥 TITLE */}
        <h2 className="text-lg font-semibold text-center">
          {course.title}
        </h2>

      
        {/* 🔥 BASIC INFOS */}
        <div className="space-y-1 text-sm text-slate-600">

          {course.rating && (
            <p>⭐ {course.rating}</p>
          )}

          {course.duration && (
            <p>⏱ {course.duration}</p>
          )}

          {course.lectureCount && (
            <p>🎬 {course.lectureCount} Lectures</p>
          )}

        </div>

      </CardContent>
    </Card>
  );
}

export default CourseSidebar;
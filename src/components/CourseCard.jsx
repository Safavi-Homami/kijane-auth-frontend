import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function CourseCard({ course, onOpen }) {
  const title =
    course.title || course.name || course.courseName || "Unbenannter Kurs";
  const desc =
    course.description || course.summary || "Keine Beschreibung vorhanden.";
  const trainer =
    course.trainer?.name || course.lecturer?.name || course.trainerName || "";
  const id = course.id ?? course.courseId ?? course.slug ?? null;

  const startRaw = course.startDate || course.startsAt || course.begin;
  const start = startRaw
    ? new Date(startRaw).toLocaleDateString()
    : null;

  return (
    <Card className="rounded-2xl shadow-sm hover:shadow-md transition">
      <CardHeader className="pb-2">
        <CardTitle className="text-base line-clamp-2">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-slate-600 line-clamp-3">{desc}</p>

        <div className="text-xs text-slate-500">
          {trainer ? <>Trainer: <b>{trainer}</b><br/></> : null}
          {start ? <>Start: <b>{start}</b></> : null}
        </div>

        <Button className="w-full mt-2" onClick={onOpen} disabled={!onOpen}>
          Details ansehen
        </Button>

        {!id && (
          <div className="text-[11px] text-slate-400 mt-1">
            Hinweis: Kein ID-Feld gefunden – Link wird deaktiviert.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

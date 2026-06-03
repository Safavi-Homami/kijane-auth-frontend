import { Button } from "@/components/ui/button";

export default function LectureContextCard({
  onBackToCourseList,
}) {
  return (
    <div className="rounded-2xl border bg-white shadow-sm p-4">
      <div className="space-y-2">
        <Button
          variant="secondary"
          size="sm"
          className="w-full justify-center text-sm"
          onClick={onBackToCourseList}
        >
          ← Zurück zur Kursliste
        </Button>
      </div>
    </div>
  );
}
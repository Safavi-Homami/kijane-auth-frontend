import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatAuthorName } from "../utils/personName";

function InstructorCard({ authors }) {
  if (!authors || authors.length === 0) return null;

  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader>
        <CardTitle>Trainer</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {authors.map((author, index) => {
  const displayName = formatAuthorName(author);

  return (
    <div key={index} className="flex items-center gap-4">
      <img
        src={`https://i.pravatar.cc/80?img=${index + 10}`}
        alt={displayName}
        className="w-12 h-12 rounded-full object-cover"
      />

      <div>
        <p className="font-medium">{displayName}</p>
        <p className="text-sm text-slate-500">
          Trainer bei Clavisimo
        </p>
      </div>
    </div>
  );
})}
      </CardContent>
    </Card>
  );
}

export default InstructorCard;
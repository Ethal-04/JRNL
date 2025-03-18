import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { format } from "date-fns";
import type { Entry } from "@shared/schema";
import { Link } from "wouter";

interface EntryCardProps {
  entry: Entry;
}

export function EntryCard({ entry }: EntryCardProps) {
  return (
    <Link href={`/entry/${entry.id}`}>
      <Card className="cursor-pointer hover:shadow-lg transition-shadow h-[280px] flex flex-col bg-white/80 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-lg font-serif line-clamp-2">{entry.title}</CardTitle>
          <div className="text-sm text-muted-foreground">
            {format(new Date(entry.date), "MMMM d, yyyy")}
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden">
          {entry.prompt && (
            <div className="text-sm italic text-muted-foreground mb-2 line-clamp-1">
              Prompt: {entry.prompt}
            </div>
          )}
          <div
            className="line-clamp-6 text-sm prose-sm"
            dangerouslySetInnerHTML={{ __html: entry.content }}
          />
        </CardContent>
      </Card>
    </Link>
  );
}
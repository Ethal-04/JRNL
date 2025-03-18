import { useQuery } from "@tanstack/react-query";
import { EntryCard } from "@/components/EntryCard";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { getDailyPrompt } from "@/lib/promptGenerator";
import { PenLine } from "lucide-react";
import type { Entry } from "@shared/schema";

export default function Home() {
  const { data: entries, isLoading } = useQuery<Entry[]>({
    queryKey: ["/api/entries"],
  });

  const dailyPrompt = getDailyPrompt();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-serif">My Journal</h1>
        <Link href="/entry/new">
          <Button>
            <PenLine className="mr-2 h-4 w-4" />
            New Entry
          </Button>
        </Link>
      </div>

      <Card className="mb-8 bg-accent/20">
        <CardHeader>
          <CardTitle>Today's Writing Prompt</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg italic">{dailyPrompt}</p>
          <Link href={`/entry/new?prompt=${encodeURIComponent(dailyPrompt)}`}>
            <Button className="mt-4" variant="outline">
              Write about this
            </Button>
          </Link>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {entries?.map((entry) => (
          <EntryCard key={entry.id} entry={entry} />
        ))}
      </div>
    </div>
  );
}
import { useQuery } from "@tanstack/react-query";
import { EntryCard } from "@/components/EntryCard";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { getDailyPrompt } from "@/lib/promptGenerator";
import { PenLine, Calendar as CalendarIcon } from "lucide-react";
import type { Entry } from "@shared/schema";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

export default function Home() {
  const { data: entries, isLoading } = useQuery<Entry[]>({
    queryKey: ["/api/entries"],
  });

  const dailyPrompt = getDailyPrompt();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
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

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content - Journal Entries */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {entries?.map((entry) => (
                <EntryCard key={entry.id} entry={entry} />
              ))}
            </div>
          </div>

          {/* Sidebar - Calendar and Prompt */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  Calendar & Prompt
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DayPicker
                  mode="single"
                  selected={new Date()}
                  className="rounded-md border shadow-sm mx-auto w-full [&_.rdp-nav]:text-sm [&_.rdp]:max-w-full [&_.rdp-caption]:text-sm [&_.rdp-cell]:p-0 [&_.rdp-button]:w-9 [&_.rdp-button]:h-9 [&_.rdp-head_th]:p-0 [&_.rdp-tbody]:gap-1"
                />

                <div className="mt-6 p-4 bg-accent/20 rounded-lg">
                  <h3 className="font-semibold mb-2">Today's Prompt</h3>
                  <p className="text-sm italic">{dailyPrompt}</p>
                  <Link href={`/entry/new?prompt=${encodeURIComponent(dailyPrompt)}`}>
                    <Button className="mt-4 w-full" variant="outline">
                      Write about this
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
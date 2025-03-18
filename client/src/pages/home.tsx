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
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900">
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-serif text-white">My Journal</h1>
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
          <div className="lg:col-span-1 flex justify-center lg:block">
            <Card className="sticky top-8 w-full max-w-sm lg:max-w-none bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <CalendarIcon className="h-5 w-5" />
                  Calendar & Prompt
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DayPicker
                  mode="single"
                  selected={new Date()}
                  className="rounded-md border shadow-sm mx-auto w-full [&_.rdp-nav]:text-sm [&_.rdp]:max-w-full [&_.rdp-caption]:text-sm [&_.rdp-cell]:p-0 [&_.rdp-button]:w-9 [&_.rdp-button]:h-9 [&_.rdp-head_th]:p-0 [&_.rdp-tbody]:gap-1 text-white [&_.rdp-day_button:hover]:bg-white/20 [&_.rdp-day_button]:hover:text-white"
                />

                <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
                  <h3 className="font-semibold mb-2 text-white">Today's Prompt</h3>
                  <p className="text-sm italic text-white/80">{dailyPrompt}</p>
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
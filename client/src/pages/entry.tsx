import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { Editor } from "@/components/Editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState, useEffect } from "react";
import type { Entry } from "@shared/schema";
import { ArrowLeft, Save, Trash } from "lucide-react";
import React from 'react';
import { Badge } from "@/components/ui/badge";

export default function EntryPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { id } = useParams<{ id: string }>();
  const [location] = useLocation();
  const isNew = id === "new";
  const searchParams = new URLSearchParams(location.search);

  const { data: entry } = useQuery<Entry>({
    queryKey: [`/api/entries/${id}`],
    enabled: !isNew,
  });

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [prompt] = useState(searchParams.get("prompt") ?? "");
  const [emotions, setEmotions] = useState<string[]>([]);
  const [customEmotion, setCustomEmotion] = useState("");

  const defaultEmotions = ["happy", "excited", "peaceful", "sad", "angry", "frustrated", "anxious"];
    queryKey: [`/api/entries/${id}`],
    enabled: !isNew,
  });

  // Update state when entry data is loaded
  useEffect(() => {
    if (entry) {
      setTitle(entry.title);
      setContent(entry.content);
      setEmotions(entry.emotions);
    }
  }, [entry]);

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/entries", {
        title,
        content,
        prompt,
        emotions,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/entries"] });
      toast({
        title: "Entry saved",
        description: "Your journal entry has been saved successfully.",
      });
      setLocation("/");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("PATCH", `/api/entries/${id}`, {
        title,
        content,
        emotions,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/entries"] });
      toast({
        title: "Entry updated",
        description: "Your journal entry has been updated successfully.",
      });
      setLocation("/");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/entries/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/entries"] });
      toast({
        title: "Entry deleted",
        description: "Your journal entry has been deleted.",
      });
      setLocation("/");
    },
  });

  if (!isNew && !entry) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <Button variant="ghost" onClick={() => setLocation("/")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="flex gap-2">
          {!isNew && (
            <Button
              variant="destructive"
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
            >
              <Trash className="mr-2 h-4 w-4" />
              Delete
            </Button>
          )}
          <Button
            onClick={() =>
              isNew ? createMutation.mutate() : updateMutation.mutate()
            }
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            <Save className="mr-2 h-4 w-4" />
            Save
          </Button>
        </div>
      </div>

      {prompt && (
        <div className="mb-4 p-4 bg-accent/20 rounded-lg">
          <p className="text-lg italic">Prompt: {prompt}</p>
        </div>
      )}

      <div className="space-y-4">
        <Input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <div className="flex flex-wrap gap-2">
          {defaultEmotions.map(emotion => (
            <Badge
              key={emotion}
              variant={emotions.includes(emotion) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => {
                setEmotions(prev =>
                  prev.includes(emotion)
                    ? prev.filter(e => e !== emotion)
                    : [...prev, emotion]
                )
              }}
            >
              {emotion}
            </Badge>
          ))}
          <div className="flex gap-2">
            <Input
              placeholder="Add custom emotion"
              value={customEmotion}
              onChange={(e) => setCustomEmotion(e.target.value)}
              className="w-32"
            />
            <Button
              variant="outline"
              onClick={() => {
                if (customEmotion && !emotions.includes(customEmotion)) {
                  setEmotions(prev => [...prev, customEmotion]);
                  setCustomEmotion("");
                }
              }}
            >
              Add
            </Button>
          </div>
        </div>
      </div>

      <Editor content={content} onChange={setContent} />
    </div>
  );
}
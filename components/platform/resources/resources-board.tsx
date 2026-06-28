"use client";

import { useState } from "react";
import { BookOpen, ExternalLink, FileText, PlayCircle, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Resource = {
  id: string;
  title: string;
  description: string | null;
  type: "article" | "video" | "course" | "tutorial";
  url: string;
  readTime: string | null;
  skillId: string;
  createdAt: Date;
  updatedAt: Date;
  skill: {
    id: string;
    name: string;
    category: string;
  };
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case "article":
      return <FileText className="size-4" />;
    case "video":
      return <PlayCircle className="size-4" />;
    case "course":
    case "tutorial":
      return <BookOpen className="size-4" />;
    default:
      return <BookOpen className="size-4" />;
  }
};

export function ResourcesBoard({ initialResources }: { initialResources: Resource[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const filteredResources = initialResources.filter((resource) => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          resource.skill.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === "all") return matchesSearch;
    return matchesSearch && resource.type === activeTab;
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search resources by title or skill..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" className="shrink-0 gap-2">
          <Filter className="size-4" />
          Filter Skills
        </Button>
      </div>

      <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="article">Articles</TabsTrigger>
          <TabsTrigger value="course">Courses</TabsTrigger>
          <TabsTrigger value="video">Videos</TabsTrigger>
        </TabsList>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredResources.map((resource) => (
            <Card key={resource.id} className="flex flex-col transition-all hover:shadow-md">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-4 mb-2">
                  <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                    {resource.skill.name}
                  </Badge>
                  <div className="flex items-center text-muted-foreground bg-muted px-2 py-1 rounded-md text-xs font-medium capitalize gap-1">
                    {getTypeIcon(resource.type)}
                    <span className="hidden sm:inline">{resource.type}</span>
                  </div>
                </div>
                <CardTitle className="text-lg line-clamp-2 leading-tight">
                  {resource.title}
                </CardTitle>
                <CardDescription className="line-clamp-2">
                  {resource.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="mt-auto pb-4">
                <div className="text-sm text-muted-foreground">
                  {resource.readTime}
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button variant="secondary" className="w-full group" nativeButton={false} render={<a href={resource.url} target="_blank" rel="noreferrer" />}>
                  View Resource
                  <ExternalLink className="ml-2 size-3 opacity-50 group-hover:opacity-100 transition-opacity" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {filteredResources.length === 0 && (
          <div className="flex flex-col items-center justify-center p-12 text-center border rounded-xl border-dashed bg-muted/30">
            <BookOpen className="size-10 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-medium">No resources found</h3>
            <p className="text-sm text-muted-foreground mt-1">
              We couldn't find any resources matching your criteria.
            </p>
          </div>
        )}
      </Tabs>
    </div>
  );
}

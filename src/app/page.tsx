"use client";

import { useState } from "react";
import { useRouter } from 'next/navigation';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { parseResume, ResumeData } from "@/services/resume-parser";
import { analyzeResume } from "@/ai/flows/analyze-resume";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export default function Home() {
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [resumes, setResumes] = useState<File[]>([]);
  const [analysisMode, setAnalysisMode] = useState<"standard" | "analyzing">("standard");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const router = useRouter();

  const handleJobTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setJobTitle(e.target.value);
  };

  const handleJobDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJobDescription(e.target.value);
  };

  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setResumes(Array.from(e.target.files));
    }
  };

  const analyzeResumes = async () => {
    if (!jobTitle) {
      toast({
        title: "Error",
        description: "Please enter a job title.",
      });
      return;
    }

    if (!jobDescription) {
      toast({
        title: "Error",
        description: "Please enter a job description.",
      });
      return;
    }

    if (resumes.length === 0) {
      toast({
        title: "Error",
        description: "Please upload at least one resume.",
      });
      return;
    }

    setIsLoading(true);

    try {
      let analysisResults: any[] = [];

      if (analysisMode === "standard") {
        // Mock analysis with local parsing
        const parsedResumes: ResumeData[] = [];
        for (const resumeFile of resumes) {
          const resumeData = await parseResume(resumeFile);
          parsedResumes.push(resumeData);
        }
        analysisResults = parsedResumes;
      } else {
        // Call the Genkit flow with all resumes
        const resumeDataUris = await Promise.all(
          Array.from(resumes).map(async (file) => {
            return new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onloadend = () => {
                if (typeof reader.result === 'string') {
                  resolve(reader.result);
                } else {
                  reject(new Error('Failed to read file as data URI'));
                }
              };
              reader.onerror = () => reject(reader.error);
              reader.readAsDataURL(file);
            });
          })
        );
        analysisResults = await analyzeResume({ jobDescription: jobDescription, resumes: resumeDataUris });
      }

      // Navigate to the results page with the analysis results
      router.push(`/results?jobTitle=${jobTitle}&analysisResults=${JSON.stringify(analysisResults)}`);

      toast({
        title: "Success",
        description: `Analyzed ${resumes.length} resumes in ${analysisMode} Mode.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to analyze resumes: " + error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`flex flex-col min-h-screen p-6 ${isDarkTheme ? 'dark' : ''}`}>
      <div className="container mx-auto max-w-3xl">
        {/* Landing Page Content */}
        <div className="text-center mb-12 fade-in">
          <h1 className="text-4xl font-bold mb-4">ResumeRank AI</h1>
          <p className="text-lg text-muted-foreground">
            Intelligent resume analysis and interview question generation.
          </p>
        </div>

        <Card className="mb-8 fade-in">
          <CardHeader>
            <CardTitle>Analyze Resumes</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex items-center space-x-2">
              <Switch id="dark-theme" onCheckedChange={(checked) => setIsDarkTheme(checked)} />
              <Label htmlFor="dark-theme">Dark Mode</Label>
            </div>
            <div>
              <Label htmlFor="job-title">Job Title</Label>
              <Input
                type="text"
                id="job-title"
                placeholder="Enter job title"
                value={jobTitle}
                onChange={handleJobTitleChange}
              />
            </div>
            <div>
              <Label htmlFor="job-description">Job Description</Label>
              <Textarea
                id="job-description"
                placeholder="Enter job description"
                value={jobDescription}
                onChange={handleJobDescriptionChange}
              />
            </div>
            <div>
              <Label htmlFor="resume-upload">Upload Resumes</Label>
              <Input type="file" id="resume-upload" multiple onChange={handleResumeUpload} />
            </div>
            <div>
              <Label>Analysis Mode</Label>
              <Select value={analysisMode} onValueChange={(value) => setAnalysisMode(value as "standard" | "analyzing")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select analysis mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard Mode</SelectItem>
                  <SelectItem value="analyzing">Analyzing Mode (ChatGPT Powered)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={analyzeResumes} disabled={isLoading}>
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="loading-spinner"></div>
                  Analyzing...
                </div>
              ) : (
                "Analyze Resumes"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

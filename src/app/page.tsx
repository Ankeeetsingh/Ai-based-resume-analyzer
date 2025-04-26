"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { parseResume, ResumeData } from "@/services/resume-parser";
import { analyzeResume } from "@/ai/flows/analyze-resume";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function Home() {
  const [jobDescription, setJobDescription] = useState("");
  const [resumes, setResumes] = useState<File[]>([]);
  const [analysisMode, setAnalysisMode] = useState<"standard" | "analyzing">("standard");
  const [results, setResults] = useState<any[]>([]);
  const { toast } = useToast();
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  const handleJobDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setJobDescription(e.target.value);
  };

  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setResumes(Array.from(e.target.files));
    }
  };

  const analyzeResumes = async () => {
    if (!jobDescription) {
      toast({
        title: "Error",
        description: "Please upload a job description before analyzing.",
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

    if (analysisMode === "standard") {
      // Mock analysis with local parsing
      const parsedResumes: ResumeData[] = [];
      for (const resumeFile of resumes) {
        const resumeData = await parseResume(resumeFile);
        parsedResumes.push(resumeData);
      }
      setResults(parsedResumes);
      toast({
        title: "Success",
        description: `Analyzed ${resumes.length} resumes in Standard Mode.`,
      });
    } else {
      // Call the Genkit flow with all resumes
      try {
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
        const analysisResults = await analyzeResume({ jobDescription: jobDescription, resumes: resumeDataUris });
        setResults(analysisResults);
        toast({
          title: "Success",
          description: `Analyzed ${resumes.length} resumes in Analyzing Mode.`,
        });
      } catch (error: any) {
        toast({
          title: "Error",
          description: "Failed to analyze resumes in Analyzing Mode: " + error.message,
        });
      }
    }
  };

  return (
    <div className={`flex flex-col min-h-screen p-6 ${isDarkTheme ? 'dark' : ''}`}>
      <div className="container mx-auto max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">ResumeRank AI</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex items-center space-x-2">
              <Switch id="dark-theme" onCheckedChange={(checked) => setIsDarkTheme(checked)} />
              <Label htmlFor="dark-theme">Dark Mode</Label>
            </div>
            <div>
              <Label htmlFor="job-description">Job Description</Label>
              <Input
                type="text"
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
            <Button onClick={analyzeResumes}>Analyze Resumes</Button>
          </CardContent>
        </Card>

        {results.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Analysis Results</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableCaption>A list of analyzed resumes and their scores.</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Match Score</TableHead>
                    <TableHead>Top Skills</TableHead>
                    <TableHead>Highlights</TableHead>
                    <TableHead>Weak Points</TableHead>
                    <TableHead>Suggestions</TableHead>
                    <TableHead>Interview Questions</TableHead>
                    <TableHead>Model Answers</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((result, index) => (
                    <TableRow key={index}>
                      <TableCell>{result.resumeRank ?? (index + 1)}</TableCell>
                      <TableCell>{result.matchScore ? `${result.matchScore}%` : 'N/A'}</TableCell>
                      <TableCell>{result.topSkills ? result.topSkills.join(", ") : result.skills?.join(", ")}</TableCell>
                      <TableCell>{result.highlights ?? result.experience}</TableCell>
                      <TableCell>{result.weakPoints ?? 'N/A'}</TableCell>
                      <TableCell>{result.suggestions ?? 'N/A'}</TableCell>
                      <TableCell>{result.interviewQuestions ? result.interviewQuestions.join(", ") : 'N/A'}</TableCell>
                      <TableCell>{result.modelAnswers ? result.modelAnswers.join(", ") : 'N/A'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

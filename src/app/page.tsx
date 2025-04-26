"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { parseResume, ResumeData } from "@/services/resume-parser";
import { analyzeResume } from "@/ai/flows/analyze-resume";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { LucideIcon, CheckCircle, AlertTriangle, Briefcase, GraduationCap, BookOpen } from "lucide-react";

// Placeholder Icons (replace with actual resume icons later)
const BriefcaseIcon: LucideIcon = Briefcase;
const GraduationCapIcon: LucideIcon = GraduationCap;
const BookOpenIcon: LucideIcon = BookOpen;

// Mock Data for Skills
const mockSkills = ["JavaScript", "React", "Node.js", "Python", "HTML", "CSS"];

export default function Home() {
  const [jobDescription, setJobDescription] = useState("");
  const [resumes, setResumes] = useState<File[]>([]);
  const [analysisMode, setAnalysisMode] = useState<"standard" | "analyzing">("standard");
  const [results, setResults] = useState<any[]>([]);
  const { toast } = useToast();
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [selectedResumeIndex, setSelectedResumeIndex] = useState<number | null>(null);

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

  const handleResumeSelect = (index: number) => {
    setSelectedResumeIndex(index);
  };

  const clearSelection = () => {
    setSelectedResumeIndex(null);
  };

  return (
    <div className={`flex flex-col min-h-screen p-6 ${isDarkTheme ? 'dark' : ''}`}>
      <div className="container mx-auto max-w-5xl">
        <Card className="mb-8 fade-in">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">ResumeRank AI</CardTitle>
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
          <div className="flex flex-col md:flex-row gap-6">
            {/* Resume Ranking Section */}
            <Card className="w-full md:w-1/3 fade-in">
              <CardHeader>
                <CardTitle>Resume Ranking</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] w-full rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">Rank</TableHead>
                        <TableHead>Match Score</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {results.map((result, index) => (
                        <TableRow
                          key={index}
                          className={cn(
                            "cursor-pointer hover:bg-secondary",
                            selectedResumeIndex === index ? "bg-accent" : ""
                          )}
                          onClick={() => handleResumeSelect(index)}
                        >
                          <TableCell className="font-medium">{result.resumeRank ?? (index + 1)}</TableCell>
                          <TableCell>{result.matchScore ? `${result.matchScore}%` : 'N/A'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Resume Details Section */}
            <Card className="w-full md:w-2/3 fade-in">
              <CardHeader className="flex items-center justify-between">
                <CardTitle>
                  Resume Details
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={clearSelection}>
                  Clear
                </Button>
              </CardHeader>
              <CardContent>
                {selectedResumeIndex !== null ? (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarImage src={`https://picsum.photos/id/${selectedResumeIndex + 10}/50/50`} alt="Resume Image" />
                        <AvatarFallback>
                          {results[selectedResumeIndex].name?.substring(0, 2) || "Res"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-lg font-semibold">
                          Candidate {selectedResumeIndex + 1}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Rank: {results[selectedResumeIndex].resumeRank ?? (selectedResumeIndex + 1)}, Match Score: {results[selectedResumeIndex].matchScore}%
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Highlights */}
                      <div>
                        <h4 className="mb-2 font-semibold flex items-center space-x-1"><CheckCircle className="h-4 w-4 text-green-500" /><span>Highlights</span></h4>
                        <ul className="list-disc pl-5">
                          {results[selectedResumeIndex].highlights ? (
                            <li>{results[selectedResumeIndex].highlights}</li>
                          ) : (
                            <li>N/A</li>
                          )}
                        </ul>
                      </div>

                      {/* Weak Points */}
                      <div>
                        <h4 className="mb-2 font-semibold flex items-center space-x-1"><AlertTriangle className="h-4 w-4 text-yellow-500" /><span>Weak Points</span></h4>
                        <ul className="list-disc pl-5">
                          {results[selectedResumeIndex].weakPoints ? (
                            <li>{results[selectedResumeIndex].weakPoints}</li>
                          ) : (
                            <li>N/A</li>
                          )}
                        </ul>
                      </div>
                    </div>

                    {/* Skills Section */}
                    <div>
                      <h4 className="mb-2 font-semibold flex items-center space-x-1"><BriefcaseIcon className="h-4 w-4 text-blue-500" /><span>Skills</span></h4>
                      <div className="flex flex-wrap gap-2">
                        {(results[selectedResumeIndex].topSkills ?? mockSkills).map((skill, index) => (
                          <Badge key={index}>{skill}</Badge>
                        ))}
                      </div>
                    </div>

                    {/* Education Section */}
                    <div>
                      <h4 className="mb-2 font-semibold flex items-center space-x-1"><GraduationCapIcon className="h-4 w-4 text-orange-500" /><span>Education</span></h4>
                      <p>{results[selectedResumeIndex].education ?? "N/A"}</p>
                    </div>

                    {/* Interview Questions Section */}
                    <div>
                      <h4 className="mb-2 font-semibold flex items-center space-x-1"><BookOpenIcon className="h-4 w-4 text-purple-500" /><span>Interview Questions</span></h4>
                      <ul className="list-decimal pl-5">
                        {results[selectedResumeIndex].interviewQuestions ? (
                          results[selectedResumeIndex].interviewQuestions.map((question, index) => (
                            <li key={index}>{question}</li>
                          ))
                        ) : (
                          <li>N/A</li>
                        )}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Select a resume to view details.</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

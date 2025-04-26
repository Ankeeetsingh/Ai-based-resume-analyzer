"use client";

import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LucideIcon, CheckCircle, AlertTriangle, Briefcase, GraduationCap, BookOpen } from "lucide-react";

// Placeholder Icons (replace with actual resume icons later)
const BriefcaseIcon: LucideIcon = Briefcase;
const GraduationCapIcon: LucideIcon = GraduationCap;
const BookOpenIcon: LucideIcon = BookOpen;

// Mock Data for Skills
const mockSkills = ["JavaScript", "React", "Node.js", "Python", "HTML", "CSS"];

export default function ResultsPage() {
  const searchParams = useSearchParams();
  const jobTitle = searchParams.get('jobTitle') || "N/A";
  const analysisResults = JSON.parse(searchParams.get('analysisResults') || "[]");
  const [selectedResumeIndex, setSelectedResumeIndex] = useState<number | null>(null);

  const handleResumeSelect = (index: number) => {
    setSelectedResumeIndex(index);
  };

  const clearSelection = () => {
    setSelectedResumeIndex(null);
  };

  return (
    <div className="flex flex-col min-h-screen p-6">
      <div className="container mx-auto max-w-5xl">
        <Card className="mb-8 fade-in">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Resume Analysis Results</CardTitle>
            <p className="text-muted-foreground">Job Title: {jobTitle}</p>
          </CardHeader>
          <CardContent>
            {analysisResults.length > 0 ? (
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
                          {analysisResults.map((result, index) => (
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
                              {analysisResults[selectedResumeIndex].name?.substring(0, 2) || "Res"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="text-lg font-semibold">
                              Candidate {selectedResumeIndex + 1}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Rank: {analysisResults[selectedResumeIndex].resumeRank ?? (selectedResumeIndex + 1)}, Match Score: {analysisResults[selectedResumeIndex].matchScore}%
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Highlights */}
                          <div>
                            <h4 className="mb-2 font-semibold flex items-center space-x-1"><CheckCircle className="h-4 w-4 text-green-500" /><span>Highlights</span></h4>
                            <ul className="list-disc pl-5">
                              {analysisResults[selectedResumeIndex].highlights ? (
                                <li>{analysisResults[selectedResumeIndex].highlights}</li>
                              ) : (
                                <li>N/A</li>
                              )}
                            </ul>
                          </div>

                          {/* Weak Points */}
                          <div>
                            <h4 className="mb-2 font-semibold flex items-center space-x-1"><AlertTriangle className="h-4 w-4 text-yellow-500" /><span>Weak Points</span></h4>
                            <ul className="list-disc pl-5">
                              {analysisResults[selectedResumeIndex].weakPoints ? (
                                <li>{analysisResults[selectedResumeIndex].weakPoints}</li>
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
                            {(analysisResults[selectedResumeIndex].topSkills ?? mockSkills).map((skill, index) => (
                              <Badge key={index}>{skill}</Badge>
                            ))}
                          </div>
                        </div>

                        {/* Education Section */}
                        <div>
                          <h4 className="mb-2 font-semibold flex items-center space-x-1"><GraduationCapIcon className="h-4 w-4 text-orange-500" /><span>Education</span></h4>
                          <p>{analysisResults[selectedResumeIndex].education ?? "N/A"}</p>
                        </div>

                        {/* Interview Questions Section */}
                        <div>
                          <h4 className="mb-2 font-semibold flex items-center space-x-1"><BookOpenIcon className="h-4 w-4 text-purple-500" /><span>Interview Questions</span></h4>
                          <ul className="list-decimal pl-5">
                            {analysisResults[selectedResumeIndex].interviewQuestions ? (
                              analysisResults[selectedResumeIndex].interviewQuestions.map((question, index) => (
                                <li key={index}>{question}</li>
                              ))
                            ) : (
                              <li>N/A</li>
                            )}
                          </ul>
                        </div>

                        {/* Model Answers Section */}
                        <div>
                          <h4 className="mb-2 font-semibold flex items-center space-x-1"><BookOpenIcon className="h-4 w-4 text-purple-500" /><span>Model Answers</span></h4>
                          <ul className="list-decimal pl-5">
                            {analysisResults[selectedResumeIndex].modelAnswers ? (
                              analysisResults[selectedResumeIndex].modelAnswers.map((answer, index) => (
                                <li key={index}>{answer}</li>
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
            ) : (
              <p className="text-muted-foreground">No results to display.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

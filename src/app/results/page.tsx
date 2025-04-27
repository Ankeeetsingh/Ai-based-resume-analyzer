"use client";

import { useState, useEffect } from 'react';
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
import { LucideIcon, CheckCircle, AlertTriangle, Briefcase, GraduationCap, BookOpen, Mail } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { sendRejectionEmail } from "@/services/email-service"; // Import sendRejectionEmail
import { useToast } from "@/hooks/use-toast"; // Import useToast

interface AnalysisResult {
  matchScore?: number;
  resumeRank?: number;
  topSkills?: string[];
  highlights?: string;
  weakPoints?: string;
  education?: string;
  interviewQuestions?: string[];
  modelAnswers?: string[];
  rejectionReason?: string;
  salarySuggestion?: string;
  name?: string; // Assuming name is part of your result
  candidateEmail?: string;
  projects?: { name: string; description: string }[];
}

interface ResultsProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default function ResultsPage() {
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([]);
  const [jobTitle, setJobTitle] = useState<string>("N/A");
  const [selectedResumeIndex, setSelectedResumeIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast(); // Initialize toast

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Retrieve data from local storage
        const storedJobTitle = localStorage.getItem('jobTitle');
        const storedAnalysisResults = localStorage.getItem('analysisResults');

        if (storedJobTitle && storedAnalysisResults) {
          setJobTitle(storedJobTitle);
          try {
            setAnalysisResults(JSON.parse(storedAnalysisResults));
          } catch (parseError: any) {
            console.error("Failed to parse analysis results from local storage:", parseError);
            // Provide a default value or handle the error gracefully
            setAnalysisResults([]);
          }
        } else {
          console.log('No data found in local storage.  Please go back to the main page to perform the analysis.');
        }
      } catch (error: any) {
        console.error("Failed to fetch analysis results from local storage:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleResumeSelect = (index: number) => {
    setSelectedResumeIndex(index);
  };

  const clearSelection = () => {
    setSelectedResumeIndex(null);
  };

  // Separate shortlisted and rejected candidates
  const shortlistedCandidates = analysisResults.filter(result => result.resumeRank !== undefined);
  const rejectedCandidates = analysisResults.filter(result => result.resumeRank === undefined);

  const sendRejectionEmailToCandidate = async (candidate: AnalysisResult) => {
    if (!candidate.candidateEmail || !candidate.name) {
      console.error("Candidate email or name is missing.");
      toast({
        title: "Error",
        description: "Candidate email or name is missing.",
      });
      return;
    }

    const rejectionReason = `Dear ${candidate.name},\n\nThank you for your interest in the position. After careful consideration, we regret to inform you that you have not been shortlisted. Reasons for rejection include: ${candidate.weakPoints}. Your match score was ${candidate.matchScore}%.`;

    try {
      await sendRejectionEmail({
        to: candidate.candidateEmail,
        subject: 'Resume Application Update',
        body: rejectionReason,
      });
      console.log(`Rejection email sent to ${candidate.name} at ${candidate.candidateEmail}`);
        toast({
            title: "Success",
            description: `Email sent to ${candidate.candidateEmail}`,
        });
    } catch (error) {
      console.error(`Failed to send rejection email to ${candidate.name} at ${candidate.candidateEmail}:`, error);
        toast({
            title: "Error",
            description: `Failed to send rejection email to ${candidate.candidateEmail}`,
        });
    }
  };


  if (isLoading) {
    return <div className="text-center text-white">Loading...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen p-6 bg-gray-900 text-white">
      <div className="container mx-auto max-w-5xl">
        <Card className="mb-8 fade-in bg-secondary">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Resume Analysis Results</CardTitle>
            <p className="text-muted-foreground">Job Title: {jobTitle}</p>
          </CardHeader>
          <CardContent>
            {analysisResults.length > 0 ? (
              <div className="flex flex-col md:flex-row gap-6">
                {/* Resume Ranking Section */}
                <Card className="w-full md:w-1/3 fade-in bg-background">
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
                          {shortlistedCandidates.map((result, index) => (
                            <TableRow
                              key={index}
                              className={cn(
                                "cursor-pointer hover:bg-secondary",
                                selectedResumeIndex === index ? "bg-accent" : ""
                              )}
                              onClick={() => handleResumeSelect(index)}
                            >
                              <TableCell className="font-medium">
                                {`Rank ${result.resumeRank ?? (index + 1)} - ${result.name ?? 'Candidate ' + (index + 1)}`}
                              </TableCell>
                              <TableCell>{result.matchScore ? `${result.matchScore}%` : 'N/A'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                     {/* Rejected Candidates Section */}
                      {rejectedCandidates.length > 0 && (
                        <div className="mt-4">
                          <h4 className="mb-2 font-semibold">Rejected Candidates</h4>
                          <ul className="list-none pl-0">
                            {rejectedCandidates.map((result, index) => (
                              <li key={`rejected-${index}`} className="mb-2 flex items-center justify-between">
                                <span>{result.name ?? `Candidate ${index + 1}`} - Match Score: {result.matchScore}%</span>
                                <Button size="sm" onClick={() => sendRejectionEmailToCandidate(result)}>
                                  Send Email
                                </Button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                  </CardContent>
                </Card>

                {/* Resume Details Section */}
                <Card className="w-full md:w-2/3 fade-in bg-background">
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
                              {analysisResults[selectedResumeIndex].name ?? `Candidate ${selectedResumeIndex + 1}`}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Rank: {analysisResults[selectedResumeIndex].resumeRank ?? (selectedResumeIndex + 1)}, Match Score: {analysisResults[selectedResumeIndex].matchScore}%
                            </p>
                            {analysisResults[selectedResumeIndex].rejectionReason && (
                              <p className="text-sm text-red-500 flex items-center space-x-1">
                                <Mail className="h-4 w-4" />
                                <span>Rejected: {analysisResults[selectedResumeIndex].rejectionReason}</span>
                              </p>
                            )}
                            {analysisResults[selectedResumeIndex].salarySuggestion && (
                              <p className="text-sm text-green-500">
                                Salary Suggestion: {analysisResults[selectedResumeIndex].salarySuggestion}
                              </p>
                            )}
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
                            {(analysisResults[selectedResumeIndex].topSkills ?? []).map((skill, index) => (
                              <Badge key={index}>{skill}</Badge>
                            ))}
                          </div>
                        </div>

                          {/* Project Section */}
                          <div>
                            <h4 className="mb-2 font-semibold flex items-center space-x-1">
                              <BriefcaseIcon className="h-4 w-4 text-orange-500" />
                              <span>Projects</span>
                            </h4>
                            {analysisResults[selectedResumeIndex].projects && analysisResults[selectedResumeIndex].projects.length > 0 ? (
                              analysisResults[selectedResumeIndex].projects.map((project, index) => (
                                <div key={index} className="mb-4">
                                  <h5 className="font-semibold">{project.name}</h5>
                                  <p className="text-sm text-muted-foreground">{project.description}</p>
                                </div>
                              ))
                            ) : (
                              <p className="text-sm text-muted-foreground">No projects mentioned.</p>
                            )}
                          </div>


                         {/* Interview Questions Section */}
                         <div>
                          <h4 className="mb-2 font-semibold flex items-center space-x-1"><BookOpenIcon className="h-4 w-4 text-purple-500" /><span>Interview Questions and Model Answers</span></h4>
                            <Accordion type="single" collapsible>
                              {(analysisResults[selectedResumeIndex].interviewQuestions ?? []).map((question, index) => (
                                <AccordionItem key={index} value={`question-${index}`}>
                                  <AccordionTrigger>{question}</AccordionTrigger>
                                  <AccordionContent>
                                    {analysisResults[selectedResumeIndex].modelAnswers && analysisResults[selectedResumeIndex].modelAnswers[index]
                                      ? analysisResults[selectedResumeIndex].modelAnswers[index]
                                      : "No model answer provided."}
                                  </AccordionContent>
                                </AccordionItem>
                              ))}
                            </Accordion>
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

// Dummy components to ensure icons can be found
function BriefcaseIcon(props: any): JSX.Element {
  return (
    <Briefcase {...props} />
  );
}
function GraduationCapIcon(props: any): JSX.Element {
  return (
    <GraduationCap {...props} />
  );
}
function BookOpenIcon(props: any): JSX.Element {
  return (
    <BookOpen {...props} />
  );
}

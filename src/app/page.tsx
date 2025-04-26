"use client";

import { useState } from "react";
import { useRouter } from 'next/navigation';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { analyzeResume } from "@/ai/flows/analyze-resume";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Sparkles, Users, Bolt } from "lucide-react";
import { Moon, Sun } from 'lucide-react';

const HeroSection = () => (
  <div className="text-center mb-12 py-24 text-white">
    <div className="flex justify-center mb-8">
      <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-brain">
        <path d="M3 7V5c0-1.38.83-2.42 2-3h14a2 2 0 0 1 2 2v2"></path>
        <path d="M5 7a2 2 0 0 0-2 2v4c0 1.1.9 2 2 2h4"></path>
        <path d="M19 7a2 2 0 0 1 2 2v4c0 1.1-.9 2-2 2h-4"></path>
        <path d="M7 15v2a2 2 0 0 1-2 2"></path>
        <path d="M17 15v2a2 2 0 0 0 2 2"></path>
        <path d="M11 7v8h2"></path>
      </svg>
    </div>
    <h1 className="text-5xl font-bold mb-4">AI Resume Analyzer</h1>
    <p className="text-lg text-gray-400">
      Upload a job description and resumes to automatically rank candidates and generate tailored interview questions using advanced AI analysis.
    </p>
    <div className="flex justify-center mt-8 space-x-4">
      <Badge icon={Sparkles} text="Gemini AI-Powered Analysis" />
      <Badge icon={Users} text="Candidate Ranking" />
      <Badge icon={Bolt} text="Custom Interview Questions" />
    </div>
  </div>
);

const Badge = ({ icon: any, text }: { icon: any, text: string }) => (
  <div className="flex items-center bg-secondary text-secondary-foreground rounded-full px-4 py-2 text-sm">
    {text}
  </div>
);

const AnalysisForm = () => {
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [expectedSalary, setExpectedSalary] = useState("");
  const [resumes, setResumes] = useState<File[]>([]);
  const [analysisMode, setAnalysisMode] = useState<"standard" | "analyzing">("standard");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const [numCandidatesToShortlist, setNumCandidatesToShortlist] = useState("1");

  const handleJobTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setJobTitle(e.target.value);
  };

  const handleJobDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJobDescription(e.target.value);
  };

  const handleExpectedSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setExpectedSalary(e.target.value);
  };


  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setResumes(Array.from(e.target.files));
    }
  };

  const handleNumCandidatesToShortlistChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNumCandidatesToShortlist(e.target.value);
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
      let resumeDataUris: string[] = [];

      if (analysisMode === "analyzing") {
        // Call the Genkit flow with all resumes
        resumeDataUris = await Promise.all(
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
      }

      if (analysisMode === "analyzing") {
        analysisResults = await analyzeResume({
          jobDescription: jobDescription,
          expectedSalary: expectedSalary,
          resumes: resumeDataUris,
          numCandidatesToShortlist: parseInt(numCandidatesToShortlist, 10) || 1,
        });
      } else {
        analysisResults = []; // Handle standard mode if needed
      }

      // Store results in local storage
      localStorage.setItem('jobTitle', jobTitle);
      localStorage.setItem('analysisResults', JSON.stringify(analysisResults));

      // Navigate to the results page with the analysis results
      router.push('/results');

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
    <Card className="mb-8 fade-in bg-secondary">
      <CardHeader>
        <CardTitle className="text-lg">Analyze Resumes</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
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
          <Label htmlFor="expected-salary">Expected Salary</Label>
          <Input
            type="text"
            id="expected-salary"
            placeholder="Enter expected salary (e.g., ₹9 lakh per annum)"
            value={expectedSalary}
            onChange={handleExpectedSalaryChange}
          />
        </div>
        <div>
          <Label htmlFor="resume-upload">Upload Resumes</Label>
          <Input type="file" id="resume-upload" multiple onChange={handleResumeUpload} />
        </div>
        <div>
          <Label htmlFor="num-candidates">Number of Candidates to Shortlist</Label>
          <Input
            type="number"
            id="num-candidates"
            placeholder="Enter number of candidates to shortlist"
            value={numCandidatesToShortlist}
            onChange={handleNumCandidatesToShortlistChange}
            min="1"
          />
        </div>
         <div>
          <Label className="flex items-center space-x-2">
            <span>AI Mode</span>
            <Switch
              id="ai-mode"
              checked={analysisMode === "analyzing"}
              onCheckedChange={(checked) =>
                setAnalysisMode(checked ? "analyzing" : "standard")
              }
            />
          </Label>
          <p className="text-sm text-muted-foreground">
            Enable AI mode to use Gemini AI for resume analysis and get
            salary suggestions and automatic rejection emails.
          </p>
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
  );
};

export default function Home() {
  const [isDarkTheme, setIsDarkTheme] = useState(true);

  return (
    <div className={`flex flex-col min-h-screen ${isDarkTheme ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <div className="container mx-auto max-w-3xl">
        <button className="absolute top-4 right-4 rounded-full p-2 bg-secondary text-secondary-foreground hover:bg-accent" onClick={() => setIsDarkTheme(!isDarkTheme)}>
          {isDarkTheme ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
        <HeroSection />
        <AnalysisForm />
      </div>
    </div>
  );
}

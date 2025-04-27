'use server';
/**
 * @fileOverview This file defines a Genkit flow for analyzing resumes against a job description.
 *
 * - analyzeResume - The main function to analyze resumes and generate insights.
 * - AnalyzeResumeInput - The input type for the analyzeResume function.
 * - AnalyzeResumeOutput - The output type for the analyzeResume function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';
import {sendRejectionEmail} from '@/services/email-service';
import {estimateSalary} from '@/services/salary-estimator';

const AnalyzeResumeInputSchema = z.object({
  jobDescription: z.string().describe('The job description to match against.'),
  expectedSalary: z.string().describe('The expected salary for the job (e.g., "₹9 lakh per annum").'),
  resumes: z
    .array(
      z
        .string()
        .describe(
          "A resume as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
        )
    )
    .describe('An array of resumes to analyze.'),
  numCandidatesToShortlist: z.number().int().min(1).describe('The number of candidates to shortlist.'),
});
export type AnalyzeResumeInput = z.infer<typeof AnalyzeResumeInputSchema>;

const AnalyzeResumeOutputSchema = z.array(z.object({
  name: z.string().optional().describe('The name of the candidate.'),
  matchScore: z.number().describe('The match score (0-100%) of the resume against the job description.'),
  resumeRank: z.number().optional().describe('The rank of the resume among the analyzed resumes.'),
  topSkills: z.array(z.string()).describe('A list of the candidate\'s top skills.'),
  highlights: z.string().describe('A summary of the candidate\'s strengths.'),
  weakPoints: z.string().describe('A list of weaknesses or concerns.'),
  suggestions: z.string().describe('Suggestions to improve the resume.'),
  interviewQuestions: z.array(z.string()).describe('Tailored interview questions for the candidate.'),
  modelAnswers: z.array(z.string()).describe('Model answers for the interview questions.'),
  salarySuggestion: z.string().optional().describe('Suggested salary for the candidate, based on their qualifications and experience.'),
  rejectionReason: z.string().optional().describe('Reason for rejecting the resume, if applicable.'),
  candidateEmail: z.string().optional().describe('The email of the candidate. Only present if resume is rejected.'),
  projects: z.array(z.object({
    name: z.string().describe('The name of the project.'),
    description: z.string().describe('A brief description of the project.'),
  })).optional().describe('A list of the candidate\'s projects.'),
}));
export type AnalyzeResumeOutput = z.infer<typeof AnalyzeResumeOutputSchema>;

export async function analyzeResume(input: AnalyzeResumeInput): Promise<AnalyzeResumeOutput> {
  return analyzeResumeFlow(input);
}

const analyzeResumePrompt = ai.definePrompt({
  name: 'analyzeResumePrompt',
  input: {
    schema: z.object({
      jobDescription: z.string().describe('The job description to match against.'),
      resume: z
        .string()
        .describe(
          "A resume as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
        ),
    }),
  },
  output: {
    schema: z.object({
      name: z.string().optional().describe('The name of the candidate.'),
      matchScore: z
        .number()
        .describe('The match score (0-100%) of the resume against the job description.'),
      topSkills: z.array(z.string()).describe('A list of the candidate\'s top skills.'),
      highlights: z.string().describe('A summary of the candidate\'s strengths.'),
      weakPoints: z.string().describe('A list of weaknesses or concerns.'),
      suggestions: z.string().describe('Suggestions to improve the resume.'),
      interviewQuestions: z.array(z.string()).describe('Tailored interview questions for the candidate.'),
      modelAnswers: z.array(z.string()).describe('Model answers for the interview questions.'),
      candidateEmail: z.string().optional().describe('The email address of the candidate, extracted from the resume.'),
      projects: z.array(z.object({
        name: z.string().describe('The name of the project.'),
        description: z.string().describe('A brief description of the project.'),
      })).optional().describe('A list of the candidate\'s projects.'),
    }),
  },
  prompt: `You are an AI resume analyzer. Analyze the resume provided and compare it to the job description. Extract the candidate's name and email address from the resume.

Job Description: {{{jobDescription}}}

Resume: {{media url=resume}}

Provide the following:

- Name: Extract the candidate's name from the resume.
- Match Score (0-100%): How well does the resume match the job description?
- Top Skills: A list of the candidate's top skills.
- Highlights: A summary of the candidate's strengths.
- Weak Points: A list of weaknesses or concerns.
- Suggestions: Suggestions to improve the resume.
- Interview Questions: Tailored interview questions for the candidate.
- Model Answers: Model answers for the interview questions.
- Candidate Email: Extract from the resume and add it to the ouput.
- Projects: Extract any projects the candidate has worked on. For each project, include the project name and a brief description. If no projects are mentioned, return an empty list.
`,
});

const analyzeResumeFlow = ai.defineFlow<
  typeof AnalyzeResumeInputSchema,
  typeof AnalyzeResumeOutputSchema
>({
  name: 'analyzeResumeFlow',
  inputSchema: AnalyzeResumeInputSchema,
  outputSchema: AnalyzeResumeOutputSchema,
},
async input => {
  const results: AnalyzeResumeOutput = [];

  for (const resume of input.resumes) {
    const {output} = await analyzeResumePrompt({
      jobDescription: input.jobDescription,
      resume: resume,
    });

    results.push(output!);
  }

  // Simple ranking based on match score (can be improved with more sophisticated logic)
  results.sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0));

  // Generate rejection reasons and salary suggestions *before* shortlisting
  for (const result of results) {
      if (result.matchScore! < 50) {
          const rejectionReason = `Thank you for your interest in the position. After careful consideration, we regret to inform you that you have not been shortlisted. Reasons for rejection include: Your match score was below 50%.`;
          result.rejectionReason = rejectionReason;
          result.salarySuggestion = undefined;
      } else {
          const salarySuggestion = await estimateSalary({
              jobDescription: input.jobDescription,
              expectedSalary: input.expectedSalary,
              resumeText: input.resumes[results.indexOf(result)],
              topSkills: result.topSkills.join(', '),
              highlights: result.highlights
          });

          // Convert annual expected salary to monthly range
          const monthlySalaryRange = salarySuggestion.replace("Based on your qualifications, a suggested salary is in the range of ", "");
          const monthlySalaryString = monthlySalaryRange;

          result.salarySuggestion = `₹${monthlySalaryString}`;
      }
  }
  
  // Shortlist the candidates based on numCandidatesToShortlist
  const shortlistedCandidates = results.slice(0, input.numCandidatesToShortlist);
  const rejectedCandidates = results.slice(input.numCandidatesToShortlist);
  
   // Assign ranks to shortlisted candidates
  shortlistedCandidates.forEach((result, index) => {
      result.resumeRank = index + 1;
      result.rejectionReason = undefined;
  });

    // Define salary ranges based on rank
    const salaryRanges = {
      1: '75,000 – 91,666',
      2: '66,666 – 75,000',
      3: '58,333 – 66,666',
      4: '50,000 – 58,333',
      5: '41,666 – 50,000',
    };
  
    // Assign salary suggestions based on rank
    shortlistedCandidates.forEach(result => {
      const rank = result.resumeRank as keyof typeof salaryRanges;
      result.salarySuggestion = `₹${salaryRanges[rank]} per month`;
    });
  
  // Send rejection emails to rejected candidates
  for (const result of rejectedCandidates) {
          const rejectionReason = `Thank you for your interest in the position. After careful consideration, we regret to inform you that you have not been shortlisted. Reasons for rejection include: ${result.weakPoints}. Your match score was ${result.matchScore}%.`;
          if (result.candidateEmail) {
            result.rejectionReason = rejectionReason;
            result.resumeRank = undefined; // Clear rank for rejected candidates
            result.salarySuggestion = undefined;
          }
  }

  return [...shortlistedCandidates, ...rejectedCandidates];
});

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

const AnalyzeResumeInputSchema = z.object({
  jobDescription: z.string().describe('The job description to match against.'),
  resumes: z
    .array(
      z
        .string()
        .describe(
          "A resume as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
        )
    )
    .describe('An array of resumes to analyze.'),
});
export type AnalyzeResumeInput = z.infer<typeof AnalyzeResumeInputSchema>;

const AnalyzeResumeOutputSchema = z.array(z.object({
  matchScore: z.number().describe('The match score (0-100%) of the resume against the job description.'),
  resumeRank: z.number().describe('The rank of the resume among the analyzed resumes.'),
  topSkills: z.array(z.string()).describe('A list of the candidate\'s top skills.'),
  highlights: z.string().describe('A summary of the candidate\'s strengths.'),
  weakPoints: z.string().describe('A list of weaknesses or concerns.'),
  suggestions: z.string().describe('Suggestions to improve the resume.'),
  interviewQuestions: z.array(z.string()).describe('Tailored interview questions for the candidate.'),
  modelAnswers: z.array(z.string()).describe('Model answers for the interview questions.'),
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
      matchScore: z
        .number()
        .describe('The match score (0-100%) of the resume against the job description.'),
      resumeRank: z.number().describe('The rank of the resume among the analyzed resumes.'),
      topSkills: z.array(z.string()).describe('A list of the candidate\'s top skills.'),
      highlights: z.string().describe('A summary of the candidate\'s strengths.'),
      weakPoints: z.string().describe('A list of weaknesses or concerns.'),
      suggestions: z.string().describe('Suggestions to improve the resume.'),
      interviewQuestions: z.array(z.string()).describe('Tailored interview questions for the candidate.'),
      modelAnswers: z.array(z.string()).describe('Model answers for the interview questions.'),
    }),
  },
  prompt: `You are an AI resume analyzer. Analyze the resume provided and compare it to the job description.

Job Description: {{{jobDescription}}}

Resume: {{media url=resume}}

Provide the following:

- Match Score (0-100%): How well does the resume match the job description?
- Resume Rank: Rank the resume among other resumes (this will be done later, so provide a relative rank based on your analysis).
- Top Skills: A list of the candidate's top skills.
- Highlights: A summary of the candidate's strengths.
- Weak Points: A list of weaknesses or concerns.
- Suggestions: Suggestions to improve the resume.
- Interview Questions: Tailored interview questions for the candidate.
- Model Answers: Model answers for the interview questions.
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
    results.push(output!)
  }

  // Simple ranking based on match score (can be improved with more sophisticated logic)
  results.sort((a, b) => b.matchScore - a.matchScore);
  results.forEach((result, index) => {
    result.resumeRank = index + 1;
  });

  return results;
});

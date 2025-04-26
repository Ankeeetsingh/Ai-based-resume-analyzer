'use server';
/**
 * @fileOverview Summarizes a resume, extracting key skills, experiences, and concerns.
 *
 * - summarizeResume - A function that summarizes the resume.
 * - SummarizeResumeInput - The input type for the summarizeResume function.
 * - SummarizeResumeOutput - The return type for the summarizeResume function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const SummarizeResumeInputSchema = z.object({
  jobDescription: z.string().describe('The job description to compare the resume against.'),
  resumeText: z.string().describe('The text content of the resume to summarize.'),
});
export type SummarizeResumeInput = z.infer<typeof SummarizeResumeInputSchema>;

const SummarizeResumeOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the resume, highlighting key skills, experiences, and potential concerns.'),
  matchScore: z.number().describe('A score (0-100) indicating how well the resume matches the job description.'),
  strengths: z.string().describe('A detailed summary of strengths.'),
  weaknesses: z.string().describe('A list of weaknesses or red flags.'),
  suggestions: z.string().describe('Suggestions to improve the resume.'),
  interviewQuestions: z.array(z.string()).describe('Interview questions based on the candidate’s profile.'),
  idealAnswers: z.array(z.string()).describe('Ideal answers based on what the resume implies.'),
});
export type SummarizeResumeOutput = z.infer<typeof SummarizeResumeOutputSchema>;

export async function summarizeResume(input: SummarizeResumeInput): Promise<SummarizeResumeOutput> {
  return summarizeResumeFlow(input);
}

const summarizeResumePrompt = ai.definePrompt({
  name: 'summarizeResumePrompt',
  input: {
    schema: z.object({
      jobDescription: z.string().describe('The job description to compare the resume against.'),
      resumeText: z.string().describe('The text content of the resume to summarize.'),
    }),
  },
  output: {
    schema: z.object({
      summary: z.string().describe('A concise summary of the resume, highlighting key skills, experiences, and potential concerns.'),
      matchScore: z.number().describe('A score (0-100) indicating how well the resume matches the job description.'),
      strengths: z.string().describe('A detailed summary of strengths.'),
      weaknesses: z.string().describe('A list of weaknesses or red flags.'),
      suggestions: z.string().describe('Suggestions to improve the resume.'),
      interviewQuestions: z.array(z.string()).describe('Interview questions based on the candidate’s profile.'),
      idealAnswers: z.array(z.string()).describe('Ideal answers based on what the resume implies.'),
    }),
  },
  prompt: `You are an AI-powered recruitment assistant. Analyze the following resume and job description to evaluate the candidate's suitability for the role.\n\nJob Description: {{{jobDescription}}}\n\nResume:\n{{{resumeText}}}\n\nProvide the following information:\n- A concise summary of the resume, highlighting key skills, experiences, and potential concerns.
- A match score (0-100) indicating how well the resume matches the job description.
- A detailed summary of strengths.
- A list of weaknesses or red flags.
- Suggestions to improve the resume.
- Interview questions based on the candidate’s profile.
- Ideal answers based on what the resume implies.`,
});

const summarizeResumeFlow = ai.defineFlow<
  typeof SummarizeResumeInputSchema,
  typeof SummarizeResumeOutputSchema
>(
  {
    name: 'summarizeResumeFlow',
    inputSchema: SummarizeResumeInputSchema,
    outputSchema: SummarizeResumeOutputSchema,
  },
  async input => {
    const {output} = await summarizeResumePrompt(input);
    return output!;
  }
);

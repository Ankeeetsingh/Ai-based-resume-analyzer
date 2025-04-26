import { analyzeResume } from '@/ai/flows/analyze-resume';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { jobTitle, jobDescription, expectedSalary, analysisMode, resumeDataUris } = await request.json();

    let analysisResults;

    if (analysisMode === "analyzing") {
      analysisResults = await analyzeResume({
        jobDescription: jobDescription,
        expectedSalary: expectedSalary,
        resumes: resumeDataUris,
      });
    } else {
      analysisResults = []; // Handle standard mode if needed
    }

    return NextResponse.json({ jobTitle, analysisResults }, { status: 200 });
  } catch (error: any) {
    console.error("Error in /api/analyze:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

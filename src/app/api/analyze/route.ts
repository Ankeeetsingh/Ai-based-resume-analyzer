import { analyzeResume } from '@/ai/flows/analyze-resume';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { jobTitle, jobDescription, expectedSalary, analysisMode, resumeDataUris, numCandidatesToShortlist } = await request.json();

    let analysisResults;

    if (analysisMode === "analyzing") {
      analysisResults = await analyzeResume({
        jobDescription: jobDescription,
        expectedSalary: expectedSalary,
        resumes: resumeDataUris,
        numCandidatesToShortlist: parseInt(numCandidatesToShortlist, 10) || 1, // Ensure it's a number
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

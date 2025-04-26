'use server';

/**
 * @fileOverview Defines the salary estimation service.
 *
 * - estimateSalary - A function that estimates an appropriate salary for a candidate.
 */

export interface EstimateSalaryParams {
  jobDescription: string;
  expectedSalary: string;
  resumeText: string;
  topSkills: string;
  highlights: string;
}

/**
 * Estimates an appropriate salary for a candidate based on their qualifications and experience.
 * @param params - The estimation parameters (jobDescription, expectedSalary, resumeText, topSkills, highlights).
 * @returns A string representing the suggested salary for the candidate.
 */
export async function estimateSalary(params: EstimateSalaryParams): Promise<string> {
  // TODO: Implement salary estimation logic using an AI model or a rule-based system.
  // This is a placeholder implementation that returns the expected salary.
  console.log('Estimating salary:', params);

  // Extract numeric value from expected salary string
  let monthlySalaryLower = 50000; // default values
  let monthlySalaryUpper = 60000;

  try {
      const salaryString = params.expectedSalary;

      // Split the string by spaces and look for "lakh"
      const parts = salaryString.split(" ");
      let annualSalaryLakh;
      for (let i = 0; i < parts.length; i++) {
          if (parts[i].toLowerCase() === "lakh") {
              // Parse the numeric value before "lakh"
              annualSalaryLakh = parseFloat(parts[i - 1]);
              break;
          }
      }

      if (annualSalaryLakh) {
          // Convert annual salary (in lakhs) to monthly salary
          const annualSalary = annualSalaryLakh * 100000; // Convert lakhs to rupees
          monthlySalaryLower = (annualSalary / 12) * 0.9; // Lower bound (10% less)
          monthlySalaryUpper = (annualSalary / 12) * 1.1; // Upper bound (10% more)
      }
  } catch (e) {
      console.error('Error estimating salary', e);
  }

  return Promise.resolve(`${Math.round(monthlySalaryLower / 1000)},000 to ${Math.round(monthlySalaryUpper / 1000)},000 per month`);
}

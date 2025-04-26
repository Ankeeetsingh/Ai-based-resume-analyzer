# **App Name**: ResumeRank AI

## Core Features:

- File Upload: Upload interface for job description and multiple resumes.
- AI-Powered Analysis: Leverage ChatGPT as a reasoning tool to analyze job descriptions and resumes in Analyzing Mode, evaluate semantic alignment, score resumes (0-100%), and provide detailed summaries, weaknesses, suggestions, and tailored interview questions with ideal answers. Standard Mode uses rule-based and ML shortlisting.
- Results Display: Display ranked resumes, scores, summaries, and interview content in a clear, tabular format.
- Mode Selection: Toggle between Standard Mode (rule-based + ML) and Analyzing Mode (full ChatGPT-powered analysis).

## Style Guidelines:

- Primary color: Light gray (#F5F5F5) for a clean background.
- Secondary color: Dark blue (#3F51B5) for headers and important text.
- Accent: Teal (#009688) to highlight key actions and interactive elements.
- Use a clear, tabular layout for displaying resume rankings and details.
- Use simple, professional icons to represent skills, experience, and education.
- Subtle animations to highlight important information and guide the user through the analysis process.
- Modern, readable font (e.g., Roboto, Open Sans) to ensure clarity. Use varied font weights for hierarchy.
- Implement a dark mode option for improved user experience in low-light environments.
- Visually appealing theme related to recruitment and AI, using relevant imagery and graphics.

## Original User Request:
Prompt to AI for Web Application Development:

Create a full-stack web application using:

Python for NLP/ML logic

Flask for backend deployment

HTML/CSS for frontend

ChatGPT API integration for intelligent automation and resume analysis


Project Title:
AI-Powered Recruitment Assistant
An intelligent tool to automate resume shortlisting and interview question generation using NLP, ML, and ChatGPT.


Key Features:
1. Standard Resume Shortlisting Mode (Rule-Based + ML):
Accepts job description and multiple resumes.

Extracts features from resumes:

Skills, Experience, Education, Certifications, Achievements

Compares each resume to the job description using NLP techniques.

Calculates and displays:

Match Score (percentage)

Rank

Strengths

Weaknesses & Suggestions

Generates tailored interview questions + example answers.

2. Analyzing Mode (Full ChatGPT-Powered Mode):
In this mode, all core logic is handled entirely by ChatGPT, providing deep, accurate, and human-like evaluation.

ChatGPT will:

Analyze job description + resumes.

Evaluate each resume semantically against the job description.

Score each resume (0–100%) based on full contextual alignment.

Rank resumes from most to least relevant.

Provide:

A detailed summary of strengths

A list of weaknesses or red flags

Suggestions to improve the resume

Generate interview questions based on each candidate’s profile.

Create ideal answers based on what the resume implies.

Benefits of Analyzing Mode:

More nuanced ranking, considering context, tone, and intent.

Better detection of vague claims or missing info.

Saves time by offloading all logic to a high-level LLM.


Tech Stack:
Frontend:
HTML/CSS + Bootstrap

Upload interface for job description and resumes

Toggle: Standard Mode vs Analyzing Mode

Results display: Ranked resumes, scores, summaries, interview content

Backend:
Flask for routing and API integration

Resume parser (e.g., PyMuPDF for PDFs)

Standard Mode: NLP libraries like SpaCy, sklearn, or Sentence Transformers

Analyzing Mode:

Sends job description + each resume to ChatGPT API

Parses and displays AI responses

Secure API handling, async support for better performance


User Workflow:
User visits web interface.

Uploads a job description and multiple resumes.

Chooses mode:

Standard (NLP + ML logic locally)

Analyzing (ChatGPT handles all analysis)

System processes inputs:

In Standard Mode: Scores and ranks using vector-based logic.

In Analyzing Mode: ChatGPT provides full output — ranking, highlights, weaknesses, questions, and answers.

User reviews results and exports if needed.


Output Per Candidate:
Match Score (0–100%)

Resume Rank

Top Skills & Highlights

Weak Points or Concerns

Suggestions to Improve

Interview Questions (customized)

Model Answers
  
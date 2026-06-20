import { AiOption } from "../../../components/UI/TextEditor/AiAssistant/AiOptions";

export const STANDARD_OPTIONS: AiOption[] = [
  {
    id: "grammar",
    label: "Fix Grammar & Clarity",
    insertText: "Fix the grammar and improve the clarity of this text.",
    description: "Correct errors and simplify phrasing",
  },
  {
    id: "job",
    label: "Optimize for Job Description",
    insertText:
      "Optimize this content to align with the job description and required skills.",
    description: "Match keywords from the job posting",
  },
  {
    id: "expand",
    label: "Expand Details",
    insertText:
      "Expand these bullet points with more specific accomplishments and metrics.",
    description: "Add quantifiable results and context",
  },
];

export const ADVANCED_OPTIONS: AiOption[] = [
  {
    id: "ats",
    label: "Optimize for ATS",
    insertText:
      "Optimize this content to pass Applicant Tracking Systems with relevant keywords.",
    description: "Improve keyword density for ATS parsers",
  },
  {
    id: "confidence",
    label: "Boost Confidence",
    insertText:
      "Rewrite this using strong action verbs and confident, impactful language.",
    description: "Use assertive language and power words",
  },
  {
    id: "technical",
    label: "Make It More Technical",
    insertText:
      "Rewrite this to include more technical depth and specific terminology.",
    description: "Add technical specificity and precision",
  },
];

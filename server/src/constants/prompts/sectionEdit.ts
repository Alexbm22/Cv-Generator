import { WRITING_STANDARDS, SECTION_SCHEMA_REFERENCE } from './shared';

export const SECTION_EDIT_SYSTEM_PROMPT = `${WRITING_STANDARDS}

${SECTION_SCHEMA_REFERENCE}

## Output
Respond with exactly one valid JSON object — no text, markdown, or code fences outside it.
{"ItemEditOperation": {"operationType": "update_item", "sectionType": "<sectionType>", "itemId": "<itemId>", "newValue": "<JSON-stringified item>", "originalValue": "<JSON-stringified original>"}, "message": "<1–2 sentences>"}
The message field must be outside ItemEditOperation, cannot be empty, and explains what changed or why changes weren't possible. No additional fields.

## Field Rules
1. operationType: always "update_item".
2. sectionType: exact value from context.
3. itemId: exact value from context.
4. newValue: JSON-stringified item with ALL original fields preserved; change only what's requested.
5. originalValue: JSON-stringified original item exactly as provided.
6. message: 1–2 sentences; cannot be empty.
7. Cannot fulfill → newValue = originalValue, explain in message. Off-topic → no changes, politely decline.

## Field Formats
- description: HTML only — <ul><li><strong><em><p>. No markdown.
- startDate / endDate: ISO 8601 (YYYY-MM-DD). Year only → YYYY-01-01. Year+month → YYYY-MM-01.
- All other fields: plain string.

## Date Extraction
Extract startDate/endDate from any temporal signal — explicit dates, corrections, relative refs ("3 years ago"), durations ("6-month internship"), life events ("after I graduated in 2022"). Compute missing bound from duration + anchor. Resolve relative years against ${new Date().getFullYear()}. Omit only if zero temporal information.`;

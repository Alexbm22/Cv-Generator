// Lowercases credential values so lookups match regardless of input casing (PostgreSQL is case-sensitive).
export const lowerCaseIfString = (value: unknown): unknown =>
    typeof value === 'string' ? value.toLowerCase() : value;

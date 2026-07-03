import { useMemo } from 'react';

const checks = [
  { label: '8+ characters', test: (value) => value.length >= 8 },
  { label: 'Uppercase letter', test: (value) => /[A-Z]/.test(value) },
  { label: 'Lowercase letter', test: (value) => /[a-z]/.test(value) },
  { label: 'Number', test: (value) => /\d/.test(value) },
  { label: 'Special character', test: (value) => /[^A-Za-z\d]/.test(value) }
];

export const usePasswordStrength = (password = '') =>
  useMemo(() => {
    const satisfied = checks.filter((check) => check.test(password)).length;
    const score = satisfied / checks.length;

    return {
      score,
      label: score >= 1 ? 'Strong' : score >= 0.6 ? 'Good' : score >= 0.4 ? 'Fair' : 'Weak',
      checklist: checks.map((check) => ({
        ...check,
        satisfied: check.test(password)
      }))
    };
  }, [password]);


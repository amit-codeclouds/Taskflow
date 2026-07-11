import axios from 'axios';

export function extractErrorMessage(err: unknown, fallback = 'Something went wrong'): string {
  if (axios.isAxiosError(err)) {
    const d = err.response?.data;
    const firstError = Array.isArray(d?.errors) ? d.errors[0] : undefined;
    return (
      d?.message ||
      (typeof firstError === 'string' ? firstError : firstError?.message) ||
      d?.error ||
      err.message ||
      fallback
    );
  }
  if (err instanceof Error) return err.message || fallback;
  return fallback;
}

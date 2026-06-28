import axios from 'axios';

export function extractErrorMessage(err: unknown, fallback = 'Something went wrong'): string {
  if (axios.isAxiosError(err)) {
    const d = err.response?.data;
    return (
      d?.message ||
      (Array.isArray(d?.errors) && d.errors[0]) ||
      d?.error ||
      err.message ||
      fallback
    );
  }
  if (err instanceof Error) return err.message || fallback;
  return fallback;
}

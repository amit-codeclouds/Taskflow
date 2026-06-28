import axios from 'axios';

export function extractErrorMessage(err: unknown, fallback = 'Something went wrong'): string {
  if (axios.isAxiosError(err)) {
    return (
      err.response?.data?.message ??
      err.response?.data?.error ??
      err.message ??
      fallback
    );
  }
  if (err instanceof Error) return err.message;
  return fallback;
}

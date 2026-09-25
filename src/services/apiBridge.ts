const BACKEND_URL = 'http://127.0.0.1:8000';

export interface BackendHealthStatus {
  connected: boolean;
  status: string;
  engine: string;
}

export async function checkBackendHealth(): Promise<BackendHealthStatus> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);

    const res = await fetch(`${BACKEND_URL}/api/health`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      return {
        connected: true,
        status: 'online',
        engine: 'FastAPI + Python ML'
      };
    }
  } catch {
    // Backend offline or unreachable
  }

  return {
    connected: false,
    status: 'standby',
    engine: 'In-Browser ML Runtime'
  };
}

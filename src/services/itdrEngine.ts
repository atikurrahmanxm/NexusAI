import { AuthSessionEvent, IdentityUser, HaversineResult, GeoLocation } from '../types/itdr';

// Earth radius in kilometers
const EARTH_RADIUS_KM = 6371;

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

// Mathematical Haversine Distance Calculation
export function calculateHaversineDistance(
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number {
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = EARTH_RADIUS_KM * c;

  return Math.round(distance);
}

// Evaluate impossible travel velocity between two points
export function evaluateTravelVelocity(
  locA: GeoLocation,
  timeA: number, // timestamp ms
  locB: GeoLocation,
  timeB: number  // timestamp ms
): HaversineResult {
  const distanceKm = calculateHaversineDistance(locA.lat, locA.lng, locB.lat, locB.lng);
  const timeDeltaHours = Math.max(0.01, Math.abs(timeB - timeA) / (1000 * 60 * 60));
  const velocityKmh = Math.round(distanceKm / timeDeltaHours);

  // Commercial jet cruising speed threshold is approx 900 km/h
  const isImpossible = velocityKmh > 900 && distanceKm > 100;

  let explanation = `Normal travel feasibility. Traveled ${distanceKm} km over ${timeDeltaHours.toFixed(2)} hours (${velocityKmh} km/h).`;
  if (velocityKmh > 10000) {
    explanation = `CRITICAL IMPOSSIBLE TRAVEL! Speed of ${velocityKmh.toLocaleString()} km/h exceeds orbital velocity. Concurrent credential breach from ${locA.city} and ${locB.city}.`;
  } else if (isImpossible) {
    explanation = `IMPOSSIBLE TRAVEL: Speed of ${velocityKmh.toLocaleString()} km/h exceeds maximum supersonic commercial aviation speed (900 km/h).`;
  }

  return {
    cityA: `${locA.city}, ${locA.country}`,
    cityB: `${locB.city}, ${locB.country}`,
    distanceKm,
    timeDeltaHours: parseFloat(timeDeltaHours.toFixed(2)),
    velocityKmh,
    isImpossible,
    explanation
  };
}

// Preset City Geocodes for Sandbox
export const PRESET_LOCATIONS: Record<string, GeoLocation> = {
  dhaka: {
    city: 'Dhaka',
    country: 'Bangladesh',
    countryCode: 'BD',
    lat: 23.8103,
    lng: 90.4125,
    ip: '103.205.71.18'
  },
  frankfurt: {
    city: 'Frankfurt',
    country: 'Germany',
    countryCode: 'DE',
    lat: 50.1109,
    lng: 8.6821,
    ip: '185.220.101.5'
  },
  newyork: {
    city: 'New York',
    country: 'United States',
    countryCode: 'US',
    lat: 40.7128,
    lng: -74.0060,
    ip: '198.51.100.22'
  },
  tokyo: {
    city: 'Tokyo',
    country: 'Japan',
    countryCode: 'JP',
    lat: 35.6762,
    lng: 139.6503,
    ip: '210.140.10.5'
  },
  london: {
    city: 'London',
    country: 'United Kingdom',
    countryCode: 'GB',
    lat: 51.5074,
    lng: -0.1278,
    ip: '195.181.160.10'
  },
  sydney: {
    city: 'Sydney',
    country: 'Australia',
    countryCode: 'AU',
    lat: -33.8688,
    lng: 151.2093,
    ip: '139.130.4.5'
  }
};

// Initial Corporate Directory Identities
export const INITIAL_IDENTITY_USERS: IdentityUser[] = [
  {
    id: 'USR-001',
    name: 'Atikur Rahman',
    email: 'atikur.rahman@nexus-security.io',
    department: 'Cyber Operations & SecOps',
    role: 'Global Admin',
    mfaEnforced: true,
    lastActiveCity: 'Dhaka, BD',
    lastActiveIp: '103.205.71.18',
    riskScore: 88,
    riskLevel: 'critical',
    activeSessionsCount: 2,
    isLocked: false
  },
  {
    id: 'USR-002',
    name: 'Sarah Jenkins',
    email: 'sarah.j@nexus-security.io',
    department: 'Infrastructure Cloud Eng',
    role: 'DevOps Engineer',
    mfaEnforced: true,
    lastActiveCity: 'New York, US',
    lastActiveIp: '198.51.100.22',
    riskScore: 78,
    riskLevel: 'high',
    activeSessionsCount: 2,
    isLocked: false
  },
  {
    id: 'USR-003',
    name: 'Marcus Vance',
    email: 'm.vance@nexus-security.io',
    department: 'Finance & Compliance',
    role: 'Billing Manager',
    mfaEnforced: true,
    lastActiveCity: 'London, GB',
    lastActiveIp: '195.181.160.10',
    riskScore: 84,
    riskLevel: 'critical',
    activeSessionsCount: 1,
    isLocked: false
  },
  {
    id: 'USR-004',
    name: 'Elena Rostova',
    email: 'elena.r@nexus-security.io',
    department: 'Security Analytics',
    role: 'Security Lead',
    mfaEnforced: true,
    lastActiveCity: 'Frankfurt, DE',
    lastActiveIp: '50.110.22.4',
    riskScore: 12,
    riskLevel: 'low',
    activeSessionsCount: 1,
    isLocked: false
  },
  {
    id: 'USR-005',
    name: 'Kenji Sato',
    email: 'k.sato@nexus-security.io',
    department: 'Customer Success',
    role: 'Standard User',
    mfaEnforced: true,
    lastActiveCity: 'Tokyo, JP',
    lastActiveIp: '210.140.10.5',
    riskScore: 5,
    riskLevel: 'low',
    activeSessionsCount: 1,
    isLocked: false
  }
];

// Initial Real-Time Auth Session Events
export const INITIAL_AUTH_SESSIONS: AuthSessionEvent[] = [
  {
    id: 'SES-9101',
    userId: 'USR-001',
    userName: 'Atikur Rahman',
    email: 'atikur.rahman@nexus-security.io',
    timestamp: '17:22:15',
    loginTime: Date.now() - 1000 * 60 * 14, // 14 mins ago
    geo: PRESET_LOCATIONS.frankfurt,
    device: 'Kali Linux / Tor Exit Node',
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64) TorBrowser/12.0',
    authMethod: 'OAuth2_Bearer',
    mfaAttempts: 1,
    isImpossibleTravel: true,
    travelDistanceKm: 7080,
    timeDeltaHours: 0.23,
    calculatedVelocityKmh: 30782,
    isMfaFatigue: false,
    status: 'active'
  },
  {
    id: 'SES-9102',
    userId: 'USR-001',
    userName: 'Atikur Rahman',
    email: 'atikur.rahman@nexus-security.io',
    timestamp: '17:08:00',
    loginTime: Date.now() - 1000 * 60 * 28, // 28 mins ago
    geo: PRESET_LOCATIONS.dhaka,
    device: 'MacBook Pro M3 Max / Chrome 129',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    authMethod: 'Password_MFA',
    mfaAttempts: 1,
    isImpossibleTravel: false,
    isMfaFatigue: false,
    status: 'active'
  },
  {
    id: 'SES-9103',
    userId: 'USR-002',
    userName: 'Sarah Jenkins',
    email: 'sarah.j@nexus-security.io',
    timestamp: '17:15:30',
    loginTime: Date.now() - 1000 * 60 * 21,
    geo: PRESET_LOCATIONS.tokyo,
    device: 'Ubuntu 24.04 LTS / Chrome 128',
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64)',
    authMethod: 'SSO_SAML',
    mfaAttempts: 1,
    isImpossibleTravel: true,
    travelDistanceKm: 10850,
    timeDeltaHours: 0.5,
    calculatedVelocityKmh: 21700,
    isMfaFatigue: false,
    status: 'active'
  },
  {
    id: 'SES-9104',
    userId: 'USR-003',
    userName: 'Marcus Vance',
    email: 'm.vance@nexus-security.io',
    timestamp: '17:24:05',
    loginTime: Date.now() - 1000 * 60 * 4,
    geo: PRESET_LOCATIONS.london,
    device: 'Android 14 / Microsoft Authenticator Spam',
    userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8)',
    authMethod: 'Password_MFA',
    mfaAttempts: 18, // 18 pushes in 4 minutes!
    isImpossibleTravel: false,
    isMfaFatigue: true,
    status: 'active'
  },
  {
    id: 'SES-9105',
    userId: 'USR-004',
    userName: 'Elena Rostova',
    email: 'elena.r@nexus-security.io',
    timestamp: '16:50:10',
    loginTime: Date.now() - 1000 * 60 * 45,
    geo: PRESET_LOCATIONS.frankfurt,
    device: 'Windows 11 / Edge 129',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    authMethod: 'Password_MFA',
    mfaAttempts: 1,
    isImpossibleTravel: false,
    isMfaFatigue: false,
    status: 'active'
  }
];

// LocalStorage helpers
const ITDR_USERS_KEY = 'nexus_itdr_users';
const ITDR_SESSIONS_KEY = 'nexus_itdr_sessions';

export function loadItdrUsers(): IdentityUser[] {
  try {
    const saved = localStorage.getItem(ITDR_USERS_KEY);
    if (saved) return JSON.parse(saved);
  } catch {
    // Fallback
  }
  return INITIAL_IDENTITY_USERS;
}

export function saveItdrUsers(users: IdentityUser[]): void {
  try {
    localStorage.setItem(ITDR_USERS_KEY, JSON.stringify(users));
  } catch {
    // Quota
  }
}

export function loadItdrSessions(): AuthSessionEvent[] {
  try {
    const saved = localStorage.getItem(ITDR_SESSIONS_KEY);
    if (saved) return JSON.parse(saved);
  } catch {
    // Fallback
  }
  return INITIAL_AUTH_SESSIONS;
}

export function saveItdrSessions(sessions: AuthSessionEvent[]): void {
  try {
    localStorage.setItem(ITDR_SESSIONS_KEY, JSON.stringify(sessions));
  } catch {
    // Quota
  }
}

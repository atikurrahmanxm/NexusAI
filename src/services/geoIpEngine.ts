import { SecurityEvent } from '../types/telemetry';
import { ThreatNodeLocation, ActiveAttackVector, CountryAttackMetric } from '../types/geomap';

export const PROTECTED_CLUSTERS: Record<string, ThreatNodeLocation> = {
  'us-east-k8s-pod': {
    id: 'us-east-k8s-pod',
    name: 'US-East K8s Node',
    xPercent: 26,
    yPercent: 35,
    country: 'United States',
    countryCode: 'US',
    isTargetCluster: true
  },
  'edge-proxy-lon-02': {
    id: 'edge-proxy-lon-02',
    name: 'London Edge Proxy',
    xPercent: 48,
    yPercent: 28,
    country: 'United Kingdom',
    countryCode: 'GB',
    isTargetCluster: true
  },
  'auth-gateway-primary': {
    id: 'auth-gateway-primary',
    name: 'AP-South Gateway',
    xPercent: 74,
    yPercent: 52,
    country: 'Singapore',
    countryCode: 'SG',
    isTargetCluster: true
  },
  'db-cluster-replica-3': {
    id: 'db-cluster-replica-3',
    name: 'EU Central Database',
    xPercent: 52,
    yPercent: 32,
    country: 'Germany',
    countryCode: 'DE',
    isTargetCluster: true
  },
  'alpha-gamma-01': {
    id: 'alpha-gamma-01',
    name: 'Primary Mesh Gateway',
    xPercent: 30,
    yPercent: 38,
    country: 'United States',
    countryCode: 'US',
    isTargetCluster: true
  }
};

/**
 * Resolves source IP to geo-coordinate on world projection.
 */
export function resolveIpToGeo(ip: string): ThreatNodeLocation {
  if (ip.startsWith('185.220')) {
    return { id: `geo-${ip}`, name: 'Amsterdam Tor Exit', xPercent: 50, yPercent: 27, country: 'Netherlands', countryCode: 'NL' };
  }
  if (ip.startsWith('45.154')) {
    return { id: `geo-${ip}`, name: 'Moscow Botnet Cluster', xPercent: 62, yPercent: 24, country: 'Russia', countryCode: 'RU' };
  }
  if (ip.startsWith('194.26')) {
    return { id: `geo-${ip}`, name: 'Frankfurt Exploit Hub', xPercent: 51, yPercent: 30, country: 'Germany', countryCode: 'DE' };
  }
  if (ip.startsWith('103.149')) {
    return { id: `geo-${ip}`, name: 'Shenzhen Scanner Node', xPercent: 80, yPercent: 44, country: 'China', countryCode: 'CN' };
  }
  if (ip.startsWith('91.240')) {
    return { id: `geo-${ip}`, name: 'Kyiv C2 Beaconing', xPercent: 57, yPercent: 28, country: 'Ukraine', countryCode: 'UA' };
  }
  if (ip.startsWith('198.51')) {
    return { id: `geo-${ip}`, name: 'North American Proxy', xPercent: 22, yPercent: 40, country: 'United States', countryCode: 'US' };
  }

  // Fallback hash mapping for arbitrary IPs
  const hash = ip.split('.').reduce((acc, octet) => acc + parseInt(octet, 10), 0);
  const x = (hash * 17) % 80 + 10;
  const y = (hash * 23) % 60 + 20;

  return {
    id: `geo-${ip}`,
    name: `Autonomous Subnet (${ip})`,
    xPercent: x,
    yPercent: y,
    country: 'Global Relay',
    countryCode: 'GL'
  };
}

/**
 * Maps active security events into attack vectors.
 */
export function extractAttackVectors(events: SecurityEvent[]): ActiveAttackVector[] {
  const threatEvents = events.filter(e => e.attackType !== 'Benign').slice(0, 10);

  return threatEvents.map(event => {
    const sourceLoc = resolveIpToGeo(event.sourceIp);
    const targetLoc = PROTECTED_CLUSTERS[event.targetNode] || PROTECTED_CLUSTERS['alpha-gamma-01'];

    return {
      id: `vector-${event.id}`,
      sourceIp: event.sourceIp,
      sourceLocation: sourceLoc,
      targetLocation: targetLoc,
      attackType: event.attackType,
      severity: event.severity,
      timestamp: event.timestamp
    };
  });
}

/**
 * Computes attack leaderboard by country.
 */
export function computeCountryMetrics(events: SecurityEvent[]): CountryAttackMetric[] {
  const countryCounts: Record<string, { count: number; countryCode: string; vectors: Record<string, number> }> = {};

  const threatEvents = events.filter(e => e.attackType !== 'Benign');
  const total = threatEvents.length || 1;

  threatEvents.forEach(e => {
    const geo = resolveIpToGeo(e.sourceIp);
    if (!countryCounts[geo.country]) {
      countryCounts[geo.country] = { count: 0, countryCode: geo.countryCode, vectors: {} };
    }
    countryCounts[geo.country].count++;
    countryCounts[geo.country].vectors[e.attackType] = (countryCounts[geo.country].vectors[e.attackType] || 0) + 1;
  });

  return Object.entries(countryCounts)
    .map(([country, data]) => {
      // Find top attack vector for this country
      let topVector = 'DDoS';
      let maxVecCount = 0;
      Object.entries(data.vectors).forEach(([vec, cnt]) => {
        if (cnt > maxVecCount) {
          maxVecCount = cnt;
          topVector = vec;
        }
      });

      return {
        country,
        countryCode: data.countryCode,
        count: data.count,
        percentage: Math.round((data.count / total) * 100),
        topVector: topVector as any
      };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

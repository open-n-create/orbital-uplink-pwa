// ============================================================
// Local Satellite Infrastructure IP Registry
// Completely offline – no network requests
// ============================================================
// Data derived from publicly documented ranges:
// • Starlink CGNAT: 100.64.0.0/10 (RFC 6598 shared space)
// • Observed public / PoP blocks associated with Starlink / SpaceX
// • Representative enterprise VSAT / BGAN style blocks for simulation

export const SATELLITE_IP_POOL = [
  // ----- Starlink CGNAT (client-side addresses) -----
  { type: "CGNAT", asn: "AS14593", org: "SpaceX Starlink", cidr: "100.64.0.0/10",
    examples: ["100.64.15.82", "100.64.87.19", "100.72.194.12", "100.89.3.201", "100.100.42.7"] },
  { type: "CGNAT", asn: "AS14593", org: "SpaceX Starlink", cidr: "100.64.0.0/10",
    examples: ["100.65.210.44", "100.71.8.133", "100.78.255.1", "100.91.67.90", "100.110.22.18"] },

  // ----- Starlink Public Gateway / PoP style blocks (representative) -----
  { type: "Public Gateway", asn: "AS14593", org: "SpaceX Starlink", cidr: "206.214.238.0/24",
    examples: ["206.214.238.41", "206.214.238.92", "206.214.238.155"] },
  { type: "Public Gateway", asn: "AS14593", org: "SpaceX Starlink", cidr: "206.214.239.0/24",
    examples: ["206.214.239.8", "206.214.239.67", "206.214.239.201"] },
  { type: "Public Gateway", asn: "AS14593", org: "SpaceX Starlink", cidr: "98.97.32.0/24",
    examples: ["98.97.32.14", "98.97.32.88", "98.97.32.201"] },
  { type: "Public Gateway", asn: "AS14593", org: "SpaceX Starlink", cidr: "170.203.201.0/24",
    examples: ["170.203.201.33", "170.203.201.109"] },

  // ----- Enterprise VSAT / BGAN style simulation blocks -----
  { type: "VSAT Gateway", asn: "ASXXXX", org: "Enterprise VSAT", cidr: "192.0.2.0/24",
    examples: ["192.0.2.10", "192.0.2.45", "192.0.2.200"] },
  { type: "BGAN Terminal", asn: "ASYYYY", org: "Inmarsat-style", cidr: "198.51.100.0/24",
    examples: ["198.51.100.22", "198.51.100.77", "198.51.100.150"] },
  { type: "Maritime VSAT", asn: "ASZZZZ", org: "Maritime Uplink", cidr: "203.0.113.0/24",
    examples: ["203.0.113.5", "203.0.113.88", "203.0.113.199"] }
];

/**
 * Returns a random authentic-looking satellite IP configuration
 * from the local registry. Purely client-side.
 */
export function getRandomSatelliteConfig() {
  const pool = SATELLITE_IP_POOL;
  const entry = pool[Math.floor(Math.random() * pool.length)];
  const ip = entry.examples[Math.floor(Math.random() * entry.examples.length)];

  // Generate a plausible gateway / netmask / DNS set
  const octets = ip.split(".").map(Number);
  const gateway = `${octets[0]}.${octets[1]}.${octets[2]}.1`;
  const netmask = entry.type === "CGNAT" ? "255.192.0.0" : "255.255.255.0";
  const dnsPrimary = entry.type === "CGNAT" ? "100.64.0.1" : "8.8.8.8";
  const dnsSecondary = entry.type === "CGNAT" ? "100.64.0.2" : "1.1.1.1";

  return {
    assignedIp: ip,
    gateway,
    netmask,
    dns: [dnsPrimary, dnsSecondary],
    type: entry.type,
    asn: entry.asn,
    organization: entry.org,
    cidr: entry.cidr,
    mtu: entry.type === "CGNAT" ? 1500 : 1400,
    protocol: "IPv4",
    timestamp: new Date().toISOString()
  };
}

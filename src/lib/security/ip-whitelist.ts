/**
 * IP Whitelisting Utilities
 * Provides functions to validate IP addresses against configured whitelists
 * Supports individual IPs, IP ranges, and CIDR notation
 */

// IP whitelist configuration interface
export interface IPWhitelistConfig {
  enabled: boolean
  allowedIPs: string[]
  allowedRanges: string[]
  allowLocalhost: boolean
  allowPrivateNetworks: boolean
}

// Default configuration
const DEFAULT_CONFIG: IPWhitelistConfig = {
  enabled: process.env.IP_WHITELIST_ENABLED === 'true',
  allowedIPs: process.env.IP_WHITELIST_IPS?.split(',').map(ip => ip.trim()) || [],
  allowedRanges: process.env.IP_WHITELIST_RANGES?.split(',').map(range => range.trim()) || [],
  allowLocalhost: process.env.IP_WHITELIST_ALLOW_LOCALHOST !== 'false', // Default true
  allowPrivateNetworks: process.env.IP_WHITELIST_ALLOW_PRIVATE !== 'false', // Default true
}

/**
 * Validates if an IP address is in valid IPv4 format
 */
export function isValidIPv4(ip: string): boolean {
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
  return ipv4Regex.test(ip)
}

/**
 * Validates if an IP address is in valid IPv6 format
 */
export function isValidIPv6(ip: string): boolean {
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$/
  return ipv6Regex.test(ip)
}

/**
 * Checks if an IP address is valid (IPv4 or IPv6)
 */
export function isValidIP(ip: string): boolean {
  return isValidIPv4(ip) || isValidIPv6(ip)
}

/**
 * Checks if an IP is a localhost address
 */
export function isLocalhost(ip: string): boolean {
  const localhostIPs = ['127.0.0.1', '::1', 'localhost']
  return localhostIPs.includes(ip) || ip.startsWith('127.')
}

/**
 * Checks if an IP is in a private network range
 */
export function isPrivateNetwork(ip: string): boolean {
  if (!isValidIPv4(ip)) return false
  
  const parts = ip.split('.').map(Number)
  
  // Private IPv4 ranges:
  // 10.0.0.0/8 (10.0.0.0 to 10.255.255.255)
  // 172.16.0.0/12 (172.16.0.0 to 172.31.255.255)
  // 192.168.0.0/16 (192.168.0.0 to 192.168.255.255)
  
  if (parts[0] === 10) return true
  if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true
  if (parts[0] === 192 && parts[1] === 168) return true
  
  return false
}

/**
 * Converts IP address to a 32-bit integer for range comparison
 */
function ipToInt(ip: string): number {
  return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0
}

/**
 * Parses CIDR notation and returns network info
 */
export function parseCIDR(cidr: string): { network: number; mask: number } | null {
  const match = cidr.match(/^(\d+\.\d+\.\d+\.\d+)\/(\d+)$/)
  if (!match) return null
  
  const [, networkIP, prefixLength] = match
  const prefix = parseInt(prefixLength, 10)
  
  if (!isValidIPv4(networkIP) || prefix < 0 || prefix > 32) {
    return null
  }
  
  const network = ipToInt(networkIP)
  const mask = (0xffffffff << (32 - prefix)) >>> 0
  
  return { network: network & mask, mask }
}

/**
 * Checks if an IP address is within a CIDR range
 */
export function isIPInCIDR(ip: string, cidr: string): boolean {
  if (!isValidIPv4(ip)) return false
  
  const cidrInfo = parseCIDR(cidr)
  if (!cidrInfo) return false
  
  const ipInt = ipToInt(ip)
  return (ipInt & cidrInfo.mask) === cidrInfo.network
}

/**
 * Checks if an IP is within an IP range (start-end format)
 */
export function isIPInRange(ip: string, range: string): boolean {
  if (!isValidIPv4(ip)) return false
  
  const match = range.match(/^(\d+\.\d+\.\d+\.\d+)\s*-\s*(\d+\.\d+\.\d+\.\d+)$/)
  if (!match) return false
  
  const [, startIP, endIP] = match
  
  if (!isValidIPv4(startIP) || !isValidIPv4(endIP)) return false
  
  const ipInt = ipToInt(ip)
  const startInt = ipToInt(startIP)
  const endInt = ipToInt(endIP)
  
  return ipInt >= startInt && ipInt <= endInt
}

/**
 * Checks if an IP address is allowed based on whitelist configuration
 */
export function isIPWhitelisted(ip: string, config: IPWhitelistConfig = DEFAULT_CONFIG): boolean {
  // If IP whitelisting is disabled, allow all IPs
  if (!config.enabled) {
    return true
  }
  
  // Validate IP format
  if (!isValidIP(ip)) {
    console.warn(`Invalid IP address format: ${ip}`)
    return false
  }
  
  // Allow localhost if configured
  if (config.allowLocalhost && isLocalhost(ip)) {
    return true
  }
  
  // Allow private networks if configured
  if (config.allowPrivateNetworks && isPrivateNetwork(ip)) {
    return true
  }
  
  // Check exact IP matches
  if (config.allowedIPs.includes(ip)) {
    return true
  }
  
  // Check IP ranges and CIDR blocks
  for (const range of config.allowedRanges) {
    try {
      // Check if it's a CIDR notation
      if (range.includes('/')) {
        if (isIPInCIDR(ip, range)) {
          return true
        }
      }
      // Check if it's an IP range (start-end)
      else if (range.includes('-')) {
        if (isIPInRange(ip, range)) {
          return true
        }
      }
      // Check if it's a single IP
      else if (range === ip) {
        return true
      }
    } catch (error) {
      console.warn(`Error checking IP range '${range}':`, error)
    }
  }
  
  return false
}

/**
 * Gets the client IP from a request object or headers
 */
export function getClientIP(request: Request | { headers: Headers } | { get: (name: string) => string | null }): string | null {
  try {
    let headers: Headers | { get: (name: string) => string | null }
    
    if ('headers' in request) {
      headers = request.headers
    } else {
      headers = request
    }
    
    // Check common headers for real IP (in order of preference)
    const headerNames = [
      'x-forwarded-for',
      'x-real-ip',
      'x-client-ip',
      'cf-connecting-ip', // Cloudflare
      'x-forwarded',
      'forwarded-for',
      'forwarded',
    ]
    
    for (const headerName of headerNames) {
      const headerValue = headers.get(headerName)
      if (headerValue) {
        // x-forwarded-for can contain multiple IPs, take the first one
        const ip = headerValue.split(',')[0].trim()
        if (isValidIP(ip)) {
          return ip
        }
      }
    }
    
    return null
  } catch (error) {
    console.warn('Error extracting client IP:', error)
    return null
  }
}

/**
 * Validates IP whitelist configuration
 */
export function validateIPWhitelistConfig(config: Partial<IPWhitelistConfig>): string[] {
  const errors: string[] = []
  
  if (config.allowedIPs) {
    for (const ip of config.allowedIPs) {
      if (!isValidIP(ip)) {
        errors.push(`Invalid IP address: ${ip}`)
      }
    }
  }
  
  if (config.allowedRanges) {
    for (const range of config.allowedRanges) {
      if (range.includes('/')) {
        // CIDR notation
        if (!parseCIDR(range)) {
          errors.push(`Invalid CIDR notation: ${range}`)
        }
      } else if (range.includes('-')) {
        // IP range
        const match = range.match(/^(\d+\.\d+\.\d+\.\d+)\s*-\s*(\d+\.\d+\.\d+\.\d+)$/)
        if (!match || !isValidIPv4(match[1]) || !isValidIPv4(match[2])) {
          errors.push(`Invalid IP range: ${range}`)
        }
      } else {
        // Single IP
        if (!isValidIP(range)) {
          errors.push(`Invalid IP in ranges: ${range}`)
        }
      }
    }
  }
  
  return errors
}

/**
 * Gets the current IP whitelist configuration from environment variables
 */
export function getIPWhitelistConfig(): IPWhitelistConfig {
  return { ...DEFAULT_CONFIG }
}

/**
 * Middleware helper function to check if request IP is whitelisted
 */
export function checkIPWhitelist(
  request: Request | { headers: Headers },
  config?: IPWhitelistConfig
): { allowed: boolean; ip: string | null; reason?: string } {
  const clientIP = getClientIP(request)
  const whitelistConfig = config || getIPWhitelistConfig()
  
  if (!clientIP) {
    return {
      allowed: !whitelistConfig.enabled, // Allow if whitelisting is disabled
      ip: null,
      reason: 'Could not determine client IP address'
    }
  }
  
  const allowed = isIPWhitelisted(clientIP, whitelistConfig)
  
  return {
    allowed,
    ip: clientIP,
    reason: allowed ? undefined : `IP ${clientIP} is not whitelisted`
  }
}

/**
 * Utility untuk menangani avatar URLs agar kompatibel dengan CORS
 * dan proxy configuration
 */

const API_URL = import.meta.env.VITE_API_URL || '';

// Log API URL on initialization in production
if (import.meta.env.MODE === 'production') {
  console.log('[Avatar Utils Init] VITE_API_URL:', import.meta.env.VITE_API_URL);
  console.log('[Avatar Utils Init] API_URL:', API_URL);
}

/**
 * Normalize avatar URL untuk menghindari CORS issues
 * Converts absolute backend URLs ke relative URLs yang akan di-proxy melalui frontend
 * 
 * @param avatarUrl - URL avatar dari backend (bisa absolute atau relative)
 * @returns Normalized URL yang aman untuk digunakan
 */
export function normalizeAvatarUrl(avatarUrl?: string | null): string | undefined {
  if (!avatarUrl) return undefined;

  try {
    // Debug log in production
    if (import.meta.env.MODE === 'production') {
      console.log('[Avatar Utils] Input URL:', avatarUrl);
      console.log('[Avatar Utils] API_URL:', API_URL);
    }

    // Jika URL sudah absolute dengan http/https
    if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://')) {
      const url = new URL(avatarUrl);
      // Extract path saja (e.g., /storage/avatars/xxx.jpg)
      const path = url.pathname;
      
      // Return API URL + path untuk proxy melalui backend API
      const normalizedUrl = `${API_URL}${path}`;
      
      if (import.meta.env.MODE === 'production') {
        console.log('[Avatar Utils] Normalized URL:', normalizedUrl);
      }
      
      return normalizedUrl;
    }

    // Jika sudah relative path (e.g., /storage/avatars/xxx.jpg)
    if (avatarUrl.startsWith('/')) {
      const normalizedUrl = `${API_URL}${avatarUrl}`;
      
      if (import.meta.env.MODE === 'production') {
        console.log('[Avatar Utils] Normalized URL (relative):', normalizedUrl);
      }
      
      return normalizedUrl;
    }

    // Jika format lain, kembalikan as-is
    if (import.meta.env.MODE === 'production') {
      console.log('[Avatar Utils] Returned as-is:', avatarUrl);
    }
    
    return avatarUrl;
  } catch (error) {
    console.error('Error normalizing avatar URL:', error);
    return avatarUrl;
  }
}

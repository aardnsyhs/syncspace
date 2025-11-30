/**
 * Utility untuk menangani avatar URLs agar kompatibel dengan CORS
 * dan proxy configuration
 */

const API_URL = import.meta.env.VITE_API_URL;

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
    // Jika URL sudah absolute dengan http/https
    if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://')) {
      const url = new URL(avatarUrl);
      // Extract path saja (e.g., /storage/avatars/xxx.jpg)
      const path = url.pathname;
      
      // Return API URL + path untuk proxy melalui backend API
      return `${API_URL}${path}`;
    }

    // Jika sudah relative path (e.g., /storage/avatars/xxx.jpg)
    if (avatarUrl.startsWith('/')) {
      return `${API_URL}${avatarUrl}`;
    }

    // Jika format lain, kembalikan as-is
    return avatarUrl;
  } catch (error) {
    console.error('Error normalizing avatar URL:', error);
    return avatarUrl;
  }
}

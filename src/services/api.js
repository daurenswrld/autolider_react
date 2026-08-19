/**
 * Autolider Marketplace Production API Client
 * Senior-level HTTP Service with safe response handling and zero HTML parse crashes.
 */

const API_BASE_URL = 'http://localhost:5000';

export async function requestApi(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders = {
    'Accept': 'application/json',
    ...(options.headers || {})
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers: defaultHeaders
    });

    const contentType = response.headers.get('content-type') || '';

    // Handle non-JSON responses (e.g., HTML error pages) gracefully
    if (!contentType.includes('application/json')) {
      const text = await response.text();
      console.error(`API Non-JSON Response [${response.status}] from ${url}:`, text.slice(0, 300));
      throw new Error(`Ошибка бэкенда (${response.status}). Ответ сервера не является JSON.`);
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `Ошибка сервера (${response.status})`);
    }

    return data;
  } catch (error) {
    console.error(`API Client Error (${endpoint}):`, error.message);
    throw error;
  }
}

/**
 * Upload image file safely to server (Multer + Sharp pipeline)
 */
export async function uploadImageFile(file, type = 'img') {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('type', type);

  const url = `${API_BASE_URL}/api/upload`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json'
      }
    });

    const contentType = response.headers.get('content-type') || '';

    if (!contentType.includes('application/json')) {
      const textText = await response.text();
      console.error('Upload endpoint returned HTML/non-JSON:', textText.slice(0, 300));
      throw new Error('Сервер загрузки вернул некорректный формат ответа.');
    }

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Не удалось загрузить файл на сервер.');
    }

    return data; // { success: true, url: '/uploads/...', sizeKb: '42.5 KB', filename: '...' }
  } catch (err) {
    console.error('uploadImageFile exception:', err);
    throw err;
  }
}

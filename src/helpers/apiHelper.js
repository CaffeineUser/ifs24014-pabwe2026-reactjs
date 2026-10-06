export const getAccessToken = () => {
  return localStorage.getItem('accessToken');
};

export const putAccessToken = (token) => {
  if (token) {
    localStorage.setItem('accessToken', token);
  } else {
    localStorage.removeItem('accessToken');
  }
};

export const apiHelper = async (endpoint, options = {}) => {
  const url = `${DELCOM_BASEURL}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const token = getAccessToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  // If body is FormData, don't set Content-Type so the browser sets it automatically with boundary
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  const config = {
    method: options.method || 'GET',
    headers,
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }
    
    return data;
  } catch (error) {
    throw error;
  }
};

import Axios from 'axios'

const API_BASE_URL = 'http://localhost:3002/api'

const axiosInstance = Axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const errorCode = error.response?.data?.code
      if (errorCode === 'TOKEN_EXPIRED' || errorCode === 'TOKEN_INVALID') {
        localStorage.removeItem('authToken')
        if (window.location.pathname !== '/' && window.location.pathname !== '/login') {
          window.location.href = '/'
        }
      }
    }
    return Promise.reject(error)
  }
)

export default axiosInstance

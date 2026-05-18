import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3001/api'
});

api.interceptors.request.use((config) => {
    // BUSCAR O TOKEN SEMPRE QUE UMA REQUISIÇÃO FOR FEITA
    const token = localStorage.getItem('token'); 
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {store} from "@store/index";
import {logout} from "@store/slices/authSlice";

const API_BASE_URL = 'http://localhost:8080/api'; // Change to your computer's IP for device testing

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

apiClient.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 403) {
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('user');
            // Navigation will be handled by the navigation container

            store.dispatch(logout());
        }
        return Promise.reject(error);
    }
);

export default apiClient;
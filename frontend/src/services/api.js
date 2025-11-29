import axios from 'axios';

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    const api = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    export const loginUser = async (username, password) => {
      const response = await api.post('/auth/login', { username, password });
      return response.data;
    };

    export const signupUser = async (username, password) => {
      const response = await api.post('/auth/signup', { username, password });
      return response.data;
    };

    export const fetchNotes = async (userId) => {
      const response = await api.get(`/notes/${userId}`);
      return response.data;
    };

    export const createNote = async (userId, title, content) => {
      const response = await api.post('/notes', { userId, title, content });
      return response.data;
    };

    export const deleteNote = async (noteId, userId) => {
      const response = await api.delete(`/notes/${noteId}`, { data: { userId } });
      return response.data;
    };
import axios from "axios"

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    }
});

export const signupUser = (body) => {
    return api.post('/auth/signup', body);
}

export const loginUser = (body) => {
    return api.post("/auth/login", body);
}

export const createRoom = (body) => {
    return api.post("/room/create", body);
}

export const joinRoom = (body) => {
    return api.post("/room/join", body);
}

export const getRoomDetails = (body) => {
    return api.get(`/room/details?roomId=${body.roomId}`);
}

export const uploadFile = (body) => {
    return api.post('/file/upload', body);
}

export const getRoomFiles = (roomId) => {
    return api.get(`/room/files?roomId=${roomId}`);
}

export const getFileContent = (filename) => {
    return api.get(`/file/${filename}`);;
}

export const saveChanges = (body) => {
    return api.post("/file/update", body);
}

export const sendMessage = (body) => {
    return api.post("/message/send", body);
}

export const getMessages = (roomId) => {
    return api.get(`/message/?roomId=${roomId}`);
}
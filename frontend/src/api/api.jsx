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
    // Encode the filename to handle paths with folders and special characters
    // Only encode special characters, keep forward slashes as-is
    const encodedFilename = filename.split('/').map(part => encodeURIComponent(part)).join('/');
    return api.get(`/file/${encodedFilename}`);
}

export const saveChanges = (body) => {
    return api.post("/file/update", body);
}

export const deleteFile = (body) => {
    // Send fileName as query parameter for better compatibility
    return api.delete(`/file/delete?fileName=${encodeURIComponent(body.fileName)}`);
}

export const deleteFolder = (body) => {
    // Send as query parameters for better compatibility
    return api.delete(`/file/delete-folder?folderName=${encodeURIComponent(body.folderName)}&roomId=${encodeURIComponent(body.roomId)}`);
}

export const sendMessage = (body) => {
    return api.post("/message/send", body);
}

export const getMessages = (roomId) => {
    return api.get(`/message/?roomId=${roomId}`);
}
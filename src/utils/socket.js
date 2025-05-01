import { io } from 'socket.io-client';
import { jwtDecode } from 'jwt-decode';
const URL = 'https://35.170.246.241';

const token = window.location.search.split('=')[1];

console.log("TOKEN form window location", token);

export const socket = io(URL, {
    extraHeaders: {
        Authorization: `Bearer ${token}`
    }
});

// Decode the token
const decodedToken = jwtDecode(token);
console.log("TOKEN", decodedToken);
import jwt from "jsonwebtoken";

export function genAccess(payload) {
    return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '15m'});
}

export function genRefresh(payload) {
    return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {expiresIn: '7d'});
}

export function verifyAccess(token) {
    return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
}

export function verifyRefresh(token) {
    return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
}

import jwt from "jsonwebtoken";
import 'dotenv/config';

export const createAccessToken = async (data) => {
    return await jwt.sign({
        data
    }, process.env.JSON_WEB_SECRET, { expiresIn: process.env.JSON_WEB_EXPIRY });
}

export const createRefreshToken = async (data) => {
    return await jwt.sign({
        data
    }, process.env.JSON_REFRESH_SECRET, { expiresIn: process.env.JSON_REFRESH_EXPIRY });
}

export const verifyAccessToken = async (token) => {
    return await jwt.verify(token, process.env.JSON_WEB_SECRET);
}

export const verifyRefreshToken = async (token) => {
    return await jwt.verify(token, process.env.JSON_REFRESH_SECRET)
}
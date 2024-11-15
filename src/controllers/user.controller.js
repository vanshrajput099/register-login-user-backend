import { Token } from "../models/token.model.js";
import { User } from "../models/user.model.js";
import { ApiErrors } from "../utils/ApiErrors.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { cloudinaryDelete, cloudinaryUpload } from "../utils/cloudinary.js";
import fs from "fs";
import randomstring from "randomstring";
import { sendChangePasswordMail, sendTokenMail } from "../utils/nodeMailer.js";
import { createAccessToken, createRefreshToken } from "../utils/jsonwebTokens.js";

export const registerUser = asyncHandler(async (req, res) => {
    const { username, email, password, fullName } = req.body;

    if (!username || !email || !password || !fullName || [username, email, password].some((ele) => ele.trim() === "")) {
        return res.status(402).json(new ApiErrors(402, "All fields are neccessary"));
    }

    //Email regex checking
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!gmailRegex.test(email)) {
        return res.status(402).json(new ApiErrors(402, "Wrong Email Address Input"));
    }

    const existedUser = await User.findOne({ $or: [{ username }, { email }] });

    if (existedUser) {
        return res.status(409).json(new ApiErrors(409, "User with given email address or username already exists."));
    }

    //Cloudinary Upload
    let path = null;
    let url = undefined;
    if (Object.keys(req.files).length !== 0) {
        path = req.files.avatar[0].path;
    }

    if (path) {
        const cloudinaryRes = await cloudinaryUpload(path);
        url = cloudinaryRes.url + "--" + cloudinaryRes.public_id;
        fs.unlinkSync(path);
    }

    const creatingUser = await User.create({
        username,
        email,
        password,
        avatar: url,
        fullName,
    });

    const token = await Token.create({
        tokenId: randomstring.generate(),
        user: creatingUser._id,
    })

    if (!creatingUser) {
        return res.status(409).json(new ApiErrors(500, "Internal server error while creating the user"));
    }

    await sendTokenMail(email, token.tokenId);
    const user = await User.findOne({ username }).select("-password");
    return res.status(201).json(new ApiResponse(200, user, "User Created Successfully, Verification mail has been sended."));
});

export const loginUser = asyncHandler(async (req, res) => {
    const { username, password, email } = req.body;
    const user = await User.findOne({ $or: [{ username }, { email }] });
    if (!user) {
        return res.status(402).json(new ApiErrors(402, "User doesnot exist"));
    }

    if (!user.isVerified) {
        return res.status(402).json(new ApiErrors(402, "User is not verified"));
    }

    const passwordVerify = await user.isPasswordCorrect(password);
    if (!passwordVerify) {
        return res.status(402).json(new ApiErrors(402, "Wrong password input"));
    }

    const accessTokenData = {
        _id: user._id,
        username: user.username,
        email: user.email
    }

    const refreshTokenData = {
        _id: user._id,
    }

    const accessToken = await createAccessToken(accessTokenData);
    const refreshToken = await createRefreshToken(refreshTokenData);
    user.lastOnline = Date.now();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    const cookieOptions = {
        httpOnly: true,
        secure: true
    };

    const userSend = await User.findOne({ $or: [{ username }, { email }] }).select("-password -refreshToken");
    return res
        .cookie("accessToken", accessToken, cookieOptions)
        .status(200)
        .json(new ApiResponse(200, userSend, "User logged in successfully !!"));

});

export const logoutUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user);
    user.refreshToken = "";
    await user.save({ validateBeforeSave: false });

    const cookieOptions = {
        httpOnly: true,
        secure: true,
    };

    res.clearCookie("accessToken", cookieOptions).status(200).json(new ApiResponse(200, {}, "User LoggedOut Successfully !!"));
});

export const updateUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user).select("-password -refreshToken");
    const { username, fullName } = req.body;

    if (username) {
        const checkUsername = await User.findOne({ username });
        if (checkUsername) {
            return res.status(409).json(new ApiResponse(409, "User with same username already exists"));
        }
        else {
            user.username = username;
        }
    }

    if (fullName) {
        user.fullName = fullName;
    }

    await user.save({ validateBeforeSave: false });
    return res.status(200).json(new ApiResponse(200, user, "User updated successfully !!"));
})

export const updateAvatar = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user).select("-password -refreshToken");
    let path = null;
    let url = undefined;
    if (Object.keys(req.files).length !== 0) {
        path = req.files.avatar[0].path;
    }
    else {
        return res.status(200).json(new ApiResponse(200, "No Image Selected"));
    }

    if (path) {
        const cloudinaryRes = await cloudinaryUpload(path);
        url = cloudinaryRes.url + "--" + cloudinaryRes.public_id;
        fs.unlinkSync(path);
    }

    if (user.avatar !== null) {
        await cloudinaryDelete(user.avatar.split("--")[1]);
    }

    user.avatar = url;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json(new ApiResponse(200, user, "Avatar updated successfully !!"));
});

export const changePassword = asyncHandler(async (req, res) => {
    //Token send to verify and then change the password;
    const token = await Token.create({
        tokenId: randomstring.generate(),
        user: req.user,
    });

    const user = await User.findById(req.user);
    await sendChangePasswordMail(user.email, token.tokenId);
    res.status(200).json(new ApiResponse(200, "Mail Sended Successfully !!"));
});
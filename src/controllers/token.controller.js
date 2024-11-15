import { Token } from "../models/token.model.js";
import { User } from "../models/user.model.js";
import { ApiErrors } from "../utils/ApiErrors.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import randomstring from "randomstring";
import { sendTokenMail } from "../utils/nodeMailer.js";

export const verifyToken = asyncHandler(async (req, res) => {
    const token = await Token.findOne({ tokenId: req.query.token });
    if (!token) {
        return res.status(401).json(new ApiErrors(401, "Invalid Token"));
    }

    const user = await User.findOne({ _id: token.user });

    if (!user) {
        return res.status(402).json(new ApiErrors(402, "Invalid User"));
    }

    if (user.isVerified) {
        return res.status(200).json(new ApiResponse(200, "User is already verified"));
    }

    user.isVerified = true;
    const saveUser = await user.save({ validateBeforeSave: false });

    if (!saveUser) {
        return res.status(500).json(new ApiErrors(500, "Internal Server Error"));
    }

    await token.deleteOne();

    return res.status(200).json(new ApiResponse(200, "User verified Successfully !!"));
});

export const resendToken = asyncHandler(async (req, res) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        return res.status(404).json(new ApiErrors(404, "User not found"));
    }

    if (user.isVerified) {
        return res.status(400).json(new ApiResponse(400, "User is already verified"));
    }

    const existingToken = await Token.findOne({ user: user._id });
    if (existingToken) {
        await existingToken.deleteOne();
    }

    const newToken = new Token({ user: user._id, tokenId: randomstring.generate() });
    await newToken.save();

    if (!newToken) {
        res.status(500).json(new ApiResponse(500, "Internal Server Error"));
    }

    await sendTokenMail(user.email, newToken.tokenId);

    return res.status(200).json(new ApiResponse(200, "Verification token resent successfully"));
});

export const checkChangePassword = asyncHandler(async (req, res) => {
    const token = await Token.find({ tokenId: req.query.token });

    if (!token) {
        return res.status(402).json(new ApiErrors(402, "Token is Invalid"));
    }

    const user = await User.find({ username: req.query.username });

    if (!user) {
        return res.status(402).json(new ApiErrors(402, "Invalid User"));
    }

    const { newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
        return res.status(402).json(new ApiErrors(402, "Passwords Doesnot Match !!"));
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json(new ApiResponse(200, "Password Updated Succesfully !!"));
});
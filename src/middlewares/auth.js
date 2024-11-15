import { User } from "../models/user.model.js";
import { ApiErrors } from "../utils/ApiErrors.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { verifyAccessToken } from "../utils/jsonwebTokens.js";

export const auth = asyncHandler(async (req, res, next) => {
    if (Object.keys(req.cookies).length === 0) {
        return res.status(404).json(new ApiErrors(404, "Token Not Found !!"));
    }
    const token = await verifyAccessToken(req.cookies.accessToken);
    if (!token) {
        return res.status(402).json(new ApiErrors(402, "Invalid Token , Relogin !!"));
    }

    const user = await User.findById(token.data._id);
    if (!user) {
        return res.status(402).json(new ApiErrors(402, "Invalid Token Or The User Doesnt Exist"));
    }
    req.user = user._id;
    next();
});
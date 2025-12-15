import { User } from "../models/users.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

export const verifyJWT = asyncHandler(async (req, _, next) => {
    try {

        // console.log(req.cookies?.accessToken)
        const access_token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")

        if(!access_token){
            throw new ApiError(401, "Unauthorized access request")
        }

        const decoded_token = jwt.verify(access_token, process.env.ACCESS_TOKEN_SECRET)

        const user = await User.findById(decoded_token?._id).select("-password -refreshToken");

        if(!user){
            throw new ApiError(401, "Invalid credentials")
        }

        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Something went wrong while logging out")
    }

})
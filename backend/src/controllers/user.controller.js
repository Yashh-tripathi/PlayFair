import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/users.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.service.js";
import { ApiRespose } from "../utils/ApiResponse.js";

export const registerUser = asyncHandler(async (req, res) => {
    // get User details from the request/frontend
    // validate - not empty, proper email format , etc.
    // check if user already exists or not : username , email
    // check for image and avatar
    // upload the image and avatar to cloudinary
    // create user object - db
    // remove password and refresh token field from the response
    // return res


    const {username, fullName, email, password} = req.body;

    if(
        [username, fullName, email, password].some((feild) => 
            feild?.trim() === ""
    )){
        throw new ApiError(
            400,
            "All fields are required",
        )
    }
    

    const existingUser = User.findOne({
        $or: [{ username }, { email }]
    });

    if(existingUser){
        throw new ApiError(409, "User already exists");
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;


    if(avatarLocalPath){
        throw new ApiError(400, "Avatar is required");
    }


    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if(!avatar){
        throw new ApiError(400, "Avatar is required");
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    });

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if(!createdUser){
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    return res.status(201).json(
        new ApiRespose(200, createdUser, "User registered successfully")
    )

});
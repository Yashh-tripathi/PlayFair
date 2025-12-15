import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/users.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.service.js";
import { ApiRespose } from "../utils/ApiResponse.js";


const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshtoken();


        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false})

        // console.log(" REFRESH TOKEN BEING SET FOR USER:", user._id);


        return {accessToken, refreshToken}
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}

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
    

    const existingUser = await User.findOne({
        $or: [{ username }, { email }]
    });

    if(existingUser){
        throw new ApiError(409, "User already exists");
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }




    if(!avatarLocalPath){
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
        username: username?.toString().trim().toLowerCase()
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

export const logginUser = asyncHandler(async (req, res) => {
    // req.body => values
    // validate values
    // find user
    // validate password
    // generate access and refresh token 
    // loggedin user

    console.log(req.body)
    const {username, email, password} = req.body;


    if(!(username || email || password)){
        throw new ApiError(400, "All feilds are required")
    }

    const user = await User.findOne(
        {$or: [{username}, {email}]}
    );

    if(!user){
        throw new ApiError(404, "User not found")
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if(!isPasswordValid){
        throw new ApiError(401, "Invalid user credentials")
    }

    const {accessToken , refreshToken} = await generateAccessAndRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: true
    }


    return res
    .status(200)
    .cookie("accessToken", accessToken,options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiRespose(
            200,
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged in successfully"
        )
    )
});

export const logoutUser = asyncHandler(async (req, res) => {
    const UpdatedUser = await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1 // this removes the field from document
            }
        }, 
        {
            new: true
        }
    )

    // console.log("Updated user: ", UpdatedUser)

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
        new ApiRespose(
            200,
            {},
            "User logged out successfully"
        )
    )
})


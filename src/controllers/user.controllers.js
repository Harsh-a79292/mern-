import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
    // 1. get user details from frontend
    const { fullName, email, username, password } = req.body;

    // 2. validation - not empty
    if ([fullName, email, username, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    // 3. check if user already exists: username, email
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists");
    }

    // 4. check for images, check for avatar
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
    }

    // 5. upload them to cloudinary, avatar
    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if (!avatar?.url) {
        throw new ApiError(400, "Error while uploading avatar");
    }

    // 6. create user object - create entry in db
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        email,
        password,
        username
    });

    // 7. remove password and refresh token field from response
    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    // 8. check for user creation
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    // 9. return res
    return res.status(201).json(
        new ApiResponse(201, createdUser, "User registered successfully")
    );
});

// YEH LINE ADD KAREIN:
export { registerUser };
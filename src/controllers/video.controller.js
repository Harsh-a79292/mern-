import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Video } from "../models/video.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// 1. Publish / Upload a Video Controller
const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;

    // 1. Validation - check if title and description are present
    if (!title || !description) {
        throw new ApiError(400, "Title and description are required");
    }

    // 2. Get video file and thumbnail local paths from req.files
    const videoFileLocalPath = req.files?.videoFile?.[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

    if (!videoFileLocalPath) {
        throw new ApiError(400, "Video file is required");
    }

    if (!thumbnailLocalPath) {
        throw new ApiError(400, "Thumbnail file is required");
    }

    // 3. Upload files to Cloudinary
    const videoFile = await uploadOnCloudinary(videoFileLocalPath);
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    if (!videoFile?.url) {
        throw new ApiError(400, "Video upload failed");
    }

    if (!thumbnail?.url) {
        throw new ApiError(400, "Thumbnail upload failed");
    }

    // 4. Create video document in database
    const video = await Video.create({
        videoFile: videoFile.url,
        thumbnail: thumbnail.url,
        title,
        description,
        duration: videoFile.duration || 0, // Cloudinary se milti hai duration
        owner: req.user?._id,
        isPublished: true
    });

    // 5. Send response
    return res
        .status(201)
        .json(
            new ApiResponse(201, video, "Video uploaded successfully")
        );
});

export {
    publishAVideo
};
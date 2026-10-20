import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Video } from "../models/video.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";

// 1. Publish / Upload a Video
const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;

    if (!title || !description) {
        throw new ApiError(400, "Title and description are required");
    }

    const videoFileLocalPath = req.files?.videoFile?.[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

    if (!videoFileLocalPath) {
        throw new ApiError(400, "Video file is required");
    }

    if (!thumbnailLocalPath) {
        throw new ApiError(400, "Thumbnail file is required");
    }

    const videoFile = await uploadOnCloudinary(videoFileLocalPath);
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    if (!videoFile?.url) {
        throw new ApiError(400, "Video upload failed");
    }

    if (!thumbnail?.url) {
        throw new ApiError(400, "Thumbnail upload failed");
    }

    const video = await Video.create({
        videoFile: videoFile.url,
        thumbnail: thumbnail.url,
        title,
        description,
        duration: videoFile.duration || 0,
        owner: req.user?._id,
        isPublished: true
    });

    return res
        .status(201)
        .json(new ApiResponse(201, video, "Video uploaded successfully"));
});

// 2. Get Video By ID
const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid Video ID");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, video, "Video fetched successfully"));
});

// 3. Get All Videos (Home Feed / Pagination ke sath)
const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
    
    // Yahan aap aggregation pipeline ya basic find use kar sakte hain
    const videos = await Video.find({ isPublished: true })
        .populate("owner", "username fullname avatar")
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit))
        .sort({ createdAt: -1 });

    return res
        .status(200)
        .json(new ApiResponse(200, videos, "All videos fetched successfully"));
});

// 4. Update Video Details
const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { title, description } = req.body;

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid Video ID");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    // Check if current user is the owner of the video
    if (video.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this video");
    }

    const thumbnailLocalPath = req.file?.path;
    let thumbnail;
    if (thumbnailLocalPath) {
        thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
        if (!thumbnail?.url) {
            throw new ApiError(400, "Error while uploading thumbnail");
        }
    }

    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                title: title || video.title,
                description: description || video.description,
                thumbnail: thumbnail?.url || video.thumbnail
            }
        },
        { new: true }
    );

    return res
        .status(200)
        .json(new ApiResponse(200, updatedVideo, "Video updated successfully"));
});

// 5. Delete Video
const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid Video ID");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    if (video.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this video");
    }

    await Video.findByIdAndDelete(videoId);

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Video deleted successfully"));
});

export {
    publishAVideo,
    getVideoById,
    getAllVideos,
    updateVideo,
    deleteVideo
};
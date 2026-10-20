import { Router } from "express";
import { 
    publishAVideo, 
    getVideoById, 
    getAllVideos, 
    updateVideo, 
    deleteVideo 
} from "../controllers/video.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// 1. Get All Videos & Publish Video Route
router.route("/").get(getAllVideos).post(
    verifyJWT, // Sirf logged-in user hi video upload kar sakega
    upload.fields([
        { name: "videoFile", maxCount: 1 },
        { name: "thumbnail", maxCount: 1 }
    ]),
    publishAVideo
);

// 2. Get Video By ID Route (Public - Bina login ke bhi dekh sakte hain)
router.route("/:videoId").get(getVideoById);

// 3. Update & Delete Video Routes (Protected - Sirf video owner hi update/delete kar sakega)
router.route("/:videoId")
    .patch(verifyJWT, upload.single("thumbnail"), updateVideo)
    .delete(verifyJWT, deleteVideo);

export default router;
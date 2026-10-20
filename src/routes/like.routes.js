import { Router } from "express";
import { 
    toggleVideoLike, 
    getLikedVideos 
} from "../controllers/like.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Sabhi like routes ke liye user ka logged-in hona zaroori hai
router.use(verifyJWT);

// Toggle Video Like Route
router.route("/toggle/v/:videoId").post(toggleVideoLike);

// Get All Liked Videos Route
router.route("/videos").get(getLikedVideos);

export default router;
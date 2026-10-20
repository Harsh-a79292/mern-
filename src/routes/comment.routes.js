import { Router } from "express";
import {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
} from "../controllers/comment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Route par middleware lagane se sabhi comment operations JWT protected ho jayenge
router.use(verifyJWT);

// Video specific routes
router.route("/v/:videoId")
    .get(getVideoComments)
    .post(addComment);

// Comment specific routes
router.route("/c/:commentId")
    .patch(updateComment)
    .delete(deleteComment);

export default router;
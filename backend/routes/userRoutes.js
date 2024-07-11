import express from "express";
const router = express.Router();
import { authUser,
        registerUser,
        getAllUsers,
        getUser,
        logoutUser,
        updateUser,
        deleteUser
 } from "../controllers/userController.js";
 import { protect } from "../middleware/authMiddleware.js";

router.post("/", registerUser);
router.route('/').get(protect, getAllUsers);
router.post("/auth", authUser);
router.get("/logout", logoutUser);
router.route("/profile").get(protect, getUser).put(protect, updateUser).delete(protect, deleteUser);


export default router;
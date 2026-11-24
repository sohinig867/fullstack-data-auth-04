const express = require("express");
const router = express.Router();
const authenticateToken =
require("../middleware/authMiddleware");
const authorizeRole =
require("../middleware/roleMiddleware");
const courseController =
require("../controllers/courseController");
// GET: View all courses (Admin and User).
router.get(
"/",
authenticateToken,
authorizeRole("admin", "user"),
courseController.getCourses
);
// GET: View one course (Admin and User).
router.get(
"/:id",
authenticateToken,
authorizeRole("admin", "user"),
courseController.getCourseById
);
// POST: Add course (Admin only).

router.post(
"/",
authenticateToken,
authorizeRole("admin"),
courseController.createCourse
);
// PUT: Update course (Admin only).
router.put(
"/:id",
authenticateToken,
authorizeRole("admin"),
courseController.updateCourse
);
// DELETE: Delete course (Admin only).
router.delete(
"/:id",
authenticateToken,
authorizeRole("admin"),
courseController.deleteCourse
);
module.exports = router;
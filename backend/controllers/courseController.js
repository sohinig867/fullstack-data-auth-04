const db = require("../database/database");
// Validate course ID.
function getValidId(value) {
const id = Number(value);
return Number.isInteger(id) && id > 0 ? id : null;
}
// Validate course data.
function validateCourse(body) {
const { title, duration } = body || {};
const errors = [];
if (typeof title !== "string" || title.trim().length < 3) {
errors.push("title must be a string with at least 3 characters");
}
if (!Number.isInteger(duration) || duration < 1 || duration > 100) {
errors.push("duration must be an integer from 1 to 100");
}
return {
errors,
title: typeof title === "string" ? title.trim() : "",
duration
};
}
// GET all courses.
exports.getCourses = (req, res, next) => {
try {
const courses = db.prepare(
"SELECT id, title, duration FROM courses ORDER BY id ASC"
).all();
res.status(200).json({ data: courses });
} catch (error) {
next(error);
}
};
// GET one course by ID.
exports.getCourseById = (req, res, next) => {
const id = getValidId(req.params.id);
if (id === null) {
return res.status(400).json({
error: "id must be a positive integer"
});
}
try {
const course = db.prepare(
"SELECT id, title, duration FROM courses WHERE id = ?"
).get(id);
if (!course) {
return res.status(404).json({ error: "Course not found" });
}
res.status(200).json({ data: course });
} catch (error) {
next(error);
}
};
// CREATE course.
exports.createCourse = (req, res, next) => {
const { errors, title, duration } = validateCourse(req.body);
if (errors.length) {
return res.status(400).json({
error: "Validation failed",
details: errors
});
}
try {
const result = db.prepare(
"INSERT INTO courses (title, duration) VALUES (?, ?)"
).run(title, duration);
const course = db.prepare(
"SELECT id, title, duration FROM courses WHERE id = ?"
).get(result.lastInsertRowid);
res.status(201).json({
message: "Course created",
data: course
});
} catch (error) {
next(error);
}
};
// UPDATE course.
exports.updateCourse = (req, res, next) => {
const id = getValidId(req.params.id);
if (id === null) {
return res.status(400).json({
error: "id must be a positive integer"
});
}
const { errors, title, duration } = validateCourse(req.body);
if (errors.length) {
return res.status(400).json({
error: "Validation failed",
details: errors
});
}
try {
const existing = db.prepare(
"SELECT id FROM courses WHERE id = ?"
).get(id);
if (!existing) {
return res.status(404).json({ error: "Course not found" });
}
db.prepare(
"UPDATE courses SET title = ?, duration = ? WHERE id = ?"
).run(title, duration, id);
const updatedCourse = db.prepare(
"SELECT id, title, duration FROM courses WHERE id = ?"
).get(id);
res.status(200).json({
message: "Course updated",
data: updatedCourse
});
} catch (error) {
next(error);
}
};
// DELETE course.
exports.deleteCourse = (req, res, next) => {
const id = getValidId(req.params.id);
if (id === null) {
return res.status(400).json({
error: "id must be a positive integer"
});
}
try {
const course = db.prepare(
"SELECT id, title, duration FROM courses WHERE id = ?"
).get(id);
if (!course) {
return res.status(404).json({ error: "Course not found" });
}
db.prepare(
"DELETE FROM courses WHERE id = ?"
).run(id);
res.status(200).json({
message: "Course deleted",
data: course
});
} catch (error) {
next(error);
}
};
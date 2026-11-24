const Database = require("better-sqlite3");
const bcrypt = require("bcryptjs");
const path = require("path");
// IMPORTANT: Use the path of your existing SQLite database.
const dbPath = path.join(__dirname, "course_management.db");
const db = new Database(dbPath);
db.pragma("foreign_keys = ON");
// Create users table if it does not exist.
db.exec(`
CREATE TABLE IF NOT EXISTS users (
id INTEGER PRIMARY KEY AUTOINCREMENT,
name TEXT NOT NULL,
email TEXT UNIQUE NOT NULL,
password TEXT NOT NULL,
role TEXT NOT NULL DEFAULT 'user'
CHECK(role IN ('admin', 'user')),
created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`);
// Create courses table if it does not exist.
db.exec(`
CREATE TABLE IF NOT EXISTS courses (
id INTEGER PRIMARY KEY AUTOINCREMENT,
title TEXT NOT NULL,
duration INTEGER NOT NULL
);
`);
// Default accounts.
const defaultUsers = [
{
name: "Administrator",
email: "admin@college.com",
password: "pass@123",
role: "admin"
},
{
name: "Student",
email: "student@college.com",
password: "pass@123",
role: "user"
}
];
const findUser = db.prepare(
"SELECT id FROM users WHERE email = ?"
);
const insertUser = db.prepare(`
INSERT INTO users (name, email, password, role)
VALUES (?, ?, ?, ?)
`);
const createDefaultUsers = db.transaction(() => {
for (const user of defaultUsers) {
const existingUser = findUser.get(user.email);
if (!existingUser) {
const hashedPassword = bcrypt.hashSync(user.password, 12);
insertUser.run(
user.name,
user.email,
hashedPassword,
user.role
);
}
}
});
createDefaultUsers();
// Default courses.
const defaultCourses = [
{ title: "Data Structures", duration: 40 },
{ title: "Database Management Systems", duration: 45 },
{ title: "Web Development", duration: 50 },
{ title: "Operating Systems", duration: 40 },
{ title: "Natural Language Processing", duration: 45 }
];
const findCourse = db.prepare(
"SELECT id FROM courses WHERE title = ?"
);
const insertCourse = db.prepare(`
INSERT INTO courses (title, duration)
VALUES (?, ?)
`);

const createDefaultCourses = db.transaction(() => {
for (const course of defaultCourses) {
const existingCourse = findCourse.get(course.title);
if (!existingCourse) {
insertCourse.run(course.title, course.duration);
}
}
});
createDefaultCourses();
console.log("SQLite database connected successfully.");
console.log("Default accounts checked/created.");
console.log("Default courses checked/created.");
module.exports = db;
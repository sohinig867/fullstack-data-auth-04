const db = require("../database/database");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
exports.register = (req, res, next) => {
try {
const { name, email, password } = req.body || {};
if (
typeof name !== "string" || name.trim().length < 2 ||
typeof email !== "string" || !email.includes("@") ||
typeof password !== "string" || password.length < 6
) {
return res.status(400).json({
message: "Provide a valid name, email, and password (minimum 6 characters)."
});
}
const normalizedEmail = email.trim().toLowerCase();
const existingUser = db.prepare(
"SELECT id FROM users WHERE email = ?"
).get(normalizedEmail);
if (existingUser) {
return res.status(409).json({
message: "An account with this email already exists."
});
}
const hashedPassword = bcrypt.hashSync(password, 12);
const result = db.prepare(`
INSERT INTO users (name, email, password, role)
VALUES (?, ?, ?, 'user')
`).run(name.trim(), normalizedEmail, hashedPassword);
const user = db.prepare(`
SELECT id, name, email, role
FROM users
WHERE id = ?
`).get(result.lastInsertRowid);
res.status(201).json({
message: "Registration successful.",
user
});
} catch (error) {
next(error);
}
};
exports.login = (req, res, next) => {
try {
const { email, password } = req.body || {};
if (
typeof email !== "string" ||
typeof password !== "string" ||
!email.trim() ||
!password
) {
return res.status(400).json({
message: "Email and password are required."
});
}
const userRecord = db.prepare(`
SELECT id, name, email, password, role
FROM users
WHERE email = ?
`).get(email.trim().toLowerCase());
if (!userRecord || !bcrypt.compareSync(password, userRecord.password)) {
return res.status(401).json({
message: "Invalid email or password."
});
}
const payload = {
id: userRecord.id,
name: userRecord.name,
email: userRecord.email,
role: userRecord.role
};
const token = jwt.sign(
payload,
process.env.JWT_SECRET,
{ expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
);
res.status(200).json({
message: "Login successful.",
token,
user: payload
});
} catch (error) {
next(error);
}
};
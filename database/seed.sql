-- StudyHub Database Initial Seed Script
USE studyhub;

-- Disable Foreign Key checks temporarily for clean reseeding
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE downloads;
TRUNCATE TABLE bookmarks;
TRUNCATE TABLE resource_tags;
TRUNCATE TABLE tags;
TRUNCATE TABLE resources;
TRUNCATE TABLE resource_types;
TRUNCATE TABLE units;
TRUNCATE TABLE subjects;
TRUNCATE TABLE semesters;
TRUNCATE TABLE users;
TRUNCATE TABLE branches;
TRUNCATE TABLE roles;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Insert Initial Roles
INSERT INTO roles (id, name, description) VALUES
(1, 'STUDENT', 'Enrolled college student with access to academic resources'),
(2, 'FACULTY', 'Teaching faculty member with permission to upload & manage course materials'),
(3, 'ADMIN', 'System administrator with full system management permissions');

-- 2. Insert Academic Branches
INSERT INTO branches (id, name, code) VALUES
(1, 'Computer Science & Engineering', 'CSE'),
(2, 'Information Technology', 'IT'),
(3, 'Electronics & Communication Engineering', 'ECE'),
(4, 'Electrical & Electronics Engineering', 'EEE'),
(5, 'Mechanical Engineering', 'ME');

-- 3. Insert Semesters for CSE
INSERT INTO semesters (id, branch_id, number, name) VALUES
(1, 1, 1, 'Semester 1'),
(2, 1, 2, 'Semester 2'),
(3, 1, 3, 'Semester 3'),
(4, 1, 4, 'Semester 4'),
(5, 1, 5, 'Semester 5'),
(6, 1, 6, 'Semester 6'),
(7, 1, 7, 'Semester 7'),
(8, 1, 8, 'Semester 8');

-- 4. Insert Sample Subjects
INSERT INTO subjects (id, semester_id, name, code) VALUES
(1, 3, 'Data Structures & Algorithms', 'CS301'),
(2, 3, 'Computer Organization & Architecture', 'CS302'),
(3, 3, 'Object-Oriented Programming', 'CS303'),
(4, 4, 'Database Management Systems', 'CS401'),
(5, 4, 'Operating Systems', 'CS402'),
(6, 4, 'Discrete Mathematics', 'CS403');

-- 5. Insert Default Test Accounts
-- Password for all seed users: Student@123 / Faculty@123 / Admin@123
-- (Bcrypt hash cost 10 generated hash for 'Student@123': $2b$10$wN9P325h2NqZ1GZ5wY.Xv.F6E7/7Vd.oOa78wW0H71g.Z42F1V7a6)
-- (Bcrypt hash cost 10 generated hash for 'Faculty@123': $2b$10$wN9P325h2NqZ1GZ5wY.Xv.F6E7/7Vd.oOa78wW0H71g.Z42F1V7a6)
-- (Bcrypt hash cost 10 generated hash for 'Admin@123': $2b$10$wN9P325h2NqZ1GZ5wY.Xv.F6E7/7Vd.oOa78wW0H71g.Z42F1V7a6)

INSERT INTO users (id, name, email, password_hash, role_id, branch_id, semester_id, bio) VALUES
(1, 'Alex Student', 'student@studyhub.edu', '$2b$10$wN9P325h2NqZ1GZ5wY.Xv.F6E7/7Vd.oOa78wW0H71g.Z42F1V7a6', 1, 1, 4, 'Computer Science student passionate about web development.'),
(2, 'Dr. Sarah Connor', 'faculty@studyhub.edu', '$2b$10$wN9P325h2NqZ1GZ5wY.Xv.F6E7/7Vd.oOa78wW0H71g.Z42F1V7a6', 2, 1, NULL, 'Associate Professor, Department of Computer Science.'),
(3, 'System Administrator', 'admin@studyhub.edu', '$2b$10$wN9P325h2NqZ1GZ5wY.Xv.F6E7/7Vd.oOa78wW0H71g.Z42F1V7a6', 3, NULL, NULL, 'StudyHub Platform Administrator.');

-- 6. Insert Resource Types
INSERT INTO resource_types (id, name) VALUES
(1, 'Notes'),
(2, 'Previous Year Paper'),
(3, 'Question Bank'),
(4, 'Lab Manual'),
(5, 'Assignment'),
(6, 'Cheat Sheet'),
(7, 'Tutorial'),
(8, 'E-book'),
(9, 'Presentation'),
(10, 'Important Questions'),
(11, 'Study Guide'),
(12, 'Other');

-- 7. Insert Units for DBMS (subject_id = 4)
INSERT INTO units (id, subject_id, number, name) VALUES
(1, 4, 1, 'Introduction to DBMS'),
(2, 4, 2, 'Relational Model'),
(3, 4, 3, 'SQL and Advanced SQL'),
(4, 4, 4, 'Database Design & Normalization'),
(5, 4, 5, 'Transaction Management');

-- 8. Insert Tags
INSERT INTO tags (id, name) VALUES
(1, 'Database'),
(2, 'SQL'),
(3, 'Normalization'),
(4, 'Important'),
(5, 'Midterm');

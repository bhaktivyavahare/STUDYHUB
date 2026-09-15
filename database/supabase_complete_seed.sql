-- ============================================================================
-- StudyHub — Supabase PostgreSQL Complete Production Setup & Academic Data
-- Target Database: Supabase PostgreSQL (Standard ANSI / PostgreSQL)
-- Run this in your Supabase Dashboard -> SQL Editor
-- ============================================================================

-- 1. Ensure Roles
INSERT INTO roles (id, name, description)
VALUES 
  (1, 'STUDENT', 'Enrolled college student with access to academic resources'),
  (2, 'FACULTY', 'Teaching faculty member with permission to upload & manage course materials'),
  (3, 'ADMIN', 'System administrator with full system management permissions')
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name, 
  description = EXCLUDED.description;

-- 2. Ensure Resource Types
INSERT INTO resource_types (id, name)
VALUES 
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
  (12, 'Other')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- 3. Cleanup Dummy / Fake Accounts and Set Real Admin
DELETE FROM users 
WHERE email IN (
  'student@studyhub.edu', 
  'faculty@studyhub.edu', 
  'admin@studyhub.edu', 
  'admin@studyhub.demo'
) OR email LIKE 'test_%@studyhub.edu';

-- Set Bhakti Vyavahare as ADMIN
UPDATE users SET role_id = 3 WHERE email = 'vyavaharebhakti2@gmail.com';

-- 4. Create / Ensure Supabase Storage Bucket for Resources
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'studyhub-resources',
  'studyhub-resources',
  true,
  52428800, -- 50MB limit
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ]
)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage bucket access policies
DO $$
BEGIN
  -- Allow public read access to studyhub-resources bucket
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Public Access to studyhub-resources'
  ) THEN
    CREATE POLICY "Public Access to studyhub-resources" 
    ON storage.objects FOR SELECT 
    USING (bucket_id = 'studyhub-resources');
  END IF;

  -- Allow authenticated users to upload to studyhub-resources bucket
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Authenticated Uploads to studyhub-resources'
  ) THEN
    CREATE POLICY "Authenticated Uploads to studyhub-resources" 
    ON storage.objects FOR INSERT 
    WITH CHECK (bucket_id = 'studyhub-resources');
  END IF;
END $$;

-- 5. Branches (At least 5 core engineering branches + AI branches)
INSERT INTO branches (id, name, code)
VALUES
  (1, 'Computer Science & Engineering', 'CSE'),
  (2, 'Information Technology', 'IT'),
  (3, 'Electronics & Communication Engineering', 'ECE'),
  (4, 'Electrical & Electronics Engineering', 'EEE'),
  (5, 'Mechanical Engineering', 'ME'),
  (6, 'Civil Engineering', 'CE'),
  (7, 'Artificial Intelligence & Data Science', 'AIDS'),
  (8, 'Artificial Intelligence & Machine Learning', 'AIML')
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name, 
  code = EXCLUDED.code;

-- 6. Semesters (Semesters 1 to 8 for every single branch)
DO $$
DECLARE
  b RECORD;
  s INT;
BEGIN
  FOR b IN SELECT id FROM branches LOOP
    FOR s IN 1..8 LOOP
      INSERT INTO semesters (branch_id, number, name)
      VALUES (b.id, s, 'Semester ' || s)
      ON CONFLICT (branch_id, number) DO UPDATE SET name = 'Semester ' || s;
    END LOOP;
  END LOOP;
END $$;

-- 7. Standardized Curriculum Subjects for All Branches & Semesters
-- Helper function to insert subject and 5 units
CREATE OR REPLACE FUNCTION populate_studyhub_subject(
  p_branch_code VARCHAR,
  p_sem_num INT,
  p_code VARCHAR,
  p_name VARCHAR
) RETURNS VOID AS $$
DECLARE
  v_branch_id INT;
  v_sem_id INT;
  v_sub_id INT;
  u_num INT;
  u_names TEXT[] := ARRAY[
    'Unit 1: Fundamentals & Basic Concepts',
    'Unit 2: Theoretical Principles & Architecture',
    'Unit 3: Core Methodologies & Analysis',
    'Unit 4: Advanced Systems & Applications',
    'Unit 5: Case Studies & Emerging Technologies'
  ];
BEGIN
  SELECT id INTO v_branch_id FROM branches WHERE code = p_branch_code;
  SELECT id INTO v_sem_id FROM semesters WHERE branch_id = v_branch_id AND number = p_sem_num;

  IF v_sem_id IS NOT NULL THEN
    INSERT INTO subjects (semester_id, code, name)
    VALUES (v_sem_id, p_code, p_name)
    ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, semester_id = EXCLUDED.semester_id
    RETURNING id INTO v_sub_id;

    -- Insert 5 standard units
    FOR u_num IN 1..5 LOOP
      INSERT INTO units (subject_id, number, name)
      VALUES (v_sub_id, u_num, u_names[u_num])
      ON CONFLICT (subject_id, number) DO UPDATE SET name = EXCLUDED.name;
    END LOOP;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Populate Common Semesters 1 & 2 across ALL branches
DO $$
DECLARE
  b RECORD;
BEGIN
  FOR b IN SELECT code FROM branches LOOP
    -- Semester 1 (Common Engineering Foundation)
    PERFORM populate_studyhub_subject(b.code, 1, b.code || '101', 'Engineering Mathematics I');
    PERFORM populate_studyhub_subject(b.code, 1, b.code || '102', 'Engineering Physics');
    PERFORM populate_studyhub_subject(b.code, 1, b.code || '103', 'Basic Electrical Engineering');
    PERFORM populate_studyhub_subject(b.code, 1, b.code || '104', 'Engineering Graphics & CAD');
    PERFORM populate_studyhub_subject(b.code, 1, b.code || '105', 'Professional Communication');
    PERFORM populate_studyhub_subject(b.code, 1, b.code || '106', 'Programming for Problem Solving');

    -- Semester 2 (Common Engineering Foundation)
    PERFORM populate_studyhub_subject(b.code, 2, b.code || '201', 'Engineering Mathematics II');
    PERFORM populate_studyhub_subject(b.code, 2, b.code || '202', 'Engineering Chemistry');
    PERFORM populate_studyhub_subject(b.code, 2, b.code || '203', 'Basic Electronics Engineering');
    PERFORM populate_studyhub_subject(b.code, 2, b.code || '204', 'Engineering Mechanics');
    PERFORM populate_studyhub_subject(b.code, 2, b.code || '205', 'Environmental Science & Sustainability');
    PERFORM populate_studyhub_subject(b.code, 2, b.code || '206', 'Data Structures Fundamentals');
  END LOOP;
END $$;

-- Populate Branch Specific Subjects (Semesters 3 to 8)
-- Computer Science & Engineering (CSE)
DO $$
BEGIN
  -- Sem 3
  PERFORM populate_studyhub_subject('CSE', 3, 'CS301', 'Data Structures & Algorithms');
  PERFORM populate_studyhub_subject('CSE', 3, 'CS302', 'Computer Organization & Architecture');
  PERFORM populate_studyhub_subject('CSE', 3, 'CS303', 'Object-Oriented Programming with C++');
  PERFORM populate_studyhub_subject('CSE', 3, 'CS304', 'Discrete Mathematics');
  PERFORM populate_studyhub_subject('CSE', 3, 'CS305', 'Digital Logic & Microprocessors');
  PERFORM populate_studyhub_subject('CSE', 3, 'CS306', 'Business Communication & Ethics');
  -- Sem 4
  PERFORM populate_studyhub_subject('CSE', 4, 'CS401', 'Database Management Systems');
  PERFORM populate_studyhub_subject('CSE', 4, 'CS402', 'Operating Systems');
  PERFORM populate_studyhub_subject('CSE', 4, 'CS403', 'Computer Networks');
  PERFORM populate_studyhub_subject('CSE', 4, 'CS404', 'Design & Analysis of Algorithms');
  PERFORM populate_studyhub_subject('CSE', 4, 'CS405', 'Software Engineering');
  PERFORM populate_studyhub_subject('CSE', 4, 'CS406', 'Theory of Computation');
  -- Sem 5
  PERFORM populate_studyhub_subject('CSE', 5, 'CS501', 'Artificial Intelligence');
  PERFORM populate_studyhub_subject('CSE', 5, 'CS502', 'Compiler Design');
  PERFORM populate_studyhub_subject('CSE', 5, 'CS503', 'Web Technologies & Frameworks');
  PERFORM populate_studyhub_subject('CSE', 5, 'CS504', 'Computer Graphics & Visualization');
  PERFORM populate_studyhub_subject('CSE', 5, 'CS505', 'Information Security');
  PERFORM populate_studyhub_subject('CSE', 5, 'CS506', 'Cyber Laws & Professional Practice');
  -- Sem 6
  PERFORM populate_studyhub_subject('CSE', 6, 'CS601', 'Machine Learning');
  PERFORM populate_studyhub_subject('CSE', 6, 'CS602', 'Cloud Computing');
  PERFORM populate_studyhub_subject('CSE', 6, 'CS603', 'Distributed Systems');
  PERFORM populate_studyhub_subject('CSE', 6, 'CS604', 'Cryptography & Network Security');
  PERFORM populate_studyhub_subject('CSE', 6, 'CS605', 'Mobile Application Development');
  PERFORM populate_studyhub_subject('CSE', 6, 'CS606', 'Data Science & Big Data');
  -- Sem 7
  PERFORM populate_studyhub_subject('CSE', 7, 'CS701', 'Big Data Analytics');
  PERFORM populate_studyhub_subject('CSE', 7, 'CS702', 'Deep Learning & Neural Networks');
  PERFORM populate_studyhub_subject('CSE', 7, 'CS703', 'Internet of Things (IoT)');
  PERFORM populate_studyhub_subject('CSE', 7, 'CS704', 'Blockchain Technology');
  PERFORM populate_studyhub_subject('CSE', 7, 'CS705', 'Natural Language Processing');
  PERFORM populate_studyhub_subject('CSE', 7, 'CS706', 'Capstone Project Phase I');
  -- Sem 8
  PERFORM populate_studyhub_subject('CSE', 8, 'CS801', 'Cyber Security & Digital Forensics');
  PERFORM populate_studyhub_subject('CSE', 8, 'CS802', 'Quantum Computing Fundamentals');
  PERFORM populate_studyhub_subject('CSE', 8, 'CS803', 'High Performance Computing');
  PERFORM populate_studyhub_subject('CSE', 8, 'CS804', 'Advanced Cloud Architecture');
  PERFORM populate_studyhub_subject('CSE', 8, 'CS805', 'Industrial Internship');
  PERFORM populate_studyhub_subject('CSE', 8, 'CS806', 'Capstone Project Phase II');
END $$;

-- Information Technology (IT)
DO $$
BEGIN
  -- Sem 3
  PERFORM populate_studyhub_subject('IT', 3, 'IT301', 'Data Structures with Java');
  PERFORM populate_studyhub_subject('IT', 3, 'IT302', 'Computer Networks I');
  PERFORM populate_studyhub_subject('IT', 3, 'IT303', 'Digital Electronics & Logic');
  PERFORM populate_studyhub_subject('IT', 3, 'IT304', 'Discrete Mathematical Structures');
  PERFORM populate_studyhub_subject('IT', 3, 'IT305', 'Object-Oriented Software Design');
  PERFORM populate_studyhub_subject('IT', 3, 'IT306', 'Management Information Systems');
  -- Sem 4
  PERFORM populate_studyhub_subject('IT', 4, 'IT401', 'Database Systems & SQL');
  PERFORM populate_studyhub_subject('IT', 4, 'IT402', 'Operating System Principles');
  PERFORM populate_studyhub_subject('IT', 4, 'IT403', 'Computer Networks II');
  PERFORM populate_studyhub_subject('IT', 4, 'IT404', 'Web Development Frameworks');
  PERFORM populate_studyhub_subject('IT', 4, 'IT405', 'Python Programming for IT');
  PERFORM populate_studyhub_subject('IT', 4, 'IT406', 'Microprocessors & Interfacing');
  -- Sem 5
  PERFORM populate_studyhub_subject('IT', 5, 'IT501', 'Information & Cyber Security');
  PERFORM populate_studyhub_subject('IT', 5, 'IT502', 'Cloud Computing Principles');
  PERFORM populate_studyhub_subject('IT', 5, 'IT503', 'Data Mining & Warehousing');
  PERFORM populate_studyhub_subject('IT', 5, 'IT504', 'Full Stack Web Development');
  PERFORM populate_studyhub_subject('IT', 5, 'IT505', 'Agile Software Development');
  PERFORM populate_studyhub_subject('IT', 5, 'IT506', 'Applied Statistics for IT');
  -- Sem 6
  PERFORM populate_studyhub_subject('IT', 6, 'IT601', 'Machine Learning Applications');
  PERFORM populate_studyhub_subject('IT', 6, 'IT602', 'Mobile Computing & Android');
  PERFORM populate_studyhub_subject('IT', 6, 'IT603', 'DevOps & CI/CD Pipelines');
  PERFORM populate_studyhub_subject('IT', 6, 'IT604', 'Software Testing & QA');
  PERFORM populate_studyhub_subject('IT', 6, 'IT605', 'Enterprise Resource Planning');
  PERFORM populate_studyhub_subject('IT', 6, 'IT606', 'Network Administration');
  -- Sem 7
  PERFORM populate_studyhub_subject('IT', 7, 'IT701', 'Information Retrieval Systems');
  PERFORM populate_studyhub_subject('IT', 7, 'IT702', 'Big Data Engineering');
  PERFORM populate_studyhub_subject('IT', 7, 'IT703', 'Wireless & Ad-Hoc Networks');
  PERFORM populate_studyhub_subject('IT', 7, 'IT704', 'Augmented & Virtual Reality');
  PERFORM populate_studyhub_subject('IT', 7, 'IT705', 'Human-Computer Interaction');
  PERFORM populate_studyhub_subject('IT', 7, 'IT706', 'Capstone Project Phase I');
  -- Sem 8
  PERFORM populate_studyhub_subject('IT', 8, 'IT801', 'Cloud Native Microservices');
  PERFORM populate_studyhub_subject('IT', 8, 'IT802', 'Cyber Law & IT Compliance');
  PERFORM populate_studyhub_subject('IT', 8, 'IT803', 'Service Oriented Architecture');
  PERFORM populate_studyhub_subject('IT', 8, 'IT804', 'Storage Area Networks');
  PERFORM populate_studyhub_subject('IT', 8, 'IT805', 'IT Industrial Training');
  PERFORM populate_studyhub_subject('IT', 8, 'IT806', 'Capstone Project Phase II');
END $$;

-- Electronics & Communication Engineering (ECE)
DO $$
BEGIN
  -- Sem 3
  PERFORM populate_studyhub_subject('ECE', 3, 'EC301', 'Electronic Devices & Circuits');
  PERFORM populate_studyhub_subject('ECE', 3, 'EC302', 'Circuit Theory & Networks');
  PERFORM populate_studyhub_subject('ECE', 3, 'EC303', 'Digital Logic Design');
  PERFORM populate_studyhub_subject('ECE', 3, 'EC304', 'Signals & Systems');
  PERFORM populate_studyhub_subject('ECE', 3, 'EC305', 'Engineering Mathematics III');
  PERFORM populate_studyhub_subject('ECE', 3, 'EC306', 'Electronic Measurements & Instrumentation');
  -- Sem 4
  PERFORM populate_studyhub_subject('ECE', 4, 'EC401', 'Analog Electronics & Linear ICs');
  PERFORM populate_studyhub_subject('ECE', 4, 'EC402', 'Microprocessors & Assembly Language');
  PERFORM populate_studyhub_subject('ECE', 4, 'EC403', 'Electromagnetic Field Theory');
  PERFORM populate_studyhub_subject('ECE', 4, 'EC404', 'Analog Communication');
  PERFORM populate_studyhub_subject('ECE', 4, 'EC405', 'Control Systems Engineering');
  PERFORM populate_studyhub_subject('ECE', 4, 'EC406', 'Data Structures for ECE');
  -- Sem 5
  PERFORM populate_studyhub_subject('ECE', 5, 'EC501', 'Digital Signal Processing');
  PERFORM populate_studyhub_subject('ECE', 5, 'EC502', 'Microcontrollers & Embedded Systems');
  PERFORM populate_studyhub_subject('ECE', 5, 'EC503', 'Digital Communication Systems');
  PERFORM populate_studyhub_subject('ECE', 5, 'EC504', 'VLSI Design Fundamentals');
  PERFORM populate_studyhub_subject('ECE', 5, 'EC505', 'Transmission Lines & Waveguides');
  PERFORM populate_studyhub_subject('ECE', 5, 'EC506', 'Technical Writing for Engineers');
  -- Sem 6
  PERFORM populate_studyhub_subject('ECE', 6, 'EC601', 'CMOS Integrated Circuit Design');
  PERFORM populate_studyhub_subject('ECE', 6, 'EC602', 'Embedded Real-Time Systems');
  PERFORM populate_studyhub_subject('ECE', 6, 'EC603', 'Wireless Communication & 5G');
  PERFORM populate_studyhub_subject('ECE', 6, 'EC604', 'Optical Fiber Communication');
  PERFORM populate_studyhub_subject('ECE', 6, 'EC605', 'Computer Architecture & Organization');
  PERFORM populate_studyhub_subject('ECE', 6, 'EC606', 'Sensors & Actuators');
  -- Sem 7
  PERFORM populate_studyhub_subject('ECE', 7, 'EC701', 'Microwave & Radar Engineering');
  PERFORM populate_studyhub_subject('ECE', 7, 'EC702', 'VLSI Testing & Verilog HDL');
  PERFORM populate_studyhub_subject('ECE', 7, 'EC703', 'Digital Image Processing');
  PERFORM populate_studyhub_subject('ECE', 7, 'EC704', 'Embedded C & RTOS');
  PERFORM populate_studyhub_subject('ECE', 7, 'EC705', 'Antenna & Wave Propagation');
  PERFORM populate_studyhub_subject('ECE', 7, 'EC706', 'Capstone Project Phase I');
  -- Sem 8
  PERFORM populate_studyhub_subject('ECE', 8, 'EC801', 'Low Power VLSI Design');
  PERFORM populate_studyhub_subject('ECE', 8, 'EC802', 'Biomedical Electronics & Devices');
  PERFORM populate_studyhub_subject('ECE', 8, 'EC803', 'Satellite Communication');
  PERFORM populate_studyhub_subject('ECE', 8, 'EC804', 'MEMS & Nano-electronics');
  PERFORM populate_studyhub_subject('ECE', 8, 'EC805', 'Industrial Internship');
  PERFORM populate_studyhub_subject('ECE', 8, 'EC806', 'Capstone Project Phase II');
END $$;

-- Electrical & Electronics Engineering (EEE)
DO $$
BEGIN
  -- Sem 3
  PERFORM populate_studyhub_subject('EEE', 3, 'EE301', 'Electrical Circuit Analysis');
  PERFORM populate_studyhub_subject('EEE', 3, 'EE302', 'Analog Electronics');
  PERFORM populate_studyhub_subject('EEE', 3, 'EE303', 'Electromagnetic Fields');
  PERFORM populate_studyhub_subject('EEE', 3, 'EE304', 'Engineering Mathematics III');
  PERFORM populate_studyhub_subject('EEE', 3, 'EE305', 'Electrical Machines I (DC Machines)');
  PERFORM populate_studyhub_subject('EEE', 3, 'EE306', 'Electrical Measurements & Instruments');
  -- Sem 4
  PERFORM populate_studyhub_subject('EEE', 4, 'EE401', 'Electrical Machines II (AC Machines)');
  PERFORM populate_studyhub_subject('EEE', 4, 'EE402', 'Digital Electronics & Logic Design');
  PERFORM populate_studyhub_subject('EEE', 4, 'EE403', 'Control Systems Engineering');
  PERFORM populate_studyhub_subject('EEE', 4, 'EE404', 'Power Generation & Transmission');
  PERFORM populate_studyhub_subject('EEE', 4, 'EE405', 'Microprocessors & Applications');
  PERFORM populate_studyhub_subject('EEE', 4, 'EE406', 'Signals & Systems for Electrical Eng');
  -- Sem 5
  PERFORM populate_studyhub_subject('EEE', 5, 'EE501', 'Power Systems Analysis & Distribution');
  PERFORM populate_studyhub_subject('EEE', 5, 'EE502', 'Power Electronics & Converters');
  PERFORM populate_studyhub_subject('EEE', 5, 'EE503', 'Microcontrollers & PLC Systems');
  PERFORM populate_studyhub_subject('EEE', 5, 'EE504', 'Electrical Machine Design');
  PERFORM populate_studyhub_subject('EEE', 5, 'EE505', 'Renewable Energy Systems');
  PERFORM populate_studyhub_subject('EEE', 5, 'EE506', 'Engineering Economics & Management');
  -- Sem 6
  PERFORM populate_studyhub_subject('EEE', 6, 'EE601', 'Power System Protection & Switchgear');
  PERFORM populate_studyhub_subject('EEE', 6, 'EE602', 'High Voltage Engineering');
  PERFORM populate_studyhub_subject('EEE', 6, 'EE603', 'Electric Drives & Traction Control');
  PERFORM populate_studyhub_subject('EEE', 6, 'EE604', 'Smart Grid Technologies');
  PERFORM populate_studyhub_subject('EEE', 6, 'EE605', 'Utilization of Electrical Energy');
  PERFORM populate_studyhub_subject('EEE', 6, 'EE606', 'Embedded Systems in Electrical Eng');
  -- Sem 7
  PERFORM populate_studyhub_subject('EEE', 7, 'EE701', 'Electric Vehicles & Battery Tech');
  PERFORM populate_studyhub_subject('EEE', 7, 'EE702', 'Power Quality & FACTS Devices');
  PERFORM populate_studyhub_subject('EEE', 7, 'EE703', 'Distributed Generation & Microgrids');
  PERFORM populate_studyhub_subject('EEE', 7, 'EE704', 'EHV AC & DC Transmission Systems');
  PERFORM populate_studyhub_subject('EEE', 7, 'EE705', 'Energy Audit & Conservation');
  PERFORM populate_studyhub_subject('EEE', 7, 'EE706', 'Major Project Phase I');
  -- Sem 8
  PERFORM populate_studyhub_subject('EEE', 8, 'EE801', 'Power System Dynamics & Stability');
  PERFORM populate_studyhub_subject('EEE', 8, 'EE802', 'Industrial Automation & SCADA');
  PERFORM populate_studyhub_subject('EEE', 8, 'EE803', 'Advanced Control Theory');
  PERFORM populate_studyhub_subject('EEE', 8, 'EE804', 'Energy Management Systems');
  PERFORM populate_studyhub_subject('EEE', 8, 'EE805', 'Industrial Internship');
  PERFORM populate_studyhub_subject('EEE', 8, 'EE806', 'Major Project Phase II');
END $$;

-- Mechanical Engineering (ME)
DO $$
BEGIN
  -- Sem 3
  PERFORM populate_studyhub_subject('ME', 3, 'ME301', 'Engineering Thermodynamics');
  PERFORM populate_studyhub_subject('ME', 3, 'ME302', 'Strength of Materials');
  PERFORM populate_studyhub_subject('ME', 3, 'ME303', 'Manufacturing Processes I');
  PERFORM populate_studyhub_subject('ME', 3, 'ME304', 'Engineering Materials & Metallurgy');
  PERFORM populate_studyhub_subject('ME', 3, 'ME305', 'Kinematics of Machinery');
  PERFORM populate_studyhub_subject('ME', 3, 'ME306', 'Machine Drawing & Solid Modeling');
  -- Sem 4
  PERFORM populate_studyhub_subject('ME', 4, 'ME401', 'Fluid Mechanics & Hydraulic Machinery');
  PERFORM populate_studyhub_subject('ME', 4, 'ME402', 'Dynamics of Machinery');
  PERFORM populate_studyhub_subject('ME', 4, 'ME403', 'Manufacturing Processes II');
  PERFORM populate_studyhub_subject('ME', 4, 'ME404', 'Applied Thermal Engineering');
  PERFORM populate_studyhub_subject('ME', 4, 'ME405', 'Electrical & Electronics for Mechanical');
  PERFORM populate_studyhub_subject('ME', 4, 'ME406', 'Numerical Methods & Computational Mech');
  -- Sem 5
  PERFORM populate_studyhub_subject('ME', 5, 'ME501', 'Design of Machine Elements');
  PERFORM populate_studyhub_subject('ME', 5, 'ME502', 'Heat & Mass Transfer');
  PERFORM populate_studyhub_subject('ME', 5, 'ME503', 'Internal Combustion Engines');
  PERFORM populate_studyhub_subject('ME', 5, 'ME504', 'Metrology & Quality Control');
  PERFORM populate_studyhub_subject('ME', 5, 'ME505', 'Turbo Machinery Principles');
  PERFORM populate_studyhub_subject('ME', 5, 'ME506', 'Industrial Engineering & Ergonomics');
  -- Sem 6
  PERFORM populate_studyhub_subject('ME', 6, 'ME601', 'Finite Element Analysis (FEA)');
  PERFORM populate_studyhub_subject('ME', 6, 'ME602', 'CAD/CAM Technologies');
  PERFORM populate_studyhub_subject('ME', 6, 'ME603', 'Refrigeration & Air Conditioning');
  PERFORM populate_studyhub_subject('ME', 6, 'ME604', 'Mechatronics Systems');
  PERFORM populate_studyhub_subject('ME', 6, 'ME605', 'Operations Research & Optimization');
  PERFORM populate_studyhub_subject('ME', 6, 'ME606', 'Power Plant Engineering');
  -- Sem 7
  PERFORM populate_studyhub_subject('ME', 7, 'ME701', 'Automobile Engineering');
  PERFORM populate_studyhub_subject('ME', 7, 'ME702', 'Robotics & Industrial Automation');
  PERFORM populate_studyhub_subject('ME', 7, 'ME703', 'Renewable Energy Systems');
  PERFORM populate_studyhub_subject('ME', 7, 'ME704', 'Additive Manufacturing (3D Printing)');
  PERFORM populate_studyhub_subject('ME', 7, 'ME705', 'Computational Fluid Dynamics (CFD)');
  PERFORM populate_studyhub_subject('ME', 7, 'ME706', 'Capstone Project Phase I');
  -- Sem 8
  PERFORM populate_studyhub_subject('ME', 8, 'ME801', 'Total Quality Management & Six Sigma');
  PERFORM populate_studyhub_subject('ME', 8, 'ME802', 'Industrial Hydraulics & Pneumatics');
  PERFORM populate_studyhub_subject('ME', 8, 'ME803', 'Product Design & Development');
  PERFORM populate_studyhub_subject('ME', 8, 'ME804', 'Mechanical Vibrations & Noise Control');
  PERFORM populate_studyhub_subject('ME', 8, 'ME805', 'Industrial Internship');
  PERFORM populate_studyhub_subject('ME', 8, 'ME806', 'Capstone Project Phase II');
END $$;

-- Civil Engineering (CE)
DO $$
BEGIN
  -- Sem 3
  PERFORM populate_studyhub_subject('CE', 3, 'CE301', 'Mechanics of Solids');
  PERFORM populate_studyhub_subject('CE', 3, 'CE302', 'Fluid Mechanics');
  PERFORM populate_studyhub_subject('CE', 3, 'CE303', 'Engineering Geology');
  PERFORM populate_studyhub_subject('CE', 3, 'CE304', 'Surveying & Geomatics');
  PERFORM populate_studyhub_subject('CE', 3, 'CE305', 'Building Construction & Materials');
  PERFORM populate_studyhub_subject('CE', 3, 'CE306', 'Engineering Mathematics III');
  -- Sem 4
  PERFORM populate_studyhub_subject('CE', 4, 'CE401', 'Structural Analysis I');
  PERFORM populate_studyhub_subject('CE', 4, 'CE402', 'Advanced Surveying & GIS');
  PERFORM populate_studyhub_subject('CE', 4, 'CE403', 'Concrete Technology');
  PERFORM populate_studyhub_subject('CE', 4, 'CE404', 'Hydraulic Engineering');
  PERFORM populate_studyhub_subject('CE', 4, 'CE405', 'Hydrology & Water Resources Engineering');
  PERFORM populate_studyhub_subject('CE', 4, 'CE406', 'Soil Mechanics & Geotechnical Eng');
  -- Sem 5
  PERFORM populate_studyhub_subject('CE', 5, 'CE501', 'Structural Analysis II');
  PERFORM populate_studyhub_subject('CE', 5, 'CE502', 'Design of Reinforced Concrete Structures');
  PERFORM populate_studyhub_subject('CE', 5, 'CE503', 'Foundation Engineering');
  PERFORM populate_studyhub_subject('CE', 5, 'CE504', 'Transportation Engineering I (Highways)');
  PERFORM populate_studyhub_subject('CE', 5, 'CE505', 'Environmental Engineering I (Water Supply)');
  PERFORM populate_studyhub_subject('CE', 5, 'CE506', 'Construction Management & Planning');
  -- Sem 6
  PERFORM populate_studyhub_subject('CE', 6, 'CE601', 'Design of Steel Structures');
  PERFORM populate_studyhub_subject('CE', 6, 'CE602', 'Environmental Engineering II (Wastewater)');
  PERFORM populate_studyhub_subject('CE', 6, 'CE603', 'Transportation Engineering II (Railways/Airports)');
  PERFORM populate_studyhub_subject('CE', 6, 'CE604', 'Irrigation & Drainage Engineering');
  PERFORM populate_studyhub_subject('CE', 6, 'CE605', 'Quantity Surveying, Estimation & Valuation');
  PERFORM populate_studyhub_subject('CE', 6, 'CE606', 'Remote Sensing & Digital Mapping');
  -- Sem 7
  PERFORM populate_studyhub_subject('CE', 7, 'CE701', 'Advanced Structural Analysis & Design');
  PERFORM populate_studyhub_subject('CE', 7, 'CE702', 'Earthquake Engineering & Disaster Management');
  PERFORM populate_studyhub_subject('CE', 7, 'CE703', 'Town Planning & Architecture Principles');
  PERFORM populate_studyhub_subject('CE', 7, 'CE704', 'Ground Improvement Techniques');
  PERFORM populate_studyhub_subject('CE', 7, 'CE705', 'Prestressed Concrete Design');
  PERFORM populate_studyhub_subject('CE', 7, 'CE706', 'Capstone Project Phase I');
  -- Sem 8
  PERFORM populate_studyhub_subject('CE', 8, 'CE801', 'Construction Equipment & Automation');
  PERFORM populate_studyhub_subject('CE', 8, 'CE802', 'Pavement Design & Maintenance');
  PERFORM populate_studyhub_subject('CE', 8, 'CE803', 'Bridge Engineering');
  PERFORM populate_studyhub_subject('CE', 8, 'CE804', 'Solid & Hazardous Waste Management');
  PERFORM populate_studyhub_subject('CE', 8, 'CE805', 'Field Training / Internship');
  PERFORM populate_studyhub_subject('CE', 8, 'CE806', 'Capstone Project Phase II');
END $$;

-- Artificial Intelligence & Data Science (AIDS)
DO $$
BEGIN
  -- Sem 3
  PERFORM populate_studyhub_subject('AIDS', 3, 'AD301', 'Data Structures & Algorithms in Python');
  PERFORM populate_studyhub_subject('AIDS', 3, 'AD302', 'Linear Algebra & Optimization for Data Science');
  PERFORM populate_studyhub_subject('AIDS', 3, 'AD303', 'Foundations of Artificial Intelligence');
  PERFORM populate_studyhub_subject('AIDS', 3, 'AD304', 'Discrete Mathematical Structures');
  PERFORM populate_studyhub_subject('AIDS', 3, 'AD305', 'Database Management Systems & SQL');
  PERFORM populate_studyhub_subject('AIDS', 3, 'AD306', 'Data Ethics & Governance');
  -- Sem 4
  PERFORM populate_studyhub_subject('AIDS', 4, 'AD401', 'Applied Probability & Inferential Statistics');
  PERFORM populate_studyhub_subject('AIDS', 4, 'AD402', 'Machine Learning Algorithms');
  PERFORM populate_studyhub_subject('AIDS', 4, 'AD403', 'NoSQL Databases & Big Data Formats');
  PERFORM populate_studyhub_subject('AIDS', 4, 'AD404', 'Operating Systems & System Architecture');
  PERFORM populate_studyhub_subject('AIDS', 4, 'AD405', 'Design & Analysis of Algorithms');
  PERFORM populate_studyhub_subject('AIDS', 4, 'AD406', 'Data Visualization & Storytelling');
  -- Sem 5
  PERFORM populate_studyhub_subject('AIDS', 5, 'AD501', 'Deep Learning & Neural Networks');
  PERFORM populate_studyhub_subject('AIDS', 5, 'AD502', 'Big Data Processing with Spark & Hadoop');
  PERFORM populate_studyhub_subject('AIDS', 5, 'AD503', 'Natural Language Processing');
  PERFORM populate_studyhub_subject('AIDS', 5, 'AD504', 'Feature Engineering & Selection Techniques');
  PERFORM populate_studyhub_subject('AIDS', 5, 'AD505', 'AI Software Engineering');
  PERFORM populate_studyhub_subject('AIDS', 5, 'AD506', 'Cloud Infrastructure for AI/ML');
  -- Sem 6
  PERFORM populate_studyhub_subject('AIDS', 6, 'AD601', 'Computer Vision & Image Understanding');
  PERFORM populate_studyhub_subject('AIDS', 6, 'AD602', 'Time Series Analysis & Forecasting');
  PERFORM populate_studyhub_subject('AIDS', 6, 'AD603', 'Reinforcement Learning Foundations');
  PERFORM populate_studyhub_subject('AIDS', 6, 'AD604', 'MLOps: CI/CD for Machine Learning');
  PERFORM populate_studyhub_subject('AIDS', 6, 'AD605', 'Business Intelligence & Predictive Analytics');
  PERFORM populate_studyhub_subject('AIDS', 6, 'AD606', 'Information Retrieval & Web Scraping');
  -- Sem 7
  PERFORM populate_studyhub_subject('AIDS', 7, 'AD701', 'Generative AI & Large Language Models');
  PERFORM populate_studyhub_subject('AIDS', 7, 'AD702', 'Predictive Modeling & Decision Systems');
  PERFORM populate_studyhub_subject('AIDS', 7, 'AD703', 'AI Applications in Healthcare & Finance');
  PERFORM populate_studyhub_subject('AIDS', 7, 'AD704', 'Edge AI & Embedded Intelligence');
  PERFORM populate_studyhub_subject('AIDS', 7, 'AD705', 'Knowledge Graphs & Semantic Web');
  PERFORM populate_studyhub_subject('AIDS', 7, 'AD706', 'Capstone Project Phase I');
  -- Sem 8
  PERFORM populate_studyhub_subject('AIDS', 8, 'AD801', 'Autonomous Systems & Intelligent Robotics');
  PERFORM populate_studyhub_subject('AIDS', 8, 'AD802', 'Responsible & Explainable AI (XAI)');
  PERFORM populate_studyhub_subject('AIDS', 8, 'AD803', 'Recommender Systems & Search Ranking');
  PERFORM populate_studyhub_subject('AIDS', 8, 'AD804', 'Deep Reinforcement Learning & Multi-Agent');
  PERFORM populate_studyhub_subject('AIDS', 8, 'AD805', 'Industry AI Internship');
  PERFORM populate_studyhub_subject('AIDS', 8, 'AD806', 'Capstone Project Phase II');
END $$;

-- Artificial Intelligence & Machine Learning (AIML)
DO $$
BEGIN
  -- Sem 3
  PERFORM populate_studyhub_subject('AIML', 3, 'AM301', 'Data Structures in C++ & Python');
  PERFORM populate_studyhub_subject('AIML', 3, 'AM302', 'Calculus & Matrix Computations for AI');
  PERFORM populate_studyhub_subject('AIML', 3, 'AM303', 'Foundations of Machine Learning');
  PERFORM populate_studyhub_subject('AIML', 3, 'AM304', 'Digital Electronics & Microprocessors');
  PERFORM populate_studyhub_subject('AIML', 3, 'AM305', 'Database Management Systems');
  PERFORM populate_studyhub_subject('AIML', 3, 'AM306', 'Python Scientific Computing Stack');
  -- Sem 4
  PERFORM populate_studyhub_subject('AIML', 4, 'AM401', 'Supervised & Unsupervised Learning Methods');
  PERFORM populate_studyhub_subject('AIML', 4, 'AM402', 'Probability, Random Processes & Statistics');
  PERFORM populate_studyhub_subject('AIML', 4, 'AM403', 'Computer Architecture for Deep Learning');
  PERFORM populate_studyhub_subject('AIML', 4, 'AM404', 'Operating Systems Principles');
  PERFORM populate_studyhub_subject('AIML', 4, 'AM405', 'Design & Analysis of Algorithms');
  PERFORM populate_studyhub_subject('AIML', 4, 'AM406', 'Data Preprocessing & Exploratory Analysis');
  -- Sem 5
  PERFORM populate_studyhub_subject('AIML', 5, 'AM501', 'Deep Neural Networks (CNN, RNN, Transformers)');
  PERFORM populate_studyhub_subject('AIML', 5, 'AM502', 'Pattern Recognition & Feature Extraction');
  PERFORM populate_studyhub_subject('AIML', 5, 'AM503', 'Natural Language Processing & Speech');
  PERFORM populate_studyhub_subject('AIML', 5, 'AM504', 'High Performance GPU Computing with CUDA');
  PERFORM populate_studyhub_subject('AIML', 5, 'AM505', 'Computer Vision Architectures');
  PERFORM populate_studyhub_subject('AIML', 5, 'AM506', 'Statistical Learning Theory');
  -- Sem 6
  PERFORM populate_studyhub_subject('AIML', 6, 'AM601', 'Reinforcement Learning & Deep Q-Networks');
  PERFORM populate_studyhub_subject('AIML', 6, 'AM602', 'MLOps: Production Model Deployment & Monitoring');
  PERFORM populate_studyhub_subject('AIML', 6, 'AM603', 'Audio, Speech & Acoustic Processing');
  PERFORM populate_studyhub_subject('AIML', 6, 'AM604', 'Cloud AI Services & Microservices');
  PERFORM populate_studyhub_subject('AIML', 6, 'AM605', 'Cognitive Computing & Expert Systems');
  PERFORM populate_studyhub_subject('AIML', 6, 'AM606', 'AI Safety, Security & Adversarial Defense');
  -- Sem 7
  PERFORM populate_studyhub_subject('AIML', 7, 'AM701', 'Generative Adversarial Networks & Diffusion');
  PERFORM populate_studyhub_subject('AIML', 7, 'AM702', 'Robotic Perception & Motion Planning');
  PERFORM populate_studyhub_subject('AIML', 7, 'AM703', 'Advanced NLP & Prompt Engineering');
  PERFORM populate_studyhub_subject('AIML', 7, 'AM704', 'Embedded AI on Microcontrollers');
  PERFORM populate_studyhub_subject('AIML', 7, 'AM705', 'AI Ethics, Bias Detection & Fairness');
  PERFORM populate_studyhub_subject('AIML', 7, 'AM706', 'Major Project Phase I');
  -- Sem 8
  PERFORM populate_studyhub_subject('AIML', 8, 'AM801', 'Quantum Machine Learning Algorithms');
  PERFORM populate_studyhub_subject('AIML', 8, 'AM802', 'AI Governance, Auditing & Standards');
  PERFORM populate_studyhub_subject('AIML', 8, 'AM803', 'Multi-Agent Systems & Swarm Intelligence');
  PERFORM populate_studyhub_subject('AIML', 8, 'AM804', 'Neuromorphic Computing & Spiking Networks');
  PERFORM populate_studyhub_subject('AIML', 8, 'AM805', 'Industry AI Practice & Training');
  PERFORM populate_studyhub_subject('AIML', 8, 'AM806', 'Major Project Phase II');
END $$;

-- Drop temporary helper function
DROP FUNCTION IF EXISTS populate_studyhub_subject;

-- 8. Reset sequences to proper max values
DO $$
DECLARE
  t TEXT;
  max_val INT;
BEGIN
  FOR t IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('roles', 'branches', 'semesters', 'subjects', 'units', 'users', 'resource_types', 'resources', 'tags', 'comments', 'ratings', 'downloads') LOOP
    EXECUTE 'SELECT COALESCE(MAX(id), 0) + 1 FROM "' || t || '"' INTO max_val;
    BEGIN
      EXECUTE 'ALTER TABLE "' || t || '" ALTER COLUMN id RESTART WITH ' || max_val;
    EXCEPTION WHEN OTHERS THEN
      -- table may not have identity id
      NULL;
    END;
  END LOOP;
END $$;

-- Summary counts
SELECT 
  (SELECT COUNT(*) FROM roles) as total_roles,
  (SELECT COUNT(*) FROM branches) as total_branches,
  (SELECT COUNT(*) FROM semesters) as total_semesters,
  (SELECT COUNT(*) FROM subjects) as total_subjects,
  (SELECT COUNT(*) FROM units) as total_units,
  (SELECT COUNT(*) FROM resource_types) as total_resource_types,
  (SELECT COUNT(*) FROM users) as total_users;

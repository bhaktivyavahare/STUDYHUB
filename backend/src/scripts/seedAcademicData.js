const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');

// Master Data Definitions

const BRANCHES = [
  { id: 1, name: 'Computer Science & Engineering', code: 'CSE' },
  { id: 2, name: 'Information Technology', code: 'IT' },
  { id: 3, name: 'Artificial Intelligence & Data Science', code: 'AIDS' },
  { id: 4, name: 'Artificial Intelligence & Machine Learning', code: 'AIML' },
  { id: 5, name: 'Electronics & Telecommunication Engineering', code: 'ENTC' },
  { id: 6, name: 'Electrical Engineering', code: 'EE' },
  { id: 7, name: 'Mechanical Engineering', code: 'ME' },
  { id: 8, name: 'Civil Engineering', code: 'CE' },
  { id: 9, name: 'Electronics Engineering', code: 'ECE' },
  { id: 10, name: 'Chemical Engineering', code: 'CHE' },
];

const ROLES = [
  { id: 1, name: 'STUDENT', description: 'Enrolled college student with access to academic resources' },
  { id: 2, name: 'FACULTY', description: 'Teaching faculty member with permission to upload & manage course materials' },
  { id: 3, name: 'ADMIN', description: 'System administrator with full system management permissions' },
];

const RESOURCE_TYPES = [
  { id: 1, name: 'Notes' },
  { id: 2, name: 'Previous Year Paper' },
  { id: 3, name: 'Question Bank' },
  { id: 4, name: 'Lab Manual' },
  { id: 5, name: 'Assignment' },
  { id: 6, name: 'Cheat Sheet' },
  { id: 7, name: 'Tutorial' },
  { id: 8, name: 'E-book' },
  { id: 9, name: 'Presentation' },
  { id: 10, name: 'Important Questions' },
  { id: 11, name: 'Study Guide' },
  { id: 12, name: 'Other' },
];

const COMMON_SEM1 = [
  'Engineering Mathematics I',
  'Engineering Physics',
  'Basic Electrical Engineering',
  'Engineering Graphics & Design',
  'Communication Skills',
  'Programming for Problem Solving',
];

const COMMON_SEM2 = [
  'Engineering Mathematics II',
  'Engineering Chemistry',
  'Basic Electronics Engineering',
  'Engineering Mechanics',
  'Environmental Studies',
  'Data Structures Fundamentals',
];

const BRANCH_CURRICULUM = {
  CSE: {
    3: ['Data Structures & Algorithms', 'Computer Organization & Architecture', 'Object-Oriented Programming with C++', 'Discrete Mathematics', 'Digital Logic Design', 'Business Communication'],
    4: ['Database Management Systems', 'Operating Systems', 'Computer Networks', 'Design and Analysis of Algorithms', 'Software Engineering', 'Theory of Computation'],
    5: ['Artificial Intelligence', 'Compiler Design', 'Web Technologies', 'Computer Graphics', 'Information Security', 'Professional Ethics'],
    6: ['Machine Learning', 'Cloud Computing', 'Distributed Systems', 'Cryptography & Network Security', 'Mobile Application Development', 'Data Science Fundamentals'],
    7: ['Big Data Analytics', 'Deep Learning', 'Internet of Things (IoT)', 'Blockchain Technology', 'NLP & Text Mining', 'Project Phase I'],
    8: ['Cyber Security & Forensics', 'Quantum Computing', 'Advanced Cloud Architecture', 'Project Phase II', 'Industrial Internship', 'High Performance Computing']
  },
  IT: {
    3: ['Data Structures with Java', 'Computer Networks I', 'Digital Systems', 'Discrete Structures', 'Object-Oriented Software Engineering', 'Principles of Management'],
    4: ['Database Systems', 'Operating System Concepts', 'Computer Networks II', 'Web Development Frameworks', 'Python Programming', 'Microprocessors & Microcontrollers'],
    5: ['Information & Cyber Security', 'Cloud Computing Principles', 'Data Mining & Warehousing', 'Full Stack Web Development', 'Agile Software Development', 'Statistics for Data Science'],
    6: ['Machine Learning Applications', 'Mobile Computing', 'DevOps & CI/CD', 'Software Testing & QA', 'Enterprise Resource Planning', 'Network Administration'],
    7: ['Information Retrieval Systems', 'Big Data Engineering', 'Wireless & Ad-Hoc Networks', 'Augmented & Virtual Reality', 'Human-Computer Interaction', 'Capstone Project I'],
    8: ['Cloud Native Architecture', 'Cyber Law & Ethics', 'Service Oriented Architecture', 'Capstone Project II', 'IT Industrial Training', 'Storage Area Networks']
  },
  AIDS: {
    3: ['Data Structures & Algorithms', 'Linear Algebra & Calculus', 'Python for Data Science', 'Discrete Mathematics', 'Foundations of Artificial Intelligence', 'Data Ethics'],
    4: ['Database Systems & NoSQL', 'Probability & Applied Statistics', 'Machine Learning Fundamentals', 'Object-Oriented Programming in Python', 'Operating Systems', 'Optimization Techniques'],
    5: ['Deep Learning & Neural Networks', 'Data Visualization & Storytelling', 'Big Data Technologies', 'Natural Language Processing', 'Feature Engineering', 'AI Ethics & Governance'],
    6: ['Computer Vision', 'Time Series Analysis & Forecasting', 'Reinforcement Learning', 'Cloud Infrastructure for AI', 'MLOps (Machine Learning Operations)', 'Business Intelligence'],
    7: ['Generative AI & LLMs', 'Predictive Analytics', 'AI in Healthcare & Finance', 'Edge AI Systems', 'Knowledge Graphs', 'Project Phase I'],
    8: ['Autonomous Systems & Robotics', 'Responsible AI', 'Advanced Computer Vision', 'Project Phase II', 'Industry Internship', 'Recommender Systems']
  },
  AIML: {
    3: ['Data Structures in C++', 'Computational Mathematics', 'Foundations of Machine Learning', 'Digital Electronics', 'Object-Oriented Analysis', 'Python Data Stack'],
    4: ['Supervised & Unsupervised Learning', 'Database Systems', 'Computer Architecture for AI', 'Probability & Random Processes', 'Operating Systems', 'Algorithms Design'],
    5: ['Deep Neural Networks', 'Pattern Recognition', 'Natural Language Processing', 'High-Performance Computing', 'Computer Vision Fundamentals', 'Statistical Learning Theory'],
    6: ['Reinforcement Learning & Q-Learning', 'MLOps & Model Deployment', 'Speech & Audio Processing', 'Cloud AI Services', 'AI System Architecture', 'Cognitive Computing'],
    7: ['Generative Adversarial Networks', 'AI for Robotics', 'Advanced Natural Language Processing', 'AI Security & Adversarial ML', 'Embedded AI', 'Major Project I'],
    8: ['Quantum Machine Learning', 'AI Governance & Policy', 'Intelligent Agents', 'Major Project II', 'Industry Practice', 'Neuromorphic Computing']
  },
  ENTC: {
    3: ['Network Analysis & Synthesis', 'Electronic Devices & Circuits', 'Signals & Systems', 'Engineering Mathematics III', 'Digital Electronics', 'Measurement & Instrumentation'],
    4: ['Analog Communication', 'Integrated Circuits & Applications', 'Microprocessors & Interfacing', 'Electromagnetic Field Theory', 'Control Systems', 'Signals Laboratory'],
    5: ['Digital Communication', 'Microcontrollers & Embedded Systems', 'Digital Signal Processing', 'Transmission Lines & Waveguides', 'VLSI Design', 'Technical Writing'],
    6: ['Microwave & Radar Engineering', 'Wireless & Mobile Communication', 'Optical Fiber Communication', 'Antenna & Wave Propagation', 'CMOS VLSI Technology', 'Embedded Real-Time Systems'],
    7: ['Satellite Communication', 'Cellular & Mobile Networks (5G)', 'Broadband Communication Systems', 'Image Processing', 'RF Circuit Design', 'Project Phase I'],
    8: ['Software Defined Radio', 'Wireless Sensor Networks', 'Biomedical Electronics', 'Project Phase II', 'Industrial Training', 'Nano-electronics']
  },
  EE: {
    3: ['Electrical Circuit Analysis', 'Analog Electronics', 'Electromagnetic Fields', 'Engineering Mathematics III', 'Electrical Machines I', 'Electrical Measurements'],
    4: ['Electrical Machines II', 'Digital Electronics & Logic Design', 'Control Systems', 'Power System I', 'Microprocessors & Applications', 'Signals & Systems for EE'],
    5: ['Power System II', 'Power Electronics', 'Microcontrollers & PLC', 'Electrical Machine Design', 'Renewable Energy Sources', 'Professional Ethics'],
    6: ['Power System Protection & Switchgear', 'High Voltage Engineering', 'Electric Drives & Control', 'Smart Grid Technology', 'Utilization of Electrical Energy', 'Embedded Systems in EE'],
    7: ['Electric Vehicles & Battery Tech', 'Power Quality & Conditioning', 'Distributed Generation', 'EHV AC & DC Transmission', 'Energy Audit & Conservation', 'Major Project Phase I'],
    8: ['Power System Dynamics & Stability', 'Energy Management Systems', 'Flexible AC Transmission (FACTS)', 'Major Project Phase II', 'Industrial Internship', 'SCADA & Automation']
  },
  ME: {
    3: ['Engineering Thermodynamics', 'Strength of Materials', 'Manufacturing Processes I', 'Engineering Materials & Metallurgy', 'Kinematics of Machinery', 'Machine Drawing'],
    4: ['Fluid Mechanics & Machinery', 'Dynamics of Machinery', 'Manufacturing Processes II', 'Applied Thermodynamics', 'Electrical & Electronics for ME', 'Numerical Methods in ME'],
    5: ['Design of Machine Elements', 'Heat & Mass Transfer', 'Internal Combustion Engines', 'Metrology & Quality Control', 'Turbo Machines', 'Industrial Engineering'],
    6: ['Finite Element Analysis (FEA)', 'Computer Aided Design (CAD/CAM)', 'Refrigeration & Air Conditioning', 'Mechatronics', 'Operations Research', 'Power Plant Engineering'],
    7: ['Automobile Engineering', 'Robotics & Automation', 'Renewable Energy Systems', 'Additive Manufacturing (3D Printing)', 'Computational Fluid Dynamics (CFD)', 'Capstone Project I'],
    8: ['Total Quality Management', 'Industrial Hydraulics & Pneumatics', 'Product Design & Development', 'Capstone Project II', 'Industrial Training', 'Vibration & Noise Control']
  },
  CE: {
    3: ['Mechanics of Solids', 'Fluid Mechanics', 'Engineering Geology', 'Surveying & Geomatics', 'Building Construction & Materials', 'Engineering Mathematics III'],
    4: ['Structural Analysis I', 'Surveying II', 'Concrete Technology', 'Hydraulic Engineering', 'Hydrology & Water Resources', 'Soil Mechanics'],
    5: ['Structural Analysis II', 'Design of Reinforced Concrete', 'Foundation Engineering', 'Transportation Engineering I', 'Environmental Engineering I', 'Construction Management'],
    6: ['Design of Steel Structures', 'Environmental Engineering II', 'Transportation Engineering II', 'Irrigation Engineering', 'Quantity Surveying & Valuation', 'GIS & Remote Sensing'],
    7: ['Advanced Structural Design', 'Earthquake Engineering', 'Town Planning & Architecture', 'Ground Improvement Techniques', 'Prestressed Concrete', 'Major Project I'],
    8: ['Construction Equipment & Automation', 'Pavement Design & Management', 'Bridge Engineering', 'Major Project II', 'Field Training', 'Solid Waste Management']
  },
  ECE: {
    3: ['Electronic Devices & Circuits', 'Circuit Theory & Networks', 'Digital Logic Design', 'Signals & Systems', 'Engineering Mathematics III', 'Electronic Measurements'],
    4: ['Analog Electronics & Linear ICs', 'Microprocessors & Assembly Language', 'Electromagnetic Waves', 'Communication Engineering', 'Control Systems Engineering', 'Data Structures for ECE'],
    5: ['Digital Signal Processing', 'Microcontrollers & Embedded Systems', 'Digital Communication Systems', 'VLSI System Design', 'Transmission Lines', 'Professional Communication'],
    6: ['CMOS Integrated Circuit Design', 'Embedded System Design', 'Wireless Communication & Networks', 'Optical Communication', 'Computer Architecture', 'Sensor Technologies'],
    7: ['Microwave Engineering', 'VLSI Testing & Verilog HDL', 'Real-Time Operating Systems (RTOS)', 'Digital Image Processing', 'Embedded C Programming', 'Capstone Project I'],
    8: ['Low Power VLSI Design', 'Biomedical Instrumentation', 'Wireless Ad-Hoc Networks', 'Capstone Project II', 'Industrial Internship', 'MEMS & Microsystems']
  },
  CHE: {
    3: ['Chemical Process Calculations', 'Fluid Flow Operations', 'Chemical Engineering Thermodynamics I', 'Mechanical Operations', 'Engineering Mathematics III', 'Organic Chemistry for Engineers'],
    4: ['Heat Transfer Operations', 'Mass Transfer Operations I', 'Chemical Engineering Thermodynamics II', 'Material Science for Chemical Engineers', 'Physical Chemistry', 'Chemical Process Technology'],
    5: ['Mass Transfer Operations II', 'Chemical Reaction Engineering I', 'Process Instrumentation & Control', 'Environmental Engineering in Chemical Industry', 'Plant Utilities', 'Process Economics'],
    6: ['Chemical Reaction Engineering II', 'Process Equipment Design', 'Transport Phenomena', 'Safety & Hazard Management', 'Polymer Technology', 'Bioprocess Engineering'],
    7: ['Petroleum Refining & Petrochemicals', 'Process Modeling & Simulation', 'Industrial Wastewater Treatment', 'Nanotechnology in Chemical Engineering', 'Process Integration', 'Major Project Phase I'],
    8: ['Chemical Plant Design & Economics', 'Membrane Separation Processes', 'Corrosion Engineering', 'Major Project Phase II', 'Industrial Training', 'Fertilizer Technology']
  }
};

const UNITS = [
  { number: 1, name: 'Unit 1: Fundamentals & Basic Concepts' },
  { number: 2, name: 'Unit 2: Theoretical Framework & Principles' },
  { number: 3, name: 'Unit 3: Core Analysis & Methodologies' },
  { number: 4, name: 'Unit 4: Advanced Topics & System Applications' },
  { number: 5, name: 'Unit 5: Case Studies & Emerging Trends' },
];

async function seed() {
  console.log('🌱 Starting Comprehensive Academic Database Seeding...');
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // 1. Roles
    for (const role of ROLES) {
      await conn.query(
        `INSERT INTO roles (id, name, description) VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description)`,
        [role.id, role.name, role.description]
      );
    }
    console.log('✅ Roles seeded');

    // 2. Branches
    for (const branch of BRANCHES) {
      await conn.query(
        `INSERT INTO branches (id, name, code) VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE name = VALUES(name), code = VALUES(code)`,
        [branch.id, branch.name, branch.code]
      );
    }
    console.log('✅ 10 Branches seeded');

    // 3. Semesters (Sem 1 to 8 for every branch)
    let semesterIdCounter = 1;
    const semesterMap = {}; // key: `branchId_semNum` -> semesterId

    for (const branch of BRANCHES) {
      for (let semNum = 1; semNum <= 8; semNum++) {
        // Check if exists
        const [existing] = await conn.query(
          'SELECT id FROM semesters WHERE branch_id = ? AND number = ?',
          [branch.id, semNum]
        );

        let semId;
        if (existing.length > 0) {
          semId = existing[0].id;
        } else {
          const [result] = await conn.query(
            'INSERT INTO semesters (branch_id, number, name) VALUES (?, ?, ?)',
            [branch.id, semNum, `Semester ${semNum}`]
          );
          semId = result.insertId;
        }
        semesterMap[`${branch.id}_${semNum}`] = semId;
      }
    }
    console.log('✅ 80 Semesters seeded (8 semesters x 10 branches)');

    // 4. Resource Types
    for (const rt of RESOURCE_TYPES) {
      await conn.query(
        `INSERT INTO resource_types (id, name) VALUES (?, ?)
         ON DUPLICATE KEY UPDATE name = VALUES(name)`,
        [rt.id, rt.name]
      );
    }
    console.log('✅ 12 Resource Types seeded');

    // 5. Users (Demo Accounts)
    const adminDemoHash = await bcrypt.hash('Admin@12345', 10);
    const adminEduHash = await bcrypt.hash('Admin@123', 10);
    const facultyEduHash = await bcrypt.hash('Faculty@123', 10);
    const studentEduHash = await bcrypt.hash('Student@123', 10);

    const DEMO_USERS = [
      {
        email: 'admin@studyhub.demo',
        name: 'System Administrator (Demo)',
        password_hash: adminDemoHash,
        role_id: 3,
        branch_id: null,
        semester_id: null,
        bio: 'Primary Demo Administrator Account for StudyHub Platform.'
      },
      {
        email: 'admin@studyhub.edu',
        name: 'System Administrator',
        password_hash: adminEduHash,
        role_id: 3,
        branch_id: null,
        semester_id: null,
        bio: 'StudyHub Platform Administrator.'
      },
      {
        email: 'faculty@studyhub.edu',
        name: 'Dr. Sarah Connor',
        password_hash: facultyEduHash,
        role_id: 2,
        branch_id: 1,
        semester_id: null,
        bio: 'Associate Professor, Department of Computer Science & Engineering.'
      },
      {
        email: 'student@studyhub.edu',
        name: 'Alex Student',
        password_hash: studentEduHash,
        role_id: 1,
        branch_id: 1,
        semester_id: semesterMap['1_4'] || 4,
        bio: 'Computer Science student passionate about web development.'
      }
    ];

    for (const user of DEMO_USERS) {
      const [ex] = await conn.query('SELECT id FROM users WHERE email = ?', [user.email]);
      if (ex.length > 0) {
        await conn.query(
          `UPDATE users SET name = ?, password_hash = ?, role_id = ?, branch_id = ?, semester_id = ?, bio = ?
           WHERE email = ?`,
          [user.name, user.password_hash, user.role_id, user.branch_id, user.semester_id, user.bio, user.email]
        );
      } else {
        await conn.query(
          `INSERT INTO users (name, email, password_hash, role_id, branch_id, semester_id, bio)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [user.name, user.email, user.password_hash, user.role_id, user.branch_id, user.semester_id, user.bio]
        );
      }
    }
    console.log('✅ Demo users seeded (admin@studyhub.demo, admin@studyhub.edu, faculty@studyhub.edu, student@studyhub.edu)');

    // 6. Subjects & Units
    let totalSubjectsInserted = 0;
    let totalUnitsInserted = 0;

    for (const branch of BRANCHES) {
      const bCode = branch.code;
      const bCurriculum = BRANCH_CURRICULUM[bCode] || {};

      for (let semNum = 1; semNum <= 8; semNum++) {
        const semId = semesterMap[`${branch.id}_${semNum}`];
        let subjectList = [];

        if (semNum === 1) subjectList = COMMON_SEM1;
        else if (semNum === 2) subjectList = COMMON_SEM2;
        else subjectList = bCurriculum[semNum] || [];

        for (let sIdx = 0; sIdx < subjectList.length; sIdx++) {
          const subName = subjectList[sIdx];
          const subCode = `${bCode}${semNum}0${sIdx + 1}`;

          // Check if subject exists by code
          const [exSub] = await conn.query('SELECT id FROM subjects WHERE code = ?', [subCode]);
          let subId;

          if (exSub.length > 0) {
            subId = exSub[0].id;
            await conn.query(
              'UPDATE subjects SET name = ?, semester_id = ? WHERE id = ?',
              [subName, semId, subId]
            );
          } else {
            const [subRes] = await conn.query(
              'INSERT INTO subjects (semester_id, name, code) VALUES (?, ?, ?)',
              [semId, subName, subCode]
            );
            subId = subRes.insertId;
            totalSubjectsInserted++;
          }

          // Insert 5 units per subject
          for (const u of UNITS) {
            const [exUnit] = await conn.query(
              'SELECT id FROM units WHERE subject_id = ? AND number = ?',
              [subId, u.number]
            );

            if (exUnit.length === 0) {
              await conn.query(
                'INSERT INTO units (subject_id, number, name) VALUES (?, ?, ?)',
                [subId, u.number, u.name]
              );
              totalUnitsInserted++;
            }
          }
        }
      }
    }

    console.log(`✅ ${totalSubjectsInserted} Subjects and ${totalUnitsInserted} Units seeded across all 10 branches x 8 semesters!`);

    await conn.commit();
    console.log('🎉 Seeding completed successfully!');
  } catch (err) {
    await conn.rollback();
    console.error('❌ Seeding failed:', err);
    throw err;
  } finally {
    conn.release();
  }
}

if (require.main === module) {
  seed()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { seed };

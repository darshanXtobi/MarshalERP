-- MARSHAL ERP DATABASE SCHEMA (SQLITE & CLOUDFLARE D1 COMPATIBLE)
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS colleges (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  affiliation TEXT,
  logo_url TEXT,
  address TEXT,
  phone TEXT,
  email TEXT
);

CREATE TABLE IF NOT EXISTS departments (
  id TEXT PRIMARY KEY,
  college_id TEXT REFERENCES colleges(id),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  display_name TEXT NOT NULL,
  role TEXT NOT NULL, -- 'super_admin', 'principal', 'exam_controller', 'hod', 'faculty', 'accounts', 'transport'
  department_id TEXT REFERENCES departments(id),
  avatar_url TEXT,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS programs (
  id TEXT PRIMARY KEY,
  department_id TEXT REFERENCES departments(id),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  degree TEXT DEFAULT 'B.Tech',
  total_semesters INTEGER DEFAULT 8
);

CREATE TABLE IF NOT EXISTS students (
  id TEXT PRIMARY KEY,
  prn TEXT UNIQUE NOT NULL,
  roll_no TEXT NOT NULL,
  seat_no TEXT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  program_id TEXT REFERENCES programs(id),
  current_sem INTEGER NOT NULL,
  division TEXT NOT NULL,
  batch TEXT,
  academic_year TEXT NOT NULL,
  gender TEXT,
  blood_group TEXT,
  phone TEXT,
  parent_phone TEXT,
  address TEXT,
  photo_url TEXT,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS courses (
  id TEXT PRIMARY KEY,
  program_id TEXT REFERENCES programs(id),
  semester INTEGER NOT NULL,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  credits REAL NOT NULL,
  course_type TEXT DEFAULT 'Theory', -- 'Theory', 'Practical', 'Project'
  internal_max INTEGER DEFAULT 30,
  external_max INTEGER DEFAULT 70,
  total_max INTEGER DEFAULT 100,
  passing_percentage REAL DEFAULT 40.0
);

CREATE TABLE IF NOT EXISTS faculty_course_assignments (
  id TEXT PRIMARY KEY,
  faculty_id TEXT REFERENCES users(id),
  course_id TEXT REFERENCES courses(id),
  division TEXT NOT NULL,
  academic_year TEXT NOT NULL,
  semester INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS attendance_sessions (
  id TEXT PRIMARY KEY,
  course_id TEXT REFERENCES courses(id),
  faculty_id TEXT REFERENCES users(id),
  semester INTEGER NOT NULL,
  division TEXT NOT NULL,
  batch TEXT,
  session_date TEXT NOT NULL,
  period_no INTEGER NOT NULL,
  topic_delivered TEXT,
  status TEXT DEFAULT 'submitted',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS attendance_records (
  id TEXT PRIMARY KEY,
  session_id TEXT REFERENCES attendance_sessions(id) ON DELETE CASCADE,
  student_id TEXT REFERENCES students(id),
  status TEXT NOT NULL, -- 'Present', 'Absent', 'Late', 'Medical'
  remarks TEXT,
  UNIQUE (session_id, student_id)
);

CREATE TABLE IF NOT EXISTS examinations (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  academic_year TEXT NOT NULL,
  semester INTEGER NOT NULL,
  exam_type TEXT NOT NULL, -- 'Regular', 'Backlog', 'In-Semester'
  start_date TEXT,
  end_date TEXT,
  is_marks_entry_locked INTEGER DEFAULT 0,
  is_published INTEGER DEFAULT 0,
  published_at DATETIME
);

CREATE TABLE IF NOT EXISTS exam_components (
  id TEXT PRIMARY KEY,
  exam_id TEXT REFERENCES examinations(id) ON DELETE CASCADE,
  course_id TEXT REFERENCES courses(id),
  component_name TEXT NOT NULL, -- 'ISE', 'ESE', 'PR', 'TW'
  max_marks INTEGER NOT NULL,
  passing_marks INTEGER NOT NULL,
  weightage_percent INTEGER DEFAULT 100
);

CREATE TABLE IF NOT EXISTS student_marks (
  id TEXT PRIMARY KEY,
  component_id TEXT REFERENCES exam_components(id) ON DELETE CASCADE,
  student_id TEXT REFERENCES students(id),
  marks_obtained REAL,
  is_absent INTEGER DEFAULT 0,
  entered_by TEXT REFERENCES users(id),
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (component_id, student_id)
);

CREATE TABLE IF NOT EXISTS student_results (
  id TEXT PRIMARY KEY,
  exam_id TEXT REFERENCES examinations(id),
  student_id TEXT REFERENCES students(id),
  total_credits REAL NOT NULL,
  earned_credits REAL NOT NULL,
  total_grade_points REAL NOT NULL,
  sgpa REAL NOT NULL,
  cgpa REAL NOT NULL,
  result_status TEXT NOT NULL, -- 'PASS', 'FAIL', 'ATKT', 'WITHHELD'
  is_published INTEGER DEFAULT 0,
  calculated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (exam_id, student_id)
);

CREATE TABLE IF NOT EXISTS fee_structures (
  id TEXT PRIMARY KEY,
  program_id TEXT REFERENCES programs(id),
  academic_year TEXT NOT NULL,
  semester INTEGER NOT NULL,
  fee_head TEXT NOT NULL,
  amount REAL NOT NULL,
  due_date TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS student_fee_accounts (
  id TEXT PRIMARY KEY,
  student_id TEXT REFERENCES students(id),
  academic_year TEXT NOT NULL,
  semester INTEGER NOT NULL,
  total_assessed REAL NOT NULL,
  concession REAL DEFAULT 0.0,
  total_paid REAL DEFAULT 0.0,
  balance REAL NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (student_id, academic_year, semester)
);

CREATE TABLE IF NOT EXISTS fee_transactions (
  id TEXT PRIMARY KEY,
  student_id TEXT REFERENCES students(id),
  receipt_no TEXT UNIQUE NOT NULL,
  amount REAL NOT NULL,
  payment_mode TEXT NOT NULL, -- 'Online', 'Cash', 'Cheque', 'NEFT'
  transaction_ref TEXT,
  paid_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  received_by TEXT REFERENCES users(id),
  remarks TEXT
);

CREATE TABLE IF NOT EXISTS transport_routes (
  id TEXT PRIMARY KEY,
  route_name TEXT NOT NULL,
  vehicle_no TEXT NOT NULL,
  driver_name TEXT,
  driver_phone TEXT,
  annual_fee REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS transport_stops (
  id TEXT PRIMARY KEY,
  route_id TEXT REFERENCES transport_routes(id),
  stop_name TEXT NOT NULL,
  pickup_time TEXT NOT NULL,
  drop_time TEXT NOT NULL,
  stop_order INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS student_transport (
  id TEXT PRIMARY KEY,
  student_id TEXT UNIQUE REFERENCES students(id),
  route_id TEXT REFERENCES transport_routes(id),
  stop_id TEXT REFERENCES transport_stops(id),
  bus_pass_no TEXT UNIQUE NOT NULL,
  academic_year TEXT NOT NULL,
  status TEXT DEFAULT 'Active'
);

CREATE TABLE IF NOT EXISTS timetables (
  id TEXT PRIMARY KEY,
  program_id TEXT REFERENCES programs(id),
  semester INTEGER NOT NULL,
  division TEXT NOT NULL,
  day_of_week TEXT NOT NULL,
  period_no INTEGER NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  course_id TEXT REFERENCES courses(id),
  faculty_id TEXT REFERENCES users(id),
  room_no TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS notices (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL, -- 'Academic', 'Examination', 'Fees', 'Sports', 'General'
  content TEXT NOT NULL,
  target_role TEXT DEFAULT 'all',
  attachment_url TEXT,
  created_by TEXT REFERENCES users(id),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS grievances (
  id TEXT PRIMARY KEY,
  student_id TEXT REFERENCES students(id),
  ticket_no TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'Open', -- 'Open', 'In_Progress', 'Resolved'
  resolution TEXT,
  resolved_by TEXT REFERENCES users(id),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  resolved_at DATETIME
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  user_type TEXT NOT NULL, -- 'staff', 'student'
  user_id TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  payload TEXT,
  ip_address TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

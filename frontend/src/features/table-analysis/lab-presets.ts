import type { LabPreset } from './table-types';

export const LAB_PRESETS: LabPreset[] = [
  {
    id: 'emp-dept-project-3nf',
    title: 'Employee & Department (3NF Transitive Dependency)',
    category: '3NF',
    tableName: 'Emp_Dept_Assignment',
    description:
      'Classic 3NF violation: Candidate key is {EmpID, ProjectID}. DeptID -> DeptName is a transitive dependency causing update anomalies.',
    sql: `-- ========================================================
-- Table: Emp_Dept_Assignment (Violates 3NF)
-- Candidate Key: {EmpID, ProjectID}
-- Transitive FD: DeptID -> DeptName
-- ========================================================
CREATE TABLE Emp_Dept_Assignment (
  EmpID NUMBER,
  EmpName VARCHAR2(50),
  DeptID NUMBER,
  DeptName VARCHAR2(50),
  ProjectID VARCHAR2(10),
  HoursWorked NUMBER
);

INSERT INTO Emp_Dept_Assignment VALUES (101, 'Aarav Sharma', 10, 'Engineering', 'PRJ-A', 20);
INSERT INTO Emp_Dept_Assignment VALUES (101, 'Aarav Sharma', 10, 'Engineering', 'PRJ-B', 15);
INSERT INTO Emp_Dept_Assignment VALUES (102, 'Riya Patel', 10, 'Engineering', 'PRJ-A', 35);
INSERT INTO Emp_Dept_Assignment VALUES (103, 'Kabir Mehta', 20, 'Human Resources', 'PRJ-C', 40);
INSERT INTO Emp_Dept_Assignment VALUES (104, 'Ananya Roy', 30, 'Finance', 'PRJ-D', 25);
INSERT INTO Emp_Dept_Assignment VALUES (105, 'Vikram Singh', 20, 'Human Resources', 'PRJ-C', 30);
COMMIT;`,
  },
  {
    id: 'student-course-2nf',
    title: 'Student Course Enrollment (2NF Partial Dependency)',
    category: '2NF',
    tableName: 'Student_Course_Reg',
    description:
      'Candidate key is {RollNo, CourseID}. Partial dependencies RollNo -> StudentName, Degree and CourseID -> CourseName violate 2NF.',
    sql: `-- ========================================================
-- Table: Student_Course_Reg (Violates 2NF)
-- Candidate Key: {RollNo, CourseID}
-- Partial FDs: RollNo -> StudentName, Degree; CourseID -> CourseName
-- ========================================================
CREATE TABLE Student_Course_Reg (
  RollNo NUMBER,
  StudentName VARCHAR2(50),
  Degree VARCHAR2(20),
  CourseID VARCHAR2(10),
  CourseName VARCHAR2(50),
  Grade VARCHAR2(2)
);

INSERT INTO Student_Course_Reg VALUES (2101, 'Devansh Gupta', 'B.Tech CSE', 'CS201', 'Data Structures', 'A');
INSERT INTO Student_Course_Reg VALUES (2101, 'Devansh Gupta', 'B.Tech CSE', 'CS202', 'Algorithms', 'A+');
INSERT INTO Student_Course_Reg VALUES (2102, 'Sanya Kapoor', 'B.Tech ECE', 'CS201', 'Data Structures', 'B+');
INSERT INTO Student_Course_Reg VALUES (2102, 'Sanya Kapoor', 'B.Tech ECE', 'EC205', 'Signals & Systems', 'A');
INSERT INTO Student_Course_Reg VALUES (2103, 'Rohan Verma', 'B.Tech CSE', 'CS202', 'Algorithms', 'B');
COMMIT;`,
  },
  {
    id: 'student-advisor-bcnf',
    title: 'Student Advisor Offering (3NF but NOT BCNF)',
    category: 'BCNF',
    tableName: 'Student_Advisor_Course',
    description:
      'Candidate keys are {StudentID, Course} and {StudentID, Advisor}. The FD Advisor -> Course holds. It satisfies 3NF because Course is prime, but fails BCNF because Advisor is not a superkey.',
    sql: `-- ========================================================
-- Table: Student_Advisor_Course (In 3NF, but violates BCNF)
-- Candidate Keys: {StudentID, Course}, {StudentID, Advisor}
-- Violating FD: Advisor -> Course (Advisor is not a superkey)
-- ========================================================
CREATE TABLE Student_Advisor_Course (
  StudentID NUMBER,
  Course VARCHAR2(30),
  Advisor VARCHAR2(50)
);

INSERT INTO Student_Advisor_Course VALUES (101, 'Database Systems', 'Dr. Swaminathan');
INSERT INTO Student_Advisor_Course VALUES (102, 'Database Systems', 'Dr. Swaminathan');
INSERT INTO Student_Advisor_Course VALUES (101, 'Computer Networks', 'Prof. Ramesh');
INSERT INTO Student_Advisor_Course VALUES (103, 'Computer Networks', 'Prof. Ramesh');
INSERT INTO Student_Advisor_Course VALUES (104, 'Database Systems', 'Dr. Aruna');
COMMIT;`,
  },
  {
    id: 'student-multivalued-1nf',
    title: 'Student Contact Card (1NF Multi-Valued Cell Violation)',
    category: '1NF',
    tableName: 'Student_Contact_Card',
    description:
      'Cell atomicity violation: PhoneNumbers and Hobbies contain multi-valued comma-separated lists, violating First Normal Form.',
    sql: `-- ========================================================
-- Table: Student_Contact_Card (Violates 1NF)
-- Non-atomic cells: PhoneNumbers and Hobbies contain multiple values
-- ========================================================
CREATE TABLE Student_Contact_Card (
  RegNo NUMBER PRIMARY KEY,
  FullName VARCHAR2(50),
  PhoneNumbers VARCHAR2(100),
  Hobbies VARCHAR2(100)
);

INSERT INTO Student_Contact_Card VALUES (5592, 'Akshit Choudhary', '9876543210, 9123456780', 'Coding, Chess, Gaming');
INSERT INTO Student_Contact_Card VALUES (5553, 'Shreyansh Agarwal', '9811223344', 'Web Dev, Badminton');
INSERT INTO Student_Contact_Card VALUES (5569, 'Aryan Shukla', '9988776655, 9877001122', 'Reading, Robotics');
INSERT INTO Student_Contact_Card VALUES (5822, 'Kanishka Shukla', '9765432100', 'AI Research, Photography, Debating');
COMMIT;`,
  },
];

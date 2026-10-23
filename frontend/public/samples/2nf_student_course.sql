-- ========================================================
-- 2NF Violation Sample: Student_Course_Reg
-- Candidate Key: {RollNo, CourseID}
-- Partial Dependencies: RollNo -> StudentName, Department; CourseID -> CourseName
-- ========================================================
CREATE TABLE Student_Course_Reg (
  RollNo NUMBER,
  StudentName VARCHAR2(50),
  Department VARCHAR2(20),
  CourseID VARCHAR2(10),
  CourseName VARCHAR2(50),
  Grade VARCHAR2(2),
  PRIMARY KEY (RollNo, CourseID)
);

INSERT INTO Student_Course_Reg VALUES (101, 'Aarav Sharma', 'CSE', 'CS101', 'Data Structures', 'A');
INSERT INTO Student_Course_Reg VALUES (101, 'Aarav Sharma', 'CSE', 'CS102', 'Algorithms', 'A+');
INSERT INTO Student_Course_Reg VALUES (102, 'Riya Patel', 'ECE', 'CS101', 'Data Structures', 'B+');
INSERT INTO Student_Course_Reg VALUES (102, 'Riya Patel', 'ECE', 'EC201', 'Digital Circuits', 'A');
INSERT INTO Student_Course_Reg VALUES (103, 'Kabir Mehta', 'CSE', 'CS102', 'Algorithms', 'B');
COMMIT;

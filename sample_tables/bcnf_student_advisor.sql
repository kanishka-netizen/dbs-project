-- ========================================================
-- BCNF Violation Sample: Student_Advisor_Course
-- Candidate Keys: {StudentID, Course}, {StudentID, Advisor}
-- Violating FD: Advisor -> Course (Advisor is NOT a superkey, satisfies 3NF because Course is prime)
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
INSERT INTO Student_Advisor_Course VALUES (104, 'Database Systems', 'Dr. Swaminathan');
INSERT INTO Student_Advisor_Course VALUES (104, 'Operating Systems', 'Dr. Aruna');
COMMIT;

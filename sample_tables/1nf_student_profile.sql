-- ========================================================
-- 1NF Violation Sample: Student_Profile
-- Non-atomic cells: PhoneNumbers and Skills contain comma-separated lists
-- ========================================================
CREATE TABLE Student_Profile (
  RollNo NUMBER PRIMARY KEY,
  StudentName VARCHAR2(50),
  PhoneNumbers VARCHAR2(100),
  Skills VARCHAR2(100)
);

INSERT INTO Student_Profile VALUES (101, 'Aarav Sharma', '9876543210, 9123456780', 'Python, SQL, React');
INSERT INTO Student_Profile VALUES (102, 'Riya Patel', '9811223344', 'Java, C++');
INSERT INTO Student_Profile VALUES (103, 'Kabir Mehta', '9988776655, 9877001122', 'HTML, CSS, JavaScript');
INSERT INTO Student_Profile VALUES (104, 'Ananya Roy', '9765432100', 'Machine Learning, R, Python');
COMMIT;

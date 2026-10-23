-- ========================================================
-- 4NF Violation Sample: Faculty_Course_Book
-- Candidate Key: {Faculty, Subject, Textbook} (All attributes form key, in BCNF)
-- Multivalued Dependencies: Faculty ->> Subject, Faculty ->> Textbook
-- ========================================================
CREATE TABLE Faculty_Course_Book (
  Faculty VARCHAR2(50),
  Subject VARCHAR2(30),
  Textbook VARCHAR2(50)
);

INSERT INTO Faculty_Course_Book VALUES ('Prof. Sharma', 'Mathematics', 'Calculus by Stewart');
INSERT INTO Faculty_Course_Book VALUES ('Prof. Sharma', 'Mathematics', 'Physics by Halliday');
INSERT INTO Faculty_Course_Book VALUES ('Prof. Sharma', 'Physics', 'Calculus by Stewart');
INSERT INTO Faculty_Course_Book VALUES ('Prof. Sharma', 'Physics', 'Physics by Halliday');
INSERT INTO Faculty_Course_Book VALUES ('Prof. Verma', 'Databases', 'Database Concepts by Korth');
INSERT INTO Faculty_Course_Book VALUES ('Prof. Verma', 'Databases', 'Computer Networks by Tanenbaum');
INSERT INTO Faculty_Course_Book VALUES ('Prof. Verma', 'Networks', 'Database Concepts by Korth');
INSERT INTO Faculty_Course_Book VALUES ('Prof. Verma', 'Networks', 'Computer Networks by Tanenbaum');
COMMIT;

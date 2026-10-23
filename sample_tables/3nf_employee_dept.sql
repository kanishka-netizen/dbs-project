-- ========================================================
-- 3NF Violation Sample: Employee_Dept_Record
-- Candidate Key: {EmpID}
-- Transitive Dependency: DeptID -> DeptName, DeptHead
-- ========================================================
CREATE TABLE Employee_Dept_Record (
  EmpID NUMBER PRIMARY KEY,
  EmpName VARCHAR2(50),
  DeptID NUMBER,
  DeptName VARCHAR2(50),
  DeptHead VARCHAR2(50),
  Salary NUMBER
);

INSERT INTO Employee_Dept_Record VALUES (201, 'Vikram Singh', 10, 'Engineering', 'Dr. Verma', 85000);
INSERT INTO Employee_Dept_Record VALUES (202, 'Priya Nair', 10, 'Engineering', 'Dr. Verma', 90000);
INSERT INTO Employee_Dept_Record VALUES (203, 'Amit Shah', 20, 'Human Resources', 'Ms. Kapoor', 65000);
INSERT INTO Employee_Dept_Record VALUES (204, 'Sneha Sen', 20, 'Human Resources', 'Ms. Kapoor', 70000);
INSERT INTO Employee_Dept_Record VALUES (205, 'Rahul Das', 30, 'Finance', 'Mr. Malhotra', 80000);
COMMIT;

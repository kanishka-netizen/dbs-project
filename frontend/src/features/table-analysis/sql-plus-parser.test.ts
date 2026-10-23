import { describe, expect, it } from 'vitest';
import { parseSqlPlusScript } from './sql-plus-parser';

describe('sql-plus-parser', () => {
  it('parses basic CREATE TABLE and INSERT INTO statements', () => {
    const sql = `
      -- Create student table
      CREATE TABLE Student (
        RollNo NUMBER PRIMARY KEY,
        Name VARCHAR2(50),
        Dept VARCHAR2(20)
      );

      INSERT INTO Student VALUES (101, 'Aarav', 'CSE');
      INSERT INTO Student VALUES (102, 'Riya', 'ECE');
      COMMIT;
    `;

    const { tables, issues } = parseSqlPlusScript(sql);
    expect(issues).toHaveLength(0);
    expect(tables).toHaveLength(1);

    const student = tables[0];
    expect(student.name).toBe('Student');
    expect(student.columns).toHaveLength(3);
    expect(student.columns[0]).toEqual({
      name: 'RollNo',
      type: 'NUMBER',
      isPrimaryKey: true,
    });
    expect(student.rows).toHaveLength(2);
    expect(student.rows[0]).toEqual({
      RollNo: 101,
      Name: 'Aarav',
      Dept: 'CSE',
    });
    expect(student.rows[1]).toEqual({
      RollNo: 102,
      Name: 'Riya',
      Dept: 'ECE',
    });
  });

  it('handles multi-value INSERT and table-level PRIMARY KEY', () => {
    const sql = `
      CREATE TABLE Enrollment (
        StudentID INT,
        CourseID INT,
        Grade VARCHAR(2),
        PRIMARY KEY (StudentID, CourseID)
      );

      INSERT INTO Enrollment VALUES 
        (1, 101, 'A'),
        (1, 102, 'B'),
        (2, 101, 'A');
    `;

    const { tables, issues } = parseSqlPlusScript(sql);
    expect(issues).toHaveLength(0);
    expect(tables).toHaveLength(1);

    const enrollment = tables[0];
    expect(enrollment.columns[0].isPrimaryKey).toBe(true);
    expect(enrollment.columns[1].isPrimaryKey).toBe(true);
    expect(enrollment.rows).toHaveLength(3);
    expect(enrollment.rows[0]).toEqual({ StudentID: 1, CourseID: 101, Grade: 'A' });
  });

  it('handles quotes with commas and escaped quotes', () => {
    const sql = `
      CREATE TABLE Book (
        BookID NUMBER,
        Title VARCHAR2(100)
      );

      INSERT INTO Book VALUES (1, 'Database Systems, 7th Edition');
      INSERT INTO Book VALUES (2, 'It''s a Great Book');
    `;

    const { tables } = parseSqlPlusScript(sql);
    expect(tables[0].rows[0].Title).toBe('Database Systems, 7th Edition');
    expect(tables[0].rows[1].Title).toBe("It's a Great Book");
  });
});

export interface SchemaExample {
  id: string;
  label: string;
  /** What this schema demonstrates, shown as help text. */
  demonstrates: string;
  relationName: string;
  schemaText: string;
}

/**
 * Ready-made schemas for the visualizer and the help page.
 * Team 1 (TLE) extends this list alongside the Learn section.
 */
export const SCHEMA_EXAMPLES: SchemaExample[] = [
  {
    id: 'partial-dependency',
    label: 'Student enrolments',
    demonstrates: 'A partial dependency, so 2NF fails',
    relationName: 'Enrolment',
    schemaText: `attributes: StudentID, CourseID, CourseName, Instructor

StudentID, CourseID -> CourseName
CourseID -> Instructor`,
  },
  {
    id: 'transitive-dependency',
    label: 'Employee departments',
    demonstrates: 'A transitive dependency, so 3NF fails',
    relationName: 'Employee',
    schemaText: `attributes: EmployeeID, DepartmentID, DepartmentName

EmployeeID -> DepartmentID
DepartmentID -> DepartmentName`,
  },
  {
    id: 'bcnf-violation',
    label: 'Course offerings',
    demonstrates: 'A non-superkey determinant, so BCNF fails',
    relationName: 'Offering',
    schemaText: `attributes: Student, Course, Instructor

Student, Course -> Instructor
Instructor -> Course`,
  },
  {
    id: 'mvd-violation',
    label: 'Supplier, part, project',
    demonstrates: 'Independent facts about a supplier, so 4NF and 5NF fail',
    relationName: 'Supply',
    schemaText: `attributes: Supplier, Part, Project

Supplier ->> Part
Supplier ->> Project`,
  },
  {
    id: 'bcnf-clean',
    label: 'Well-normalised',
    demonstrates: 'Already in BCNF',
    relationName: 'Customer',
    schemaText: `attributes: CustomerID, Name, City, PostalCode

CustomerID -> Name, City, PostalCode`,
  },
];

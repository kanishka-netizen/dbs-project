-- ========================================================
-- 5NF Violation Sample: Project_Supply_Chain
-- Candidate Key: {Supplier, Part, Project}
-- Join Dependency: *{(Supplier, Part), (Part, Project), (Supplier, Project)}
-- ========================================================
CREATE TABLE Project_Supply_Chain (
  Supplier VARCHAR2(30),
  Part VARCHAR2(30),
  Project VARCHAR2(30)
);

INSERT INTO Project_Supply_Chain VALUES ('Alpha Tech', 'Bolts', 'Metro Rail');
INSERT INTO Project_Supply_Chain VALUES ('Alpha Tech', 'Gears', 'Metro Rail');
INSERT INTO Project_Supply_Chain VALUES ('Beta Corp', 'Bolts', 'Highway Bridge');
INSERT INTO Project_Supply_Chain VALUES ('Beta Corp', 'Rivets', 'Highway Bridge');
INSERT INTO Project_Supply_Chain VALUES ('Gamma Ltd', 'Gears', 'Airport Terminal');
COMMIT;

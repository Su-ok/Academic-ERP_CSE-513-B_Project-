CREATE TABLE bills (
    bill_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    description VARCHAR(255) NOT NULL,
    amount DOUBLE NOT NULL,
    bill_date DATE NOT NULL,
    deadline DATE NOT NULL
);

CREATE TABLE domain (
    domain_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    domain_name VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE student (
    student_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    roll_number VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    domain BIGINT NOT NULL,
    FOREIGN KEY (domain) REFERENCES domain(domain_id)
);

CREATE TABLE student_bills (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    student_id BIGINT NOT NULL,
    bill_id BIGINT NOT NULL,
    FOREIGN KEY (student_id) REFERENCES student(student_id),
    FOREIGN KEY (bill_id) REFERENCES bills(bill_id),
    UNIQUE KEY unique_student_bill (student_id, bill_id)
);

CREATE TABLE department (
    department_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    department_name VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE employee (
    employee_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    photo_path VARCHAR(500),
    department_id BIGINT NOT NULL,
    FOREIGN KEY (department_id) REFERENCES department(department_id)
);
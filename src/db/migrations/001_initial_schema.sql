CREATE DATABASE IF NOT EXISTS educonnect;
use educonnect;


CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    name VARCHAR(100) NOT NULL,

    email VARCHAR(255) NOT NULL UNIQUE,

    password_hash VARCHAR(255) NOT NULL,

    role ENUM('student', 'instructor', 'admin') NOT NULL DEFAULT 'student',

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE courses(
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    instructor_id BIGINT UNSIGNED NOT NULL,

    title VARCHAR(255) NOT NULL,

    description TEXT,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_courses_instructor FOREIGN KEY ( instructor_id ) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE INDEX idx_courses_instructor ON courses(instructor_id);

CREATE TABLE lessons(
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    course_id BIGINT UNSIGNED NOT NULL,
    
    title VARCHAR(255) NOT NULL,

    content LONGTEXT,

    lesson_order INT NOT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_lessons_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

CREATE INDEX idx_lessons_course ON lessons(course_id);

CREATE TABLE enrollments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    user_id BIGINT UNSIGNED NOT NULL,

    course_id BIGINT UNSIGNED NOT NULL,

    enrolled_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_enrollments_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,

    CONSTRAINT fk_enrollments_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,

    CONSTRAINT uq_user_course UNIQUE(user_id, course_id)
);

CREATE INDEX idx_enrollments_user ON enrollments(user_id);

CREATE INDEX idx_enrollments_course ON enrollments(course_id);

CREATE TABLE refresh_tokens (
    id BIGINT UNSIGNED aUTO_INCREMENT NOT NULL PRIMARY KEY,

    user_id BIGINT UNSIGNED NOT NULL,

    token VARCHAR(512) NOT NULL,

    expires_at TIMESTAMP NOT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_refresh_tokens_user FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE    
);

CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);


CREATE TABLE oauth_accounts (
    id BIGINT UNSIGNED AUTO_INCREAMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    provider ENUM('google') NOT NULL,
    provider_user_id VARCHAR(255) NOT NULL,
    crated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_oauth_accounts_user
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    CONSTRAINT uq_provider_user UNIQUE(provider, provider_user_id) 
);

CREATE INDEX idx_oauth_accounts_user ON oauth_accounts(user_id);
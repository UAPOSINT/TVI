-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(100) NOT NULL,
    classification_level INT DEFAULT 1 CHECK (classification_level BETWEEN 1 AND 5),
    contribution_score INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    verification_token UUID,
    reset_password_token UUID,
    reset_password_expires TIMESTAMP
);

-- Create index for email lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);

-- Create index for verification tokens
CREATE INDEX idx_users_verification ON users(verification_token);
CREATE INDEX idx_users_reset_token ON users(reset_password_token);

-- Articles table with version control
CREATE TABLE articles (
    article_id UUID PRIMARY KEY,
    parent_article_id UUID REFERENCES articles(article_id),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'Waiting Review' CHECK (status IN ('Draft', 'Waiting Review', 'Approved', 'Archived')),
    author_id UUID REFERENCES users(id) NOT NULL,
    version_number INT DEFAULT 1,
    is_current_version BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    document_type VARCHAR(20) DEFAULT 'ARI' CHECK (document_type IN ('ARI', 'ResearchPaper')),
    object_class VARCHAR(50),
    content_html TEXT,
    glossary_terms UUID[] DEFAULT ARRAY[]::UUID[],
    community_approved BOOLEAN DEFAULT FALSE,
    approval_score INT DEFAULT 0
);

-- Flags/Community Notes system
CREATE TABLE flags (
    flag_id UUID PRIMARY KEY,
    article_id UUID REFERENCES articles(article_id) NOT NULL,
    user_id UUID REFERENCES users(id) NOT NULL,
    flag_type VARCHAR(20) CHECK (flag_type IN ('Vague', 'Inaccurate', 'Citation Needed', 'Other')),
    start_offset INT NOT NULL,
    end_offset INT NOT NULL,
    comment TEXT,
    color_code VARCHAR(7) DEFAULT '#FFEB3B',
    resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    net_votes INT DEFAULT 0,
    approved BOOLEAN DEFAULT FALSE,
    rejection_reason TEXT
);

-- Cosserary Terminology
CREATE TABLE terms (
    term_id UUID PRIMARY KEY,
    term VARCHAR(100) UNIQUE NOT NULL,
    definition TEXT NOT NULL,
    related_articles UUID[] DEFAULT ARRAY[]::UUID[],
    category VARCHAR(50),
    slug VARCHAR(100) UNIQUE NOT NULL,
    created_by UUID REFERENCES users(id) NOT NULL,
    is_glossary_term BOOLEAN DEFAULT FALSE,
    official_definition TEXT,
    o5_approver UUID REFERENCES users(id)
);

CREATE INDEX idx_terms_slug ON terms(slug);
CREATE INDEX idx_terms_category ON terms(category);

-- Create glossary reference table
CREATE TABLE glossary_references (
    reference_id UUID PRIMARY KEY,
    term_id UUID REFERENCES terms(term_id) NOT NULL,
    article_id UUID REFERENCES articles(article_id) NOT NULL,
    usage_context TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE threat_levels (
    level_id SERIAL PRIMARY KEY,
    name VARCHAR(20) NOT NULL UNIQUE,
    color VARCHAR(7) NOT NULL,
    description TEXT,
    active BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO threat_levels (name, color, description) VALUES
('GREEN', '#00FF00', 'No active containment breaches'),
('YELLOW', '#FFFF00', 'Localized anomaly activity'),
('RED', '#FF0000', 'Major containment breach in progress');

CREATE TABLE flag_votes (
    vote_id UUID PRIMARY KEY,
    flag_id UUID REFERENCES flags(flag_id) NOT NULL,
    user_id UUID REFERENCES users(id) NOT NULL,
    vote SMALLINT CHECK (vote IN (-1, 1)),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(flag_id, user_id)
); 
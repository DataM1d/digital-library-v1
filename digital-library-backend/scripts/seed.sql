TRUNCATE users, categories, posts, comments, tags, post_tags RESTART IDENTITY CASCADE;

INSERT INTO users (username, email, password_hash, role)
VALUES ('librarian', 'admin@library.com', '$2a$10$ByI6mSkvK/P2v6G6lH.O9.9mCUp/pA.pGfV8yUfGv.f.f.f.f.f.f', 'admin');

INSERT INTO categories (name, slug)
VALUES
('Manuscripts', 'manuscripts'),
('Digital Art', 'digital-art'),
('Photography', 'photography'),
('Archives', 'archives');

INSERT INTO tags (name) VALUES ('Renaissance'), ('Historical'), ('Modern'), ('Blueprints');

DO $$
BEGIN 
    FOR i IN 1..50 LOOP
        INSERT INTO posts (
            title, content, image_url, blur_hash, alt_text,
            slug, status, category_id, created_by, last_modified_by,
            meta_description, og_image, created_at, updated_at
        )
        VALUES (
            'Library Entry #' || i,
            'This is deep archive entry number ' || i || '.',
            '/uploads/seed-placeholder.jpg',
            'LEHV6nWB2yk8pyo0adRj00WV8DNG',
            'Image of Library Entry ' || i,
            'published',
            (SELECT id FROM categories ORDER BY RANDOM() LIMIT 1), 
            1, 1,
            'SEO description for artifact ' || i,
            '/uploads/seed-placeholder.jpg',
            NOW() - (i || ' hours')::interval,
            NOW()
        );
    END LOOP;
END $$;

INSERT INTO post_tags (post_id, tag_id)
SELECT p.id, t.id
FROM posts p, tags t 
WHERE p.id <= 10
ORDER BY RANDOM() LIMIT 20;

INSERT INTO comments (post_id, user_id, content) 
VALUES (1, 1, 'Top level comment on entry #1');

INSERT INTO comments (post_id, user_id, content, parent_id) 
VALUES (1, 1, 'First reply to the top level', 1);

INSERT INTO comments (post_id, user_id, content, parent_id) 
VALUES (1, 1, 'A nested reply (3 levels deep)', 2);
TRUNCATE users, categories, posts, comments, tags, post_tags RESTART IDENTITY CASCADE;

INSERT INTO users (username, email, password_hash, role)
VALUES ('andro', 'andro@archive.com', '$2a$10$ByI6mSkvK/P2v6G6lH.O9.9mCUp/pA.pGfV8yUfGv.f.f.f.f.f.f', 'admin');

INSERT INTO categories (name, slug) VALUES 
('Manuscripts', 'manuscripts'), 
('Digital Art', 'digital-art'), 
('Photography', 'photography'), 
('Archives', 'archives');

INSERT INTO tags (name) VALUES ('Renaissance'), ('Historical'), ('Modern'), ('Blueprints');

INSERT INTO posts (title, content, image_url, blur_hash, slug, status, category_id, created_by, last_modified_by, is_permanent, aspect_ratio, created_at, updated_at)
VALUES 
('The Kronan Shipwreck', 'The Royal Ship Kronan was one of the largest ships in the world.', 'https://plus.unsplash.com/premium_photo-1680103200092-47d168b2a46c', 'LEHV6nWB2yk8pyo0adRj00WV8DNG', 'the-kronan-shipwreck', 'published', 1, 1, 1, TRUE, 'landscape', NOW(), NOW()),
('Stockholm Public Library', 'Notable example of the Swedish Grace style.', 'https://plus.unsplash.com/premium_photo-1680103200092-47d168b2a46c', 'LEHV6nWB2yk8pyo0adRj00WV8DNG', 'stockholm-public-library', 'published', 2, 1, 1, TRUE, 'portrait', NOW(), NOW()),
('Turning Torso', 'Neo-futurist residential skyscraper in Malmö.', 'https://plus.unsplash.com/premium_photo-1680103200092-47d168b2a46c', 'LEHV6nWB2yk8pyo0adRj00WV8DNG', 'turning-torso', 'published', 2, 1, 1, TRUE, 'square', NOW(), NOW());

DO $$
BEGIN 
    FOR i IN 1..20 LOOP
        INSERT INTO posts (
            title, content, image_url, blur_hash, slug, status, 
            category_id, created_by, last_modified_by, is_permanent, aspect_ratio, created_at, updated_at
        )
        VALUES (
            'Library Entry #' || i,
            'This is deep archive entry number ' || i || '.',
            '/uploads/seed-placeholder.jpg',
            'LEHV6nWB2yk8pyo0adRj00WV8DNG',
            'entry-' || i,
            'published',
            (SELECT id FROM categories ORDER BY RANDOM() LIMIT 1), 
            1, 1, FALSE, 'portrait', NOW(), NOW()
        );
    END LOOP;
END $$;

INSERT INTO post_tags (post_id, tag_id)
SELECT p.id, t.id
FROM posts p, tags t 
WHERE p.id <= 10
ORDER BY RANDOM() LIMIT 20;

INSERT INTO comments (post_id, user_id, content, created_at) 
VALUES (1, 1, 'Top level comment on entry #1', NOW());
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

UPDATE posts SET image_url = 'https://plus.unsplash.com/premium_photo-1680103200092-47d168b2a46c?auto=format&fit=crop&q=80&w=800' WHERE slug = 'the-vasa-warship';


INSERT INTO posts (title, content, slug, category_id, user_id, created_at) VALUES
('The Kronan Shipwreck', 'The Royal Ship Kronan was one of the largest ships in the world when it sank in 1676 during the Battle of Öland.', 'the-kronan-shipwreck', 1, 1, NOW()),
('Stockholm Public Library', 'Designed by architect Erik Gunnar Asplund, this is one of the most notable examples of the Swedish Grace style.', 'stockholm-public-library', 2, 1, NOW()),
('Drottningholm Palace', 'The private residence of the Swedish royal family and a UNESCO World Heritage site since 1991.', 'drottningholm-palace', 2, 1, NOW()),
('Turning Torso', 'A neo-futurist residential skyscraper in Malmö and the first twisted skyscraper in the world.', 'turning-torso', 2, 1, NOW()),
('The Mars Makalös', 'The largest ship of its time, carrying 107 guns, it sank in 1564 during a naval battle in the Baltic Sea.', 'the-mars-makalos', 1, 1, NOW()),
('Visby City Wall', 'The strongest and most extensive medieval city wall in Scandinavia, dating back to the 13th century.', 'visby-city-wall', 2, 1, NOW());

INSERT INTO comments (post_id, user_id, content, created_at) VALUES
(2, 1, 'The rotunda in this library is an architectural masterpiece.', NOW()),
(3, 1, 'The Baroque gardens are especially impressive during the summer months.', NOW());
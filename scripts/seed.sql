INSERT INTO categories (name, slug) VALUES 
('Architecture', 'architecture'),
('Photography', 'photography'),
('Graphic Design', 'design')
ON CONFLICT DO NOTHING;

DO $$
BEGIN 
    FOR i IN 1..50 LOOP
        INSERT INTO posts (
            title,
            content,
            image_url,
            blur_hash,
            slug,
            status,
            category_id,
            created_by,
            meta_description,
            created_at
        )
        VALUES (
            'Library Entry #' || i,
            'This is a generated post for testing pagination and search. Entry number ' || i || ' contains sample data.',
            '/uploads/seed-placeholder.jpg',
            'LEHV6nWB2yk8pyo0adRj00WV8DNG',
            'library-entry-' || i,
            'published',
            (SELECT id FROM categories ORDER BY RANDOM() LIMIT 1), 1, 'A brief SEO description for library entry ' || i,
            NOW() - (i || ' hours')::interval
        );
    END LOOP;
END $$;
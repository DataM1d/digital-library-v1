DO $$
BEGIN 
    FOR i IN 1..50 LOOP
        INSERT INTO posts (
            title, content, image_url, blur_hash, slug, status, 
            category_id, created_by, last_modified_by, meta_description, created_at, updated_at
        )
        VALUES (
            'Library Entry #' || i,
            'Fresh data entry number ' || i,
            '/uploads/seed-placeholder.jpg',
            'LEHV6nWB2yk8pyo0adRj00WV8DNG',
            'library-entry-' || i,
            'published',
            (SELECT id FROM categories ORDER BY RANDOM() LIMIT 1), 
            1, 1,
            'SEO description for ' || i,
            NOW() - (i || ' hours')::interval,
            NOW()
        );
    END LOOP;
END $$;
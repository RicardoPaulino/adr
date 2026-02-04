-- This SQL file is for inserting a new profile into the 'profiles' table.
-- The 'id' field MUST be the UUID of an authenticated user from Supabase (from the auth.users table).
-- The 'full_name' field is the display name for the user.

INSERT INTO profiles (id, full_name)
VALUES
    ('your-supabase-user-uuid-here', 'Your Full Name');

-- Example:
-- INSERT INTO profiles (id, full_name)
-- VALUES
--     ('a1b2c3d4-e5f6-7890-1234-567890abcdef', 'Jane Doe');

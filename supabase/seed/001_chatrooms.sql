-- Insert sample user profiles (without auth users)
INSERT INTO user_profile (id, username) VALUES 
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'soccer_alice'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'guitar_bob'),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'chef_charlie'),
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'yoga_diana');

-- Insert sample addresses in Greater Toronto Area
INSERT INTO address (id, place_name, city, state, postal_code, country, longitude, latitude) VALUES 
    ('addr-0001-0001-0001-0001-000000000001', 'Toronto', 'Toronto', 'ON', 'M6J 1G1', 'Canada', -79.4116, 43.6476),
    ('addr-0002-0002-0002-0002-000000000002', 'Richmond Hill', 'Richmond Hill', 'ON', 'L4C 6Z7', 'Canada', -79.4370, 43.8828),
    ('addr-0003-0003-0003-0003-000000000003', 'North York', 'North York', 'ON', 'M2N 5N9', 'Canada', -79.4112, 43.7615),
    ('addr-0004-0004-0004-0004-000000000004', 'Mississauga', 'Mississauga', 'ON', 'L5B 3C1', 'Canada', -79.6441, 43.5890);

-- Insert sample chatrooms with address relations
INSERT INTO chatroom (id, host_id, title, description, thumbnail_url, address_id, max_participants) VALUES 
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Weekend Soccer League', 'Organizing pickup games and discussing match strategies', 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=400&fit=crop', 'addr-0001-0001-0001-0001-000000000001', 10),
    ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Guitar Enthusiasts', 'Share tabs, discuss techniques, and plan jam sessions', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop', 'addr-0002-0002-0002-0002-000000000002', 8),
    ('gggggggg-gggg-gggg-gggg-gggggggggggg', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Home Cooking Club', 'Recipe sharing, cooking tips, and foodie adventures', 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop', 'addr-0003-0003-0003-0003-000000000003', 15),
    ('hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Morning Yoga Group', 'Daily practice motivation and pose discussions', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=400&fit=crop', 'addr-0004-0004-0004-0004-000000000004', 6);

-- Update host nicknames (hosts are automatically added via trigger but without nicknames)
UPDATE chatroom_participants SET nickname = 'Captain Alice' 
WHERE chatroom_id = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee' AND user_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

UPDATE chatroom_participants SET nickname = 'Guitar Master Bob' 
WHERE chatroom_id = 'ffffffff-ffff-ffff-ffff-ffffffffffff' AND user_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

UPDATE chatroom_participants SET nickname = 'Chef Charlie' 
WHERE chatroom_id = 'gggggggg-gggg-gggg-gggg-gggggggggggg' AND user_id = 'cccccccc-cccc-cccc-cccc-cccccccccccc';

UPDATE chatroom_participants SET nickname = 'Zen Master Alice' 
WHERE chatroom_id = 'hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh' AND user_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

-- Insert additional participants
INSERT INTO chatroom_participants (chatroom_id, user_id, nickname) VALUES 
    -- Weekend Soccer League participants
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Bob the Striker'), -- guitar_bob joins
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Diana'), -- yoga_diana joins
    
    -- Guitar Enthusiasts participants
    ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Alice'), -- soccer_alice joins
    ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Chef Charlie'), -- chef_charlie joins
    
    -- Home Cooking Club participants
    ('gggggggg-gggg-gggg-gggg-gggggggggggg', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Soccer Alice'), -- soccer_alice joins
    ('gggggggg-gggg-gggg-gggg-gggggggggggg', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Guitar Bob'), -- guitar_bob joins
    ('gggggggg-gggg-gggg-gggg-gggggggggggg', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Yoga Diana'), -- yoga_diana joins
    
    -- Morning Yoga Group participants
    ('hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Charlie the Zen Chef'), -- chef_charlie joins
    ('hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Diana Namaste'); -- yoga_diana joins 
-- Insert sample chat messages for the new chatrooms
-- Note: Timestamps are set to create a realistic conversation flow

-- Downtown Fitness Club messages (chat-tor-001)
INSERT INTO chat_messages (id, chatroom_id, sender_id, message, message_type, is_deleted, is_edited, created_at, updated_at) VALUES 
    ('msg-tor-001-001', 'chat-tor-001', '10000000-0000-0000-0000-000000000001', 'Good morning everyone! 6 AM workout starts in 15 minutes. Who''s joining?', 'user_message', FALSE, FALSE, NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours'),
    ('msg-tor-001-002', 'chat-tor-001', '10000000-0000-0000-0000-000000000002', 'I''m on my way! Just grabbing my water bottle 💪', 'user_message', FALSE, FALSE, NOW() - INTERVAL '1 hour 45 minutes', NOW() - INTERVAL '1 hour 45 minutes'),
    ('msg-tor-001-003', 'chat-tor-001', '10000000-0000-0000-0000-000000000003', 'Count me in! What''s today''s focus?', 'user_message', FALSE, FALSE, NOW() - INTERVAL '1 hour 30 minutes', NOW() - INTERVAL '1 hour 30 minutes'),
    ('msg-tor-001-004', 'chat-tor-001', '10000000-0000-0000-0000-000000000001', 'Today we''re doing HIIT cardio and core strength. Bring a towel!', 'user_message', FALSE, FALSE, NOW() - INTERVAL '1 hour 15 minutes', NOW() - INTERVAL '1 hour 15 minutes');

-- Liberty Village Foodies messages (chat-tor-002)
INSERT INTO chat_messages (id, chatroom_id, sender_id, message, message_type, is_deleted, is_edited, created_at, updated_at) VALUES 
    ('msg-tor-002-001', 'chat-tor-002', '10000000-0000-0000-0000-000000000002', 'Has anyone tried the new ramen place on King Street West?', 'user_message', FALSE, FALSE, NOW() - INTERVAL '3 hours', NOW() - INTERVAL '3 hours'),
    ('msg-tor-002-002', 'chat-tor-002', '10000000-0000-0000-0000-000000000005', 'Yes! The tonkotsu broth is incredible. A bit pricey but worth it 🍜', 'user_message', FALSE, FALSE, NOW() - INTERVAL '2 hours 45 minutes', NOW() - INTERVAL '2 hours 45 minutes'),
    ('msg-tor-002-003', 'chat-tor-002', '10000000-0000-0000-0000-000000000006', 'I prefer the miso ramen there. Their chashu is so tender!', 'user_message', FALSE, FALSE, NOW() - INTERVAL '2 hours 30 minutes', NOW() - INTERVAL '2 hours 30 minutes'),
    ('msg-tor-002-004', 'chat-tor-002', '10000000-0000-0000-0000-000000000002', 'Let''s plan a group dinner there this Friday! Who''s in?', 'user_message', FALSE, FALSE, NOW() - INTERVAL '2 hours 15 minutes', NOW() - INTERVAL '2 hours 15 minutes');

-- Beaches Photography Walk messages (chat-tor-003)
INSERT INTO chat_messages (id, chatroom_id, sender_id, message, message_type, is_deleted, is_edited, created_at, updated_at) VALUES 
    ('msg-tor-003-001', 'chat-tor-003', '10000000-0000-0000-0000-000000000003', 'Golden hour starts at 7:15 PM today. Perfect for lakefront shots!', 'user_message', FALSE, FALSE, NOW() - INTERVAL '4 hours', NOW() - INTERVAL '4 hours'),
    ('msg-tor-003-002', 'chat-tor-003', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Should I bring my telephoto lens for bird photography?', 'user_message', FALSE, FALSE, NOW() - INTERVAL '3 hours 45 minutes', NOW() - INTERVAL '3 hours 45 minutes'),
    ('msg-tor-003-003', 'chat-tor-003', '10000000-0000-0000-0000-000000000003', 'Definitely! I saw some herons near the pier yesterday 📸', 'user_message', FALSE, FALSE, NOW() - INTERVAL '3 hours 30 minutes', NOW() - INTERVAL '3 hours 30 minutes');

-- Vancouver Coffee Crawl messages (chat-van-001)
INSERT INTO chat_messages (id, chatroom_id, sender_id, message, message_type, is_deleted, is_edited, created_at, updated_at) VALUES 
    ('msg-van-001-001', 'chat-van-001', '20000000-0000-0000-0000-000000000001', 'Starting our coffee tour at Revolver on Cambie Street. Meet there at 2 PM!', 'user_message', FALSE, FALSE, NOW() - INTERVAL '2 hours 30 minutes', NOW() - INTERVAL '2 hours 30 minutes'),
    ('msg-van-001-002', 'chat-van-001', '20000000-0000-0000-0000-000000000002', 'Perfect! I''ll bring my coffee passport to track all the places we visit ☕', 'user_message', FALSE, FALSE, NOW() - INTERVAL '2 hours 15 minutes', NOW() - INTERVAL '2 hours 15 minutes'),
    ('msg-van-001-003', 'chat-van-001', '20000000-0000-0000-0000-000000000003', 'Can''t wait to try their single-origin Ethiopian beans!', 'user_message', FALSE, FALSE, NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours'),
    ('msg-van-001-004', 'chat-van-001', '20000000-0000-0000-0000-000000000004', 'After Revolver, should we hit up 49th Parallel or JJ Bean?', 'user_message', FALSE, FALSE, NOW() - INTERVAL '1 hour 45 minutes', NOW() - INTERVAL '1 hour 45 minutes');

-- Richmond Night Market messages (chat-van-002)
INSERT INTO chat_messages (id, chatroom_id, sender_id, message, message_type, is_deleted, is_edited, created_at, updated_at) VALUES 
    ('msg-van-002-001', 'chat-van-002', '20000000-0000-0000-0000-000000000002', 'The night market opens at 7 PM tonight! Who wants to explore together?', 'user_message', FALSE, FALSE, NOW() - INTERVAL '5 hours', NOW() - INTERVAL '5 hours'),
    ('msg-van-002-002', 'chat-van-002', '20000000-0000-0000-0000-000000000005', 'I''m in! Must try the takoyaki and taiwanese popcorn chicken 🍗', 'user_message', FALSE, FALSE, NOW() - INTERVAL '4 hours 45 minutes', NOW() - INTERVAL '4 hours 45 minutes'),
    ('msg-van-002-003', 'chat-van-002', '20000000-0000-0000-0000-000000000006', 'Don''t forget the mango shaved ice! Best dessert there', 'user_message', FALSE, FALSE, NOW() - INTERVAL '4 hours 30 minutes', NOW() - INTERVAL '4 hours 30 minutes'),
    ('msg-van-002-004', 'chat-van-002', '20000000-0000-0000-0000-000000000007', 'I heard they have new Korean corn dogs this year. Let''s try everything!', 'user_message', FALSE, FALSE, NOW() - INTERVAL '4 hours 15 minutes', NOW() - INTERVAL '4 hours 15 minutes');

-- Kensington Market Musicians messages (chat-tor-005)
INSERT INTO chat_messages (id, chatroom_id, sender_id, message, message_type, is_deleted, is_edited, created_at, updated_at) VALUES 
    ('msg-tor-005-001', 'chat-tor-005', '10000000-0000-0000-0000-000000000005', 'Open mic night at Graffiti''s Bar tomorrow! Who''s performing?', 'user_message', FALSE, FALSE, NOW() - INTERVAL '6 hours', NOW() - INTERVAL '6 hours'),
    ('msg-tor-005-002', 'chat-tor-005', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'I''ll bring my acoustic guitar and play some folk songs 🎸', 'user_message', FALSE, FALSE, NOW() - INTERVAL '5 hours 45 minutes', NOW() - INTERVAL '5 hours 45 minutes'),
    ('msg-tor-005-003', 'chat-tor-005', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Count me in! I''ve been working on a new jazz piece', 'user_message', FALSE, FALSE, NOW() - INTERVAL '5 hours 30 minutes', NOW() - INTERVAL '5 hours 30 minutes'),
    ('msg-tor-005-004', 'chat-tor-005', '10000000-0000-0000-0000-000000000005', 'Awesome! Let''s meet at 6 PM to practice together first', 'user_message', FALSE, FALSE, NOW() - INTERVAL '5 hours 15 minutes', NOW() - INTERVAL '5 hours 15 minutes');

-- High Park Runners messages (chat-tor-008)
INSERT INTO chat_messages (id, chatroom_id, sender_id, message, message_type, is_deleted, is_edited, created_at, updated_at) VALUES 
    ('msg-tor-008-001', 'chat-tor-008', '10000000-0000-0000-0000-000000000008', 'Trail conditions are perfect this morning! 5K loop starting at 7 AM', 'user_message', FALSE, FALSE, NOW() - INTERVAL '3 hours', NOW() - INTERVAL '3 hours'),
    ('msg-tor-008-002', 'chat-tor-008', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'I''ll be there! Been training for the Toronto Waterfront Marathon', 'user_message', FALSE, FALSE, NOW() - INTERVAL '2 hours 45 minutes', NOW() - INTERVAL '2 hours 45 minutes'),
    ('msg-tor-008-003', 'chat-tor-008', '10000000-0000-0000-0000-000000000008', 'Great! We can work on pacing strategies during the run', 'user_message', FALSE, FALSE, NOW() - INTERVAL '2 hours 30 minutes', NOW() - INTERVAL '2 hours 30 minutes');

-- Burnaby Mountain Hikers messages (chat-van-003)
INSERT INTO chat_messages (id, chatroom_id, sender_id, message, message_type, is_deleted, is_edited, created_at, updated_at) VALUES 
    ('msg-van-003-001', 'chat-van-003', '20000000-0000-0000-0000-000000000003', 'Planning a sunset hike to Burnaby Mountain this Saturday. Trail is moderate difficulty', 'user_message', FALSE, FALSE, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
    ('msg-van-003-002', 'chat-van-003', '10000000-0000-0000-0000-000000000007', 'Sounds perfect! What time should we start to catch the sunset?', 'user_message', FALSE, FALSE, NOW() - INTERVAL '23 hours', NOW() - INTERVAL '23 hours'),
    ('msg-van-003-003', 'chat-van-003', '20000000-0000-0000-0000-000000000003', 'Let''s start at 4 PM. Should take about 2 hours to reach the viewpoint', 'user_message', FALSE, FALSE, NOW() - INTERVAL '22 hours 45 minutes', NOW() - INTERVAL '22 hours 45 minutes'),
    ('msg-van-003-004', 'chat-van-003', '10000000-0000-0000-0000-000000000007', 'Perfect! I''ll bring extra water and some trail snacks 🥾', 'user_message', FALSE, FALSE, NOW() - INTERVAL '22 hours 30 minutes', NOW() - INTERVAL '22 hours 30 minutes');

-- Mississauga Multicultural Kitchen messages (chat-tor-023)
INSERT INTO chat_messages (id, chatroom_id, sender_id, message, message_type, is_deleted, is_edited, created_at, updated_at) VALUES 
    ('msg-tor-023-001', 'chat-tor-023', '20000000-0000-0000-0000-000000000008', 'This week''s theme: Indian street food! Who wants to share their chaat recipes?', 'user_message', FALSE, FALSE, NOW() - INTERVAL '8 hours', NOW() - INTERVAL '8 hours'),
    ('msg-tor-023-002', 'chat-tor-023', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'I make amazing bhel puri! Happy to teach everyone this Sunday', 'user_message', FALSE, FALSE, NOW() - INTERVAL '7 hours 45 minutes', NOW() - INTERVAL '7 hours 45 minutes'),
    ('msg-tor-023-003', 'chat-tor-023', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'My grandmother''s samosa recipe is a family secret, but I''ll share it! 🥟', 'user_message', FALSE, FALSE, NOW() - INTERVAL '7 hours 30 minutes', NOW() - INTERVAL '7 hours 30 minutes'),
    ('msg-tor-023-004', 'chat-tor-023', '20000000-0000-0000-0000-000000000008', 'Wonderful! Let''s meet at the community kitchen at 2 PM Sunday', 'user_message', FALSE, FALSE, NOW() - INTERVAL '7 hours 15 minutes', NOW() - INTERVAL '7 hours 15 minutes');

-- North Vancouver Yoga Retreat messages (chat-van-009)
INSERT INTO chat_messages (id, chatroom_id, sender_id, message, message_type, is_deleted, is_edited, created_at, updated_at) VALUES 
    ('msg-van-009-001', 'chat-van-009', '20000000-0000-0000-0000-000000000009', 'Morning meditation at Capilano River tomorrow. Bring a mat and water', 'user_message', FALSE, FALSE, NOW() - INTERVAL '12 hours', NOW() - INTERVAL '12 hours'),
    ('msg-van-009-002', 'chat-van-009', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'I love the sound of the river during practice. So peaceful 🧘‍♀️', 'user_message', FALSE, FALSE, NOW() - INTERVAL '11 hours 45 minutes', NOW() - INTERVAL '11 hours 45 minutes'),
    ('msg-van-009-003', 'chat-van-009', '20000000-0000-0000-0000-000000000009', 'Exactly! Nature''s soundtrack is the best for mindfulness', 'user_message', FALSE, FALSE, NOW() - INTERVAL '11 hours 30 minutes', NOW() - INTERVAL '11 hours 30 minutes');

-- Hamilton Steel City Runners messages (chat-ext-001)
INSERT INTO chat_messages (id, chatroom_id, sender_id, message, message_type, is_deleted, is_edited, created_at, updated_at) VALUES 
    ('msg-ext-001-001', 'chat-ext-001', '10000000-0000-0000-0000-00000000000b', 'Exploring the Dundas Valley trails this weekend. Who''s joining the adventure?', 'user_message', FALSE, FALSE, NOW() - INTERVAL '1 day 2 hours', NOW() - INTERVAL '1 day 2 hours'),
    ('msg-ext-001-002', 'chat-ext-001', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Count me in! I heard the fall colors are amazing right now 🍂', 'user_message', FALSE, FALSE, NOW() - INTERVAL '1 day 1 hour 45 minutes', NOW() - INTERVAL '1 day 1 hour 45 minutes'),
    ('msg-ext-001-003', 'chat-ext-001', '10000000-0000-0000-0000-00000000000b', 'Perfect timing! It''s a 10K trail with some challenging hills', 'user_message', FALSE, FALSE, NOW() - INTERVAL '1 day 1 hour 30 minutes', NOW() - INTERVAL '1 day 1 hour 30 minutes');

-- Tech Innovation Hub messages (chat-ext-002)
INSERT INTO chat_messages (id, chatroom_id, sender_id, message, message_type, is_deleted, is_edited, created_at, updated_at) VALUES 
    ('msg-ext-002-001', 'chat-ext-002', '10000000-0000-0000-0000-00000000000c', 'Next week''s tech talk: "Building Scalable React Applications" - who''s presenting?', 'user_message', FALSE, FALSE, NOW() - INTERVAL '10 hours', NOW() - INTERVAL '10 hours'),
    ('msg-ext-002-002', 'chat-ext-002', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'I can present on state management patterns! Been working with Redux Toolkit', 'user_message', FALSE, FALSE, NOW() - INTERVAL '9 hours 45 minutes', NOW() - INTERVAL '9 hours 45 minutes'),
    ('msg-ext-002-003', 'chat-ext-002', '10000000-0000-0000-0000-00000000000c', 'Perfect! Let''s also cover testing strategies. Very relevant topic 💻', 'user_message', FALSE, FALSE, NOW() - INTERVAL '9 hours 30 minutes', NOW() - INTERVAL '9 hours 30 minutes');

-- Add some system messages for host changes and user joins/leaves
INSERT INTO chat_messages (id, chatroom_id, sender_id, message, message_type, is_deleted, is_edited, created_at, updated_at) VALUES 
    ('sys-tor-001-001', 'chat-tor-001', '10000000-0000-0000-0000-000000000001', 'Fitness Alex created the chatroom', 'system_message', FALSE, FALSE, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
    ('sys-tor-002-001', 'chat-tor-002', '10000000-0000-0000-0000-000000000002', 'Chef Bella created the chatroom', 'system_message', FALSE, FALSE, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
    ('sys-van-001-001', 'chat-van-001', '20000000-0000-0000-0000-000000000001', 'Coffee Penny created the chatroom', 'system_message', FALSE, FALSE, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
    ('sys-van-002-001', 'chat-van-002', '20000000-0000-0000-0000-000000000002', 'Night Market Quinn created the chatroom', 'system_message', FALSE, FALSE, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day');
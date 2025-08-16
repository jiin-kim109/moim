-- Insert additional user profiles for expanded chatrooms
INSERT INTO user_profile (id, username) VALUES 
    ('10000000-0000-0000-0000-000000000001', 'fitness_alex'),
    ('10000000-0000-0000-0000-000000000002', 'chef_bella'),
    ('10000000-0000-0000-0000-000000000003', 'photographer_carlos'),
    ('10000000-0000-0000-0000-000000000004', 'dancer_diana'),
    ('10000000-0000-0000-0000-000000000005', 'musician_ethan'),
    ('10000000-0000-0000-0000-000000000006', 'artist_fiona'),
    ('10000000-0000-0000-0000-000000000007', 'runner_gabriel'),
    ('10000000-0000-0000-0000-000000000008', 'baker_hannah'),
    ('10000000-0000-0000-0000-000000000009', 'climber_ivan'),
    ('10000000-0000-0000-0000-00000000000a', 'writer_julia'),
    ('10000000-0000-0000-0000-00000000000b', 'swimmer_kevin'),
    ('10000000-0000-0000-0000-00000000000c', 'gamer_luna'),
    ('10000000-0000-0000-0000-00000000000d', 'teacher_mason'),
    ('10000000-0000-0000-0000-00000000000e', 'nurse_nina'),
    ('10000000-0000-0000-0000-00000000000f', 'engineer_oscar'),
    ('20000000-0000-0000-0000-000000000001', 'student_penny'),
    ('20000000-0000-0000-0000-000000000002', 'barista_quinn'),
    ('20000000-0000-0000-0000-000000000003', 'trainer_ruby'),
    ('20000000-0000-0000-0000-000000000004', 'gardener_sam'),
    ('20000000-0000-0000-0000-000000000005', 'cyclist_tara'),
    ('20000000-0000-0000-0000-000000000006', 'hiker_ulysses'),
    ('20000000-0000-0000-0000-000000000007', 'painter_vera'),
    ('20000000-0000-0000-0000-000000000008', 'chef_william'),
    ('20000000-0000-0000-0000-000000000009', 'yogi_xara'),
    ('20000000-0000-0000-0000-00000000000a', 'skater_zoe');

-- Insert Toronto area addresses (within 30km)
INSERT INTO address (id, place_name, city, state, postal_code, country, longitude, latitude) VALUES 
    -- Toronto core and nearby (within 30km)
    ('addr-tor-001', 'Downtown Toronto', 'Toronto', 'ON', 'M5H 2N2', 'Canada', -79.3832, 43.6532),
    ('addr-tor-002', 'Liberty Village', 'Toronto', 'ON', 'M6K 3P6', 'Canada', -79.4225, 43.6395),
    ('addr-tor-003', 'The Beaches', 'Toronto', 'ON', 'M4E 1C4', 'Canada', -79.2975, 43.6677),
    ('addr-tor-004', 'Leslieville', 'Toronto', 'ON', 'M4M 3H9', 'Canada', -79.3389, 43.6593),
    ('addr-tor-005', 'Kensington Market', 'Toronto', 'ON', 'M5T 2S8', 'Canada', -79.4003, 43.6544),
    ('addr-tor-006', 'Queen West', 'Toronto', 'ON', 'M6J 1H4', 'Canada', -79.4178, 43.6476),
    ('addr-tor-007', 'The Annex', 'Toronto', 'ON', 'M5S 3M2', 'Canada', -79.4056, 43.6689),
    ('addr-tor-008', 'High Park', 'Toronto', 'ON', 'M6P 2T3', 'Canada', -79.4634, 43.6467),
    ('addr-tor-009', 'Corktown', 'Toronto', 'ON', 'M5A 3C4', 'Canada', -79.3594, 43.6503),
    ('addr-tor-010', 'Junction Triangle', 'Toronto', 'ON', 'M6P 1Y6', 'Canada', -79.4678, 43.6542),
    ('addr-tor-011', 'Riverdale', 'Toronto', 'ON', 'M4K 1P1', 'Canada', -79.3523, 43.6598),
    ('addr-tor-012', 'Cabbagetown', 'Toronto', 'ON', 'M4X 1K2', 'Canada', -79.3667, 43.6611),
    ('addr-tor-013', 'Little Italy', 'Toronto', 'ON', 'M6G 3E4', 'Canada', -79.4204, 43.6544),
    ('addr-tor-014', 'Parkdale', 'Toronto', 'ON', 'M6K 2X2', 'Canada', -79.4375, 43.6394),
    ('addr-tor-015', 'East York', 'East York', 'ON', 'M4G 1B3', 'Canada', -79.3389, 43.6890),
    ('addr-tor-016', 'North York Centre', 'North York', 'ON', 'M2N 6K1', 'Canada', -79.4112, 43.7615),
    ('addr-tor-017', 'Scarborough Town Centre', 'Scarborough', 'ON', 'M1P 4P5', 'Canada', -79.2859, 43.7731),
    ('addr-tor-018', 'Etobicoke Centre', 'Etobicoke', 'ON', 'M9C 4Z5', 'Canada', -79.5790, 43.6194),
    ('addr-tor-019', 'Thornhill', 'Thornhill', 'ON', 'L4J 8C7', 'Canada', -79.4389, 43.8150),
    ('addr-tor-020', 'Richmond Hill Centre', 'Richmond Hill', 'ON', 'L4C 9R6', 'Canada', -79.4370, 43.8828),
    ('addr-tor-021', 'Markham Centre', 'Markham', 'ON', 'L3R 0E2', 'Canada', -79.3370, 43.8561),
    ('addr-tor-022', 'Vaughan Mills', 'Vaughan', 'ON', 'L4K 5W4', 'Canada', -79.5322, 43.8361),
    ('addr-tor-023', 'Mississauga Centre', 'Mississauga', 'ON', 'L5B 1M2', 'Canada', -79.6441, 43.5890),
    ('addr-tor-024', 'Brampton Centre', 'Brampton', 'ON', 'L6T 0G1', 'Canada', -79.7624, 43.7315),
    ('addr-tor-025', 'Oakville Centre', 'Oakville', 'ON', 'L6M 3H1', 'Canada', -79.6876, 43.4675),
    ('addr-tor-026', 'Burlington Centre', 'Burlington', 'ON', 'L7R 2Y4', 'Canada', -79.7990, 43.3255),
    ('addr-tor-027', 'Pickering Centre', 'Pickering', 'ON', 'L1V 6K5', 'Canada', -79.0377, 43.8384),
    ('addr-tor-028', 'Ajax Centre', 'Ajax', 'ON', 'L1S 7K8', 'Canada', -79.0204, 43.8509),
    ('addr-tor-029', 'Whitby Centre', 'Whitby', 'ON', 'L1N 9A3', 'Canada', -78.9429, 43.8753),
    ('addr-tor-030', 'Oshawa Centre', 'Oshawa', 'ON', 'L1J 8P5', 'Canada', -78.8658, 43.9045),
    ('addr-tor-031', 'Aurora Centre', 'Aurora', 'ON', 'L4G 3G8', 'Canada', -79.4504, 44.0065),
    ('addr-tor-032', 'Newmarket Centre', 'Newmarket', 'ON', 'L3Y 8Y8', 'Canada', -79.4613, 44.0592),
    ('addr-tor-033', 'Milton Centre', 'Milton', 'ON', 'L9T 5E1', 'Canada', -79.8774, 43.5183),
    ('addr-tor-034', 'Georgetown Centre', 'Georgetown', 'ON', 'L7G 5L3', 'Canada', -79.9072, 43.6497),
    ('addr-tor-035', 'York Region', 'King City', 'ON', 'L7B 1A6', 'Canada', -79.5262, 43.9230),
    
    -- Beyond 30km Toronto area (5 locations)
    ('addr-ext-001', 'Hamilton Centre', 'Hamilton', 'ON', 'L8P 4R5', 'Canada', -79.8711, 43.2557),
    ('addr-ext-002', 'Kitchener Centre', 'Kitchener', 'ON', 'N2G 4X6', 'Canada', -80.4925, 43.4643),
    ('addr-ext-003', 'Guelph Centre', 'Guelph', 'ON', 'N1H 3A1', 'Canada', -80.2482, 43.5448),
    ('addr-ext-004', 'Barrie Centre', 'Barrie', 'ON', 'L4M 3X9', 'Canada', -79.6903, 44.3894),
    ('addr-ext-005', 'Uxbridge Centre', 'Uxbridge', 'ON', 'L9P 1R1', 'Canada', -79.1204, 44.1088),
    
    -- Vancouver area addresses (10 locations)
    ('addr-van-001', 'Downtown Vancouver', 'Vancouver', 'BC', 'V6B 6G1', 'Canada', -123.1207, 49.2827),
    ('addr-van-002', 'Richmond Centre', 'Richmond', 'BC', 'V6Y 2V7', 'Canada', -123.1140, 49.1666),
    ('addr-van-003', 'Burnaby Heights', 'Burnaby', 'BC', 'V5C 3T5', 'Canada', -123.0073, 49.2488),
    ('addr-van-004', 'Surrey Centre', 'Surrey', 'BC', 'V3T 4H4', 'Canada', -122.8447, 49.1913),
    ('addr-van-005', 'Coquitlam Centre', 'Coquitlam', 'BC', 'V3K 3C5', 'Canada', -122.7947, 49.2838),
    ('addr-van-006', 'Port Coquitlam Centre', 'Port Coquitlam', 'BC', 'V3B 2M3', 'Canada', -122.7811, 49.2658),
    ('addr-van-007', 'New Westminster', 'New Westminster', 'BC', 'V3M 1B9', 'Canada', -122.9107, 49.2057),
    ('addr-van-008', 'Langley Centre', 'Langley', 'BC', 'V1M 4G8', 'Canada', -122.6604, 49.1044),
    ('addr-van-009', 'North Vancouver', 'North Vancouver', 'BC', 'V7M 3J3', 'Canada', -123.0780, 49.3223),
    ('addr-van-010', 'West Vancouver', 'West Vancouver', 'BC', 'V7T 1A2', 'Canada', -123.1635, 49.3680);

-- Insert 35 Toronto area chatrooms + 5 beyond 30km
INSERT INTO chatroom (id, host_id, title, description, thumbnail_url, address_id, max_participants) VALUES 
    -- Toronto area chatrooms (35)
    ('chat-tor-001', '10000000-0000-0000-0000-000000000001', 'Downtown Fitness Club', 'Early morning workouts in the financial district', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop', 'addr-tor-001', 20),
    ('chat-tor-002', '10000000-0000-0000-0000-000000000002', 'Liberty Village Foodies', 'Exploring trendy restaurants and cafes', 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop', 'addr-tor-002', 15),
    ('chat-tor-003', '10000000-0000-0000-0000-000000000003', 'Beaches Photography Walk', 'Sunset and sunrise photography sessions', 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=400&h=400&fit=crop', 'addr-tor-003', 12),
    ('chat-tor-004', '10000000-0000-0000-0000-000000000004', 'Leslieville Dance Studio', 'Hip hop and contemporary dance classes', 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=400&h=400&fit=crop', 'addr-tor-004', 18),
    ('chat-tor-005', '10000000-0000-0000-0000-000000000005', 'Kensington Market Musicians', 'Street music and open mic nights', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop', 'addr-tor-005', 25),
    ('chat-tor-006', '10000000-0000-0000-0000-000000000006', 'Queen West Artists', 'Gallery walks and art creation meetups', 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=400&h=400&fit=crop', 'addr-tor-006', 16),
    ('chat-tor-007', '10000000-0000-0000-0000-000000000007', 'Annex Book Club', 'University area literary discussions', 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=400&fit=crop', 'addr-tor-007', 10),
    ('chat-tor-008', '10000000-0000-0000-0000-000000000008', 'High Park Runners', 'Trail running and nature appreciation', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop', 'addr-tor-008', 22),
    ('chat-tor-009', '10000000-0000-0000-0000-000000000009', 'Corktown Coffee Culture', 'Specialty coffee and brewing techniques', 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=400&fit=crop', 'addr-tor-009', 14),
    ('chat-tor-010', '10000000-0000-0000-0000-00000000000a', 'Junction Writers Circle', 'Creative writing and poetry workshops', 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&h=400&fit=crop', 'addr-tor-010', 8),
    ('chat-tor-011', '10000000-0000-0000-0000-00000000000b', 'Riverdale Family Fun', 'Kid-friendly activities and playdates', 'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=400&h=400&fit=crop', 'addr-tor-011', 30),
    ('chat-tor-012', '10000000-0000-0000-0000-00000000000c', 'Cabbagetown Heritage', 'Historical walks and architecture appreciation', 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=400&fit=crop', 'addr-tor-012', 12),
    ('chat-tor-013', '10000000-0000-0000-0000-00000000000d', 'Little Italy Cooking Class', 'Authentic Italian cuisine workshops', 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop', 'addr-tor-013', 16),
    ('chat-tor-014', '10000000-0000-0000-0000-00000000000e', 'Parkdale Community Garden', 'Urban gardening and sustainability', 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop', 'addr-tor-014', 20),
    ('chat-tor-015', '10000000-0000-0000-0000-00000000000f', 'East York Tech Meetup', 'Programming and startup discussions', 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=400&fit=crop', 'addr-tor-015', 25),
    ('chat-tor-016', '20000000-0000-0000-0000-000000000001', 'North York Study Group', 'Academic support and exam prep', 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=400&fit=crop', 'addr-tor-016', 15),
    ('chat-tor-017', '20000000-0000-0000-0000-000000000002', 'Scarborough Soccer League', 'Weekend matches and skill development', 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=400&fit=crop', 'addr-tor-017', 22),
    ('chat-tor-018', '20000000-0000-0000-0000-000000000003', 'Etobicoke Swimming Club', 'Pool training and water safety', 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=400&h=400&fit=crop', 'addr-tor-018', 18),
    ('chat-tor-019', '20000000-0000-0000-0000-000000000004', 'Thornhill Tennis Club', 'Court bookings and tournament play', 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=400&fit=crop', 'addr-tor-019', 16),
    ('chat-tor-020', '20000000-0000-0000-0000-000000000005', 'Richmond Hill Cycling', 'Road biking and maintenance workshops', 'https://images.unsplash.com/photo-1544191696-15693072d9b8?w=400&h=400&fit=crop', 'addr-tor-020', 20),
    ('chat-tor-021', '20000000-0000-0000-0000-000000000006', 'Markham Hiking Group', 'Nature trails and outdoor adventures', 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&h=400&fit=crop', 'addr-tor-021', 25),
    ('chat-tor-022', '20000000-0000-0000-0000-000000000007', 'Vaughan Art Studio', 'Painting and sculpture workshops', 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=400&h=400&fit=crop', 'addr-tor-022', 14),
    ('chat-tor-023', '20000000-0000-0000-0000-000000000008', 'Mississauga Multicultural Kitchen', 'International cuisine and cultural exchange', 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop', 'addr-tor-023', 30),
    ('chat-tor-024', '20000000-0000-0000-0000-000000000009', 'Brampton Yoga Collective', 'Mindfulness and stress relief practices', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=400&fit=crop', 'addr-tor-024', 12),
    ('chat-tor-025', '20000000-0000-0000-0000-00000000000a', 'Oakville Skateboard Park', 'Skateboarding tricks and community events', 'https://images.unsplash.com/photo-1547447134-cd3f5c716030?w=400&h=400&fit=crop', 'addr-tor-025', 18),
    ('chat-tor-026', '10000000-0000-0000-0000-000000000001', 'Burlington Lakefront Walks', 'Scenic walks and outdoor photography', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop', 'addr-tor-026', 15),
    ('chat-tor-027', '10000000-0000-0000-0000-000000000002', 'Pickering Food Truck Festival', 'Street food reviews and vendor meetups', 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop', 'addr-tor-027', 25),
    ('chat-tor-028', '10000000-0000-0000-0000-000000000003', 'Ajax Beach Volleyball', 'Sand volleyball and beach activities', 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=400&h=400&fit=crop', 'addr-tor-028', 20),
    ('chat-tor-029', '10000000-0000-0000-0000-000000000004', 'Whitby Community Theatre', 'Drama workshops and performance groups', 'https://images.unsplash.com/photo-1507676184687-d527009dd917?w=400&h=400&fit=crop', 'addr-tor-029', 16),
    ('chat-tor-030', '10000000-0000-0000-0000-000000000005', 'Oshawa Music Festival', 'Live music events and band collaborations', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop', 'addr-tor-030', 30),
    ('chat-tor-031', '10000000-0000-0000-0000-000000000006', 'Aurora Farmers Market', 'Local produce and sustainable living', 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=400&fit=crop', 'addr-tor-031', 22),
    ('chat-tor-032', '10000000-0000-0000-0000-000000000007', 'Newmarket Running Club', 'Marathon training and fitness goals', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop', 'addr-tor-032', 18),
    ('chat-tor-033', '10000000-0000-0000-0000-000000000008', 'Milton Baking Society', 'Artisan bread and pastry techniques', 'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=400&h=400&fit=crop', 'addr-tor-033', 14),
    ('chat-tor-034', '10000000-0000-0000-0000-000000000009', 'Georgetown Climbing Gym', 'Indoor climbing and bouldering', 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=400&h=400&fit=crop', 'addr-tor-034', 12),
    ('chat-tor-035', '10000000-0000-0000-0000-00000000000a', 'King City Equestrian Club', 'Horse riding and stable management', 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=400&h=400&fit=crop', 'addr-tor-035', 8),
    
    -- Beyond 30km Toronto area chatrooms (5)
    ('chat-ext-001', '10000000-0000-0000-0000-00000000000b', 'Hamilton Steel City Runners', 'Industrial trail running and urban exploration', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop', 'addr-ext-001', 25),
    ('chat-ext-002', '10000000-0000-0000-0000-00000000000c', 'Kitchener Tech Innovation Hub', 'Startup mentorship and tech talks', 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=400&fit=crop', 'addr-ext-002', 20),
    ('chat-ext-003', '10000000-0000-0000-0000-00000000000d', 'Guelph University Study Circle', 'Academic collaboration and research groups', 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=400&fit=crop', 'addr-ext-003', 15),
    ('chat-ext-004', '10000000-0000-0000-0000-00000000000e', 'Barrie Lakefront Activities', 'Water sports and lakeside recreation', 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=400&h=400&fit=crop', 'addr-ext-004', 18),
    ('chat-ext-005', '10000000-0000-0000-0000-00000000000f', 'Uxbridge Rural Adventures', 'Farm visits and countryside activities', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop', 'addr-ext-005', 12),
    
    -- Vancouver area chatrooms (10)
    ('chat-van-001', '20000000-0000-0000-0000-000000000001', 'Downtown Vancouver Coffee Crawl', 'Exploring the best coffee shops in the city', 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=400&fit=crop', 'addr-van-001', 20),
    ('chat-van-002', '20000000-0000-0000-0000-000000000002', 'Richmond Night Market Foodies', 'Asian street food and cultural experiences', 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop', 'addr-van-002', 25),
    ('chat-van-003', '20000000-0000-0000-0000-000000000003', 'Burnaby Mountain Hikers', 'Summit trails and scenic viewpoints', 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&h=400&fit=crop', 'addr-van-003', 18),
    ('chat-van-004', '20000000-0000-0000-0000-000000000004', 'Surrey Central Fitness Bootcamp', 'High-intensity outdoor workouts', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop', 'addr-van-004', 22),
    ('chat-van-005', '20000000-0000-0000-0000-000000000005', 'Coquitlam River Cycling', 'Scenic bike paths and nature rides', 'https://images.unsplash.com/photo-1544191696-15693072d9b8?w=400&h=400&fit=crop', 'addr-van-005', 16),
    ('chat-van-006', '20000000-0000-0000-0000-000000000006', 'Port Coquitlam Community Garden', 'Urban farming and sustainable practices', 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop', 'addr-van-006', 14),
    ('chat-van-007', '20000000-0000-0000-0000-000000000007', 'New Westminster Arts District', 'Gallery walks and artist studio tours', 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=400&h=400&fit=crop', 'addr-van-007', 15),
    ('chat-van-008', '20000000-0000-0000-0000-000000000008', 'Langley Farm-to-Table Cooking', 'Fresh ingredients and seasonal recipes', 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop', 'addr-van-008', 12),
    ('chat-van-009', '20000000-0000-0000-0000-000000000009', 'North Vancouver Yoga Retreat', 'Mountain yoga and meditation sessions', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=400&fit=crop', 'addr-van-009', 10),
    ('chat-van-010', '20000000-0000-0000-0000-00000000000a', 'West Vancouver Beach Volleyball', 'Seaside sports and beach activities', 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=400&h=400&fit=crop', 'addr-van-010', 20);

-- Update host nicknames for new chatrooms
UPDATE chatroom_participants SET nickname = 'Fitness Alex' 
WHERE chatroom_id = 'chat-tor-001' AND user_id = '10000000-0000-0000-0000-000000000001';

UPDATE chatroom_participants SET nickname = 'Chef Bella' 
WHERE chatroom_id = 'chat-tor-002' AND user_id = '10000000-0000-0000-0000-000000000002';

UPDATE chatroom_participants SET nickname = 'Photo Carlos' 
WHERE chatroom_id = 'chat-tor-003' AND user_id = '10000000-0000-0000-0000-000000000003';

UPDATE chatroom_participants SET nickname = 'Dance Diana' 
WHERE chatroom_id = 'chat-tor-004' AND user_id = '10000000-0000-0000-0000-000000000004';

UPDATE chatroom_participants SET nickname = 'Music Ethan' 
WHERE chatroom_id = 'chat-tor-005' AND user_id = '10000000-0000-0000-0000-000000000005';

-- Add sample participants to some chatrooms
INSERT INTO chatroom_participants (chatroom_id, user_id, nickname) VALUES 
    -- Downtown Fitness Club participants
    ('chat-tor-001', '10000000-0000-0000-0000-000000000002', 'Morning Bella'),
    ('chat-tor-001', '10000000-0000-0000-0000-000000000003', 'Cardio Carlos'),
    ('chat-tor-001', '10000000-0000-0000-0000-000000000004', 'Strong Diana'),
    
    -- Liberty Village Foodies participants  
    ('chat-tor-002', '10000000-0000-0000-0000-000000000005', 'Foodie Ethan'),
    ('chat-tor-002', '10000000-0000-0000-0000-000000000006', 'Taste Fiona'),
    ('chat-tor-002', '10000000-0000-0000-0000-000000000007', 'Hungry Gabriel'),
    
    -- Vancouver Coffee Crawl participants
    ('chat-van-001', '20000000-0000-0000-0000-000000000002', 'Barista Quinn'),
    ('chat-van-001', '20000000-0000-0000-0000-000000000003', 'Coffee Ruby'),
    ('chat-van-001', '20000000-0000-0000-0000-000000000004', 'Espresso Sam'),
    
    -- Richmond Night Market participants
    ('chat-van-002', '20000000-0000-0000-0000-000000000005', 'Market Tara'),
    ('chat-van-002', '20000000-0000-0000-0000-000000000006', 'Street Food Ulysses'),
    ('chat-van-002', '20000000-0000-0000-0000-000000000007', 'Night Market Vera');
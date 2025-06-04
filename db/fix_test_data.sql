-- Fix missing test data relationships
-- This script adds the role relationships that should exist based on TEST_DATA_SUMMARY.md

-- First, let's add the missing user_roles relationships
-- Sarah Leader (user_id=5) should be a Band Leader  
INSERT IGNORE INTO user_roles (user_id, role_id) VALUES (5, 1); -- Band Leader role

-- Mike Member (user_id=6) should be a Band Member
INSERT IGNORE INTO user_roles (user_id, role_id) VALUES (6, 2); -- Band Member role

-- John Bonham (user_id=1) should be a Band Leader
INSERT IGNORE INTO user_roles (user_id, role_id) VALUES (1, 1); -- Band Leader role

-- Charles Mingus (user_id=2) should be a Band Member  
INSERT IGNORE INTO user_roles (user_id, role_id) VALUES (2, 2); -- Band Member role

-- David Gilmour (user_id=3) should be a Band Leader
INSERT IGNORE INTO user_roles (user_id, role_id) VALUES (3, 1); -- Band Leader role

-- Diana Krall (user_id=4) should be a Band Member
INSERT IGNORE INTO user_roles (user_id, role_id) VALUES (4, 2); -- Band Member role

-- Gary General (user_id=7) should be a General User
INSERT IGNORE INTO user_roles (user_id, role_id) VALUES (7, 3); -- General User role

-- Wesley Executive (user_id=8) should be a WXTJ Executive
INSERT IGNORE INTO user_roles (user_id, role_id) VALUES (8, 4); -- WXTJ Executive role

-- Now add the band leadership relationships
-- Sarah Leader leads "The Local Beats" (band_id=1)
INSERT IGNORE INTO band_leader (user_role_id, band_id) 
SELECT ur.user_role_id, 1 
FROM user_roles ur 
WHERE ur.user_id = 5 AND ur.role_id = 1;

-- John Bonham leads "Jazz Collective" (band_id=2)  
INSERT IGNORE INTO band_leader (user_role_id, band_id)
SELECT ur.user_role_id, 2
FROM user_roles ur
WHERE ur.user_id = 1 AND ur.role_id = 1;

-- David Gilmour leads "Prog Rock Project" (band_id=3)
INSERT IGNORE INTO band_leader (user_role_id, band_id)
SELECT ur.user_role_id, 3
FROM user_roles ur  
WHERE ur.user_id = 3 AND ur.role_id = 1;

-- Now add the band membership relationships
-- Mike Member is in "The Local Beats" (band_id=1)
INSERT IGNORE INTO band_member (user_role_id, band_id)
SELECT ur.user_role_id, 1
FROM user_roles ur
WHERE ur.user_id = 6 AND ur.role_id = 2;

-- Diana Krall is in "Jazz Collective" (band_id=2)
INSERT IGNORE INTO band_member (user_role_id, band_id)
SELECT ur.user_role_id, 2
FROM user_roles ur
WHERE ur.user_id = 4 AND ur.role_id = 2;

-- Charles Mingus is in "Prog Rock Project" (band_id=3)
INSERT IGNORE INTO band_member (user_role_id, band_id)
SELECT ur.user_role_id, 3
FROM user_roles ur
WHERE ur.user_id = 2 AND ur.role_id = 2;

-- Add some general user records
INSERT IGNORE INTO general_user (user_role_id, looking_for_a_band, has_created_band, has_pending_band_request)
SELECT ur.user_role_id, FALSE, FALSE, FALSE
FROM user_roles ur
WHERE ur.user_id = 7 AND ur.role_id = 3;

-- Add WXTJ executive record
INSERT IGNORE INTO wxtj_exec (user_role_id, exec_title)
SELECT ur.user_role_id, 'Music Director'
FROM user_roles ur
WHERE ur.user_id = 8 AND ur.role_id = 4; 
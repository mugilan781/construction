USE infranest_db;

-- Clear broken or empty gallery data for existing projects
DELETE FROM project_images WHERE project_id IN (15, 16, 17);

-- Seed Project 15 (Grandview Luxury Villa) with valid assets
INSERT INTO project_images (project_id, image_url, type) VALUES
(15, 'images/project-villa.png', 'general'),
(15, 'images/interior-livingroom.png', 'general'),
(15, 'images/interior-kitchen.png', 'general'),
(15, 'images/interior-bedroom.png', 'general'),
(15, 'images/interior-bathroom.png', 'general'),
(15, 'images/project-before.png', 'general');

-- Seed Project 16 (Skyline Tech Park)
INSERT INTO project_images (project_id, image_url, type) VALUES
(16, 'images/project-techpark.png', 'general'),
(16, 'images/project-corporate.png', 'general'),
(16, 'images/project-commercial.png', 'general'),
(16, 'images/hero-bg.png', 'general');

-- Seed Project 17 (Metro Steel Plant)
INSERT INTO project_images (project_id, image_url, type) VALUES
(17, 'images/project-steelplant.png', 'general'),
(17, 'images/project-industrial.png', 'general'),
(17, 'images/project-after.png', 'general');

const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Mugilan@1504',
    database: process.env.DB_NAME || 'infranest_db'
};

const blogs = [
    {
        title: "Top 10 Construction Tips for a Flawless Build",
        subtitle: "Expert advice on avoiding common pitfalls, ensuring safety, and maintaining quality on-site.",
        date: "2025-01-10",
        author: "InfraNest Editorial",
        category: "Construction Tips",
        image: "images/project-industrial.png",
        content: "<h2>Building with Precision and Safety</h2><p>Successful construction requires more than just good blueprints; it requires meticulous execution. Over our two decades of experience at InfraNest, we have identified key practices that separate a flawless build from a problematic one. Whether you are managing a small residential project or a large commercial development, these construction tips will help you navigate common pitfalls.</p><h2>1. Invest Heavily in Pre-Construction Planning</h2><p>The most expensive mistakes happen before the first shovel hits the dirt. Comprehensive pre-construction planning—including soil testing, detailed land surveys, and clash detection using BIM (Building Information Modeling)—ensures that potential structural or logistical issues are resolved in the digital realm where they cost nothing to fix.</p><h2>2. Prioritize Open Communication</h2><p>A siloed site is a dangerous and inefficient site. Establish clear daily communication protocols between architects, structural engineers, project managers, and on-site foremen. Cloud-based project management tools ensure everyone is working from the latest revision of the drawings, preventing costly rework.</p><h2>3. Never Compromise on Safety Protocols</h2><p>Safety is not a checkbox; it is a culture. Daily safety briefings, continuous proper use of PPE, and zero-tolerance policies for shortcuts save lives and prevent devastating project delays. An OSHA-compliant site is inherently more productive.</p><h2>4. Rigid Quality Control at the Material Level</h2><p>The integrity of your building is only as good as the materials used. Implement strict QA/QC checks upon material delivery. Testing concrete slump, verifying steel mill certificates, and checking moisture content in framing timber prevents long-term structural failures.</p><h2>Conclusion</h2><p>Following these foundational rules ensures that projects are delivered on time, within budget, and to the highest standards of quality. Excellence is not an accident; it is the result of applying these tips consistently.</p>"
    },
    {
        title: "Mastering Cost Estimation for Construction Projects",
        subtitle: "A strategic guide to budgeting, predicting hidden costs, and keeping your project financially viable.",
        date: "2024-10-02",
        author: "InfraNest Editorial",
        category: "Cost Estimation",
        image: "images/project-techpark.png",
        content: "<h2>The Art and Science of Cost Estimation</h2><p>Accurate cost estimation is the lifeblood of any successful construction project. A budget that is too tight leads to compromised quality and disputes, while an inflated budget makes bids uncompetitive. Mastering cost estimation requires a blend of historical data analysis, market foresight, and meticulous attention to detail.</p><h2>Understanding Direct vs. Indirect Costs</h2><p>Direct costs—such as raw materials, heavy equipment rentals, and direct craft labor—are easy to quantify. However, projects often bleed money through poorly estimated indirect costs. Site security, temporary utilities, project management software, permits, and waste disposal must be explicitly itemized rather than grouped into a vague 'overhead' percentage.</p><h2>Factoring in Market Volatility</h2><p>The prices of steel, lumber, and copper are subject to sudden global market fluctuations. Modern estimation must include escalation clauses for volatile materials. Locking in prices early with suppliers or purchasing hedging contracts can protect the project's profit margins from sudden macroeconomic shocks.</p><h2>The 10% Contingency Golden Rule</h2><p>Unforeseen site conditions—like discovering bedrock where soil was expected, or encountering severe weather delays—are guaranteed to happen. A healthy contingency fund of 10% to 15% should be built into the estimate from day one to absorb these shocks without derailing the project.</p><h2>Leveraging Estimation Software</h2><p>Relying on spreadsheets is no longer sufficient. Advanced estimating software linked directly to BIM models allows for automated quantity take-offs. When a design changes, the cost estimate updates in real-time, completely eliminating manual calculation errors and ensuring financial transparency.</p>"
    },
    {
        title: '5 Key Trends Shaping Modern Residential Construction',
        subtitle: 'An in-depth exploration of the innovations redefining how we build and live.',
        date: '2025-03-15',
        author: 'InfraNest Editorial',
        category: 'Residential',
        image: 'images/project-residential.png',
        content: `<h2>The Future of Residential Construction</h2><p>The residential construction industry is undergoing a dramatic transformation. Driven by technological innovation, environmental consciousness, and shifting homeowner expectations, the way we design and build homes in 2025 looks fundamentally different from even a decade ago. At InfraNest, we've been at the forefront of adopting these changes, integrating them seamlessly into every project we deliver.</p><h2>1. Sustainable &amp; Recycled Materials</h2><p>Perhaps the most significant shift in residential construction is the move toward sustainable building materials. Cross-laminated timber (CLT), recycled steel, and hempcrete are no longer niche alternatives — they are becoming mainstream choices for builders who understand the long-term environmental and economic benefits. These materials reduce carbon footprints, improve insulation, and often outperform traditional options in longevity and resilience.</p>`
    }
];

const projects = [
    {
        title: 'Grandview Luxury Villa',
        subtitle: 'Luxury living redefined with seamless indoor-outdoor spaces and sustainable elegance.',
        image: 'images/project-villa.png',
        location: 'Anna Nagar, Chennai',
        year: '2024',
        area: '5,200 sq. ft.',
        architect: 'Ar. S. Venkatesh',
        category: 'Residential',
        description1: 'The Grandview Luxury Villa stands as a testament to refined residential architecture. Spread across 5,200 sq. ft., this premium 4BHK residence features a dramatic double-height living room with floor-to-ceiling glass panels that flood the space with natural light and seamlessly connect the interiors with a landscaped courtyard garden.',
        description2: 'The gourmet kitchen boasts imported German cabinetry and Carrara marble countertops, while the master suite offers a private balcony overlooking the pool. Every element — from the Italian marble flooring to the integrated smart home automation — was curated to deliver an unmatched lifestyle of comfort and sophistication.',
        beforeImage: 'images/project-before.png',
        afterImage: 'images/project-villa.png'
    },
    {
        title: 'Skyline Tech Park',
        subtitle: 'A cutting-edge commercial complex designed for the enterprises of tomorrow.',
        image: 'images/project-techpark.png',
        location: 'Whitefield, Bangalore',
        year: '2023',
        area: '185,000 sq. ft.',
        architect: 'Ar. M. Raghavan',
        category: 'Commercial',
        description1: 'Skyline Tech Park redefines the modern workspace with its 8-floor glass and steel structure in Bangalore\'s tech corridor. The building features 22,000 sq. ft. open floor plates designed for agile workspaces.',
        description2: 'Earning LEED Gold certification, the park integrates a rooftop solar array generating 30% of its energy.',
        beforeImage: 'images/project-before.png',
        afterImage: 'images/project-techpark.png'
    },
    {
        title: 'Metro Steel Plant',
        subtitle: 'Engineered for high-capacity operations, extreme durability, and zero-compromise safety.',
        image: 'images/project-steelplant.png',
        location: 'Ranga Reddy, Hyderabad',
        year: '2023',
        area: '150,000 sq. ft.',
        architect: 'Ar. D. Krishnamurthy',
        category: 'Industrial',
        description1: 'The Metro Steel Plant is a heavy-duty industrial facility engineered for 24/7 steel manufacturing operations.',
        description2: 'The facility is equipped with an advanced heat dissipation system rated for furnace temperatures exceeding 1,200°C.',
        beforeImage: 'images/project-before.png',
        afterImage: 'images/project-steelplant.png'
    }
];

const services = [
    {
        name: 'General Construction',
        description: 'End-to-end building and structural development from groundbreaking to final handover with uncompromising quality standards.',
        process: 'Site planning, foundation, framing, structural completion.',
        benefits: 'Durable, long-lasting, code-compliant structures.',
        icon: 'fas fa-hard-hat'
    },
    {
        name: 'Architecture Planning',
        description: 'Innovative and sustainable architectural designs tailored to maximize aesthetics, functionality, and space utilization.',
        process: 'Concept design, drafting, 3D modeling, blueprints.',
        benefits: 'Aesthetically pleasing, functional and modern spaces.',
        icon: 'fas fa-drafting-compass'
    },
    {
        name: 'Interior Design',
        description: 'Premium interior spaces crafting exceptional visual experiences while ensuring unparalleled daily comfort and utility.',
        process: 'Theme selection, material sourcing, execution, finishing.',
        benefits: 'Cohesive, visually stunning interior environments.',
        icon: 'fas fa-couch'
    }
];

async function seed() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        console.log('Connected to database.');

        const alterQueries = [
            "ALTER TABLE blogs ADD COLUMN subtitle TEXT, ADD COLUMN category VARCHAR(100), ADD COLUMN image_url VARCHAR(255);",
            "ALTER TABLE projects ADD COLUMN subtitle TEXT, ADD COLUMN description1 TEXT, ADD COLUMN description2 TEXT, ADD COLUMN year VARCHAR(50), ADD COLUMN area VARCHAR(100), ADD COLUMN architect VARCHAR(255), ADD COLUMN image_url VARCHAR(255), ADD COLUMN before_image VARCHAR(255), ADD COLUMN after_image VARCHAR(255);",
            "ALTER TABLE services ADD COLUMN icon VARCHAR(100);"
        ];

        for (const query of alterQueries) {
            try {
                await connection.query(query);
            } catch (err) {
                if (err.code !== 'ER_DUP_FIELDNAME') {
                    throw err;
                }
            }
        }

        // INSERT BLOGS
        for (let b of blogs) {
            await connection.execute(
                "INSERT INTO blogs (title, subtitle, content, author, date, category, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)",
                [b.title, b.subtitle, b.content, b.author, b.date, b.category, b.image]
            );
        }
        
        // INSERT PROJECTS
        for (let p of projects) {
            await connection.execute(
                "INSERT INTO projects (title, subtitle, description, category, location, year, area, architect, description1, description2, image_url, before_image, after_image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                [p.title, p.subtitle, p.description1, p.category, p.location, p.year, p.area, p.architect, p.description1, p.description2, p.image, p.beforeImage, p.afterImage]
            );
        }

        // INSERT SERVICES
        for (let s of services) {
            await connection.execute(
                "INSERT INTO services (name, description, process, benefits, icon) VALUES (?, ?, ?, ?, ?)",
                [s.name, s.description, s.process, s.benefits, s.icon]
            );
        }

        console.log('Seed completed successfully!');
        await connection.end();
    } catch(err) {
        console.error('Seed error:', err);
    }
}

seed();

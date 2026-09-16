-- Generated from lib/* default fixtures. Re-run scripts/generate-seed.mjs after changing them.
-- Relative timestamps use now() so nightly resets stay fresh.

insert into public.users (id, email, full_name, avatar, role, email_verified, password) values
  ('1', 'prj-anip7v@qatech.email', 'Sarah Chen', '', 'admin', false, 'testingpassword'),
  ('2', 'james.morrison@example.com', 'James Morrison', '', 'admin', false, 'testingpassword'),
  ('3', 'elena.vasquez@example.com', 'Elena Vasquez', '', 'member', false, 'testingpassword');

insert into public.organizations (id, name, industry, location, employees, logo, website_url, description, deal_stage, annual_revenue, owner, last_contacted) values
  ('1', 'Spotify', 'Music', 'Stockholm', 9000, '/logos/spotify_400x400.jpg', 'https://spotify.com', 'Spotify is a leading global audio streaming platform that offers a vast library of music, podcasts, and other audio content. Founded in 2006 in Sweden by Daniel Ek and Martin Lorentzon, Spotify allows users to stream millions of tracks on-demand, create personalized playlists, and discover new content through curated recommendations and algorithms.', 'Customer', '$14.4B', 'Sarah Johnson', '2026-02-20'),
  ('2', 'Wolt', 'Food', 'Helsinki', 5000, '/logos/wolt_400x400.jpg', 'https://wolt.com', 'Wolt is a Finnish technology company specializing in food delivery and logistics services. Founded in 2014 by Miki Kuusi and a team of co-founders, Wolt connects users with local restaurants, grocery stores, and other retailers through its user-friendly app and platform.', 'Customer', '$1.2B', 'Michael Chen', '2026-02-15'),
  ('3', 'QA.tech', 'Software testing', 'Stockholm', 15, '/logos/qatech_400x400.jpg', 'https://qa.tech', 'QA.tech is an AI-driven platform that automates end-to-end (E2E) testing for web applications, particularly benefiting B2B SaaS companies. Its AI agent, Jarvis, scans web apps to learn their structure, generates tests based on user interactions, and continuously adapts to changes.', 'Lead', null, 'Emma Wilson', '2026-02-22'),
  ('4', 'Vercel', 'Web Development', 'San Francisco', 400, '/logos/vercel.svg', 'https://vercel.com', 'Vercel is a cloud platform for static sites and Serverless Functions that fits perfectly with your workflow. It enables developers to host Jamstack websites and web services that deploy instantly, scale automatically, and requires no supervision.', 'Qualified', '$100M', 'David Martinez', '2026-02-18'),
  ('5', 'Netlify', 'Web Development', 'San Francisco', 300, '/logos/netlify_400x400.png', 'https://www.netlify.com', 'Netlify is a web development platform that multiplies productivity. By unifying the elements of the modern decoupled web, from local development to advanced edge logic, Netlify enables a 10x faster path to much more performant, secure, and scalable websites and apps.', 'Lead', null, 'Sarah Johnson', '2026-02-10'),
  ('6', 'Peakon', 'HR Technology', 'Copenhagen', 250, '/logos/peakon_400x400.jpg', 'https://peakon.com', 'Peakon, now part of Workday, is an employee success platform that converts feedback into insights you can put to work. By making it simple to collect, analyze and act on employee feedback, Peakon improves employee engagement, develops quality leaders, and reduces employee turnover.', 'Customer', '$50M', 'Michael Chen', '2026-01-28'),
  ('7', 'Small Giant Games', 'Gaming', 'Helsinki', 100, '/logos/small_giant_games_400x400.png', 'https://smallgiantgames.com', 'Small Giant Games is a mobile game developer based in Helsinki, Finland. Founded in 2013, the company is known for creating Empires & Puzzles, a popular match-3 RPG game.', 'Customer', '$200M', 'Emma Wilson', '2026-02-05'),
  ('8', 'Klarna', 'Fintech', 'Stockholm', 7000, '/logos/klarna_400x400.jpg', 'https://klarna.com', 'Klarna is a leading global retail bank, payments, and shopping service. Founded in 2005 in Stockholm, Sweden, Klarna simplifies the shopping experience for consumers and merchants by offering various payment solutions and financial services.', 'Customer', '$2.5B', 'David Martinez', '2026-02-24'),
  ('9', 'Oneflow', 'Contract Management', 'Stockholm', 200, '/logos/oneflow_400x400.jpg', 'https://oneflow.com', 'Oneflow is a contract automation platform that helps businesses create, sign, and manage contracts digitally. The platform streamlines the entire contract process from drafting to signing and storing.', 'Qualified', '$15M', 'Sarah Johnson', '2026-02-19'),
  ('10', 'lovable.dev', 'Developer Tools', 'Stockholm', 45, '/logos/lovable_600x600.png', 'https://lovable.dev', 'lovable.dev is your superhuman full stack engineer, helping developers turn ideas into fully functional applications in seconds using AI. The platform streamlines the development process by automating routine tasks and providing intelligent coding assistance.', 'Lead', null, 'Emma Wilson', '2026-02-21'),
  ('11', 'Steep', 'Analytics', 'Stockholm', 20, '/logos/steep_400x400.jpg', 'https://steep.app', 'Steep is a modern analytics platform powered by metrics that changes how companies use data together. It provides powerful insights and visualization tools to help businesses make data-driven decisions more effectively.', 'Lead', null, 'Michael Chen', '2026-02-12'),
  ('12', 'Anthropic', 'Artificial Intelligence', 'San Francisco', 500, '/logos/anthropic_400x400.jpg', 'https://anthropic.com', 'Anthropic is an artificial intelligence research company focused on developing safe and ethical AI systems. Known for creating Claude, their AI assistant, they work on advancing AI technology while prioritizing safety and beneficial outcomes for humanity.', 'Proposal', '$850M', 'David Martinez', '2026-02-23'),
  ('13', 'Depict.ai', 'E-commerce AI', 'Stockholm', 50, '/logos/depict_200x200.png', 'https://depict.ai', 'depict.ai provides AI-powered product recommendations for e-commerce websites. Their technology helps online retailers increase sales by showing relevant products to shoppers through advanced machine learning algorithms.', 'Lead', null, 'Sarah Johnson', '2026-01-30'),
  ('14', 'Sana Labs', 'EdTech', 'Stockholm', 150, '/logos/sana_400x400.jpg', 'https://sanalabs.com', 'Sana Labs is a global leader in AI-powered learning platforms. They develop personalized learning experiences that adapt to each individual''s needs, helping organizations and individuals learn more effectively.', 'Customer', '$30M', 'Emma Wilson', '2026-02-14'),
  ('15', 'Figma', 'Design Tools', 'San Francisco', 800, '/logos/figma_400x400.jpg', 'https://figma.com', 'Figma is a collaborative interface design tool that operates in the browser. It allows teams to work together in real-time on design projects, making the design process more efficient and collaborative.', 'Customer', '$600M', 'Michael Chen', '2026-02-25'),
  ('16', 'Hugging Face', 'Artificial Intelligence', 'New York', 450, '/logos/huggingface_400x400.jpg', 'https://huggingface.co', 'Hugging Face is the leading platform for machine learning, providing tools and resources for building, training, and deploying ML models. They''re known for their transformers library and commitment to open-source AI development.', 'Qualified', null, 'David Martinez', '2026-02-17'),
  ('17', 'Jasper', 'Artificial Intelligence', 'Austin', 400, '/logos/jasper_400x400.jpg', 'https://jasper.ai', 'Jasper is an AI content platform that helps individuals and teams create high-quality content faster. Using advanced language models, Jasper assists with writing blog posts, social media content, marketing copy, and more.', 'Closed Lost', null, 'Sarah Johnson', '2026-01-15'),
  ('18', 'Overstory', 'Artificial Intelligence', 'Amsterdam, Netherlands', 50, '/logos/overstory_400x400.png', 'https://overstory.ai', 'Overstory uses AI to monitor vegetation and prevent power outages by analyzing satellite imagery, helping utility companies save millions.', 'Lead', null, 'Emma Wilson', '2026-02-08'),
  ('19', 'Cradle', 'Biotechnology', 'Amsterdam, Netherlands', 30, '/logos/cradlebio_200x200.jpeg', 'https://cradle.bio', 'Cradle provides an AI platform that aids in protein design for bioplastics, enabling sustainable material development.', 'Lead', null, 'Michael Chen', '2026-02-03'),
  ('20', 'Atlar', 'Financial Technology', 'Stockholm, Sweden', 25, '/logos/atlar.svg', 'https://atlar.com', 'Atlar offers a platform for automating bank-to-bank payments, streamlining financial operations for businesses.', 'New', null, 'David Martinez', '2026-02-01'),
  ('21', 'Legora', 'Legal Technology', 'Stockholm, Sweden', 15, '/logos/legora_200x200.jpg', 'https://legora.com/', 'Legora leverages AI to assist lawyers by automating document analysis and legal research, enhancing efficiency in legal practices.', 'Qualified', null, 'Sarah Johnson', '2026-02-20'),
  ('22', 'Anyfin', 'Fintech', 'Stockholm, Sweden', 80, '/logos/anyfin_400x400.jpg', 'https://anyfin.com', 'Anyfin helps consumers refinance their existing loans and credit card debt at better rates, making financial services more transparent and accessible.', 'Customer', '$25M', 'Michael Chen', '2026-02-11'),
  ('23', 'Cursor', 'Developer Tools', 'San Francisco', 15, '/logos/anysphere_400x400.jpg', 'https://cursor.sh', 'Cursor is an AI-powered code editor built for pair-programming with AI. It helps developers write code faster and more efficiently through intelligent suggestions and automation.', 'Negotiation', null, 'Emma Wilson', '2026-02-24'),
  ('24', 'Perplexity', 'Artificial Intelligence', 'San Francisco', 40, '/logos/perplexity_400x400.jpg', 'https://perplexity.ai', 'Perplexity is an AI-powered search engine that provides accurate, real-time answers with citations. It combines the power of large language models with up-to-date information from the web.', 'Proposal', null, 'David Martinez', '2026-02-22'),
  ('25', 'Listen Labs', 'Customer Research', 'San Francisco', 40, '/logos/listen_labs.png', 'https://listen.ai', 'Listen Labs is an AI-powered customer research platform that automates voice-based customer interviews, enabling businesses to gain actionable insights rapidly. Founded in 2023, the platform handles the entire research process from interview design to analyzing responses.', 'Lead', null, 'Sarah Johnson', '2026-02-16');

insert into public.collections (id, name, description, tags) values
  ('1', 'Artificial Intelligence Companies', 'A collection of companies working on AI technologies', '{}'),
  ('2', 'Stockholm Startups', 'Promising startups based in Stockholm', '{}'),
  ('3', 'Developer Tools', 'Companies offering developer tools and AI assistance', '{}');

insert into public.collection_organizations (collection_id, organization_id) values
  ('1', '3'),
  ('1', '12'),
  ('1', '13'),
  ('1', '16'),
  ('1', '17'),
  ('1', '18'),
  ('1', '24'),
  ('1', '25'),
  ('2', '3'),
  ('2', '9'),
  ('2', '10'),
  ('2', '11'),
  ('2', '20'),
  ('2', '21'),
  ('2', '22'),
  ('3', '3'),
  ('3', '10'),
  ('3', '15'),
  ('3', '23');

insert into public.people (id, name, email, role, organization, phone, linkedin, notes, avatar, status, last_contact) values
  ('1', 'Daniel Ek', 'daniel@spotify.com', 'CEO', 'Spotify', '+46 70 123 4567', 'https://linkedin.com/in/danielek', 'Founder and CEO of Spotify. Very interested in AI and podcasting.', null, 'Active', '2026-02-20'),
  ('2', 'Sarah Chen', 'sarah.chen@figma.com', 'VP of Product', 'Figma', '+1 415 555 0123', 'https://linkedin.com/in/sarahchen', 'Leading product development for enterprise features.', null, 'Active', '2026-02-18'),
  ('3', 'Marcus Johansson', 'marcus@klarna.com', 'CTO', 'Klarna', '+46 70 987 6543', 'https://linkedin.com/in/marcusj', 'Technical lead, focused on payment infrastructure.', null, 'Active', '2026-02-22'),
  ('4', 'Emily Rodriguez', 'emily@anyfin.com', 'CFO', 'Anyfin', '+46 73 456 7890', 'https://linkedin.com/in/emilyrodriguez', 'Financial strategy and fundraising lead.', null, 'Active', '2026-02-15'),
  ('5', 'James Wilson', 'james@vercel.com', 'Head of Sales', 'Vercel', '+1 555 234 5678', 'https://linkedin.com/in/jameswilson', 'Managing enterprise sales and partnerships.', null, 'Active', '2026-02-24'),
  ('6', 'Miki Kuusi', 'miki@wolt.com', 'CEO', 'Wolt', '+358 40 123 4567', 'https://linkedin.com/in/mikiikuusi', 'Co-founder of Wolt. Focused on expanding delivery logistics.', null, 'Active', '2026-02-12'),
  ('7', 'Sebastian Siemiatkowski', 'sebastian@klarna.com', 'CEO', 'Klarna', '+46 70 111 2233', 'https://linkedin.com/in/sebastians', 'Co-founder of Klarna. Driving AI-first strategy.', null, 'Active', '2026-02-25'),
  ('8', 'Dario Amodei', 'dario@anthropic.com', 'CEO', 'Anthropic', '+1 415 555 8899', 'https://linkedin.com/in/darioamodei', 'CEO and co-founder. Key decision maker for enterprise partnerships.', null, 'Active', '2026-02-23'),
  ('9', 'Guillermo Rauch', 'guillermo@vercel.com', 'CEO', 'Vercel', '+1 415 555 3344', 'https://linkedin.com/in/guillermorauch', 'Founder of Vercel and Next.js. Champions developer experience.', null, 'Active', '2026-02-19'),
  ('10', 'Anton Osika', 'anton@lovable.dev', 'CEO', 'lovable.dev', '+46 70 555 1234', 'https://linkedin.com/in/antonosika', 'Building AI-powered full-stack development tools.', null, 'Active', '2026-02-21'),
  ('11', 'Aravind Srinivas', 'aravind@perplexity.ai', 'CEO', 'Perplexity', '+1 415 555 7766', 'https://linkedin.com/in/aravindsrinivas', 'Leading AI search innovation. Interested in enterprise search solutions.', null, 'Active', '2026-02-22'),
  ('12', 'Michael Truell', 'michael@cursor.sh', 'CEO', 'Cursor', '+1 415 555 4455', 'https://linkedin.com/in/michaeltruell', 'Building AI-native code editor. Very technical buyer.', null, 'Active', '2026-02-24'),
  ('13', 'Joel Hellermark', 'joel@sanalabs.com', 'CEO', 'Sana Labs', '+46 70 333 4455', 'https://linkedin.com/in/joelhellermark', 'Passionate about AI in education. Enterprise learning platform.', null, 'Active', '2026-02-14'),
  ('14', 'Anders Johansson', 'anders@oneflow.com', 'Head of Partnerships', 'Oneflow', '+46 70 222 3344', 'https://linkedin.com/in/andersjohansson', 'Exploring integration opportunities. Reports to CEO.', null, 'Active', '2026-02-17'),
  ('15', 'Lisa Berglund', 'lisa@peakon.com', 'VP of Customer Success', 'Peakon', '+45 33 555 6677', 'https://linkedin.com/in/lisaberglund', 'Manages key enterprise accounts. Renewal champion.', null, 'Active', '2026-01-28'),
  ('16', 'Thomas Mueller', 'thomas@huggingface.co', 'Head of Enterprise', 'Hugging Face', '+1 212 555 8899', 'https://linkedin.com/in/thomasmueller', 'Driving enterprise ML platform adoption. Technical evaluator.', null, 'Active', '2026-02-16'),
  ('17', 'Jasper AI Team', 'partnerships@jasper.ai', 'Partnerships', 'Jasper', null, null, 'Account went cold after they chose a competitor. May revisit in Q3.', null, 'Inactive', '2026-01-10'),
  ('18', 'Erik Lund', 'erik@steep.app', 'Co-founder', 'Steep', '+46 70 444 5566', 'https://linkedin.com/in/eriklund', 'Data analytics startup. Evaluating our analytics module.', null, 'Active', '2026-02-11');

insert into public.deals (id, title, organization_id, value, currency, stage, expected_close_date, owner, probability, next_step, tags, contact_ids, last_activity_date, last_activity_type, created_at) values
  ('d1', 'Enterprise License', '3', 24000, 'USD', 'Lead', '2026-04-15', 'Emma Wilson', 20, 'Scoping call with CTO next Tuesday', ARRAY['Pre POC', 'Enterprise'], ARRAY['3', '7'], now() - interval '2 days', 'email', now() - interval '14 days'),
  ('d2', 'Platform Integration', '4', 120000, 'USD', 'Qualified', '2026-05-01', 'David Martinez', 40, 'Technical architecture review with engineering team', ARRAY['Technical Eval', 'Enterprise'], ARRAY['5', '9'], now() - interval '1 days', 'meeting', now() - interval '21 days'),
  ('d3', 'Team Plan Upgrade', '5', 36000, 'USD', 'Lead', '2026-04-30', 'Sarah Johnson', 15, 'Send pricing comparison document', ARRAY['Expansion'], ARRAY['6'], now() - interval '3 days', 'email', now() - interval '10 days'),
  ('d4', 'Contract Automation Suite', '9', 85000, 'USD', 'Qualified', '2026-05-15', 'Sarah Johnson', 45, 'Demo for legal operations team on Thursday', ARRAY['POC', 'Champion Identified'], ARRAY['14'], now() - interval '1 days', 'call', now() - interval '18 days'),
  ('d5', 'Startup Plan', '10', 18000, 'USD', 'Lead', '2026-06-01', 'Emma Wilson', 25, 'Follow up on trial activation', ARRAY['Startup', 'Pre POC'], ARRAY['10'], now() - interval '4 days', 'email', now() - interval '7 days'),
  ('d6', 'Analytics Platform License', '11', 42000, 'USD', 'Lead', '2026-05-20', 'Michael Chen', 20, 'Schedule product walkthrough with VP Eng', ARRAY['Pre POC', 'Technical Eval'], ARRAY['11'], now() - interval '5 days', 'note', now() - interval '12 days'),
  ('d7', 'AI Research Partnership', '12', 500000, 'USD', 'Proposal', '2026-04-01', 'David Martinez', 60, 'Finalize SOW and send for legal review', ARRAY['Enterprise', 'Champion Identified', 'POC Complete'], ARRAY['8', '12'], now() - interval '12 hours', 'meeting', now() - interval '30 days'),
  ('d8', 'E-commerce Integration', '13', 55000, 'USD', 'Lead', '2026-06-15', 'Sarah Johnson', 15, 'Intro call with head of engineering', ARRAY['Pre POC'], ARRAY['13'], now() - interval '2 days', 'email', now() - interval '5 days'),
  ('d9', 'ML Platform License', '16', 200000, 'USD', 'Qualified', '2026-05-10', 'David Martinez', 35, 'POC environment setup and data migration plan', ARRAY['POC', 'Enterprise', 'Technical Eval'], ARRAY['16'], now() - interval '3 days', 'meeting', now() - interval '15 days'),
  ('d10', 'Satellite Monitoring Add-on', '18', 30000, 'USD', 'Lead', '2026-07-01', 'Emma Wilson', 10, 'Send case study from similar deployment', ARRAY['Startup'], ARRAY['18'], now() - interval '6 days', 'email', now() - interval '8 days'),
  ('d11', 'Biotech Research License', '19', 45000, 'USD', 'Lead', '2026-06-20', 'Michael Chen', 15, 'Prepare compliance documentation for review', ARRAY['Pre POC', 'Technical Eval'], ARRAY['15'], now() - interval '7 days', 'note', now() - interval '9 days'),
  ('d12', 'Payment Platform Pilot', '20', 15000, 'USD', 'New', '2026-07-15', 'David Martinez', 5, 'Initial discovery call scheduled for next Monday', ARRAY['Startup', 'Pre POC'], ARRAY['4'], now() - interval '1 days', 'task', now() - interval '3 days'),
  ('d13', 'Legal AI Integration', '21', 60000, 'USD', 'Qualified', '2026-05-25', 'Sarah Johnson', 40, 'Security questionnaire and SOC 2 review', ARRAY['POC', 'Champion Identified'], ARRAY['14', '2'], now() - interval '2 days', 'call', now() - interval '20 days'),
  ('d14', 'Developer Tools Bundle', '23', 150000, 'USD', 'Negotiation', '2026-03-15', 'Emma Wilson', 75, 'Final contract redlines from their legal team', ARRAY['Enterprise', 'POC Complete', 'Champion Identified'], ARRAY['12', '8'], now() - interval '6 hours', 'meeting', now() - interval '45 days'),
  ('d15', 'Search Infrastructure Deal', '24', 250000, 'USD', 'Proposal', '2026-04-20', 'David Martinez', 55, 'Present revised pricing to procurement', ARRAY['Enterprise', 'POC Complete'], ARRAY['11', '1'], now() - interval '1 days', 'email', now() - interval '25 days'),
  ('d16', 'Research Platform License', '25', 35000, 'USD', 'Lead', '2026-06-10', 'Sarah Johnson', 20, 'Share API documentation and sandbox access', ARRAY['Pre POC', 'Startup'], ARRAY['13', '18'], now() - interval '4 days', 'email', now() - interval '6 days'),
  ('d17', 'Vercel Edge Network Expansion', '4', 75000, 'USD', 'Lead', '2026-07-01', 'Emma Wilson', 15, 'Benchmark current vs proposed infrastructure costs', ARRAY['Expansion', 'Renewal'], ARRAY['5', '9'], now() - interval '1 days', 'call', now() - interval '2 days');

insert into public.tasks (id, title, description, status, priority, due_date, assignee, related_deal_id, related_organization_id, related_person_id, created_at) values
  ('t1', 'Send proposal to Anthropic', 'Prepare and send the enterprise partnership proposal to the Anthropic team. Include pricing tiers and integration timeline.', 'todo', 'high', (now() + interval '1 days')::date, 'David Martinez', 'd7', '12', null, now() - interval '3 days'),
  ('t2', 'Schedule technical demo for Cursor', 'Coordinate with engineering to set up a live technical demo of the developer tools bundle for the Cursor team.', 'todo', 'medium', (now() + interval '3 days')::date, 'Emma Wilson', null, '23', null, now() - interval '2 days'),
  ('t3', 'Follow up on Klarna contract review', 'Legal has had the contract for a week. Escalate to get the review completed and address any concerns.', 'todo', 'urgent', (now() - interval '2 days')::date, 'Michael Chen', null, '8', null, now() - interval '7 days'),
  ('t4', 'Prepare Perplexity onboarding docs', 'Create onboarding documentation for the Perplexity search infrastructure deal. Include API guides and support contacts.', 'todo', 'low', (now() + interval '7 days')::date, 'Sarah Johnson', null, '24', null, now() - interval '1 days'),
  ('t5', 'Review Spotify quarterly metrics', 'Compile and review Q1 metrics for the Spotify account. Prepare summary for the account review meeting.', 'todo', 'medium', (now() + interval '5 days')::date, 'Sarah Johnson', null, '1', null, now() - interval '2 days'),
  ('t6', 'Draft Vercel partnership agreement', 'Work with legal to draft the partnership agreement for the Vercel edge network expansion deal.', 'todo', 'high', (now() + interval '2 days')::date, 'Emma Wilson', null, '4', null, now() - interval '4 days'),
  ('t7', 'Call Sana Labs for requirements', 'Discovery call to understand Sana Labs'' specific requirements for the e-commerce integration project.', 'in_progress', 'medium', (now() + interval '1 days')::date, 'David Martinez', null, '14', null, now() - interval '5 days'),
  ('t8', 'Update Figma deal pricing', 'Revise the pricing model for the Figma contract automation suite based on their feedback from last meeting.', 'todo', 'low', (now() + interval '10 days')::date, 'Michael Chen', null, '15', null, now() - interval '1 days'),
  ('t9', 'Send Wolt integration timeline', 'Deliver the integration timeline document to the Wolt team. They''ve been waiting for this since last week.', 'todo', 'medium', (now() - interval '1 days')::date, 'Emma Wilson', null, '2', null, now() - interval '6 days'),
  ('t10', 'Finalize Hugging Face SOW', 'Complete the Statement of Work for the ML Platform License deal. Needs sign-off from both sides.', 'in_progress', 'high', (now() + interval '4 days')::date, 'David Martinez', null, '16', null, now() - interval '8 days');

insert into public.notes (id, organization_id, content, author_name, created_at, updated_at) values
  ('1', '1', 'Had a great call with their team. They''re interested in expanding the partnership next quarter. Follow up with Daniel about the enterprise plan.', 'Sarah Johnson', now() - interval '3 days', now() - interval '3 days'),
  ('2', '1', 'Spotify is evaluating competitive offerings. Need to prepare a comparison deck before the next meeting.', 'Michael Chen', now() - interval '7 days', now() - interval '7 days'),
  ('3', '8', 'Klarna wants to integrate our analytics module. Setting up a technical deep-dive for next week.', 'David Martinez', now() - interval '1 days', now() - interval '1 days'),
  ('4', '12', 'Anthropic proposal sent. They need approval from their procurement team. Expected timeline: 2 weeks.', 'David Martinez', now() - interval '2 days', now() - interval '2 days'),
  ('5', '4', 'Vercel is very aligned with our product roadmap. Key decision maker is Guillermo. Need to schedule a demo of the new features.', 'Emma Wilson', now() - interval '5 days', now() - interval '5 days'),
  ('6', '12', 'Strategy discussion: Anthropic wants to explore a multi-year enterprise agreement. Key decision maker is Dario - need to schedule exec dinner.', 'David Martinez', now() - interval '4 days', now() - interval '4 days'),
  ('7', '23', 'Cursor technical requirements: They need SSO integration and custom API endpoints. Michael Truell is very hands-on with technical evaluation.', 'Emma Wilson', now() - interval '6 days', now() - interval '6 days'),
  ('8', '1', 'Spotify Q4 review: Positive feedback on analytics module. Daniel mentioned expanding to 3 more teams next quarter.', 'Sarah Johnson', now() - interval '8 days', now() - interval '8 days'),
  ('9', '8', 'Klarna competitive analysis: They''re also evaluating Salesforce. Our advantage is faster implementation and better UX. Need to emphasize this in next call.', 'Michael Chen', now() - interval '9 days', now() - interval '9 days'),
  ('10', '4', 'Vercel partnership sync: Guillermo is interested in co-marketing. Could be a great channel partner.', 'Emma Wilson', now() - interval '10 days', now() - interval '10 days'),
  ('11', '24', 'Perplexity demo prep: Focus on search analytics and real-time dashboards. Aravind specifically asked about API performance benchmarks.', 'David Martinez', now() - interval '11 days', now() - interval '11 days'),
  ('12', '14', 'Sana Labs requirements gathering: Joel wants AI-powered learning analytics. This could be a great case study if we land it.', 'Sarah Johnson', now() - interval '12 days', now() - interval '12 days');

insert into public.emails (id, to_email, to_name, subject, body, status, type, sent_at, related_person_id, related_organization_id) values
  ('em1', 'prj-anip7v@qatech.email', null, 'Verify your email - ACME Signal', 'Please click the link below to verify your email address and complete your registration.', 'sent', 'verification', now() - interval '2 hours', null, null),
  ('em2', 'james.morrison@example.com', 'James Morrison', 'Welcome to ACME Signal!', E'Hi James,\n\nWelcome to ACME Signal! We''re excited to have you on board. Here''s a quick guide to get you started...', 'delivered', 'welcome', now() - interval '5 hours', null, null),
  ('em3', 'daniel@spotify.com', 'Daniel Ek', 'Re: Partnership Discussion', E'Hi Daniel,\n\nThank you for taking the time to discuss a potential partnership. I wanted to follow up on the key points we covered...', 'delivered', 'outreach', now() - interval '1 days', '1', '1'),
  ('em4', 'michael@cursor.sh', 'Michael Truell', 'Technical Requirements Follow-up', E'Hi Michael,\n\nFollowing our conversation about the technical requirements, I''ve put together a document outlining the integration specs...', 'delivered', 'follow_up', now() - interval '2 days', '12', '23'),
  ('em5', 'dario@anthropic.com', 'Dario Amodei', 'Proposal: Enterprise License', E'Hi Dario,\n\nAs discussed, I''m sending over our enterprise license proposal for Anthropic. The package includes...', 'sent', 'outreach', now() - interval '3 days', '8', '12'),
  ('em6', 'aravind@perplexity.ai', 'Aravind Srinivas', 'Demo Recording & Next Steps', E'Hi Aravind,\n\nThank you for joining the demo today! As promised, here''s the recording link and a summary of next steps...', 'delivered', 'follow_up', now() - interval '4 days', '11', '24'),
  ('em7', 'marcus@klarna.com', 'Marcus Johansson', 'Klarna Integration Timeline', E'Hi Marcus,\n\nI wanted to share the proposed integration timeline for the Klarna project. We''re targeting the following milestones...', 'delivered', 'outreach', now() - interval '5 days', '3', '8'),
  ('em8', 'sebastian@klarna.com', 'Sebastian Siemiatkowski', 'Quarterly Review Agenda', E'Hi Sebastian,\n\nHere''s the proposed agenda for our upcoming quarterly review meeting...', 'sent', 'outreach', now() - interval '6 days', '7', '8'),
  ('em9', 'joel@sanalabs.com', 'Joel Hellermark', 'Sana Labs - Requirements Doc', E'Hi Joel,\n\nPlease find attached the requirements document for the Sana Labs integration project...', 'failed', 'outreach', now() - interval '7 days', '13', '13'),
  ('em10', 'guillermo@vercel.com', 'Guillermo Rauch', 'Vercel Co-marketing Proposal', E'Hi Guillermo,\n\nI''d love to explore a co-marketing opportunity between ACME Signal and Vercel. Here''s what we have in mind...', 'delivered', 'outreach', now() - interval '10 days', '9', '4');

insert into public.activities (id, type, title, description, timestamp, user_id, user_name, related_entity_id, related_entity_type, read) values
  ('16', 'email_sent', 'Email Sent', 'Proposal sent to Anthropic team', now() - interval '30 minutes', null, 'Emma Wilson', '12', 'organization', false),
  ('1', 'stage_changed', 'Deal Stage Updated', 'Cursor deal moved to Negotiation', now() - interval '1 hours', null, 'Emma Wilson', '23', 'organization', false),
  ('2', 'note_added', 'Note Added', 'Added note on Anthropic proposal timeline', now() - interval '2 hours', null, 'David Martinez', '12', 'organization', false),
  ('17', 'deal_updated', 'Deal Updated', 'Cursor deal value updated to $180,000', now() - interval '3 hours', null, 'David Martinez', '23', 'organization', false),
  ('3', 'meeting_scheduled', 'Meeting Scheduled', 'Demo call with Perplexity scheduled for Thursday', now() - interval '4 hours', null, 'David Martinez', '24', 'organization', false),
  ('18', 'meeting_scheduled', 'Meeting Scheduled', 'Onboarding call with lovable.dev team', now() - interval '5 hours', null, 'Sarah Johnson', '25', 'organization', false),
  ('4', 'person_added', 'New Contact Added', 'Aravind Srinivas added as contact for Perplexity', now() - interval '6 hours', null, 'Sarah Johnson', '24', 'organization', true),
  ('19', 'email_sent', 'Email Sent', 'Follow-up sent to Vercel partnership team', now() - interval '8 hours', null, 'Emma Wilson', '4', 'organization', false),
  ('5', 'stage_changed', 'Deal Stage Updated', 'Anthropic deal moved to Proposal', now() - interval '12 hours', null, 'David Martinez', '12', 'organization', true),
  ('6', 'organization_added', 'New Company Added', 'Listen Labs added to the CRM', now() - interval '1 days', null, 'Sarah Johnson', '25', 'organization', true),
  ('20', 'stage_changed', 'Deal Stage Updated', 'Sana Labs deal moved to Qualified', now() - interval '1 days', null, 'Michael Chen', '15', 'organization', false),
  ('7', 'meeting_scheduled', 'Meeting Scheduled', 'Technical deep-dive with Klarna analytics team', now() - interval '36 hours', null, 'Michael Chen', '8', 'organization', true),
  ('21', 'note_added', 'Note Added', 'Competitive analysis updated for Wolt evaluation', now() - interval '36 hours', null, 'Emma Wilson', '10', 'organization', true),
  ('8', 'note_added', 'Note Added', 'Updated notes on Vercel partnership roadmap', now() - interval '2 days', null, 'Emma Wilson', '4', 'organization', true),
  ('9', 'stage_changed', 'Deal Stage Updated', 'Vercel deal moved to Qualified', now() - interval '60 hours', null, 'David Martinez', '4', 'organization', true),
  ('10', 'collection_created', 'List Created', 'New list ''Developer Tools'' created with 4 companies', now() - interval '3 days', null, 'Emma Wilson', null, null, true),
  ('22', 'person_added', 'New Contact Added', 'Lisa Berglund added as contact for Peakon', now() - interval '3 days', null, 'Sarah Johnson', '11', 'organization', true),
  ('11', 'person_added', 'New Contact Added', 'Michael Truell added as contact for Cursor', now() - interval '3 days', null, 'Emma Wilson', '23', 'organization', true),
  ('12', 'organization_added', 'New Company Added', 'Atlar added to the CRM', now() - interval '4 days', null, 'David Martinez', '20', 'organization', true),
  ('13', 'meeting_scheduled', 'Meeting Scheduled', 'Quarterly review with Spotify account team', now() - interval '5 days', null, 'Sarah Johnson', '1', 'organization', true),
  ('14', 'note_added', 'Note Added', 'Competitive analysis note added for QA.tech evaluation', now() - interval '6 days', null, 'Emma Wilson', '3', 'organization', true),
  ('15', 'stage_changed', 'Deal Stage Updated', 'Hugging Face deal moved to Qualified', now() - interval '7 days', null, 'David Martinez', '16', 'organization', true);

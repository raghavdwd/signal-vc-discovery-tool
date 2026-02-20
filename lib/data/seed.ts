import type { Company, Signal, FundingStage, Sector } from "@/types";
import { generateId } from "@/lib/utils";

// ============================================================
// 50 Realistic Mock Companies
// ============================================================

const GRADIENT_PALETTES: [string, string][] = [
    ["#6366f1", "#a855f7"], ["#3b82f6", "#06b6d4"], ["#10b981", "#34d399"],
    ["#f59e0b", "#f97316"], ["#ef4444", "#ec4899"], ["#8b5cf6", "#6366f1"],
    ["#06b6d4", "#22d3ee"], ["#14b8a6", "#10b981"], ["#f97316", "#fbbf24"],
    ["#ec4899", "#f43f5e"], ["#6366f1", "#3b82f6"], ["#a855f7", "#ec4899"],
    ["#0ea5e9", "#6366f1"], ["#84cc16", "#10b981"], ["#f43f5e", "#fb923c"],
    ["#7c3aed", "#2563eb"], ["#059669", "#0d9488"], ["#dc2626", "#9333ea"],
    ["#0284c7", "#7c3aed"], ["#65a30d", "#059669"], ["#c026d3", "#6366f1"],
    ["#0891b2", "#3b82f6"], ["#d97706", "#dc2626"], ["#4f46e5", "#7c3aed"],
    ["#16a34a", "#2dd4bf"], ["#e11d48", "#f59e0b"], ["#2563eb", "#7c3aed"],
    ["#0d9488", "#06b6d4"], ["#ca8a04", "#ea580c"], ["#9333ea", "#c026d3"],
    ["#1d4ed8", "#0ea5e9"], ["#047857", "#10b981"], ["#b91c1c", "#e11d48"],
    ["#4338ca", "#6d28d9"], ["#15803d", "#22c55e"], ["#be123c", "#f43f5e"],
    ["#1e40af", "#3b82f6"], ["#0f766e", "#14b8a6"], ["#a16207", "#f59e0b"],
    ["#7e22ce", "#a855f7"], ["#166534", "#4ade80"], ["#9f1239", "#fb7185"],
    ["#1e3a8a", "#60a5fa"], ["#134e4a", "#2dd4bf"], ["#92400e", "#fbbf24"],
    ["#581c87", "#c084fc"], ["#14532d", "#86efac"], ["#881337", "#fda4af"],
    ["#1e3a5f", "#38bdf8"], ["#064e3b", "#34d399"],
];

interface CompanyDef {
    name: string;
    website: string;
    funding_stage: FundingStage;
    raised_amount: number;
    location: string;
    description: string;
    founded_year: number;
    employee_count: number;
    tags: string[];
    sector: Sector;
}

const COMPANIES_DATA: CompanyDef[] = [
    // AI/ML (10)
    { name: "CogniSys", website: "https://cognisys.ai", funding_stage: "Series B", raised_amount: 180, location: "San Francisco, CA", description: "Building next-generation reasoning engines that push the boundaries of artificial general intelligence. Their multi-modal AI platform processes text, code, and visual data simultaneously.", founded_year: 2021, employee_count: 245, tags: ["generative-ai", "llm", "machine-learning"], sector: "AI/ML" },
    { name: "NeuralForge", website: "https://neuralforge.dev", funding_stage: "Series A", raised_amount: 45, location: "New York, NY", description: "Open-source model training infrastructure that reduces ML pipeline costs by 70%. Enables teams to fine-tune and deploy custom models in minutes, not weeks.", founded_year: 2022, employee_count: 62, tags: ["machine-learning", "developer-tools", "open-source"], sector: "AI/ML" },
    { name: "SynthMind", website: "https://synthmind.io", funding_stage: "Seed", raised_amount: 12, location: "London, UK", description: "Synthetic data generation platform for enterprise AI. Creates privacy-preserving datasets that maintain statistical fidelity for training production ML models.", founded_year: 2023, employee_count: 18, tags: ["machine-learning", "data-infrastructure", "b2b-saas"], sector: "AI/ML" },
    { name: "VisionArc", website: "https://visionarc.com", funding_stage: "Series A", raised_amount: 32, location: "Tel Aviv, Israel", description: "Real-time computer vision platform for manufacturing quality control. Detects defects with 99.7% accuracy, reducing waste by 40% across production lines.", founded_year: 2021, employee_count: 78, tags: ["computer-vision", "machine-learning", "analytics"], sector: "AI/ML" },
    { name: "PromptLayer", website: "https://promptlayer.ai", funding_stage: "Pre-Seed", raised_amount: 3.5, location: "Austin, TX", description: "LLM observability and prompt management platform. Helps engineering teams version, test, and optimize their AI prompts with production analytics.", founded_year: 2023, employee_count: 8, tags: ["llm", "developer-tools", "analytics"], sector: "AI/ML" },
    { name: "DeepReason", website: "https://deepreason.ai", funding_stage: "Series C", raised_amount: 320, location: "San Francisco, CA", description: "Enterprise AI reasoning platform that combines knowledge graphs with large language models to provide verifiable, explainable AI outputs for regulated industries.", founded_year: 2020, employee_count: 410, tags: ["llm", "nlp", "compliance"], sector: "AI/ML" },
    { name: "AutoML Labs", website: "https://automllabs.com", funding_stage: "Series B", raised_amount: 85, location: "Seattle, WA", description: "Automated machine learning platform that enables non-technical teams to build and deploy production ML models through a no-code visual interface.", founded_year: 2021, employee_count: 130, tags: ["machine-learning", "b2b-saas", "cloud-native"], sector: "AI/ML" },
    { name: "LinguaAI", website: "https://linguaai.com", funding_stage: "Seed", raised_amount: 8, location: "Berlin, Germany", description: "Multilingual NLP platform specializing in low-resource languages. Breaking language barriers in AI with support for 200+ languages and dialects.", founded_year: 2022, employee_count: 24, tags: ["nlp", "machine-learning", "open-source"], sector: "AI/ML" },
    { name: "DataWeave AI", website: "https://dataweave.ai", funding_stage: "Series A", raised_amount: 28, location: "Toronto, Canada", description: "Intelligent data pipeline orchestration using AI to automatically detect schema drift, optimize transformations, and ensure data quality at scale.", founded_year: 2022, employee_count: 55, tags: ["data-infrastructure", "machine-learning", "analytics"], sector: "AI/ML" },
    { name: "Cortex Labs", website: "https://cortexlabs.ai", funding_stage: "Series D", raised_amount: 520, location: "San Francisco, CA", description: "AI infrastructure company providing the compute layer for next-gen AI workloads. Their custom silicon and software stack delivers 5x better price-performance for inference.", founded_year: 2019, employee_count: 680, tags: ["machine-learning", "cloud-native", "api-first"], sector: "AI/ML" },

    // Fintech (8)
    { name: "FlowCapital", website: "https://flowcapital.io", funding_stage: "Series B", raised_amount: 120, location: "New York, NY", description: "Revenue-based financing platform for SaaS companies. Uses real-time analytics to provide non-dilutive funding decisions in under 24 hours.", founded_year: 2020, employee_count: 165, tags: ["lending", "b2b-saas", "analytics"], sector: "Fintech" },
    { name: "LedgerSync", website: "https://ledgersync.com", funding_stage: "Series A", raised_amount: 38, location: "London, UK", description: "Real-time financial reconciliation engine for fintechs and banks. Processes millions of transactions daily with AI-powered matching and anomaly detection.", founded_year: 2021, employee_count: 72, tags: ["banking", "api-first", "compliance"], sector: "Fintech" },
    { name: "PayGrid", website: "https://paygrid.co", funding_stage: "Seed", raised_amount: 15, location: "Singapore", description: "Cross-border payment infrastructure for Southeast Asian merchants. Connects local payment methods across 8 countries with a single API.", founded_year: 2022, employee_count: 35, tags: ["payments", "api-first", "marketplace"], sector: "Fintech" },
    { name: "VaultFi", website: "https://vaultfi.xyz", funding_stage: "Series A", raised_amount: 42, location: "Miami, FL", description: "Institutional-grade DeFi yield optimization platform. Automated strategies across multiple chains with built-in risk management and compliance controls.", founded_year: 2021, employee_count: 48, tags: ["defi", "crypto", "compliance"], sector: "Fintech" },
    { name: "Clearance", website: "https://clearance.finance", funding_stage: "Pre-Seed", raised_amount: 4, location: "Chicago, IL", description: "AI-powered accounts receivable automation for SMBs. Reduces DSO by 35% through intelligent dunning, payment predictions, and automated collections.", founded_year: 2023, employee_count: 11, tags: ["payments", "b2b-saas", "machine-learning"], sector: "Fintech" },
    { name: "NexPay", website: "https://nexpay.io", funding_stage: "Series C", raised_amount: 210, location: "San Francisco, CA", description: "Embedded finance platform enabling any software company to offer banking, lending, and payments products. Powers financial services for 200+ platforms.", founded_year: 2019, employee_count: 320, tags: ["payments", "banking", "api-first"], sector: "Fintech" },
    { name: "StakeHouse", website: "https://stakehouse.fi", funding_stage: "Seed", raised_amount: 9, location: "Denver, CO", description: "Non-custodial liquid staking protocol that maximizes ETH staking yields while maintaining full decentralization and sovereign validator operations.", founded_year: 2023, employee_count: 15, tags: ["crypto", "defi", "open-source"], sector: "Fintech" },
    { name: "FraudShield", website: "https://fraudshield.ai", funding_stage: "Series B", raised_amount: 95, location: "Boston, MA", description: "Real-time fraud detection platform using behavioral biometrics and device intelligence. Reduces false positives by 60% versus traditional rule-based systems.", founded_year: 2020, employee_count: 145, tags: ["cybersecurity", "machine-learning", "banking"], sector: "Fintech" },

    // Climate (7)
    { name: "CarbonCaptureX", website: "https://carboncapturex.com", funding_stage: "Series B", raised_amount: 150, location: "Denver, CO", description: "Direct air capture technology using novel sorbent materials. Their modular DAC units can be deployed anywhere, removing CO2 at 40% lower cost than competitors.", founded_year: 2020, employee_count: 190, tags: ["carbon-capture", "clean-energy", "sustainability"], sector: "Climate" },
    { name: "TerraVault", website: "https://terravault.earth", funding_stage: "Series A", raised_amount: 55, location: "San Francisco, CA", description: "Carbon credit verification and marketplace platform. Uses satellite imagery and ML to provide real-time monitoring and transparent carbon offset tracking.", founded_year: 2021, employee_count: 68, tags: ["carbon-capture", "marketplace", "analytics"], sector: "Climate" },
    { name: "GridFlow", website: "https://gridflow.energy", funding_stage: "Series C", raised_amount: 280, location: "Austin, TX", description: "Smart grid optimization platform using AI to balance renewable energy supply and demand. Manages distributed energy resources across 15 US states.", founded_year: 2019, employee_count: 350, tags: ["clean-energy", "machine-learning", "analytics"], sector: "Climate" },
    { name: "SolarMesh", website: "https://solarmesh.io", funding_stage: "Seed", raised_amount: 11, location: "Los Angeles, CA", description: "Community solar marketplace connecting underserved neighborhoods with local solar projects. Making clean energy accessible through innovative financing models.", founded_year: 2023, employee_count: 22, tags: ["clean-energy", "sustainability", "marketplace"], sector: "Climate" },
    { name: "BioChar Technologies", website: "https://biochar.tech", funding_stage: "Series A", raised_amount: 35, location: "Seattle, WA", description: "Converting agricultural waste into biochar for permanent carbon sequestration. Their pyrolysis process captures 3 tons of CO2 per ton of biochar produced.", founded_year: 2021, employee_count: 45, tags: ["carbon-capture", "sustainability", "clean-energy"], sector: "Climate" },
    { name: "EVPulse", website: "https://evpulse.com", funding_stage: "Series B", raised_amount: 110, location: "Berlin, Germany", description: "EV charging network optimization platform. AI-driven demand forecasting and dynamic pricing for charging station operators across Europe.", founded_year: 2020, employee_count: 175, tags: ["ev", "machine-learning", "analytics"], sector: "Climate" },
    { name: "OceanBound", website: "https://oceanbound.org", funding_stage: "Pre-Seed", raised_amount: 2.5, location: "Boston, MA", description: "Ocean plastic tracking and cleanup coordination platform using drone imagery and ML. Mapping global ocean plastic distribution in real-time.", founded_year: 2024, employee_count: 6, tags: ["sustainability", "computer-vision", "analytics"], sector: "Climate" },

    // Health (7)
    { name: "BioSynth", website: "https://biosynth.health", funding_stage: "Series C", raised_amount: 240, location: "Boston, MA", description: "AI-driven drug discovery platform specializing in rare diseases. Their molecular simulation engine has identified 12 promising drug candidates in 18 months.", founded_year: 2019, employee_count: 285, tags: ["biotech", "machine-learning", "genomics"], sector: "Health" },
    { name: "MediStream", website: "https://medistream.io", funding_stage: "Series A", raised_amount: 30, location: "Chicago, IL", description: "Telehealth infrastructure for specialty care. Connects patients with specialists through AI-triaged video consultations, reducing wait times by 80%.", founded_year: 2022, employee_count: 58, tags: ["telemedicine", "b2b-saas", "api-first"], sector: "Health" },
    { name: "GenoVista", website: "https://genovista.bio", funding_stage: "Series B", raised_amount: 130, location: "San Francisco, CA", description: "Whole genome sequencing as a service with AI-powered variant interpretation. Making genomic medicine accessible to community health systems.", founded_year: 2020, employee_count: 195, tags: ["genomics", "diagnostics", "machine-learning"], sector: "Health" },
    { name: "PulseCheck", website: "https://pulsecheck.health", funding_stage: "Seed", raised_amount: 7, location: "Austin, TX", description: "Continuous remote patient monitoring platform using off-the-shelf wearables. AI algorithms detect deterioration 6 hours before clinical presentation.", founded_year: 2023, employee_count: 20, tags: ["diagnostics", "machine-learning", "telemedicine"], sector: "Health" },
    { name: "NeuroPath", website: "https://neuropath.ai", funding_stage: "Series A", raised_amount: 48, location: "London, UK", description: "Digital therapeutics platform for neurological conditions. FDA-cleared cognitive training programs for mild cognitive impairment and early-stage dementia.", founded_year: 2021, employee_count: 82, tags: ["biotech", "machine-learning", "diagnostics"], sector: "Health" },
    { name: "PharmTrace", website: "https://pharmtrace.com", funding_stage: "Series B", raised_amount: 75, location: "New York, NY", description: "Pharmaceutical supply chain intelligence platform. End-to-end drug tracking with blockchain verification and temperature monitoring for cold chain compliance.", founded_year: 2020, employee_count: 120, tags: ["supply-chain", "compliance", "analytics"], sector: "Health" },
    { name: "MindfulRx", website: "https://mindfulrx.co", funding_stage: "Pre-Seed", raised_amount: 3, location: "Denver, CO", description: "AI-powered medication management for patients with complex regimens. Reduces adverse drug events through intelligent interaction checking and adherence coaching.", founded_year: 2024, employee_count: 7, tags: ["telemedicine", "machine-learning", "b2b-saas"], sector: "Health" },

    // SaaS (5)
    { name: "DockOps", website: "https://dockops.dev", funding_stage: "Series A", raised_amount: 25, location: "Seattle, WA", description: "Container orchestration platform that simplifies Kubernetes for mid-market engineering teams. Deploy, scale, and monitor with an intuitive visual interface.", founded_year: 2022, employee_count: 42, tags: ["cloud-native", "developer-tools", "b2b-saas"], sector: "SaaS" },
    { name: "MetricFlow", website: "https://metricflow.io", funding_stage: "Series B", raised_amount: 68, location: "San Francisco, CA", description: "Unified metrics layer for modern data stacks. Define business metrics once, access them consistently across BI tools, notebooks, and applications.", founded_year: 2021, employee_count: 95, tags: ["data-infrastructure", "analytics", "b2b-saas"], sector: "SaaS" },
    { name: "CalendarIQ", website: "https://calendariq.com", funding_stage: "Seed", raised_amount: 6, location: "Toronto, Canada", description: "AI scheduling assistant for revenue teams. Automatically coordinates complex meeting sequences, optimizes for time zones, and integrates with every CRM.", founded_year: 2023, employee_count: 14, tags: ["b2b-saas", "machine-learning", "api-first"], sector: "SaaS" },
    { name: "FormStack Pro", website: "https://formstackpro.com", funding_stage: "Series C", raised_amount: 195, location: "Austin, TX", description: "Enterprise form builder and workflow automation platform. Powers the internal operations of Fortune 500 companies with advanced logic, integrations, and compliance.", founded_year: 2018, employee_count: 340, tags: ["b2b-saas", "compliance", "api-first"], sector: "SaaS" },
    { name: "NotionFlow", website: "https://notionflow.app", funding_stage: "Pre-Seed", raised_amount: 2, location: "Paris, France", description: "Workflow automation for Notion power users. Connect your Notion workspace to 500+ apps with event-driven automations and AI-powered data enrichment.", founded_year: 2024, employee_count: 5, tags: ["b2b-saas", "developer-tools", "machine-learning"], sector: "SaaS" },

    // DevTools (4)
    { name: "TestPilot", website: "https://testpilot.dev", funding_stage: "Series A", raised_amount: 22, location: "Berlin, Germany", description: "AI-powered test generation and maintenance platform. Automatically creates and updates end-to-end tests as your codebase evolves, reducing QA effort by 60%.", founded_year: 2022, employee_count: 38, tags: ["developer-tools", "machine-learning", "open-source"], sector: "DevTools" },
    { name: "GitLens Pro", website: "https://gitlenspro.com", funding_stage: "Series B", raised_amount: 55, location: "San Francisco, CA", description: "Code intelligence platform that goes beyond git blame. AI-powered code review, architecture visualization, and team knowledge mapping for engineering organizations.", founded_year: 2021, employee_count: 85, tags: ["developer-tools", "analytics", "b2b-saas"], sector: "DevTools" },
    { name: "CacheLayer", website: "https://cachelayer.io", funding_stage: "Seed", raised_amount: 10, location: "New York, NY", description: "Intelligent edge caching platform that automatically optimizes cache policies using ML. Reduces origin loads by 80% while maintaining perfect consistency.", founded_year: 2023, employee_count: 16, tags: ["cloud-native", "developer-tools", "api-first"], sector: "DevTools" },
    { name: "DeployBot", website: "https://deploybot.dev", funding_stage: "Series A", raised_amount: 18, location: "London, UK", description: "Zero-downtime deployment automation for microservices. Canary releases, feature flags, and rollback with confidence scoring powered by production metrics.", founded_year: 2022, employee_count: 30, tags: ["developer-tools", "cloud-native", "open-source"], sector: "DevTools" },

    // Security (4)
    { name: "ZeroWall", website: "https://zerowall.security", funding_stage: "Series B", raised_amount: 90, location: "Tel Aviv, Israel", description: "Zero-trust network security platform for hybrid cloud environments. Microsegmentation and identity-aware access controls with real-time threat detection.", founded_year: 2020, employee_count: 155, tags: ["zero-trust", "cybersecurity", "cloud-native"], sector: "Security" },
    { name: "VaultKeep", website: "https://vaultkeep.io", funding_stage: "Series A", raised_amount: 35, location: "Boston, MA", description: "Secrets management platform built for DevOps teams. Rotate, audit, and control access to API keys, credentials, and certificates across your infrastructure.", founded_year: 2021, employee_count: 52, tags: ["cybersecurity", "developer-tools", "compliance"], sector: "Security" },
    { name: "IdentityForge", website: "https://identityforge.com", funding_stage: "Series C", raised_amount: 175, location: "San Francisco, CA", description: "Customer identity platform with passwordless authentication, adaptive MFA, and privacy-by-design user management for consumer applications.", founded_year: 2019, employee_count: 265, tags: ["identity", "cybersecurity", "api-first"], sector: "Security" },
    { name: "ThreatMap", website: "https://threatmap.ai", funding_stage: "Seed", raised_amount: 14, location: "Austin, TX", description: "Threat intelligence aggregation and visualization platform. Correlates data from 50+ sources to provide security teams with actionable attack surface insights.", founded_year: 2023, employee_count: 19, tags: ["cybersecurity", "analytics", "machine-learning"], sector: "Security" },

    // EdTech (3)
    { name: "SkillForge", website: "https://skillforge.io", funding_stage: "Series A", raised_amount: 28, location: "New York, NY", description: "AI-powered corporate upskilling platform. Personalized learning paths that adapt to individual skill gaps, with hands-on labs and real-world project assessments.", founded_year: 2021, employee_count: 65, tags: ["upskilling", "workforce", "machine-learning"], sector: "EdTech" },
    { name: "CodeCraft Academy", website: "https://codecraft.academy", funding_stage: "Seed", raised_amount: 5, location: "Toronto, Canada", description: "Interactive coding bootcamp platform with AI tutoring. Students learn through building real projects with instant feedback and mentorship matching.", founded_year: 2023, employee_count: 12, tags: ["e-learning", "developer-tools", "machine-learning"], sector: "EdTech" },
    { name: "ClassPulse", website: "https://classpulse.edu", funding_stage: "Series B", raised_amount: 62, location: "Chicago, IL", description: "K-12 student engagement platform combining real-time formative assessment with AI-driven intervention recommendations for teachers.", founded_year: 2020, employee_count: 110, tags: ["edtech", "e-learning", "analytics"], sector: "EdTech" },

    // Logistics (2)
    { name: "RouteOptima", website: "https://routeoptima.com", funding_stage: "Series B", raised_amount: 78, location: "Los Angeles, CA", description: "Last-mile delivery optimization platform using real-time traffic, weather, and demand signals. Reduces delivery costs by 30% for enterprise logistics providers.", founded_year: 2020, employee_count: 135, tags: ["logistics", "machine-learning", "analytics"], sector: "Logistics" },
    { name: "WarehouseOS", website: "https://warehouseos.com", funding_stage: "Series A", raised_amount: 40, location: "Miami, FL", description: "Autonomous warehouse management system with robotic fleet coordination. Optimizes pick paths, inventory placement, and labor allocation using reinforcement learning.", founded_year: 2021, employee_count: 88, tags: ["robotics", "autonomous", "supply-chain"], sector: "Logistics" },
];

export function createSeedCompanies(): Company[] {
    return COMPANIES_DATA.map((c, i): Company => ({
        id: `company-${i + 1}`,
        name: c.name,
        website: c.website,
        funding_stage: c.funding_stage,
        raised_amount: c.raised_amount,
        location: c.location,
        description: c.description,
        founded_year: c.founded_year,
        employee_count: c.employee_count,
        tags: c.tags,
        sector: c.sector,
        last_enriched: null,
        enrichment_data: null,
        enrichment_history: [],
        notes: [],
        created_at: new Date(2024, 0, 1 + i).toISOString(),
        logo_gradient: GRADIENT_PALETTES[i % GRADIENT_PALETTES.length],
    }));
}

// ============================================================
// Generate mock signals
// ============================================================

export function createSeedSignals(companies: Company[]): Signal[] {
    const signalTemplates: { type: Signal["type"]; titleFn: (name: string) => string; descFn: (name: string) => string; severity: Signal["severity"] }[] = [
        { type: "hiring_spike", titleFn: (n) => `${n} posted 12 new jobs this week`, descFn: (n) => `${n}'s engineering team appears to be scaling rapidly, with 8 backend and 4 ML engineering roles posted.`, severity: "high" },
        { type: "new_funding", titleFn: (n) => `${n} rumored to be raising new round`, descFn: (n) => `Multiple sources indicate ${n} is in late-stage discussions for their next funding round.`, severity: "high" },
        { type: "leadership_change", titleFn: (n) => `New CTO joined ${n}`, descFn: (n) => `${n} appointed a new Chief Technology Officer, previously VP Engineering at a major tech company.`, severity: "medium" },
        { type: "tech_stack_update", titleFn: (n) => `${n} migrated to Rust`, descFn: (n) => `${n}'s engineering blog reveals a major infrastructure migration to Rust for performance-critical services.`, severity: "low" },
        { type: "blog_active", titleFn: (n) => `${n} published 3 articles this month`, descFn: (n) => `${n}'s blog is actively maintained with recent posts covering product updates and technical deep-dives.`, severity: "low" },
        { type: "careers_page", titleFn: (n) => `${n} careers page updated`, descFn: (n) => `${n} refreshed their careers page with new positions across engineering, sales, and operations.`, severity: "medium" },
        { type: "growth_signal", titleFn: (n) => `${n} crossed 100 employees`, descFn: (n) => `${n} has grown past the 100-employee milestone, indicating healthy expansion.`, severity: "medium" },
        { type: "changelog_present", titleFn: (n) => `${n} shipping rapidly`, descFn: (n) => `${n}'s changelog shows 15+ releases in the past month, indicating a high development velocity.`, severity: "low" },
    ];

    const signals: Signal[] = [];
    const now = Date.now();

    companies.slice(0, 25).forEach((company, ci) => {
        const template = signalTemplates[ci % signalTemplates.length];
        signals.push({
            id: generateId(),
            company_id: company.id,
            company_name: company.name,
            type: template.type,
            title: template.titleFn(company.name),
            description: template.descFn(company.name),
            severity: template.severity,
            created_at: new Date(now - ci * 3_600_000 * 4).toISOString(),
            read: ci > 5,
        });
    });

    return signals;
}

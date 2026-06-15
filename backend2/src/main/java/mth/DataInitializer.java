package mth;

import mth.model.Job;
import mth.model.User;
import mth.repository.JobRepository;
import mth.repository.ApplicationRepository;
import mth.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(JobRepository jobRepository, 
                           ApplicationRepository applicationRepository,
                           UserRepository userRepository,
                           PasswordEncoder passwordEncoder) {
        this.jobRepository = jobRepository;
        this.applicationRepository = applicationRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        seedUsers();

        long count = jobRepository.count();
        boolean hasCorruptedSalary = jobRepository.findAll().stream()
                .anyMatch(j -> j.getSalary() != null && j.getSalary().contains("?"));
        if (count >= 45 && !hasCorruptedSalary) {
            System.out.println("Jobs already seeded (" + count + " jobs found). Skipping.");
            return;
        }

        // Clear existing applications and jobs to re-seed cleanly
        applicationRepository.deleteAll();
        jobRepository.deleteAll();
        System.out.println("Seeding " + allJobs().size() + " jobs into the database...");
        jobRepository.saveAll(allJobs());
        System.out.println("Job seeding complete. Total jobs: " + jobRepository.count());
    }

    private void seedUsers() {
        if (userRepository.findByEmail("admin@jobportal.com") == null) {
            User admin = new User();
            admin.setName("Admin");
            admin.setEmail("admin@jobportal.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole("ADMIN");
            userRepository.save(admin);
            System.out.println("Admin user seeded.");
        }

        if (userRepository.findByEmail("student@jobportal.com") == null) {
            User student = new User();
            student.setName("Student User");
            student.setEmail("student@jobportal.com");
            student.setPassword(passwordEncoder.encode("student123"));
            student.setRole("USER");
            userRepository.save(student);
            System.out.println("Student user seeded.");
        }
    }

    private List<Job> allJobs() {
        return Arrays.asList(
            job("Frontend Developer", "TechNova Solutions", "Hyderabad, India", "Full-Time",
                "₹8,00,000 - ₹14,00,000/yr", "0-2 years",
                "React,JavaScript,CSS,HTML,TypeScript",
                "We are looking for a talented Frontend Developer to join our team. You will be responsible for building intuitive user interfaces using React and modern CSS techniques.",
                "Build and maintain responsive web applications|Collaborate with UI/UX designers|Write clean, reusable code|Optimize for speed and scalability|Participate in code reviews",
                "Proficiency in React and JavaScript|Familiarity with RESTful APIs|Good understanding of Git|Strong problem-solving skills|Excellent communication skills",
                "Engineering", "2026-05-15", "2026-06-15", false),

            job("Backend Developer", "DataBridge Inc.", "Bangalore, India", "Full-Time",
                "₹10,00,000 - ₹18,00,000/yr", "1-3 years",
                "Node.js,Express,MongoDB,SQL,REST APIs",
                "DataBridge Inc. is hiring a Backend Developer to design and maintain scalable server-side systems. You will work on building APIs and managing databases.",
                "Design and develop RESTful APIs|Manage MongoDB and SQL databases|Implement authentication|Collaborate with frontend teams|Monitor backend issues",
                "Strong knowledge of Node.js and Express|Experience with MongoDB|Understanding of microservices|Experience with Docker is a plus|Good debugging skills",
                "Engineering", "2026-05-10", "2026-06-10", true),

            job("UI/UX Designer", "CreativeEdge Studio", "Chennai, India", "Part-Time",
                "₹5,00,000 - ₹9,00,000/yr", "0-1 years",
                "Figma,Adobe XD,Prototyping,User Research,CSS",
                "CreativeEdge Studio is looking for a UI/UX Designer passionate about crafting delightful digital experiences.",
                "Create wireframes and prototypes|Conduct user research|Collaborate with developers|Maintain design system|Present design decisions",
                "Proficiency in Figma or Adobe XD|Portfolio demonstrating UI/UX skills|Understanding of accessibility|Ability to translate requirements|Familiarity with frontend is a plus",
                "Design", "2026-05-18", "2026-06-18", true),

            job("Cloud Engineer", "SkyArch Systems", "Mumbai, India", "Full-Time",
                "₹14,00,000 - ₹22,00,000/yr", "2-5 years",
                "AWS,Azure,Kubernetes,Docker,Terraform",
                "SkyArch Systems is seeking an experienced Cloud Engineer to design and manage cloud infrastructure on AWS and Azure platforms.",
                "Design and deploy cloud infrastructure|Automate with Terraform and CI/CD|Monitor and optimize costs|Implement security best practices|Collaborate with DevOps teams",
                "Experience with AWS or Azure|Proficiency with Docker and Kubernetes|Knowledge of Terraform|Understanding of networking|AWS/Azure certification is a plus",
                "DevOps", "2026-05-08", "2026-06-08", false),

            job("Data Scientist", "InsightAI Labs", "Pune, India", "Full-Time",
                "₹12,00,000 - ₹20,00,000/yr", "1-4 years",
                "Python,Machine Learning,TensorFlow,SQL,Statistics",
                "InsightAI Labs is hiring a Data Scientist to uncover meaningful patterns from large datasets and build predictive models.",
                "Build and deploy ML models|Analyze datasets using Python and SQL|Create data visualizations|Collaborate with product teams|Conduct A/B testing",
                "Proficiency in Python|Experience with ML frameworks|Strong statistics foundation|Familiarity with SQL|Excellent communication skills",
                "Data", "2026-05-12", "2026-06-12", true),

            job("Mobile App Developer", "AppVenture Co.", "Delhi, India", "Full-Time",
                "₹9,00,000 - ₹16,00,000/yr", "1-3 years",
                "React Native,Flutter,iOS,Android,Firebase",
                "AppVenture Co. is looking for a Mobile App Developer with experience in React Native or Flutter to develop cross-platform mobile apps.",
                "Develop mobile apps using React Native or Flutter|Integrate APIs and Firebase|Ensure performance and UX standards|Write tests|Publish on App Store and Google Play",
                "Experience with React Native or Flutter|Knowledge of mobile architecture|Experience with Firebase|Mobile performance optimization|Strong problem-solving skills",
                "Mobile", "2026-05-20", "2026-06-20", false),

            job("Business Analyst", "Deloitte India", "Gurgaon, India", "Full-Time",
                "₹12,00,000 - ₹20,00,000/yr", "0-2 years",
                "Excel,Power BI,SQL,Business Strategy,Stakeholder Management",
                "Deloitte India is hiring MBA graduates as Business Analysts to analyze business processes and propose data-driven recommendations.",
                "Gather and analyze business requirements|Create reports and dashboards|Facilitate stakeholder workshops|Develop business cases|Support project management",
                "MBA from a reputed institution|Strong analytical skills|Proficiency in Excel and Power BI|Excellent presentation skills|Knowledge of consulting frameworks",
                "MBA", "2026-05-22", "2026-06-22", false),

            job("Product Manager", "Flipkart", "Bangalore, India", "Full-Time",
                "₹18,00,000 - ₹30,00,000/yr", "2-5 years",
                "Product Strategy,Agile,Jira,Market Research,Data Analytics",
                "Flipkart is looking for a dynamic Product Manager to lead product strategy and execution for its e-commerce platform.",
                "Define and own the product roadmap|Work with engineering and design|Conduct market research|Define KPIs and track performance|Prioritize features based on data",
                "MBA from premier institution preferred|2+ years in product management|Strong understanding of e-commerce|Experience with Agile/Scrum|Excellent leadership skills",
                "MBA", "2026-05-25", "2026-06-25", false),

            job("Management Consultant", "McKinsey & Company", "Delhi, India", "Full-Time",
                "₹25,00,000 - ₹40,00,000/yr", "0-1 years",
                "Strategic Analysis,Financial Modeling,PowerPoint,Problem Solving,Communication",
                "McKinsey & Company is recruiting MBA graduates for its Business Analyst program to solve complex business challenges for Fortune 500 companies.",
                "Structure and solve complex client problems|Build financial models|Develop client presentations|Interview stakeholders|Support engagement management",
                "MBA from a top-tier business school|Exceptional analytical skills|Strong Excel and PowerPoint|Leadership experience|Strong written and verbal communication",
                "MBA", "2026-05-14", "2026-06-14", false),

            job("Marketing Manager", "HUL", "Mumbai, India", "Full-Time",
                "₹15,00,000 - ₹25,00,000/yr", "1-3 years",
                "Brand Management,Digital Marketing,Market Research,Campaign Management,Consumer Insights",
                "HUL is hiring a Marketing Manager to lead brand and marketing campaigns for its leading FMCG portfolio.",
                "Develop and execute marketing campaigns|Manage brand P&L and budgets|Conduct consumer research|Collaborate with sales teams|Monitor competitive landscape",
                "MBA with Marketing specialization|Experience in FMCG preferred|Strong analytical and creative thinking|Excellent project management|Familiarity with digital marketing",
                "MBA", "2026-05-30", "2026-06-30", false),

            job("Finance Analyst", "Goldman Sachs", "Bangalore, India", "Full-Time",
                "₹20,00,000 - ₹35,00,000/yr", "0-2 years",
                "Financial Modeling,Valuation,Excel,Bloomberg,Investment Analysis",
                "Goldman Sachs is looking for Finance Analysts for its Investment Banking Division to assist in M&A and capital market transactions.",
                "Prepare financial models and valuation analyses|Conduct industry research|Support client pitches|Analyze market trends|Prepare management reports",
                "MBA with Finance specialization or CFA Level I|Strong quantitative skills|Advanced Excel skills|Ability to work under pressure|Excellent attention to detail",
                "MBA", "2026-05-16", "2026-06-16", false),

            job("MBBS Doctor (Resident)", "Apollo Hospitals", "Chennai, India", "Full-Time",
                "₹6,00,000 - ₹10,00,000/yr", "0-1 years",
                "Patient Care,Clinical Diagnosis,Medical Records,Emergency Medicine,Team Collaboration",
                "Apollo Hospitals is recruiting MBBS Resident Doctors to join its multi-specialty departments for hands-on clinical experience.",
                "Conduct patient assessments and diagnoses|Assist senior doctors in surgeries|Maintain accurate medical records|Handle emergency cases|Participate in case discussions",
                "MBBS degree from recognized medical college|Valid MCI registration|Strong commitment to patient care|Good clinical and diagnostic skills|Willingness to work in shifts",
                "Medical", "2026-05-11", "2026-06-11", false),

            job("Pharmacist", "Medplus Health Services", "Hyderabad, India", "Full-Time",
                "₹3,00,000 - ₹5,00,000/yr", "0-2 years",
                "Drug Dispensing,Inventory Management,Patient Counseling,Pharmaceutical Knowledge,Billing",
                "Medplus Health Services is looking for qualified Pharmacists to manage pharmacy operations at its retail outlets.",
                "Dispense prescription and OTC medications|Counsel patients on medication usage|Maintain inventory and orders|Ensure compliance with drug regulations|Handle billing",
                "B.Pharm or M.Pharm from recognized institution|Valid pharmacist license|Knowledge of drug interactions|Good interpersonal skills|Proficiency in pharmacy software",
                "Medical", "2026-05-19", "2026-06-19", false),

            job("Medical Lab Technician", "Thyrocare Technologies", "Mumbai, India", "Full-Time",
                "₹2,50,000 - ₹4,00,000/yr", "0-2 years",
                "Hematology,Biochemistry,Microbiology,Lab Equipment,Quality Control",
                "Thyrocare Technologies is hiring Medical Lab Technicians to perform diagnostic tests and ensure accuracy of laboratory results.",
                "Collect and process patient samples|Perform hematology and biochemistry tests|Operate and maintain lab equipment|Ensure quality control|Maintain lab records",
                "DMLT or BMLT degree|Knowledge of lab procedures and safety|Ability to operate diagnostic equipment|Attention to detail and accuracy|Willingness to work in shifts",
                "Medical", "2026-05-23", "2026-06-23", false),

            job("Nurse (Staff Nurse)", "Fortis Healthcare", "Delhi, India", "Full-Time",
                "₹3,50,000 - ₹6,00,000/yr", "0-3 years",
                "Patient Care,IV Administration,Wound Care,ICU Monitoring,Medical Documentation",
                "Fortis Healthcare is recruiting Staff Nurses to join its ICU, wards, and OT departments for compassionate patient care.",
                "Provide direct patient care and monitoring|Administer medications and IV therapies|Assist doctors during procedures|Maintain accurate nursing records|Educate patients",
                "B.Sc. Nursing or GNM|Valid Nursing Council registration|Experience in ICU is a plus|Strong communication and empathy|Willingness to work in shifts",
                "Medical", "2026-05-26", "2026-06-26", false),

            job("Physiotherapist", "Narayana Health", "Bangalore, India", "Full-Time",
                "₹4,00,000 - ₹7,00,000/yr", "0-2 years",
                "Rehabilitation,Manual Therapy,Exercise Prescription,Patient Assessment,Sports Injury",
                "Narayana Health is seeking a Physiotherapist to provide rehabilitation services to patients recovering from surgeries and injuries.",
                "Assess patients physical conditions|Design personalized rehabilitation plans|Provide manual therapy and exercises|Monitor patient progress|Educate on home exercise programs",
                "BPT or MPT from recognized institution|Valid physiotherapy license|Strong knowledge of musculoskeletal disorders|Excellent interpersonal skills|Sports rehabilitation experience preferred",
                "Medical", "2026-05-28", "2026-06-28", false),

            job("Radiologist (Junior)", "AIIMS New Delhi", "Delhi, India", "Full-Time",
                "₹8,00,000 - ₹15,00,000/yr", "1-3 years",
                "X-Ray Interpretation,CT Scan,MRI,Ultrasound,Radiology Reporting",
                "AIIMS New Delhi is seeking a Junior Radiologist to assist in interpreting diagnostic imaging studies including X-rays, CT scans, and MRIs.",
                "Interpret and report on diagnostic images|Collaborate with clinical teams|Perform interventional radiology under supervision|Maintain imaging quality|Participate in research",
                "MD in Radiology or equivalent|Valid MCI registration|Proficiency in reading diagnostic images|Good communication with colleagues|Commitment to continuous learning",
                "Medical", "2026-05-13", "2026-06-13", false),

            job("Civil Engineer", "L&T Construction", "Mumbai, India", "Full-Time",
                "₹5,00,000 - ₹9,00,000/yr", "0-2 years",
                "AutoCAD,Structural Analysis,Project Management,Surveying,MS Project",
                "Larsen & Toubro Construction is hiring Civil Engineers for its large-scale infrastructure projects across India.",
                "Assist in site supervision and quality control|Prepare and review structural drawings|Coordinate with contractors|Monitor project schedules|Conduct site inspections",
                "B.E./B.Tech in Civil Engineering|Proficiency in AutoCAD and MS Project|Knowledge of IS codes|Strong analytical skills|Willingness to work on-site",
                "Engineering", "2026-05-17", "2026-06-17", false),

            job("Mechanical Engineer", "Tata Motors", "Pune, India", "Full-Time",
                "₹6,00,000 - ₹11,00,000/yr", "0-2 years",
                "SolidWorks,CAD/CAM,Manufacturing Processes,FMEA,Quality Control",
                "Tata Motors is recruiting Mechanical Engineers to join its vehicle design and manufacturing team for product design and quality assurance.",
                "Design and develop mechanical components|Conduct FMEA and reliability analysis|Collaborate with production teams|Perform testing and validation|Prepare technical documentation",
                "B.E./B.Tech in Mechanical Engineering|Proficiency in SolidWorks or CATIA|Knowledge of manufacturing processes|Analytical mindset|Good teamwork skills",
                "Engineering", "2026-05-21", "2026-06-21", false),

            job("Electrical Engineer", "Siemens India", "Gurgaon, India", "Full-Time",
                "₹7,00,000 - ₹12,00,000/yr", "1-3 years",
                "Power Systems,PLC Programming,SCADA,AutoCAD Electrical,Circuit Design",
                "Siemens India is looking for Electrical Engineers to work on industrial automation and power systems projects.",
                "Design and review electrical schematics|Program and commission PLCs and SCADA|Conduct electrical testing|Prepare technical proposals|Liaise with clients",
                "B.E./B.Tech in Electrical or Electronics Engineering|Experience with PLC programming|Knowledge of power distribution|Familiarity with AutoCAD Electrical|Problem-solving mindset",
                "Engineering", "2026-05-24", "2026-06-24", false),

            job("Software Engineer (Java)", "Infosys", "Bangalore, India", "Full-Time",
                "₹7,00,000 - ₹13,00,000/yr", "0-2 years",
                "Java,Spring Boot,Microservices,SQL,REST APIs",
                "Infosys is hiring Software Engineers to build enterprise Java applications using Spring Boot and design microservices for global clients.",
                "Develop scalable Java applications|Design RESTful APIs and microservices|Write unit and integration tests|Participate in code reviews|Collaborate with cross-functional teams",
                "B.E./B.Tech in Computer Science|Strong Java programming skills|Knowledge of Spring Boot|Understanding of SQL|Good communication skills",
                "Engineering", "2026-05-09", "2026-06-09", true),

            job("Embedded Systems Engineer", "Bosch India", "Coimbatore, India", "Full-Time",
                "₹8,00,000 - ₹14,00,000/yr", "1-3 years",
                "C,C++,Embedded C,RTOS,CAN Protocol,Microcontrollers",
                "Bosch India is seeking Embedded Systems Engineers for its automotive electronics division to develop firmware for safety-critical systems.",
                "Develop and test embedded firmware in C/C++|Implement CAN and LIN protocols|Integrate RTOS and device drivers|Perform HIL testing|Prepare AUTOSAR documentation",
                "B.E./B.Tech in Electronics or CS|Proficiency in Embedded C and RTOS|Knowledge of automotive protocols|Experience with oscilloscopes|Familiarity with AUTOSAR is a plus",
                "Engineering", "2026-05-27", "2026-06-27", false),

            job("DevOps Engineer", "Wipro Digital", "Hyderabad, India", "Full-Time",
                "₹10,00,000 - ₹17,00,000/yr", "1-3 years",
                "Jenkins,GitLab CI/CD,Docker,Kubernetes,Linux,Ansible",
                "Wipro Digital is looking for a DevOps Engineer to build and maintain CI/CD pipelines and automate infrastructure provisioning.",
                "Design and maintain CI/CD pipelines|Containerize apps using Docker and Kubernetes|Automate infrastructure with Ansible|Monitor system health|Collaborate with dev teams",
                "Experience with Jenkins or GitLab CI|Proficiency in Docker and Kubernetes|Strong Linux administration|Knowledge of scripting (Bash, Python)|Familiarity with cloud platforms",
                "DevOps", "2026-05-31", "2026-06-30", true),

            job("Site Reliability Engineer", "Google India", "Hyderabad, India", "Full-Time",
                "₹25,00,000 - ₹40,00,000/yr", "2-5 years",
                "SRE,Prometheus,Grafana,Python,Go,Kubernetes",
                "Google India is hiring Site Reliability Engineers to ensure the reliability and scalability of its cloud services.",
                "Define and track SLOs and error budgets|Build observability tooling|Respond to incidents and conduct post-mortems|Automate toil using Python or Go|Drive reliability improvements",
                "Strong software engineering background|Experience with monitoring tools|Proficiency in Python or Go|Deep understanding of distributed systems|Excellent incident response skills",
                "DevOps", "2026-05-06", "2026-06-06", false),

            job("Data Analyst", "Zomato", "Gurgaon, India", "Full-Time",
                "₹7,00,000 - ₹13,00,000/yr", "0-2 years",
                "SQL,Python,Tableau,Excel,Data Visualization",
                "Zomato is hiring a Data Analyst to extract insights from its massive dataset and collaborate with product teams to drive business decisions.",
                "Analyze large datasets to uncover insights|Build and maintain Tableau dashboards|Write complex SQL queries|Collaborate with product managers|Present findings through visualizations",
                "Proficiency in SQL and Python|Experience with BI tools like Tableau|Strong analytical skills|Good communication skills|Familiarity with A/B testing",
                "Data", "2026-05-29", "2026-06-29", true),

            job("Machine Learning Engineer", "Ola Electric", "Bangalore, India", "Full-Time",
                "₹15,00,000 - ₹25,00,000/yr", "2-4 years",
                "Python,PyTorch,Deep Learning,Computer Vision,MLOps",
                "Ola Electric is recruiting ML Engineers to build computer vision and predictive models for its electric vehicle ecosystem.",
                "Build and train deep learning models|Deploy models using MLflow and Kubernetes|Optimize models for edge devices|Build ML pipelines|Monitor and retrain models",
                "Strong Python programming skills|Experience with deep learning frameworks|Knowledge of MLOps tools|Experience with computer vision preferred|Good understanding of statistics",
                "Data", "2026-05-07", "2026-06-07", false),

            job("Data Engineer", "PhonePe", "Bangalore, India", "Full-Time",
                "₹14,00,000 - ₹22,00,000/yr", "1-3 years",
                "Apache Spark,Kafka,Airflow,Python,SQL,AWS",
                "PhonePe is looking for a Data Engineer to build and maintain large-scale data pipelines powering its financial analytics platform.",
                "Design and implement data pipelines using Spark and Kafka|Build and manage Airflow DAGs|Develop data models in the warehouse|Ensure data quality|Collaborate with data scientists",
                "Strong Python and SQL skills|Experience with Apache Spark and Kafka|Knowledge of AWS data services|Familiarity with Airflow|Understanding of data modeling",
                "Data", "2026-05-18", "2026-06-18", true),

            job("Graphic Designer", "Ogilvy India", "Mumbai, India", "Full-Time",
                "₹4,00,000 - ₹8,00,000/yr", "0-2 years",
                "Adobe Illustrator,Photoshop,InDesign,Branding,Typography",
                "Ogilvy India is seeking a creative Graphic Designer to create visually stunning campaigns for leading brands across print and digital media.",
                "Create compelling designs for print and digital|Collaborate with creative teams|Develop brand identities and style guides|Prepare print-ready files|Present design concepts",
                "Degree in Graphic Design or Fine Arts|Proficiency in Adobe Creative Suite|Strong portfolio showcasing design work|Understanding of typography and color theory|Ability to work under tight deadlines",
                "Design", "2026-05-15", "2026-06-15", false),

            job("Motion Graphics Designer", "Hotstar (Disney+)", "Mumbai, India", "Full-Time",
                "₹6,00,000 - ₹11,00,000/yr", "1-3 years",
                "After Effects,Cinema 4D,Premiere Pro,Motion Design,Storyboarding",
                "Disney+ Hotstar is hiring a Motion Graphics Designer to create engaging animations and visual effects for its streaming platform.",
                "Create motion graphics and animation|Design and animate promotional content|Develop storyboards and animatics|Collaborate with video producers|Ensure brand consistency",
                "Proficiency in After Effects and Cinema 4D|Strong portfolio of motion graphics|Knowledge of video production|Creative thinking and attention to detail|Streaming industry experience preferred",
                "Design", "2026-05-20", "2026-06-20", true),

            job("iOS Developer", "Paytm", "Noida, India", "Full-Time",
                "₹12,00,000 - ₹20,00,000/yr", "1-3 years",
                "Swift,SwiftUI,Xcode,Core Data,Push Notifications",
                "Paytm is hiring iOS Developers to build and improve its flagship payments app using Swift and SwiftUI for millions of users.",
                "Develop and maintain native iOS applications|Implement UI components using SwiftUI|Integrate payment gateways and third-party SDKs|Ensure app performance and security|Collaborate with product teams",
                "Proficiency in Swift and iOS frameworks|Experience with Xcode and App Store deployment|Knowledge of Core Data|Understanding of mobile security|Familiarity with Agile methodology",
                "Mobile", "2026-05-22", "2026-06-22", false),

            job("Android Developer", "CRED", "Bangalore, India", "Full-Time",
                "₹14,00,000 - ₹22,00,000/yr", "2-4 years",
                "Kotlin,Jetpack Compose,Android SDK,MVVM,Coroutines",
                "CRED is looking for skilled Android Developers to craft exceptional user experiences for its premium credit card lifestyle app using Kotlin and Jetpack Compose.",
                "Develop native Android apps using Kotlin|Implement MVVM architecture|Integrate APIs and manage application state|Write comprehensive tests|Collaborate with design and product teams",
                "Strong proficiency in Kotlin|Experience with Jetpack Compose|Knowledge of MVVM and clean architecture|Familiarity with Coroutines and Kotlin Flow|Experience with PlayStore deployment",
                "Mobile", "2026-05-14", "2026-06-14", true),

            job("Operations Manager", "Amazon India", "Delhi, India", "Full-Time",
                "₹14,00,000 - ₹22,00,000/yr", "1-3 years",
                "Supply Chain,Lean Management,Process Improvement,Data Analysis,Team Leadership",
                "Amazon India is hiring Operations Managers to lead fulfilment centre operations and optimize processes in its fast-paced logistics network.",
                "Lead a team in warehouse and fulfilment operations|Drive process improvements using Lean|Monitor KPIs and implement corrections|Ensure safety and compliance|Collaborate with supply chain teams",
                "MBA in Operations or Supply Chain|Strong people management skills|Analytical mindset with data-driven decision making|Knowledge of Lean/Six Sigma|Ability to thrive in fast-paced environment",
                "MBA", "2026-05-05", "2026-06-05", false),

            job("HR Business Partner", "Infosys BPM", "Bangalore, India", "Full-Time",
                "₹10,00,000 - ₹16,00,000/yr", "1-3 years",
                "Talent Acquisition,Employee Relations,HRIS,Compensation & Benefits,Organizational Development",
                "Infosys BPM is looking for an HR Business Partner to support business units in talent management and employee engagement.",
                "Partner with business leaders on people strategy|Lead talent acquisition and workforce planning|Manage employee relations and grievances|Implement HR policies|Drive employee engagement",
                "MBA in Human Resources|Knowledge of Indian labor laws|Experience with HRIS systems|Strong interpersonal skills|Ability to influence at all levels",
                "MBA", "2026-05-16", "2026-06-16", false),

            job("Investment Banking Analyst", "ICICI Securities", "Mumbai, India", "Full-Time",
                "₹12,00,000 - ₹20,00,000/yr", "0-2 years",
                "Financial Modeling,Pitch Decks,Due Diligence,Excel,Capital Markets",
                "ICICI Securities is recruiting Investment Banking Analysts to support M&A, ECM, and DCM transactions for corporate clients.",
                "Prepare financial models and DCF valuations|Conduct industry research|Draft client presentations and pitch decks|Assist in due diligence|Coordinate with legal and compliance teams",
                "MBA with Finance specialization|Strong financial modeling skills|Advanced Excel and PowerPoint|Understanding of capital markets|Ability to work under pressure",
                "MBA", "2026-05-10", "2026-06-10", false),

            job("Medical Officer", "Max Healthcare", "Delhi, India", "Full-Time",
                "₹8,00,000 - ₹14,00,000/yr", "1-3 years",
                "Clinical Assessment,Emergency Response,Patient Management,Medical Ethics,Team Collaboration",
                "Max Healthcare is hiring Medical Officers for its OPD and emergency departments to provide primary clinical care.",
                "Conduct comprehensive patient evaluations|Manage emergency and walk-in patients|Prescribe appropriate treatment plans|Maintain accurate patient records|Coordinate with specialists",
                "MBBS degree with valid MCI/NMC registration|Internship and 1+ years clinical experience|Good knowledge of emergency medicine|Strong patient communication skills|Willingness to work in rotating shifts",
                "Medical", "2026-05-08", "2026-06-08", false),

            job("Dental Surgeon", "Clove Dental", "Pune, India", "Full-Time",
                "₹5,00,000 - ₹9,00,000/yr", "0-2 years",
                "Dental Surgery,Orthodontics,Root Canal,Patient Communication,Dental X-Ray",
                "Clove Dental is looking for qualified Dental Surgeons to provide comprehensive dental care at its clinics.",
                "Perform dental examinations and diagnose oral health issues|Conduct fillings, extractions, and root canals|Provide orthodontic treatments|Educate patients on oral hygiene|Maintain clinical records",
                "BDS or MDS from recognized dental college|Valid Dental Council registration|Strong clinical skills and dexterity|Patient-centric approach|Commitment to continuing dental education",
                "Medical", "2026-05-25", "2026-06-25", false),

            job("Full Stack Developer", "Razorpay", "Bangalore, India", "Full-Time",
                "₹16,00,000 - ₹26,00,000/yr", "2-4 years",
                "React,Node.js,PostgreSQL,TypeScript,Redis",
                "Razorpay is hiring Full Stack Developers to build next-generation payment infrastructure and merchant tools processing billions of rupees daily.",
                "Build scalable features across the full stack|Design database schemas and optimize queries|Implement caching using Redis|Write comprehensive tests|Participate in architecture design",
                "Strong proficiency in React and Node.js|Experience with PostgreSQL|Knowledge of Redis and caching|TypeScript experience preferred|Passion for building scalable systems",
                "Engineering", "2026-05-03", "2026-06-03", true),

            job("Cybersecurity Analyst", "HCL Technologies", "Noida, India", "Full-Time",
                "₹8,00,000 - ₹15,00,000/yr", "1-3 years",
                "SIEM,Penetration Testing,Vulnerability Assessment,Firewall,ISO 27001",
                "HCL Technologies is seeking Cybersecurity Analysts to protect enterprise clients from cyber threats and safeguard critical IT infrastructure.",
                "Monitor security events using SIEM tools|Conduct vulnerability assessments and penetration testing|Investigate and respond to security incidents|Implement firewall and endpoint security|Prepare security reports",
                "B.E./B.Tech in IT or CS|Knowledge of SIEM platforms like Splunk|Familiarity with penetration testing tools|Understanding of ISO 27001 and NIST|CEH or CompTIA Security+ preferred",
                "Engineering", "2026-05-04", "2026-06-04", false),

            job("AI/ML Research Engineer", "Microsoft India", "Hyderabad, India", "Full-Time",
                "₹20,00,000 - ₹38,00,000/yr", "2-5 years",
                "LLMs,Python,PyTorch,NLP,Research,Azure ML",
                "Microsoft India Research is hiring AI/ML Research Engineers to advance artificial intelligence by working on large language models and NLP.",
                "Research and develop novel ML models|Fine-tune and evaluate large language models|Implement NLP techniques|Deploy models to production via Azure ML|Publish research findings",
                "M.Tech/PhD in CS or AI preferred|Strong Python and PyTorch skills|Deep understanding of transformer architectures|Experience with NLP tasks|Research publications are a plus",
                "Engineering", "2026-05-01", "2026-06-01", true),

            job("Network Engineer", "Airtel Business", "Delhi, India", "Full-Time",
                "₹7,00,000 - ₹12,00,000/yr", "1-3 years",
                "CCNA,BGP,OSPF,Network Security,Cisco IOS,Wireshark",
                "Airtel Business is looking for a Network Engineer to design and manage enterprise networking solutions for corporate clients.",
                "Design and implement enterprise LAN/WAN networks|Configure and troubleshoot routing protocols|Manage network security including firewalls|Deploy and manage SD-WAN solutions|Monitor network performance",
                "CCNA certification; CCNP preferred|Strong knowledge of BGP and OSPF|Experience with Cisco or Juniper equipment|Network security experience|Good analytical and troubleshooting skills",
                "Engineering", "2026-05-02", "2026-06-02", false),

            job("Blockchain Developer", "Polygon Labs", "Bangalore, India", "Full-Time",
                "₹18,00,000 - ₹30,00,000/yr", "1-3 years",
                "Solidity,Ethereum,Web3.js,Smart Contracts,DeFi",
                "Polygon Labs is hiring Blockchain Developers to build decentralized applications and smart contracts on its Layer 2 Ethereum network.",
                "Develop and audit smart contracts using Solidity|Build dApps integrating Web3.js|Design DeFi protocols and token economics|Ensure security through audits|Collaborate with protocol teams",
                "Strong proficiency in Solidity and Ethereum ecosystem|Experience building DeFi or NFT projects|Knowledge of Web3.js, Ethers.js, and Hardhat|Understanding of cryptography|Passion for decentralized technologies",
                "Engineering", "2026-05-11", "2026-06-11", true),

            job("QA Engineer", "Freshworks", "Chennai, India", "Full-Time",
                "₹7,00,000 - ₹12,00,000/yr", "1-3 years",
                "Selenium,Cypress,API Testing,Postman,JIRA,Agile",
                "Freshworks is seeking a QA Engineer to ensure quality of its SaaS products through manual and automated testing strategies.",
                "Design and execute manual and automated test plans|Build test automation frameworks using Selenium/Cypress|Perform API testing using Postman|Collaborate with developers in Agile environment|Track and report bugs using JIRA",
                "Experience with Selenium or Cypress automation|Strong API testing skills with Postman|Knowledge of Agile/Scrum methodologies|Good understanding of SDLC|ISTQB certification is a plus",
                "Engineering", "2026-05-13", "2026-06-13", false),

            job("Supply Chain Analyst", "Marico Industries", "Mumbai, India", "Full-Time",
                "₹8,00,000 - ₹13,00,000/yr", "0-2 years",
                "SAP SCM,Demand Planning,Inventory Management,Excel,Logistics",
                "Marico Industries is looking for a Supply Chain Analyst to optimize its FMCG distribution network and manage inventory levels.",
                "Analyze demand forecasts and inventory data|Coordinate with suppliers and logistics partners|Optimize distribution routes|Generate supply chain performance reports|Support SAP SCM maintenance",
                "MBA or B.E. in Industrial Engineering or Supply Chain|Knowledge of SAP SCM or similar ERP|Strong Excel and data analysis skills|Understanding of demand planning|Good coordination skills",
                "MBA", "2026-05-26", "2026-06-26", false),

            job("Dietitian / Nutritionist", "Healthkart", "Gurgaon, India", "Full-Time",
                "₹4,00,000 - ₹7,00,000/yr", "0-2 years",
                "Nutrition Science,Meal Planning,Clinical Dietetics,Patient Counseling,Health Education",
                "Healthkart is hiring Dietitians to provide expert nutritional guidance, create personalized meal plans, and help customers achieve their health goals.",
                "Conduct nutritional assessments and consultations|Develop personalized diet and meal plans|Educate clients on healthy eating habits|Collaborate with fitness and medical teams|Create nutrition-related content",
                "B.Sc./M.Sc. in Nutrition and Dietetics|RD credential preferred|Knowledge of clinical dietetics|Strong communication and counseling skills|Passion for health and wellness",
                "Medical", "2026-05-30", "2026-06-30", true),

            job("Computer Science Lecturer", "Manipal University", "Manipal, India", "Full-Time",
                "₹6,00,000 - ₹10,00,000/yr", "0-2 years",
                "Teaching,C++,Data Structures,Algorithms,Research,Curriculum Design",
                "Manipal University is recruiting a Computer Science Lecturer to teach undergraduate courses in programming, data structures, and algorithms.",
                "Teach undergraduate CS courses|Design course materials and assessments|Mentor and guide students academically|Conduct and publish applied research|Participate in departmental activities",
                "M.Tech or Ph.D. in Computer Science|Strong knowledge of programming and DSA|Good teaching and mentoring skills|Research publications are a plus|Enthusiasm for academic excellence",
                "Engineering", "2026-05-27", "2026-06-27", false)
        );
    }

    private Job job(String title, String company, String location, String type,
                    String salary, String experience, String skills, String description,
                    String responsibilities, String requirements,
                    String category, String postedDate, String deadline, boolean remote) {
        Job j = new Job();
        j.setTitle(title);
        j.setCompany(company);
        j.setLocation(location);
        j.setType(type);
        j.setSalary(salary);
        j.setExperience(experience);
        j.setSkills(skills);
        j.setDescription(description);
        j.setResponsibilities(responsibilities);
        j.setRequirements(requirements);
        j.setCategory(category);
        j.setPostedDate(postedDate);
        j.setDeadline(deadline);
        j.setRemote(remote);
        return j;
    }
}

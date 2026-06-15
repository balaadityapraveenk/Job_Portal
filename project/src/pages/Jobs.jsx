import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/Authenticate';
import { API_BASE_URL } from '../config/api';
import './jobs.css';

/* ─────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────── */
function ri(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick(arr)    { return arr[Math.floor(Math.random() * arr.length)]; }
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ─────────────────────────────────────────────────────────────
   ROLE POOL  (48 roles)
───────────────────────────────────────────────────────────── */
const POOL = [
  { title:'Software Engineer',            level:'entry',  desc:'Design, develop and maintain scalable software systems. Work in agile teams to ship production-ready features, participate in code reviews, and contribute to technical architecture decisions.',                          skills:'Java · Python · REST APIs · Git' },
  { title:'Senior Software Engineer',     level:'senior', desc:'Lead end-to-end design of complex software modules, mentor junior engineers, and drive code quality standards. Own technical roadmaps and collaborate with product and design cross-functionally.',                       skills:'System Design · Microservices · Java · AWS' },
  { title:'Full Stack Developer',         level:'mid',    desc:'Build and maintain both client-side and server-side components of web applications. Translate UI/UX wireframes into responsive code and integrate with backend services and third-party APIs.',                           skills:'React · Node.js · MongoDB · REST APIs' },
  { title:'Frontend Developer',           level:'mid',    desc:'Craft pixel-perfect, performant user interfaces using modern JavaScript frameworks. Collaborate with designers to implement beautiful, accessible, and responsive web experiences across devices.',                         skills:'React · TypeScript · CSS · Figma' },
  { title:'Backend Developer',            level:'mid',    desc:'Develop robust server-side logic, databases and APIs that power product features. Ensure high performance, availability and security of backend systems at scale in production environments.',                             skills:'Node.js · Python · PostgreSQL · Docker' },
  { title:'DevOps Engineer',              level:'mid',    desc:'Build and maintain CI/CD pipelines, infrastructure-as-code and monitoring systems. Enable development teams to ship faster and more reliably through automation and best-in-class cloud tooling.',                        skills:'Kubernetes · Terraform · AWS · Jenkins' },
  { title:'Cloud Solutions Architect',    level:'senior', desc:'Design cloud-native architectures on AWS, Azure or GCP to meet scalability and cost goals. Guide engineering teams in cloud migration strategies, best practices, and disaster recovery planning.',                      skills:'AWS · Azure · GCP · Kubernetes · Terraform' },
  { title:'Site Reliability Engineer',    level:'senior', desc:'Ensure high availability and reliability of production systems through proactive monitoring, incident response and capacity planning. Build tooling to reduce toil and improve developer productivity.',                   skills:'Go · Prometheus · Kubernetes · Linux' },
  { title:'Data Scientist',               level:'mid',    desc:'Analyze large and complex datasets to uncover actionable business insights. Develop and deploy ML models that drive product decisions and operational efficiency across the organisation.',                                skills:'Python · TensorFlow · SQL · Spark' },
  { title:'Data Analyst',                level:'entry',  desc:'Transform raw data into clear, actionable reports and dashboards for stakeholders. Work with cross-functional teams to define KPIs and measure product and business performance using analytics tools.',                   skills:'SQL · Tableau · Python · Excel' },
  { title:'Machine Learning Engineer',    level:'senior', desc:'Design and implement end-to-end ML pipelines from data ingestion to model serving. Optimise model performance, conduct A/B testing, and collaborate with research scientists on production deployment.',                  skills:'PyTorch · MLflow · Python · Spark' },
  { title:'AI Research Scientist',        level:'senior', desc:'Conduct cutting-edge research in deep learning, NLP or computer vision. Publish findings and translate research into production-ready systems that create measurable real-world impact.',                                  skills:'PyTorch · Research · NLP · Computer Vision' },
  { title:'Product Manager',              level:'senior', desc:'Define product vision, strategy and roadmap based on user research and business objectives. Collaborate with engineering, design and stakeholders to prioritise and deliver impactful customer-facing features.',         skills:'Product Strategy · Agile · Analytics · SQL' },
  { title:'Technical Program Manager',    level:'senior', desc:'Manage large-scale, cross-functional technical initiatives from inception to launch. Drive alignment, remove blockers, and communicate progress to leadership and stakeholders at all levels.',                            skills:'Project Management · JIRA · Agile · Risk' },
  { title:'Scrum Master',                level:'mid',    desc:'Facilitate agile ceremonies and coach teams in Scrum practices. Remove impediments, foster a culture of continuous improvement, and ensure delivery of value each sprint cycle.',                                          skills:'Scrum · JIRA · Kanban · Agile Coaching' },
  { title:'UX Designer',                 level:'mid',    desc:'Create intuitive, user-centred designs through research, wireframing and prototyping. Conduct usability testing and iterate based on feedback to deliver exceptional digital experiences.',                                 skills:'Figma · User Research · Prototyping · Sketch' },
  { title:'UI Developer',                level:'entry',  desc:'Implement design systems and reusable UI components in close collaboration with designers. Ensure cross-browser compatibility, accessibility compliance, and visual consistency across products.',                         skills:'React · CSS · Storybook · Figma' },
  { title:'UX Researcher',               level:'mid',    desc:'Plan and conduct qualitative and quantitative user research studies. Synthesise findings into clear insights that inform product and design decisions at every stage of development.',                                    skills:'User Research · Survey Tools · Analytics' },
  { title:'Android Developer',           level:'mid',    desc:'Build high-quality Android applications used by millions of users globally. Optimise for performance, battery efficiency and diverse device configurations across the Android ecosystem.',                                  skills:'Kotlin · Jetpack Compose · Android SDK · Git' },
  { title:'iOS Developer',               level:'mid',    desc:'Develop feature-rich iOS applications with clean architecture and smooth user experience. Work closely with backend teams to integrate REST APIs, push notifications, and third-party SDKs.',                            skills:'Swift · SwiftUI · Xcode · Core Data' },
  { title:'QA Engineer',                level:'entry',  desc:'Design and execute test plans, test cases and bug reports to ensure product quality. Work across the software development lifecycle to catch defects early and reduce production incidents.',                               skills:'Selenium · JIRA · Manual Testing · SQL' },
  { title:'Test Automation Engineer',    level:'mid',    desc:'Build robust automated test frameworks for web, API and mobile applications. Integrate tests into CI/CD pipelines and maintain high test coverage across all critical user paths.',                                        skills:'Selenium · Cypress · Pytest · Jenkins' },
  { title:'Cybersecurity Analyst',       level:'mid',    desc:'Monitor, detect and respond to security threats across enterprise systems. Conduct vulnerability assessments, penetration testing, and ensure compliance with security frameworks and regulations.',                       skills:'SIEM · Pen Testing · ISO 27001 · Python' },
  { title:'Security Engineer',           level:'senior', desc:'Design and implement security architecture for cloud and on-prem systems. Lead security reviews, threat modelling exercises and incident response processes to protect company assets.',                                   skills:'Network Security · PKI · AWS Security · OWASP' },
  { title:'Business Analyst',            level:'entry',  desc:'Bridge the gap between business requirements and technical solutions. Gather, document and prioritise requirements through stakeholder workshops, interviews, and business process analysis.',                            skills:'SQL · Visio · Agile · Requirements Gathering' },
  { title:'SAP Consultant',              level:'mid',    desc:'Configure and optimise SAP modules to meet business process requirements. Lead workshops with business users and provide functional specifications for custom development and integration.',                                 skills:'SAP S/4HANA · ABAP · SAP SD · SAP FI' },
  { title:'Database Administrator',      level:'mid',    desc:'Manage, maintain and optimise relational and NoSQL databases in production. Ensure high availability, disaster recovery and peak performance of database systems supporting critical business operations.',               skills:'Oracle DB · PostgreSQL · MySQL · MongoDB' },
  { title:'Network Engineer',            level:'mid',    desc:'Design, configure and troubleshoot enterprise network infrastructure including LAN, WAN, SD-WAN and cloud networking. Ensure network security, uptime and adherence to performance SLAs.',                              skills:'Cisco · BGP · OSPF · Firewall · SD-WAN' },
  { title:'Solutions Architect',         level:'senior', desc:'Understand customer business challenges and design comprehensive technology solutions to address them. Create technical proposals, proof-of-concepts and present to executive and technical stakeholders.',              skills:'Cloud Architecture · Presales · AWS · Solution Design' },
  { title:'Technical Support Engineer',  level:'entry',  desc:'Provide expert technical assistance to enterprise customers via email, chat and phone. Diagnose complex product issues, escalate appropriately and contribute to knowledge-base documentation.',                          skills:'Troubleshooting · SQL · Linux · JIRA' },
  { title:'Sales Engineer',              level:'mid',    desc:'Partner with the sales team to demonstrate product capabilities and address technical objections. Run proof-of-concept engagements and tailor demos to specific customer use cases and verticals.',                      skills:'Presales · Product Demo · CRM · APIs' },
  { title:'Customer Success Manager',    level:'mid',    desc:'Manage a portfolio of enterprise accounts to drive product adoption, satisfaction and renewal. Conduct executive business reviews and identify expansion opportunities within the account base.',                         skills:'CRM · Account Management · SaaS · Presentations' },
  { title:'HR Business Partner',         level:'mid',    desc:'Partner with business leaders to implement HR strategies that attract, develop and retain top talent. Drive initiatives across performance management, culture and organisational design.',                               skills:'HRIS · Talent Management · Compensation · Analytics' },
  { title:'Finance Analyst',             level:'entry',  desc:'Support financial planning, reporting and analysis to inform business decisions. Prepare monthly financial statements, variance analyses and budget forecasts for leadership review.',                                    skills:'Excel · SAP · FP&A · Power BI' },
  { title:'Marketing Analyst',           level:'entry',  desc:'Analyse marketing campaign performance across digital, social and email channels. Provide data-driven recommendations to optimise spend and improve customer acquisition metrics.',                                       skills:'Google Analytics · SQL · Excel · Power BI' },
  { title:'Technical Writer',            level:'entry',  desc:'Create clear, concise and accurate technical documentation including API guides, user manuals and release notes. Work closely with engineers and PMs to explain complex features to diverse audiences.',                  skills:'Markdown · Confluence · API Docs · Git' },
  { title:'Embedded Systems Engineer',   level:'mid',    desc:'Design firmware and low-level software for embedded processors and microcontrollers. Work closely with hardware teams to optimise for performance, power consumption and long-term reliability.',                        skills:'C · RTOS · ARM Cortex · UART/SPI/I2C' },
  { title:'Blockchain Developer',        level:'mid',    desc:'Design and implement smart contracts and decentralised applications on blockchain platforms. Research emerging technologies and integrate them into enterprise-grade products and workflows.',                             skills:'Solidity · Web3.js · Ethereum · Hyperledger' },
  { title:'IT Project Manager',          level:'senior', desc:'Plan, execute and close complex technology projects on time and within budget. Coordinate across multiple teams, manage risks and report progress clearly to senior leadership and clients.',                             skills:'PMP · JIRA · MS Project · Risk Management' },
  { title:'Power BI Developer',          level:'mid',    desc:'Create interactive dashboards and analytical reports using Power BI and DAX. Work with data engineers to model data from multiple sources and deliver compelling insights to business stakeholders.',                    skills:'Power BI · DAX · SQL · Azure Data Factory' },
  { title:'Digital Marketing Manager',   level:'senior', desc:'Lead integrated digital marketing campaigns across SEO, SEM, social media and content. Drive brand visibility, lead generation and conversion optimisation at enterprise scale.',                                       skills:'SEO · Google Ads · Analytics · HubSpot' },
  { title:'Supply Chain Analyst',        level:'entry',  desc:'Optimise inventory levels, supplier relationships and logistics operations using data analysis. Identify bottlenecks in the supply chain and recommend efficiency improvements to reduce costs.',                        skills:'ERP · SQL · Logistics · Excel' },
  { title:'Operations Manager',          level:'senior', desc:'Oversee day-to-day business operations, ensuring processes are efficient, scalable and aligned with company strategy. Lead operations teams and drive a culture of continuous process improvement.',                    skills:'Operations · Six Sigma · Leadership · ERP' },
  { title:'Research Scientist',          level:'senior', desc:'Conduct foundational and applied research in NLP, computer vision or distributed systems. Publish at top-tier venues and collaborate with product teams to transfer research breakthroughs into product.',              skills:'Research · Python · PyTorch · Statistics' },
  { title:'Legal & Compliance Analyst',  level:'mid',    desc:"Ensure the company's operations comply with applicable laws, regulations and internal policies. Draft policies, conduct risk assessments and train teams on compliance obligations.",                                   skills:'Contract Law · GDPR · Compliance · Risk Mgmt' },
  /* ── INTERNSHIP ── */
  { title:'Software Engineering Intern', level:'intern', desc:'Work on real engineering challenges alongside experienced mentors over a structured programme. Build and ship features, attend design reviews and present your work at the end of your internship.',                    skills:'Python · Java · Git · Data Structures' },
  { title:'Data Science Intern',         level:'intern', desc:'Explore large datasets, build exploratory analyses and assist in developing machine learning models. Gain hands-on experience with the full data science workflow from raw data to insight.',                             skills:'Python · Pandas · SQL · Scikit-learn' },
  { title:'Product Management Intern',   level:'intern', desc:'Support product managers in defining feature requirements, writing PRDs and conducting user research. Get end-to-end exposure to how products are built from concept to launch in a fast-paced team.',                   skills:'Product Thinking · Analytics · Figma · SQL' },
];

/* Salary generator */
const SAL = {
  intern:  () => `₹${ri(30,70)},000 – ₹${ri(72,95)},000 / month`,
  entry:   () => `₹${ri(4,10)} – ₹${ri(12,18)} LPA`,
  mid:     () => `₹${ri(14,22)} – ₹${ri(24,35)} LPA`,
  senior:  () => `₹${ri(28,40)} – ₹${ri(42,65)} LPA`,
};

const LOCS = [
  'Bengaluru','Hyderabad','Pune','Chennai','Noida',
  'Mumbai','Gurugram','Kolkata','Delhi NCR','Remote',
  'Bengaluru / Remote','Hyderabad / Remote','Pan India',
];

/* Type weights: intern→Internship, others weighted */
const typeFor = (level) => {
  if (level === 'intern') return 'Internship';
  const w = ['Full-Time','Full-Time','Full-Time','Full-Time','Full-Time','Part-Time','Part-Time'];
  return w[Math.floor(Math.random() * w.length)];
};

/* ─────────────────────────────────────────────────────────────
   COMPANY DEFINITIONS
───────────────────────────────────────────────────────────── */
// logoSrcs: [simpleIconsCDN, googleFaviconCDN]  — tried in order, falls back to initials
const mkLogo = (si, domain) => [
  si ? `https://cdn.simpleicons.org/${si}` : null,
  `https://www.google.com/s2/favicons?sz=128&domain_url=${domain}`,
].filter(Boolean);

const COMPANY_DEF = [
  { id:1,  name:'Google',        initials:'G',   color:'#4285F4', bg:'#E8F0FE', textCol:'#fff', industry:'Technology',   hq:'Mountain View, CA', employees:'180,000+', logoSrcs: mkLogo('google',         'google.com') },
  { id:2,  name:'Microsoft',     initials:'MS',  color:'#00A4EF', bg:'#E3F5FD', textCol:'#fff', industry:'Technology',   hq:'Redmond, WA',       employees:'220,000+', logoSrcs: mkLogo('microsoft',      'microsoft.com') },
  { id:3,  name:'Meta',          initials:'M',   color:'#0866FF', bg:'#E7EFFF', textCol:'#fff', industry:'Technology',   hq:'Menlo Park, CA',    employees:'87,000+',  logoSrcs: mkLogo('meta',           'meta.com') },
  { id:4,  name:'Amazon',        initials:'A',   color:'#FF9900', bg:'#FFF4E0', textCol:'#fff', industry:'Technology',   hq:'Seattle, WA',       employees:'1.5M+',    logoSrcs: mkLogo('amazon',         'amazon.com') },
  { id:5,  name:'Deloitte',      initials:'DL',  color:'#006B6B', bg:'#E5F3F3', textCol:'#fff', industry:'Consulting',   hq:'London, UK',        employees:'415,000+', logoSrcs: mkLogo('deloitte',       'deloitte.com') },
  { id:6,  name:'TCS',           initials:'TCS', color:'#003087', bg:'#E5EAF4', textCol:'#fff', industry:'IT Services',  hq:'Mumbai, India',     employees:'600,000+', logoSrcs: mkLogo('tcs',            'tcs.com') },
  { id:7,  name:'Tech Mahindra', initials:'TM',  color:'#C8101E', bg:'#FAEAEB', textCol:'#fff', industry:'IT Services',  hq:'Pune, India',       employees:'160,000+', logoSrcs: mkLogo('techmahindra',   'techmahindra.com') },
  { id:8,  name:'Infosys',       initials:'IN',  color:'#007CC3', bg:'#E3F2FB', textCol:'#fff', industry:'IT Services',  hq:'Bengaluru, India',  employees:'343,000+', logoSrcs: mkLogo('infosys',        'infosys.com') },
  { id:9,  name:'Wipro',         initials:'WI',  color:'#341C5C', bg:'#EDE8F5', textCol:'#fff', industry:'IT Services',  hq:'Bengaluru, India',  employees:'240,000+', logoSrcs: mkLogo('wipro',          'wipro.com') },
  { id:10, name:'Accenture',     initials:'AC',  color:'#A100FF', bg:'#F3E5FF', textCol:'#fff', industry:'Consulting',   hq:'Dublin, Ireland',   employees:'750,000+', logoSrcs: mkLogo('accenture',      'accenture.com') },
  { id:11, name:'IBM',           initials:'IBM', color:'#1F70C1', bg:'#E4EFF9', textCol:'#fff', industry:'Technology',   hq:'Armonk, NY',        employees:'288,000+', logoSrcs: mkLogo('ibm',            'ibm.com') },
  { id:12, name:'Cognizant',     initials:'CG',  color:'#1A6FBF', bg:'#E3EEF9', textCol:'#fff', industry:'IT Services',  hq:'Teaneck, NJ',       employees:'350,000+', logoSrcs: mkLogo('cognizant',      'cognizant.com') },
  { id:13, name:'Capgemini',     initials:'CAP', color:'#0052CC', bg:'#E5ECFA', textCol:'#fff', industry:'Consulting',   hq:'Paris, France',     employees:'360,000+', logoSrcs: mkLogo('capgemini',      'capgemini.com') },
  { id:14, name:'Oracle',        initials:'OR',  color:'#C74634', bg:'#FAE8E6', textCol:'#fff', industry:'Technology',   hq:'Austin, TX',        employees:'164,000+', logoSrcs: mkLogo('oracle',         'oracle.com') },
  { id:15, name:'Flipkart',      initials:'FK',  color:'#F6732E', bg:'#FEF0E8', textCol:'#fff', industry:'Technology',   hq:'Bengaluru, India',  employees:'50,000+',  logoSrcs: mkLogo('flipkart',       'flipkart.com') },
  { id:16, name:'HCL Tech',      initials:'HCL', color:'#005BAA', bg:'#E4EEF8', textCol:'#fff', industry:'IT Services',  hq:'Noida, India',      employees:'225,000+', logoSrcs: mkLogo('hcltech',        'hcltech.com') },
  { id:17, name:'Salesforce',    initials:'SF',  color:'#00A1E0', bg:'#E3F4FC', textCol:'#fff', industry:'Technology',   hq:'San Francisco, CA', employees:'73,000+',  logoSrcs: mkLogo('salesforce',     'salesforce.com') },
  { id:18, name:'Adobe',         initials:'AD',  color:'#FF0000', bg:'#FFE5E5', textCol:'#fff', industry:'Technology',   hq:'San Jose, CA',      employees:'29,000+',  logoSrcs: mkLogo('adobe',          'adobe.com') },
  { id:19, name:'Samsung',       initials:'SAM', color:'#1428A0', bg:'#E5E8F7', textCol:'#fff', industry:'Electronics',  hq:'Suwon, South Korea',employees:'270,000+', logoSrcs: mkLogo('samsung',        'samsung.com') },
  { id:20, name:'Paytm',         initials:'PT',  color:'#00B9F1', bg:'#E3F7FD', textCol:'#fff', industry:'Fintech',      hq:'Noida, India',      employees:'12,000+',  logoSrcs: mkLogo('paytm',          'paytm.com') },
  { id:21, name:'Zomato',        initials:'Z',   color:'#E23744', bg:'#FDECED', textCol:'#fff', industry:'Technology',   hq:'Gurugram, India',   employees:'5,000+',   logoSrcs: mkLogo('zomato',         'zomato.com') },
  { id:22, name:'Swiggy',        initials:'SW',  color:'#FC8019', bg:'#FEF3E8', textCol:'#fff', industry:'Technology',   hq:'Bengaluru, India',  employees:'5,000+',   logoSrcs: mkLogo('swiggy',         'swiggy.com') },
  { id:23, name:'Razorpay',      initials:'RP',  color:'#3395FF', bg:'#E8F3FF', textCol:'#fff', industry:'Fintech',      hq:'Bengaluru, India',  employees:'3,500+',   logoSrcs: mkLogo('razorpay',       'razorpay.com') },
  { id:24, name:'PhonePe',       initials:'PP',  color:'#5F259F', bg:'#EEE5F7', textCol:'#fff', industry:'Fintech',      hq:'Bengaluru, India',  employees:'4,000+',   logoSrcs: mkLogo('phonepe',        'phonepe.com') },
  { id:25, name:'Zoho',          initials:'ZH',  color:'#E42527', bg:'#FDEAEA', textCol:'#fff', industry:'Technology',   hq:'Chennai, India',    employees:'12,000+',  logoSrcs: mkLogo('zoho',           'zoho.com') },
  { id:26, name:'Freshworks',    initials:'FW',  color:'#25C16F', bg:'#E7F9F1', textCol:'#fff', industry:'Technology',   hq:'San Mateo, CA',     employees:'7,000+',   logoSrcs: mkLogo('freshworks',     'freshworks.com') },
  { id:27, name:'Zerodha',       initials:'ZD',  color:'#387ED1', bg:'#EAF1FB', textCol:'#fff', industry:'Fintech',      hq:'Bengaluru, India',  employees:'1,000+',   logoSrcs: mkLogo('zerodha',        'zerodha.com') },
  { id:28, name:'Nykaa',         initials:'NY',  color:'#FC2779', bg:'#FEEAF3', textCol:'#fff', industry:'E-commerce',   hq:'Mumbai, India',     employees:'3,000+',   logoSrcs: mkLogo('nykaa',          'nykaa.com') },
  { id:29, name:'Ola',           initials:'OL',  color:'#25A244', bg:'#E7F6EC', textCol:'#fff', industry:'Technology',   hq:'Bengaluru, India',  employees:'7,000+',   logoSrcs: mkLogo('ola',            'olacabs.com') },
  { id:30, name:'MakeMyTrip',    initials:'MMT', color:'#D72E2A', bg:'#FAEBEB', textCol:'#fff', industry:'Technology',   hq:'Gurugram, India',   employees:'4,000+',   logoSrcs: mkLogo('makemytrip',     'makemytrip.com') },
  { id:31, name:'Airtel',        initials:'AT',  color:'#ED1C24', bg:'#FDEAEA', textCol:'#fff', industry:'Telecom',      hq:'New Delhi, India',  employees:'20,000+',  logoSrcs: mkLogo('airtel',         'airtel.in') },
  { id:32, name:'Myntra',        initials:'MN',  color:'#FF3F6C', bg:'#FFEEF3', textCol:'#fff', industry:'E-commerce',   hq:'Bengaluru, India',  employees:'5,000+',   logoSrcs: mkLogo('myntra',         'myntra.com') },
  { id:33, name:'HDFC Bank',     initials:'HDFC',color:'#004C8F', bg:'#E5EEF8', textCol:'#fff', industry:'Banking',      hq:'Mumbai, India',     employees:'177,000+', logoSrcs: mkLogo('hdfcbank',       'hdfcbank.com') },
  { id:34, name:"BYJU'S",        initials:'BY',  color:'#3D5588', bg:'#EAEEF5', textCol:'#fff', industry:'EdTech',       hq:'Bengaluru, India',  employees:'10,000+',  logoSrcs: mkLogo('byjus',          'byjus.com') },
  { id:35, name:'Reliance',      initials:'RI',  color:'#003C8F', bg:'#E5EAF8', textCol:'#fff', industry:'Conglomerate', hq:'Mumbai, India',     employees:'236,000+', logoSrcs: mkLogo(null,             'ril.com') },
];

/* ─────────────────────────────────────────────────────────────
   GENERATE COMPANIES with random role slices (module-level = stable)
───────────────────────────────────────────────────────────── */
const COMPANIES = (() => {
  const shuffled = shuffle(POOL);
  return COMPANY_DEF.map((def, ci) => {
    const count = ri(15, 35);
    const roles = [];
    for (let i = 0; i < count; i++) {
      const base = shuffled[(ci * 11 + i) % shuffled.length];
      roles.push({
        ...base,
        id: `${def.id}-${i}`,
        type: typeFor(base.level),
        location: pick(LOCS),
        salary: SAL[base.level](),
      });
    }
    return { ...def, roles };
  });
})();

const INDUSTRIES = ['All', ...Array.from(new Set(COMPANY_DEF.map(c => c.industry))).sort()];

const TYPE_BADGE = {
  'Full-Time' : 'badge-emerald',
  'Part-Time' : 'badge-amber',
  'Internship': 'badge-indigo',
};

/* ─────────────────────────────────────────────────────────────
   COMPANY LOGO  –  3-tier fallback: SimpleIcons → GoogleFavicon → Initials
───────────────────────────────────────────────────────────── */
function Logo({ company, size = 54 }) {
  const srcs = company.logoSrcs || [];
  const [srcIdx, setSrcIdx] = React.useState(0);

  const radius = size > 50 ? 18 : 13;
  const fontSize = size > 50
    ? Math.max(11, Math.floor(size * (company.initials.length > 2 ? 0.22 : 0.30)))
    : Math.max(9, Math.floor(size * (company.initials.length > 2 ? 0.24 : 0.32)));

  const currentSrc = srcIdx < srcs.length ? srcs[srcIdx] : null;
  const isGoogleFavicon = currentSrc && currentSrc.includes('google.com/s2/favicons');

  return (
    <div
      className="co-logo"
      style={{
        width: size, height: size,
        background: currentSrc
          ? '#ffffff'
          : `linear-gradient(135deg, ${company.color}ee, ${company.color}bb)`,
        borderRadius: radius,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
        boxShadow: `0 4px 16px ${company.color}44`,
        border: currentSrc ? `1.5px solid ${company.color}22` : 'none',
        overflow: 'hidden',
      }}
    >
      {currentSrc ? (
        <img
          key={currentSrc}
          src={currentSrc}
          alt={company.name}
          onError={() => setSrcIdx(i => i + 1)}
          style={{
            width:  isGoogleFavicon ? size * 0.58 : size * 0.72,
            height: isGoogleFavicon ? size * 0.58 : size * 0.72,
            objectFit: 'contain',
            display: 'block',
          }}
        />
      ) : (
        <span style={{
          color: '#ffffff',
          fontWeight: 900,
          fontSize,
          letterSpacing: company.initials.length > 2 ? '0px' : '1px',
          fontFamily: 'inherit',
          lineHeight: 1,
          userSelect: 'none',
        }}>
          {company.initials}
        </span>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────── */
export default function Jobs() {
  const { user, authenticatedFetch } = useAuth();

  const [search,     setSearch]     = useState('');
  const [industry,   setIndustry]   = useState('All');
  const [selected,   setSelected]   = useState(null);   // company detail page
  const [typeFilter, setTypeFilter] = useState('All');
  const [roleQ,      setRoleQ]      = useState('');
  const [applying,   setApplying]   = useState(null);
  const [applied,    setApplied]    = useState(new Set());
  const [toast,      setToast]      = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3800);
  };

  const openCompany = (c) => {
    setSelected(c);
    setTypeFilter('All');
    setRoleQ('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goBack = () => { setSelected(null); };

  /* ── filtered companies ── */
  const companies = useMemo(() => {
    const q = search.toLowerCase().trim();
    return COMPANIES.filter(c => {
      const okSearch = !q || c.name.toLowerCase().includes(q)
                          || c.industry.toLowerCase().includes(q)
                          || c.roles.some(r => r.title.toLowerCase().includes(q));
      const okInd = industry === 'All' || c.industry === industry;
      return okSearch && okInd;
    });
  }, [search, industry]);

  /* ── filtered roles inside company detail ── */
  const roles = useMemo(() => {
    if (!selected) return [];
    const q = roleQ.toLowerCase().trim();
    return selected.roles.filter(r => {
      const okType = typeFilter === 'All' || r.type === typeFilter;
      const okQ    = !q || r.title.toLowerCase().includes(q) || r.location.toLowerCase().includes(q);
      return okType && okQ;
    });
  }, [selected, typeFilter, roleQ]);

  /* ── apply ── */
  const handleApply = async (company, role) => {
    if (!user) { showToast('Please log in to apply.', 'error'); return; }
    if (applied.has(role.id)) return;
    setApplying(role.id);
    try {
      const aRes = await authenticatedFetch(`${API_BASE_URL}/applications`, {
        method: 'POST',
        body: JSON.stringify({
          status: 'Applied',
          user: { id: user?.id },
          job: {
            id: isNaN(Number(role.id)) ? null : Number(role.id),
            title: role.title,
            company: company.name,
            location: role.location,
            salary: role.salary,
            category: 'Engineering',
            type: role.type,
            remote: role.location.toLowerCase().includes('remote'),
            experience: role.level === 'intern' ? 'Fresher'
                      : role.level === 'entry'  ? '0-2 years'
                      : role.level === 'mid'    ? '2-5 years' : '5+ years',
            skills: role.skills.replace(/ · /g, ', '),
            description: role.desc,
          },
        }),
      });
      if (!aRes.ok) {
        const text = await aRes.text();
        let msg = text;
        try {
          const parsed = JSON.parse(text);
          msg = parsed.detail || parsed.message || text;
        } catch (e) {}
        throw new Error(msg || 'Application failed.');
      }

      setApplied(prev => new Set([...prev, role.id]));
      showToast(`✅ Applied for "${role.title}" at ${company.name}!`);
    } catch (e) {
      showToast(`❌ ${e.message}`, 'error');
    } finally {
      setApplying(null);
    }
  };

  /* ══════════════════════════════════════════════════
     COMPANY DETAIL  –  full page
  ══════════════════════════════════════════════════ */
  if (selected) {
    const c = selected;
    const counts = {
      All: c.roles.length,
      'Full-Time':  c.roles.filter(r => r.type === 'Full-Time').length,
      'Part-Time':  c.roles.filter(r => r.type === 'Part-Time').length,
      'Internship': c.roles.filter(r => r.type === 'Internship').length,
    };

    return (
      <div className="cj-page">
        {toast && <div className={`cj-toast cj-toast--${toast.type}`}>{toast.msg}</div>}

        {/* ── HERO BANNER ── */}
        <div className="cj-hero" style={{ borderTop: `5px solid ${c.color}` }}>
          <div className="cj-hero-inner">
            <button className="cj-back" onClick={goBack}>
              ← Back to Companies
            </button>

            <div className="cj-hero-body">
              <Logo company={c} size={90} />
              <div className="cj-hero-text">
                <h1 className="cj-co-name">{c.name}</h1>
                <div className="cj-co-tags">
                  <span className="cj-industry-tag" style={{ background: c.bg, color: c.color }}>
                    {c.industry}
                  </span>
                  <span className="cj-meta-tag">📍 {c.hq}</span>
                  <span className="cj-meta-tag">👥 {c.employees} employees</span>
                </div>
              </div>

              {/* type stats */}
              <div className="cj-type-stats">
                {['Full-Time','Part-Time','Internship'].map(t => (
                  <div key={t} className="cj-type-stat">
                    <span className="cj-type-stat-n" style={{ color: c.color }}>{counts[t]}</span>
                    <span className="cj-type-stat-l">{t}</span>
                  </div>
                ))}
                <div className="cj-type-stat cj-type-stat--total" style={{ background: c.bg }}>
                  <span className="cj-type-stat-n" style={{ color: c.color }}>{c.roles.length}</span>
                  <span className="cj-type-stat-l">Total Open</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── FILTERS ── */}
        <div className="cj-filters-wrap">
          <div className="cj-filters-inner">
            <div className="cj-search-wrap">
              <span className="cj-search-icon">🔍</span>
              <input
                className="cj-search"
                placeholder="Search roles or locations…"
                value={roleQ}
                onChange={e => setRoleQ(e.target.value)}
              />
              {roleQ && <button className="cj-search-x" onClick={() => setRoleQ('')}>✕</button>}
            </div>
            <div className="cj-type-tabs">
              {['All','Full-Time','Part-Time','Internship'].map(t => (
                <button
                  key={t}
                  className={`cj-tab ${typeFilter === t ? 'cj-tab--active' : ''}`}
                  style={typeFilter === t ? { borderColor: c.color, color: c.color, background: c.bg } : {}}
                  onClick={() => setTypeFilter(t)}
                >
                  {t} <span className="cj-tab-count">{counts[t] ?? c.roles.length}</span>
                </button>
              ))}
            </div>
          </div>
          <p className="cj-showing">
            Showing <strong>{roles.length}</strong> of <strong>{c.roles.length}</strong> positions
            {!user && <span className="cj-login-hint"> — log in to apply</span>}
          </p>
        </div>

        {/* ── ROLE LIST ── */}
        <div className="cj-roles-wrap">
          {roles.length === 0 ? (
            <div className="cj-empty">
              <span className="cj-empty-icon">🔍</span>
              <h3>No roles match your filters</h3>
              <button className="btn-secondary" onClick={() => { setTypeFilter('All'); setRoleQ(''); }}>
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="cj-roles-grid">
              {roles.map((role, idx) => {
                const isApplied  = applied.has(role.id);
                const isApplying = applying === role.id;
                return (
                  <div
                    key={role.id}
                    className={`cj-role-card ${isApplied ? 'cj-role-card--applied' : ''}`}
                    style={{ animationDelay: `${Math.min(idx * 0.035, 0.5)}s` }}
                  >
                    {/* card header */}
                    <div className="cj-rc-head" style={{ borderLeft: `4px solid ${c.color}` }}>
                      <div className="cj-rc-badges">
                        <span className={`cj-badge ${TYPE_BADGE[role.type]}`}>{role.type}</span>
                        {role.location.toLowerCase().includes('remote') &&
                          <span className="cj-badge cj-badge--cyan">🌐 Remote</span>}
                      </div>
                      {isApplied && <span className="cj-applied-pill">✓ Applied</span>}
                    </div>

                    {/* card body */}
                    <div className="cj-rc-body">
                      <div className="cj-rc-title-row">
                        <Logo company={c} size={50} />
                        <div>
                          <h3 className="cj-rc-title">{role.title}</h3>
                          <span className="cj-rc-co">{c.name}</span>
                        </div>
                      </div>

                      <p className="cj-rc-desc">{role.desc}</p>

                      <div className="cj-rc-info">
                        <span className="cj-rc-info-item">📍 {role.location}</span>
                        <span className="cj-rc-info-item cj-salary">💰 {role.salary}</span>
                        <span className="cj-rc-info-item">🛠️ {role.skills}</span>
                        <span className="cj-rc-info-item">🎓{' '}
                          {role.level === 'intern' ? 'Fresher / No exp. required'
                          : role.level === 'entry' ? '0–2 years experience'
                          : role.level === 'mid'   ? '2–5 years experience'
                          :                          '5+ years experience'}
                        </span>
                      </div>
                    </div>

                    {/* card footer */}
                    <div className="cj-rc-foot">
                      {isApplied ? (
                        <span className="cj-applied-msg">✅ Application Submitted</span>
                      ) : (
                        <button
                          className="cj-apply-btn"
                          style={{ background: isApplying ? '#94a3b8' : c.color }}
                          onClick={() => handleApply(c, role)}
                          disabled={isApplying || !user}
                          title={!user ? 'Log in to apply' : ''}
                        >
                          {isApplying
                            ? <><span className="cj-spinner" /> Applying…</>
                            : 'Apply Now →'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════════════════════
     COMPANY GRID  –  default view
  ══════════════════════════════════════════════════ */
  return (
    <div className="cj-page">
      {toast && <div className={`cj-toast cj-toast--${toast.type}`}>{toast.msg}</div>}

      {/* header */}
      <div className="cj-grid-header">
        <div className="section-tag">Company Directory</div>
        <h1 className="cj-grid-title">Top Companies Hiring Now</h1>
        <p className="cj-grid-sub">
          {COMPANIES.length} leading companies · {COMPANIES.reduce((s, c) => s + c.roles.length, 0)}+ open positions across India
        </p>
      </div>


      {/* filters */}
      <div className="cj-grid-filters">
        <div className="cj-search-wrap" style={{ marginBottom: 0, flex: '1 1 260px' }}>
          <span className="cj-search-icon">🔍</span>
          <input
            className="cj-search"
            placeholder="Search companies, industries or roles…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && <button className="cj-search-x" onClick={() => setSearch('')}>✕</button>}
        </div>
        <div className="cj-ind-chips">
          {INDUSTRIES.map(ind => (
            <button
              key={ind}
              className={`cj-ind-chip ${industry === ind ? 'cj-ind-chip--active' : ''}`}
              onClick={() => setIndustry(ind)}
            >{ind}</button>
          ))}
        </div>
      </div>

      {/* company grid */}
      {companies.length === 0 ? (
        <div className="cj-empty">
          <span className="cj-empty-icon">🏢</span>
          <h3>No companies match your search</h3>
          <button className="btn-secondary" onClick={() => { setSearch(''); setIndustry('All'); }}>
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="cj-company-grid">
          {companies.map((c, idx) => (
            <div
              key={c.id}
              className="cj-co-card"
              style={{ animationDelay: `${Math.min(idx * 0.04, 0.6)}s` }}
              onClick={() => openCompany(c)}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && openCompany(c)}
            >
              {/* top colour bar */}
              <div className="cj-co-topbar" style={{ background: c.color }} />

              <div className="cj-co-inner">
                <Logo company={c} size={68} />

                <div className="cj-co-info">
                  <h3 className="cj-co-card-name">{c.name}</h3>
                  <span className="cj-co-industry">{c.industry}</span>
                  <div className="cj-co-metas">
                    <span>📍 {c.hq}</span>
                    <span>👥 {c.employees}</span>
                  </div>
                </div>

                <div className="cj-co-badge" style={{ background: c.bg, color: c.color }}>
                  <span className="cj-co-badge-n">{c.roles.length}</span>
                  <span className="cj-co-badge-l">Open Roles</span>
                </div>
              </div>

              <div className="cj-co-footer" style={{ borderTop: `1px solid ${c.color}18` }}>
                <span className="cj-co-types">
                  {['Full-Time','Part-Time','Internship'].map(t => {
                    const n = c.roles.filter(r => r.type === t).length;
                    return n > 0
                      ? <span key={t} className={`cj-mini-badge ${TYPE_BADGE[t]}`}>{n} {t}</span>
                      : null;
                  })}
                </span>
                <span className="cj-co-view" style={{ color: c.color }}>View Roles →</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

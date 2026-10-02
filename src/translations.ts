export type Language = 'en' | 'de';

export interface TranslationDictionary {
  meta: {
    title: string;
    description: string;
  };
  nav: {
    services: string;
    howItWorks: string;
    whyUs: string;
    faq: string;
    caseAssessment: string;
    switchLangAria: string;
  };
  hero: {
    badge: string;
    titlePart1: string;
    titlePart2: string;
    description: string;
    primaryCta: string;
    secondaryCta: string;
    alertNotice: string;
    independentReview: string;
    confidentialHandling: string;
    noGuarantees: string;
    analysisNodeTitle: string;
    networkTracing: string;
    referenceAddress: string;
    txHash: string;
    technicalStatus: string;
    statusTracingActive: string;
    statusNodeSyncing: string;
    statusAnalyzingPath: string;
    statusMappingAssets: string;
    statusVerifyingNode: string;
    protocolTitle: string;
    protocolDesc: string;
    txTracedTitle: string;
    txTracedSub: string;
    evidenceOrganized: string;
    documentedBadge: string;
  };
  trustPrinciples: {
    confidential: string;
    documentation: string;
    security: string;
    individual: string;
  };
  whoWeHelp: {
    scopeBadge: string;
    title: string;
    subtitle: string;
    card1Title: string;
    card1Desc: string;
    card2Title: string;
    card2Desc: string;
    card3Title: string;
    card3Desc: string;
    card4Title: string;
    card4Desc: string;
  };
  services: {
    badge: string;
    title: string;
    subtitle: string;
    s1Title: string;
    s1Desc: string;
    s2Title: string;
    s2Desc: string;
    s3Title: string;
    s3Desc: string;
    s4Title: string;
    s4Desc: string;
    s5Title: string;
    s5Desc: string;
    s6Title: string;
    s6Desc: string;
  };
  germanySupport: {
    title: string;
    p1: string;
    p2: string;
  };
  platforms: {
    title: string;
    subtitle: string;
    disclaimer: string;
    footnote: string;
  };
  remoteConsultation: {
    title: string;
    subtitle: string;
    notice: string;
    warningLine: string;
    toolsTitle: string;
  };
  process: {
    badge: string;
    title: string;
    subtitle: string;
    step1Title: string;
    step1Desc: string;
    step2Title: string;
    step2Desc: string;
    step3Title: string;
    step3Desc: string;
    step4Title: string;
    step4Desc: string;
    step5Title: string;
    step5Desc: string;
    activeAssessment: string;
    structuredEvidence: string;
    verification: string;
    verifiedBadge: string;
  };
  legalSupport: {
    title: string;
    p1: string;
    p2: string;
  };
  antiScam: {
    tag: string;
    title: string;
    p1: string;
    guaranteeWarning: string;
    neverDiscloseTitle: string;
    sensitiveItems: string[];
    advanceFeeWarning: string;
    deviceControlWarning: string;
  };
  whyTrust: {
    title: string;
    subtitle: string;
    exploreServices: string;
    card1Title: string;
    card1Desc: string;
    card2Title: string;
    card2Desc: string;
    card3Title: string;
    card3Desc: string;
    card4Title: string;
    card4Desc: string;
  };
  importantNotice: {
    title: string;
    p1: string;
    p2: string;
    p3: string;
  };
  form: {
    badge: string;
    title: string;
    description: string;
    emailLabel: string;
    techSupportLabel: string;
    techSupportHours: string;
    hqLabel: string;
    noticeBoxTitle: string;
    noticeBoxText: string;
    successMessage: string;
    fullName: string;
    fullNamePlaceholder: string;
    emailAddress: string;
    emailPlaceholder: string;
    phoneNumber: string;
    phonePlaceholder: string;
    country: string;
    countryPlaceholder: string;
    incidentType: string;
    incidentOptions: {
      trading: string;
      crypto: string;
      impersonation: string;
      unauthorized: string;
      recoveryService: string;
      other: string;
    };
    lossAmount: string;
    lossAmountPlaceholder: string;
    incidentDate: string;
    incidentDatePlaceholder: string;
    paymentMethod: string;
    paymentMethodPlaceholder: string;
    details: string;
    detailsPlaceholder: string;
    submitButton: string;
    disclaimer: string;
    termsAgreement: string;
  };
  footer: {
    aboutText: string;
    noGuaranteeNote: string;
    companyHeading: string;
    resourcesHeading: string;
    aboutUs: string;
    ourTeam: string;
    caseStudies: string;
    contact: string;
    securityBlog: string;
    networkDatabase: string;
    auditingGuides: string;
    faq: string;
    copyright: string;
    badge1: string;
    badge2: string;
    badge3: string;
    privacy: string;
    terms: string;
    amlKyc: string;
    cookies: string;
  };
  pages: {
    about: {
      title: string;
      subtitle: string;
      p1: string;
      p2: string;
      p3: string;
      notice: string;
    };
    team: {
      title: string;
      subtitle: string;
      members: {
        name: string;
        role: string;
        bio: string;
      }[];
    };
    caseStudies: {
      title: string;
      subtitle: string;
      studies: {
        title: string;
        tag: string;
        desc: string;
      }[];
    };
    blog: {
      title: string;
      subtitle: string;
      readMore: string;
      posts: {
        title: string;
        date: string;
        excerpt: string;
      }[];
    };
    database: {
      title: string;
      subtitle: string;
      intro: string;
      stats: {
        label: string;
        value: string;
      }[];
    };
    guides: {
      title: string;
      subtitle: string;
      items: {
        title: string;
        type: string;
        size: string;
      }[];
    };
    faq: {
      title: string;
      subtitle: string;
      items: {
        q: string;
        a: string;
      }[];
    };
    privacy: {
      title: string;
      subtitle: string;
      p1: string;
      noticeTitle: string;
      noticeText: string;
      p2: string;
      p3: string;
    };
    terms: {
      title: string;
      subtitle: string;
      p1: string;
      highlight: string;
      p2: string;
      p3: string;
    };
    amlKyc: {
      title: string;
      subtitle: string;
      p1: string;
      p2: string;
      p3: string;
    };
    cookies: {
      title: string;
      subtitle: string;
      lastUpdated: string;
      s1Title: string;
      s1Text: string;
      s2Title: string;
      s2Text: string;
      s3Title: string;
      s3Text: string;
    };
  };
}

export const translations: Record<Language, TranslationDictionary> = {
  en: {
    meta: {
      title: "Bafin Solution | Investment & Trading Fraud Support",
      description: "Structured case assessment, transaction analysis, evidence documentation, and guidance for individuals affected by suspected investment, trading, and digital asset fraud."
    },
    nav: {
      services: "Services",
      howItWorks: "How it Works",
      whyUs: "Why Us",
      faq: "FAQ",
      caseAssessment: "Case Assessment",
      switchLangAria: "Switch language to German"
    },
    hero: {
      badge: "INVESTMENT & TRADING FRAUD SUPPORT",
      titlePart1: "Support After",
      titlePart2: "Investment & Trading Fraud",
      description: "Bafin Solution provides structured support for individuals affected by suspected investment, trading, and digital-asset fraud. We assist with case assessment, transaction analysis, documentation, fraud-prevention guidance, and coordination of appropriate next steps.",
      primaryCta: "Request a Case Assessment",
      secondaryCta: "How We Can Help",
      alertNotice: "Every case is different. No recovery outcome can be guaranteed.",
      independentReview: "Independent Case Review",
      confidentialHandling: "Confidential Handling",
      noGuarantees: "No Recovery Guarantees",
      analysisNodeTitle: "Case Analysis Node",
      networkTracing: "Network Tracing",
      referenceAddress: "Reference Address",
      txHash: "Transaction Hash",
      technicalStatus: "Technical Status",
      statusTracingActive: "Tracing Active",
      statusNodeSyncing: "Node Syncing",
      statusAnalyzingPath: "Analyzing Path",
      statusMappingAssets: "Mapping Assets",
      statusVerifyingNode: "Verifying Node",
      protocolTitle: "Analysis Protocol",
      protocolDesc: "Confidential technical assessment. All transaction records and client materials are handled with strict privacy protocols.",
      txTracedTitle: "Transaction Traced",
      txTracedSub: "Public Ledger Mapping",
      evidenceOrganized: "Case Evidence Organized",
      documentedBadge: "Documented"
    },
    trustPrinciples: {
      confidential: "Confidential Case Handling",
      documentation: "Structured Documentation",
      security: "Security-Focused Guidance",
      individual: "Individual Case Assessment"
    },
    whoWeHelp: {
      scopeBadge: "Support Scope",
      title: "Who We Help",
      subtitle: "Support for individuals affected by suspected financial and investment fraud.",
      card1Title: "Trading & Investment Fraud",
      card1Desc: "Support for individuals who have lost funds through suspected fraudulent or misleading trading and investment platforms.",
      card2Title: "Cryptocurrency-Related Fraud",
      card2Desc: "Assessment of cases involving cryptocurrency transfers, wallets, exchanges, digital assets, or blockchain transactions.",
      card3Title: "Impersonation & Social Engineering",
      card3Desc: "Support for cases involving deceptive communication, impersonation, manipulation, or fraudulent financial instructions.",
      card4Title: "Repeat-Fraud Prevention",
      card4Desc: "Guidance for individuals who have already suffered a financial loss and may subsequently be targeted by fraudulent recovery services or additional payment requests."
    },
    services: {
      badge: "Our Core Capabilities",
      title: "Case Assessment & Support Services",
      subtitle: "A structured approach to understanding the incident, organizing available evidence, and identifying appropriate next steps.",
      s1Title: "Initial Case Assessment",
      s1Desc: "We review the circumstances of the incident, available transaction information, relevant communication, and supporting documentation to better understand the case.",
      s2Title: "Transaction Tracing & Analysis",
      s2Desc: "Available transaction data may be analyzed to identify payment routes, wallet activity, exchanges, financial institutions, or other relevant endpoints where technically possible.",
      s3Title: "Evidence Organization",
      s3Desc: "We help organize transaction records, correspondence, account information, screenshots, and other relevant materials into structured case documentation.",
      s4Title: "Reporting Guidance",
      s4Desc: "We provide guidance on organizing information that may be relevant when communicating with financial institutions, consumer-protection organizations, law-enforcement bodies, or other appropriate authorities.",
      s5Title: "Legal Coordination",
      s5Desc: "Where appropriate, a case may require assessment by an independent qualified legal professional. We can assist with organizing relevant case information for legal review or coordination.",
      s6Title: "Fraud Prevention Guidance",
      s6Desc: "Clients receive practical guidance regarding common follow-up scams, suspicious recovery offers, credential theft, remote-access risks, and other warning signs."
    },
    germanySupport: {
      title: "Support for Cases Connected to Germany",
      p1: "Cases involving individuals, transactions, financial services, or entities connected to Germany may require communication with different organizations depending on the circumstances.",
      p2: "Bafin Solution can assist clients with organizing relevant information and understanding possible reporting or professional-support pathways. Depending on the individual case, this may involve financial institutions, law-enforcement bodies, consumer-protection organizations, independent legal professionals, or other competent authorities."
    },
    platforms: {
      title: "Supported Platforms",
      subtitle: "Bafin Solution operates independently and provides technical analysis across publicly accessible blockchain networks and commonly used digital asset platforms.",
      disclaimer: "We are not affiliated with, endorsed by, or partnered with any third-party wallet providers, exchanges, or financial platforms listed below.",
      footnote: "Platform names are provided for informational reference only."
    },
    remoteConsultation: {
      title: "Secure Consultation & Communication",
      subtitle: "We may use established communication and screen-sharing platforms to support technical consultation and visual review of relevant information.",
      notice: "For security and privacy reasons, clients should maintain control of their devices at all times. Screen sharing should be used only when necessary to display relevant information. Bafin Solution does not require clients to disclose passwords, private keys, seed phrases, authentication codes, or other sensitive credentials.",
      warningLine: "Do not grant unnecessary remote-control permissions to any external party.",
      toolsTitle: "Communication & Screen-Sharing Tools"
    },
    process: {
      badge: "Structured Workflow",
      title: "Our Case Support Process",
      subtitle: "Each case is different. Our process is designed to help clients understand what happened, organize available information, and identify appropriate next steps.",
      step1Title: "Tell Us What Happened",
      step1Desc: "Describe the incident and provide the available information regarding the trading platform, transaction, payment, wallet, or communication involved.",
      step2Title: "Case Review",
      step2Desc: "Available documents, transaction records, correspondence, and circumstances are reviewed to understand the structure of the incident.",
      step3Title: "Trace & Document",
      step3Desc: "Relevant transaction information and available evidence are analyzed and organized where technically possible.",
      step4Title: "Identify Available Options",
      step4Desc: "Possible technical, reporting, institutional, or legal next steps are identified according to the circumstances of the individual case.",
      step5Title: "Ongoing Guidance",
      step5Desc: "Clients receive guidance regarding appropriate next steps and precautions designed to reduce the risk of further fraud.",
      activeAssessment: "Case Assessment Active",
      structuredEvidence: "Structured Evidence Organization",
      verification: "Workflow Verification",
      verifiedBadge: "Verified"
    },
    legalSupport: {
      title: "Legal Support When Required",
      p1: "Some cases may require independent legal assessment or representation. Where appropriate, clients may be assisted in organizing case documentation for review by qualified independent legal professionals.",
      p2: "Legal professionals determine legal strategy, available remedies, and representation based on the circumstances of each individual case and applicable law."
    },
    antiScam: {
      tag: "Fraud Prevention Notice",
      title: "Protect Yourself From Recovery Scams",
      p1: "Individuals who have already lost money through investment or trading fraud may be targeted again by people claiming they can guarantee the recovery of lost funds.",
      guaranteeWarning: "Bafin Solution does not guarantee recovery outcomes.",
      neverDiscloseTitle: "Never disclose:",
      sensitiveItems: [
        "wallet seed phrases",
        "private keys",
        "account passwords",
        "authentication codes",
        "banking credentials",
        "other sensitive security credentials"
      ],
      advanceFeeWarning: "Never transfer additional funds solely because someone promises that payment will unlock, release, recover, verify, or return previously lost money.",
      deviceControlWarning: "Clients should maintain control of their own devices and accounts at all times."
    },
    whyTrust: {
      title: "Why Clients Contact Bafin Solution",
      subtitle: "We provide structured case assessment, objective transaction analysis, and professional guidance for individuals navigating the aftermath of suspected financial fraud.",
      exploreServices: "Explore Our Services",
      card1Title: "Structured Case Review",
      card1Desc: "We focus on understanding the circumstances and available evidence before identifying possible next steps.",
      card2Title: "Transaction Analysis",
      card2Desc: "Available financial and digital-asset transaction information can be reviewed and organized where technically possible.",
      card3Title: "Security-Focused Guidance",
      card3Desc: "Clients receive practical information designed to help reduce exposure to repeat fraud and unsafe recovery offers.",
      card4Title: "Professional Coordination",
      card4Desc: "Where appropriate, relevant information can be organized for communication with financial institutions, legal professionals, or competent organizations."
    },
    importantNotice: {
      title: "Important Notice",
      p1: "Every case is different. Transaction tracing, case assessment, documentation support, reporting guidance, and legal coordination do not guarantee that lost funds can be recovered.",
      p2: "Recovery possibilities depend on numerous factors, including the circumstances of the transaction, the payment method, the parties and institutions involved, applicable law, available evidence, timing, and actions taken by relevant third parties or authorities.",
      p3: "Bafin Solution does not promise or guarantee any specific financial, legal, investigative, or recovery outcome."
    },
    form: {
      badge: "Confidential Inquiry",
      title: "Request a Case Assessment",
      description: "Tell us what happened and provide a brief overview of your situation. Do not include passwords, private keys, seed phrases, authentication codes, or other sensitive credentials.",
      emailLabel: "Email Inquiries",
      techSupportLabel: "Technical Support",
      techSupportHours: "Available for client support and consultation inquiries.",
      hqLabel: "Global HQ",
      noticeBoxTitle: "Important Notice:",
      noticeBoxText: "Ensure you are communicating through official channels. Bafin Solution provides technical case assessment and analysis services and will never request sensitive security credentials or remote access permissions.",
      successMessage: "Your case details have been prepared for confidential review.",
      fullName: "Full Name",
      fullNamePlaceholder: "John Doe",
      emailAddress: "Email Address",
      emailPlaceholder: "john@example.com",
      phoneNumber: "Phone Number",
      phonePlaceholder: "+1 (555) 000-0000",
      country: "Country",
      countryPlaceholder: "Country of residence",
      incidentType: "Type of Incident",
      incidentOptions: {
        trading: "Trading / Investment Fraud",
        crypto: "Cryptocurrency Fraud",
        impersonation: "Impersonation",
        unauthorized: "Unauthorized Transaction",
        recoveryService: "Fraudulent Recovery Service",
        other: "Other"
      },
      lossAmount: "Approximate Loss Amount",
      lossAmountPlaceholder: "e.g. $15,000 or €10,000",
      incidentDate: "Approximate Date of Incident",
      incidentDatePlaceholder: "e.g. March 2026",
      paymentMethod: "Payment Method",
      paymentMethodPlaceholder: "e.g. Bank Transfer, Crypto Transfer, Credit Card",
      details: "Inquiry Details",
      detailsPlaceholder: "Briefly describe what happened. Do not include passwords, seed phrases, or private keys...",
      submitButton: "Submit for Case Review",
      disclaimer: "Submitting a request does not guarantee acceptance of a case or recovery of lost funds.",
      termsAgreement: "By submitting, you agree to our Privacy Policy and Terms of Service."
    },
    footer: {
      aboutText: "Bafin Solution provides case assessment, transaction analysis, documentation support, fraud-prevention guidance, and professional coordination for individuals affected by suspected investment, trading, and digital-asset fraud.",
      noGuaranteeNote: "No recovery outcome is guaranteed.",
      companyHeading: "Company",
      resourcesHeading: "Resources",
      aboutUs: "About Us",
      ourTeam: "Our Team",
      caseStudies: "Case Studies",
      contact: "Contact",
      securityBlog: "Security Blog",
      networkDatabase: "Network Database",
      auditingGuides: "Auditing Guides",
      faq: "FAQ",
      copyright: "© 2026 Bafin Solution. All rights reserved.",
      badge1: "Independent Case Review",
      badge2: "Confidential Case Handling",
      badge3: "No Recovery Guarantees",
      privacy: "Privacy Policy",
      terms: "Terms of Service",
      amlKyc: "AML / KYC Policy",
      cookies: "Cookie Policy"
    },
    pages: {
      about: {
        title: "About Us",
        subtitle: "Structured support, transaction analysis, and documentation for investment & trading fraud cases.",
        p1: "Bafin Solution provides structured support and technical consultation for individuals affected by suspected investment, trading, cryptocurrency, and digital asset fraud.",
        p2: "Our team assists clients with initial case assessment, transaction tracing and analysis, evidence organization, and fraud-prevention guidance. Where appropriate, we help clients organize relevant documentation for communication with financial institutions, legal professionals, or competent consumer-protection and law-enforcement bodies.",
        p3: "We operate with a commitment to analytical objectivity, confidentiality, and transparency. Every case is different, and we provide clear, realistic guidance based on verifiable facts.",
        notice: "Bafin Solution does not promise, warrant, or guarantee the recovery of lost funds. All services are strictly limited to technical analysis, evidence documentation, consultation, and coordination."
      },
      team: {
        title: "Our Team",
        subtitle: "Meet the technical specialists behind our case assessment and analysis protocols.",
        members: [
          { name: "David Samora", role: "Chief Technical Analyst", bio: "Technical specialist with 15 years of experience in digital forensics and blockchain transaction analysis." },
          { name: "Elena Vance", role: "Head of Technical Auditing", bio: "Specialist in smart contract structures, protocol analysis, and transaction tracing." },
          { name: "Marcus Chen", role: "Lead Blockchain Analyst", bio: "Specializes in multi-chain payment route analysis and endpoint mapping." },
          { name: "Sarah Jenkins", role: "Case Coordination Manager", bio: "Coordinates case documentation workflows and communication support." }
        ]
      },
      caseStudies: {
        title: "Case Studies",
        subtitle: "Examples of our structured technical analysis and case documentation methodologies.",
        studies: [
          { title: "Multi-Chain Transaction Mapping", tag: "Transaction Tracing", desc: "Mapped complex transaction hops across multiple blockchain networks to document the flow of assets and identify intermediate wallet clusters." },
          { title: "Deceptive Platform Documentation", tag: "Evidence Organization", desc: "Compiled comprehensive evidence packages including server records, transaction hashes, and communication logs for administrative review." },
          { title: "Unauthorized Transfer Analysis", tag: "Case Assessment", desc: "Structured forensic documentation of unauthorized wallet transfers and destination endpoints for client legal review." }
        ]
      },
      blog: {
        title: "Security Blog",
        subtitle: "Insights, trends, and updates from the world of blockchain security.",
        readMore: "Read More",
        posts: [
          { title: "The Evolution of Mixing Protocols", date: "Oct 12, 2025", excerpt: "How modern analysis tools are overcoming traditional obfuscation techniques." },
          { title: "Securing Your Digital Portfolio", date: "Sep 28, 2025", excerpt: "Best practices for multi-signature setups and cold storage management." },
          { title: "Understanding Zero-Knowledge Proofs", date: "Sep 15, 2025", excerpt: "A deep dive into the technology shaping the future of blockchain privacy." }
        ]
      },
      database: {
        title: "Network Database",
        subtitle: "Our proprietary database of known security threats and network endpoints.",
        intro: "Bafin Solution maintains one of the industry's most comprehensive databases of verified security threats, malicious endpoints, and platform hot-wallets.",
        stats: [
          { label: "Verified Endpoints", value: "12,450+" },
          { label: "Threat Patterns", value: "890+" },
          { label: "Platform Nodes", value: "45" },
          { label: "Daily Updates", value: "24/7" },
          { label: "Data Integrity", value: "99.9%" },
          { label: "Network Coverage", value: "15+ Chains" }
        ]
      },
      guides: {
        title: "Auditing Guides",
        subtitle: "Professional resources for digital asset management and security.",
        items: [
          { title: "Self-Audit Checklist", type: "PDF Guide", size: "2.4 MB" },
          { title: "Incident Response Plan", type: "Template", size: "1.1 MB" },
          { title: "Exchange Security Review", type: "Whitepaper", size: "4.8 MB" },
          { title: "Cold Storage Best Practices", type: "Video Series", size: "N/A" }
        ]
      },
      faq: {
        title: "FAQ",
        subtitle: "Answers to common questions regarding our case assessment and support services.",
        items: [
          {
            q: "Can Bafin Solution guarantee that my money will be recovered?",
            a: "No. No legitimate case assessment, tracing, legal, or support service can guarantee the recovery of lost funds. Each case depends on its individual circumstances, available evidence, payment routes, institutions involved, applicable law, and actions taken by relevant third parties."
          },
          {
            q: "What information should I provide?",
            a: "Relevant transaction records, payment details, platform information, correspondence, screenshots, wallet addresses, transaction identifiers, and other non-sensitive information may help with the initial assessment."
          },
          {
            q: "Should I provide my wallet seed phrase or password?",
            a: "No. Never provide wallet seed phrases, private keys, passwords, authentication codes, or other sensitive security credentials."
          },
          {
            q: "Can cryptocurrency transactions be traced?",
            a: "Certain blockchain transactions are publicly recorded and may be analyzed using available transaction data. However, tracing a transaction does not by itself guarantee identification of a responsible person or recovery of funds."
          },
          {
            q: "Do you provide legal representation?",
            a: "Some cases may require assessment or representation by an independent qualified legal professional. Where appropriate, relevant case information may be organized for legal review or coordination."
          },
          {
            q: "What happens after I submit my case?",
            a: "The available information is reviewed to understand the circumstances and determine what technical, reporting, institutional, or professional next steps may be appropriate."
          },
          {
            q: "Why should I be careful with recovery services?",
            a: "People who have already experienced financial fraud may be targeted again by individuals promising guaranteed recovery in exchange for additional payments or sensitive account information. Be cautious of guarantees, urgent payment demands, requests for credentials, or unnecessary remote access."
          }
        ]
      },
      privacy: {
        title: "Privacy Policy",
        subtitle: "Our commitment to client confidentiality and data security.",
        p1: "Case submissions may contain financial, transaction-related, and communication information. We collect and process this information solely to assess the circumstances of the incident, organize documentation, and identify appropriate next steps.",
        noticeTitle: "Important Data Notice:",
        noticeText: "Clients should NEVER submit sensitive security credentials, including passwords, private keys, wallet seed phrases, 2FA/authentication codes, or unnecessary personal identity credentials.",
        p2: "We do not sell, rent, or share client data with unauthorized third parties. All materials are stored securely and handled with strict confidentiality protocols.",
        p3: "Clients have the right to request access, correction, or deletion of their submitted records at any time."
      },
      terms: {
        title: "Terms of Service",
        subtitle: "Scope of service and operational framework.",
        p1: "Bafin Solution provides initial case assessment, transaction tracing and analysis, evidence organization, fraud-prevention guidance, and coordination support only.",
        highlight: "Every case is different. Bafin Solution does not promise, warrant, or guarantee any specific financial, legal, investigative, or recovery outcome.",
        p2: "Transaction tracing, case documentation, and coordination do not guarantee that lost funds can or will be recovered. Outcomes depend on third-party actions, payment mechanisms, jurisdiction, timing, and available evidence.",
        p3: "Clients are solely responsible for the accuracy of information provided. Bafin Solution is not a law firm and does not provide formal legal representation or financial investment advice."
      },
      amlKyc: {
        title: "AML / KYC Policy",
        subtitle: "Adherence to anti-money laundering and ethical compliance standards.",
        p1: "Bafin Solution operates within an ethical, compliance-oriented framework and adheres to anti-money laundering (AML) and counter-terrorist financing (CTF) principles.",
        p2: "We do not provide services in support of deceptive schemes, unauthorized platform access, harassment, or unlawful operations.",
        p3: "We reserve the right to decline or terminate case reviews where risk, bad faith, or compliance concerns are identified."
      },
      cookies: {
        title: "Cookie Policy",
        subtitle: "Transparency regarding our digital tracking and security protocols.",
        lastUpdated: "Last Updated: April 5, 2026",
        s1Title: "1. Use of Cookies",
        s1Text: "We use cookies and similar tracking technologies to track the activity on our Service and hold certain information. Cookies are files with small amount of data which may include an anonymous unique identifier.",
        s2Title: "2. Essential Cookies",
        s2Text: "These cookies are necessary for the website to function and cannot be switched off in our systems. They are usually only set in response to actions made by you which amount to a request for services, such as setting your privacy preferences or filling in forms.",
        s3Title: "3. Security Cookies",
        s3Text: "We use security cookies to help identify and prevent security risks. For example, we use these cookies to store information that allows us to recover your session if you are disconnected during a secure forensic data upload."
      }
    }
  },
  de: {
    meta: {
      title: "Bafin Solution | Unterstützung bei Anlage- & Trading-Betrug",
      description: "Strukturierte Fallprüfung, Transaktionsanalyse, Beweismitteldokumentation und Orientierung für Betroffene von mutmaßlichem Anlage-, Trading- und Krypto-Betrug."
    },
    nav: {
      services: "Leistungen",
      howItWorks: "Ablauf",
      whyUs: "Warum wir",
      faq: "FAQ",
      caseAssessment: "Fallbewertung",
      switchLangAria: "Sprache auf Englisch wechseln"
    },
    hero: {
      badge: "UNTERSTÜTZUNG BEI ANLAGE- & TRADING-BETRUG",
      titlePart1: "Unterstützung nach",
      titlePart2: "Anlage- & Trading-Betrug",
      description: "Bafin Solution bietet strukturierte Unterstützung für Personen, die von mutmaßlichem Anlage-, Trading- und Krypto-Betrug betroffen sind. Wir unterstützen bei Fallbewertung, Transaktionsanalyse, Beweisdokumentation, Betrugsprävention und der Koordination möglicher weiterer Schritte.",
      primaryCta: "Fallbewertung anfordern",
      secondaryCta: "Unsere Unterstützung",
      alertNotice: "Jeder Fall ist individuell. Eine Rückgewinnung von Geldern kann nicht garantiert werden.",
      independentReview: "Unabhängige Fallprüfung",
      confidentialHandling: "Vertrauliche Abwicklung",
      noGuarantees: "Keine Erfolgsgarantien",
      analysisNodeTitle: "Fallanalyse-Knoten",
      networkTracing: "Netzwerk-Rückverfolgung",
      referenceAddress: "Referenzadresse",
      txHash: "Transaktions-Hash",
      technicalStatus: "Technischer Status",
      statusTracingActive: "Rückverfolgung aktiv",
      statusNodeSyncing: "Knoten synchronisiert",
      statusAnalyzingPath: "Pfadanalyse aktiv",
      statusMappingAssets: "Transaktionsmapping",
      statusVerifyingNode: "Knotenüberprüfung",
      protocolTitle: "Analyseprotokoll",
      protocolDesc: "Vertrauliche technische Bewertung. Sämtliche Transaktionsaufzeichnungen und Klientenunterlagen unterliegen strengen Datenschutzprotokollen.",
      txTracedTitle: "Transaktion erfasst",
      txTracedSub: "Public-Ledger-Zuordnung",
      evidenceOrganized: "Beweismittel strukturiert",
      documentedBadge: "Dokumentiert"
    },
    trustPrinciples: {
      confidential: "Vertrauliche Fallprüfung",
      documentation: "Strukturierte Dokumentation",
      security: "Sicherheitsorientierte Beratung",
      individual: "Individuelle Fallbewertung"
    },
    whoWeHelp: {
      scopeBadge: "Unterstützungsbereich",
      title: "Für wen wir da sind",
      subtitle: "Unterstützung für Betroffene von mutmaßlichem Finanz- und Anlagebetrug.",
      card1Title: "Trading- & Anlagebetrug",
      card1Desc: "Unterstützung für Personen, die finanzielle Verluste durch mutmaßlich betrügerische oder manipulative Trading- und Anlageplattformen erlitten haben.",
      card2Title: "Kryptobezogener Betrug",
      card2Desc: "Prüfung von Fällen mit Krypto-Transfers, Wallets, Krypto-Börsen, digitalen Vermögenswerten oder Blockchain-Transaktionen.",
      card3Title: "Identitätsdiebstahl & Täuschung",
      card3Desc: "Unterstützung bei Fällen von betrügerischer Kontaktaufnahme, falscher Identität, Manipulation oder betrügerischen Zahlungsanweisungen.",
      card4Title: "Prävention von Folgeschäden",
      card4Desc: "Aufklärung für Betroffene, die nach einem Verlust durch unseriöse Wiederbeschaffungsdienste oder erneute Zahlungsforderungen kontaktiert werden."
    },
    services: {
      badge: "Unsere Kernkompetenzen",
      title: "Fallbewertung & Unterstützungsleistungen",
      subtitle: "Ein strukturierter Ansatz zur Erfassung des Vorfalls, Organisation verfügbarer Beweismittel und Bestimmung sachgerechter nächster Schritte.",
      s1Title: "Erstbewertung des Vorfalls",
      s1Desc: "Wir prüfen die Umstände des Vorfalls, vorliegende Transaktionsdaten, relevante Korrespondenz und Belege, um das Gesamtbild des Falls zu erfassen.",
      s2Title: "Transaktionsanalyse & Rückverfolgung",
      s2Desc: "Verfügbare Transaktionsdaten werden technisch analysiert, um Zahlungsströme, Wallet-Aktivitäten, Krypto-Börsen, Banken oder Empfänger-Endpunkte nachzuvollziehen.",
      s3Title: "Beweismittelstrukturierung",
      s3Desc: "Wir unterstützen Sie bei der systematischen Aufbereitung von Transaktionsbelegen, Nachrichten, Kontoauszügen und Screenshots in ein strukturiertes Falldossier.",
      s4Title: "Orientierung für Meldungen",
      s4Desc: "Wir unterstützen bei der Vorbereitung relevanter Informationen für die Kommunikation mit Banken, Verbraucherschutzstellen, Ermittlungsbehörden oder zuständigen Stellen.",
      s5Title: "Rechtliche Koordination",
      s5Desc: "Sofern erforderlich, kann eine Beurteilung durch unabhängige qualifizierte Rechtsanwälte erfolgen. Wir bereiten die Falldaten für eine rechtliche Prüfung sachgerecht auf.",
      s6Title: "Prävention & Schutz vor Folgeschäden",
      s6Desc: "Praxisnahe Aufklärung über typische Folgebeschwindigkeiten, angebliche Geld-Rückholer ('Recovery Scams'), Fernzugriffsrisiken und Sicherheitswarnsignale."
    },
    germanySupport: {
      title: "Unterstützung bei Fällen mit Deutschland-Bezug",
      p1: "Fälle mit Bezug zu Deutschland – sei es durch Betroffene, Zahlungswege, Finanzdienstleister oder Plattformen – erfordern oft eine gezielte Abstimmung mit verschiedenen Stellen.",
      p2: "Bafin Solution unterstützt Betroffene dabei, relevante Informationen zu strukturieren und mögliche Melde- und Beratungswege zu verstehen. Je nach Einzelfall betrifft dies Finanzinstitute, Ermittlungsbehörden, Verbraucherschutzzentralen, unabhängige Rechtsanwälte oder zuständige Aufsichts- und Meldestellen."
    },
    platforms: {
      title: "Analysierte Plattformen",
      subtitle: "Bafin Solution agiert unabhängig und führt technische Analysen über öffentlich einsehbare Blockchain-Netzwerke und gängige Plattformen für digitale Vermögenswerte durch.",
      disclaimer: "Wir stehen in keiner geschäftlichen Partnerschaft, Verbindung oder offiziellen Kooperation mit den nachfolgend aufgeführten Wallet-Anbietern, Börsen oder Finanzplattformen.",
      footnote: "Plattformnamen dienen ausschließlich Informations- und Referenzzwecken."
    },
    remoteConsultation: {
      title: "Sichere Beratung & Kommunikation",
      subtitle: "Wir nutzen etablierte Kommunikations- und Screensharing-Lösungen zur Unterstützung technischer Fallbesprechungen und visuellen Datensichtung.",
      notice: "Aus Sicherheits- und Datenschutzgründen sollten Klienten jederzeit die vollständige Kontrolle über ihre Geräte behalten und niemals Passwörter, private Schlüssel, Seed-Phrasen, Authentifizierungscodes oder uneingeschränkten Fernzugriff weitergeben.",
      warningLine: "Gewähren Sie externen Dritten niemals unbedachte Fernsteuerungs- oder Vollzugriffsrechte.",
      toolsTitle: "Kommunikations- & Screensharing-Tools"
    },
    process: {
      badge: "Strukturierter Ablauf",
      title: "Unser Fallbegleitungsprozess",
      subtitle: "Jeder Fall ist unterschiedlich. Unser Prozess hilft Betroffenen, den Sachverhalt aufzuarbeiten, vorhandene Nachweise zu strukturieren und sinnvolle nächste Schritte festzulegen.",
      step1Title: "Schildern Sie den Sachverhalt",
      step1Desc: "Beschreiben Sie den Vorfall und stellen Sie vorhandene Informationen zu Plattform, Zahlungen, Wallets oder Nachrichtenverläufen bereit.",
      step2Title: "Fallprüfung",
      step2Desc: "Vorliegende Dokumente, Transaktionsauszüge, Korrespondenz und Eckdaten werden geprüft, um die Struktur des Vorfalls zu verstehen.",
      step3Title: "Analyse & Dokumentation",
      step3Desc: "Relevante Transaktionsdaten und Belege werden, soweit technisch machbar, nachverfolgt und systematisch aufbereitet.",
      step4Title: "Optionen identifizieren",
      step4Desc: "Mögliche technische, institutionelle, melderechtliche oder rechtliche Handlungspfade werden auf Basis des Einzelfalls herausgearbeitet.",
      step5Title: "Präventive Begleitung",
      step5Desc: "Klienten erhalten konkrete Empfehlungen zu Sicherheitsvorkehrungen, um das Risiko von Folgeschäden nachhaltig zu minimieren.",
      activeAssessment: "Fallprüfung aktiv",
      structuredEvidence: "Strukturierte Beweisaufbereitung",
      verification: "Prozessprüfung",
      verifiedBadge: "Verifiziert"
    },
    legalSupport: {
      title: "Rechtliche Unterstützung bei Bedarf",
      p1: "Einige Sachverhalte erfordern eine unabhängige juristische Prüfung oder anwaltliche Vertretung. Klienten werden bei Bedarf dabei unterstützt, Dokumente für qualifizierte Rechtsanwälte aufzubereiten.",
      p2: "Unabhängige Rechtsanwälte prüfen Rechtsansprüche, Strategien und rechtliche Schritte eigenständig auf Basis der jeweiligen Sach- und Rechtslage."
    },
    antiScam: {
      tag: "Sicherheitshinweis zur Betrugsprävention",
      title: "Schutz vor sogenannten Rückhol-Betrügern ('Recovery Scams')",
      p1: "Personen, die bereits finanzielle Verluste erlitten haben, werden häufig erneut von Personen kontaktiert, die eine garantierte Rückholung der Gelder versprechen.",
      guaranteeWarning: "Bafin Solution gibt keine Erfolgs- oder Rückholgarantien ab.",
      neverDiscloseTitle: "Geben Sie niemals weiter:",
      sensitiveItems: [
        "Wallet-Seed-Phrasen (Wiederherstellungswörter)",
        "Private Schlüssel (Private Keys)",
        "Kontopasswörter",
        "Zwei-Faktor- oder Authentifizierungscodes",
        "Online-Banking-Zugangsdaten",
        "Sonstige vertrauliche Sicherheitsnachweise"
      ],
      advanceFeeWarning: "Überweisen Sie keinesfalls zusätzliche Gelder, nur weil Ihnen versprochen wird, dass dadurch verlorenes Geld 'freigeschaltet', 'verifiziert' oder zurückgeholt werden könne.",
      deviceControlWarning: "Klienten sollten jederzeit die volle Kontrolle über ihre eigenen Geräte und Konten behalten."
    },
    whyTrust: {
      title: "Warum Klienten Bafin Solution kontaktieren",
      subtitle: "Wir bieten strukturierte Fallanalysen, objektive Transaktionsauswertungen und professionelle Orientierung nach mutmaßlichem Finanzbetrug.",
      exploreServices: "Leistungen entdecken",
      card1Title: "Strukturierte Fallprüfung",
      card1Desc: "Wir analysieren die Vorfallsdetails und vorhandenen Nachweise gründlich, bevor Folgeschritte erörtert werden.",
      card2Title: "Transaktionsanalyse",
      card2Desc: "Transaktionsdaten aus Krypto- und Finanznetzwerken werden technisch geprüft und systematisch dokumentiert.",
      card3Title: "Sicherheitsorientierte Beratung",
      card3Desc: "Klienten erhalten praxisnahe Sicherheitshinweise, um sich vor Folgeschäden und betrügerischen Angeboten zu schützen.",
      card4Title: "Professionelle Koordination",
      card4Desc: "Falldaten werden für die geordnete Weitergabe an Banken, Behörden oder Rechtsbeistände strukturiert aufbereitet."
    },
    importantNotice: {
      title: "WICHTIGER HINWEIS",
      p1: "Die Nachverfolgung oder Rückgewinnung verlorener Gelder kann nicht garantiert werden. Jeder Fall ist unterschiedlich und wird individuell bewertet. Unsere Leistungen umfassen Beratung, Analyse, Dokumentation und Unterstützung bei der Bewertung möglicher weiterer Schritte.",
      p2: "Aussichten auf Rückgewinnung hängen von vielen Faktoren ab – darunter Zahlungswege, beteiligte Akteure und Banken, anwendbares Recht, Beweislage, Zeitablauf und Maßnahmen von Ermittlungsbehörden.",
      p3: "Bafin Solution verspricht oder garantiert zu keinem Zeitpunkt bestimmte finanzielle, rechtliche oder ermittlungstechnische Ergebnisse."
    },
    form: {
      badge: "Vertrauliche Anfrage",
      title: "Fallbewertung anfordern",
      description: "Schildern Sie kurz den Sachverhalt. Bitte übermitteln Sie keine Passwörter, privaten Schlüssel, Seed-Phrasen, 2FA-Codes oder vertraulichen Zugangsdaten.",
      emailLabel: "E-Mail-Anfragen",
      techSupportLabel: "Technischer Support",
      techSupportHours: "Verfügbar für Klientensupport und Beratungsanfragen.",
      hqLabel: "Hauptsitz",
      noticeBoxTitle: "Wichtiger Hinweis:",
      noticeBoxText: "Stellen Sie sicher, dass Sie über offizielle Kanäle kommunizieren. Bafin Solution erbringt technische Analyse- und Bewertungsleistungen und fordert niemals vertrauliche Sicherheitsdaten oder Fernzugriff auf Ihre Geräte an.",
      successMessage: "Ihre Fallangaben wurden für die vertrauliche Prüfung vorbereitet.",
      fullName: "Vollständiger Name",
      fullNamePlaceholder: "Max Mustermann",
      emailAddress: "E-Mail-Adresse",
      emailPlaceholder: "max@beispiel.de",
      phoneNumber: "Telefonnummer",
      phonePlaceholder: "+49 170 1234567",
      country: "Land",
      countryPlaceholder: "Wohnsitzland",
      incidentType: "Art des Vorfalls",
      incidentOptions: {
        trading: "Trading- / Anlagebetrug",
        crypto: "Kryptobezogener Betrug",
        impersonation: "Identitätsdiebstahl / Täuschung",
        unauthorized: "Unautorisierte Transaktion",
        recoveryService: "Betrügerischer Rückholdienst",
        other: "Sonstiges"
      },
      lossAmount: "Ungefähre Schadenshöhe",
      lossAmountPlaceholder: "z.B. 15.000 € oder 10.000 $",
      incidentDate: "Ungefähres Datum des Vorfalls",
      incidentDatePlaceholder: "z.B. März 2026",
      paymentMethod: "Zahlungsmethode",
      paymentMethodPlaceholder: "z.B. Banküberweisung, Krypto-Transfer, Kreditkarte",
      details: "Details zum Sachverhalt",
      detailsPlaceholder: "Beschreiben Sie kurz, was passiert ist. Bitte keine Passwörter, Seed-Phrasen oder privaten Schlüssel eingeben...",
      submitButton: "Zur Fallprüfung einreichen",
      disclaimer: "Das Absenden einer Anfrage garantiert weder die Fallannahme noch die Rückgewinnung von Geldern.",
      termsAgreement: "Mit dem Absenden stimmen Sie unserer Datenschutzerklärung und unseren AGB zu."
    },
    footer: {
      aboutText: "Bafin Solution bietet Fallbewertung, Transaktionsanalyse, Dokumentationshilfe, Betrugsprävention und professionelle Koordination für Betroffene von mutmaßlichem Anlage-, Trading- und Krypto-Betrug.",
      noGuaranteeNote: "Eine erfolgreiche Rückgewinnung von Geldern kann nicht garantiert werden.",
      companyHeading: "Unternehmen",
      resourcesHeading: "Ressourcen",
      aboutUs: "Über uns",
      ourTeam: "Unser Team",
      caseStudies: "Fallstudien",
      contact: "Kontakt",
      securityBlog: "Sicherheits-Blog",
      networkDatabase: "Netzwerk-Datenbank",
      auditingGuides: "Leitfäden",
      faq: "FAQ",
      copyright: "© 2026 Bafin Solution. Alle Rechte vorbehalten.",
      badge1: "Unabhängige Fallprüfung",
      badge2: "Vertrauliche Fallprüfung",
      badge3: "Keine Erfolgsgarantien",
      privacy: "Datenschutzerklärung",
      terms: "Allgemeine Geschäftsbedingungen",
      amlKyc: "AML / KYC Richtlinie",
      cookies: "Cookie-Richtlinie"
    },
    pages: {
      about: {
        title: "Über uns",
        subtitle: "Strukturierte Unterstützung, Transaktionsanalyse und Beweissicherung bei Anlage- & Trading-Betrug.",
        p1: "Bafin Solution bietet strukturierte Unterstützung und technische Beratung für Personen, die von mutmaßlichem Anlage-, Trading-, Kryptowährungs- und Krypto-Betrug betroffen sind.",
        p2: "Unser Team unterstützt Klienten bei der initialen Fallbewertung, Transaktionsnachverfolgung und -analyse, Beweisorganisation sowie Betrugsprävention. Bei Bedarf helfen wir Klienten bei der geordneten Vorbereitung von Unterlagen für Banken, Rechtsanwälte oder zuständige Behörden und Verbraucherschutzstellen.",
        p3: "Wir arbeiten mit hoher analytischer Objektivität, Vertraulichkeit und Transparenz. Jeder Fall ist individuell, und wir geben klare, realistische Einschätzungen auf Basis verifizierbarer Tatsachen.",
        notice: "WICHTIGER HINWEIS: Bafin Solution verspricht oder garantiert zu keinem Zeitpunkt die Rückgewinnung von Geldern. Alle Leistungen beschränken sich streng auf technische Analyse, Dokumentation, Beratung und Koordination."
      },
      team: {
        title: "Unser Team",
        subtitle: "Lernen Sie die technischen Spezialisten hinter unseren Analyse- und Prüfverfahren kennen.",
        members: [
          { name: "David Samora", role: "Leitender technischer Analyst", bio: "Technischer Spezialist mit 15 Jahren Erfahrung in digitaler Forensik und Blockchain-Transaktionsanalyse." },
          { name: "Elena Vance", role: "Leitung Technische Prüfung", bio: "Spezialistin für Smart-Contract-Strukturen, Protokollanalysen und Transaktionsverfolgung." },
          { name: "Marcus Chen", role: "Senior Blockchain-Analyst", bio: "Spezialisiert auf Multi-Chain-Zahlungswege und die Zuordnung von Ziel-Endpunkten." },
          { name: "Sarah Jenkins", role: "Leitung Fallkoordination", bio: "Koordiniert die Abläufe der Beweisdokumentation und die Klientenkommunikation." }
        ]
      },
      caseStudies: {
        title: "Fallstudien",
        subtitle: "Beispiele unserer strukturierten technischen Analyse- und Dokumentationsmethoden.",
        studies: [
          { title: "Multi-Chain Transaktionsabbildung", tag: "Transaktionsanalyse", desc: "Abbildung komplexer Transaktionsketten über mehrere Blockchains zur Dokumentation von Vermögensflüssen und Wallet-Clustern." },
          { title: "Dokumentation betrügerischer Plattformen", tag: "Beweisdokumentation", desc: "Zusammenstellung umfassender Beweisdossiers einschließlich Serveraufzeichnungen, Transaktions-Hashes und Kommunikationsverläufen." },
          { title: "Analyse unautorisierter Abflüsse", tag: "Fallprüfung", desc: "Strukturierte forensische Aufbereitung unautorisierter Wallet-Transfers und Ziel-Adressen für anwaltliche Prüfungen." }
        ]
      },
      blog: {
        title: "Sicherheits-Blog",
        subtitle: "Einblicke, Entwicklungen und Fachbeiträge aus dem Bereich der Blockchain-Sicherheit.",
        readMore: "Mehr erfahren",
        posts: [
          { title: "Die Entwicklung von Mixing-Protokollen", date: "12. Okt 2025", excerpt: "Wie moderne Analysemethoden komplexe Verschleierungstechniken aufschlüsseln." },
          { title: "Absicherung digitaler Portfolios", date: "28. Sep 2025", excerpt: "Best Practices für Multi-Signatur-Systeme und Cold-Storage-Verwaltung." },
          { title: "Zero-Knowledge-Proofs verstehen", date: "15. Sep 2025", excerpt: "Ein detaillierter Blick auf kryptografische Verfahren der nächsten Generation." }
        ]
      },
      database: {
        title: "Netzwerk-Datenbank",
        subtitle: "Unsere Datenbank bekannter Sicherheitsbedrohungen und verdächtiger Endpunkte.",
        intro: "Bafin Solution führt eine umfangreiche Datenbank verifizierter Bedrohungsmuster, auffälliger Ziel-Wallets und Knotenpunkte.",
        stats: [
          { label: "Verifizierte Endpunkte", value: "12.450+" },
          { label: "Bedrohungsmuster", value: "890+" },
          { label: "Plattform-Knoten", value: "45" },
          { label: "Tägliche Updates", value: "24/7" },
          { label: "Datenintegrität", value: "99,9%" },
          { label: "Netzabdeckung", value: "15+ Chains" }
        ]
      },
      guides: {
        title: "Leitfäden & Ressourcen",
        subtitle: "Fachliche Ressourcen für Sicherheitsüberprüfungen und Risikominimierung.",
        items: [
          { title: "Selbstüberprüfungs-Checkliste", type: "PDF-Leitfaden", size: "2,4 MB" },
          { title: "Notfallplan bei Vorfällen", type: "Vorlage", size: "1,1 MB" },
          { title: "Börsen-Sicherheitsüberprüfung", type: "Whitepaper", size: "4,8 MB" },
          { title: "Best Practices für Cold Storage", type: "Videoreihe", size: "N/A" }
        ]
      },
      faq: {
        title: "Häufig gestellte Fragen (FAQ)",
        subtitle: "Antworten auf zentrale Fragen zu unseren Fallprüfungs- und Unterstützungsleistungen.",
        items: [
          {
            q: "Kann Bafin Solution garantieren, dass verlorene Gelder zurückgeholt werden?",
            a: "Nein. Kein seriöser Analyse-, Prüf-, Rechts- oder Beratungsdienst kann eine Rückgewinnung verlorener Gelder garantieren. Jeder Fall hängt von individuellen Faktoren ab – darunter verfügbare Beweise, Zahlungswege, beteiligte Banken, anwendbares Recht und Maßnahmen der Strafverfolgungsbehörden."
          },
          {
            q: "Welche Informationen sollte ich bereitstellen?",
            a: "Sinnvoll sind Transaktionsbelege, Einzahlungsnachweise, Namen der Plattformen, Korrespondenz, Screenshots, Wallet-Adressen, Transaktions-Hashes (TXIDs) sowie weitere sachdienliche, nicht vertrauliche Informationen."
          },
          {
            q: "Sollte ich meine Seed-Phrase oder Passwörter übermitteln?",
            a: "Nein. Niemals sollten Wallet-Seed-Phrasen, private Schlüssel, Passwörter, 2FA-Codes oder vertrauliche Zugangsdaten weitergegeben werden."
          },
          {
            q: "Können Krypto-Transaktionen nachverfolgt werden?",
            a: "Viele Blockchain-Transaktionen sind öffentlich im Hauptbuch verzeichnet und können technisch analysiert werden. Die Nachverfolgung allein garantiert jedoch weder die unmittelbare Identifizierung der Täter noch eine Rückholung der Gelder."
          },
          {
            q: "Bieten Sie rechtliche Vertretung an?",
            a: "Bestimmte Sachverhalte bedürfen einer rechtlichen Bewertung oder anwaltlichen Vertretung durch unabhängige qualifizierte Rechtsanwälte. Wo angebracht, bereiten wir Falldaten für eine rechtliche Prüfung sachgerecht auf."
          },
          {
            q: "Was geschieht nach Einreichung meines Falls?",
            a: "Die bereitgestellten Angaben werden gesichtet, um den Vorfall zu strukturieren und sinnvolle technische, melderechtliche oder institutionelle Folgeschritte zu identifizieren."
          },
          {
            q: "Warum sollte ich bei sogenannten Rückholdiensten ('Recovery Services') vorsichtig sein?",
            a: "Personen, die bereits geschädigt wurden, geraten häufig ins Visier von Tätern, die gegen Vorabgebühren eine '100%ige Rückholung' versprechen. Seien Sie misstrauisch bei Erfolgsgarantien, dringenden Zahlungsaufforderungen oder Bitten um Fernzugriff."
          }
        ]
      },
      privacy: {
        title: "Datenschutzerklärung",
        subtitle: "Unser Bekenntnis zu Diskretion, Vertraulichkeit und Datensicherheit.",
        p1: "Fallanfragen können finanzielle, transaktionsbezogene und kommunikative Angaben enthalten. Wir erheben und verarbeiten diese Angaben ausschließlich zur Prüfung des Sachverhalts, Beweisordnung und Bestimmung möglicher Folgeschritte.",
        noticeTitle: "Wichtiger Datenschutzhinweis:",
        noticeText: "Klienten sollten zu KEINEM Zeitpunkt vertrauliche Zugangsdaten wie Passwörter, private Schlüssel, Seed-Phrasen oder Zwei-Faktor-Codes übermitteln.",
        p2: "Wir verkaufen, vermieten oder teilen Klientendaten nicht mit unbefugten Dritten. Alle Unterlagen werden sicher verwahrt und unterliegen strengen Vertraulichkeitsstandards.",
        p3: "Klienten haben jederzeit das Recht auf Auskunft, Berichtigung oder Löschung ihrer eingereichten Daten."
      },
      terms: {
        title: "Allgemeine Geschäftsbedingungen",
        subtitle: "Leistungsumfang und betriebliche Rahmenbedingungen.",
        p1: "Bafin Solution erbringt ausschließlich Leistungen im Bereich der initialen Fallbewertung, Transaktionsanalyse, Beweisorganisation, Betrugsprävention und Koordination.",
        highlight: "Jeder Fall ist individuell. Bafin Solution verspricht, garantiert oder gewährleistet zu keinem Zeitpunkt bestimmte finanzielle, rechtliche oder ermittlungstechnische Ergebnisse.",
        p2: "Transaktionsanalysen, Falldossiers und Kooperationshilfen garantieren nicht, dass verlorene Gelder wiedererlangt werden können. Ergebnisse hängen maßgeblich von Dritten, Zahlungsmethoden, Gerichtsständen und der Beweislage ab.",
        p3: "Klienten tragen die Verantwortung für die Richtigkeit der gemachten Angaben. Bafin Solution ist keine Rechtsanwaltskanzlei und erbringt keine Rechts- oder Anlageberatung."
      },
      amlKyc: {
        title: "AML / KYC Richtlinie",
        subtitle: "Einhaltung ethischer Grundsätze und Standards zur Geldwäscheprävention.",
        p1: "Bafin Solution arbeitet nach strengen ethischen Standards und beachtet die Grundsätze zur Bekämpfung von Geldwäsche (AML) und Terrorismusfinanzierung (CTF).",
        p2: "Wir unterstützen keine betrügerischen Aktivitäten, unautorisierten Systemeingriffe oder gesetzeswidrigen Handlungen.",
        p3: "Wir behalten uns das Recht vor, Fallprüfungen bei begründeten Verdachtsmomenten oder Compliance-Bedenken abzulehnen oder zu beenden."
      },
      cookies: {
        title: "Cookie-Richtlinie",
        subtitle: "Transparenz über den Einsatz von Cookies und technischen Sitzungsdaten.",
        lastUpdated: "Zuletzt aktualisiert: 5. April 2026",
        s1Title: "1. Verwendung von Cookies",
        s1Text: "Wir verwenden funktionale Technologien, um den Betrieb der Website sicherzustellen und die Nutzung zu analysieren. Cookies sind kleine Textdateien, die auf Ihrem Endgerät gespeichert werden.",
        s2Title: "2. Notwendige Cookies",
        s2Text: "Diese Cookies sind für das Funktionieren der Website technisch erforderlich (z.B. Spracheinstellungen) und können in unseren Systemen nicht deaktiviert werden.",
        s3Title: "3. Sicherheits-Cookies",
        s3Text: "Sicherheits-Cookies dienen dem Schutz vor Missbrauch und unberechtigten Zugriffen und unterstützen eine sichere Sitzungsverwaltung bei Formulardateneingaben."
      }
    }
  }
};

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationDictionary;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: translations.en
});

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('siteLanguage');
      if (saved === 'de' || saved === 'en') {
        return saved;
      }
    } catch {
      // fallback
    }
    return 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('siteLanguage', lang);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    document.documentElement.lang = language;
    const currentMeta = translations[language].meta;
    document.title = currentMeta.title;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', currentMeta.description);
    }
  }, [language]);

  const value = {
    language,
    setLanguage,
    t: translations[language]
  };

  return React.createElement(LanguageContext.Provider, { value }, children);
};

export const useLanguage = () => useContext(LanguageContext);

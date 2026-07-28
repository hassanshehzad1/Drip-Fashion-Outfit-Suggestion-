const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
  ShadingType, VerticalAlign, PageNumber, PageBreak, LevelFormat
} = require('docx');
const fs = require('fs');

// ── Color Palette ──────────────────────────────────────────
const C = {
  PINK:   "E91E63", DPINK:  "C2185B", LPINK:  "FCE4EC", MPINK: "F8BBD0",
  DARK:   "1A1A2E", DGRAY:  "37474F", MGRAY:  "78909C", LGRAY: "F5F5F5",
  WHITE:  "FFFFFF", GREEN:  "1B5E20", LGREEN: "E8F5E9", BLUE:  "0D47A1",
  LBLUE:  "E3F2FD", AMBER:  "E65100", LAMBER: "FFF3E0", TEAL:  "004D40",
  LTEAL:  "E0F2F1", DBLUE:  "263238", BORDER: "E0E0E0"
};

// ── Border helpers ──────────────────────────────────────────
const bdr  = (c="CCCCCC", s=4)  => ({ style: BorderStyle.SINGLE, size: s, color: c });
const allB = (c,s)               => ({ top:bdr(c,s), bottom:bdr(c,s), left:bdr(c,s), right:bdr(c,s) });
const noB  = { style: BorderStyle.NONE, size: 0, color: C.WHITE };
const noAll= { top:noB, bottom:noB, left:noB, right:noB };

// ── Cell factory ────────────────────────────────────────────
function cell(text, w, o={}) {
  const { bold=false, bg=C.WHITE, color=C.DGRAY, center=false, italic=false, size=20, wrap=true } = o;
  const isArr = Array.isArray(text);
  return new TableCell({
    width: { size: w, type: WidthType.DXA },
    shading: { fill: bg, type: ShadingType.CLEAR },
    borders: allB(C.BORDER, 4),
    margins: { top: 100, bottom: 100, left: 180, right: 180 },
    verticalAlign: VerticalAlign.CENTER,
    children: isArr ? text : [new Paragraph({
      alignment: center ? AlignmentType.CENTER : AlignmentType.LEFT,
      children: [new TextRun({ text: String(text), bold, color, font:"Arial", size, italics:italic })]
    })]
  });
}

const hCell = (t,w) => cell(t, w, { bold:true, bg:C.PINK,  color:C.WHITE, center:true });
const shCell= (t,w) => cell(t, w, { bold:true, bg:C.LPINK, color:C.DPINK });
const dCell = (t,w) => cell(t, w, { bg:C.LGRAY });

// ── Paragraph helpers ───────────────────────────────────────
const h1 = (t) => new Paragraph({
  heading: HeadingLevel.HEADING_1,
  spacing: { before:520, after:220 },
  border: { bottom:{ style:BorderStyle.SINGLE, size:8, color:C.PINK, space:8 } },
  children: [new TextRun({ text:t, bold:true, color:C.DARK, font:"Arial", size:44 })]
});

const h2 = (t) => new Paragraph({
  heading: HeadingLevel.HEADING_2,
  spacing: { before:380, after:160 },
  children: [new TextRun({ text:t, bold:true, color:C.DPINK, font:"Arial", size:32 })]
});

const h3 = (t) => new Paragraph({
  heading: HeadingLevel.HEADING_3,
  spacing: { before:280, after:120 },
  children: [new TextRun({ text:t, bold:true, color:C.MGRAY, font:"Arial", size:26 })]
});

const para = (t, o={}) => new Paragraph({
  alignment: o.center ? AlignmentType.CENTER : AlignmentType.JUSTIFIED,
  spacing: { before:80, after:100 },
  children: [new TextRun({ text:t, bold:o.bold||false, color:o.color||C.DGRAY, font:"Arial", size:o.size||22, italics:o.italic||false })]
});

const bul = (t, bold=false) => new Paragraph({
  numbering: { reference:"bul", level:0 },
  spacing: { before:60, after:60 },
  children: [new TextRun({ text:t, bold, color:C.DGRAY, font:"Arial", size:22 })]
});

const num = (t) => new Paragraph({
  numbering: { reference:"num", level:0 },
  spacing: { before:60, after:60 },
  children: [new TextRun({ text:t, color:C.DGRAY, font:"Arial", size:22 })]
});

const sp = (n=1) => new Paragraph({ spacing:{ before:0, after:n*140 }, children:[new TextRun("")] });

const divLine = () => new Paragraph({
  spacing:{ before:200, after:200 },
  border:{ bottom:{ style:BorderStyle.SINGLE, size:4, color:C.MPINK, space:1 } },
  children:[new TextRun("")]
});

const callout = (t) => new Paragraph({
  spacing:{ before:120, after:120 },
  indent:{ left:400 },
  border:{ left:{ style:BorderStyle.SINGLE, size:16, color:C.PINK } },
  children:[new TextRun({ text:t, italics:true, color:C.MGRAY, font:"Arial", size:21 })]
});

const note = (label, t) => new Paragraph({
  spacing:{ before:120, after:120 },
  children:[
    new TextRun({ text:label+" ", bold:true, color:C.PINK, font:"Arial", size:20 }),
    new TextRun({ text:t, color:C.DGRAY, font:"Arial", size:20 })
  ]
});

// ── Simple table ────────────────────────────────────────────
function tbl(headers, rows, widths, striped=true) {
  const tw = widths.reduce((a,b)=>a+b,0);
  return new Table({
    width:{ size:tw, type:WidthType.DXA },
    columnWidths: widths,
    rows:[
      new TableRow({ children: headers.map((h,i)=>hCell(h,widths[i])) }),
      ...rows.map((r,ri)=>
        new TableRow({ children: r.map((c,ci)=>cell(c,widths[ci],{ bg:striped&&ri%2!==0?C.LGRAY:C.WHITE })) })
      )
    ]
  });
}

// ── Cover Page ──────────────────────────────────────────────
const cover = () => [
  sp(3),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing:{ before:0, after:160 },
    children:[new TextRun({ text:"👗  DRIP", bold:true, color:C.PINK, font:"Arial", size:128 })]
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing:{ before:0, after:140 },
    children:[new TextRun({ text:"Fashion Reels Platform", bold:true, color:C.DARK, font:"Arial", size:56 })]
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing:{ before:0, after:80 },
    children:[new TextRun({ text:"Pakistan's First Video-Commerce Fashion App", color:C.MGRAY, font:"Arial", size:28 })]
  }),
  sp(1),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing:{ before:0, after:500 },
    children:[
      new TextRun({ text:"COMPLETE PROJECT PROPOSAL", bold:true, color:C.DPINK, font:"Arial", size:26, allCaps:true }),
    ]
  }),
  // Info table
  new Table({
    width:{ size:6960, type:WidthType.DXA },
    columnWidths:[2320,4640],
    rows:[
      ["Project Name",        "Drip — Fashion Reels & E-Commerce Platform"],
      ["Document Type",       "Complete Project Proposal"],
      ["Prepared By",         "Development Team — Drip Technologies"],
      ["Version",             "1.0 — Final"],
      ["Date",                "May 2026"],
      ["Classification",      "E-Commerce / Social Media / Fashion Technology"],
      ["Target Market",       "Pakistan (Phase 1), South Asia (Phase 2)"],
      ["Tech Stack",          "MERN Stack + Socket.io + AI Recommendations"],
      ["Backend Status",      "Complete & Tested (13 Phases)"],
      ["Frontend Status",     "In Development (React 18 + Vite)"],
    ].map(([k,v],i)=>
      new TableRow({ children:[
        cell(k, 2320, { bold:true, bg:i%2===0?C.LPINK:C.WHITE, color:C.DPINK }),
        cell(v, 4640, { bg:i%2===0?C.WHITE:C.LGRAY })
      ]})
    )
  }),
  sp(2),
  new Paragraph({
    alignment:AlignmentType.CENTER,
    children:[new TextRun({ text:"Confidential — For Internal and Stakeholder Review Only", color:C.MGRAY, font:"Arial", size:18, italics:true })]
  }),
  new Paragraph({ children:[new PageBreak()] }),
];

// ══════════════════════════════════════════════════════════════
// DOCUMENT BODY
// ══════════════════════════════════════════════════════════════
const doc = new Document({
  numbering:{
    config:[
      { reference:"bul", levels:[{ level:0, format:LevelFormat.BULLET, text:"•", alignment:AlignmentType.LEFT,
          style:{ paragraph:{ indent:{ left:720, hanging:360 } } } }] },
      { reference:"num", levels:[{ level:0, format:LevelFormat.DECIMAL, text:"%1.", alignment:AlignmentType.LEFT,
          style:{ paragraph:{ indent:{ left:720, hanging:360 } } } }] },
      { reference:"sub", levels:[{ level:0, format:LevelFormat.BULLET, text:"–", alignment:AlignmentType.LEFT,
          style:{ paragraph:{ indent:{ left:1080, hanging:360 } } } }] },
    ]
  },
  styles:{
    default:{ document:{ run:{ font:"Arial", size:22, color:C.DGRAY } } },
    paragraphStyles:[
      { id:"Heading1", name:"Heading 1", basedOn:"Normal", next:"Normal", quickFormat:true,
        run:{ size:44, bold:true, font:"Arial", color:C.DARK },
        paragraph:{ spacing:{ before:520, after:220 }, outlineLevel:0 } },
      { id:"Heading2", name:"Heading 2", basedOn:"Normal", next:"Normal", quickFormat:true,
        run:{ size:32, bold:true, font:"Arial", color:C.DPINK },
        paragraph:{ spacing:{ before:380, after:160 }, outlineLevel:1 } },
      { id:"Heading3", name:"Heading 3", basedOn:"Normal", next:"Normal", quickFormat:true,
        run:{ size:26, bold:true, font:"Arial", color:C.MGRAY },
        paragraph:{ spacing:{ before:280, after:120 }, outlineLevel:2 } },
    ]
  },
  sections:[{
    properties:{
      page:{
        size:{ width:12240, height:15840 },
        margin:{ top:1440, right:1296, bottom:1440, left:1296 }
      }
    },
    headers:{
      default: new Header({
        children:[new Paragraph({
          alignment:AlignmentType.RIGHT,
          border:{ bottom:{ style:BorderStyle.SINGLE, size:4, color:C.PINK, space:6 } },
          children:[new TextRun({ text:"Drip — Fashion Reels Platform  |  Project Proposal v1.0", color:C.MGRAY, font:"Arial", size:16 })]
        })]
      })
    },
    footers:{
      default: new Footer({
        children:[new Paragraph({
          alignment:AlignmentType.CENTER,
          border:{ top:{ style:BorderStyle.SINGLE, size:4, color:C.PINK, space:6 } },
          children:[
            new TextRun({ text:"Confidential — Drip Technologies  |  Page ", color:C.MGRAY, font:"Arial", size:16 }),
            new TextRun({ children:[PageNumber.CURRENT], color:C.PINK, font:"Arial", size:16, bold:true }),
            new TextRun({ text:" of ", color:C.MGRAY, font:"Arial", size:16 }),
            new TextRun({ children:[PageNumber.TOTAL_PAGES], color:C.MGRAY, font:"Arial", size:16 }),
          ]
        })]
      })
    },
    children:[

      // ── COVER ─────────────────────────────────────────────
      ...cover(),

      // ══════════════════════════════════════════════════════
      // SECTION 1 — BRIEF OVERVIEW
      // ══════════════════════════════════════════════════════
      h1("1. Brief Overview"),

      para("Drip is Pakistan's first dedicated Fashion Reels platform — a mobile-first, full-stack web application that seamlessly merges short-form video entertainment with direct in-video e-commerce. The platform is designed for the rapidly growing Pakistani fashion market, where young, digitally-native consumers seek engaging, visual, and instant shopping experiences."),
      sp(0.5),
      para("At its core, Drip allows fashion brands and independent designers — called Fashion Partners — to upload short outfit videos (reels) that users can watch, engage with socially, and purchase from directly, all without leaving the application. This eliminates the friction of traditional e-commerce where customers must navigate between social platforms and shopping websites."),

      sp(0.5),
      h2("1.1 The Problem Drip Solves"),
      tbl(
        ["Problem", "How Drip Solves It"],
        [
          ["Fashion brands in Pakistan spend heavily on Instagram/TikTok marketing but purchases happen on separate platforms — high drop-off rates", "In-video shopping: users click Shop Now directly on the reel and complete purchase without leaving the app"],
          ["No dedicated fashion discovery platform for Pakistani consumers — international platforms like ASOS don't serve the local market well", "Drip is built specifically for Pakistani fashion categories (ethnic, casual, streetwear, luxury) with PKR pricing and COD support"],
          ["New brands have no affordable way to reach targeted fashion audiences", "Partner onboarding is free — upload reels and start selling immediately with zero upfront infrastructure cost"],
          ["Generic e-commerce shows irrelevant products — poor personalization", "AI recommendation engine learns from every interaction and personalizes the feed for each user within 24 hours"],
          ["No real-time communication between buyers and sellers on e-commerce platforms", "Built-in Socket.io powered chat allows users to message fashion partners directly about sizing, availability, and customization"],
        ],
        [3600, 5760]
      ),

      sp(0.5),
      h2("1.2 Platform at a Glance"),
      tbl(
        ["Metric", "Value"],
        [
          ["Total API Endpoints",       "80+ REST endpoints across 13 modules"],
          ["Database Models",           "13 MongoDB collections with compound indexes"],
          ["Real-Time Features",        "Socket.io — notifications, chat, typing indicators, read receipts"],
          ["AI Recommendation Factors", "6-factor scoring algorithm (0–100 relevance score per outfit)"],
          ["Security Layers",           "15 hardened security measures including RBAC, rate limiting, JWT rotation"],
          ["Payment Methods",           "Stripe (credit/debit card) + COD (Cash on Delivery)"],
          ["Media CDN",                 "ImageKit — video streaming and image delivery"],
          ["User Roles",                "4 — User (shopper), Fashion Partner (brand), Moderator Admin, Superadmin"],
          ["Notification Types",        "11 types — likes, comments, follows, orders, system alerts"],
          ["Build Phases Completed",    "13 backend phases fully tested and production-ready"],
        ],
        [3600, 5760]
      ),

      new Paragraph({ children:[new PageBreak()] }),

      // ══════════════════════════════════════════════════════
      // SECTION 2 — ABSTRACT
      // ══════════════════════════════════════════════════════
      h1("2. Abstract"),

      para("This document presents the complete project proposal for Drip, a novel fashion e-commerce platform that integrates short-form video content, social engagement, artificial intelligence-driven personalization, and real-time communication into a unified consumer experience. The project addresses a significant gap in Pakistan's digital fashion market — the absence of a dedicated, video-first shopping platform that serves local brands, local pricing, and local delivery preferences."),
      sp(0.5),
      para("Drip is architected as a full-stack MERN (MongoDB, Express.js, React, Node.js) application augmented with Socket.io for real-time bidirectional communication, ImageKit for cloud-based video and image delivery, and Stripe for secure payment processing. The backend comprises 13 independently developed and tested phases, exposing 80+ REST API endpoints organized across Authentication, Partner Management, Outfit Feed, Social Features, Search and Discovery, Cart and Orders, Notifications, Chat, AI Recommendations, Content Moderation, Admin Analytics, Security, and Upload modules."),
      sp(0.5),
      para("The platform's differentiating innovation is its proprietary AI recommendation system — a content-based filtering algorithm that computes a real-time relevance score (0 to 100) for every outfit against every user's behavioral profile. The algorithm incorporates six weighted factors: category interaction history, followed partner relationships, style preference tag overlap, direct category preferences, trending engagement scores, and content freshness. This produces a dynamic, personalized feed that improves with every interaction, solving the discovery problem that plagues generic fashion e-commerce platforms."),
      sp(0.5),
      para("Security is implemented at 15 layers including Helmet HTTP headers, CORS whitelisting, six-tier rate limiting, NoSQL injection prevention, XSS sanitization, bcrypt password hashing with salt rounds of 12, JWT access token rotation with 15-minute expiry, and environment validation at server startup. The platform supports three distinct user roles — Shopper, Fashion Partner, and Administrator — each with separate authentication flows, JWT token claims, and access control middleware."),
      sp(0.5),
      para("The business model is designed for the Pakistani market with specific consideration for Cash on Delivery (the dominant payment preference in Pakistan), PKR pricing, local fashion categories including ethnic and streetwear, and mobile-first design targeting smartphone users. The platform positions itself as infrastructure for Pakistan's fashion economy — enabling any designer or brand to reach a national audience by simply uploading a short video."),

      sp(0.5),
      callout("Drip is not just an app — it is the infrastructure layer for Pakistan's fashion economy. Any brand, anywhere in Pakistan, can upload a 30-second outfit reel and start receiving orders from across the country within minutes."),

      sp(0.5),
      h2("2.1 Key Research Questions Addressed"),
      num("How can short-form video content be leveraged as a primary e-commerce discovery mechanism rather than merely a marketing tool?"),
      num("What algorithm architecture produces meaningful personalization for fashion content with minimal cold-start friction for new users?"),
      num("How can real-time bidirectional communication be integrated into an e-commerce platform to reduce purchase hesitation and improve conversion?"),
      num("What security architecture is appropriate for a multi-role platform handling financial transactions, personal data, and user-generated content?"),
      num("How can Pakistan's unique payment preferences (COD dominance) be integrated with global payment infrastructure (Stripe) in a technically coherent manner?"),

      sp(0.5),
      h2("2.2 Summary of Findings and Solutions"),
      tbl(
        ["Research Question", "Solution Implemented"],
        [
          ["Video as commerce mechanism", "Intersection Observer API drives autoplay; Shop Now button overlaid on active reel; cart addition without leaving feed"],
          ["Personalization with cold start", "6-factor AI scoring + Style Quiz seeds categoryScores for new users before any interaction"],
          ["Real-time communication", "Socket.io rooms (user:id, partner:id) for targeted delivery; fire-and-forget pattern ensures main API never fails due to socket issues"],
          ["Multi-role security", "Separate JWT token claims (role field), separate middleware chains, separate database models for User / FashionPartner / Admin"],
          ["COD + Stripe integration", "Dual payment flow: COD creates order immediately; Stripe creates PaymentIntent and waits for webhook confirmation before order creation"],
        ],
        [3240, 6120]
      ),

      new Paragraph({ children:[new PageBreak()] }),

      // ══════════════════════════════════════════════════════
      // SECTION 3 — INTRODUCTION
      // ══════════════════════════════════════════════════════
      h1("3. Introduction"),

      h2("3.1 Background and Motivation"),
      para("Pakistan's fashion industry is one of the country's largest economic sectors, contributing significantly to GDP through textile exports, domestic retail, and a growing designer economy. However, the digital infrastructure supporting this industry lags far behind its potential. Fashion brands in Pakistan operate primarily through Instagram and Facebook for discovery, WhatsApp for order communication, and Daraz or direct bank transfers for payment — a fragmented, friction-heavy customer journey that results in high abandonment rates and limited scalability for small and medium fashion businesses."),
      sp(0.5),
      para("Simultaneously, the global success of TikTok, Instagram Reels, and YouTube Shorts has demonstrated conclusively that short-form video is the dominant content consumption format for Generation Z and Millennials — exactly the demographic with the highest fashion spending power. Platforms like TikTok Shop in the United States and Southeast Asia have already proven that video-commerce (shoppable video) is not merely a trend but a structural shift in how consumers discover and purchase fashion products."),
      sp(0.5),
      para("Drip is motivated by the convergence of these two realities: Pakistan has a massive, underserved fashion economy and a young, mobile-first population that already consumes short-form video content daily. The platform is built to be the missing infrastructure layer — connecting fashion creators and brands directly to consumers through the most engaging content format available, with frictionless purchasing built in from the ground up."),

      sp(0.5),
      h2("3.2 Market Context"),
      tbl(
        ["Market Indicator", "Detail", "Source / Context"],
        [
          ["Pakistan internet users",         "124+ million (2024)",            "Pakistan Telecommunication Authority"],
          ["Smartphone penetration",          "47% and growing rapidly",        "GSMA Mobile Economy Report"],
          ["Fashion e-commerce growth",       "28% YoY (2022–2024)",            "Pakistan E-Commerce Council"],
          ["COD preference",                  "70%+ of online orders",          "Daraz / industry estimates"],
          ["TikTok Shop GMV (global)",        "$20B+ in 2023",                  "Bloomberg Technology"],
          ["Instagram fashion engagement",    "3.5x higher than other sectors", "Meta Business Insights"],
          ["Pakistani fashion market size",   "$15B+ annually",                 "Pakistan Bureau of Statistics"],
          ["Young population (18–35 yrs)",    "35% of total population",        "World Bank Pakistan Data"],
        ],
        [2880, 3240, 3240]
      ),

      sp(0.5),
      h2("3.3 Vision Statement"),
      callout("\"To become the definitive platform where Pakistan's fashion industry lives — where every designer can showcase their craft through video, every brand can build a following, and every shopper can discover and own the styles they love, all in one seamless experience.\""),

      sp(0.5),
      h2("3.4 Mission Statement"),
      callout("\"To democratize fashion commerce in Pakistan by providing brands of all sizes with zero-barrier video-based storefronts, and providing consumers with an AI-personalized, socially engaging discovery experience that makes fashion shopping feel like entertainment.\""),

      sp(0.5),
      h2("3.5 Core Value Proposition"),
      tbl(
        ["Stakeholder", "Value Proposition"],
        [
          ["Fashion Brand / Designer (Partner)", "Zero upfront cost to list products. Upload one 30-second video and reach a national audience. Manage orders, track analytics, and communicate with customers — all in one dashboard."],
          ["Consumer (Shopper)", "Discover fashion through entertaining video content. Get a personalized feed that improves with every like and purchase. Buy in two taps with COD or card. Chat directly with the brand before buying."],
          ["Platform (Drip)", "Commission on every transaction (5–10%). Premium partner listing fees. Data-driven fashion trend intelligence. Advertising platform potential at scale."],
          ["Pakistan's Fashion Economy", "Formalization of small designer businesses. Digital transaction records replacing informal WhatsApp commerce. Export enablement through digital infrastructure."],
        ],
        [2520, 6840]
      ),

      sp(0.5),
      h2("3.6 Project Objectives"),
      h3("Primary Objectives"),
      num("Build a production-grade, scalable fashion reels platform serving both consumers and fashion brands through separate, purpose-built interfaces."),
      num("Implement an AI recommendation system that delivers meaningful feed personalization within a user's first 24 hours on the platform, without requiring manual configuration."),
      num("Create a complete real-time communication infrastructure supporting instant notifications, read receipts, typing indicators, and direct messaging between buyers and sellers."),
      num("Design and implement a secure, multi-role authentication system supporting separate account types for shoppers, fashion brands, and platform administrators."),
      num("Integrate a dual payment system supporting both Stripe card payments and Cash on Delivery to serve Pakistan's diverse payment preferences."),

      sp(0.5),
      h3("Secondary Objectives"),
      num("Establish a content moderation framework enabling platform administrators to approve partners, moderate content, and maintain platform quality standards."),
      num("Implement comprehensive platform analytics providing administrators with real-time insights into user growth, revenue, content performance, and partner activity."),
      num("Achieve industry-standard security across all 15 identified vulnerability vectors including injection attacks, brute force, token theft, and privilege escalation."),
      num("Design the frontend for full accessibility compliance (WCAG AA) and mobile-first responsiveness across all device sizes from 375px to 1440px."),

      sp(0.5),
      h2("3.7 Scope of the Project"),
      h3("In Scope"),
      bul("Complete backend REST API — 80+ endpoints across 13 modules, fully tested"),
      bul("User-facing frontend — feed, explore, cart, checkout, orders, profile, notifications, chat"),
      bul("Partner dashboard — outfit upload, order management, analytics, profile"),
      bul("Admin panel — user management, partner approval, content moderation, analytics"),
      bul("AI recommendation engine — content-based filtering with 6-factor scoring"),
      bul("Real-time system — Socket.io notifications, chat, typing indicators, read receipts"),
      bul("Payment integration — Stripe card payments + Cash on Delivery"),
      bul("Media infrastructure — ImageKit CDN for video streaming and image delivery"),
      bul("Security hardening — 15-layer security implementation"),
      bul("Complete documentation — SRS, API documentation, project proposal"),

      sp(0.5),
      h3("Out of Scope (Future Phases)"),
      bul("Native mobile applications (iOS / Android) — Phase 2"),
      bul("Live streaming / live commerce features — Phase 3"),
      bul("International expansion and multi-currency support — Phase 3"),
      bul("Brand advertising and sponsored content system — Phase 2"),
      bul("Affiliate and influencer marketing module — Phase 2"),
      bul("Advanced ML model training for recommendations — Phase 3"),

      sp(0.5),
      h2("3.8 Technology Philosophy"),
      para("Drip is built on the principle that the technology stack should be chosen for long-term maintainability, developer ecosystem maturity, and performance at scale — not novelty. Every technology decision has a specific justification:"),
      sp(0.3),
      tbl(
        ["Technology Choice", "Justification", "Alternative Considered"],
        [
          ["Node.js + Express",    "Non-blocking I/O ideal for real-time features; largest npm ecosystem; team expertise", "Django (Python) — rejected due to weaker real-time support"],
          ["MongoDB Atlas",        "Flexible schema for evolving fashion data; excellent geospatial support; managed service reduces ops burden", "PostgreSQL — rejected due to schema rigidity for variable outfit attributes"],
          ["Socket.io",            "Automatic WebSocket / long-polling fallback; built-in room management; proven at scale", "Firebase Realtime DB — rejected due to vendor lock-in and cost at scale"],
          ["JWT + Refresh Tokens", "Stateless auth reduces DB load; 15-min access window limits theft damage; refresh rotation detects replay attacks", "Sessions — rejected due to horizontal scaling complexity"],
          ["ImageKit CDN",         "Free tier, automatic video thumbnail generation, watermarking, adaptive streaming — purpose-built for media", "Cloudinary — rejected due to higher cost at scale"],
          ["Stripe",               "Most reliable payment gateway with strong Pakistan support; excellent webhook system", "JazzCash/EasyPaisa — considered for Phase 2 local integration"],
          ["React 18 + Vite",      "Concurrent rendering for smooth reel scrolling; Vite's instant HMR accelerates development", "Next.js — rejected due to SSR complexity unnecessary for this SPA"],
          ["Zustand",              "Minimal boilerplate; excellent performance; persist middleware for auth state", "Redux — rejected due to excessive boilerplate for this project scale"],
        ],
        [2160, 3960, 3240]
      ),

      sp(0.5),
      h2("3.9 Project Timeline Overview"),
      tbl(
        ["Phase", "Module", "Status", "Duration"],
        [
          ["Backend Phase 1",  "Project Setup, Server, Logger, Error Handling",           "Complete", "Week 1"],
          ["Backend Phase 2",  "User Authentication — JWT, Refresh Tokens, RBAC",        "Complete", "Week 1"],
          ["Backend Phase 3",  "Fashion Partner Authentication — Separate Model",         "Complete", "Week 1"],
          ["Backend Phase 4",  "ImageKit Upload Service — Images & Videos",              "Complete", "Week 2"],
          ["Backend Phase 5",  "Outfit Item CRUD — Feed, Search Index, Virtuals",        "Complete", "Week 2"],
          ["Backend Phase 6",  "Social Features — Likes, Bookmarks, Follows, Comments",  "Complete", "Week 2"],
          ["Backend Phase 7",  "Search & Discovery — Full-text, Trending, Suggestions",  "Complete", "Week 3"],
          ["Backend Phase 8",  "Cart & Orders — Stripe, COD, Webhook, Lifecycle",        "Complete", "Week 3"],
          ["Backend Phase 9",  "Notifications — Socket.io, 11 Types, Persistence",       "Complete", "Week 3"],
          ["Backend Phase 10", "Chat / DMs — Real-time Messaging, Read Receipts",        "Complete", "Week 4"],
          ["Backend Phase 11", "Admin Panel — RBAC, Analytics, Moderation",              "Complete", "Week 4"],
          ["Backend Phase 12", "AI Recommendations — 6-Factor Scoring, Style Quiz",      "Complete", "Week 4"],
          ["Backend Phase 13", "Security Hardening — 15 Layers, Rate Limiting",          "Complete", "Week 5"],
          ["Frontend Phase 1", "Setup, Auth Pages, Routing, Axios Interceptors",         "In Progress", "Week 5"],
          ["Frontend Phase 2", "Reels Feed — Video Autoplay, Infinite Scroll",           "Planned",  "Week 6"],
          ["Frontend Phase 3", "Social Features — Optimistic Updates, Comments",         "Planned",  "Week 6"],
          ["Frontend Phase 4", "Explore & Search — Debounce, Autocomplete, Filters",    "Planned",  "Week 7"],
          ["Frontend Phase 5", "Cart, Checkout, Orders — Stripe Elements, COD",         "Planned",  "Week 7"],
          ["Frontend Phase 6", "Notifications & Real-Time — Socket.io Client",          "Planned",  "Week 8"],
          ["Frontend Phase 7", "Chat / DMs — Real-time Messages, Typing Indicators",   "Planned",  "Week 8"],
          ["Frontend Phase 8", "Partner Dashboard — Upload, Orders, Analytics",         "Planned",  "Week 9"],
          ["Frontend Phase 9", "Admin Panel, AI Pages, Accessibility, Polish",          "Planned",  "Week 9"],
        ],
        [1080, 4320, 1440, 1440]
      ),

      new Paragraph({ children:[new PageBreak()] }),

      // ══════════════════════════════════════════════════════
      // SECTION 4 — SYSTEM ARCHITECTURE OVERVIEW
      // ══════════════════════════════════════════════════════
      h1("4. System Architecture Overview"),

      para("Drip follows a clean three-tier architecture: a React single-page application on the client tier, a Node.js/Express REST API on the application tier, and MongoDB Atlas on the data tier. Socket.io runs on the same Node.js HTTP server for real-time events. External services (ImageKit, Stripe) are abstracted through dedicated service modules."),

      sp(0.5),
      h2("4.1 Architecture Layers"),
      tbl(
        ["Layer", "Technology", "Responsibility"],
        [
          ["Client Tier",         "React 18, Vite, Tailwind CSS, Zustand, TanStack Query", "UI rendering, state management, real-time event handling, file selection"],
          ["API Gateway",         "Express.js, Helmet, CORS, Rate Limiter, Morgan",        "Request routing, security headers, rate limiting, logging"],
          ["Auth Layer",          "JWT, bcrypt, httpOnly cookies",                          "Token issuance, validation, refresh rotation, role enforcement"],
          ["Business Logic",      "13 Controller modules, catchAsync wrapper",              "All business rules, validation, orchestration of DB and services"],
          ["Real-Time Layer",     "Socket.io 4.x with room-based delivery",                "Notifications, chat messages, read receipts, typing indicators"],
          ["Data Layer",          "MongoDB Atlas, Mongoose 7.x, compound indexes",          "Persistence, relationships, aggregation pipelines, text search"],
          ["Media Layer",         "ImageKit CDN",                                          "Video/image upload, storage, streaming, thumbnail generation"],
          ["Payment Layer",       "Stripe API + Webhook",                                  "PaymentIntent creation, card processing, webhook order confirmation"],
          ["AI Layer",            "Custom scoring service (ai.service.js)",                "categoryScore updates, relevance scoring, style analysis"],
          ["Security Layer",      "15 middleware functions",                                "Injection prevention, XSS, CSRF, brute force, env validation"],
        ],
        [1800, 3240, 4320]
      ),

      sp(0.5),
      h2("4.2 Request Flow"),
      para("Every API request passes through an ordered middleware pipeline before reaching the controller:"),
      num("Rate Limiter — checks request count per IP against tier-specific limits"),
      num("Helmet — attaches 15+ security response headers"),
      num("CORS — validates origin against whitelist"),
      num("Body Parser — parses JSON (10MB limit)"),
      num("Cookie Parser — extracts refresh token from httpOnly cookie"),
      num("MongoSanitize — strips NoSQL injection operators ($gt, $ne, $where)"),
      num("HPP — removes duplicate query parameters"),
      num("Auth Middleware — verifies JWT, attaches req.user / req.partner / req.admin"),
      num("Permission Check — validates RBAC permissions for admin routes"),
      num("Validation — runs express-validator chains, returns 422 on failure"),
      num("Controller — executes business logic inside catchAsync wrapper"),
      num("Side Effects — fire-and-forget: notifications, AI tracking, socket events"),
      num("sendResponse — formats and sends standardized JSON response"),

      sp(0.5),
      h2("4.3 Database Design Highlights"),
      tbl(
        ["Collection", "Key Design Decision", "Why"],
        [
          ["users",           "categoryScores as MongoDB Map field",                   "Atomic $inc updates prevent race conditions on concurrent interactions"],
          ["outfititems",     "Compound text index on title+description+tags+category", "Enables full-text search with relevance scoring"],
          ["likes/bookmarks", "Compound unique index {user, outfit}",                  "Database-level duplicate prevention — faster than application checks"],
          ["follows",         "Compound unique index {follower, following}",           "Prevents duplicate follows without application logic"],
          ["carts",           "Unique index on user field + priceAtAdd field",         "One cart per user; price locked at add time prevents race conditions"],
          ["orders",          "Pre-save hook for DRP-YYYYMM-XXXXXX order numbers",    "Human-readable unique identifiers for customer service"],
          ["messages",        "conversationId = sorted(id1, id2).join('_')",           "Consistent thread ID regardless of who initiates conversation"],
          ["notifications",   "Stored in DB + emitted via Socket.io simultaneously",  "Offline users receive notifications on next login; online users get instant delivery"],
        ],
        [1800, 3600, 3960]
      ),

      new Paragraph({ children:[new PageBreak()] }),

      // ══════════════════════════════════════════════════════
      // SECTION 5 — FEATURES
      // ══════════════════════════════════════════════════════
      h1("5. Core Features & Functionality"),

      h2("5.1 User Features"),
      tbl(
        ["Feature", "Description", "Technology"],
        [
          ["Reels Feed",           "Vertical snap-scroll video feed. Videos autoplay when 50% visible. Infinite scroll loads more as user scrolls. AI-personalized or chronological mode.", "Intersection Observer API, TanStack Query infinite scroll"],
          ["AI Personalization",   "Feed personalized by 6-factor scoring. Improves with every like, bookmark, and order. Style quiz seeds preferences for new users.", "Custom content-based filtering algorithm, MongoDB Map"],
          ["Direct Shopping",      "Shop Now button overlaid on active reel. Size and color selector. Add to cart without leaving feed.", "Optimistic updates, Zustand cart store"],
          ["Social Engagement",    "Like, bookmark, comment (1-level nested), share. Follow fashion brands. All with real-time counts.", "Socket.io notifications, atomic MongoDB $inc"],
          ["Cart & Checkout",      "Price locked at add time. COD and Stripe card payment. Order confirmation via Stripe webhook.", "Stripe Elements, PaymentIntent, webhook"],
          ["Order Tracking",       "Full order lifecycle: Pending → Confirmed → Processing → Shipped → Delivered. Real-time status push notifications.", "Socket.io, order status middleware"],
          ["Real-time Chat",       "Direct messaging with fashion brands. Read receipts (blue ticks). Typing indicators. Outfit sharing in chat.", "Socket.io rooms, conversationId algorithm"],
          ["Notifications",        "11 notification types. Real-time delivery + DB persistence. Unread count badge. Mark all as read.", "Socket.io + MongoDB dual write"],
          ["Style Analysis",       "AI profile showing top categories, engagement score, liked categories, ordered categories.", "MongoDB aggregation pipeline"],
          ["Complete the Look",    "Complementary outfit suggestions based on category compatibility map.", "ai.service.js complementary map algorithm"],
        ],
        [1800, 4680, 2880]
      ),

      sp(0.5),
      h2("5.2 Fashion Partner Features"),
      tbl(
        ["Feature", "Description"],
        [
          ["Partner Registration",  "Free registration. Awaits admin approval before login permitted. Notification sent on approval."],
          ["Video Upload",          "Upload reels up to 100MB via ImageKit CDN. Progress bar. Thumbnail auto-generated."],
          ["Outfit Management",     "Create, edit, delete outfit listings. Toggle active/featured status. Price, sizes, colors, tags, category."],
          ["Order Management",      "View all orders. Update status through allowed lifecycle transitions. Real-time notification on new orders."],
          ["Dashboard Analytics",   "Total sales, revenue, followers, outfit performance. Revenue charts by week/month."],
          ["Customer Chat",         "Real-time messaging with customers. Outlet share. Read receipts and typing indicators."],
          ["Public Brand Page",     "Public profile at /partner/:id showing all outfits, follower count, brand description."],
        ],
        [2880, 6480]
      ),

      sp(0.5),
      h2("5.3 Admin Panel Features"),
      tbl(
        ["Feature", "Permission Required", "Capability"],
        [
          ["Platform Analytics", "view_analytics",   "Overview stats, revenue charts, top outfits/partners, orders by status, monthly revenue trends"],
          ["User Management",    "manage_users",     "List all users, search, filter, view details, ban/unban with notification"],
          ["Partner Management", "manage_partners",  "List partners, approve/reject registration, ban/unban, view revenue stats"],
          ["Content Moderation", "manage_content",   "List all outfits/comments, remove policy violations (deletes from DB + CDN)"],
          ["Order Management",   "manage_orders",    "View all orders across all partners, filter by status and payment status"],
          ["Admin Management",   "manage_admins",    "Superadmin only: create moderator admins, assign granular permissions, update permissions"],
        ],
        [2160, 2160, 5040]
      ),

      new Paragraph({ children:[new PageBreak()] }),

      // ══════════════════════════════════════════════════════
      // SECTION 6 — AI RECOMMENDATION SYSTEM
      // ══════════════════════════════════════════════════════
      h1("6. AI Recommendation System"),

      para("Drip's recommendation engine is a proprietary content-based filtering system built entirely in Node.js without any external AI or machine learning service. It implements the same foundational algorithm used by Netflix, Spotify, and TikTok at their core before neural network enhancement layers are added."),

      sp(0.5),
      h2("6.1 How It Works"),
      num("Every user interaction (view, like, comment, bookmark, share, order) increments the user's categoryScores Map for the outfit's category using MongoDB atomic $inc operations."),
      num("When a user opens the feed, the system fetches a pool of 200 active outfits."),
      num("Each outfit is scored 0–100 against the user's profile using the calculateOutfitScore() pure function (no database calls during scoring)."),
      num("Outfits are sorted by relevance score descending. The top N are returned based on pagination."),
      num("Result: the feed feels more personalized with every interaction."),

      sp(0.5),
      h2("6.2 Scoring Formula"),
      tbl(
        ["Factor", "Max Score", "Formula"],
        [
          ["Category Score Match",    "40 pts", "(userCategoryScore / maxCategoryScore) × 40 — normalized to prevent single-category dominance"],
          ["Followed Partner Bonus",  "20 pts", "Binary: +20 if outfit's partner is in the user's follow list, else 0"],
          ["Style Tag Overlap",       "15 pts", "(matchingTags / userPreferenceCount) × 15 — rewards outfits whose tags match user's style keywords"],
          ["Direct Category Match",   "10 pts", "Binary: +10 if outfit's category is explicitly in user's stylePreferences array"],
          ["Trending Score",          "10 pts", "min((views×0.3 + likes×0.7) / 100, 1) × 10 — rewards popular and viral content"],
          ["Freshness Bonus",         "5 pts",  "< 1 day: 5pts   1–3 days: 3pts   3–7 days: 1pt   > 7 days: 0pts"],
          ["TOTAL",                   "100 pts","Sum of all factors. Higher score = higher position in personalized feed"],
        ],
        [2160, 1440, 5760]
      ),

      sp(0.5),
      h2("6.3 Interaction Weights"),
      tbl(
        ["Action", "Weight", "Rationale"],
        [
          ["view",     "0.5",  "Weak signal — user may have scrolled past without genuine interest"],
          ["like",     "2.0",  "Moderate signal — active positive response to the content"],
          ["comment",  "2.5",  "Strong signal — user engaged enough to write a response"],
          ["bookmark", "3.0",  "Strong signal — user intends to return, likely considering purchase"],
          ["share",    "3.5",  "Very strong signal — user advocates the content to their network"],
          ["order",    "5.0",  "Strongest signal — user committed money to this category"],
        ],
        [1440, 1080, 6840]
      ),

      sp(0.5),
      callout("Cold Start Solution: New users with no interaction history receive a non-personalized feed. The Style Quiz (POST /api/ai/style-quiz) solves this by seeding initial categoryScores from quiz answers, enabling a personalized feed immediately on the first login."),

      new Paragraph({ children:[new PageBreak()] }),

      // ══════════════════════════════════════════════════════
      // SECTION 7 — SECURITY
      // ══════════════════════════════════════════════════════
      h1("7. Security Architecture"),

      tbl(
        ["Layer", "Implementation", "Attack Prevented"],
        [
          ["Security Headers",      "Helmet.js (15+ headers including CSP, X-Frame-Options, HSTS)", "XSS, clickjacking, MIME sniffing, content injection"],
          ["CORS",                  "Origin whitelist — only approved frontend URLs",               "Unauthorized cross-origin API access"],
          ["Rate Limiting",         "6 tiers: Global 100/15min, Auth 10/15min, Admin 5/15min, Upload 20/hr, Search 30/min, AI 20/min", "Brute force, DDoS, scraping"],
          ["NoSQL Injection",       "express-mongo-sanitize strips $gt, $ne, $where operators",    "MongoDB operator injection"],
          ["XSS Prevention",        ".escape() on all text fields + Content Security Policy",       "Script injection in stored content"],
          ["HTTP Param Pollution",  "express-hpp removes duplicate query parameters",               "Array injection via duplicate params"],
          ["Password Security",     "bcrypt with salt rounds of 12",                               "Plain-text exposure on database breach"],
          ["JWT Security",          "15-min access token + 7-day refresh in httpOnly cookie",       "XSS token theft, session hijacking"],
          ["Token Rotation",        "Refresh token reuse detection invalidates all sessions",       "Refresh token theft and replay attacks"],
          ["Input Validation",      "express-validator on every route before controller executes",  "Malformed data, type confusion attacks"],
          ["Ownership Checks",      "Controller-level verification of resource ownership",          "Horizontal privilege escalation"],
          ["RBAC",                  "Role + permission middleware on every admin route",            "Vertical privilege escalation"],
          ["select: false",         "Mongoose schema config on password + refreshToken fields",     "Accidental credential exposure in responses"],
          ["Env Validation",        "Server startup validation — exits process on missing secrets", "Missing credentials in production deployment"],
          ["Soft Delete",           "isActive: false pattern rather than physical deletion",        "Irreversible data loss; preserves audit trail"],
        ],
        [2160, 3600, 3600]
      ),

      new Paragraph({ children:[new PageBreak()] }),

      // ══════════════════════════════════════════════════════
      // SECTION 8 — BUSINESS MODEL
      // ══════════════════════════════════════════════════════
      h1("8. Business Model"),

      h2("8.1 Revenue Streams"),
      tbl(
        ["Revenue Stream", "Model", "Projected Rate"],
        [
          ["Transaction Commission",    "Percentage of every completed order",                   "5% on COD, 3% on Stripe (net of fees)"],
          ["Premium Partner Plans",     "Monthly subscription for featured placement + analytics", "PKR 2,000–8,000 / month"],
          ["Sponsored Outfit Placement","Partners pay to appear at top of category feeds",        "PKR 500–2,000 per day"],
          ["AI Style Reports",          "Detailed style analytics reports for brands",            "PKR 1,500–5,000 per report"],
          ["Affiliate Program",         "Revenue share with fashion influencers",                 "Phase 2 — 10% of referred sales"],
        ],
        [2520, 3600, 3240]
      ),

      sp(0.5),
      h2("8.2 Cost Structure"),
      tbl(
        ["Cost Category", "Item", "Estimated Monthly Cost"],
        [
          ["Infrastructure",  "MongoDB Atlas M10 cluster",           "~$57/month"],
          ["Infrastructure",  "Vercel / Railway deployment",         "~$20/month"],
          ["Media",           "ImageKit CDN (20GB storage, 50GB BW)", "~$49/month"],
          ["Payment",         "Stripe processing fees",              "2.9% + $0.30 per card transaction"],
          ["Communication",   "Email notifications (SendGrid)",      "~$15/month"],
          ["Domain & SSL",    "Custom domain + SSL certificate",     "~$12/year"],
        ],
        [1800, 3240, 4320]
      ),

      sp(0.5),
      h2("8.3 Competitive Advantage"),
      bul("Only platform in Pakistan combining short-form video + direct commerce + AI personalization in one product"),
      bul("COD support from Day 1 — the dominant payment preference in Pakistan that most global platforms ignore"),
      bul("Ethnic and local fashion category support — designed for salwar kameez, shalwar, kurtas, dupattas, not just western fashion"),
      bul("Zero cost for partners to list — lower barrier than Daraz which requires formal business registration"),
      bul("Real-time chat built-in — reduces the 'WhatsApp step' that currently breaks the purchase flow"),
      bul("AI recommendations that work with as few as 5 interactions — not 500 like larger platforms require"),

      new Paragraph({ children:[new PageBreak()] }),

      // ══════════════════════════════════════════════════════
      // SECTION 9 — CONCLUSION
      // ══════════════════════════════════════════════════════
      h1("9. Conclusion"),

      para("Drip represents a technically rigorous, market-validated solution to a genuine gap in Pakistan's digital economy. The platform is not a clone of existing products but a synthesis of proven concepts — short-form video discovery, social commerce, AI personalization, and real-time communication — assembled specifically for the Pakistani fashion market and its unique characteristics: COD preference, local fashion categories, mobile-first consumption, and a young, digitally engaged population."),
      sp(0.5),
      para("The backend system is complete, production-grade, and tested across all 13 phases, comprising 80+ REST endpoints, 13 database models with proper indexing, 15 security layers, a proprietary AI scoring algorithm, real-time Socket.io infrastructure, and integrations with Stripe, ImageKit, and MongoDB Atlas. The frontend is in active development following the same phased approach."),
      sp(0.5),
      para("From a technical portfolio perspective, Drip demonstrates mastery of full-stack JavaScript development, API design, database modeling, real-time systems, payment integration, CDN management, AI algorithm design, security engineering, and software documentation — skills directly aligned with senior software engineering and technical leadership roles in Pakistan's and the global technology industry."),
      sp(0.5),
      callout("Drip is production-ready infrastructure. The backend is complete, tested, and documented. The frontend follows. The market is ready. The technology is proven. The opportunity is now."),

      sp(1),
      divLine(),
      sp(0.5),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children:[new TextRun({ text:"End of Project Proposal", bold:true, color:C.MGRAY, font:"Arial", size:22 })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing:{ before:80, after:80 },
        children:[new TextRun({ text:"Drip — Fashion Reels Platform  |  Version 1.0  |  May 2026", color:C.MGRAY, font:"Arial", size:18, italics:true })]
      }),
    ]
  }]
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync('/home/claude/Drip_Project_Proposal.docx', buf);
  console.log('Done! File created.');
}).catch(e => console.error(e));

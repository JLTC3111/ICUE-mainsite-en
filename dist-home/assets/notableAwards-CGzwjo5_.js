const n=`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Awards & Recognition - Excellence in Construction & Planning</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background-color: #fffefe;
            color: #1e293b;
            line-height: 1.6;
        }

        .hero-section {
            margin-top: 7.5%;
            background: transparent;
            color: #000;
            padding: 80px 20px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }

        .hero-section::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000"><polygon fill="rgba(255,255,255,0.05)" points="0,1000 1000,800 1000,1000"/></svg>');
            background-size: cover;
        }

        .hero-content {
            position: relative;
            z-index: 1;
            max-width: 800px;
            margin: 0 auto;
        }

        .hero-section h1 {
            font-size: clamp(1.75rem, 4.5vw, 3.5rem);
            font-weight: 700;
            margin-bottom: 1.5rem;
            letter-spacing: -0.02em;
        }

        .hero-stats {
            display: flex;
            justify-content: center;
            gap: 60px;
            margin-top: 3rem;
        }

        .hero-stat {
            text-align: center;
        }

        .hero-stat-number {
            font-size: clamp(1.25rem, 3.5vw, 2.5rem);
            font-weight: 700;
            display: block;
            margin-bottom: 8px;
        }

        .hero-stat-label {
            font-size: clamp(0.75rem, 2.5vw, 1rem);
            opacity: 0.9;
        }

        .container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 0 20px;
        }

        .section {
            padding: 80px 0;
        }

        .section-header {
            text-align: center;
            margin-bottom: 60px;
        }

        .section-title {
            font-size: clamp(1.25rem, 4.5vw, 2.5rem);
            font-weight: 700;
            color: #1e293b;
            margin-bottom: 1rem;
        }

        .section-subtitle {
            font-size: clamp(0.8rem, 3vw, 1.2rem);
            color: #64748b;
            max-width: 600px;
            margin: 0 auto;
        }

        .awards-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
            gap: 30px;
            margin-bottom: 60px;
            cursor: pointer;
        }

        .award-card {
            background: #fff;
            padding: 40px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
            position: relative;
            transition: all 0.15s ease;
            z-index: 1;
            isolation: isolate;
            background-clip: padding-box;
        }

        @property --angle {
            syntax: "<angle>";
            initial-value: 0deg;
            inherits: false;
        }
        .cert-card::after, .cert-card::before,
        .award-card::after, .award-card::before{
            content: '';
            position: absolute;
            height: 100%;
            width: 100%;
            border-radius: 20px;
            background-image: conic-gradient(from var(--angle), #ff4545, #00ff99, #006aff, #ff0095, #ff4545);
            top: 50%;
            left: 50%;
            translate: -50% -50%;
            z-index: -1;
            padding: 3px;
            border-radius: 10px;
            opacity: 0; /* Hidden by default */
            transition: opacity 0.3s ease;
        }
        .cert-card::before, .award-card::before{
            z-index: -2;
        }
        .cert-card::after, .award-card::after {
            z-index: -1;
            mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            mask-composite: xor;
            -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            -webkit-mask-composite: xor;
            padding: 3px;
        }

        /* Show and animate pseudo-elements only on hover */
        .cert-card:hover::before,
        .cert-card:hover::after,
        .award-card:hover::before,
        .award-card:hover::after {
            opacity: 0; 
            animation: 2.5s spin linear infinite;
        }
        .cert-card:hover::after,
        .award-card:hover::after {
            opacity: 1; 
        }

        
        @keyframes spin{
            from{
                --angle: 0deg;
            }
            to{
                --angle: 360deg;
            }
        }

        .award-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2rem;
            margin-bottom: 24px;
            color: white;
        }

        .award-year {
            position: absolute;
            top: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.05);
            padding: 8px 16px;
            border-radius: 20px;
            font-size: clamp(0.8rem, 2vw, 0.9rem);
            font-weight: 600;
            color: #64748b;
        }

        .award-title {
            font-size: clamp(1rem, 2.5vw, 1.4rem);
            font-weight: 700;
            color: #1e293b;
            margin-bottom: 12px;
            line-height: 1.3;
        }

        .award-organization {
            font-size: clamp(0.875rem, 2.5vw, 1rem);
            color: #3b82f6;
            font-weight: 600;
            margin-bottom: 16px;
        }

        .award-description {
            font-size: clamp(0.875rem, 2.5vw, 1rem);
            color: #64748b;
            line-height: 1.7;
            margin-bottom: 20px;
        }

        .award-project {
            background: #f8fafc;
            padding: 16px;
            border-radius: 12px;
            border-left: 4px solid #033586;
        }

        .award-project-label {
            font-size: clamp(0.65rem, 2vw, 0.85rem);
            font-weight: 600;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 4px;
        }

        .award-project-name {
            font-size: clamp(0.875rem, 2.5vw, 1.1rem);
            font-weight: 600;
            color: #1e293b;
        }

        .certifications-section {
            background: #f8fafc;
        }

        .certs-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 24px;
        }

        .cert-card {
            background: white;
            padding: 32px;
            text-align: center;
            align-items: center !important;
            justify-content: center !important;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
            border: 2px solid transparent;
            transition: all 0.1s ease-in-out;
            cursor: pointer;
        }

        .cert-logo {
            width: 80px;
            height: 80px;
            margin-left: 35%;
            padding: 15px;
            background: #fff;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .cert-logo img {
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
        }

        .cert-name {
            font-size: clamp(1rem, 2.5vw, 1.2rem);
            font-weight: 700;
            color: #1e293b;
            margin-bottom: 8px;
        }

        .cert-organization {
            color: #64748b;
            font-size: clamp(0.875rem, 2.5vw, 0.95rem);
            margin-bottom: 12px;
        }

        .cert-status {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 6px 12px;
            background: #dcfce7;
            color: #166534;
            border-radius: 20px;
            font-size: clamp(0.75rem, 2vw, 0.85rem);
            font-weight: 600;
        }

        .cert-status.expiring {
            background: #fef3c7;
            color: #92400e;
        }

        .timeline-section {
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            position: relative;
            overflow: hidden;
        }

        .timeline-section::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="20" cy="20" r="1" fill="rgba(59,130,246,0.1)"/><circle cx="80" cy="40" r="1" fill="rgba(6,182,212,0.1)"/><circle cx="40" cy="80" r="1" fill="rgba(59,130,246,0.1)"/></svg>');
            background-size: 200px 200px;
            animation: float 20s ease-in-out infinite;
        }

        @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(180deg); }
        }

        .timeline {
            position: relative;
            max-width: 900px;
            margin: 0 auto;
        }

        .timeline::before {
            content: '';
            position: absolute;
            left: 50%;
            transform: translateX(-50%);
            width: 6px;
            height: 100%;
            background: linear-gradient(180deg, #3b82f6 0%, #06b6d4 50%, #10b981 100%);
            border-radius: 3px;
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
        }

        .timeline-item {
            position: relative;
            margin-bottom: 80px;
            display: flex;
            align-items: center;
            opacity: 0;
            transform: translateX(-50px);
            transition: all 0.8s ease;
        }

        .timeline-item.animate {
            opacity: 1;
            transform: translateX(0);
        }

        .timeline-item:nth-child(odd) {
            flex-direction: row-reverse;
        }

        .timeline-item:nth-child(odd).animate {
            transform: translateX(0);
        }

        .timeline-item:nth-child(even).animate {
            transform: translateX(0);
        }

        .timeline-item:nth-child(even) {
            transform: translateX(50px);
        }

        .timeline-content {
            flex: 0 0 calc(50% - 70px);
            max-width: calc(50% - 70px);
            background: #fff;
            padding: 35px;
            border-radius: 20px;
            box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
            margin: 0 40px;
            border: 2px solid transparent;
            position: relative;
            transition: all 0.4s ease;
            cursor: pointer;
        }

        .timeline-content::before {
            content: '';
            position: absolute;
            top: 50%;
            width: 0;
            height: 0;
            border: 15px solid transparent;
        }

        .timeline-item:nth-child(odd) .timeline-content::before {
            right: -30px;
            border-left-color: white;
            transform: translateY(-50%);
        }

        .timeline-item:nth-child(even) .timeline-content::before {
            left: -30px;
            border-right-color: white;
            transform: translateY(-50%);
        }

        .timeline-content:hover {
            transform: translateY(-5px);
            box-shadow: 0 20px 48px rgba(0, 0, 0, 0.45);
            border-color: #003994;
        }

        .timeline-item:nth-child(odd) .timeline-content {
            text-align: right;
        }

        .timeline-year {
            position: absolute;
            left: 50%;
            transform: translateX(-50%);
            width: 100px;
            height: 100px;
            background: #fff;
            border: 6px solid rgb(255, 255, 255);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: clamp(0.9rem, 2.5vw, 1.2rem);
            font-weight: 700;
            color: #000;
            z-index: 3;
            box-shadow: 0 8px 24px rgba(59, 130, 246, 0.3);
            transition: all 0.25s ease;
        }

        .timeline-item:nth-child(1):hover .timeline-year,
        .timeline-item:nth-child(2):hover .timeline-year,
        .timeline-item:nth-child(3):hover .timeline-year,
        .timeline-item:nth-child(4):hover .timeline-year,
        .timeline-item:nth-child(5):hover .timeline-year {
            transform: translateX(-50%) scale(1.25);
            background: transparent;
            box-shadow: 0 12px 32px rgba(59, 130, 246, 0.4);
            will-change: auto;
        }

        .timeline-item:nth-child(2) .timeline-year {
            background: #fff;
            box-shadow: 0 8px 24px rgba(16, 185, 129, 0.3);
        }

        .timeline-item:nth-child(3) .timeline-year {
            background: #fff;
            box-shadow: 0 8px 24px rgba(139, 92, 246, 0.3);
        }

        .timeline-item:nth-child(4) .timeline-year {
            background: #fff;
            box-shadow: 0 8px 24px rgba(245, 158, 11, 0.3);
        }

        .timeline-item:nth-child(5) .timeline-year {
            background: #fff;
            box-shadow: 0 8px 24px rgba(239, 68, 68, 0.3);
        }

        .timeline-title {
            font-size: clamp(1rem, 2.5vw, 1.5rem);
            font-weight: 700;
            color: #1e293b;
            margin-bottom: 12px;
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .timeline-item:nth-child(odd) .timeline-title {
            justify-content: flex-end;
        }

        .timeline-icon {
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: clamp(0.9rem, 2.5vw, 1.25rem);
            background: transparent;
            color: white;
            flex-shrink: 0;
        }

        .timeline-icon svg {
            width: 32px !important;
            height: 32px !important;
        }

        .timeline-award {
            color: #003d9f;
            font-weight: 600;
            margin-bottom: 16px;
            font-size: clamp(0.875rem, 2.5vw, 1.1rem);
        }

        .timeline-description {
            color: #64748b;
            line-height: 1.7;
            margin-bottom: 20px;
        }

        .timeline-highlights {
            display: flex;
            gap: 16px;
            margin-top: 20px;
            flex-wrap: wrap;
        }

        .timeline-item:nth-child(odd) .timeline-highlights {
            justify-content: flex-end;
        }

        .highlight-item {
            background: #f1f5f9;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: clamp(0.675rem, 2.5vw, 0.85rem);
            font-weight: 600;
            color: #475569;
            border: 2px solid transparent;
            transition: all 0.3s ease;
        }

        .highlight-item:hover {
            background: #e2e8f0;
            border-color: #3b82f6;
            color: #3b82f6;
        }

        .timeline-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 16px;
            margin-top: 24px;
            padding-top: 24px;
            border-top: 2px solid #e2e8f0;
        }

        .timeline-stat {
            font-size: clamp(0.875rem, 2.5vw, 1rem);
            text-align: center;
        }

        .timeline-item:nth-child(odd) .timeline-stat {
            text-align: center;
        }

        .timeline-stat-number {
            display: block;
            font-size: clamp(1rem, 2.5vw, 1.8rem);
            font-weight: 700;
            color: #003384;
            margin-bottom: 4px;
        }

        .timeline-stat-label {
            font-size: 0.85rem;
            color: #64748b;
            font-weight: 500;
        }

        @media (max-width: 1024px) {
            .hero-stats {
                gap: 40px;
            }
            
            .awards-grid {
                grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            }
        }

        @media (max-width: 768px) {
            .hero-section h1 {
                font-size: clamp(1.5rem, 4vw, 2.5rem);
            }
            
            .hero-stats {
                flex-direction: column;
                gap: 30px;
            }
            
            .highlight-item {
                display: inline-block;
                align-items: center;
            }

            .awards-grid {
                grid-template-columns: 1fr;
            }

            .award-icon svg {
                width: 32px !important;
                height: 32px !important;
            }

            .certs-grid {
                grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            }

            .timeline-icon svg {
                width: 20px !important;
                height: 20px !important;
            }

            .timeline::before {
                left: 30px;
            }
            
            .timeline-item,
            .timeline-item:nth-child(odd) {
                flex-direction: row;
            }
            
            .timeline-content,
            .timeline-item:nth-child(odd) .timeline-content {
                flex: 1 1 auto;
                max-width: none;
                margin-left: 80px;
                margin-right: 0;
                text-align: left;
            }
            
            .timeline-year {
                left: 30px;
                width: 60px;
                height: 60px;
                font-size: clamp(0.75rem, 2vw, 0.9rem);
            }
        }
    </style>
</head>
<body>
    <section class="hero-section">
        <div class="hero-content">
            <h1>Awards & Recognition</h1>
            <div>Celebrating excellence in construction, planning, and community development through industry recognition and professional certifications.</div>

            <div class="hero-stats">
                <div class="hero-stat">
                    <span class="hero-stat-number">33</span>
                    <span class="hero-stat-label">Industry Awards</span>
                </div>
                <div class="hero-stat">
                    <span class="hero-stat-number">15</span>
                    <span class="hero-stat-label">Certifications</span>
                </div>
                <div class="hero-stat">
                    <span class="hero-stat-number">10</span>
                    <span class="hero-stat-label">Years Excellence</span>
                </div>
            </div>
        </div>
    </section>

    <section class="section">
        <div class="container">
            <div class="section-header">
                <h2 class="section-title">Recent Awards & Achievements</h2>
                <div class="section-subtitle">Our commitment to excellence has been recognized by leading industry organizations and government agencies.</div>
            </div>

            <div class="awards-grid">
                <div class="award-card excellence">
                    <div class="award-year">2024</div>
                    <div class="award-icon"><svg width="64px" height="64px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill="#494c4e" fill-rule="evenodd" d="M23.182 2.48a2.188 2.188 0 0 0-1.45-.48 7.5 7.5 0 0 0-2.761.63A3 3 0 0 0 16 0H8a3 3 0 0 0-2.971 2.63A7.5 7.5 0 0 0 2.268 2a2.188 2.188 0 0 0-1.45.48c-1.49 1.22-.89 4.42 1.36 7.16a10.038 10.038 0 0 0 2.941 2.5 6.067 6.067 0 0 0 4.891 4.77.277.277 0 0 0-.01.09v1H9a2 2 0 0 0-1.79 1.11l-1 2a1.974 1.974 0 0 0 .09 1.94A2 2 0 0 0 8 24h8a2 2 0 0 0 1.7-.95 1.974 1.974 0 0 0 .09-1.94l-1-2A2 2 0 0 0 15 18h-1v-1a.277.277 0 0 0-.01-.09 6.067 6.067 0 0 0 4.891-4.77 10.038 10.038 0 0 0 2.941-2.5c2.25-2.74 2.85-5.94 1.36-7.16zM5 9.66a.152.152 0 0 0-.04-.04 10.48 10.48 0 0 1-1.24-1.25 8.05 8.05 0 0 1-1.53-2.74c-.09-.29-.47-1.57.05-1.64A4.766 4.766 0 0 1 5 5.01v4.65zM15 20l1 2H8l1-2h6zm2-9.04A4.04 4.04 0 0 1 13 15h-2a4.04 4.04 0 0 1-4-4.04V3a1.016 1.016 0 0 1 1-1h8a1.016 1.016 0 0 1 1 1v7.96zm4.811-5.33a8.05 8.05 0 0 1-1.53 2.74 10.48 10.48 0 0 1-1.24 1.25.152.152 0 0 0-.04.04V5.01a4.766 4.766 0 0 1 2.761-1.02c.52.07.138 1.35.05 1.64z"></path> </g></svg></div>
                    <h3 class="award-title">Project Excellence Award</h3>
                    <div class="award-organization">National Association of Construction Professionals</div>
                    <div class="award-description">Recognized for outstanding project management and delivery of the Riverside Community Center, completed on time and 8% under budget while exceeding sustainability targets.</div>
                    <div class="award-project">
                        <div class="award-project-label">Winning Project</div>
                        <div class="award-project-name">Riverside Community Center Expansion</div>
                    </div>
                </div>

                <div class="award-card innovation">
                    <div class="award-year">2024</div>
                    <div class="award-icon"><svg fill="#000000" width="64px" height="64px" viewBox="-4 0 19 19" xmlns="http://www.w3.org/2000/svg" class="cf-icon-svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M10.328 6.83a5.903 5.903 0 0 1-1.439 3.64 2.874 2.874 0 0 0-.584 1v1.037a.95.95 0 0 1-.95.95h-3.71a.95.95 0 0 1-.95-.95V11.47a2.876 2.876 0 0 0-.584-1A5.903 5.903 0 0 1 .67 6.83a4.83 4.83 0 0 1 9.28-1.878 4.796 4.796 0 0 1 .38 1.88zm-.95 0a3.878 3.878 0 0 0-7.756 0c0 2.363 2.023 3.409 2.023 4.64v1.037h3.71V11.47c0-1.231 2.023-2.277 2.023-4.64zM7.83 14.572a.475.475 0 0 1-.475.476h-3.71a.475.475 0 0 1 0-.95h3.71a.475.475 0 0 1 .475.474zm-.64 1.262a.238.238 0 0 1-.078.265 2.669 2.669 0 0 1-3.274 0 .237.237 0 0 1 .145-.425h2.983a.238.238 0 0 1 .225.16z"></path></g></svg></div>
                    <h3 class="award-title">Innovation in Planning Award</h3>
                    <div class="award-organization">American Planning Association</div>
                    <div class="award-description">Honored for pioneering use of community engagement technology and data-driven planning processes that increased public participation by 340%.</div>
                    <div class="award-project">
                        <div class="award-project-label">Innovation Focus</div>
                        <div class="award-project-name">Digital Community Engagement Platform</div>
                    </div>
                </div>

                <div class="award-card sustainability">
                    <div class="award-year">2023</div>
                    <div class="award-icon"><svg width="64px" height="64px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M4.44893 17.009C-0.246384 7.83762 7.34051 0.686125 19.5546 3.61245C20.416 3.81881 21.0081 4.60984 20.965 5.49452C20.5862 13.288 17.0341 17.7048 6.13252 17.9857C5.43022 18.0038 4.76908 17.6344 4.44893 17.009Z" stroke="#323232" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M3.99999 21C5.50005 15.5 6 12.5 12 9.99997" stroke="#323232" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg></div>
                    <h3 class="award-title">Sustainable Development Leadership</h3>
                    <div class="award-organization">Green Building Council</div>
                    <div class="award-description">Award for leadership in sustainable construction practices, achieving LEED Platinum certification on 3 consecutive projects and reducing carbon footprint by 45%.</div>
                    <div class="award-project">
                        <div class="award-project-label">Achievement</div>
                        <div class="award-project-name">Triple LEED Platinum Portfolio</div>
                    </div>
                </div>

                <div class="award-card safety">
                    <div class="award-year">2023</div>
                    <div class="award-icon"><svg width="64px" height="64px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M10.8613 8.36335C11.3679 7.45445 11.6213 7 12 7C12.3787 7 12.6321 7.45445 13.1387 8.36335L13.2698 8.59849C13.4138 8.85677 13.4858 8.98591 13.598 9.07112C13.7103 9.15633 13.8501 9.18796 14.1296 9.25122L14.3842 9.30881C15.3681 9.53142 15.86 9.64273 15.977 10.0191C16.0941 10.3955 15.7587 10.7876 15.088 11.572L14.9144 11.7749C14.7238 11.9978 14.6285 12.1092 14.5857 12.2471C14.5428 12.385 14.5572 12.5336 14.586 12.831L14.6122 13.1018C14.7136 14.1482 14.7644 14.6715 14.4579 14.9041C14.1515 15.1367 13.6909 14.9246 12.7697 14.5005L12.5314 14.3907C12.2696 14.2702 12.1387 14.2099 12 14.2099C11.8613 14.2099 11.7304 14.2702 11.4686 14.3907L11.2303 14.5005C10.3091 14.9246 9.84847 15.1367 9.54206 14.9041C9.23565 14.6715 9.28635 14.1482 9.38776 13.1018L9.41399 12.831C9.44281 12.5336 9.45722 12.385 9.41435 12.2471C9.37147 12.1092 9.27617 11.9978 9.08557 11.7749L8.91204 11.572C8.2413 10.7876 7.90593 10.3955 8.02297 10.0191C8.14001 9.64273 8.63194 9.53142 9.61581 9.30881L9.87035 9.25122C10.1499 9.18796 10.2897 9.15633 10.402 9.07112C10.5142 8.98591 10.5862 8.85677 10.7302 8.59849L10.8613 8.36335Z" stroke="#1C274C" stroke-width="1.5"></path> <path d="M3 10.4167C3 7.21907 3 5.62028 3.37752 5.08241C3.75503 4.54454 5.25832 4.02996 8.26491 3.00079L8.83772 2.80472C10.405 2.26824 11.1886 2 12 2C12.8114 2 13.595 2.26824 15.1623 2.80472L15.7351 3.00079C18.7417 4.02996 20.245 4.54454 20.6225 5.08241C21 5.62028 21 7.21907 21 10.4167C21 10.8996 21 11.4234 21 11.9914C21 14.4963 20.1632 16.4284 19 17.9041M3.19284 14C4.05026 18.2984 7.57641 20.5129 9.89856 21.5273C10.62 21.8424 10.9807 22 12 22C13.0193 22 13.38 21.8424 14.1014 21.5273C14.6796 21.2747 15.3324 20.9478 16 20.5328" stroke="#1C274C" stroke-width="1.5" stroke-linecap="round"></path> </g></svg></div>
                    <h3 class="award-title">Zero Incident Safety Recognition</h3>
                    <div class="award-organization">Occupational Safety & Health Administration</div>
                    <div class="award-description">Achieved 1,000+ days without recordable incidents across all active project sites, demonstrating exceptional commitment to worker safety and training.</div>
                    <div class="award-project">
                        <div class="award-project-label">Safety Record</div>
                        <div class="award-project-name">1,247 Days Zero Incidents</div>
                    </div>
                </div>

                <div class="award-card excellence">
                    <div class="award-year">2023</div>
                    <div class="award-icon"><svg width="64px" height="64px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M12 11L8 3H4L8.5058 12.4622M12 11L16 3H20L15.4942 12.4622M12 11C13.344 11 14.5848 11.5635 15.4942 12.4622M12 11C10.656 11 9.41518 11.5635 8.5058 12.4622M15.4942 12.4622C16.4182 13.3753 17 14.6344 17 16C17 18.7614 14.7614 21 12 21C9.23858 21 7 18.7614 7 16C7 14.6344 7.58179 13.3753 8.5058 12.4622" stroke="#000000" stroke-width="2" stroke-linejoin="round"></path> </g></svg></div>
                    <h3 class="award-title">Community Impact Excellence</h3>
                    <div class="award-organization">International City/County Management Association</div>
                    <div class="award-description">Recognition for exceptional public-private partnerships resulting in $4.2M in community infrastructure improvements and 200+ jobs created.</div>
                    <div class="award-project">
                        <div class="award-project-label">Impact Area</div>
                        <div class="award-project-name">Downtown Revitalization Initiative</div>
                    </div>
                </div>

                <div class="award-card innovation">
                    <div class="award-year">2022</div>
                    <div class="award-icon"><svg width="64px" height="64px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M10 18H14M7.20003 3H16.8C17.9201 3 18.4802 3 18.908 3.21799C19.2843 3.40973 19.5903 3.71569 19.782 4.09202C20 4.51984 20 5.0799 20 6.2V11.8C20 12.9201 20 13.4802 19.782 13.908C19.5903 14.2843 19.2843 14.5903 18.908 14.782C18.4802 15 17.9201 15 16.8 15H7.20003C6.07992 15 5.51987 15 5.09205 14.782C4.71572 14.5903 4.40976 14.2843 4.21801 13.908C4.00003 13.4802 4.00003 12.9201 4.00003 11.8V6.2C4.00003 5.0799 4.00003 4.51984 4.21801 4.09202C4.40976 3.71569 4.71572 3.40973 5.09205 3.21799C5.51987 3 6.07992 3 7.20003 3ZM4.58888 21H19.4112C20.2684 21 20.697 21 20.9551 20.8195C21.1805 20.6618 21.3311 20.4183 21.3713 20.1462C21.4173 19.8345 21.2256 19.4512 20.8423 18.6845L20.3267 17.6534C19.8451 16.6902 19.6043 16.2086 19.2451 15.8567C18.9274 15.5456 18.5445 15.309 18.1241 15.164C17.6488 15 17.1103 15 16.0335 15H7.96659C6.88972 15 6.35128 15 5.87592 15.164C5.45554 15.309 5.07266 15.5456 4.75497 15.8567C4.39573 16.2086 4.15493 16.6902 3.67334 17.6534L3.1578 18.6845C2.77444 19.4512 2.58276 19.8345 2.6288 20.1462C2.669 20.4183 2.81952 20.6618 3.04492 20.8195C3.30306 21 3.73166 21 4.58888 21Z" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg></div>
                    <h3 class="award-title">Technology Integration Award</h3>
                    <div class="award-organization">Construction Technology Association</div>
                    <div class="award-description">Leading adoption of BIM, drone surveying, and AI-powered project monitoring, reducing project timelines by 25% and improving accuracy by 40%.</div>
                    <div class="award-project">
                        <div class="award-project-label">Technology Focus</div>
                        <div class="award-project-name">Smart Construction Platform</div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <section class="section certifications-section">
        <div class="container">
            <div class="section-header">
                <h2 class="section-title">Professional Certifications</h2>
                <div class="section-subtitle">Our team maintains the highest professional standards through ongoing education and certification.</div>
            </div>

            <div class="certs-grid">
                <div class="cert-card">
                    <div class="cert-logo"><img src="public/certs/leed.png" alt="LEED Logo"></div>
                    <h3 class="cert-name">LEED Accredited Professional</h3>
                    <div class="cert-organization">U.S. Green Building Council</div>
                    <div class="cert-status">
                        <span>✓</span> Active
                    </div>
                </div>

                <div class="cert-card">
                    <div class="cert-logo"><img src="public/certs/pmp.jpg" alt="PMP Logo"></div>
                    <h3 class="cert-name">Project Management Professional</h3>
                    <div class="cert-organization">Project Management Institute</div>
                    <div class="cert-status">
                        <span>✓</span> Active
                    </div>
                </div>

                <div class="cert-card">
                    <div class="cert-logo"><img src="public/certs/pe.png" alt="PE Logo"></div>
                    <h3 class="cert-name">Professional Engineer</h3>
                    <div class="cert-organization">State Engineering Board</div>
                    <div class="cert-status">
                        <span>✓</span> Active
                    </div>
                </div>

                <div class="cert-card">
                    <div class="cert-logo"><img src="public/certs/aicp.jpg" alt="AICP Logo"></div>
                    <h3 class="cert-name">Certified Planner</h3>
                    <div class="cert-organization">American Institute of Certified Planners</div>
                    <div class="cert-status">
                        <span>✓</span> Active
                    </div>
                </div>

                <div class="cert-card">
                    <div class="cert-logo"><img src="public/certs/osha.png" alt="OSHA Logo"></div>
                    <h3 class="cert-name">OSHA 30-Hour Construction</h3>
                    <div class="cert-organization">Occupational Safety & Health Administration</div>
                    <div class="cert-status expiring">
                        <span>⚠</span> Renewing
                    </div>
                </div>

                <div class="cert-card">
                    <div class="cert-logo"><img src="public/certs/mbe.png" alt="MBE Logo"></div>
                    <h3 class="cert-name">Minority Business Enterprise</h3>
                    <div class="cert-organization">State Certification Agency</div>
                    <div class="cert-status">
                        <span>✓</span> Active
                    </div>
                </div>
            </div>
        </div>
    </section>

    <section class="section timeline-section">
        <div class="container">
            <div class="section-header">
                <h2 class="section-title">Recognition Timeline</h2>
                <div class="section-subtitle">A journey of continuous excellence and growing recognition in our field.</div>
            </div>

            <div class="timeline">
                <div class="timeline-item">
                    <div class="timeline-year">2024</div>
                    <div class="timeline-content">
                        <h3 class="timeline-title">
                            <div class="timeline-icon"><svg version="1.0" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="32px" height="32px" viewBox="0 0 64 64" enable-background="new 0 0 64 64" xml:space="preserve" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <path fill="#231F20" d="M60,6h-7V4c0-2.212-1.789-4-4-4H15c-2.211,0-4,1.788-4,4v2H4c-2.211,0-4,1.788-4,4v8 c0,6.074,4.925,11,11,11h0.096C12.01,38.659,19.477,46.395,29,47.761V56h-7c-2.211,0-4,1.788-4,4v3c0,0.552,0.447,1,1,1h26 c0.553,0,1-0.448,1-1v-3c0-2.212-1.789-4-4-4h-7v-8.239c9.523-1.366,16.985-9.1,17.899-18.761H53c6.075,0,11-4.926,11-11v-8 C64,7.788,62.211,6,60,6z M11,23c-2.762,0-5-2.239-5-5v-6h5V23z M2,18v-8c0-1.105,0.896-2,2-2h7v2H5c-0.553,0-1,0.446-1,1v7 c0,3.865,3.134,7,7,7v2C6.029,27,2,22.97,2,18z M42,58c1.104,0,2,0.895,2,2v2H20v-2c0-1.105,0.896-2,2-2H42z M31,56v-8.052 C31.334,47.964,31.662,48,32,48s0.666-0.036,1-0.052V56H31z M51,27c0,10.492-8.507,19-19,19s-19-8.508-19-19V4c0-1.105,0.896-2,2-2 h34c1.104,0,2,0.895,2,2V27z M53,12h5v6c0,2.761-2.238,5-5,5V12z M62,18c0,4.97-4.029,9-9,9v-2c3.866,0,7-3.135,7-7v-7 c0-0.554-0.447-1-1-1h-6V8h7c1.104,0,2,0.895,2,2V18z"></path> <path fill="#231F20" d="M39.147,19.36l-4.309-0.658l-1.936-4.123c-0.165-0.352-0.518-0.575-0.905-0.575s-0.74,0.224-0.905,0.575 l-1.936,4.123l-4.309,0.658c-0.37,0.058-0.678,0.315-0.797,0.671s-0.029,0.747,0.232,1.016l3.146,3.227l-0.745,4.564 c-0.062,0.378,0.099,0.758,0.411,0.979s0.725,0.243,1.061,0.059l3.841-2.123l3.841,2.123C35.99,29.959,36.157,30,36.323,30 c0.202,0,0.404-0.062,0.576-0.184c0.312-0.221,0.473-0.601,0.411-0.979l-0.745-4.564l3.146-3.227 c0.262-0.269,0.352-0.66,0.232-1.016S39.518,19.418,39.147,19.36z M34.781,23.238c-0.222,0.228-0.322,0.546-0.271,0.859 l0.495,3.029l-2.522-1.395c-0.151-0.083-0.317-0.125-0.484-0.125s-0.333,0.042-0.484,0.125l-2.522,1.395l0.495-3.029 c0.051-0.313-0.05-0.632-0.271-0.859l-2.141-2.193l2.913-0.446c0.329-0.05,0.612-0.261,0.754-0.563l1.257-2.678l1.257,2.678 c0.142,0.303,0.425,0.514,0.754,0.563l2.913,0.446L34.781,23.238z"></path> </g> </g></svg></div>
                            Peak Recognition Year
                        </h3>
                        <div class="timeline-award">Project Excellence & Innovation Awards</div>
                        <div class="timeline-description">Our most awarded year with recognition from NACP and APA for groundbreaking community engagement and project delivery excellence. Implemented cutting-edge digital platforms that revolutionized public participation.</div>
                        
                        <div class="timeline-highlights">
                            <div class="highlight-item">NACP Excellence</div>
                            <div class="highlight-item">APA Innovation</div>
                            <div class="highlight-item">Digital Leadership</div>
                        </div>

                        <div class="timeline-stats">
                            <div class="timeline-stat">
                                <span class="timeline-stat-number">4</span>
                                <span class="timeline-stat-label">Major Awards</span>
                            </div>
                            <div class="timeline-stat">
                                <span class="timeline-stat-number">340%</span>
                                <span class="timeline-stat-label">↑ Participation</span>
                            </div>
                            <div class="timeline-stat">
                                <span class="timeline-stat-number">$2.1M</span>
                                <span class="timeline-stat-label">Projects Value</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="timeline-item">
                    <div class="timeline-year">2023</div>
                    <div class="timeline-content">
                        <h3 class="timeline-title">
                            <div class="timeline-icon"><svg width="32px" height="32px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <g id="SVGRepo_bgCarrier" stroke-width="0"/>
                            <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"/>
                            <g id="SVGRepo_iconCarrier"> <path d="M4.44893 17.009C-0.246384 7.83762 7.34051 0.686125 19.5546 3.61245C20.416 3.81881 21.0081 4.60984 20.965 5.49452C20.5862 13.288 17.0341 17.7048 6.13252 17.9857C5.43022 18.0038 4.76908 17.6344 4.44893 17.009Z" stroke="#323232" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/> <path d="M3.99999 21C5.50005 15.5 6 12.5 12 9.99997" stroke="#323232" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/> </g>
                            </svg></div>
                            Sustainability Leadership
                        </h3>
                        <div class="timeline-award">Green Building & Safety Recognition</div>
                        <div class="timeline-description">Achieved triple LEED Platinum certification and 1,000+ day safety record, establishing us as industry leaders in sustainable practices. Revolutionary approach to carbon-neutral construction.</div>

                        <div class="timeline-highlights">
                            <div class="highlight-item">LEED Platinum x3</div>
                            <div class="highlight-item">Zero Incidents</div>
                            <div class="highlight-item">Carbon Neutral</div>
                        </div>

                        <div class="timeline-stats">
                            <div class="timeline-stat">
                                <span class="timeline-stat-number">3</span>
                                <span class="timeline-stat-label">LEED Platinum</span>
                            </div>
                            <div class="timeline-stat">
                                <span class="timeline-stat-number">1,247</span>
                                <span class="timeline-stat-label">Safe Days</span>
                            </div>
                            <div class="timeline-stat">
                                <span class="timeline-stat-number">45%</span>
                                <span class="timeline-stat-label">↓ Carbon</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="timeline-item">
                    <div class="timeline-year">2022</div>
                    <div class="timeline-content">
                        <h3 class="timeline-title">
                            <div class="timeline-icon"><svg width="32px" height="32px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <g id="SVGRepo_bgCarrier" stroke-width="0"/>
                            <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"/>
                            <g id="SVGRepo_iconCarrier"> <path d="M10 18H14M7.20003 3H16.8C17.9201 3 18.4802 3 18.908 3.21799C19.2843 3.40973 19.5903 3.71569 19.782 4.09202C20 4.51984 20 5.0799 20 6.2V11.8C20 12.9201 20 13.4802 19.782 13.908C19.5903 14.2843 19.2843 14.5903 18.908 14.782C18.4802 15 17.9201 15 16.8 15H7.20003C6.07992 15 5.51987 15 5.09205 14.782C4.71572 14.5903 4.40976 14.2843 4.21801 13.908C4.00003 13.4802 4.00003 12.9201 4.00003 11.8V6.2C4.00003 5.0799 4.00003 4.51984 4.21801 4.09202C4.40976 3.71569 4.71572 3.40973 5.09205 3.21799C5.51987 3 6.07992 3 7.20003 3ZM4.58888 21H19.4112C20.2684 21 20.697 21 20.9551 20.8195C21.1805 20.6618 21.3311 20.4183 21.3713 20.1462C21.4173 19.8345 21.2256 19.4512 20.8423 18.6845L20.3267 17.6534C19.8451 16.6902 19.6043 16.2086 19.2451 15.8567C18.9274 15.5456 18.5445 15.309 18.1241 15.164C17.6488 15 17.1103 15 16.0335 15H7.96659C6.88972 15 6.35128 15 5.87592 15.164C5.45554 15.309 5.07266 15.5456 4.75497 15.8567C4.39573 16.2086 4.15493 16.6902 3.67334 17.6534L3.1578 18.6845C2.77444 19.4512 2.58276 19.8345 2.6288 20.1462C2.669 20.4183 2.81952 20.6618 3.04492 20.8195C3.30306 21 3.73166 21 4.58888 21Z" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/> </g>
                            </svg></div>
                            Technology Pioneer
                        </h3>
                        <div class="timeline-award">Construction Technology Integration</div>
                        <div class="timeline-description">First in region to fully integrate AI-powered project monitoring and drone surveying, reducing timelines by 25%. Pioneered smart construction methodologies that became industry standard.</div>
                        
                        <div class="timeline-highlights">
                            <div class="highlight-item">AI Monitoring</div>
                            <div class="highlight-item">Drone Survey</div>
                            <div class="highlight-item">Smart BIM</div>
                        </div>

                        <div class="timeline-stats">
                            <div class="timeline-stat">
                                <span class="timeline-stat-number">25%</span>
                                <span class="timeline-stat-label">↓ Timeline</span>
                            </div>
                            <div class="timeline-stat">
                                <span class="timeline-stat-number">40%</span>
                                <span class="timeline-stat-label">↑ Accuracy</span>
                            </div>
                            <div class="timeline-stat">
                                <span class="timeline-stat-number">12</span>
                                <span class="timeline-stat-label">Tech Awards</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="timeline-item">
                    <div class="timeline-year">2021</div>
                    <div class="timeline-content">
                        <h3 class="timeline-title">
                            <div class="timeline-icon"><svg version="1.0" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
                                width="32px" height="32px" viewBox="0 0 64 64" enable-background="new 0 0 64 64" xml:space="preserve">
                            <g>
                                <path fill="#231F20" d="M48,6c-4.418,0-8.418,1.791-11.313,4.687l-3.979,3.961c-0.391,0.391-1.023,0.391-1.414,0
                                    c0,0-3.971-3.97-3.979-3.961C24.418,7.791,20.418,6,16,6C7.163,6,0,13.163,0,22c0,3.338,1.024,6.436,2.773,9
                                    c0,0,0.734,1.164,1.602,2.031s24.797,24.797,24.797,24.797C29.953,58.609,30.977,59,32,59s2.047-0.391,2.828-1.172
                                    c0,0,23.93-23.93,24.797-24.797S61.227,31,61.227,31C62.976,28.436,64,25.338,64,22C64,13.163,56.837,6,48,6z M58.714,30.977
                                    c0,0-0.612,0.75-1.823,1.961S33.414,56.414,33.414,56.414C33.023,56.805,32.512,57,32,57s-1.023-0.195-1.414-0.586
                                    c0,0-22.266-22.266-23.477-23.477s-1.823-1.961-1.823-1.961C3.245,28.545,2,25.424,2,22C2,14.268,8.268,8,16,8
                                    c3.866,0,7.366,1.566,9.899,4.101l0.009-0.009l4.678,4.677c0.781,0.781,2.047,0.781,2.828,0l4.678-4.677l0.009,0.009
                                    C40.634,9.566,44.134,8,48,8c7.732,0,14,6.268,14,14C62,25.424,60.755,28.545,58.714,30.977z"/>
                                <path fill="#231F20" d="M48,12c-0.553,0-1,0.447-1,1s0.447,1,1,1c4.418,0,8,3.582,8,8c0,0.553,0.447,1,1,1s1-0.447,1-1
                                    C58,16.478,53.522,12,48,12z"/>
                            </g>
                            </svg></div>
                            Community Champion
                        </h3>
                        <div class="timeline-award">Public Service Excellence Award</div>
                        <div class="timeline-description">Recognized for exceptional public-private partnerships during pandemic response, delivering critical infrastructure on accelerated timeline. Led emergency response construction efforts across 5 counties.</div>

                        <div class="timeline-highlights">
                            <div class="highlight-item">Quick Response</div>
                            <div class="highlight-item">Emergency Build</div>
                            <div class="highlight-item">5 Provinces</div>
                        </div>

                        <div class="timeline-stats">
                            <div class="timeline-stat">
                                <span class="timeline-stat-number">23</span>
                                <span class="timeline-stat-label">Emergency Projects</span>
                            </div>
                            <div class="timeline-stat">
                                <span class="timeline-stat-number">60%</span>
                                <span class="timeline-stat-label">↓ Build Time</span>
                            </div>
                            <div class="timeline-stat">
                                <span class="timeline-stat-number">15K</span>
                                <span class="timeline-stat-label">People Helped</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</body>
</html>`;export{n as default};

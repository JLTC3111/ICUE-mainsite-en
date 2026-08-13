const n=`<!DOCTYPE html>
<html lang="en">
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta charset="UTF-8">
    <title>Terms of Use | ICUE Vietnam</title>
    <link rel="stylesheet" href="styles.css">
    <link rel="icon" type="image/png" href="/public/logoIcons/favicon.png">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background-color: #f8fafc;
            color: #1e293b;
            line-height: 1.7;
        }

        .header {
            background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%);
            padding: 80px 20px 60px;
            text-align: center;
            margin-top: 7.5%;
        }

        .header h1 {
            font-size: clamp(2rem, 5vw, 3rem);
            font-weight: 700;
            color: white;
            margin-bottom: 1rem;
            letter-spacing: -0.02em;
        }

        .header div {
            font-size: clamp(0.9rem, 2.75vw, 1.2rem);
            color: white;
            opacity: 0.9;
            max-width: 600px;
            margin: 0 auto;
        }

        .container {
            max-width: 900px;
            margin: 0 auto;
            padding: 60px 20px;
        }

        .content-section {
            font-size: clamp(0.9rem, 2.75vw, 1.1rem);
            background: white;
            border-radius: 12px;
            padding: 40px;
            margin-bottom: 30px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
            border: 1px solid #e2e8f0;
        }

        .section-title {
            font-size: clamp(1.2rem, 2.5vw, 1.8rem);
            font-weight: 600;
            color: #7c3aed;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .section-title svg {
            width: 24px;
            height: 24px;
        }

        .section-content h3 {
            font-size: clamp(1rem, 2.25vw, 1.4rem);
        }

        .section-content div {
            font-size: clamp(0.85rem, 2vw, 1.1rem);
            margin-bottom: 16px;
            font-size: clamp(0.75rem, 2vw, 1rem);
            color: #475569;
        }

        .section-content ul {
            margin-left: 20px;
            margin-bottom: 16px;
        }

        .section-content ol {
            margin-left: 20px;
            margin-bottom: 16px;
        }

        .section-content li {
            font-size: clamp(0.75rem, 2vw, 1rem);
            margin-bottom: 8px;
            color: #475569;
        }

        .highlight-box {
            background: #f3f4f6;
            border-left: 4px solid #7c3aed;
            padding: 20px;
            margin: 20px 0;
            border-radius: 0 8px 8px 0;
        }

        .highlight-box div {
            margin-bottom: 0;
            font-weight: 500;
            color: #1e293b;
        }

        .warning-box {
            border-left: 4px solid #ef4444;
            padding: 20px;
            margin: 20px 0;
            color: #000 !important;
            border-radius: 0 8px 8px 0;
        }

        .warning-box div {
            margin-bottom: 0;
            font-weight: 500;
            color: #991b1b;
        }

        .contact-info {
            letter-spacing: 0.5px;
            padding: 30px;
            border-radius: 12px;
            text-align: center;
        }

        .contact-info h3 {
            font-size: clamp(0.95rem, 2.5vw, 1.5rem);
            margin-bottom: 15px;
        }

        .contact-info div {
            margin-bottom: 10px;
            opacity: 0.9;
        }

        .contact-info a {
            text-decoration: none;
            font-weight: 500;
        }

        .contact-info a:hover {
            text-decoration: underline;
        }

        .last-updated {
            text-align: center;
            color: #64748b;
            font-size: clamp(0.7rem, 2vw, 0.9rem);
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
        }

        .terms-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }

        .terms-table th,
        .terms-table td {
            font-size: clamp(0.65rem, 2vw, 1rem);
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #e2e8f0;
        }

        .terms-table th {
            background-color: #fef3c7;
            font-weight: 600;
            color: #1e293b;
        }

        .terms-table tr:nth-child(even) {
            background-color: #fefcf3;
        }

        .liability-section {
            background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
            color: white;
        }

        .liability-section .section-title {
            color: white;
        }

        .liability-section .section-content div,
        .liability-section .section-content li {
            color: rgba(255, 255, 255, 0.9);
        }

        @media (max-width: 768px) {
            .header {
                padding: 60px 15px 40px;
                margin-top: 15%;
            }

            .header h1 {
                font-size: clamp(1.25rem, 2.75vw, 2rem);
            }

            .terms-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;

            /* important to enforce column widths */
            table-layout: fixed;
        }

        .terms-table th,
        .terms-table td {
            font-size: clamp(0.75rem, 2vw, 1rem);
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #e2e8f0;

            /* prevent text from overflowing */
            word-wrap: break-word;
            overflow-wrap: break-word;
        }

        /* Example: control each column */
            .terms-table th:nth-child(1),
            .terms-table td:nth-child(1) {
            max-width: 140px;
            }

            .terms-table th:nth-child(2),
            .terms-table td:nth-child(2) {
            max-width: 140px;
        }

            .terms-table th:nth-child(3),
            .terms-table td:nth-child(3) {
            max-width: 140px;
        }

            .container {
                padding: 40px 15px;
            }

            .content-section {
                padding: 25px;
            }

            .section-title {
                font-size: clamp(1.1rem, 2.25vw, 1.35rem);
            }

            .contact-info {
                font-size: clamp(0.7rem, 3.5vw, 1rem);
            }
        }
    </style>
</head>
<body data-footer="true" class="with-footer">
    <div class="header">
        <h1>Terms of Use</h1>
        <div>Regulations and terms applied when using ICUE services</div>
    </div>

    <div class="container">
        <div class="content-section">
            <h2 class="section-title">Acceptance of Terms</h2>
            <div class="section-content">
                <div>By accessing and using the website or services of the Institute for Economic, Urban and Construction Research (ICUE), you agree to comply with and be bound by the following terms and conditions.</div>
                
                <div class="highlight-box">
                    <div>📋 If you do not agree with any of the terms, please do not use our services.</div>
                </div>

                <div>These terms may be updated from time to time without prior notice. Continued use of the services after changes means you accept the new terms.</div>
            </div>
        </div>

        <div class="content-section">
            <h2 class="section-title">Services and Scope</h2>
            <div class="section-content">
                <div>ICUE provides the following services:</div>
                <ul>
                    <li><strong>Research and Consulting:</strong> Economics, urban development, construction, and sustainability</li>
                    <li><strong>Training:</strong> Courses and capacity-building programs</li>
                    <li><strong>Information:</strong> Reports, studies, and industry data</li>
                    <li><strong>Events:</strong> Conferences, seminars, and professional activities</li>
                    <li><strong>Website:</strong> Online information and interaction platform</li>
                </ul>

                <table class="terms-table">
                    <thead>
                        <tr>
                            <th>Service Type</th>
                            <th>Usage Conditions</th>
                            <th>Duration</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Professional consulting</td>
                            <td>Based on signed contract</td>
                            <td>As agreed</td>
                        </tr>
                        <tr>
                            <td>Training</td>
                            <td>Requires registration and tuition payment</td>
                            <td>Course duration</td>
                        </tr>
                        <tr>
                            <td>Website access</td>
                            <td>Comply with terms of use</td>
                            <td>Unlimited</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div class="content-section">
            <h2 class="section-title">User Rights and Responsibilities</h2>
            <div class="section-content">
                <h3 style="color: #7c3aed; margin-bottom: 15px;">Your rights:</h3>
                <ul>
                    <li>Access and use services for proper purposes</li>
                    <li>Receive quality services as committed</li>
                    <li>Personal data protected under privacy policy</li>
                    <li>Right to file complaints and resolve disputes</li>
                    <li>Cancel services as regulated</li>
                </ul>

                <h3 style="color: #7c3aed; margin: 25px 0 15px;">Your responsibilities:</h3>
                <ol>
                    <li><strong>Provide accurate information:</strong> Ensure all submitted info is truthful</li>
                    <li><strong>Comply with the law:</strong> Do not use services for illegal purposes</li>
                    <li><strong>Account security:</strong> Keep login info and passwords safe</li>
                    <li><strong>Timely payment:</strong> Fulfill financial obligations as agreed</li>
                    <li><strong>Proper use:</strong> Do not abuse or misuse services</li>
                    <li><strong>Respect intellectual property:</strong> Do not infringe copyrights or IP rights</li>
                </ol>
            </div>
        </div>

        <div class="content-section">
            <h2 class="section-title">Prohibited Conduct</h2>
            <div class="section-content">
                <div>When using ICUE services, you must not:</div>
                <ul>
                    <li>Use services for unauthorized or illegal purposes</li>
                    <li>Violate any local, national, or international law</li>
                    <li>Spread viruses, malware, or harmful software</li>
                    <li>Access systems or networks without authorization</li>
                    <li>Copy, modify, or distribute content without permission</li>
                    <li>Harass, threaten, or harm other users</li>
                    <li>Upload defamatory, hateful, or discriminatory content</li>
                    <li>Collect personal data without consent</li>
                    <li>Use robots, bots, or automated tools to access services</li>
                    <li>Disrupt or sabotage service operations</li>
                </ul>

                <div class="warning-box">
                    <div>⚠️ Violations may result in suspension or termination of access without prior notice.</div>
                </div>
            </div>
        </div>

        <div class="content-section">
            <h2 class="section-title">Payment and Refunds</h2>
            <div class="section-content">
                <h3 style="color: #7c3aed; margin-bottom: 15px;">Payment policy:</h3>
                <ul>
                    <li>Payment must be completed before using services</li>
                    <li>Accepted methods: bank transfer, cash, credit card</li>
                    <li>All fees in VND unless otherwise agreed</li>
                    <li>Invoices will be issued as required by law</li>
                </ul>

                <h3 style="color: #7c3aed; margin: 25px 0 15px;">Refund policy:</h3>
                <ul>
                    <li>Consulting services: Refund within 7 days if not started</li>
                    <li>Training courses: 50% refund if canceled 48h before start, no refund after start</li>
                    <li>Reports and documents: No refund after download or access</li>
                    <li>Events: Refunds follow each event’s specific policy</li>
                </ul>
            </div>
        </div>

        <div class="content-section">
            <h2 class="section-title">Intellectual Property Rights</h2>
            <div class="section-content">
                <div>All content on ICUE’s website and services is protected by intellectual property law:</div>
                
                <h3 style="color: #7c3aed; margin: 25px 0 15px;">ICUE ownership:</h3>
                <ul>
                    <li>ICUE logo, brand, and name</li>
                    <li>Website design and user interface</li>
                    <li>Research reports and professional documents</li>
                    <li>Exclusive consulting methods and processes</li>
                    <li>Databases and accumulated information</li>
                </ul>

                <h3 style="color: #7c3aed; margin: 25px 0 15px;">Your usage rights:</h3>
                <ul>
                    <li>View and use content for personal purposes</li>
                    <li>Download licensed materials</li>
                    <li>Share website links (not direct content)</li>
                    <li>Cite with proper attribution within fair limits</li>
                </ul>

                <div class="highlight-box">
                    <div>📄 Unauthorized use of copyrighted content may lead to serious legal consequences.</div>
                </div>
            </div>
        </div>

        <div class="content-section liability-section">
            <h2 class="section-title">Limitation of Liability</h2>
            <div class="section-content">
                <div>ICUE provides services on a best-effort basis, but is not responsible for:</div>
                
                <ul>
                    <li><strong>Indirect damages:</strong> Loss of profit, business opportunities, or morale</li>
                    <li><strong>Service interruptions:</strong> Due to technical issues, maintenance, or force majeure</li>
                    <li><strong>Third-party information:</strong> Accuracy of external data sources</li>
                    <li><strong>Business decisions:</strong> Outcomes from decisions based on consulting</li>
                    <li><strong>Security risks:</strong> From sharing information via the internet</li>
                    <li><strong>User content:</strong> Information created or shared by users</li>
                </ul>

                <div class="warning-box">
                    <div>⚠️ ICUE’s total liability under any circumstances shall not exceed the value of the paid services.</div>
                </div>

                <div>This limitation does not apply in cases of intentional misconduct or gross negligence by ICUE.</div>
            </div>
        </div>

        <div class="content-section">
            <h2 class="section-title">Termination of Services</h2>
            <div class="section-content">
                <h3 style="color: #7c3aed; margin-bottom: 15px;">ICUE may terminate services if:</h3>
                <ul>
                    <li>User violates terms of use</li>
                    <li>Payments are not made on time</li>
                    <li>Services are used for illegal purposes</li>
                    <li>User causes harm to ICUE or others</li>
                    <li>False or fraudulent information is provided</li>
                </ul>

                <h3 style="color: #7c3aed; margin: 25px 0 15px;">Users may terminate if:</h3>
                <ul>
                    <li>No longer need the service</li>
                    <li>ICUE seriously violates terms</li>
                    <li>Services fail to meet quality commitments</li>
                </ul>

                <div>Termination takes effect immediately unless otherwise agreed. Financial obligations incurred before termination remain enforceable.</div>
            </div>
        </div>

        <div class="content-section">
            <h2 class="section-title">Governing Law and Dispute Resolution</h2>
            <div class="section-content">
                <div>These terms are governed by Vietnamese law. All disputes will be resolved as follows:</div>
                
                <ol>
                    <li><strong>Direct negotiation:</strong> Good-faith discussions between parties</li>
                    <li><strong>Mediation:</strong> Through an authorized mediation organization</li>
                    <li><strong>Arbitration:</strong> Submitted to the Vietnam International Arbitration Center (VIAC)</li>
                    <li><strong>Court:</strong> Hanoi court of jurisdiction if arbitration fails</li>
                </ol>

                <div class="highlight-box">
                    <div>🏛️ Dispute resolution methods depend on specific service contract agreements.</div>
                </div>
            </div>
        </div>

        <div class="content-section">
            <h2 class="section-title">Other Terms</h2>
            <div class="section-content">
                <ul>
                    <li><strong>Validity:</strong> If one part is invalid, the rest remains valid</li>
                    <li><strong>Language:</strong> Vietnamese version is official; translations are for reference only</li>
                    <li><strong>Amendments:</strong> ICUE may update terms anytime</li>
                    <li><strong>Notices:</strong> Official notices via email or website</li>
                    <li><strong>Special terms:</strong> Specific contracts may include additional or different terms</li>
                </ul>
            </div>
        </div>

        <div class="contact-info">
            <h3>Legal Contact</h3>
            <div>If you have questions about these terms of use:</div>
            <div><strong>Email:</strong> <a href="mailto:info@icue.vn">info@icue.vn</a></div>
            <div><strong>Phone:</strong> <a href="tel:+842437728485">+84 24 3772 8485</a></div>
            <div><strong>Address:</strong> Institute for Economic, Urban and Construction Research, 124 Hoang Ngan, Cau Giay, Hanoi</div>
            <div>We will respond within 5 business days.</div>
        </div>

        <div class="last-updated">
            <div>Last updated: <strong>18/08/2025</strong></div>
            <div>Version: 2.1 | Effective from update date</div>
        </div>
    </div>
</body>

</html>
`;export{n as default};

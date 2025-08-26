// Function to render markdown to HTML
function renderMarkdown(markdownText) {
  if (!markdownText) return '';
  return parseMarkdown(markdownText);
}

// Comprehensive Markdown-to-HTML converter
function parseMarkdown(markdownText) {
  let html = markdownText
    // Normalize line endings
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    
    // Convert ***bold and italic*** to <strong><em>
    .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
    
    // Convert **bold** to <strong>
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.*?)__/g, '<strong>$1</strong>')
    
    // Convert *italic* to <em>
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/_(.*?)_/g, '<em>$1</em>')
    
    // Convert ~~strikethrough~~ to <del>
    .replace(/~~(.*?)~~/g, '<del>$1</del>')
    
    // Convert `inline code` to <code>
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    
    // Convert [link text](url) to <a>
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
    
    // Convert [link text](url "title") to <a> with title
    .replace(/\[([^\]]+)\]\(([^)]+)\s+"([^"]+)"\)/g, '<a href="$2" title="$3" target="_blank">$1</a>')
    
    // Convert ![alt text](image.jpg) to <img>
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />')
    
    // Convert ![alt text](image.jpg "title") to <img> with title
    .replace(/!\[([^\]]*)\]\(([^)]+)\s+"([^"]+)"\)/g, '<img src="$2" alt="$1" title="$3" />')
    
    // Convert headers (must be done in order from largest to smallest)
    .replace(/^###### (.*$)/gm, '<h6>$1</h6>')
    .replace(/^##### (.*$)/gm, '<h5>$1</h5>')
    .replace(/^#### (.*$)/gm, '<h4>$1</h4>')
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    
    // Convert horizontal rules
    .replace(/^---$/gm, '<hr>')
    .replace(/^\*\*\*$/gm, '<hr>')
    .replace(/^___$/gm, '<hr>')
    
    // Convert > blockquotes to <blockquote>
    .replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>')
    
    // Handle code blocks (must be before lists)
    .replace(/```(\w+)?\n([\s\S]*?)```/g, function(match, lang, code) {
      const className = lang ? ` class="language-${lang}"` : '';
      return `<pre><code${className}>${code.trim()}</code></pre>`;
    })
    
    // Handle indented code blocks (4 spaces)
    .replace(/^    (.*)$/gm, '<pre><code>$1</code></pre>');

  // Handle lists (complex processing)
  html = processLists(html);
  
  // Handle tables
  html = processTables(html);
  
  // Convert line breaks to paragraphs (must be last)
  html = processParagraphs(html);
  
  return html.trim();
}

// Process unordered and ordered lists
function processLists(html) {
  const lines = html.split('\n');
  const result = [];
  let inList = false;
  let listType = '';
  let listLevel = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();
    
    // Check for unordered list items
    const unorderedMatch = line.match(/^(\s*)([-*+])\s(.+)$/);
    // Check for ordered list items
    const orderedMatch = line.match(/^(\s*)(\d+\.)\s(.+)$/);
    // Check for task list items
    const taskMatch = line.match(/^(\s*)([-*+])\s(\[[ x]\])\s(.+)$/);
    
    if (taskMatch) {
      const indent = taskMatch[1].length;
      const checked = taskMatch[3] === '[x]' ? ' checked' : '';
      const content = taskMatch[4];
      
      if (!inList || listType !== 'task' || indent !== listLevel) {
        if (inList) result.push(`</${listType}>`);
        result.push('<ul class="task-list">');
        inList = true;
        listType = 'ul';
        listLevel = indent;
      }
      
      result.push(`<li><input type="checkbox"${checked} disabled> ${content}</li>`);
      
    } else if (unorderedMatch) {
      const indent = unorderedMatch[1].length;
      const content = unorderedMatch[3];
      
      if (!inList || listType !== 'ul' || indent !== listLevel) {
        if (inList) result.push(`</${listType}>`);
        result.push('<ul>');
        inList = true;
        listType = 'ul';
        listLevel = indent;
      }
      
      result.push(`<li>${content}</li>`);
      
    } else if (orderedMatch) {
      const indent = orderedMatch[1].length;
      const content = orderedMatch[3];
      
      if (!inList || listType !== 'ol' || indent !== listLevel) {
        if (inList) result.push(`</${listType}>`);
        result.push('<ol>');
        inList = true;
        listType = 'ol';
        listLevel = indent;
      }
      
      result.push(`<li>${content}</li>`);
      
    } else {
      // Not a list item
      if (inList && trimmedLine === '') {
        // Empty line in list - continue list
        result.push(line);
      } else if (inList && trimmedLine !== '') {
        // Non-empty, non-list line - end list
        result.push(`</${listType}>`);
        inList = false;
        listType = '';
        listLevel = 0;
        result.push(line);
      } else {
        // Normal line
        result.push(line);
      }
    }
  }
  
  // Close any remaining list
  if (inList) {
    result.push(`</${listType}>`);
  }
  
  return result.join('\n');
}

// Process tables
function processTables(html) {
  const lines = html.split('\n');
  const result = [];
  let inTable = false;
  let tableLines = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Check if line looks like a table row
    if (line.includes('|') && line.split('|').length >= 3) {
      if (!inTable) {
        inTable = true;
        tableLines = [];
      }
      tableLines.push(line);
    } else {
      // Not a table line
      if (inTable) {
        // Process accumulated table lines
        if (tableLines.length >= 2) {
          result.push(processTable(tableLines));
        } else {
          // Not enough lines for a table, add as regular lines
          result.push(...tableLines);
        }
        inTable = false;
        tableLines = [];
      }
      result.push(lines[i]);
    }
  }
  
  // Handle table at end of content
  if (inTable && tableLines.length >= 2) {
    result.push(processTable(tableLines));
  } else if (inTable) {
    result.push(...tableLines);
  }
  
  return result.join('\n');
}

// Process a single table
function processTable(tableLines) {
  if (tableLines.length < 2) return tableLines.join('\n');
  
  const headerLine = tableLines[0];
  const separatorLine = tableLines[1];
  const dataLines = tableLines.slice(2);
  
  // Check if second line is a separator
  if (!separatorLine.match(/^[\|\s\-:]+$/)) {
    return tableLines.join('\n');
  }
  
  let table = '<table>\n';
  
  // Process header
  const headerCells = headerLine.split('|').map(cell => cell.trim()).filter(cell => cell !== '');
  table += '<thead>\n<tr>\n';
  headerCells.forEach(cell => {
    table += `<th>${cell}</th>\n`;
  });
  table += '</tr>\n</thead>\n';
  
  // Process data rows
  if (dataLines.length > 0) {
    table += '<tbody>\n';
    dataLines.forEach(line => {
      const cells = line.split('|').map(cell => cell.trim()).filter(cell => cell !== '');
      table += '<tr>\n';
      cells.forEach(cell => {
        table += `<td>${cell}</td>\n`;
      });
      table += '</tr>\n';
    });
    table += '</tbody>\n';
  }
  
  table += '</table>';
  return table;
}

// Process paragraphs (must be done last)
function processParagraphs(html) {
  return html
    // Split by double newlines for paragraphs
    .split('\n\n')
    .map(paragraph => {
      paragraph = paragraph.trim();
      if (paragraph === '') return '';
      
      // Don't wrap certain elements in <p> tags
      if (paragraph.match(/^<(h[1-6]|ul|ol|table|blockquote|pre|hr|div)/)) {
        return paragraph;
      }
      
      // Handle single line breaks within paragraphs (two spaces + newline)
      paragraph = paragraph.replace(/  \n/g, '<br>\n');
      
      return `<p>${paragraph.replace(/\n/g, '<br>')}</p>`;
    })
    .join('\n\n');
}

// Additional utility functions for special features

// Process definition lists (if needed)
function processDefinitionLists(html) {
  return html.replace(/^([^\n:]+)\n:\s+(.+)$/gm, '<dl><dt>$1</dt><dd>$2</dd></dl>');
}

// Process footnotes (basic implementation)
function processFootnotes(html) {
  const footnotes = {};
  let footnoteCounter = 1;
  
  // Extract footnote definitions
  html = html.replace(/^\[\^([^\]]+)\]:\s*(.+)$/gm, (match, id, content) => {
    footnotes[id] = { number: footnoteCounter++, content };
    return '';
  });
  
  // Replace footnote references
  html = html.replace(/\[\^([^\]]+)\]/g, (match, id) => {
    if (footnotes[id]) {
      return `<sup><a href="#fn${footnotes[id].number}" id="fnref${footnotes[id].number}">${footnotes[id].number}</a></sup>`;
    }
    return match;
  });
  
  // Add footnotes section if any footnotes exist
  if (Object.keys(footnotes).length > 0) {
    html += '\n\n<div class="footnotes">\n<ol>\n';
    Object.entries(footnotes).forEach(([id, footnote]) => {
      html += `<li id="fn${footnote.number}">${footnote.content} <a href="#fnref${footnote.number}">↩</a></li>\n`;
    });
    html += '</ol>\n</div>';
  }
  
  return html;
}

// Escape HTML in code blocks and inline code
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// Enhanced parser with all features
function parseMarkdownAdvanced(markdownText, options = {}) {
  const {
    footnotes = false,
    definitionLists = false,
    taskLists = true,
    tables = true
  } = options;
  
  let html = parseMarkdown(markdownText);
  
  if (footnotes) {
    html = processFootnotes(html);
  }
  
  if (definitionLists) {
    html = processDefinitionLists(html);
  }
  
  return html;
}

// Example usage:
/*
const markdownText = `
# Header 1

This is a **bold** and *italic* text with \`inline code\`.

## Header 2

- List item 1
- List item 2
- List item 3

### Header 3

> This is a blockquote

| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |

[Link text](https://example.com)

![Alt text](image.jpg)
`;

const html = parseMarkdown(markdownText);
console.log(html);
*/

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { 
    parseMarkdown, 
    parseMarkdownAdvanced,
    processLists,
    processTables,
    processFootnotes,
    processDefinitionLists
  };
}

function setResponsiveIndent() {
  const indent = window.innerWidth >= 770 ? '3.5rem' : '0.25rem';
  document.documentElement.style.setProperty('--article-indent', indent);
}

window.addEventListener('resize', setResponsiveIndent);
setResponsiveIndent(); 

function setResponsiveFontSize() {
  const fontSize = window.innerWidth >= 770 ? '1.75rem' : '1.25rem';
  document.documentElement.style.setProperty('--article-font-size', fontSize);
}

window.addEventListener('resize', setResponsiveFontSize);
setResponsiveFontSize(); 

const articles = [
    {
      id: "1",
      title: "<div style=\"font-size: var(--article-font-size, 1rem)\"><strong>IKI-GIZ-ICUE Completion Ceremony</strong></div>",
      lead: "<div style=\"line-height: 1.5;\"><em>Province's Leader Attending</em></div>",
      author: "<div style=\"text-align: center;\"><strong>ICUE-IKI-Giz & City of Hội An</strong></div>",
      date: "<div style=\"text-align: center;\"><em>2025-05-16</em></div>",
      images: [
        {
          src: "/public/news/articles/article_1/all_together.jpg",
          caption: "Project Participants",
          type: "image"
        },
         {
          src: "/public/news/articles/article_1/11.mp4",
          caption: "Video of the Inauguration Ceremony",
          type: "video"
        },
        {
          src: "/public/news/articles/article_1/1.jpg",
          caption: "Members - ICUE",
          type: "image"
        },
        {
          src: "/public/news/articles/article_1/2.jpg",
          caption: "Performance",
          type: "image"
        },
        {
          src: "/public/news/articles/article_1/3.jpg",
          caption: "Children Participants",
          type: "image"
        },
        {
          src: "/public/news/articles/article_1/4.jpg",
          caption: "Province Leader - Mr. Dũng",
          type: "image"
        },
        {
          src: "/public/news/articles/article_1/5.jpg",
          caption: "Equipment Inspection",
          type: "image"
        },
        {
          src: "/public/news/articles/article_1/6.jpg",
          caption: "Ribbon Cutting",
          type: "image"
        },
        {
          src: "/public/news/articles/article_1/7.jpg",
          caption: "Organizational Unit Card",
          type: "image"
        },
        {
          src: "/public/news/articles/article_1/8.jpg",
          caption: "People of Hoi An City Exercising",
          type: "image"
        },
        {
          src: "/public/news/articles/article_1/9.jpg",
          caption: "Signing Handover",
          type: "image"
        },
        {
          src: "/public/news/articles/article_1/10.jpg",
          caption: "Signing Handover",
          type: "image"
        },
      ],
      bodyMarkdown: `
**Date:** May 16, 2025
The Institute for Construction and Urban Economic Research (ICUE), in coordination with the People's Committee of Hoi An City, organized a special event to inaugurate and hand over the green space and coastal park (now named **Au Co Park**), marking the successful completion of the project titled:

> "Preventing erosion on Cua Dai beach through green corridors and park"
<div style="margin-left: var(--article-indent, 1rem);">
This initiative was implemented under the **Climate Capacity Building and Biodiversity Action at National and Local Levels (CBF) program**, under the grant agreement of the **International Climate Initiative (IKI)**, with ICUE as the grant recipient and project implementer, and the **Deutsche Gesellschaft für Internationale Zusammenarbeit (GIZ) GmbH** as the project manager.
The project played a crucial role in supporting climate action and biodiversity protection efforts in Vietnam.

### Event Significance
The event served not only as a closing ceremony for the project but also as an opportunity to reflect on the progress made thanks to the shared commitment of all partners involved.
The presence of stakeholders, experts, and contributors further highlighted the collaborative nature of this initiative and its positive impact on sustainable urban development in the Cua Dai area of Hoi An City.
### Key Highlights
Over the past months, the project: </div>

<ul style="margin-left: var(--article-indent, 1rem);">
<li> Strengthened technical and institutional capacities </li>
<li> Promoted deeper cooperation between central and local governments on climate change issues </li>
<li> Reflected a shared vision of a more climate-resilient and environmentally responsible future </li>
</ul>

<div style="margin-left: var(--article-indent, 1rem);">
### Acknowledgments

None of this would have been possible without the generous support from **IKI** and the enthusiastic assistance from **GIZ** in implementing the project. We very much appreciate:

<ul>
<li> The facilitation provided by the People's Committee of Quang Nam Province</li>
<li> The close coordination with the Hoi An City government and the Cua Dai Ward authorities</li>
<li> The collaboration from local communities and civil society organizations</li>
</ul>

The trust and funding from **IKI & GIZ** made this project a reality and delivered tangible benefits to the local community. We express our heartfelt gratitude to IKI & GIZ for their continuous support and trust.

### Looking Ahead

This inauguration and handover ceremony is not an end, but rather a **new beginning** — paving the way for future cooperation towards greener, more sustainable cities in Vietnam and beyond. </div>

## Thank You Everyone!
> "We Hope You Enjoyed The Ceremony — Thanks for Coming!"
`,
      pdf: "/public/files/speech.pdf",
      pdfButtonText: "Download - Speech ⇲"
    },
    {
      id: "2",
      title: "<div style=\"font-size: var(--article-font-size, 1rem);\">8th Asia Regional Conservation Forum Opens in Thailand</div>",
      lead: "<div style=\"line-height: 1.5;\">*On September 3, the **8th Asia Regional Conservation Forum (RCF)** of the **International Union for Conservation of Nature (IUCN)** officially opened in Bangkok, Thailand. The event brought together nearly **600** conservation leaders from across the region, including representatives from governments, NGOs, donors and partners, academic institutions, and the private sector, along with other stakeholders*.</div>",
      author: "By ICUE",
      date: "<div style=\"text-align: center;\"><em>03 September, 2024</em></div>",
      images: [
        {
          src: "/public/news/articles/article_2/conference.jpg",
          caption: "Vietnamese Delegation Participating in RCF 2024 Activities",
          type: "image"
        },
        {
          src: "/public/news/articles/article_2/1.jpg",
          caption: "For a Future Where Tigers Are Conserved — Delegates Discuss Bold Strategies at the Asia RCF Forum.",
          type: "image"
        },
        {
          src: "/public/news/articles/article_2/2.jpg",
          caption: "The Opening Session of the 8th Asia Regional Conservation Forum — Leaders Gather Under the Theme Reimagining Conservation in Asia.",
          type: "image"
        },
        {
          src: "/public/news/articles/article_2/3.jpg",
          caption: "Young Leaders Step Up — Affirming That the Next Generation Is Not the 'Future,' but the Present in Conservation Efforts.",
          type: "image"
        },
        {
          src: "/public/news/articles/article_2/4.jpg",
          caption: "Cooperation in Action — Delegates from Across Asia Connect, Share, and Collaborate on Positive Solutions for Nature.",
          type: "image"
        },
      ],
      bodyMarkdown: `
<div style="margin-left: var(--article-indent, 1rem);">
### Vietnam Delegation at IUCN Asia RCF

Representing **Vietnam**, the delegation included members from **IUCN Vietnam**, notably **Dr. Nguyễn Hồng Hạnh**, Director of the **Institute for Construction and Urban Economics Research (ICUE)**.

ICUE participated as one of the members presenting on **marine conservation** and **sustainable rural development**.

The institute delivered a summary report on part of the project:

> "Support for Coastal Erosion Prevention at Cửa Đại through Green Corridors and Coastal Ecological Parks."

---

### Forum Theme and Objectives

The **Asia Regional Conservation Forum (RCF)** runs for three days under the theme:

> "Reimagining Conservation in Asia: A Positive Future for Nature."

***The forum aims to:***

<div style="margin-left: var(--article-indent, 1rem);">
- Assess conservation progress
- Revisit priority goals
- Propose strategic directions to address environmental and biodiversity challenges over the next 20 years </div>
---
### Youth Leadership Forum

As part of **RCF 2024**, the **first-ever Youth Leadership Forum** — organized by young people from 23 countries — highlighted the role of **young experts** and their growing contributions to nature conservation.
---
### Key Features of the 8th IUCN Asia RCF

- **8 technical sessions** focused on both new and ongoing program priorities
- **17 side events** hosted by IUCN Members, Commissions, and partners
- An **exhibition area** showcasing conservation efforts

---

### International Partnerships

**Dr. Nguyễn Hồng Hạnh** also connected with **Mr. Pornphrom Vikitsreth**, a policy analyst from Thailand's **Democrat Party** and a strong advocate for the party's climate change agenda.

He promotes both **mitigation** and **adaptation** strategies, raising awareness of climate change issues among **youth networks** and **local communities** across the country.

Mr. Vikitsreth holds a **Master's degree in Global Affairs** from New York University.

---

### Thailand Environment Institute

The forum also engaged with the **Thailand Environment Institute**, an organization striving to become a leading, **non-partisan environmental body** aligned with international standards and committed to promoting **sustainable development**.

---

### China Biodiversity Conservation and Green Development Foundation

The **CBCGDF (China Biodiversity Conservation and Green Development Foundation)** is a national public fundraising foundation in China. Over the years, it has played a vital role in **biodiversity conservation** and **green development**.

To reflect evolving times, the foundation was renamed **"China Biodiversity Conservation and Green Development Foundation"**, integrating biodiversity conservation with green development.

This renaming reflects the belief that:

> Biodiversity is developed through conservation and preserved through development.

The organization continues to actively support **China's economic restructuring** while ensuring sustainability.

---

### Learning and Knowledge Sharing

During the three-day event, a dedicated **learning session** was held, including **knowledge-sharing** and **short training sessions** conducted by the **IUCN Academy**.

Participants also had the opportunity to explore the **exhibition** and learn from various **collaborative conservation efforts**. </div>
`,
      pdf: ""
    },
    {
      id: "3",
      title: "<div style=\"font-size: var(--article-font-size, 1rem);\">Aiding People & Areas Affected by Yagi Storm</div>",
      lead: "<div style=\"line-height: 1.5;\">*In response to the call from the Central Committee, **the Institute for Construction and Urban Economic Research (ICUE)** issued a notice calling on all of its staff, partners, and benefactors to join hands in contributing and supporting people affected by **Typhoon Yagi***.</div>",
      author: "By ICUE",
      date: "<div style=\"text-align: center;\"><em>26 September, 2024</em></div>",
      images: [
        {
          src: "/public/news/articles/article_3/area_affected.png",
          caption: "Area Affected by Typhoon Yagi",
        },
        {
          src: "/public/news/articles/article_3/1.jpg",
          caption: "Area Affected by Typhoon Yagi"
        },
        {
          src: "/public/news/articles/article_3/2.jpg",
          caption: "Area Affected by Typhoon Yagi"
        },
        {
          src: "/public/news/articles/article_3/3.jpg",
          caption: "Area Affected by Typhoon Yagi"
        },
        {
          src: "/public/news/articles/article_3/4.jpg",
          caption: "ICUE Volunteer Group"
        },
        {
          src: "/public/news/articles/article_3/5.jpg",
          caption: "ICUE Volunteer Group"
        },
        {
          src: "/public/news/articles/article_3/6.jpg",
          caption: "ICUE Volunteer Group"
        },
        {
          src: "/public/news/articles/article_3/7.jpg",
          caption: "ICUE Volunteer Group"
        },
        {
          src: "/public/news/articles/article_3/8.jpg",
          caption: "ICUE Volunteer Group"
        },
        {
          src: "/public/news/articles/article_3/9.jpg",
          caption: "ICUE Volunteer Group"
        },
        {
          src: "/public/news/articles/article_3/10.jpg",
          caption: "ICUE Volunteer Group"
        },
        {
          src: "/public/news/articles/article_3/11.jpg",
          caption: "ICUE Volunteer Group"
        },
         {
          src: "/public/news/articles/article_3/a_thank_you_letter.png",
          caption: "Thank You Letter"
        }
      ],
      bodyMarkdown: `
In recent days, due to the impact of **Typhoon No. 3 (Typhoon Yagi)**, **Bảo Yên District** has continuously suffered from heavy rains and successive floods, causing severe damage to many communes in the district.  

Particularly during the three days from **September 8–10, 2024**, prolonged heavy rain combined with rising floodwaters led to widespread flooding and landslides.  

<div style="margin-left: var(--article-indent, 1rem);">
- **Casualties:** 71 deaths, 29 injuries, and 11 people unaccounted for  
- **Damage:** Transportation systems destroyed; homes, property, and crops heavily impacted  
- **Housing impact:** 4,825 homes affected, with estimated damages of around **820 billion VND** 
This is the **most severe flooding ever recorded** in Bảo Yên District. Answering the call, our volunteers were able to distribute aid packages to those in need. </div> 

<div style="margin-left: var(--article-indent, 1rem);">
### Each package included:
- 10 kg of fragrant rice  
- Cooking oil  
- Roasted peanuts  
- Preserved pork with shrimp paste  
- Hải Châu seasoning powder  
- Clothing, blankets, and mosquito nets  
</div> 
---
<div style="margin-left: var(--article-indent, 1rem);">
In **Chom Hamlet**, significant losses were reported in terms of property, crops, and livestock. Notably, three households had their homes completely collapsed. Fortunately, there were no human casualties. 
The families affected — **Mrs. Hoàng Thị Bốn**, **Mr. Hoàng Văn Bản**, and **Mr. Nguyễn Bá Quán** — were given **aid four times larger** than the standard packages. </div> 
---
> *"We hope the people can soon stabilize their lives, overcome difficulties, and join hands to build a strong and resilient community."*

      `,
      pdf: "/public/files/photos.zip",
      pdfButtonText: "Trip Photos"
    },
    {
      id: "4",
      title: "<div style=\"font-size: var(--article-font-size, 1rem);\">Conference for Smart Cities and Sustainable Urban Development projects in Vietnam 2018-2025 and the 2030 Vision</div>",
      lead: "*Vietnam's Smart City Initiative: Achievements and Roadmap for 2025-2030*",
      author: "By ICUE",
      date: "<div style=\"text-align: center;\"><em>August 13, 2025</em></div>",
      images: [
        {
          src: "/public/news/articles/article_4/conference.jpg",
          caption: "Dr. Nguyễn Hồng Hạnh At the Conference."
        },
        {
          src: "/public/news/articles/article_4/1.jpg",
          caption: "Minister Trần Hồng Minh Speaking at the Conference."
        },
        {
          src: "/public/news/articles/article_4/2.jpg",
          caption: "Mr. Trần Quốc Thái, Director of the Urban Development Department, presented a summary report on the implementation of Project 950."
        },
        {
          src: "/public/news/articles/article_4/3.jpg",
          caption: "Deputy Minister of Construction Nguyễn Tường Văn affirmed that the development of smart cities is not a race for technology but must be people-centered."
        },
      ],
      bodyMarkdown: `
<div style="margin-left: var(--article-indent, 1rem);">
### Vietnam’s Smart City Initiative: Milestones and Roadmap for 2025-2030

Vietnam's journey toward developing smart cities has gained considerable momentum since the launch of the **“Phát triển đô thị thông minh bền vững Việt Nam giai đoạn 2018 - 2025”** (Smart and Sustainable Urban Development Project) in 2018.  

The initiative aims to harness technology to improve governance, enhance quality of life for citizens, and foster sustainable growth. The government has committed to transforming its urban landscape with the help of data-driven technologies and people-centric approaches, aiming for full implementation by 2030.  
</div>

Over the past seven years, the country has made significant strides in this direction, with several cities already showcasing successful implementations of smart city technologies.  

---

### Key Achievements

<div style="margin-left: var(--article-indent, 1rem);">
### 1. Citizen-Centric Solutions: Hue  
Hue has deployed the **Hue-S platform**, which allows citizens to directly report issues such as road repairs, sanitation, and infrastructure concerns.  
This app has facilitated a two-way communication channel between residents and local government, ensuring transparency and accountability in urban management. Hue-S has become a critical part of Hue’s smart city framework, helping improve services like healthcare, education, and traffic management.  
The city is also exploring more advanced smart services, such as AI-powered traffic control and smart lighting.  
---
### 2. Data-Driven Urban Management: Da Nang  
Da Nang has integrated smart infrastructure and digital services through its **Intelligent Operations Center (IOC)**, which manages data from sectors such as traffic, waste management, public services, and healthcare.  
The city has partnered with local tech companies to deploy **GIS** and **BIM (Building Information Modeling)** for urban planning, enabling predictive management—especially useful during peak tourism seasons.  
---
### 3. Smart Traffic Systems: Ho Chi Minh City  
Ho Chi Minh City has enhanced traffic management with **AI-based monitoring, camera surveillance, and automatic toll collection**.  
It has also adopted smart parking solutions and is researching self-driving vehicles. These initiatives directly support its goal of reducing congestion and lowering carbon emissions.  
---
### 4. Integrated Public Services: Hanoi  
Hanoi is developing **cloud-based data centers** and a **unified public service portal**. Citizens can now pay taxes, file complaints, and access government information in one place.  
By interconnecting departments via shared databases, Hanoi is streamlining administration and improving efficiency.  
---
### 5. Environmental and Green Smart Cities: Binh Dinh  
Binh Dinh is focusing on **green urbanization** with smart waste management, renewable energy projects, and solar-powered smart lighting.  
This aligns with Vietnam’s national goal of energy efficiency and sustainability.</div>  
---

### Challenges and Barriers  

<div style="margin-left: var(--article-indent, 1rem);">
- **Legal and Regulatory Gaps:** Fragmented frameworks hinder coordination.  
- **Data and Privacy Concerns:** Security risks in large-scale citizen data collection.  
- **Limited Financial Resources:** Smaller cities struggle to fund digital infrastructure.  
---
</div>

### Strategic Focus for 2025-2030  

<div style="margin-left: var(--article-indent, 1rem);">
1. **Legal and Regulatory Reform** – Establish a unified smart city legal framework.  
2. **Data Integration** – Create interoperable, city-wide data platforms.  
3. **Citizen Engagement** – Involve citizens as active participants in governance.  
4. **Workforce Development** – Upskill talent in AI, big data, and IoT.  
5. **Public-Private Partnerships** – Encourage collaboration with domestic and global partners.  
6. **Environmental Sustainability** – Expand renewable energy and eco-friendly solutions.  
7. **National Infrastructure** – Build a unified, nationwide data system.  
---
</div>
## Looking Ahead  

The next five years will be crucial for Vietnam’s smart city transformation. By 2030, the country aims to establish a **nationwide network of interconnected smart cities** with shared data systems, modern technology, and robust governance. Pioneering cities like **Hue, Da Nang, and Ho Chi Minh City** serve as models, proving that smart cities can be both engines of economic growth and champions of sustainability. With a **people-first approach**, Vietnam is positioning itself as a regional leader in smart city innovation.  

      `,
      pdf: "",
      pdfButtonText: ""
    },
];

// Modal and Image Swipe Functionality
let currentModalImages = [];
let currentModalIndex = 0;
let startX = 0;
let endX = 0;

// Article Swipe Functionality
let currentArticle = null;
let currentArticleIndex = 0;
let articleStartX = 0;
let articleEndX = 0;

function setupArticleSwipe(article) {
  currentArticle = article;
  currentArticleIndex = 0;
  
  const imageContainer = document.getElementById("article-image").parentElement;
  
  // Add navigation arrows
  if (!imageContainer.querySelector('.article-nav-btn')) {
    // Left arrow
    if (window.innerWidth >= 769) {
    const leftArrow = document.createElement('button');
    leftArrow.className = 'article-nav-btn article-prev-btn';
    leftArrow.innerHTML = '<svg fill="#fff" width="25px" height="25px" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg"><path d="M30 14.5c-.004.276-.224.504-.5.5h-26c-.66 0-.664-1 0-1h26c.282-.004.504.218.5.5zm-15 14c0 .45-.554.663-.854.354l-14-14c-.195-.196-.195-.512 0-.708l14-14c.426-.442 1.167.248.708.708L1.207 14.5l13.647 13.646c.097.095.146.22.146.354z"/></svg>';
    leftArrow.style.cssText = `
      position: absolute;
      left: 5px;
      top: 50%;
      transform: translateY(-50%);
      background: rgba(0,0,0,0.6);
      border: none;
      padding: 10px 15px;
      border-radius: 50%;
      cursor: pointer;
      z-index: 100;
      transition: all 0.3s ease;
      opacity: 0.7;
    `;
    leftArrow.onmouseenter = () => leftArrow.style.opacity = '1';
    leftArrow.onmouseleave = () => leftArrow.style.opacity = '0.7';
    leftArrow.onclick = () => navigateArticleMedia(-1);

    // Right arrow
    const rightArrow = document.createElement('button');
    rightArrow.className = 'article-nav-btn article-next-btn';
    rightArrow.innerHTML = '<svg fill="#fff" width="25px" height="25px" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg"><path d="M0 15.5c.004.276.224.504.5.5h26c.66 0 .664-1 0-1H.5c-.282-.004-.504.218-.5.5zm15 14c0 .45.554.663.854.354l14-14c.195-.195.195-.51 0-.707l-14-14c-.426-.443-1.167.248-.707.707L28.793 15.5 15.147 29.148c-.098.095-.147.218-.147.353z"/></svg>';
      rightArrow.style.cssText = `
        position: absolute;
        right: 5px;
        top: 50%;
        transform: translateY(-50%);
        background: rgba(0,0,0,0.6);
        border: none;
        padding: 10px 15px;
        border-radius: 50%;
        cursor: pointer;
        z-index: 100;
        transition: all 0.3s ease;
        opacity: 0.7;
      `;
      rightArrow.onmouseenter = () => rightArrow.style.opacity = '1';
      rightArrow.onmouseleave = () => rightArrow.style.opacity = '0.7';
      rightArrow.onclick = () => navigateArticleMedia(1);
      
      imageContainer.appendChild(leftArrow);
      imageContainer.appendChild(rightArrow);
      
      // Ensure container is positioned
      imageContainer.style.position = 'relative';
    }}

  // Add touch events for swipe
  imageContainer.addEventListener('touchstart', handleArticleTouchStart, { passive: false });
  imageContainer.addEventListener('touchmove', handleArticleTouchMove, { passive: false });
  imageContainer.addEventListener('touchend', handleArticleTouchEnd, { passive: false });
  
  // Add keyboard navigation
  document.addEventListener('keydown', handleArticleKeyboard);
  
  // Add media indicator dots
  addMediaIndicatorDots(article);
}

function navigateArticleMedia(direction) {
  if (!currentArticle || !currentArticle.images) return;
  
  currentArticleIndex += direction;
  
  if (currentArticleIndex < 0) {
    currentArticleIndex = currentArticle.images.length - 1;
  } else if (currentArticleIndex >= currentArticle.images.length) {
    currentArticleIndex = 0;
  }
  
  updateArticleMedia();
  updateMediaIndicatorDots();
}

function updateArticleMedia() {
  if (!currentArticle || !currentArticle.images) return;
  
  const media = currentArticle.images[currentArticleIndex];
  const isVideo = media.type === 'video' || media.src.toLowerCase().includes('.mp4') ||
                  media.src.toLowerCase().includes('.mov') || media.src.toLowerCase().includes('.webm') ||
                  media.src.toLowerCase().includes('.avi') || media.src.toLowerCase().includes('.mkv');
  
  const articleImageElement = document.getElementById("article-image");
  const articleCaptionElement = document.getElementById("article-caption");
  const imageContainer = articleImageElement.parentElement;
  
  // Remove any existing video containers
  const existingVideoContainer = imageContainer.querySelector('.article-video-container');
  if (existingVideoContainer) {
    existingVideoContainer.remove();
  }
  
  if (isVideo) {
    // Hide image and create video container
    articleImageElement.style.display = 'none';
    
    const videoContainer = document.createElement('div');
    videoContainer.className = 'article-video-container';
    videoContainer.style.cssText = `
      position: relative;
      width: 100%;
      height: auto;
      background: #fff;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      overflow: hidden;
    `;
    
    const video = document.createElement('video');
    video.src = media.src;
    video.controls = false; // Disable default controls to use custom ones
    video.preload = 'metadata';
    video.style.cssText = `
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 8px 8px 0 0;
    `;
    
    // Custom control bar container
    const controlBar = document.createElement('div');
    controlBar.className = 'video-control-bar';
    controlBar.style.cssText = `
      width: 100%;
      height: 40px;
      background: linear-gradient(135deg, #1a1a1a, #2d2d2d);
      padding: 15px 30px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 5px;
      border-radius: 0 0 8px 8px;
      box-shadow: 0 -2px 10px rgba(0,0,0,0.3);
    `;
    
    // Play/Pause button
    const playPauseBtn = document.createElement('button');
    playPauseBtn.innerHTML = '<svg width="24px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M3 12L3 18.9671C3 21.2763 5.53435 22.736 7.59662 21.6145L10.7996 19.8727M3 8L3 5.0329C3 2.72368 5.53435 1.26402 7.59661 2.38548L20.4086 9.35258C22.5305 10.5065 22.5305 13.4935 20.4086 14.6474L14.0026 18.131" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round"></path> </g></svg>';
    playPauseBtn.title = 'Play/Pause';
    playPauseBtn.style.cssText = `
      background: transparent;
      color: white;
      border: none;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 18px;
      cursor: pointer;
      transition: all 0.3s ease;
      min-width: 50px;
      height: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
    `;
    
    // Progress bar container
    const progressContainer = document.createElement('div');
    progressContainer.style.cssText = `
      flex: 1;
      height: 8px;
      background: rgba(255,255,255);
      border-radius: 4px;
      overflow: hidden;
      cursor: pointer;
      position: relative;
    `;
    
    const progressBar = document.createElement('div');
    progressBar.style.cssText = `
      width: 0%;
      height: 100%;
      background: linear-gradient(to right, #0ff, #e8e5ff);
      border-radius: 4px;
      transition: width 0.1s ease;
    `;
    
    // Time display
    const timeDisplay = document.createElement('span');
    timeDisplay.textContent = '0:00 / 0:00';
    timeDisplay.style.cssText = `
      color: white;
      font-size: 14px;
      font-family: Arial, sans-serif;
      min-width: 30px;
      text-align: center;
      transform: translateX(2.5px);
    `;
    
    // Volume button
    const volumeBtn = document.createElement('button');
    volumeBtn.innerHTML = '<svg style="transform:translateX(2.5px);" width="24px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M19 6C20.5 7.5 21 10 21 12C21 14 20.5 16.5 19 18M16 8.99998C16.5 9.49998 17 10.5 17 12C17 13.5 16.5 14.5 16 15M3 10.5V13.5C3 14.6046 3.5 15.5 5.5 16C7.5 16.5 9 21 12 21C14 21 14 3 12 3C9 3 7.5 7.5 5.5 8C3.5 8.5 3 9.39543 3 10.5Z" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>';
    volumeBtn.title = 'Volume';
    volumeBtn.style.cssText = `
      background: transparent;
      color: white;
      border: none;
      padding: 0;
      border-radius: 6px;
      font-size: 18px;
      cursor: pointer;
      transition: all 0.3s ease;
      min-width: 45px;
      height: 45px;
      display: flex;
      align-items: center;
      justify-content: center;
    `;
    
    // Fullscreen button
    const fullscreenBtn = document.createElement('button');
    fullscreenBtn.innerHTML = '<svg style="transform:translateX(-5px);" width="24px" height="24px" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" stroke-width="3" stroke="#ffffff" fill="none"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><polyline points="7.49 26 7.49 7.5 25.99 7.5"></polyline><polyline points="56.51 26 56.51 7.5 38.01 7.5"></polyline><polyline points="7.53 38 7.53 56.5 26.02 56.5"></polyline><polyline points="56.51 38 56.51 56.5 38.01 56.5"></polyline></g></svg>';
    fullscreenBtn.title = 'Open in modal';
    fullscreenBtn.style.cssText = `
      background: transparent;
      color: white;
      border: none;
      padding: 0;
      border-radius: 6px;
      font-size: 16px;
      cursor: pointer;
      transition: all 0.3s ease;
      min-width: 45px;
      height: 45px;
      display: flex;
      align-items: center;
      justify-content: center;
    `;
    
    const videoIndicator = document.createElement('div');
    videoIndicator.innerHTML = 'VIDEO';
    videoIndicator.style.cssText = `
      position: absolute;
      top: 15px;
      left: 15px;
      background: rgba(0,0,0,0.8);
      color: white;
      padding: 5px 10px;
      border-radius: 15px;
      font-size: 12px;
      font-weight: bold;
      z-index: 10;
      pointer-events: none;
    `;
    
    // Add hover effects
    playPauseBtn.onmouseenter = () => playPauseBtn.style.transform = "rotateZ(-360deg) scale(1.25)";
    playPauseBtn.onmouseleave = () => playPauseBtn.style.transform = "rotateZ(360deg) scale(1)";

    volumeBtn.onmouseenter = () => volumeBtn.style.transform = "scale(1.25)";
    volumeBtn.onmouseleave = () => volumeBtn.style.transform = "scale(1)";
    fullscreenBtn.onmouseenter = () => fullscreenBtn.style.transform = "rotateZ(-360deg) scale(1.25)";
    fullscreenBtn.onmouseleave = () => fullscreenBtn.style.transform = "rotateZ(360deg) scale(1)";
    // Event handlers
    playPauseBtn.onclick = () => {
      if (video.paused) {
        video.play();
        playPauseBtn.innerHTML = `<svg width="24px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M5.948 1.25H6.052C6.95048 1.24997 7.6997 1.24995 8.29448 1.32991C8.92228 1.41432 9.48908 1.59999 9.94455 2.05546C10.4 2.51093 10.5857 3.07773 10.6701 3.70552C10.7501 4.30031 10.75 5.04953 10.75 5.94801V18.052C10.75 18.9505 10.7501 19.6997 10.6701 20.2945C10.5857 20.9223 10.4 21.4891 9.94455 21.9445C9.48908 22.4 8.92228 22.5857 8.29448 22.6701C7.6997 22.7501 6.95048 22.75 6.052 22.75H5.94801C5.04953 22.75 4.30031 22.7501 3.70552 22.6701C3.07773 22.5857 2.51093 22.4 2.05546 21.9445C1.59999 21.4891 1.41432 20.9223 1.32991 20.2945C1.24995 19.6997 1.24997 18.9505 1.25 18.052V5.948C1.24997 5.04952 1.24995 4.3003 1.32991 3.70552C1.41432 3.07773 1.59999 2.51093 2.05546 2.05546C2.51093 1.59999 3.07773 1.41432 3.70552 1.32991C4.3003 1.24995 5.04952 1.24997 5.948 1.25ZM3.90539 2.81654C3.44393 2.87858 3.24644 2.9858 3.11612 3.11612C2.9858 3.24644 2.87858 3.44393 2.81654 3.90539C2.7516 4.38843 2.75 5.03599 2.75 6V18C2.75 18.964 2.7516 19.6116 2.81654 20.0946C2.87858 20.5561 2.9858 20.7536 3.11612 20.8839C3.24644 21.0142 3.44393 21.1214 3.90539 21.1835C4.38843 21.2484 5.03599 21.25 6 21.25C6.96401 21.25 7.61157 21.2484 8.09461 21.1835C8.55607 21.1214 8.75357 21.0142 8.88389 20.8839C9.0142 20.7536 9.12143 20.5561 9.18347 20.0946C9.24841 19.6116 9.25 18.964 9.25 18V6C9.25 5.03599 9.24841 4.38843 9.18347 3.90539C9.12143 3.44393 9.0142 3.24644 8.88389 3.11612C8.75357 2.9858 8.55607 2.87858 8.09461 2.81654C7.61157 2.7516 6.96401 2.75 6 2.75C5.03599 2.75 4.38843 2.7516 3.90539 2.81654ZM17.948 1.25H18.052C18.9505 1.24997 19.6997 1.24995 20.2945 1.32991C20.9223 1.41432 21.4891 1.59999 21.9445 2.05546C22.4 2.51093 22.5857 3.07773 22.6701 3.70552C22.7501 4.30031 22.75 5.04953 22.75 5.94801V18.052C22.75 18.9505 22.7501 19.6997 22.6701 20.2945C22.5857 20.9223 22.4 21.4891 21.9445 21.9445C21.4891 22.4 20.9223 22.5857 20.2945 22.6701C19.6997 22.7501 18.9505 22.75 18.052 22.75H17.948C17.0495 22.75 16.3003 22.7501 15.7055 22.6701C15.0777 22.5857 14.5109 22.4 14.0555 21.9445C13.6 21.4891 13.4143 20.9223 13.3299 20.2945C13.2499 19.6997 13.25 18.9505 13.25 18.052V5.94801C13.25 5.04953 13.2499 4.30031 13.3299 3.70552C13.4143 3.07773 13.6 2.51093 14.0555 2.05546C14.5109 1.59999 15.0777 1.41432 15.7055 1.32991C16.3003 1.24995 17.0495 1.24997 17.948 1.25ZM15.9054 2.81654C15.4439 2.87858 15.2464 2.9858 15.1161 3.11612C14.9858 3.24644 14.8786 3.44393 14.8165 3.90539C14.7516 4.38843 14.75 5.03599 14.75 6V18C14.75 18.964 14.7516 19.6116 14.8165 20.0946C14.8786 20.5561 14.9858 20.7536 15.1161 20.8839C15.2464 21.0142 15.4439 21.1214 15.9054 21.1835C16.3884 21.2484 17.036 21.25 18 21.25C18.964 21.25 19.6116 21.2484 20.0946 21.1835C20.5561 21.1214 20.7536 21.0142 20.8839 20.8839C21.0142 20.7536 21.1214 20.5561 21.1835 20.0946C21.2484 19.6116 21.25 18.964 21.25 18V6C21.25 5.03599 21.2484 4.38843 21.1835 3.90539C21.1214 3.44393 21.0142 3.24644 20.8839 3.11612C20.7536 2.9858 20.5561 2.87858 20.0946 2.81654C19.6116 2.7516 18.964 2.75 18 2.75C17.036 2.75 16.3884 2.7516 15.9054 2.81654Z" fill="#ffffff"></path> </g></svg>`;
      } else {
        video.pause();
        playPauseBtn.innerHTML = '<svg width="24px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M3 12L3 18.9671C3 21.2763 5.53435 22.736 7.59662 21.6145L10.7996 19.8727M3 8L3 5.0329C3 2.72368 5.53435 1.26402 7.59661 2.38548L20.4086 9.35258C22.5305 10.5065 22.5305 13.4935 20.4086 14.6474L14.0026 18.131" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round"></path> </g></svg>';
      }
    };
    
    // Progress bar click
    progressContainer.onclick = (e) => {
      const rect = progressContainer.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const width = rect.width;
      const percentage = clickX / width;
      video.currentTime = percentage * video.duration;
    };
    
    // Update progress and time
    video.ontimeupdate = () => {
      if (video.duration) {
        const percentage = (video.currentTime / video.duration) * 100;
        progressBar.style.width = percentage + '%';
        
        const current = formatTime(video.currentTime);
        const total = formatTime(video.duration);
        timeDisplay.textContent = `${current} / ${total}`;
      }
    };
    
    // Volume control
    volumeBtn.onclick = () => {
      if (video.muted) {
        video.muted = false;
        volumeBtn.innerHTML = '<svg width="24px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M19 6C20.5 7.5 21 10 21 12C21 14 20.5 16.5 19 18M16 8.99998C16.5 9.49998 17 10.5 17 12C17 13.5 16.5 14.5 16 15M3 10.5V13.5C3 14.6046 3.5 15.5 5.5 16C7.5 16.5 9 21 12 21C14 21 14 3 12 3C9 3 7.5 7.5 5.5 8C3.5 8.5 3 9.39543 3 10.5Z" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>';
      } else {
        video.muted = true;
        volumeBtn.innerHTML = '<svg width="24px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M22 9L16 15M16 9L22 15M3 10.5V13.5C3 14.6046 3.5 15.5 5.5 16C7.5 16.5 9 21 12 21C14 21 14 3 12 3C9 3 7.5 7.5 5.5 8C3.5 8.5 3 9.39543 3 10.5Z" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>';
      }
    };
    
    fullscreenBtn.onclick = (e) => {
      e.stopPropagation();
      openImageModal(currentArticle.images, currentArticleIndex);
    };
    
    // Helper function to format time
    function formatTime(seconds) {
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    
    // Assemble the video player
    progressContainer.appendChild(progressBar);
    controlBar.appendChild(playPauseBtn);
    controlBar.appendChild(progressContainer);
    controlBar.appendChild(timeDisplay);
    controlBar.appendChild(volumeBtn);
    controlBar.appendChild(fullscreenBtn);
    
    videoContainer.appendChild(video);
    videoContainer.appendChild(videoIndicator);
    videoContainer.appendChild(controlBar);
    
    imageContainer.insertBefore(videoContainer, articleImageElement);
  } else {
    // Show image
    articleImageElement.style.display = 'block';
    articleImageElement.style.width = '100%';
    articleImageElement.style.height = '550px';
    articleImageElement.style.objectFit = 'cover';
    articleImageElement.style.borderRadius = '8px';
    articleImageElement.src = media.src;
    articleImageElement.onclick = () => openImageModal(currentArticle.images, currentArticleIndex);
  }
  
  articleCaptionElement.textContent = media.caption;
  articleCaptionElement.style.marginTop = '10px';
  
  // Update counter indicator
  const indicator = imageContainer.querySelector('.image-count-indicator');
  if (indicator) {
    indicator.textContent = `${currentArticleIndex + 1}/${currentArticle.images.length}`;
    indicator.style.color = '#ffffff';
  }
}

function addMediaIndicatorDots(article) {
  const imageContainer = document.getElementById("article-image").parentElement;
  
  // Remove existing dots
  const existingDots = imageContainer.querySelector('.media-dots-container');
  if (existingDots) {
    existingDots.remove();
  }
  
  if (article.images.length <= 1) return;
  
  const dotsContainer = document.createElement('div');
  dotsContainer.className = 'media-dots-container';
  dotsContainer.style.cssText = `
    position: absolute;
    bottom: 92.5%;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 8px;
    z-index: 100;
  `;
  
  article.images.forEach((_, index) => {
    const dot = document.createElement('button');
    dot.className = `media-dot ${index === 0 ? 'active' : ''}`;
    dot.style.cssText = `
      width: 15px;
      height: 15px;
      border-radius: 50%;
      border: 1px solid black;
      background: ${index === 0 ? '#22c55e' : 'rgba(255,255,255,0.75)'};
      cursor: pointer;
      transition: all 0.3s ease;
    `;
    dot.onmouseenter = () => {
      if (index !== currentArticleIndex) {
        dot.style.background = 'rgba(0,0,0,0.45)';
        dot.style.transform = 'scale(1.15)';
      }
    };
    dot.onmouseleave = () => {
      if (index !== currentArticleIndex) {
        dot.style.background = 'rgba(255,255,255,0.75)';
        dot.style.transform = 'scale(1)';
      }
    };
    dot.onclick = () => {
      currentArticleIndex = index;
      updateArticleMedia();
      updateMediaIndicatorDots();
    };
    dotsContainer.appendChild(dot);
  });
  
  imageContainer.appendChild(dotsContainer);
}

function updateMediaIndicatorDots() {
  const dots = document.querySelectorAll('.media-dot');
  dots.forEach((dot, index) => {
    const isActive = index === currentArticleIndex;
    dot.style.background = isActive ? 'green' : 'rgba(255,255,255,0.3)';
    dot.style.border = isActive ? '1px solid #000' : '1px solid rgba(0,0,0,0.8)';
    dot.style.width = isActive ? '15px' : '15px';
    dot.style.height = isActive ? '15px' : '15px';
    dot.style.transform = isActive ? 'scale(1.2)' : 'scale(1)';
    dot.className = `media-dot ${isActive ? 'active' : ''}`;
  });
}

// Touch event handlers for article swipe
function handleArticleTouchStart(e) {
  articleStartX = e.touches[0].clientX;
}

function handleArticleTouchMove(e) {
  if (!articleStartX) return;
  e.preventDefault();
}

function handleArticleTouchEnd(e) {
  if (!articleStartX) return;
  
  articleEndX = e.changedTouches[0].clientX;
  const diffX = articleStartX - articleEndX;
  const threshold = 50;
  
  if (Math.abs(diffX) > threshold) {
    if (diffX > 0) {
      navigateArticleMedia(1); // Swipe left = next
    } else {
      navigateArticleMedia(-1); // Swipe right = previous
    }
  }
  
  articleStartX = 0;
  articleEndX = 0;
}

// Keyboard navigation for article
function handleArticleKeyboard(e) {
  // Only handle if not in modal
  if (document.getElementById('image-modal').style.display !== 'flex') {
    switch(e.key) {
      case 'ArrowLeft':
        navigateArticleMedia(-1);
        e.preventDefault();
        break;
      case 'ArrowRight':
        navigateArticleMedia(1);
        e.preventDefault();
        break;
    }
  }
}

function createImageModal() {
  const modalHTML = `
    <div id="image-modal" style="
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.9);
      z-index: 9999;
      justify-content: center;
      align-items: center;
    ">
      <div class="modal-content" style="
        position: relative;
        width: 85%;
        height: auto;
        overflow: hidden;
        max-width: 92.5%;
        max-height: 92.5%;
        object-fit:cover;
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-left: -0.5rem;
      ">
        <button id="modal-close" class="modal-close" style="
          position: absolute;
          top: 0;
          right: 50px;
          background: none;
          border: none;
          color: white;
          font-size: 50px;
          cursor: pointer;
          z-index: 10000;
        ">&times;</button>
        
        <div class="image-container" style="
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 70vh;
        ">
          <button id="modal-prev" class="modal-arrow" style="
            position: absolute;
            left: 50px;
            background: transparent;
            border: none;
            color: white;
            font-size: 24px;
            padding: 10px 15px;
            cursor: pointer;
            border-radius: 50%;
            z-index: 10000;
          "><svg width="32px" height="32px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22 12H2" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M8 19L2.84 14C2.57 13.74 2.35 13.43 2.20 13.09C2.05 12.75 1.98 12.37 1.98 12C1.98 11.62 2.05 11.25 2.20 10.91C2.35 10.57 2.57 10.26 2.84 10L8 5" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          </button>
          <img id="modal-image" style="
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
            user-select: none;
            -webkit-user-drag: none;
            display: none;
          ">
          
          <video id="modal-video" controls style="
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
            display: none;
            border-radius: 8px;
          ">
            Your browser does not support the video tag.
          </video>
          
          <button id="modal-next" class="modal-arrow" style="
            position: absolute;
            right: 50px;
            background: transparent;
            border: none;
            color: white;
            font-size: 24px;
            padding: 10px 15px;
            cursor: pointer;
            border-radius: 50%;
            z-index: 10000;
          "><svg width="32px" height="32px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M2 12.0701H22" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M16 5L21.16 10C21.4324 10.2571 21.6494 10.567 21.7977 10.9109C21.946 11.2548 22.0226 11.6255 22.0226 12C22.0226 12.3745 21.946 12.7452 21.7977 13.0891C21.6494 13.433 21.4324 13.7429 21.16 14L16 19" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg></button>
        </div>
        
        <div class="modal-description" style="
          margin-top: 0px;
          text-align: center;
          color: white;
          max-width: 600px;
        ">
          <div id="modal-caption" style="
            font-size: 16px;
            margin: 15px;
          "></div>
          <div id="modal-counter" style="
            font-size: 14px;
            opacity: 0.7;
            color: #fff;
            background: #000;
          "></div>
        </div>
        
        <div id="modal-thumbnails" class="media-thumbnails" style="
          display: flex;
          gap: 10px;
          margin-top: 20px;
          max-width: 100%;
          overflow-x: auto;
          padding: 10px 0;
        "></div>
      </div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    @media (max-width: 768px) {
      .modal-arrow {
        display: none !important;
      }
      .image-container {
        margin-top: -75px !important;
      }
      .modal-close {
        top: 0 !important;
        right: 0 !important;
        font-size: 30px !important;
      }
      .modal-description {
        margin-top: -110px !important;
      }
      .media-thumbnails {
        margin-top: -2.5px !important;
      }
    }
  `;
  document.head.appendChild(style);

  document.body.insertAdjacentHTML('beforeend', modalHTML);
  
  // Add event listeners
  document.getElementById('modal-close').onclick = closeImageModal;
  document.getElementById('modal-prev').onclick = () => navigateModal(-1);
  document.getElementById('modal-next').onclick = () => navigateModal(1);
  
  // Click outside to close
  document.getElementById('image-modal').onclick = (e) => {
    if (e.target.id === 'image-modal') closeImageModal();
  };
  
  // Keyboard navigation
  document.addEventListener('keydown', handleModalKeyboard);
  
  // Touch events for mobile swipe - apply to both image and video
  const modalImage = document.getElementById('modal-image');
  const modalVideo = document.getElementById('modal-video');
  const imageContainer = document.querySelector('.image-container');
  
  // Apply touch events to the container so it works for both image and video
  imageContainer.addEventListener('touchstart', handleTouchStart, { passive: false });
  imageContainer.addEventListener('touchmove', handleTouchMove, { passive: false });
  imageContainer.addEventListener('touchend', handleTouchEnd, { passive: false });
}

function openImageModal(images, startIndex = 0) {
  currentModalImages = images;
  currentModalIndex = startIndex;
  
  if (!document.getElementById('image-modal')) {
    createImageModal();
  }
  
  updateModalImage();
  document.getElementById('image-modal').style.display = 'flex';
  document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

function closeImageModal() {
  // Pause any playing video before closing
  const modalVideo = document.getElementById('modal-video');
  if (modalVideo && !modalVideo.paused) {
    modalVideo.pause();
  }
  
  document.getElementById('image-modal').style.display = 'none';
  document.body.style.overflow = ''; // Restore scrolling
}

function navigateModal(direction) {
  // Pause current video if playing before switching
  const modalVideo = document.getElementById('modal-video');
  if (modalVideo && !modalVideo.paused) {
    modalVideo.pause();
  }
  
  currentModalIndex += direction;
  
  if (currentModalIndex < 0) {
    currentModalIndex = currentModalImages.length - 1;
  } else if (currentModalIndex >= currentModalImages.length) {
    currentModalIndex = 0;
  }
  
  updateModalImage();
}

function updateModalImage() {
  const media = currentModalImages[currentModalIndex];
  const modalImage = document.getElementById('modal-image');
  const modalVideo = document.getElementById('modal-video');
  const modalCaption = document.getElementById('modal-caption');
  const modalCounter = document.getElementById('modal-counter');
  const thumbnailContainer = document.getElementById('modal-thumbnails');
  
  // Determine if current media is video or image
  const isVideo = media.type === 'video' || media.src.toLowerCase().includes('.mp4') || 
                  media.src.toLowerCase().includes('.mov') || media.src.toLowerCase().includes('.webm') ||
                  media.src.toLowerCase().includes('.avi') || media.src.toLowerCase().includes('.mkv');
  
  // Hide both elements first
  modalImage.style.display = 'none';
  modalVideo.style.display = 'none';
  
  // Show and update the appropriate element
  if (isVideo) {
    modalVideo.src = media.src;
    modalVideo.style.display = 'block';
    // Pause video when switching (optional)
    modalVideo.currentTime = 0;
  } else {
    modalImage.src = media.src;
    modalImage.style.display = 'block';
  }
  
  modalCaption.textContent = media.caption;
  modalCounter.textContent = `${currentModalIndex + 1} / ${currentModalImages.length}`;
  
  // Update thumbnails
  thumbnailContainer.innerHTML = '';
  currentModalImages.forEach((item, index) => {
    const itemIsVideo = item.type === 'video' || item.src.toLowerCase().includes('.mp4') || 
                        item.src.toLowerCase().includes('.mov') || item.src.toLowerCase().includes('.webm') ||
                        item.src.toLowerCase().includes('.avi') || item.src.toLowerCase().includes('.mkv');
    
    if (itemIsVideo) {
      // Create video thumbnail
      const thumbContainer = document.createElement('div');
      thumbContainer.style.cssText = `
        width: 60px;
        height: 60px;
        position: relative;
        cursor: pointer;
        border: 2px solid ${index === currentModalIndex ? '#fff' : 'transparent'};
        border-radius: 4px;
        opacity: ${index === currentModalIndex ? '1' : '0.7'};
        transition: all 0.3s ease;
        background: #333;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
      `;
      
      // Try to create video thumbnail
      const video = document.createElement('video');
      video.src = item.src;
      video.style.cssText = `
        width: 100%;
        height: 100%;
        object-fit: cover;
      `;
      video.muted = true;
      video.currentTime = 1; // Try to get a frame from 1 second in
      
      // Add play icon overlay
      const playIcon = document.createElement('div');
      playIcon.innerHTML = '▶';
      playIcon.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: white;
        font-size: 16px;
        text-shadow: 0 0 4px rgba(0,0,0,0.8);
        pointer-events: none;
      `;
      
      thumbContainer.appendChild(video);
      thumbContainer.appendChild(playIcon);
      
      thumbContainer.onclick = () => {
        currentModalIndex = index;
        updateModalImage();
      };
      
      thumbnailContainer.appendChild(thumbContainer);
    } else {
      // Create image thumbnail
      const thumb = document.createElement('img');
      thumb.src = item.src;
      thumb.style.cssText = `
        width: 60px;
        height: 60px;
        object-fit: cover;
        cursor: pointer;
        border: 2px solid ${index === currentModalIndex ? '#fff' : 'transparent'};
        border-radius: 4px;
        opacity: ${index === currentModalIndex ? '1' : '0.7'};
        transition: all 0.3s ease;
      `;
      thumb.onclick = () => {
        currentModalIndex = index;
        updateModalImage();
      };
      thumbnailContainer.appendChild(thumb);
    }
  });
  
  // Show/hide navigation buttons
  const prevBtn = document.getElementById('modal-prev');
  const nextBtn = document.getElementById('modal-next');
  
  if (currentModalImages.length <= 1) {
    prevBtn.style.display = 'none';
    nextBtn.style.display = 'none';
  } else {
    prevBtn.style.display = 'block';
    nextBtn.style.display = 'block';
  }
}

// Touch event handlers for mobile swipe
function handleTouchStart(e) {
  startX = e.touches[0].clientX;
}

function handleTouchMove(e) {
  if (!startX) return;
  e.preventDefault(); // Prevent scrolling
}

function handleTouchEnd(e) {
  if (!startX) return;
  
  endX = e.changedTouches[0].clientX;
  const diffX = startX - endX;
  const threshold = 50; // Minimum swipe distance
  
  if (Math.abs(diffX) > threshold) {
    if (diffX > 0) {
      navigateModal(1); // Swipe left = next image
    } else {
      navigateModal(-1); // Swipe right = previous image
    }
  }
  
  startX = 0;
  endX = 0;
}

// Keyboard navigation
function handleModalKeyboard(e) {
  if (document.getElementById('image-modal').style.display === 'flex') {
    switch(e.key) {
      case 'Escape':
        closeImageModal();
        break;
      case 'ArrowLeft':
        navigateModal(-1);
        break;
      case 'ArrowRight':
        navigateModal(1);
        break;
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  let currentID = params.get("id");

  function renderCard(id) {
    const imageContainer = document.getElementById("article-image").parentElement;
    
    const existingNavBtns = imageContainer.querySelectorAll('.article-nav-btn');
    existingNavBtns.forEach(btn => btn.remove());
    
    const existingDots = imageContainer.querySelector('.media-dots-container');
    if (existingDots) {
      existingDots.remove();
    }
    
    const existingVideoContainer = imageContainer.querySelector('.article-video-container');
    if (existingVideoContainer) {
      existingVideoContainer.remove();
    }
    
    const existingIndicator = imageContainer.querySelector('.image-count-indicator');
    if (existingIndicator) {
      existingIndicator.remove();
    }
    const article = articles.find(a => a.id === id);

    if (!article) {
      document.getElementById("content").innerHTML =
        `<h2 style="text-align:center;">🚫 Article not found.</h2>`;
      return;
    }

    const articleTitleEl = document.getElementById("article-title");
      if (articleTitleEl) {
          articleTitleEl.innerHTML = renderMarkdown(article.title);
          document.title = articleTitleEl.textContent.trim();
      }

    // CHANGE TO:
    document.getElementById("article-title").innerHTML = renderMarkdown(article.title);
    document.getElementById("article-lead").innerHTML = renderMarkdown(article.lead);
    document.getElementById("article-author").innerHTML = renderMarkdown(article.author);
    document.getElementById("article-date").innerHTML = renderMarkdown(article.date);
    
    // Handle multiple images/videos
    if (article.images && article.images.length > 0) {
      const firstMedia = article.images[0];
      const isFirstVideo = firstMedia.type === 'video' || firstMedia.src.toLowerCase().includes('.mp4') ||
                          firstMedia.src.toLowerCase().includes('.mov') || firstMedia.src.toLowerCase().includes('.webm') ||
                          firstMedia.src.toLowerCase().includes('.avi') || firstMedia.src.toLowerCase().includes('.mkv');
      
      const articleImageElement = document.getElementById("article-image");
      const articleCaptionElement = document.getElementById("article-caption");
      
      if (isFirstVideo) {
        // If first media is video, create a video thumbnail with play overlay
        const imageContainer = articleImageElement.parentElement;
        
        // Create video element to extract thumbnail
        const video = document.createElement('video');
        video.src = firstMedia.src;
        video.style.cssText = `
          width: 100%;
          height: 100%;
          object-fit: cover;
        `;
        video.muted = true;
        video.currentTime = 1; // Try to get a frame from 1 second in
        
        // Hide original image and show video thumbnail
        articleImageElement.style.display = 'none';
        
        // Create video thumbnail container
        const videoContainer = document.createElement('div');
        videoContainer.style.cssText = `
          position: relative;
          width: 100%;
          height: 550px !important;
          background: #333;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          border-radius: 8px;
          object-fit: cover;
        `;
        
        // Add play icon overlay
        const playIcon = document.createElement('div');
        playIcon.innerHTML = '▶';
        playIcon.style.cssText = `
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: white;
          font-size: 48px;
          text-shadow: 0 0 10px rgba(0,0,0,0.8);
          pointer-events: none;
          z-index: 10;
        `;
        
        // Add video type indicator
        const videoIndicator = document.createElement('div');
        videoIndicator.innerHTML = '🎥 VIDEO';
        videoIndicator.style.cssText = `
          position: absolute;
          top: 15px;
          left: 15px;
          background: rgba(0,0,0,0.8);
          color: white;
          padding: 5px 10px;
          border-radius: 15px;
          font-size: 12px;
          font-weight: bold;
          z-index: 10;
        `;
        
        videoContainer.appendChild(video);
        videoContainer.appendChild(playIcon);
        videoContainer.appendChild(videoIndicator);
        
        // Insert video container after the original image
        imageContainer.insertBefore(videoContainer, articleImageElement.nextSibling);
        
        // Set up click handler for video
        videoContainer.onclick = () => openImageModal(article.images, 0);
        
        articleCaptionElement.textContent = firstMedia.caption;
      } else {
        // If first media is image, use normal behavior
        articleImageElement.src = firstMedia.src;
        articleImageElement.style.display = 'block';
        articleImageElement.style.width = '100%';
        articleImageElement.style.height = '550px';
        articleImageElement.style.objectFit = 'cover';
        articleImageElement.style.borderRadius = '8px';
        articleCaptionElement.textContent = firstMedia.caption;
        
        // Add click handler for modal
        if (article.images.length > 1) {
          articleImageElement.style.cursor = "pointer";
          articleImageElement.onclick = () => openImageModal(article.images, 0);
        }
      }
      
      // Add indicator for multiple media items
      if (article.images.length > 1) {
        const imageContainer = articleImageElement.parentElement;
        if (!imageContainer.querySelector('.image-count-indicator')) {
          const indicator = document.createElement('div');
          indicator.className = 'image-count-indicator';
          indicator.textContent = `1/${article.images.length}`;
          indicator.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            background: rgba(0,0,0,0.8);
            color: #ffffff;
            padding: 5px 10px;
            border-radius: 15px;
            font-size: 12px;
            font-weight: 600;
            letter-spacing: 0.5px;
            pointer-events: none;
            z-index: 10;
            backdrop-filter: blur(10px);
          `;
          imageContainer.style.position = 'relative';
          imageContainer.appendChild(indicator);
        }
      }
    }
    
    // Add swipe functionality for main article media
    if (article.images && article.images.length > 1) {
      setupArticleSwipe(article);
    }
    
    // Use markdown rendering if bodyMarkdown exists, otherwise use bodyHTML
    const articleBodyContent = article.bodyMarkdown 
      ? renderMarkdown(article.bodyMarkdown) 
      : article.bodyHTML;
    document.getElementById("article-body").innerHTML = articleBodyContent;

    if (article.pdf) {
      const dlBtn = document.getElementById("article-download");
      dlBtn.href = article.pdf;
      dlBtn.textContent = article.pdfButtonText || "Download PDF ⇲";
      dlBtn.style.display = "inline-block";
    } else {
      document.getElementById("article-download").style.display = "none";
    }
  }

  // Initial render
  renderCard(currentID);

  // Prev button
  document.getElementById('prev-card').onclick = () => {
    const idx = articles.findIndex(c => c.id === currentID);
    if (idx > 0) {
      currentID = articles[idx - 1].id;
      window.history.replaceState({}, '', `?id=${currentID}`);
      renderCard(currentID);
    }
  };

  // Next button
  document.getElementById('next-card').onclick = () => {
    const idx = articles.findIndex(c => c.id === currentID);
    if (idx < articles.length - 1) {
      currentID = articles[idx + 1].id;
      window.history.replaceState({}, '', `?id=${currentID}`);
      renderCard(currentID);
    }
  };
});

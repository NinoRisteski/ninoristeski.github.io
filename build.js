// build.js - Simple static site generator
const fs = require('fs');
const path = require('path');
const marked = require('marked');

// Create a directory if it doesn't exist
function ensureDirectoryExists(directory) {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
}

// Load JSON content
function loadJson(filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error loading JSON from ${filePath}:`, error);
    return null;
  }
}

// Load and parse markdown file
function loadMarkdown(filePath) {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    // Extract front matter (metadata between --- markers)
    const frontMatterRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/;
    const frontMatterMatch = fileContent.match(frontMatterRegex);
    
    let metadata = {};
    let content = fileContent;
    
    if (frontMatterMatch) {
      const frontMatter = frontMatterMatch[1];
      // Simple parsing of front matter
      frontMatter.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split(':');
        if (key && valueParts.length) {
          let value = valueParts.join(':').trim();
          
          // Remove quotes if they exist
          if (value.startsWith('"') && value.endsWith('"')) {
            value = value.slice(1, -1);
          }
          
          metadata[key.trim()] = value;
        }
      });
      
      // Remove front matter from content
      content = fileContent.replace(frontMatterRegex, '');
    }
    
    // Convert markdown to HTML
    const htmlContent = marked.parse(content);
    
    return {
      metadata,
      htmlContent
    };
  } catch (error) {
    console.error(`Error processing markdown file ${filePath}:`, error);
    return null;
  }
}

// Generate HTML for thoughts section
function generateThoughtsHTML() {
  const thoughts = loadJson(path.join(__dirname, 'content/thoughts/thoughts.json'));
  if (!thoughts) return '';
  
  let html = '<div class="thoughts-container">';
  
  thoughts.forEach(thought => {
    html += `
      <div class="thought">
        <a href="https://x.com/ninoristeski" class="twitter-handle">@ninoristeski</a>
        <p>${thought.text}</p>
        <span class="thought-date">${thought.date}</span>
      </div>
    `;
  });
  
  html += '</div>';
  return html;
}

// Generate HTML for recommendations section
function generateRecommendationsHTML() {
  const recommendations = loadJson(path.join(__dirname, 'content/recommendations/recommendations.json'));
  if (!recommendations) return '';
  
  let html = '<ul class="recommendations-list">';
  
  recommendations.forEach(rec => {
    html += `
      <li>
        <a href="${rec.url}">${rec.title}</a> - ${rec.authors}
      </li>
    `;
  });
  
  html += '</ul>';
  return html;
}

// Generate HTML for projects section
function generateProjectsHTML() {
  const projects = loadJson(path.join(__dirname, 'content/projects/projects.json'));
  if (!projects) return '';
  
  let html = '<div class="projects-grid">';
  
  projects.forEach(project => {
    html += `
      <div class="project">
        <h3>${project.title}</h3>
        <p>${project.description}</p>
        <a href="${project.url}" class="project-link">View project</a>
      </div>
    `;
  });
  
  html += '</div>';
  return html;
}

// Generate blog list HTML
function generateBlogListHTML() {
  const blogDir = path.join(__dirname, 'content/blogs');
  const mdFiles = fs.readdirSync(blogDir).filter(file => file.endsWith('.md'));
  
  // Parse all blog posts and sort by date (newest first)
  const posts = mdFiles
    .map(file => {
      const filePath = path.join(blogDir, file);
      const post = loadMarkdown(filePath);
      if (post) {
        return {
          ...post,
          slug: file.replace('.md', ''),
          date: post.metadata.date
        };
      }
      return null;
    })
    .filter(post => post !== null)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  
  let html = '<div class="blog-posts">';
  
  posts.forEach(post => {
    html += `
      <div class="blog-post">
        <h3><a href="blogs/${post.slug}.html">${post.metadata.title}</a></h3>
        <span class="post-date">${new Date(post.metadata.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
        <p>${post.metadata.excerpt}</p>
      </div>
    `;
  });
  
  html += '</div>';
  return html;
}

// Generate individual blog post pages
function generateBlogPages() {
  const blogDir = path.join(__dirname, 'content/blogs');
  const outputDir = path.join(__dirname, 'blogs');
  
  ensureDirectoryExists(outputDir);
  
  const mdFiles = fs.readdirSync(blogDir).filter(file => file.endsWith('.md'));
  
  mdFiles.forEach(file => {
    const filePath = path.join(blogDir, file);
    const post = loadMarkdown(filePath);
    
    if (post) {
      const slug = file.replace('.md', '');
      const outputPath = path.join(outputDir, `${slug}.html`);
      
      const html = `<!DOCTYPE HTML>
<html lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <title>${post.metadata.title} | Nino Risteski</title>
  <meta name="author" content="Nino Risteski">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" type="text/css" href="../stylesheet.css">
  <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🌐</text></svg>">
</head>
<body>
  <div class="container blog-post-container">
    <header>
      <a href="../index.html" class="back-link">← Home</a>
    </header>
    
    <article class="blog-post-content">
      <h1>${post.metadata.title}</h1>
      <div class="post-meta">
        <span class="post-date">${post.metadata.date}</span>
      </div>
      
      ${post.htmlContent}
    </article>
    
    <footer>
      <p>© 2024 Nino Risteski</p>
    </footer>
  </div>
</body>
</html>`;
      
      fs.writeFileSync(outputPath, html);
      console.log(`Generated: ${outputPath}`);
    }
  });
}

// Generate main index.html
function generateIndexHTML() {
  const html = `<!DOCTYPE HTML>
<html lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <title>Nino Risteski</title>
  <meta name="author" content="Nino Risteski">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" type="text/css" href="stylesheet.css">
  <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🌐</text></svg>">
</head>

<body>
  <div class="container">
    <header>
      <h1>Nino Risteski</h1>
      <p class="intro">
        I am a Machine Learning Engineer with a background in operations management. I'm fascinated by AI systems and their potential to transform how we work and live.
      </p>
      
      <div class="social-links">
        <a href="mailto:ninoristeski@gmail.com">Email</a>
        <a href="https://x.com/ninoristeski">X</a>
        <a href="https://github.com/NinoRisteski/">GitHub</a>
        <a href="https://ninoristeski.substack.com/">Blog</a>
        <a href="https://aipaperexpress.substack.com/">Newsletter</a>
      </div>
    </header>

    <section id="blog">
      <h2>Blog</h2>
      ${generateBlogListHTML()}
    </section>

    <section id="thoughts">
      <h2>Random thoughts</h2>
      ${generateThoughtsHTML()}
    </section>

    <section id="projects">
      <h2>Projects</h2>
      ${generateProjectsHTML()}
    </section>

    <section id="recommendations">
      <h2>Stuff worth checking out</h2>
      ${generateRecommendationsHTML()}
    </section>

    <section id="profile">
      <div class="profile-image">
        <img src="images/ninoprofile.jpg" alt="Nino Risteski">
      </div>
    </section>

    <footer>
      <p>© 2024 Nino Risteski</p>
    </footer>
  </div>
</body>
</html>`;

  fs.writeFileSync(path.join(__dirname, 'index.html'), html);
  console.log('Generated: index.html');
}

// Update CSS for blog post styles
function updateCSS() {
  const cssPath = path.join(__dirname, 'stylesheet.css');
  let cssContent = fs.readFileSync(cssPath, 'utf8');
  
  // Add styles for blog posts if they don't exist
  if (!cssContent.includes('.blog-post-container')) {
    const blogCSS = `
/* Blog post styles */
.blog-post-container {
  max-width: 700px;
}

.back-link {
  display: inline-block;
  margin-bottom: 2rem;
  font-weight: 500;
}

.blog-post-content h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.post-meta {
  margin-bottom: 2rem;
}

.post-date {
  color: #777;
  font-size: 0.9rem;
}

.blog-post-content {
  line-height: 1.8;
}

.blog-post-content h2 {
  font-size: 1.8rem;
  margin: 2.5rem 0 1rem 0;
  border-bottom: none;
}

.blog-post-content h3 {
  font-size: 1.4rem;
  margin: 2rem 0 1rem 0;
}

.blog-post-content p {
  margin-bottom: 1.5rem;
}

.blog-post-content ul, 
.blog-post-content ol {
  margin-bottom: 1.5rem;
  padding-left: 1.5rem;
}

.blog-post-content li {
  margin-bottom: 0.5rem;
}

.blog-post-content pre {
  background-color: #f7f7f7;
  padding: 1rem;
  border-radius: 5px;
  overflow-x: auto;
  margin-bottom: 1.5rem;
}

.blog-post-content code {
  font-family: monospace;
  background-color: #f7f7f7;
  padding: 0.2rem 0.4rem;
  border-radius: 3px;
}

.blog-post-content pre code {
  padding: 0;
  background-color: transparent;
}

.thought-date {
  display: block;
  color: #777;
  font-size: 0.9rem;
  margin-top: 0.5rem;
}`;
    
    cssContent += blogCSS;
    fs.writeFileSync(cssPath, cssContent);
    console.log('Updated: stylesheet.css with blog post styles');
  }
}

// Main build function
function build() {
  console.log('Building site...');
  
  // Generate blog pages
  generateBlogPages();
  
  // Generate main index
  generateIndexHTML();
  
  // Update CSS
  updateCSS();
  
  console.log('Build completed!');
}

// Run the build
build(); 
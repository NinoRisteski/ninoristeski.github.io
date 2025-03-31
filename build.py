#!/usr/bin/env python3
"""
Simple script to generate HTML files from markdown blog posts
"""

import os
import re
import shutil
import markdown

def extract_frontmatter(content):
    """Extract front matter metadata from markdown content"""
    pattern = r'^---\s+(.*?)\s+---\s+'
    match = re.search(pattern, content, re.DOTALL)
    if not match:
        return {}, content
    
    frontmatter_text = match.group(1)
    metadata = {}
    
    # Parse the front matter
    for line in frontmatter_text.strip().split('\n'):
        if ':' in line:
            key, value = line.split(':', 1)
            metadata[key.strip()] = value.strip().strip('"\'')
    
    # Remove the front matter from the content
    content_without_frontmatter = re.sub(pattern, '', content, 1, re.DOTALL)
    return metadata, content_without_frontmatter

def build_blog_post(source_path, output_path):
    """Build a single blog post HTML file from markdown"""
    with open(source_path, 'r') as f:
        content = f.read()
    
    # Extract front matter
    metadata, md_content = extract_frontmatter(content)
    title = metadata.get('title', 'Blog Post')
    date = metadata.get('date', '')
    
    # Convert markdown to HTML
    html_content = markdown.markdown(md_content, extensions=['fenced_code', 'codehilite'])
    
    # Create HTML template
    html_template = f"""<!DOCTYPE HTML>
<html lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <title>{title} | Nino Risteski</title>
  <meta name="author" content="Nino Risteski">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" type="text/css" href="../stylesheet.css?v=10">
  <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🌐</text></svg>">
</head>
<body>
  <div class="container blog-post-container">
    <header>
      <a href="../index.html" class="back-link">← Home</a>
    </header>
    
    <article class="blog-post-content">
      <h1>{title}</h1>
      <div class="post-meta">
        <span class="post-date">{date}</span>
      </div>
      
      {html_content}
    </article>
    
    <footer>
      <p>© 2024 Nino Risteski</p>
    </footer>
  </div>
</body>
</html>"""
    
    # Ensure the output directory exists
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    # Write to output file
    with open(output_path, 'w') as f:
        f.write(html_template)
    
    print(f"Generated: {output_path}")

def build_all_blog_posts():
    """Build all blog posts from markdown files in content/blogs/"""
    blogs_dir = 'content/blogs'
    output_dir = 'blogs'
    
    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)
    
    # Process each markdown file
    for filename in os.listdir(blogs_dir):
        if filename.endswith('.md'):
            source_path = os.path.join(blogs_dir, filename)
            output_path = os.path.join(output_dir, filename.replace('.md', '.html'))
            build_blog_post(source_path, output_path)
    
    print("All blog posts generated successfully.")

if __name__ == '__main__':
    build_all_blog_posts() 
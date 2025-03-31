#!/usr/bin/env python3
"""
Simple script to generate HTML files from markdown blog posts
"""

import os
import re
import markdown

def extract_frontmatter(content):
    """Extract the front matter metadata from markdown content."""
    pattern = r"^---\n(.*?)\n---\n"
    match = re.search(pattern, content, re.DOTALL)
    if match:
        frontmatter = match.group(1)
        content_without_frontmatter = content[match.end():]
        
        # Parse frontmatter into dict
        metadata = {}
        for line in frontmatter.strip().split('\n'):
            if ':' in line:
                key, value = line.split(':', 1)
                metadata[key.strip()] = value.strip()
        
        return metadata, content_without_frontmatter
    
    return {}, content

def build_blog_post(source_path, output_path):
    """Build a single blog post HTML file from markdown."""
    # Read markdown content
    with open(source_path, 'r') as f:
        content = f.read()
    
    # Extract frontmatter and convert markdown to HTML
    metadata, markdown_content = extract_frontmatter(content)
    html_content = markdown.markdown(markdown_content)
    
    # Create HTML with template
    title = metadata.get('title', 'Blog Post')
    date = metadata.get('date', '')
    
    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="author" content="Nino Risteski">
    <link rel="stylesheet" type="text/css" href="../stylesheet.css?v=24">
    <link rel="icon" type="image/x-icon" href="../favicon/favicon.ico">
    <link rel="apple-touch-icon" sizes="180x180" href="../favicon/apple-touch-icon.png">
    <link rel="icon" type="image/png" sizes="32x32" href="../favicon/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="../favicon/favicon-16x16.png">
    <title>{title}</title>
</head>
<body>
    <div class="container blog-post-container">
        <header>
            <a href="../index.html" class="back-link">← Back to Home</a>
            <h1>{title}</h1>
            <div class="post-meta">
                <span class="post-date">{date}</span>
            </div>
        </header>
        
        <main class="blog-post-content">
            {html_content}
        </main>
        
        <footer>
            <p>© {os.environ.get('YEAR', '2024')} Nino Risteski</p>
        </footer>
    </div>
</body>
</html>
"""
    
    # Write HTML to output file
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, 'w') as f:
        f.write(html)
    
    print(f"Generated: {output_path}")

def build_all_blog_posts():
    """Build all blog posts from markdown files in blogs directory."""
    blogs_dir = 'blogs'
    
    # Ensure output directory exists
    os.makedirs(blogs_dir, exist_ok=True)
    
    for filename in os.listdir(blogs_dir):
        if filename.endswith('.md'):
            source_path = os.path.join(blogs_dir, filename)
            output_path = os.path.join(blogs_dir, filename.replace('.md', '.html'))
            build_blog_post(source_path, output_path)
    
    print("All blog posts generated successfully.")

if __name__ == "__main__":
    build_all_blog_posts() 
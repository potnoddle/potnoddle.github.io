# Article Archive Management Guide

This project is a Jekyll-based archive of articles from LinkedIn and Substack.

## Updating the Archive

### 1. Adding a New Article

To add a new article, create a new Markdown file in the `_posts/` directory following the naming convention: `YYYY-MM-DD-title-slug.md`.

#### Front Matter Template:

```yaml
---
layout: post
title: "Your Article Title"
date: YYYY-MM-DD HH:MM
banner: "/banners/your-banner-name.jpg"
status: published
---
```

### 2. Archiving Images Locally

To prevent broken links (the "missing images" issue), images should be downloaded and stored locally.

- **Banners**: Store in the `/banners/` directory.
- **Inline Images**: Store in the `_posts/images/` directory.

#### How to update image links:

Replace the external URL in the `src` attribute with the local path:

- Banner: `banner: "/banners/my-banner.jpg"`
- Inline: `<img src="/images/my-image.png">` (Note: use absolute paths starting from the root of the site).

### 3. Missing Images Check

Run a search for external image URLs to identify candidates for local archiving:
`grep -r "src=\"http" _posts/`

## Local Development

To preview the site locally:
`bundle exec jekyll serve`
The site will be available at `http://localhost:4000/`.

## Publishing

Push changes to the `main` branch to trigger the GitHub Pages deployment.
The live site is at: `https://potnoddle.github.io/`

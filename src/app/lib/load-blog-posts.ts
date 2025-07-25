import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { Blog } from '../types/blogs';

// Set the posts directory to the folder in the root of the process' current working directory
const postsDirectory = path.join(process.cwd(), 'posts')

export function loadBlogPosts(): Blog[] {
    // Get file names under /posts
    const fileNames = fs.readdirSync(postsDirectory);
    const allPostsData = fileNames.map((fileName) => {
        // Remove ".md" from file name to get id
        const id = fileName.replace(/\.md$/, '');

        // Read markdown file as string
        const fullPath = path.join(postsDirectory, fileName);
        const fileContents = fs.readFileSync(fullPath, 'utf8');

        // Use gray-matter to parse the metadata section of the markdown
        const matterResult = matter(fileContents);

        // Combine the data with the id
        return {
            id,
            content: matterResult.content,
            ...matterResult.data,
        } as Blog;
    });

    return allPostsData.sort((a, b) => {
        if (a.date < b.date) {
            return 1;
        } else {
            return -1;
        }
    });
}


export function getArticleBySlug (slug: string): Blog | null {
    const filePath = path.join(postsDirectory, `${slug}.md`);
    if (!fs.existsSync(filePath)) return null;

    const fileContents = fs.readFileSync(filePath, 'utf8');

        // Use gray-matter to parse the metadata section of the markdown
        const matterResult = matter(fileContents);

        // Combine the data with the id
        return {
            content: matterResult.content,
            ...matterResult.data,
        } as Blog;
  };
  
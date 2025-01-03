export interface Blog {
    id: string,
    slug: string,
    title: string,
    date: string,
    category: string,
    description: string,
    content: string,
}

export interface BlogCardProps {
    blog: Blog,
    onBlogPostSelected: (blog: Blog) => void,
}

export interface BlogPostListProps {
    blogsList: Blog[],
}
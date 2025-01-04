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
}

export interface BlogPostListProps {
    blogsList: Blog[],
}
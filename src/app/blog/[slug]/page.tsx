import { getArticleBySlug, loadBlogPosts } from "@/app/lib/load-blog-posts"
import { Blog } from "@/app/types/blogs";

export async function generateStaticParams() {
    const blogPosts = loadBlogPosts();

    return blogPosts.map((post) => ({
        slug: post.slug,
        post: post,
    }))
}

export default async function Page({
    params,
}: {
    params: Promise<{ slug: string, post: Blog }>
}) {
    const slug = (await params).slug

    const blogPost = getArticleBySlug(slug)

    return <div>{blogPost?.content}</div>
}
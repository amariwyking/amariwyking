import { getArticleBySlug, loadBlogPosts } from "@/app/lib/load-blog-posts"
import { Blog } from "@/app/types/blogs";
import Markdown from "markdown-to-jsx";

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
    const slug = (await params).slug;

    const blogPost = getArticleBySlug(slug);

    var content = undefined;

    if (blogPost) {
        content = blogPost.content;
    } else {
        content = "404 | Blog post not found"
    }

    return (
        <div className="px-12 lg:px-36">
            <div>
            </div>
            <div className="flex flex-col h-full justify-center items-center">
                <div className="w-fit">
                    <Markdown className="prose">
                        {`<h1>${blogPost?.title}</h1>` + content}
                    </Markdown>
                </div>
            </div>
        </div>
    )
}
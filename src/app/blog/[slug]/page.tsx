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
        <div className="px-12 lg:px-36 py-8 md:py-12 lg:py-24">
            <div>
            </div>
            <div className="flex flex-col h-full justify-center items-center">
                <div className="w-fit">
                    <Markdown className="
                                        font-manuale
                                        prose
                                        prose-zinc
                                        sm:prose-sm
                                        base:prose-base
                                        lg:prose-lg
                                        xl:prose-xl
                                        2xl:prose-2xl
                                        prose-h1:font-kode-mono
                                        prose-headings:font-work-sans
                                        "
                    >
                        {`<h1 className="text-2xl">${blogPost?.title}</h1>` + 
                        `<div className="w-full h-0.5 bg-zinc-900"><div>`+
                        content}
                    </Markdown>
                </div>
            </div>
        </div>
    )
}
import BlogPostCard from "./BlogPostCard";
import { BlogPostListProps } from "@/app/types/blogs";

export default function BlogPostList(props: BlogPostListProps) {
    return (
        <div className="my-6 justify-center flex-row space-y-6 lg:ml-6">
            {
                props.blogsList.map((blogPostData) => (
                    <BlogPostCard
                        key={blogPostData.id}
                        blog={blogPostData}
                    />
                ))
            }
        </div>
    );
}
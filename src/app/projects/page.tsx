import { createClient } from "@/utils/supabase/server";

export default async function Projects() {
    const supabase = await createClient();
    const { data: projects } = await supabase.from("project").select();

    return <pre>{JSON.stringify(projects, null, 2)}</pre>
}
import { createServerClient } from "@supabase/ssr";

export async function createAdminClient() {
    if (!process.env.SUPABASE_SECRET_KEY) {
        throw new Error('SUPABASE_SECRET_KEY is required for admin operations');
    }

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SECRET_KEY!, // Uses secret key, not service_role key
        {
            cookies: {
                getAll() { return []; },
                setAll() { /* No-op for service role */ },
            },
        }
    );
}
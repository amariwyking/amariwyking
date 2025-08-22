'use server'

import { default as createClientForServer } from "@/utils/supabase/server"

const createProject = async (prev, formData) => {
    const supabase = await createClientForServer
}
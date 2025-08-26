import { Tables } from './supabase';

export type { Tables, TablesInsert, TablesUpdate } from './supabase'

export type Project = Tables<'project'>;
export type Skill = Tables<'skill'>;
export type ProjectImage = Tables<'project_image'>;
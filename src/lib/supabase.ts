import { createClient } from "@supabase/supabase-js";
import { projectId, publicAnonKey } from "../../utils/supabase/info";

const supabaseUrl = `https://${projectId}.supabase.co`;
export const supabase = createClient(supabaseUrl, publicAnonKey);
export const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-97d3df46`;
export { publicAnonKey };

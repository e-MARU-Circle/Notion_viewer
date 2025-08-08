import { createClient } from '@supabase/supabase-js';

// 環境変数からSupabaseのURLと、管理者用の「Service Role Key」を取得
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// URLやキーが設定されていない場合はエラーを投げる
if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Supabase URL or Service Role Key is not defined in .env.local');
}

// Supabaseの管理者クライアントを作成してエクスポート
// 注意：このクライアントはサーバーサイドでのみ使用してください
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);
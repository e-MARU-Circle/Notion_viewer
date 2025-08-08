'use server';

import { supabaseAdmin } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { Client } from '@notionhq/client'; // ★★★ Notion公式クライアントを使用 ★★★

// createConfig と deleteConfig は変更ありません
export async function createConfig(formData: FormData) {
  const newConfig = {
    name: formData.get('name') as string,
    api_key: formData.get('apiKey') as string,
    db_id: formData.get('dbId') as string,
    title_property: formData.get('titleProperty') as string,
    relation_property: formData.get('relationProperty') as string,
  };
  const { error } = await supabaseAdmin.from('graph_configs').insert([newConfig]);
  if (error) { console.error('設定の保存に失敗しました:', error); return; }
  revalidatePath('/admin');
}

export async function deleteConfig(formData: FormData) {
  const id = formData.get('id');
  const { error } = await supabaseAdmin.from('graph_configs').delete().match({ id });
  if (error) { console.error('設定の削除に失敗しました:', error); return; }
  revalidatePath('/admin');
}

// ★★★ Notionページ内容取得アクション（公式ライブラリ版） ★★★
export async function fetchNotionPageContent(pageId: string, configId: number) {
  if (!pageId || !configId) return null;

  try {
    // 1. まずSupabaseからこのグラフ設定に紐づくAPIキーを取得
    const { data: config, error: configError } = await supabaseAdmin
      .from('graph_configs')
      .select('api_key')
      .eq('id', configId)
      .single();

    if (configError || !config) {
      throw new Error(`Config with ID ${configId} not found.`);
    }

    // 2. 取得したAPIキーでNotion公式クライアントを初期化
    const notion = new Client({ auth: config.api_key });

    // 3. ページのブロック（中身）を取得
    const response = await notion.blocks.children.list({
      block_id: pageId,
    });
    
    return response.results;
  } catch (error) {
    console.error("Notion page content fetch failed:", error);
    return null;
  }
}

"use server";

import { supabaseAdmin } from "@/lib/supabaseClient";

export async function getPageContent(pageId: string, graphId: string) {
  if (!pageId || !graphId) {
    return { error: "Invalid ID provided." };
  }

  // 1. Supabaseから設定を取得
  const { data: config, error: configError } = await supabaseAdmin
    .from("graph_configs")
    .select("notion_api_key")
    .eq("id", graphId)
    .single();

  if (configError || !config) {
    console.error("Config not found:", configError);
    return { error: "グラフの設定が見つかりません。" };
  }

  // 2. Notion APIを叩いてブロック（内容）を取得
  const notionApiKey = config.notion_api_key;
  try {
    const response = await fetch(`https://api.notion.com/v1/blocks/${pageId}/children`, {
      headers: {
        'Authorization': `Bearer ${notionApiKey}`,
        'Notion-Version': '2022-06-28',
      },
    });

    if (!response.ok) {
      const errorBody = await response.json();
      console.error("Notion API error:", errorBody);
      return { error: "Notionからのコンテンツ取得に失敗しました。" };
    }

    const data = await response.json();
    return { blocks: data.results };
  } catch (e) {
    console.error("Fetch failed:", e);
    return { error: "コンテンツの取得中に不明なエラーが発生しました。" };
  }
}
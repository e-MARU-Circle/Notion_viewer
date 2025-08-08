// app/api/graph-data/[id]/route.ts

import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabaseClient';
import { getNotionData } from '../../../../lib/notion';
import { Client } from '@notionhq/client';

// CORS設定用のオリジン
const allowedOrigin = 'http://localhost:5173';

const corsHeaders = {
  'Access-Control-Allow-Origin': allowedOrigin,
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// OPTIONSメソッドのハンドラ（プリフライトリクエスト用）
export async function OPTIONS(req: Request) {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}

// GETメソッドのハンドラ
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params; // URLから動的なIDを取得

    // 1. SupabaseからNotion APIキーなどの設定情報を取得
    const { data: config, error: configError } = await supabase
      .from('graph_configs') // ここは実際のテーブル名に合わせてください
      .select('api_key, db_id, title_property, relation_property')
      .eq('id', id) // ユーザーIDでフィルタリング
      .single();

    if (configError || !config) {
      console.error('Failed to fetch user config from Supabase:', configError);
      return new NextResponse(JSON.stringify({ error: 'User configuration not found' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });
    }

    // 2. 取得したキーを使い、Notion APIからidに対応するデータを取得
    // Notion APIキーとデータベースIDを環境変数として設定するか、Supabaseから取得する
    process.env.NOTION_API_KEY = config.api_key;
    const notion = new Client({ auth: config.api_key });

    // データベースの情報を取得してタイトルを得る
    const dbResponse = await notion.databases.retrieve({ database_id: config.db_id });
    const dbTitle = dbResponse.title[0]?.plain_text || 'Untitled Database';

    const graphData = await getNotionData(config.db_id, config.title_property, config.relation_property);

    // 整形したデータをJSON形式でフロントエンドに返す
    return new NextResponse(JSON.stringify({ ...graphData, databaseTitle: dbTitle }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error) {
    console.error(error);
    return new NextResponse(JSON.stringify({ error: 'Failed to fetch graph data' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  }
}

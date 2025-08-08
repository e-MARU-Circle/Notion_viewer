// app/api/page-content/[pageId]/route.ts

import { NextResponse } from 'next/server';
import { Client } from '@notionhq/client';
import { supabase } from '../../../../lib/supabaseClient';

const allowedOrigin = 'http://localhost:5173';

const corsHeaders = {
  'Access-Control-Allow-Origin': allowedOrigin,
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS(req: Request) {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

export async function GET(
  req: Request,
  { params }: { params: { pageId: string } }
) {
  try {
    const { pageId } = params;
    const { searchParams } = new URL(req.url);
    const graphId = searchParams.get('graphId');

    if (!graphId) {
      return new NextResponse(JSON.stringify({ error: 'Graph ID is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // SupabaseからAPIキーを取得
    const { data: config, error: configError } = await supabase
      .from('graph_configs')
      .select('api_key')
      .eq('id', graphId)
      .single();

    if (configError || !config) {
      return new NextResponse(JSON.stringify({ error: 'Configuration not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const notion = new Client({ auth: config.api_key });

    // Notionからページのブロックコンテンツを取得
    const { results } = await notion.blocks.children.list({ block_id: pageId });

    return new NextResponse(JSON.stringify({ blocks: results }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error(error);
    return new NextResponse(JSON.stringify({ error: 'Failed to fetch page content' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

import dynamic from 'next/dynamic';
import { supabase } from '@/lib/supabaseClient';
import { notFound } from 'next/navigation';
import { Client } from '@notionhq/client';
import Header from '@/components/Header';

const KnowledgeGraph = dynamic(() => import('@/components/KnowledgeGraph'), {
  ssr: false,
  loading: () => <div className="w-full h-full flex items-center justify-center"><p>グラフを読み込んでいます...</p></div>,
});

export default async function GraphPage({ params }: { params: { graphId: string } }) {
  const { graphId } = params;

  const { data: config, error: configError } = await supabase
    .from("graph_configs")
    .select("*")
    .eq("id", graphId)
    .single();

  if (configError || !config) {
    console.error('グラフ設定の取得に失敗しました:', configError);
    notFound();
  }

  const notion = new Client({ auth: config.api_key });

  let notionData = null;
  try {
    const response = await notion.databases.query({ database_id: config.db_id });
    notionData = response.results;
  } catch (error) {
    console.error('Notion APIからのデータ取得に失敗しました:', error);
    return (
      <div className="p-8 text-red-500">
        <h1 className="text-2xl font-bold">Notion API エラー</h1>
        <p>APIキーまたはデータベースIDが正しいか確認してください。</p>
        <pre className="mt-4 text-xs bg-gray-100 p-4 rounded">{error instanceof Error ? error.message : 'Unknown error'}</pre>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen flex flex-col">
      <Header pageTitle={config.name} />
      <main className="flex-grow">
        <KnowledgeGraph
          configId={config.id}
          notionData={notionData}
          titleProperty={config.title_property}
          relationProperty={config.relation_property}
        />
      </main>
    </div>
  );
}
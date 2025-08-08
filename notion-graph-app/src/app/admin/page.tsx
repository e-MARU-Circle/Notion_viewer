import Header from '@/components/Header';
import AdminForm from './AdminForm';
import ConfigList from './ConfigList';
import Container from '@/components/Container'; // ★ 新しいコンポーネントをインポート
import { supabaseAdmin } from '@/lib/supabase/admin';
import type { GraphConfig } from '@/types';

export default async function AdminPage() {
  const { data: configs } = await supabaseAdmin
    .from("graph_configs")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow py-12">
        {/* ★ Containerコンポーネントでコンテンツ全体を囲む */}
        <Container>
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-slate-800 mb-2">Settings</h1>
            <p className="text-base text-slate-500">ナレッジグラフの設定とAPIキーを管理します。</p>
          </div>

          <div className="space-y-12">
            <section>
              <h2 className="text-2xl font-semibold text-slate-800 mb-5 border-b pb-3">新規設定</h2>
              <div className="bg-white rounded-lg shadow-md border p-8">
                <AdminForm />
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-800 mb-5 border-b pb-3">Saved Configurations</h2>
              <div className="bg-white rounded-lg shadow-md border p-8">
                <ConfigList configs={(configs as GraphConfig[]) || []} />
              </div>
            </section>
          </div>
        </Container>
      </main>
    </div>
  );
}
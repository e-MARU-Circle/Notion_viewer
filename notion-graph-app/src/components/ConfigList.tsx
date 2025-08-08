import type { GraphConfig } from '@/types';
import Link from 'next/link';
import { deleteConfig } from '@/app/actions';
import { Database, Link2, Network, MoreVertical, Trash2, GitFork } from 'lucide-react'; // アイコンをインポート

export default function ConfigList({ configs }: { configs: GraphConfig[] }) {
  if (!configs || configs.length === 0) {
    return <p className="text-slate-500 py-8 text-center">保存済みの設定はありません。</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {configs.map((config) => (
        <div key={config.id} className="bg-white rounded-xl shadow-md border flex flex-col justify-between transition-shadow duration-300 hover:shadow-lg">
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold text-slate-800">{config.name}</h3>
              <button className="text-slate-400 hover:text-slate-600">
                <MoreVertical size={20} />
              </button>
            </div>
            <div className="space-y-3 text-sm">
              <p className="text-slate-600 flex items-center gap-2">
                <Database size={16} className="text-slate-400" />
                <span className="truncate" title={config.db_id}>...{config.db_id.slice(-12)}</span>
              </p>
              <p className="text-slate-600 flex items-center gap-2">
                <Link2 size={16} className="text-slate-400" />
                <span>{config.title_property}</span>
              </p>
              <p className="text-slate-600 flex items-center gap-2">
                <Network size={16} className="text-slate-400" />
                <span>{config.relation_property}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-x-2 mt-4 bg-slate-50 p-4 border-t">
            <Link href={`/graph/${config.id}`} className="bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold py-2 px-3 rounded-lg flex-1 flex items-center justify-center gap-2 text-sm transition-colors">
              <GitFork size={16} />表示
            </Link>
            <form action={deleteConfig}>
              <input type="hidden" name="id" value={config.id} />
              <button className="bg-red-100 hover:bg-red-200 text-red-700 font-bold p-2 rounded-lg flex items-center justify-center transition-colors">
                <Trash2 size={16} />
              </button>
            </form>
          </div>
        </div>
      ))}
    </div>
  );
}
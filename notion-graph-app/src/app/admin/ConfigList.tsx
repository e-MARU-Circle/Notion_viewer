"use client";

import Link from "next/link";
import { useState } from "react";
import { deleteGraphConfig } from "./actions";
import { type GraphConfig } from "./page";

export default function ConfigList({ configs }: { configs: GraphConfig[] }) {
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const viteAppUrl = process.env.NEXT_PUBLIC_VITE_APP_URL || 'http://localhost:5173';

  const handleDelete = async (id: number) => {
    if (window.confirm("この設定を本当に削除しますか？")) {
      setIsDeleting(id);
      try {
        const result = await deleteGraphConfig(id);
        if (!result.success) {
          alert(result.message);
        }
      } catch (error) {
        alert("削除に失敗しました。" + error);
      } finally {
        setIsDeleting(null);
      }
    }
  };

  return (
    <div className="mt-6 space-y-4">
      {configs.length > 0 ? (
        configs.map((config) => (
          <div key={config.id} className="p-4 border rounded-md bg-gray-50 flex justify-between items-center space-x-4">
            <div className="flex-grow min-w-0">
              <h3 className="font-bold text-lg text-slate-800 truncate">{config.name}</h3>
              <p className="text-sm text-gray-500 mt-1 truncate">DB ID: {config.notion_database_id}</p>
            </div>
            <div className="flex-shrink-0 flex items-center space-x-3">
              <a 
                href={`${viteAppUrl}/graph/${config.id}`}
                target="_blank" 
                rel="noopener noreferrer"
                className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                グラフを表示
              </a>
              <button
                onClick={() => handleDelete(config.id)}
                disabled={isDeleting === config.id}
                className="px-4 py-2 text-sm font-semibold text-red-600 bg-red-100 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                {isDeleting === config.id ? "削除中..." : "削除"}
              </button>
            </div>
          </div>
        ))
      ) : (
        <p className="text-gray-500">まだ設定は保存されていません。</p>
      )}
    </div>
  );
}
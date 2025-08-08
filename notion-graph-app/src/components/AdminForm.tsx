'use client';

import { useFormStatus } from 'react-dom';
import { createConfig } from '@/app/actions';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-primary hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg focus:outline-none transition-colors disabled:bg-slate-400"
    >
      {pending ? '保存中...' : '設定を保存'}
    </button>
  );
}

export default function AdminForm() {
  return (
    <form action={createConfig}>
      <div className="max-w-md mx-auto space-y-6">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2" htmlFor="setting-name">設定名</label>
          <input className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:border-primary" id="setting-name" name="name" type="text" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2" htmlFor="notion-api-key">Notion APIキー</label>
          <input className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:border-primary" id="notion-api-key" name="apiKey" type="password" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2" htmlFor="database-id">データベースID</label>
          <input className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:border-primary" id="database-id" name="dbId" type="text" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2" htmlFor="node-property">ノード名に使うプロパティ名</label>
          <input className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:border-primary" id="node-property" name="titleProperty" type="text" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2" htmlFor="relation-property">関連ページのプロパティ名</label>
          <input className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:border-primary" id="relation-property" name="relationProperty" type="text" required />
        </div>
        <div className="flex justify-end">
          <SubmitButton />
        </div>
      </div>
    </form>
  );
}
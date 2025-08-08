"use client";

import { useFormState, useFormStatus } from "react-dom";
import { createGraphConfig } from "./actions";
import { useEffect, useRef } from "react";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
    >
      {pending ? "保存中..." : "設定を保存"}
    </button>
  );
}

export default function AdminForm() {
  const [state, formAction] = useFormState(createGraphConfig, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    // サーバーアクションが成功した場合にフォームをリセット
    if (state?.success) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="mt-6 space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">グラフの名前</label>
        <input type="text" name="name" id="name" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
        <p className="mt-1 text-xs text-gray-500">例：プロジェクトAのナレッジグラフ</p>
      </div>
       <div>
        <label htmlFor="title_property" className="block text-sm font-medium text-gray-700">タイトルプロパティ名</label>
        <input type="text" name="title_property" id="title_property" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
        <p className="mt-1 text-xs text-gray-500">ページのタイトルとして使うTitleプロパティの名前（例：タイトル）</p>
      </div>
      <div>
        <label htmlFor="keyword_property" className="block text-sm font-medium text-gray-700">キーワードプロパティ名</label>
        <input type="text" name="keyword_property" id="keyword_property" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
        <p className="mt-1 text-xs text-gray-500">グラフのハブとして使うMulti-selectプロパティの名前（例：キーワード）</p>
      </div>
      <div>
        <label htmlFor="notion_api_key" className="block text-sm font-medium text-gray-700">Notion APIキー</label>
        <input type="password" name="notion_api_key" id="notion_api_key" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
      </div>
      <div>
        <label htmlFor="notion_database_id" className="block text-sm font-medium text-gray-700">Notion データベースID</label>
        <input type="text" name="notion_database_id" id="notion_database_id" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
      </div>
      
      <div>
        <SubmitButton />
      </div>

      {state?.message && (
        <div 
          className={`mt-4 p-4 rounded-md text-sm ${
            state.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          {state.message}
        </div>
      )}
    </form>
  );
}
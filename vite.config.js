import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');

  return {
    plugins: [react()],
    server: {
      proxy: {
        // '/api' というパスで始まるリクエストをNotionのAPIサーバーに転送する
        // データベース取得用の既存の設定
        '/api/databases': {
          target: 'https://api.notion.com/v1/databases',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/databases/, ''),
          headers: {
            'Notion-Version': '2022-06-28',
            'Authorization': `Bearer ${env.VITE_NOTION_API_KEY}`,
          },
        },
        // ▼▼▼ ページコンテンツ取得用にこの設定を追加 ▼▼▼
        '/api/blocks': {
          target: 'https://api.notion.com/v1/blocks',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/blocks/, ''),
          headers: {
            'Notion-Version': '2022-06-28',
            'Authorization': `Bearer ${env.VITE_NOTION_API_KEY}`,
          },
        }
      }
    }
  }
})
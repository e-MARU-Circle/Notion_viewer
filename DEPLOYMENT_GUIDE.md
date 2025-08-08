# Vercel デプロイ手順ガイド

このドキュメントは、開発したNotionグラフ表示アプリケーションを、ホスティングサービス「Vercel」を利用してインターネット上に公開するための手順書です。

## はじめに：デプロイの全体像

このアプリケーションは、2つの独立したパーツで構成されています。

1.  **Next.js アプリ (バックエンド & 管理画面):** APIを提供し、設定を管理します。
2.  **Vite アプリ (フロントエンド):** グラフを表示します。

この2つをVercelにデプロイし、連携させることがゴールです。

---

### ステップ1：コードをGitHubにプッシュする

まず、プロジェクト全体（`notion-viewer-like-obsidian`フォルダ）を、ご自身のGitHubアカウントに新しいリポジトリとしてアップロード（プッシュ）してください。VercelはGitHubと連携し、コードが更新されるたびに自動でデプロイを行ってくれます。

---

### ステップ2：Next.js バックエンドをデプロイする

1.  [Vercel](https://vercel.com/)にサインアップし、GitHubアカウントを連携します。
2.  Vercelのダッシュボードで「Add New...」→「Project」を選択し、ステップ1で作成したGitHubリポジトリをインポートします。
3.  **プロジェクト設定:**
    *   **Framework Preset:** Vercelが自動で「Next.js」を検出します。
    *   **Root Directory:** **ここが重要です。** 「Edit」を押し、`notion-graph-app` を選択してください。
4.  **環境変数を設定:**
    *   `NEXT_PUBLIC_SUPABASE_URL`：お使いのSupabaseのURL
    *   `SUPABASE_SERVICE_ROLE_KEY`：お使いのSupabaseのService Roleキー
    *   `NEXT_PUBLIC_VITE_APP_URL`：**この時点ではまだ空欄でOKです。**（ステップ4で設定します）
5.  「Deploy」ボタンをクリックします。数分でデプロイが完了し、Next.jsアプリの公開URL（例: `notion-backend-xxxxx.vercel.app`）が発行されます。このURLは後で使います。

---

### ステップ3：Vite フロントエンドをデプロイする

1.  再度Vercelのダッシュボードで「Add New...」→「Project」を選択し、**同じGitHubリポジトリ**をインポートします。
2.  **プロジェクト設定:**
    *   **Framework Preset:** Vercelが自動で「Vite」を検出します。
    *   **Root Directory:** 今度は変更せず、ルートディレクトリのまま（`notion-viewer-like-obsidian`）にしてください。
3.  「Deploy」ボタンをクリックします。こちらも数分でデプロイが完了し、Viteアプリの公開URL（例: `my-graph-viewer.vercel.app`）が発行されます。このURLも後で使います。

---

### ステップ4：バックエンドとフロントエンドを接続する

最後に、2つのアプリが互いに通信できるように設定します。

1.  **CORSの設定:**
    *   ローカルのソースコードを修正します。APIが、新しくデプロイしたViteアプリからのリクエストを許可するようにします。
    *   以下の2つのファイルを修正してください。
        *   `notion-graph-app/src/app/api/graph-data/[id]/route.ts`
        *   `notion-graph-app/src/app/api/page-content/[pageId]/route.ts`
    *   それぞれのファイルにある以下の行を見つけ、
        ```typescript
        const allowedOrigin = 'http://localhost:5173';
        ```
    *   環境変数を使うように、以下のように書き換えてください。
        ```typescript
        const allowedOrigin = process.env.NEXT_PUBLIC_VITE_APP_URL || 'http://localhost:5173';
        ```
2.  **環境変数の更新:**
    *   Vercelのダッシュボードに戻り、**ステップ2で作成したNext.jsアプリ**のプロジェクト設定を開きます。
    *   「Environment Variables」のページで、`NEXT_PUBLIC_VITE_APP_URL`の値を、**ステップ3で取得したViteアプリの公開URL**（`https://my-graph-viewer.vercel.app`など）に設定して保存します。
3.  **再デプロイ:**
    *   ステップ4-1で行ったコード修正を、GitHubにプッシュします。
    *   Vercelが自動で変更を検知し、両方のアプリケーションを再デプロイします。

---

### デプロイ完了！

以上で、すべての手順は完了です。

Next.jsアプリのURL (`https://notion-backend-xxxxx.vercel.app/admin`) にアクセスして管理画面を開き、設定を追加・保存してください。その後、「グラフを表示」ボタンを押せば、公開されたViteアプリのURLでグラフが表示されるはずです。

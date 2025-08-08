export interface GraphConfig {
  id: string;
  created_at: string;
  api_key: string;
  db_id: string;
  title_property: string;
  // ★★★ 新しいプロパティの型定義を追加 ★★★
  relation_property: string;
}

"use server";

import { supabaseAdmin } from "@/lib/supabaseClient";
import { revalidatePath } from "next/cache";

// 既存の作成用アクション
export async function createGraphConfig(
  previousState: any,
  formData: FormData
) {
  const newConfig = {
    name: formData.get("name") as string,
    notion_api_key: formData.get("notion_api_key") as string,
    notion_database_id: formData.get("notion_database_id") as string,
    // ▼▼▼ title_property をフォームから取得 ▼▼▼
    title_property: formData.get("title_property") as string,
    keyword_property: formData.get("keyword_property") as string,
  };

  try {
    const { data, error } = await supabaseAdmin
      .from("graph_configs")
      .insert(newConfig);

    if (error) {
      throw new Error(error.message);
    }
    
    revalidatePath("/admin");

    return { success: true, message: "設定を保存しました。" };
  } catch (e: any) {
    return { success: false, message: `エラーが発生しました: ${e.message}` };
  }
}

// 既存の削除用アクション
export async function deleteGraphConfig(configId: number) {
  try {
    const { error } = await supabaseAdmin
      .from("graph_configs")
      .delete()
      .eq("id", configId);

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath("/admin");
    return { success: true, message: "設定を削除しました。" };
  } catch (e: any) {
    return { success: false, message: `削除中にエラーが発生しました: ${e.message}` };
  }
}
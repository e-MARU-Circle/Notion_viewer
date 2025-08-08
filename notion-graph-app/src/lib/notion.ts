import { Client } from "@notionhq/client";

export async function getNotionData(databaseId: string, titleProperty: string, relationProperty: string) {
  const notion = new Client({
    auth: process.env.NOTION_API_KEY,
  });

  const response = await notion.databases.query({
    database_id: databaseId,
  });

  const pages = response.results;
  const pageNodeMap = new Map<string, { pageId: string; keywordIds: string[] }>();
  const keywordMap = new Map<string, { color: string }>();
  const links: { source: string; target: string }[] = [];

  pages.forEach((page: any) => {
    const titleArray = page.properties[titleProperty]?.title;
    const sourceTitle = titleArray?.[0]?.plain_text;

    if (sourceTitle) {
      const relatedKeywords: string[] = [];
      const multiSelectArray = page.properties[relationProperty]?.multi_select;
      if (multiSelectArray) {
        multiSelectArray.forEach((keyword: any) => {
          const targetKeyword = keyword.name;
          const keywordColor = keyword.color;
          if (targetKeyword) {
            relatedKeywords.push(targetKeyword);
            if (!keywordMap.has(targetKeyword)) {
              keywordMap.set(targetKeyword, { color: keywordColor });
            }
            links.push({ source: targetKeyword, target: sourceTitle });
          }
        });
      }
      pageNodeMap.set(sourceTitle, { pageId: page.id, keywordIds: relatedKeywords });
    }
  });

  const pageNodes = Array.from(pageNodeMap.keys()).map(id => ({
    id,
    pageId: pageNodeMap.get(id)?.pageId,
    keywordIds: pageNodeMap.get(id)?.keywordIds,
    type: 'page',
  }));
  const keywordNodes = Array.from(keywordMap.keys()).map(id => ({
    id,
    type: 'keyword',
    color: keywordMap.get(id)?.color,
  }));
  const nodes = [...pageNodes, ...keywordNodes];

  return { nodes, links };
}

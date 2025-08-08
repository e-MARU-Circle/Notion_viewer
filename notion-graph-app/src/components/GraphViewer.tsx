"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import ForceGraph from "@/components/ForceGraph";
import { getPageContent } from "@/app/graph/[graphId]/actions";

// 型定義
type Node = { id: string; name: string; type: 'page' | 'keyword'; color?: string };
type Link = { source: string; target: string };

function SettingsPanel({ settings, onSettingChange }: { settings: any, onSettingChange: any }) {
  return (
    <div className="p-4 bg-gray-700 rounded-b-lg">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300">文字サイズ: {settings.fontSize}</label>
          <input type="range" min="8" max="24" value={settings.fontSize} onChange={(e) => onSettingChange('fontSize', e.target.value)} className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"/>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300">ノードサイズ: {settings.nodeSize}</label>
          <input type="range" min="4" max="20" value={settings.nodeSize} onChange={(e) => onSettingChange('nodeSize', e.target.value)} className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"/>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300">ノード間距離: {settings.linkDistance}</label>
          <input type="range" min="30" max="200" value={settings.linkDistance} onChange={(e) => onSettingChange('linkDistance', e.target.value)} className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"/>
        </div>
        <div className="flex items-center">
          <input id="truncate-title" type="checkbox" checked={settings.truncateTitle} onChange={(e) => onSettingChange('truncateTitle', e.target.checked)} className="h-4 w-4 text-indigo-600 bg-gray-700 border-gray-500 rounded focus:ring-indigo-500"/>
          <label htmlFor="truncate-title" className="ml-2 block text-sm text-gray-300">タイトルの10文字以上を省略</label>
        </div>
      </div>
    </div>
  );
}

function SidePanel({ pageId, graphId, pageTitle, onClose }: { pageId: string, graphId: string, pageTitle: string, onClose: () => void }) {
  const [blocks, setBlocks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!pageId) return;
    const fetchContent = async () => {
      setIsLoading(true);
      const result = await getPageContent(pageId, graphId);
      if (result.blocks) {
        setBlocks(result.blocks);
      } else {
        console.error(result.error);
      }
      setIsLoading(false);
    };
    fetchContent();
  }, [pageId, graphId]);

  return (
    <div className="w-1/2 h-screen shadow-2xl flex flex-col flex-shrink-0" style={{ backgroundColor: 'white', color: '#1f2937' }}>
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-xl font-bold truncate pr-4">{pageTitle}</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-3xl">&times;</button>
      </div>
      <div className="p-6 overflow-y-auto flex-grow">
        {isLoading ? <p>読み込み中...</p> : <div>{blocks.map((block: any) => <BlockRenderer key={block.id} block={block} />)}</div>}
      </div>
    </div>
  );
}

function BlockRenderer({ block }: { block: any }) {
  const { type } = block;
  const value = block[type];
  const getText = (richTextArray: any[]) => richTextArray.map(rt => rt.plain_text).join('');

  switch (type) {
    case 'paragraph': return <p className="my-2 leading-relaxed">{getText(value.rich_text)}</p>;
    case 'heading_2': return <h2 className="text-2xl font-bold my-3 border-b pb-1">{getText(value.rich_text)}</h2>;
    case 'heading_3': return <h3 className="text-xl font-bold my-2">{getText(value.rich_text)}</h3>;
    case 'bulleted_list_item': return <li className="ml-6 list-disc">{getText(value.rich_text)}</li>;
    case 'image': const src = value.type === 'external' ? value.external.url : value.file.url; return <img src={src} alt="Notion content" className="my-4 max-w-full rounded-lg shadow" />;
    default: return null;
  }
}

export default function GraphViewer({ nodes, links, graphId }: { nodes: Node[], links: Link[], graphId: string }) {
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [settings, setSettings] = useState({
    fontSize: 12,
    nodeSize: 8,
    linkDistance: 80,
    truncateTitle: true,
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: typeof value === 'boolean' ? value : Number(value),
    }));
  };

  const handleNodeClick = useCallback((nodeId: string) => {
    setSelectedPageId(nodeId);
  }, []);
  
  const selectedPage = nodes.find(node => node.id === selectedPageId);

  const processedNodes = useMemo(() => {
    return nodes.map(node => ({
      ...node,
      displayName: settings.truncateTitle && node.name.length > 10 
        ? `${node.name.substring(0, 10)}...` 
        : node.name,
    }));
  }, [nodes, settings.truncateTitle]);

  return (
    <div className="flex h-screen w-full">
      <div className="flex-grow h-full relative">
        <div className="absolute top-0 left-0 p-4 z-20">
          <SettingsPanel settings={settings} onSettingChange={handleSettingChange} />
        </div>
        <ForceGraph 
          nodes={processedNodes} 
          links={links} 
          onPageClick={handleNodeClick}
          settings={settings}
        />
      </div>
      {selectedPageId && selectedPage && (
        <SidePanel 
          pageId={selectedPageId}
          graphId={graphId}
          pageTitle={selectedPage.name}
          onClose={() => setSelectedPageId(null)}
        />
      )}
    </div>
  );
}
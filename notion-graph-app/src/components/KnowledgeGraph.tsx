'use client';

import { useEffect, useState, useRef } from 'react';
import ForceGraph2D, { ForceGraphMethods, NodeObject } from 'react-force-graph-2d';
import { fetchNotionPageContent } from '@/app/actions';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

// --- HELPER INTERFACES AND FUNCTIONS ---

interface GraphNode extends NodeObject {
  id: string;
  name: string;
  type: 'page' | 'keyword';
}
interface LinkObject {
  source: string;
  target: string;
}

const processNotionData = (
  notionData: any[],
  titleProperty: string,
  relationProperty: string
) => {
  const pageNodes: GraphNode[] = [];
  const keywordNodes = new Map<string, GraphNode>();
  const links: LinkObject[] = [];
  const pageNodeIds = new Set<string>();

  notionData.forEach((page, index) => {
    if (!page || !page.id) {
      console.warn(`[processNotionData] Skipping page at index ${index} due to missing page or page.id`);
      return;
    }
    const pageId = page.id;
    const titleProp = page.properties?.[titleProperty];
    const title = titleProp?.title?.[0]?.plain_text;

    if (title) {
      pageNodes.push({ id: pageId, name: title, type: 'page' });
      pageNodeIds.add(pageId);
    } else {
      console.warn(`[processNotionData] Page with id ${pageId} is missing title in property '${titleProperty}'.`);
    }
  });

  if (relationProperty) {
    notionData.forEach((page) => {
      if (!pageNodeIds.has(page.id)) return;
      const prop = page.properties?.[relationProperty];
      const values = prop?.multi_select?.map((p: any) => p.name) || (prop?.status?.name ? [prop.status.name] : []);
      
      if (values && values.length > 0) {
        values.forEach((value: string) => {
          if (typeof value !== 'string' || !value) {
            console.warn(`[processNotionData] Invalid keyword value found for page ${page.id}:`, value);
            return;
          }

          if (!keywordNodes.has(value)) {
            keywordNodes.set(value, { id: value, name: value, type: 'keyword' });
          }
          links.push({ source: page.id, target: value });
        });
      }
    });
  }

  const allNodes = [...pageNodes, ...Array.from(keywordNodes.values())];
  return { nodes: allNodes, links };
};

const stringToColor = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = hash % 360;
  return `hsl(${hue}, 75%, 55%)`;
};

const NotionContentRenderer = ({ blocks }: { blocks: any[] | null }) => {
  if (!blocks) return <p className="text-slate-500">コンテンツがありません。</p>;
  return (
    <div className="prose prose-sm max-w-none">
      {blocks.map((block: any) => {
        const type = block.type;
        const richText = block[type]?.rich_text;
        if (!richText || richText.length === 0) {
          if (type === 'image') {
            const imageUrl = block.image?.file?.url || block.image?.external?.url;
            return <img key={block.id} src={imageUrl} alt="Notion Image" className="rounded-lg" />;
          }
          if (type === 'divider') return <hr key={block.id} className="my-6" />;
          return null;
        }
        const content = richText.map((t: any) => t.plain_text).join('');
        if (!content) return null;
        switch (type) {
          case 'heading_1': return <h1 key={block.id}>{content}</h1>;
          case 'heading_2': return <h2 key={block.id}>{content}</h2>;
          case 'heading_3': return <h3 key={block.id}>{content}</h3>;
          case 'bulleted_list_item': return <ul key={block.id}><li className="my-1">{content}</li></ul>;
          case 'numbered_list_item': return <ol key={block.id}><li className="my-1">{content}</li></ol>;
          case 'paragraph': return <p key={block.id}>{content}</p>;
          default: return <p key={block.id}>{content}</p>;
        }
      })}
    </div>
  );
};

// --- MAIN COMPONENT ---

export default function KnowledgeGraph({ configId, configName, notionData, titleProperty, relationProperty }: { configId: number, configName: string, notionData: any[], titleProperty: string, relationProperty: string }) {
  const [chargeStrength, setChargeStrength] = useState(-300);
  const [nodeSize, setNodeSize] = useState(2);
  const [fontSize, setFontSize] = useState(10);
  const [graphData, setGraphData] = useState<{ nodes: GraphNode[], links: LinkObject[] }>({ nodes: [], links: [] });
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [pageContent, setPageContent] = useState<any[] | null>(null);
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const fgRef = useRef<ForceGraphMethods>();

  useEffect(() => {
    if (notionData && titleProperty && relationProperty) {
      const processedData = processNotionData(notionData, titleProperty, relationProperty);
      setGraphData(processedData);
    }
  }, [notionData, titleProperty, relationProperty]);

  useEffect(() => {
    fgRef.current?.d3Force('charge')?.strength(chargeStrength);
  }, [chargeStrength]);

  const handleNodeClick = async (node: NodeObject) => {
    const graphNode = node as GraphNode;
    if (graphNode.type !== 'page' || selectedNode?.id === graphNode.id) {
      setSelectedNode(null); setPageContent(null); return;
    }
    setSelectedNode(graphNode);
    setIsLoadingContent(true);
    setPageContent(null);
    const blocks = await fetchNotionPageContent(graphNode.id, configId);
    setPageContent(blocks);
    setIsLoadingContent(false);
  };
  
  return (
    <div className="w-full h-full absolute top-0 left-0">
      <h1 className="absolute top-4 left-1/2 -translate-x-1/2 z-10 text-2xl font-bold text-slate-700 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-lg">
        {configName}
      </h1>
      <div className="absolute top-4 left-4 z-10 bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-lg border w-60">
        <h3 className="font-bold text-slate-800 mb-2">コントロール</h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-slate-600">反発力: {chargeStrength}</label>
            <input type="range" min={-600} max={0} value={chargeStrength} onChange={(e) => setChargeStrength(Number(e.target.value))} className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">ノードサイズ: {nodeSize}</label>
            <input type="range" min={1} max={4} value={nodeSize} onChange={(e) => setNodeSize(Number(e.target.value))} className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">文字サイズ: {fontSize}</label>
            <input type="range" min={2} max={18} step={0.1} value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer" />
          </div>
        </div>
      </div>
      <div className="absolute top-4 right-4 z-10">
        <Link href="/admin" className="bg-white hover:bg-slate-100 text-slate-700 font-semibold py-2 px-4 rounded-lg text-sm shadow-md border transition-colors">
          管理画面に戻る
        </Link>
      </div>
      
      <div className={`absolute top-0 right-0 h-full bg-white shadow-2xl transition-transform duration-300 ease-in-out z-20 w-full md:w-[420px] ${selectedNode ? 'translate-x-0' : 'translate-x-full'}`}>
        {selectedNode && (
          <div className="p-6 h-full flex flex-col">
            <div className="flex-shrink-0">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <button onClick={() => setSelectedNode(null)} className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors" title="パネルを閉じる">
                    <ArrowRight size={20} />
                  </button>
                  <h2 className="text-xl font-bold text-slate-800 truncate">{selectedNode.name}</h2>
                </div>
                <button onClick={() => setSelectedNode(null)} className="text-slate-500 hover:text-slate-800 text-2xl">&times;</button>
              </div>
              <hr />
            </div>
            <div className="flex-grow overflow-y-auto mt-4">
              {isLoadingContent && <p className="text-center p-8 text-slate-500">読み込み中...</p>}
              <NotionContentRenderer blocks={pageContent} />
            </div>
          </div>
        )}
      </div>

      <ForceGraph2D
        ref={fgRef}
        graphData={graphData}
        nodeLabel="name"
        nodeVal={node => (node as GraphNode).type === 'page' ? nodeSize * 2 : nodeSize}
        linkColor={() => 'rgba(0,0,0,0.15)'}
        linkDirectionalParticles={1}
        linkDirectionalParticleSpeed={0.006}
        nodeCanvasObjectMode={'replace'}
        onNodeClick={handleNodeClick}
        nodeCanvasObject={(node, ctx, globalScale) => {
          const graphNode = node as GraphNode;
          const label = graphNode.name;
          const size = graphNode.type === 'page' ? nodeSize * 2 : nodeSize;

          // ノードの色設定
          const nodeColor = graphNode.type === 'page'
            ? '#3b82f6' // Page node color
            : stringToColor(graphNode.name); // Keyword node color

          // ノードの描画
          ctx.beginPath();
          ctx.arc(graphNode.x!, graphNode.y!, size, 0, 2 * Math.PI, false);
          ctx.fillStyle = nodeColor;
          ctx.fill();

          // ラベルの描画
          const finalFontSize = fontSize / globalScale;
          if (finalFontSize < 4) return; // Don't render labels if they are too small

          ctx.font = `300 ${finalFontSize}px 'Noto Sans JP', sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          const textY = graphNode.y! + size + 2;

          // ラベルの縁取りで可読性を向上
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.lineWidth = 4 / globalScale;
          ctx.strokeText(label, graphNode.x!, textY);

          // ラベル本体
          ctx.fillStyle = '#1e293b'; // Dark slate color
          ctx.fillText(label, graphNode.x!, textY);
        }}
      />
    </div>
  );
}

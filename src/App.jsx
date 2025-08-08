import React, { useState, useEffect, useRef } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import './App.css';

const RichTextRenderer = ({ richText }) => {
  if (!richText || !Array.isArray(richText)) return null;
  return richText.map((text, index) => {
    const { annotations, plain_text, href } = text;
    if (!annotations) return <span key={index}>{plain_text}</span>;
    let element = <span>{plain_text}</span>;
    if (annotations.bold) element = <strong>{element}</strong>;
    if (annotations.italic) element = <em>{element}</em>;
    if (annotations.underline) element = <u>{element}</u>;
    if (annotations.strikethrough) element = <s>{element}</s>;
    if (annotations.code) element = <code>{element}</code>;
    if (href) element = <a href={href} target="_blank" rel="noopener noreferrer">{element}</a>;
    return <span key={index}>{element}</span>;
  });
};

const NotionBlock = ({ block }) => {
  if (!block || !block.type) return null;
  switch (block.type) {
    case 'heading_1': return <h1><RichTextRenderer richText={block.heading_1.rich_text} /></h1>;
    case 'heading_2': return <h2><RichTextRenderer richText={block.heading_2.rich_text} /></h2>;
    case 'heading_3': return <h3><RichTextRenderer richText={block.heading_3.rich_text} /></h3>;
    case 'paragraph': return <p><RichTextRenderer richText={block.paragraph.rich_text} /></p>;
    case 'bulleted_list_item': return <li><RichTextRenderer richText={block.bulleted_list_item.rich_text} /></li>;
    case 'image':
      const imageUrl = block.image?.file?.url || block.image?.external?.url;
      return imageUrl ? <img src={imageUrl} alt="Notion content" /> : null;
    case 'divider': return <hr />;
    default: return null;
  }
};

function App() {
  const [graphId, setGraphId] = useState(null);
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [databaseTitle, setDatabaseTitle] = useState('');
  const [selectedPage, setSelectedPage] = useState(null);
  const [pageContent, setPageContent] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [graphNodeSize, setGraphNodeSize] = useState(8);
  const [graphFontSize, setGraphFontSize] = useState(12);
  const [repulsion, setRepulsion] = useState(-150);
  const [pageFontSize, setPageFontSize] = useState(16);

  const fgRef = useRef();

  // 1. URLからグラフIDを取得してstateに保存
  useEffect(() => {
    const pathSegments = window.location.pathname.split('/').filter(Boolean);
    const id = pathSegments.length > 0 ? pathSegments[pathSegments.length - 1] : null;
    if (id) {
      setGraphId(id);
    } else {
      console.error("Graph ID not found in URL.");
    }
  }, []);

  // 2. graphIdがセットされたら、グラフデータを取得
  useEffect(() => {
    if (!graphId) return;

    const fetchData = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/graph-data/${graphId}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setGraphData({ nodes: data.nodes, links: data.links });
        setDatabaseTitle(data.databaseTitle || '');
      } catch (error) {
        console.error("Failed to fetch graph data:", error);
      }
    };
    fetchData();
  }, [graphId]);

  // 反発力の動的更新
  useEffect(() => {
    if (fgRef.current) {
      fgRef.current.d3Force('charge').strength(repulsion);
    }
  }, [repulsion]);

  // 3. ノードクリック時、stateからgraphIdを使ってページ内容を取得
  const handleNodeClick = async (node) => {
    if (node.type !== 'page') return;
    if (selectedPage && selectedPage.pageId === node.pageId) {
      setSelectedPage(null);
      return;
    }
    setSelectedPage(node);
    setIsLoading(true);
    setPageContent([]);
    try {
      const response = await fetch(`http://localhost:3000/api/page-content/${node.pageId}?graphId=${graphId}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setPageContent(data.blocks || []);
    } catch (error) {
      console.error("Failed to fetch page content:", error);
      setPageContent([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      <div className="graph-view">
        <a href="http://localhost:3000/admin" className="admin-button">管理画面へ</a>
        {databaseTitle && <h1 className="database-title">{databaseTitle}</h1>}
        <div className="controls">
          <div className="control-item"><label>Node Size</label><input type="range" min="1" max="20" step="1" value={graphNodeSize} onChange={(e) => setGraphNodeSize(Number(e.target.value))} /><span>{graphNodeSize}</span></div>
          <div className="control-item"><label>Graph Font</label><input type="range" min="4" max="24" step="1" value={graphFontSize} onChange={(e) => setGraphFontSize(Number(e.target.value))} /><span>{graphFontSize}</span></div>
          <div className="control-item"><label>Repulsion</label><input type="range" min="-500" max="0" step="10" value={repulsion} onChange={(e) => setRepulsion(Number(e.target.value))} /><span>{repulsion}</span></div>
        </div>
        <ForceGraph2D
          ref={fgRef}
          graphData={graphData}
          backgroundColor="#FFFFFF"
          onNodeClick={handleNodeClick}
          linkDirectionalParticles={1}
          linkDirectionalParticleWidth={2}
          linkDirectionalParticleSpeed={0.005}
          nodeCanvasObject={(node, ctx, globalScale) => {
            const isKeyword = node.type === 'keyword';
            const label = isKeyword ? `#${node.id}` : node.id;
            const currentFontSize = graphFontSize / globalScale;
            const nodeRadius = isKeyword ? graphNodeSize / 1.5 : graphNodeSize;
            const nodeColor = isKeyword ? '#4169E1' : '#2E8B57'; // キーワードは明るい青、ページは明るい緑
            ctx.beginPath();
            ctx.arc(node.x, node.y, nodeRadius, 0, 2 * Math.PI, false);
            ctx.fillStyle = nodeColor;
            ctx.fill();
            ctx.font = `${currentFontSize}px Sans-Serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = 'black';
            ctx.fillText(label, node.x, node.y + nodeRadius + 4);
          }}
        />
      </div>
      <div className={`page-view ${selectedPage ? 'visible' : ''}`}>
        {selectedPage && (
          <>
            <button onClick={() => setSelectedPage(null)} className="close-btn">×</button>
            <h2 style={{ fontSize: '32px', fontWeight: 'bold' }}>{selectedPage.id}</h2>
            <div className="page-controls">
              <div className="related-keywords">
                <h4>Related Keywords</h4>
                <div>{selectedPage.keywordIds?.map(kid => <span key={kid} className="keyword-tag">#{kid}</span>)}</div>
              </div>
              <div className="control-item"><label>Font Size</label><input type="range" min="10" max="24" step="1" value={pageFontSize} onChange={(e) => setPageFontSize(Number(e.target.value))} /><span>{pageFontSize}</span></div>
            </div>
            <hr />
            {isLoading ? <p>Loading...</p> : <div className="page-content" style={{ fontSize: `${pageFontSize}px` }}>{pageContent.map(block => <NotionBlock key={block.id} block={block} />)}</div>}
          </>
        )}
      </div>
    </div>
  );
}

export default App;
"use client";

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

// Type definitions
type Node = { id: string; name: string; displayName: string; type: 'page' | 'keyword'; color?: string };
type Link = { source: string; target: string };

type ForceGraphProps = {
  nodes: Node[];
  links: Link[];
  onPageClick: (nodeId: string) => void;
  settings: {
    fontSize: number;
    nodeSize: number;
    linkDistance: number;
  };
};

export default function ForceGraph({ nodes, links, onPageClick, settings }: ForceGraphProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!nodes.length || !svgRef.current) return;

    const container = svgRef.current.parentElement;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;
    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height]);
    
    svg.selectAll("*").remove();

    const parentGroup = svg.append("g");

    parentGroup.append('defs').append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '-0 -5 10 10')
      .attr('refX', settings.nodeSize + 8)
      .attr('refY', 0)
      .attr('orient', 'auto')
      .attr('markerWidth', 8)
      .attr('markerHeight', 8)
      .append('svg:path')
      .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
      .attr('fill', '#999');

    const chargeStrength = -5 * settings.linkDistance;

    const simulation = d3.forceSimulation(nodes as any)
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance(settings.linkDistance))
      .force("charge", d3.forceManyBody().strength(chargeStrength))
      .force("center", d3.forceCenter(width / 2, height / 2));

    const link = parentGroup.append("g")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("marker-end", "url(#arrowhead)");

    const node = parentGroup.append("g")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .call(drag(simulation) as any);

    node.append("circle")
      .attr("r", d => d.type === 'page' ? settings.nodeSize : settings.nodeSize / 2)
      .attr("fill", d => d.type === 'page' ? '#3b82f6' : d.color || '#a855f7')
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5);

    node.append("text")
      .text(d => d.displayName)
      .attr('x', settings.nodeSize + 3)
      .attr('y', 5)
      .attr("fill", "#fff")
      .style("font-size", `${settings.fontSize}px`)
      .style("cursor", d => d.type === 'page' ? "pointer" : "default")
      .on("click", (event, d) => {
        event.stopPropagation();
        if (d.type === 'page') {
          onPageClick(d.id);
        }
      });

    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);
      node.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });

    const zoom = d3.zoom().on("zoom", (event) => {
      parentGroup.attr("transform", event.transform);
    });
    svg.call(zoom as any);

    return () => {
      simulation.stop();
    };

  }, [nodes, links, onPageClick, settings]);

  function drag(simulation: any) {
    function dragstarted(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }
    function dragged(event: any, d: any) {
      d.fx = event.x;
      d.fy = event.y;
    }
    function dragended(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }
    return d3.drag().on("start", dragstarted).on("drag", dragged).on("end", dragended);
  }

  return <svg ref={svgRef} className="w-full h-full"></svg>;
}
<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import * as d3 from 'd3';
	import type { NetworkNode, NetworkLink, PacketAnimation } from '$lib/stores/topologyStore.svelte';
	import { topologyStore } from '$lib/stores/topologyStore.svelte';

	interface Props {
		nodes: NetworkNode[];
		links: NetworkLink[];
		packets: PacketAnimation[];
		selectedNodeId: string | null;
		onNodeSelect: (nodeId: string | null) => void;
	}

	let { nodes, links, packets, selectedNodeId, onNodeSelect }: Props = $props();

	let svgElement: SVGSVGElement;
	let containerElement: HTMLDivElement;
	let width = $state(800);
	let height = $state(500);

	let simulation: d3.Simulation<NetworkNode, NetworkLink> | null = null;

	// ノードタイプに応じたアイコンとカラー
	function getNodeStyle(type: NetworkNode['type']): { icon: string; color: string; size: number } {
		switch (type) {
			case 'client':
				return { icon: '💻', color: '#3b82f6', size: 24 };
			case 'server':
				return { icon: '🖥️', color: '#22c55e', size: 28 };
			case 'router':
				return { icon: '🔀', color: '#f59e0b', size: 26 };
			case 'switch':
				return { icon: '🔌', color: '#8b5cf6', size: 24 };
			case 'firewall':
				return { icon: '🛡️', color: '#ef4444', size: 26 };
			case 'internet':
				return { icon: '🌐', color: '#06b6d4', size: 30 };
			default:
				return { icon: '📦', color: '#6b7280', size: 24 };
		}
	}

	// パケットの色
	function getPacketColor(type: PacketAnimation['type']): string {
		switch (type) {
			case 'request':
				return '#3b82f6';
			case 'response':
				return '#22c55e';
			case 'data':
				return '#f59e0b';
			default:
				return '#6b7280';
		}
	}

	function initGraph() {
		if (!svgElement || nodes.length === 0) return;

		const svg = d3.select(svgElement);
		svg.selectAll('*').remove();

		// リンクのグループ
		const linkGroup = svg.append('g').attr('class', 'links');

		// パケットのグループ
		const packetGroup = svg.append('g').attr('class', 'packets');

		// ノードのグループ
		const nodeGroup = svg.append('g').attr('class', 'nodes');

		// ラベルのグループ
		const labelGroup = svg.append('g').attr('class', 'labels');

		// D3力学シミュレーション
		const nodesCopy = nodes.map((n) => ({ ...n }));
		const linksCopy = links.map((l) => ({
			...l,
			source: l.source,
			target: l.target
		}));

		simulation = d3
			.forceSimulation(nodesCopy)
			.force(
				'link',
				d3
					.forceLink<NetworkNode, d3.SimulationLinkDatum<NetworkNode>>(linksCopy as d3.SimulationLinkDatum<NetworkNode>[])
					.id((d) => d.id)
					.distance(120)
			)
			.force('charge', d3.forceManyBody().strength(-400))
			.force('center', d3.forceCenter(width / 2, height / 2))
			.force('collision', d3.forceCollide().radius(50));

		// リンク描画
		const linkElements = linkGroup
			.selectAll('line')
			.data(linksCopy)
			.enter()
			.append('line')
			.attr('stroke', '#4b5563')
			.attr('stroke-width', 2)
			.attr('stroke-opacity', 0.6);

		// ノード描画（背景円）
		const nodeCircles = nodeGroup
			.selectAll('circle')
			.data(nodesCopy)
			.enter()
			.append('circle')
			.attr('r', (d) => getNodeStyle(d.type).size)
			.attr('fill', (d) => getNodeStyle(d.type).color)
			.attr('fill-opacity', 0.2)
			.attr('stroke', (d) => getNodeStyle(d.type).color)
			.attr('stroke-width', 2)
			.attr('cursor', 'pointer')
			.on('click', (event, d) => {
				event.stopPropagation();
				onNodeSelect(d.id === selectedNodeId ? null : d.id);
			})
			.call(
				d3
					.drag<SVGCircleElement, NetworkNode>()
					.on('start', dragstarted)
					.on('drag', dragged)
					.on('end', dragended) as unknown as (selection: d3.Selection<SVGCircleElement, NetworkNode, SVGGElement, unknown>) => void
			);

		// ノードアイコン
		const nodeIcons = nodeGroup
			.selectAll('text.icon')
			.data(nodesCopy)
			.enter()
			.append('text')
			.attr('class', 'icon')
			.attr('text-anchor', 'middle')
			.attr('dominant-baseline', 'central')
			.attr('font-size', (d) => getNodeStyle(d.type).size * 0.8)
			.attr('pointer-events', 'none')
			.text((d) => getNodeStyle(d.type).icon);

		// ラベル
		const labels = labelGroup
			.selectAll('text')
			.data(nodesCopy)
			.enter()
			.append('text')
			.attr('text-anchor', 'middle')
			.attr('dy', (d) => getNodeStyle(d.type).size + 15)
			.attr('font-size', '12px')
			.attr('fill', 'currentColor')
			.text((d) => d.label);

		// シミュレーション更新
		simulation.on('tick', () => {
			linkElements
				.attr('x1', (d) => (d.source as NetworkNode).x ?? 0)
				.attr('y1', (d) => (d.source as NetworkNode).y ?? 0)
				.attr('x2', (d) => (d.target as NetworkNode).x ?? 0)
				.attr('y2', (d) => (d.target as NetworkNode).y ?? 0);

			nodeCircles.attr('cx', (d) => d.x ?? 0).attr('cy', (d) => d.y ?? 0);

			nodeIcons.attr('x', (d) => d.x ?? 0).attr('y', (d) => d.y ?? 0);

			labels.attr('x', (d) => d.x ?? 0).attr('y', (d) => d.y ?? 0);
		});

		function dragstarted(event: d3.D3DragEvent<SVGCircleElement, NetworkNode, NetworkNode>) {
			if (!event.active && simulation) simulation.alphaTarget(0.3).restart();
			event.subject.fx = event.subject.x;
			event.subject.fy = event.subject.y;
		}

		function dragged(event: d3.D3DragEvent<SVGCircleElement, NetworkNode, NetworkNode>) {
			event.subject.fx = event.x;
			event.subject.fy = event.y;
		}

		function dragended(event: d3.D3DragEvent<SVGCircleElement, NetworkNode, NetworkNode>) {
			if (!event.active && simulation) simulation.alphaTarget(0);
			event.subject.fx = null;
			event.subject.fy = null;
		}
	}

	function updatePackets() {
		if (!svgElement) return;

		const svg = d3.select(svgElement);
		const packetGroup = svg.select('.packets');

		// リンクの座標マップを作成
		const linkCoords = new Map<string, { x1: number; y1: number; x2: number; y2: number }>();
		svg.select('.links').selectAll('line').each(function () {
			const line = d3.select(this);
			const datum = line.datum() as { id: string; source: NetworkNode; target: NetworkNode };
			if (datum) {
				linkCoords.set(datum.id, {
					x1: Number(line.attr('x1')),
					y1: Number(line.attr('y1')),
					x2: Number(line.attr('x2')),
					y2: Number(line.attr('y2'))
				});
			}
		});

		// パケットを更新
		const packetCircles = packetGroup.selectAll('circle').data(packets, (d) => (d as PacketAnimation).id);

		packetCircles.exit().remove();

		packetCircles
			.enter()
			.append('circle')
			.attr('r', 8)
			.attr('fill', (d) => getPacketColor(d.type))
			.attr('stroke', '#fff')
			.attr('stroke-width', 2)
			.merge(packetCircles as d3.Selection<SVGCircleElement, PacketAnimation, SVGGElement, unknown>)
			.attr('cx', (d) => {
				const coords = linkCoords.get(d.linkId);
				if (!coords) return 0;
				const progress = d.direction === 'forward' ? d.progress : 1 - d.progress;
				return coords.x1 + (coords.x2 - coords.x1) * progress;
			})
			.attr('cy', (d) => {
				const coords = linkCoords.get(d.linkId);
				if (!coords) return 0;
				const progress = d.direction === 'forward' ? d.progress : 1 - d.progress;
				return coords.y1 + (coords.y2 - coords.y1) * progress;
			});
	}

	function handleResize() {
		if (containerElement) {
			width = containerElement.clientWidth;
			height = Math.max(400, containerElement.clientWidth * 0.6);
			initGraph();
		}
	}

	onMount(() => {
		handleResize();
		window.addEventListener('resize', handleResize);
	});

	onDestroy(() => {
		window.removeEventListener('resize', handleResize);
		if (simulation) {
			simulation.stop();
		}
	});

	// ノードやリンクが変更されたらグラフを再初期化
	$effect(() => {
		if (nodes && links) {
			initGraph();
		}
	});

	// パケットが変更されたら更新
	$effect(() => {
		if (packets) {
			updatePackets();
		}
	});
</script>

<div bind:this={containerElement} class="w-full">
	<svg
		bind:this={svgElement}
		{width}
		{height}
		class="overflow-visible rounded-lg border border-border bg-background"
		onclick={() => onNodeSelect(null)}
		role="img"
		aria-label="ネットワークトポロジー図"
	></svg>
</div>

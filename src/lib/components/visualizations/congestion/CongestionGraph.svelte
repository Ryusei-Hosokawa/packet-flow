<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import * as d3 from 'd3';
	import type { CongestionStep } from '$lib/stores/congestionStore.svelte';

	interface Props {
		steps: CongestionStep[];
		currentIndex: number;
		maxCwnd: number;
	}

	let { steps, currentIndex, maxCwnd }: Props = $props();

	let svgElement: SVGSVGElement;
	let containerElement: HTMLDivElement;

	// グラフの寸法
	const margin = { top: 20, right: 30, bottom: 40, left: 50 };
	let width = $state(600);
	let height = $state(300);

	// 表示するステップ（現在位置まで）
	let visibleSteps = $derived(steps.slice(0, currentIndex + 1));

	// フェーズに応じた色
	function getPhaseColor(phase: string): string {
		switch (phase) {
			case 'slow-start':
				return '#22c55e'; // green
			case 'congestion-avoidance':
				return '#3b82f6'; // blue
			case 'fast-recovery':
				return '#f59e0b'; // amber
			case 'timeout':
				return '#ef4444'; // red
			default:
				return '#6b7280'; // gray
		}
	}

	function updateGraph() {
		if (!svgElement || visibleSteps.length === 0) return;

		const svg = d3.select(svgElement);
		svg.selectAll('*').remove();

		const innerWidth = width - margin.left - margin.right;
		const innerHeight = height - margin.top - margin.bottom;

		// スケール設定
		const xScale = d3
			.scaleLinear()
			.domain([0, Math.max(steps.length - 1, 10)])
			.range([0, innerWidth]);

		const yScale = d3
			.scaleLinear()
			.domain([0, maxCwnd + 2])
			.range([innerHeight, 0]);

		// メイングループ
		const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

		// グリッド線
		g.append('g')
			.attr('class', 'grid')
			.attr('opacity', 0.1)
			.call(
				d3
					.axisLeft(yScale)
					.tickSize(-innerWidth)
					.tickFormat(() => '')
			);

		// ssthresh ライン（水平線）
		if (visibleSteps.length > 0) {
			const currentSsthresh = visibleSteps[visibleSteps.length - 1].ssthresh;
			g.append('line')
				.attr('x1', 0)
				.attr('x2', innerWidth)
				.attr('y1', yScale(currentSsthresh))
				.attr('y2', yScale(currentSsthresh))
				.attr('stroke', '#f59e0b')
				.attr('stroke-width', 2)
				.attr('stroke-dasharray', '5,5')
				.attr('opacity', 0.7);

			g.append('text')
				.attr('x', innerWidth - 5)
				.attr('y', yScale(currentSsthresh) - 5)
				.attr('text-anchor', 'end')
				.attr('fill', '#f59e0b')
				.attr('font-size', '12px')
				.text(`ssthresh = ${currentSsthresh}`);
		}

		// cwnd のライン
		const line = d3
			.line<CongestionStep>()
			.x((d) => xScale(d.round))
			.y((d) => yScale(d.cwnd))
			.curve(d3.curveMonotoneX);

		// ライン描画（グラデーション効果）
		g.append('path')
			.datum(visibleSteps)
			.attr('fill', 'none')
			.attr('stroke', '#3b82f6')
			.attr('stroke-width', 3)
			.attr('d', line);

		// データポイント
		g.selectAll('.dot')
			.data(visibleSteps)
			.enter()
			.append('circle')
			.attr('class', 'dot')
			.attr('cx', (d) => xScale(d.round))
			.attr('cy', (d) => yScale(d.cwnd))
			.attr('r', (d, i) => (i === visibleSteps.length - 1 ? 8 : 5))
			.attr('fill', (d) => getPhaseColor(d.phase))
			.attr('stroke', '#fff')
			.attr('stroke-width', 2);

		// イベントマーカー（ロス/タイムアウト）
		g.selectAll('.event-marker')
			.data(visibleSteps.filter((d) => d.event === 'loss' || d.event === 'timeout'))
			.enter()
			.append('text')
			.attr('x', (d) => xScale(d.round))
			.attr('y', (d) => yScale(d.cwnd) - 15)
			.attr('text-anchor', 'middle')
			.attr('font-size', '16px')
			.text((d) => (d.event === 'loss' ? '!' : 'X'));

		// X軸
		g.append('g')
			.attr('transform', `translate(0,${innerHeight})`)
			.call(d3.axisBottom(xScale).ticks(10).tickFormat(d3.format('d')))
			.append('text')
			.attr('x', innerWidth / 2)
			.attr('y', 35)
			.attr('fill', 'currentColor')
			.attr('text-anchor', 'middle')
			.text('ラウンド (RTT)');

		// Y軸
		g.append('g')
			.call(d3.axisLeft(yScale))
			.append('text')
			.attr('transform', 'rotate(-90)')
			.attr('x', -innerHeight / 2)
			.attr('y', -40)
			.attr('fill', 'currentColor')
			.attr('text-anchor', 'middle')
			.text('cwnd (セグメント)');
	}

	function handleResize() {
		if (containerElement) {
			width = containerElement.clientWidth;
			height = Math.min(400, containerElement.clientWidth * 0.6);
			updateGraph();
		}
	}

	onMount(() => {
		handleResize();
		window.addEventListener('resize', handleResize);
	});

	onDestroy(() => {
		window.removeEventListener('resize', handleResize);
	});

	$effect(() => {
		// visibleStepsが変更されたらグラフを更新
		if (visibleSteps) {
			updateGraph();
		}
	});
</script>

<div bind:this={containerElement} class="w-full">
	<svg bind:this={svgElement} {width} {height} class="overflow-visible"></svg>
</div>

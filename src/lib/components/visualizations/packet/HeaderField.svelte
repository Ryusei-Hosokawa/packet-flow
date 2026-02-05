<script lang="ts">
	import type { HeaderField } from '$lib/types/packet';

	interface Props {
		field: HeaderField;
		isSelected: boolean;
		bitsPerRow: number;
		onclick: () => void;
	}

	let { field, isSelected, bitsPerRow, onclick }: Props = $props();

	// フィールドの幅を計算（パーセンテージ）
	const widthPercent = $derived((field.bits / bitsPerRow) * 100);
</script>

<button
	type="button"
	{onclick}
	style="
		flex: 0 0 {widthPercent}%;
		padding: 0.5rem 0.25rem;
		border: 2px solid {isSelected ? field.color : 'var(--border)'};
		background: {isSelected ? field.color + '30' : field.color + '15'};
		cursor: pointer;
		transition: all 0.2s ease;
		text-align: center;
		min-height: 3.5rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.125rem;
	"
	title="{field.name} ({field.bits} bits)"
>
	<span
		style="font-size: 0.625rem; font-weight: 600; color: {field.color}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%;"
	>
		{field.name}
	</span>
	<span style="font-size: 0.5rem; color: var(--muted-foreground);">
		{field.bits}bit
	</span>
</button>

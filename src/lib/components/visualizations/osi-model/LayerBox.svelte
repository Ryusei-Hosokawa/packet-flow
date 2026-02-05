<script lang="ts">
	interface Props {
		number: number;
		name: string;
		nameJa: string;
		color: string;
		isSelected: boolean;
		isHighlighted: boolean;
		onclick: () => void;
	}

	let { number, name, nameJa, color, isSelected, isHighlighted, onclick }: Props = $props();
</script>

<button
	type="button"
	{onclick}
	style="
		display: flex;
		align-items: center;
		gap: 1rem;
		width: 100%;
		padding: 0.75rem 1rem;
		border: 2px solid {isSelected ? color : isHighlighted ? color + '80' : 'var(--border)'};
		border-radius: 0.5rem;
		background: {isSelected ? color + '20' : isHighlighted ? color + '10' : 'var(--card)'};
		cursor: pointer;
		transition: all 0.2s ease;
		text-align: left;
	"
>
	<span
		style="
			display: flex;
			align-items: center;
			justify-content: center;
			width: 2rem;
			height: 2rem;
			border-radius: 9999px;
			background: {color};
			color: white;
			font-weight: bold;
			font-size: 0.875rem;
		"
	>
		{number}
	</span>
	<div style="flex: 1; min-width: 0;">
		<div style="font-weight: 600; font-size: 0.875rem; color: var(--foreground);">
			{name}
		</div>
		<div style="font-size: 0.75rem; color: var(--muted-foreground);">
			{nameJa}
		</div>
	</div>
</button>

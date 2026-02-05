<script lang="ts">
	import type { HeaderField } from '$lib/types/packet';

	interface Props {
		field: HeaderField | null;
	}

	let { field }: Props = $props();
</script>

<div
	style="padding: 1.5rem; border: 1px solid var(--border); border-radius: 0.5rem; background: var(--card); min-height: 180px;"
>
	{#if !field}
		<div
			style="display: flex; align-items: center; justify-content: center; height: 100%; min-height: 130px; color: var(--muted-foreground);"
		>
			<p>フィールドをクリックして詳細を表示</p>
		</div>
	{:else}
		<div style="display: flex; flex-direction: column; gap: 1rem;">
			<!-- ヘッダ -->
			<div style="display: flex; align-items: center; gap: 0.75rem;">
				<span
					style="display: flex; align-items: center; justify-content: center; padding: 0.5rem 0.75rem; border-radius: 0.375rem; background: {field.color}20; color: {field.color}; font-weight: 600; font-size: 0.875rem;"
				>
					{field.bits} bits
				</span>
				<div>
					<h3 style="font-size: 1.125rem; font-weight: 600;">{field.name}</h3>
					<p style="font-size: 0.875rem; color: var(--muted-foreground);">{field.nameJa}</p>
				</div>
			</div>

			<!-- 説明 -->
			<p style="font-size: 0.875rem; color: var(--foreground); line-height: 1.6;">
				{field.description}
			</p>

			<!-- 詳細情報 -->
			<div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;">
				<div
					style="padding: 0.75rem; border-radius: 0.375rem; background: var(--muted);"
				>
					<h4
						style="font-size: 0.75rem; font-weight: 600; color: var(--muted-foreground); margin-bottom: 0.25rem;"
					>
						サイズ
					</h4>
					<p style="font-size: 0.875rem; font-family: monospace;">
						{field.bits} bits ({(field.bits / 8).toFixed(field.bits % 8 === 0 ? 0 : 1)} bytes)
					</p>
				</div>
				<div
					style="padding: 0.75rem; border-radius: 0.375rem; background: var(--muted);"
				>
					<h4
						style="font-size: 0.75rem; font-weight: 600; color: var(--muted-foreground); margin-bottom: 0.25rem;"
					>
						値の例
					</h4>
					<p style="font-size: 0.875rem; font-family: monospace;">
						{field.example}
					</p>
				</div>
			</div>
		</div>
	{/if}
</div>

<script lang="ts">
	import type { NetworkNode } from '$lib/stores/topologyStore.svelte';
	import Term from '$lib/components/ui/Term.svelte';

	interface Props {
		node: NetworkNode | null;
	}

	let { node }: Props = $props();

	function getNodeTypeName(type: NetworkNode['type']): string {
		switch (type) {
			case 'client':
				return 'クライアント';
			case 'server':
				return 'サーバー';
			case 'router':
				return 'ルーター';
			case 'switch':
				return 'L2スイッチ';
			case 'firewall':
				return 'ファイアウォール';
			case 'internet':
				return 'インターネット';
			default:
				return type;
		}
	}

	function getNodeDescription(type: NetworkNode['type']): string {
		switch (type) {
			case 'client':
				return 'ネットワークサービスを利用する端末。Webブラウザやアプリケーションでサーバーにリクエストを送信します。';
			case 'server':
				return 'クライアントからのリクエストを処理し、レスポンスを返すコンピュータ。Webサーバー、メールサーバーなど様々な種類があります。';
			case 'router':
				return '異なるネットワーク間でパケットを転送する機器。IPアドレスを見て最適な経路を選択します。';
			case 'switch':
				return '同一ネットワーク内でフレームを転送する機器。MACアドレスを学習して、必要なポートにのみデータを送信します。';
			case 'firewall':
				return 'ネットワークセキュリティを担う機器。許可されたトラフィックのみを通過させ、不正アクセスを遮断します。';
			case 'internet':
				return '世界中のネットワークが相互接続されたグローバルネットワーク。ISPを介してアクセスします。';
			default:
				return '';
		}
	}
</script>

{#if node}
	<div class="rounded-lg border border-border bg-card p-4">
		<div class="mb-3 flex items-center gap-3">
			<span class="text-2xl">
				{#if node.type === 'client'}💻
				{:else if node.type === 'server'}🖥️
				{:else if node.type === 'router'}🔀
				{:else if node.type === 'switch'}🔌
				{:else if node.type === 'firewall'}🛡️
				{:else if node.type === 'internet'}🌐
				{:else}📦{/if}
			</span>
			<div>
				<h3 class="font-bold">{node.label}</h3>
				<p class="text-sm text-muted-foreground">{getNodeTypeName(node.type)}</p>
			</div>
		</div>

		{#if node.ip}
			<div class="mb-3 rounded bg-muted px-3 py-2">
				<span class="text-xs text-muted-foreground"><Term id="ip-address">IPアドレス</Term>:</span>
				<span class="font-mono text-sm">{node.ip}</span>
			</div>
		{/if}

		<p class="text-sm text-muted-foreground">{getNodeDescription(node.type)}</p>
	</div>
{:else}
	<div class="rounded-lg border border-dashed border-border bg-background p-4 text-center text-muted-foreground">
		<p>ノードをクリックして詳細を表示</p>
	</div>
{/if}

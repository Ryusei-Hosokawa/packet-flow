<script lang="ts">
	import { handshakeStore } from '$lib/stores/handshakeStore.svelte';
	import EndpointBox from './EndpointBox.svelte';
	import PacketArrow from './PacketArrow.svelte';
	import ControlBar from './ControlBar.svelte';
	import PacketInfo from './PacketInfo.svelte';
</script>

<div class="space-y-8">
	<!-- メインビジュアル -->
	<div class="rounded-lg border border-border bg-card p-8">
		<div style="display: flex; flex-direction: row; align-items: center; justify-content: space-between; gap: 1rem;">
			<!-- Client -->
			<EndpointBox label="Client" step={handshakeStore.currentStep} />

			<!-- パケットの矢印エリア -->
			<div style="flex: 1;">
				{#key handshakeStore.currentStep}
					<PacketArrow step={handshakeStore.currentStep} />
				{/key}
			</div>

			<!-- Server -->
			<EndpointBox label="Server" step={handshakeStore.currentStep} />
		</div>
	</div>

	<!-- コントロールバー -->
	<ControlBar />

	<!-- パケット情報パネル -->
	<PacketInfo step={handshakeStore.currentStep} />
</div>

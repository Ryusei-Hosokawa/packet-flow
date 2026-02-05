<script lang="ts">
	import { handshakeStore } from '$lib/stores/handshakeStore.svelte';
	import EndpointBox from './EndpointBox.svelte';
	import PacketArrow from './PacketArrow.svelte';
	import ControlBar from './ControlBar.svelte';
	import PacketInfo from './PacketInfo.svelte';
</script>

<div class="space-y-6">
	<!-- メインビジュアル -->
	<div class="rounded-lg border border-border bg-card p-4 sm:p-6 md:p-8">
		<div class="flex items-center justify-between flex-row gap-4">
			<!-- Client -->
			<EndpointBox label="Client" step={handshakeStore.currentStep} />

			<!-- パケットの矢印エリア -->
			<div class="w-full flex-1 sm:w-auto">
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

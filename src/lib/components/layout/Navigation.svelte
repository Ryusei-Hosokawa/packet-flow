<script lang="ts">
	import { page } from '$app/stores';
	import ThemeToggle from './ThemeToggle.svelte';

	const navItems = [
		{ href: '/', label: 'Home' },
		{ href: '/handshake', label: 'Handshake' },
		{ href: '/osi-model', label: 'OSI Model' },
		{ href: '/packet-structure', label: 'Packet' },
		{ href: '/encapsulation', label: 'Encapsulation' },
		{ href: '/tcp-vs-udp', label: 'TCP/UDP' }
	];

	let isMenuOpen = $state(false);

	function toggleMenu() {
		isMenuOpen = !isMenuOpen;
	}

	function closeMenu() {
		isMenuOpen = false;
	}

	// メニューが開いている時にスクロールを禁止
	$effect(() => {
		if (isMenuOpen) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = '';
		}

		return () => {
			document.body.style.overflow = '';
		};
	});
</script>

<!-- 曇りガラス風オーバーレイ -->
{#if isMenuOpen}
	<button
		type="button"
		class="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm transition-opacity duration-300 md:hidden"
		onclick={closeMenu}
		aria-label="メニューを閉じる"
	></button>
{/if}

<!-- フローティングナビゲーション -->
<nav class="fixed left-1/2 top-4 z-50 mx-auto my-4 w-[90%] max-w-4xl -translate-x-1/2">
	<div
		class="overflow-hidden rounded-[20px] border border-border bg-card shadow-lg backdrop-blur-sm transition-all duration-300"
	>
		<!-- メインナビバー -->
		<div class="flex items-center justify-between px-4 py-3 md:px-6">
			<!-- ロゴ -->
			<a href="/" class="flex items-center gap-2 text-lg font-bold text-foreground no-underline">
				<span
					class="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-xs font-bold text-background"
				>
					PF
				</span>
				<span class="hidden md:block">PacketFlow</span>
			</a>

			<!-- デスクトップナビ -->
			<div class="hidden items-center gap-1 md:flex">
				{#each navItems.slice(1) as item}
					<a
						href={item.href}
						class="rounded-full px-3.5 py-2 text-sm font-medium transition-all duration-200 {$page
							.url.pathname === item.href
							? 'bg-accent text-primary'
							: 'text-muted-foreground hover:bg-accent hover:text-foreground'}"
					>
						{item.label}
					</a>
				{/each}
				<div class="ml-2">
					<ThemeToggle />
				</div>
			</div>

			<!-- モバイル: テーマ切り替え + メニューボタン -->
			<div class="flex items-center gap-2 md:hidden">
				<ThemeToggle />
				<button
					type="button"
					class="flex h-10 w-12 flex-col items-center justify-center gap-1.5 border-none bg-transparent"
					onclick={toggleMenu}
					aria-label="メニューを開く"
					aria-expanded={isMenuOpen}
				>
				<span
					class="block h-0.5 w-10 origin-center bg-foreground transition-all duration-300 {isMenuOpen
						? 'translate-y-2 rotate-45'
						: ''}"
				></span>
				<span
					class="block h-0.5 w-10 bg-foreground transition-all duration-300 {isMenuOpen
						? 'scale-x-0 opacity-0'
						: ''}"
				></span>
				<span
					class="block h-0.5 w-10 origin-center bg-foreground transition-all duration-300 {isMenuOpen
						? '-translate-y-2 -rotate-45'
						: ''}"
				></span>
			</button>
			</div>
		</div>

		<!-- モバイルメニュー -->
		<div
			class="overflow-hidden transition-all duration-300 md:hidden {isMenuOpen
				? 'max-h-96'
				: 'max-h-0'}"
		>
			<div class="mt-2 flex flex-col gap-1 border-t border-border px-3 pb-3 pt-3">
				{#each navItems as item}
					<a
						href={item.href}
						onclick={closeMenu}
						class="rounded-lg px-4 py-3 text-sm font-medium transition-colors duration-200 {$page
							.url.pathname === item.href
							? 'bg-accent text-primary'
							: 'text-foreground hover:bg-accent'}"
					>
						{item.label}
					</a>
				{/each}
			</div>
		</div>
	</div>
</nav>

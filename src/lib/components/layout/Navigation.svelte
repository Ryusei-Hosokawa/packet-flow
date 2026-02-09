<script lang="ts">
  import { page } from "$app/stores";
  import ThemeToggle from "./ThemeToggle.svelte";

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/handshake", label: "Handshake" },
    { href: "/osi-model", label: "OSI Model" },
    { href: "/packet-structure", label: "Packet" },
    { href: "/encapsulation", label: "Encapsulation" },
    { href: "/tcp-vs-udp", label: "TCP/UDP" },
    { href: "/congestion-control", label: "Congestion" },
    { href: "/packet-loss", label: "Packet Loss" },
    { href: "/network-topology", label: "Topology" },
    { href: "/websocket-demo", label: "WebSocket" },
    { href: "/tools/ping", label: "Ping" },
    { href: "/tools/traceroute", label: "Traceroute" },
    { href: "/tools/dns", label: "DNS" },
    { href: "/tools/network-info", label: "Network" },
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
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  });
</script>

<!-- 曇りガラス風オーバーレイ -->
{#if isMenuOpen}
  <button
    type="button"
    class="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm transition-opacity delay-75 duration-300"
    onclick={closeMenu}
    aria-label="メニューを閉じる"
  ></button>
{/if}

<!-- フローティングナビゲーション -->
<header class="fixed left-1/2 top-4 z-50 mx-auto my-4 w-full max-w-6xl px-5 -translate-x-1/2">
  <nav>
    <div
      class="overflow-hidden rounded-[20px] border border-border bg-card shadow-lg backdrop-blur-sm transition-all duration-300"
			style="max-height: {isMenuOpen ? '100%' : '76px'}"
    >
      <!-- メインナビバー -->
      <div class="flex items-center justify-between px-6 py-4">
        <!-- ロゴ -->
        <a
          href="/"
          class="flex items-center gap-2 text-lg font-bold text-foreground no-underline"
        >
          <span
            class="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-xs font-bold text-background"
          >
            PF
          </span>
          <span>PacketFlow</span>
        </a>

        <!-- テーマ切り替え + メニューボタン -->
        <div class="flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            class="flex h-10 w-12 flex-col items-center justify-center gap-1.5 border-none bg-transparent"
            onclick={toggleMenu}
            aria-label={isMenuOpen ? "メニューを閉じる" : "メニューを開く"}
            aria-expanded={isMenuOpen}
          >
            <span
              class="block h-0.5 w-8 origin-center bg-foreground transition-all duration-300 {isMenuOpen
                ? 'translate-y-2 rotate-45'
                : ''}"
            ></span>
            <span
              class="block h-0.5 w-8 bg-foreground transition-all duration-300 {isMenuOpen
                ? 'scale-x-0 opacity-0'
                : ''}"
            ></span>
            <span
              class="block h-0.5 w-8 origin-center bg-foreground transition-all duration-300 {isMenuOpen
                ? '-translate-y-2 -rotate-45'
                : ''}"
            ></span>
          </button>
        </div>
      </div>

      <!-- ドロップダウンメニュー -->
      <div
        class="grid transition-[grid-template-rows] duration-300"
        style="
					grid-template-rows: {isMenuOpen ? '1fr' : '0fr'}
				"
      >
        <div class="flex flex-col gap-1 overflow-hidden px-3 pb-4">
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
</header>

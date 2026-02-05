 PacketFlow - Project Context for Claude Code

## プロジェクト概要

**PacketFlow** は、TCP/IPプロトコルの学習を目的としたインタラクティブ可視化ツールです。

### 背景と目的
「マスタリングTCP/IP」を読んで理論を学んだ後、実際に手を動かして概念を深く理解するために開発します。

学習した内容をインタラクティブなWebアプリケーションとしてアウトプットすることで：
1. TCP/IPの理解を深める
2. フロントエンドエンジニアとしてのポートフォリオになる
3. 他の学習者にも役立つツールとして公開できる

### 開発者のコンテキスト
- フロントエンドエンジニア（3年経験）
- HTML/CSS/SCSS/JavaScript/PHP/WordPress経験あり
- TypeScript、SvelteKitを学習中
- TCP/IPの基礎理論は学習済み、実践的な理解を深めたい段階

---

## 技術スタック

### フロントエンド
| 技術 | バージョン | 用途 |
|------|-----------|------|
| SvelteKit | 最新安定版 | フレームワーク |
| TypeScript | 5.x | 型安全な開発 |
| Tailwind CSS | 3.x | スタイリング |
| shadcn-svelte | 最新 | UIコンポーネント |
| Svelte Motion (tweened/spring) | 内蔵 | アニメーション |
| D3.js | 7.x | 複雑なグラフ描画（Phase 3） |

### バックエンド
| 技術 | 用途 |
|------|------|
| Bun | ランタイム（Node.jsの代替として選択） |
| Bun.serve | HTTP + WebSocketサーバー |
| Bun.spawn | システムコマンド実行（ping, traceroute） |
| net module | 生TCPソケット実験用 |

### Bunを選択した理由
1. WebSocketがビルトイン（追加パッケージ不要）
2. TypeScriptをネイティブ実行可能（設定不要）
3. 起動・実行が高速で開発効率が良い
4. TCP/IP学習という本質に集中できるシンプルさ

### 開発ツール
- Biome（Linter/Formatter）
- Vitest（テスト）
- Storybook（コンポーネントカタログ、オプション）

---

## 開発フェーズ

### Phase 1: 純粋フロントエンド（教育コンテンツ）
**目標**: バックエンドなしで動作する教育的な可視化コンテンツ

実装する機能：
- [ ] OSI参照モデル / TCP-IPモデルの図解
- [ ] 3ウェイハンドシェイクのアニメーション
- [ ] パケット構造（IP/TCP/UDPヘッダ）のインタラクティブ図解
- [ ] TCP vs UDP の比較デモ
- [ ] カプセル化/非カプセル化の可視化

### Phase 2: バックエンド連携（実データ取得）
**目標**: 実際のネットワーク情報を取得して表示

実装する機能：
- [ ] リアルタイムping実行と結果表示
- [ ] tracerouteの可視化
- [ ] 自分のネットワーク情報表示（IP、インターフェース）
- [ ] DNS解決の可視化

### Phase 3: 発展機能
**目標**: より高度な可視化と教育コンテンツ

実装する機能：
- [ ] ネットワークトポロジーの可視化（D3.js）
- [ ] パケットロスのシミュレーション
- [ ] 輻輳制御（スロースタート等）の説明アニメーション
- [ ] WebSocketを使ったリアルタイム通信デモ

---

## ディレクトリ構成
```
packet-flow/
├── src/
│   ├── lib/
│   │   ├── components/
│   │   │   ├── ui/                    # 汎用UIコンポーネント
│   │   │   ├── visualizations/        # 可視化コンポーネント
│   │   │   │   ├── handshake/         # 3ウェイハンドシェイク
│   │   │   │   ├── packet/            # パケット構造
│   │   │   │   ├── osi-model/         # OSIモデル図解
│   │   │   │   ├── routing/           # ルーティング
│   │   │   │   └── comparison/        # TCP vs UDP比較
│   │   │   └── layout/                # レイアウトコンポーネント
│   │   ├── stores/                    # Svelte stores
│   │   ├── types/                     # TypeScript型定義
│   │   │   ├── packet.ts              # パケット関連の型
│   │   │   ├── network.ts             # ネットワーク関連の型
│   │   │   └── animation.ts           # アニメーション関連の型
│   │   ├── utils/                     # ユーティリティ関数
│   │   └── constants/                 # 定数定義
│   ├── routes/
│   │   ├── +page.svelte               # トップページ
│   │   ├── +layout.svelte             # 共通レイアウト
│   │   ├── handshake/                 # 3ウェイハンドシェイク
│   │   ├── packet-structure/          # パケット構造
│   │   ├── osi-model/                 # OSIモデル
│   │   ├── tcp-vs-udp/                # TCP vs UDP比較
│   │   └── tools/                     # 実用ツール（Phase 2）
│   │       ├── ping/
│   │       └── traceroute/
│   └── app.html
├── server/                            # バックエンド（Phase 2）
│   ├── index.ts                       # エントリーポイント
│   ├── websocket.ts                   # WebSocket処理
│   └── commands/                      # システムコマンド実行
│       ├── ping.ts
│       └── traceroute.ts
├── static/
├── tests/
├── CLAUDE.md                          # このファイル
├── package.json
├── svelte.config.js
├── tailwind.config.js
├── tsconfig.json
└── bunfig.toml
```

---

## コーディング規約

### TypeScript
- 厳格な型定義を使用（`strict: true`）
- `any`の使用を避け、適切な型を定義
- インターフェースは`I`プレフィックスを付けない
- 型定義は`src/lib/types/`に集約
```typescript
// Good
interface PacketHeader {
  sourcePort: number;
  destPort: number;
}

// Bad
interface IPacketHeader { ... }
type PacketHeader = any;
```

### Svelteコンポーネント
- 1コンポーネント1ファイル
- コンポーネント名はPascalCase
- propsは明示的に型定義
- Svelte 5のRunes記法（$props, $state）を使用
```svelte
<script lang="ts">
  interface Props {
    title: string;
    isActive?: boolean;
  }
  
  let { title, isActive = false }: Props = $props();
</script>
```

### スタイリング
- Tailwind CSSを基本とする
- **コンポーネント作成時は特別な理由がない限り、常にTailwind CSSでスタイル指定を行う**
- インラインスタイル（style属性）やCSS/SCSSの使用は、Tailwindで表現できない場合のみ許可
- 複雑なアニメーションはSvelte transitionsまたはCSS
- カスタムプロパティ（CSS変数）は`--pf-`プレフィックス（PacketFlowの略）

### ファイル命名
- コンポーネント: `PascalCase.svelte`
- ユーティリティ: `camelCase.ts`
- 型定義: `camelCase.ts`
- 定数: `SCREAMING_SNAKE_CASE`

---

## 型定義の例
```typescript
// src/lib/types/packet.ts

export interface TCPHeader {
  sourcePort: number;        // 16bit (0-65535)
  destPort: number;          // 16bit
  sequenceNumber: number;    // 32bit
  ackNumber: number;         // 32bit
  dataOffset: number;        // 4bit
  flags: TCPFlags;
  windowSize: number;        // 16bit
  checksum: number;          // 16bit
  urgentPointer: number;     // 16bit
}

export interface TCPFlags {
  URG: boolean;
  ACK: boolean;
  PSH: boolean;
  RST: boolean;
  SYN: boolean;
  FIN: boolean;
}

export interface IPHeader {
  version: 4 | 6;
  headerLength: number;
  totalLength: number;
  ttl: number;
  protocol: 'TCP' | 'UDP' | 'ICMP';
  sourceIP: string;
  destIP: string;
}

// src/lib/types/animation.ts

export type HandshakeStep = 
  | 'idle'
  | 'syn-sent'
  | 'syn-received'
  | 'ack-sent'
  | 'established';

export interface AnimationState {
  currentStep: HandshakeStep;
  isPlaying: boolean;
  speed: number; // 1 = normal, 0.5 = slow, 2 = fast
}
```

---

## 重要な実装ノート

### 3ウェイハンドシェイクのアニメーション
- 各ステップを明確に分離し、ユーザーが理解しやすいよう段階的に表示
- 「再生」「一時停止」「ステップ実行」の制御を提供
- パケットの中身（シーケンス番号、フラグ）も表示

### パケット構造の可視化
- 各フィールドをホバー/クリックで詳細説明を表示
- ビット/バイト単位のサイズを視覚的に表現
- 実際の値の例を表示可能に

### バックエンド（Phase 2）
- WebSocketは`Bun.serve`の組み込み機能を使用
- システムコマンドは`Bun.spawn`で実行
- セキュリティ: ユーザー入力のサニタイズ必須（コマンドインジェクション対策）
```typescript
// BAD: コマンドインジェクションの危険
Bun.spawn(['ping', userInput]);

// GOOD: バリデーション済み
const isValidHost = /^[a-zA-Z0-9.-]+$/.test(host);
if (isValidHost) {
  Bun.spawn(['ping', '-c', '4', host]);
}
```

---

## 参考リソース

### TCP/IP
- マスタリングTCP/IP 入門編
- RFC 793 (TCP), RFC 768 (UDP), RFC 791 (IP)

### 技術ドキュメント
- [SvelteKit Docs](https://kit.svelte.dev/docs)
- [Bun Docs](https://bun.sh/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn-svelte](https://www.shadcn-svelte.com/)

---

## セットアップ手順
```bash
# プロジェクト作成
bun create svelte@latest packet-flow
cd packet-flow

# Tailwind CSS セットアップ
bun add -d tailwindcss postcss autoprefixer
bunx tailwindcss init -p

# shadcn-svelte セットアップ
bunx shadcn-svelte@latest init

# Biome（Linter/Formatter）
bun add -d @biomejs/biome
bunx @biomejs/biome init

# 開発サーバー起動
bun run dev
```

---

## 次のアクション

1. [x] プロジェクト名決定: **PacketFlow**
2. [ ] プロジェクトの初期セットアップ
3. [ ] 基本的なディレクトリ構造の作成
4. [ ] Phase 1の最初の機能「3ウェイハンドシェイクのアニメーション」から実装開始

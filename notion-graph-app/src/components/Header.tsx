import Link from 'next/link';
import Container from './Container'; // ★ レイアウト用のContainerをインポート

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-black">
      {/* ★ Containerコンポーネントで囲む */}
      <Container>
        <div className="flex h-16 items-center">
          <Link href="/" className="text-xl font-bold tracking-tight text-white">
            Notion Knowledge Graph
          </Link>
        </div>
      </Container>
    </header>
  );
}
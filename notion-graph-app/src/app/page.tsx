import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { SignInButton, SignOutButton } from "@/components/auth-buttons";

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-900 text-white">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-8">Notion Knowledge Graph</h1>
        
        {session ? (
          <div>
            <p className="mb-4">ようこそ, {session.user?.name} さん</p>
            <SignOutButton />
          </div>
        ) : (
          <div>
            <p className="mb-4">ログインしてください</p>
            <SignInButton />
          </div>
        )}
      </div>
    </main>
  );
}
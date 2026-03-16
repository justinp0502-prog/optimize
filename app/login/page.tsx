import Link from "next/link";
import { loginUser } from "@/lib/auth-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="mx-auto flex min-h-screen max-w-md items-center px-4 py-10">
      <Card className="w-full">
        <CardHeader>
          <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Optimize</p>
          <CardTitle className="text-3xl">Sign in</CardTitle>
          <CardDescription>Use your account to open your own plans, meals, reflections, and progress.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={loginUser} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            {params?.error ? <p className="text-sm text-red-700">{params.error}</p> : null}
            <Button className="w-full">Sign in</Button>
          </form>
          <p className="mt-4 text-sm text-muted-foreground">
            Need an account? <Link href="/signup" className="text-foreground underline">Create one</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

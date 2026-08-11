"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Lock } from "lucide-react"

export default function AdminLogin() {
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })

      const data = await res.json()

      if (res.ok) {
        router.push("/admin")
        router.refresh()
      } else {
        setError(data.error || "Invalid password")
      }
    } catch {
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fafafa] px-4">
      <Card className="w-full max-w-md rounded-none border-neutral-200 bg-white shadow-none">
        <CardHeader className="space-y-1">
          <div className="mb-4 flex items-center justify-center">
            <div className="rounded-none border border-neutral-200 bg-neutral-50 p-3">
              <Lock className="h-6 w-6 text-neutral-900" />
            </div>
          </div>
          <CardTitle className="text-center font-nike-display text-2xl uppercase tracking-[0.06em] text-black">
            Admin
          </CardTitle>
          <CardDescription className="text-center font-nike text-neutral-500">
            Enter your password to access the dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="font-nike text-neutral-800">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-none border-neutral-300 bg-white text-neutral-900"
                placeholder="Enter admin password"
                required
              />
            </div>
            {error && (
              <div className="rounded-none border border-red-200 bg-red-50 p-2 font-nike text-sm text-red-700">
                {error}
              </div>
            )}
            <Button
              type="submit"
              disabled={loading}
              className="w-full rounded-none bg-neutral-900 font-nike uppercase tracking-[0.14em] text-white hover:bg-neutral-800"
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

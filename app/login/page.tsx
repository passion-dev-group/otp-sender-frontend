"use client"

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
  const [secretKey, setSecretKey] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simple form submission without authentication logic
    console.log('Secret key submitted:', secretKey)
    
    // Simulate processing delay
    setTimeout(() => {
      setIsLoading(false)
      // Reset form
      setSecretKey('')
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Login</CardTitle>
          <CardDescription className="text-center">
            Enter your secret key to access the dashboard
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="secret-key">Secret Key</Label>
              <Input
                id="secret-key"
                type="password"
                placeholder="Enter your secret key"
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                required
              />
              <p className="text-sm text-muted-foreground">
                Hint: The secret key is <span className="font-mono">secret123</span>
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? 'Processing...' : 'Submit'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
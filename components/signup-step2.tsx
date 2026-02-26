"use client"

import { useState, ChangeEvent } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface SignupStep2Props {
  onSignup: (fullName: string, avatar: string) => void
  onSkip: () => void
}

export function SignupStep2({ onSignup, onSkip }: SignupStep2Props) {
  const [fullName, setFullName] = useState('')
  const [avatar, setAvatar] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSignup(fullName, avatar)
  }

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result
        if (typeof result === 'string') {
          setAvatar(result)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="fullName"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="avatar">Profile Picture</Label>
        <Input
          id="avatar"
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
        />
      </div>
      {avatar && (
        <div className="w-24 h-24 mx-auto rounded-full overflow-hidden">
          <img
            src={avatar}
            alt="Avatar preview"
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onSkip}>
          Skip
        </Button>
        <Button type="submit">Complete Signup</Button>
      </div>
    </form>
  )
}

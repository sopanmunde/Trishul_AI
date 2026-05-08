"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function UserProfileModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    if (isOpen) {
      fetchUserProfile()
    } else {
      // Reset state when closed
      setError("")
      setSuccess("")
    }
  }, [isOpen])

  const fetchUserProfile = async () => {
    setIsLoading(true)
    setError("")
    try {
      const token = localStorage.getItem("token")
      const res = await fetch("http://localhost:8000/api/me", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      if (!res.ok) throw new Error("Failed to fetch profile")
      
      const data = await res.json()
      setFormData({
        first_name: data.first_name || "",
        last_name: data.last_name || "",
        username: data.username || "",
        email: data.email || "",
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSaving(true)
    setError("")
    setSuccess("")

    try {
      const token = localStorage.getItem("token")
      const res = await fetch("http://localhost:8000/api/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          first_name: formData.first_name,
          last_name: formData.last_name,
          username: formData.username
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.detail || "Failed to update profile")
      }
      
      setSuccess("Profile updated successfully")
      // Update local storage or global state if username changes, or trigger a re-fetch in parent
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-zinc-950 border-zinc-800 text-white">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Make changes to your profile here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        
        {isLoading ? (
          <div className="py-6 flex justify-center">
            <span className="text-zinc-400">Loading profile...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            {error && <div className="text-red-400 text-sm bg-red-500/10 p-2 rounded">{error}</div>}
            {success && <div className="text-emerald-400 text-sm bg-emerald-500/10 p-2 rounded">{success}</div>}
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="first_name" className="text-right text-zinc-300">
                First Name
              </Label>
              <Input
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className="col-span-3 bg-zinc-900 border-zinc-800 focus:border-[#e78a53]"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="last_name" className="text-right text-zinc-300">
                Last Name
              </Label>
              <Input
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className="col-span-3 bg-zinc-900 border-zinc-800 focus:border-[#e78a53]"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right text-zinc-300">
                Username
              </Label>
              <Input
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="col-span-3 bg-zinc-900 border-zinc-800 focus:border-[#e78a53]"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right text-zinc-300">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                value={formData.email}
                disabled
                className="col-span-3 bg-zinc-900/50 border-zinc-800 text-zinc-500 cursor-not-allowed"
                title="Email cannot be changed"
              />
            </div>

            <DialogFooter className="mt-6">
              <Button 
                type="submit" 
                disabled={isSaving}
                className="bg-[#e78a53] hover:bg-[#e78a53]/90 text-white"
              >
                {isSaving ? "Saving..." : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

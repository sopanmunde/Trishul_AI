'use client'

import { useState } from "react"
import { UserProfileModal } from "@/components/UserProfileModal"

export default function Setting() {
    const [isOpen, setIsOpen] = useState(true)

    return (
        <div>
            <UserProfileModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
            />
        </div>
    )
}
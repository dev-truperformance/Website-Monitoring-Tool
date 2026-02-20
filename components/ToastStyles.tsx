"use client"

import { useEffect } from 'react'

export default function ToastStyles() {
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      [data-sonner-toast][data-type="success"] {
        background: hsl(142, 76%, 36%) !important;
        color: hsl(0, 0%, 98%) !important;
        border: 1px solid hsl(142, 76%, 45%) !important;
      }
      [data-sonner-toast][data-type="error"] {
        background: hsl(0, 84%, 60%) !important;
        color: hsl(0, 0%, 98%) !important;
        border: 1px solid hsl(0, 84%, 65%) !important;
      }
    `
    document.head.appendChild(style)
    
    return () => {
      document.head.removeChild(style)
    }
  }, [])

  return null
}

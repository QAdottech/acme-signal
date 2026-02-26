"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { getFileFromLocalStorage } from "@/lib/fileUtils"

interface OrganizationImageProps {
  src: string
  alt: string
  className?: string
  width?: number
  height?: number
  fill?: boolean
  objectFit?: "contain" | "cover" | "fill" | "none" | "scale-down"
}

export function OrganizationImage({
  src,
  alt,
  className = "",
  width = 40,
  height = 40,
  fill = false,
  objectFit = "cover",
}: OrganizationImageProps) {
  const [imageSrc, setImageSrc] = useState("/placeholder.svg")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadImage = () => {
      if (!src) {
        setImageSrc("/placeholder.svg")
        setIsLoading(false)
        return
      }

      // Check if it's a custom uploaded file (contains timestamp pattern)
      if (src.startsWith("/logos/") && /\d{13}-[a-z0-9]+\./i.test(src)) {
        const storedFile = getFileFromLocalStorage(src)
        if (storedFile) {
          setImageSrc(storedFile)
        } else {
          console.warn(`Uploaded file not found in localStorage: ${src}`)
          setImageSrc("/placeholder.svg")
        }
      } else {
        // It's either a placeholder URL or external URL
        setImageSrc(src)
      }
      setIsLoading(false)
    }

    loadImage()
  }, [src])

  if (isLoading) {
    return <div className={`bg-gray-200 animate-pulse rounded ${className}`} style={fill ? {} : { width, height }} />
  }

  if (fill) {
    return (
      <Image
        src={imageSrc || "/placeholder.svg"}
        alt={alt}
        fill
        style={{ objectFit }}
        className={className}
        onError={() => setImageSrc("/placeholder.svg")}
      />
    )
  }

  return (
    <Image
      src={imageSrc || "/placeholder.svg"}
      alt={alt}
      width={width}
      height={height}
      style={{ objectFit }}
      className={className}
      onError={() => setImageSrc("/placeholder.svg")}
    />
  )
}

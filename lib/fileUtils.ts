export function generateUniqueFileName(originalName: string): string {
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 15)
  const extension = originalName.split(".").pop()
  return `${timestamp}-${randomString}.${extension}`
}

export function convertFileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function saveFileToLocalStorage(fileName: string, dataUrl: string): void {
  try {
    const storedFiles = JSON.parse(localStorage.getItem("uploadedFiles") || "{}")
    storedFiles[fileName] = dataUrl
    localStorage.setItem("uploadedFiles", JSON.stringify(storedFiles))
    console.log(`File saved to localStorage: ${fileName}`)
  } catch (error) {
    console.error("Error saving file to localStorage:", error)
  }
}

export function getFileFromLocalStorage(fileName: string): string | null {
  try {
    const storedFiles = JSON.parse(localStorage.getItem("uploadedFiles") || "{}")
    const file = storedFiles[fileName] || null
    if (file) {
      console.log(`File retrieved from localStorage: ${fileName}`)
    } else {
      console.warn(`File not found in localStorage: ${fileName}`)
    }
    return file
  } catch (error) {
    console.error("Error retrieving file from localStorage:", error)
    return null
  }
}

export function deleteFileFromLocalStorage(fileName: string): void {
  try {
    const storedFiles = JSON.parse(localStorage.getItem("uploadedFiles") || "{}")
    delete storedFiles[fileName]
    localStorage.setItem("uploadedFiles", JSON.stringify(storedFiles))
    console.log(`File deleted from localStorage: ${fileName}`)
  } catch (error) {
    console.error("Error deleting file from localStorage:", error)
  }
}

// Debug utility to see all stored files
export function listStoredFiles(): Record<string, string> {
  try {
    const storedFiles = JSON.parse(localStorage.getItem("uploadedFiles") || "{}")
    console.log("All stored files:", Object.keys(storedFiles))
    return storedFiles
  } catch (error) {
    console.error("Error listing stored files:", error)
    return {}
  }
}

// Utility to get storage usage
export function getStorageUsage(): { used: number; total: number; percentage: number } {
  try {
    const total = 5 * 1024 * 1024 // 5MB typical localStorage limit
    const used = new Blob([localStorage.getItem("uploadedFiles") || ""]).size
    const percentage = (used / total) * 100

    console.log(
      `localStorage usage: ${(used / 1024 / 1024).toFixed(2)}MB / ${(total / 1024 / 1024).toFixed(2)}MB (${percentage.toFixed(1)}%)`,
    )

    return { used, total, percentage }
  } catch (error) {
    console.error("Error calculating storage usage:", error)
    return { used: 0, total: 0, percentage: 0 }
  }
}

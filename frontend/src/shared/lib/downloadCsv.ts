/**
 * Downloads a Blob as a CSV file using a temporary <a> element.
 * Creates an object URL, triggers download, and revokes the URL.
 */
export function downloadCsv(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

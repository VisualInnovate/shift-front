import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'

export const downloadFile = async (
  url: string,
  fileNameFormat?: string,
  options: AxiosRequestConfig = {}
): Promise<boolean> => {
  try {
    const response: AxiosResponse<Blob> = await axios.get(url, {
      responseType: 'blob',
      ...options
    })

    let fileName: string = fileNameFormat || 'file'

    const contentDisposition = response.headers['content-disposition'] as string | undefined

    if (contentDisposition) {
      const fileNameMatch = contentDisposition.match(
        /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
      )
      if (fileNameMatch && fileNameMatch[1]) {
        fileName = fileNameMatch[1].replace(/['"]/g, '')
      }
    }

    const contentType = response.headers['content-type'] as string | undefined

    if (!fileName.includes('.') && contentType) {
      if (contentType.includes('spreadsheet')) fileName += '.xlsx'
      else if (contentType.includes('pdf')) fileName += '.pdf'
      else if (contentType.includes('csv')) fileName += '.csv'
    }

    const blob = new Blob([response.data], { type: contentType })
    const urlBlob = window.URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = urlBlob
    link.setAttribute('download', fileName)

    document.body.appendChild(link)
    link.click()

    link.remove()
    window.URL.revokeObjectURL(urlBlob)

    return true
  } catch (error: any) {
    if (error.response?.data instanceof Blob) {
      const text = await error.response.data.text()
      try {
        const json = JSON.parse(text)
        console.error('Download error:', json)
      } catch {
        console.error('Download error:', text)
      }
    } else {
      console.error('Download error:', error)
    }

    throw error
  }
}

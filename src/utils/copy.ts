export const copyToClip = (text: string) => {
  return new Promise((resolve, reject) => {
    try {
      const input: HTMLTextAreaElement = document.createElement('textarea')
      input.setAttribute('readonly', 'readonly')
      input.value = text
      input.style.zIndex = '-1'
      document.body.appendChild(input)
      input.select()
      if (document.execCommand('copy')) document.execCommand('copy')
      document.body.removeChild(input)
      resolve(text)
    } catch (error) {
      reject(error)
    }
  })
}

export const handleCopyImg = (imgUrl: string) => {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  const img = new Image()
  img.crossOrigin = 'Anonymous'
  img.src = imgUrl
  img.onload = () => {
    if (!ctx) return
    canvas.width = img.width
    canvas.height = img.height
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    ctx.drawImage(img, 0, 0) // 将canvas转为blob
    canvas.toBlob(async (blob) => {
      if (!blob) return
      const data = [new ClipboardItem({ [blob.type]: blob })] // https://w3c.github.io/clipboard-apis/#dom-clipboard-write
      try {
        await navigator.clipboard.write(data)
        // console.log('Copied to clipboard successfully!')
      } catch (error) {
        // console.error('Unable to write to clipboard.')
      } finally {
        canvas.remove()
      }
    })
  }
}

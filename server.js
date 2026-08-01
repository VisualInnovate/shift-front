const fs = require('fs')
const path = require('path')
const express = require('express')
const axios = require('axios')
const { createServer: createViteServer } = require('vite')

const root = process.cwd()
const isProd = process.env.NODE_ENV === 'production'
const apiBase = process.env.VITE_URI || 'http://localhost:8000'
const templatePath = path.resolve(root, 'index.html')

const escapeHtml = (value) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')

const replaceMeta = (html, tag, attr, value) => {
  const regex = new RegExp(`<meta[^>]+${attr}="${tag}"[^>]*>`, 'i')
  const replacement = `<meta ${attr}="${tag}" content="${escapeHtml(value)}">`
  if (regex.test(html)) {
    return html.replace(regex, replacement)
  }
  return html.replace('</head>', `  ${replacement}\n</head>`)
}

const replaceTitle = (html, title) => {
  const escapedTitle = escapeHtml(title)
  if (/<title>.*<\/title>/i.test(html)) {
    return html.replace(/<title>.*<\/title>/i, `<title>${escapedTitle}</title>`)
  }
  return html.replace('</head>', `  <title>${escapedTitle}</title>\n</head>`)
}

const makeAbsoluteImage = (value) => {
  if (!value) return null
  if (value.startsWith('http://') || value.startsWith('https://')) return value
  if (value.startsWith('//')) return `https:${value}`
  if (value.startsWith('/')) return `https://shift7store.com${value}`
  return `https://shift7store.com/${value}`
}

const injectProductMeta = async (html, product, pageUrl) => {
  const title = product.name_en || product.name_ar || 'Shift7'
  const description =
    product.description_en || product.description_ar || product.sub_name_en || product.sub_name_ar || title
  const imageSource =
    product.key_default_image ||
    product.media?.find((m) => m.name === 'product_main_image')?.url ||
    product.media?.[0]?.url ||
    'https://shift7store.com/og-image.png'
  const image = makeAbsoluteImage(imageSource)
  const url = pageUrl

  let result = html
  result = replaceTitle(result, `${title} | Shift7`)
  result = replaceMeta(result, 'description', 'name', description)
  result = replaceMeta(result, 'og:url', 'property', url)
  result = replaceMeta(result, 'og:title', 'property', title)
  result = replaceMeta(result, 'og:description', 'property', description)
  result = replaceMeta(result, 'og:image', 'property', image)
  result = replaceMeta(result, 'og:type', 'property', 'product')
  result = replaceMeta(result, 'twitter:title', 'name', title)
  result = replaceMeta(result, 'twitter:description', 'name', description)
  result = replaceMeta(result, 'twitter:image', 'name', image)

  return result
}

const createApp = async () => {
  const app = express()
  let vite

  const getTemplate = async (url) => {
    let template = fs.readFileSync(templatePath, 'utf-8')
    if (!isProd && vite) {
      template = await vite.transformIndexHtml(url, template)
    }
    return template
  }

  const renderProductPage = async (req, res) => {
    try {
      const template = await getTemplate(req.originalUrl)
      const host = req.protocol + '://' + req.get('host')
      const pageUrl = host + req.originalUrl
      const response = await axios.get(`${apiBase}/api/home/product-details/${req.params.id}`)
      const data = response.data
      if (!data?.is_success || !data.data?.product) {
        return res.status(404).send(template)
      }
      const html = await injectProductMeta(template, data.data.product, pageUrl)
      res.set('Content-Type', 'text/html')
      res.status(200).send(html)
    } catch (error) {
      console.error('Product meta injection failed:', error.message)
      const template = await getTemplate(req.originalUrl)
      res.status(200).send(template)
    }
  }

  if (!isProd) {
    vite = await createViteServer({
      root,
      server: {
        middlewareMode: 'ssr',
        watch: {
          usePolling: true,
          interval: 100,
        },
      },
    })

    app.use('/product-details/:id', renderProductPage)
    app.use(vite.middlewares)
    app.use('*', async (req, res) => {
      const template = await getTemplate(req.originalUrl)
      res.status(200).set({ 'Content-Type': 'text/html' }).send(template)
    })
  } else {
    app.use('/product-details/:id', renderProductPage)
    app.use(express.static(path.resolve(root, 'dist'), { index: false }))
    app.use('*', async (req, res) => {
      const template = await getTemplate(req.originalUrl)
      res.status(200).set({ 'Content-Type': 'text/html' }).send(template)
    })
  }

  return app
}

createApp().then((app) => {
  const port = process.env.PORT || 3000
  app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`)
  })
})

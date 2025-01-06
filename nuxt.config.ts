// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  css: [
    '@/assets/styles/main.scss',
    'remixicon/fonts/remixicon.css'
  ],
  app: {
    head: {
      link: [
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap'
        }
      ]
    }
  },
  compatibilityDate: '2024-12-10'
})
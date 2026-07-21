import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'WE — мы вдвоём',
    short_name: 'МЫ',
    description: 'Приложение для пар и семей: списки дел, вишлист, планирование поездок и покупок',
    start_url: '/',
    display: 'standalone',
    background_color: '#EAF8FF',
    theme_color: '#FF0606',
    icons: [
        {
            src: '/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
        },
        {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
        },
    ],
  }
}
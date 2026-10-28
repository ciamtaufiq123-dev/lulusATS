import { MetadataRoute  } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
    return [
        {
            url: 'https://lulusats.my.id',
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
    ]
}
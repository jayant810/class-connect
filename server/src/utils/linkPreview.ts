import axios from 'axios';
import * as cheerio from 'cheerio';

interface LinkMetadata {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  youtubeId?: string;
  instagramId?: string;
}

export const extractLinks = (text: string): string[] => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.match(urlRegex) || [];
};

export const getYoutubeId = (url: string): string | undefined => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : undefined;
};

export const getInstagramId = (url: string): string | undefined => {
  const regExp = /(?:https?:\/\/)?(?:www\.)?instagram\.com\/(?:p|reel)\/([^/?#&]+)/;
  const match = url.match(regExp);
  return match ? match[1] : undefined;
};

export const fetchLinkMetadata = async (url: string): Promise<LinkMetadata | null> => {
  try {
    const youtubeId = getYoutubeId(url);
    if (youtubeId) {
      return {
        url,
        youtubeId,
        title: 'YouTube Video',
        image: `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`
      };
    }

    const instagramId = getInstagramId(url);
    if (instagramId) {
      return {
        url,
        instagramId,
        title: 'Instagram Post',
        image: `https://www.instagram.com/p/${instagramId}/media/?size=m`
      };
    }

    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
      },
      timeout: 5000
    });

    const $ = cheerio.load(data);
    const title = $('meta[property="og:title"]').attr('content') || $('title').text() || '';
    const description = $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content') || '';
    const image = $('meta[property="og:image"]').attr('content') || '';

    return {
      url,
      title: title.trim(),
      description: description.trim(),
      image: image.trim()
    };
  } catch (error: any) {
    console.error(`Error fetching metadata for ${url}:`, error.message);
    return null;
  }
};

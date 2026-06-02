import { useEffect } from 'react';
import { config } from '@/lib/config';

type SeoProps = {
  title: string;
  description: string;
  path?: string;
};

export function Seo({ title, description, path = '/' }: SeoProps) {
  useEffect(() => {
    document.title = title;
    setMeta('description', description);
    setProperty('og:title', title);
    setProperty('og:description', description);
    setProperty('og:url', `${config.siteUrl}${path}`);
  }, [description, path, title]);

  return null;
}

function setMeta(name: string, content: string) {
  let element = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.name = name;
    document.head.appendChild(element);
  }
  element.content = content;
}

function setProperty(property: string, content: string) {
  let element = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute('property', property);
    document.head.appendChild(element);
  }
  element.content = content;
}

'use client';
import { useEffect, useState, useRef } from 'react';
import { useLocale } from 'next-intl';

type TocItem = {
  id: string;
  text: string;
  level: number;
};

export function TableOfContents({ articleContentId }: { articleContentId: string }) {
  const [items, setItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const locale = useLocale();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = document.getElementById(articleContentId);
    if (!container) return;

    const headings = Array.from(container.querySelectorAll('h2, h3'));

    // Assign IDs to headings if they don't have one
    headings.forEach((heading, index) => {
      if (!heading.id) {
        heading.id = `heading-${index}`;
      }
    });

    const tocItems = headings.map(heading => ({
      id: heading.id,
      text: heading.textContent || '',
      level: heading.tagName === 'H2' ? 2 : 3
    }));

    setItems(tocItems);

    const callback = (entries: IntersectionObserverEntry[]) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          setActiveId(entry.target.id);
          break;
        }
      }
    };

    const observer = new IntersectionObserver(callback, { rootMargin: '-100px 0px -40% 0px' });
    headings.forEach(heading => observer.observe(heading));

    return () => observer.disconnect();
  }, [articleContentId]);

  useEffect(() => {
    if (activeId && scrollContainerRef.current) {
      const scrollContainer = scrollContainerRef.current;
      const activeElem = scrollContainer.querySelector(`a[href="#${activeId}"]`) as HTMLElement;

      if (activeElem) {
        const containerRect = scrollContainer.getBoundingClientRect();
        const activeRect = activeElem.getBoundingClientRect();

        const containerCenter = containerRect.height / 2;
        const elemCenter = (activeRect.top - containerRect.top) + scrollContainer.scrollTop + (activeRect.height / 2);

        scrollContainer.scrollTo({
          top: elemCenter - containerCenter,
          behavior: 'smooth'
        });
      }
    }
  }, [activeId]);

  if (items.length === 0) return null;

  return (
    <div className="rounded-xl p-4 md:p-5 border border-neutral-200/60 shadow-sm bg-white ">
      <h3 className="font-bold text-[11px] md:text-[12px] uppercase tracking-wider mb-4 text-neutral-800">
        {locale === 'ar' ? 'جدول المحتويات' : 'Table of Contents'}
      </h3>
      <div
        ref={scrollContainerRef}
        className="max-h-[calc(100dvh-16rem)] overflow-y-auto overflow-x-hidden pe-2 scrollbar-thin scrollbar-thumb-neutral-200 scrollbar-track-transparent"
      >
        <ul className="space-y-0 relative before:absolute before:inset-y-0 before:start-0 before:w-[2px] before:bg-neutral-100">
          {items.map(item => (
            <li
              key={item.id}
              className="relative"
            >
              <a
                href={`#${item.id}`}
                className={`block text-[13px] hover:text-primary transition-all duration-200 leading-snug py-2 pe-2 ${
                  item.level === 3 ? 'ps-6' : 'ps-3'
                } ${
                  activeId === item.id ? 'text-primary font-semibold' : 'text-neutral-500'
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  setActiveId(item.id);
                }}
              >
                {activeId === item.id && (
                  <span className="absolute top-0 bottom-0 start-0 w-[2px] bg-primary rounded-full" />
                )}
                <span className="line-clamp-2">{item.text}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
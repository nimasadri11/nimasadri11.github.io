import { useState, useEffect } from 'react';

interface Section {
  id: string;
  label: string;
}

interface Props {
  sections: Section[];
}

export default function ProgressBar({ sections }: Props) {
  const [activeId, setActiveId] = useState(sections[0]?.id ?? '');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: '-80px 0px -60% 0px' }
    );

    for (const section of sections) {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    }

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, [sections]);

  return (
    <nav className="progress-bar">
      <div className="section-links">
        {sections.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className={`section-link ${activeId === s.id ? 'active' : ''}`}
          >
            {s.label}
          </a>
        ))}
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>
    </nav>
  );
}

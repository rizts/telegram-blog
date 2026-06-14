'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Props {
  content: string;
  isSticky?: boolean;
}

export function MarkdownRenderer({ content, isSticky }: Props) {
  // Pre-process WhatsApp style formatting:
  // WhatsApp bold: *text* -> **text**
  // Markdown italic is normally *text* or _text_. 
  // By converting single * to double **, we force WhatsApp bold to be Markdown bold.
  // We use regex to match *text* that are not already **text**.
  const processedContent = content
    .replace(/(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g, '**$1**');

  return (
    <div
      style={{
        fontSize: '14px',
        lineHeight: '1.7',
        color: 'var(--text-primary)',
        flex: 1,
        // Global styles for markdown elements inside this container
        wordBreak: 'break-word',
        ...(isSticky ? {} : {
          display: '-webkit-box',
          WebkitLineClamp: 4,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        })
      }}
      className="markdown-body"
    >
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ node, ...props }) => <p style={{ margin: '0 0 8px 0', whiteSpace: 'pre-wrap' }} {...props} />,
          a: ({ node, ...props }) => <a style={{ color: 'var(--accent-primary)', textDecoration: 'underline' }} {...props} />,
          strong: ({ node, ...props }) => <strong style={{ fontWeight: 800 }} {...props} />,
          em: ({ node, ...props }) => <em style={{ fontStyle: 'italic' }} {...props} />,
          del: ({ node, ...props }) => <del style={{ textDecoration: 'line-through', opacity: 0.7 }} {...props} />,
          ul: ({ node, ...props }) => <ul style={{ margin: '0 0 8px 0', paddingLeft: '20px', listStyleType: 'disc' }} {...props} />,
          ol: ({ node, ...props }) => <ol style={{ margin: '0 0 8px 0', paddingLeft: '20px', listStyleType: 'decimal' }} {...props} />,
          li: ({ node, ...props }) => <li style={{ margin: '2px 0' }} {...props} />,
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
}

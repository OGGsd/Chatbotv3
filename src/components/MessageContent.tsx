import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MessageContentProps {
  content: string;
  role: 'user' | 'assistant';
}

const MessageContent: React.FC<MessageContentProps> = ({ content, role }) => {
  const components = {
    p: ({ children }: any) => (
      <p className="mb-2 last:mb-0 leading-relaxed text-sm">{children}</p>
    ),
    
    strong: ({ children }: any) => (
      <strong className={`font-semibold text-sm ${
        role === 'user' ? 'text-gray-100' : 'text-gray-900'
      }`}>
        {children}
      </strong>
    ),
    
    em: ({ children }: any) => (
      <em className={`italic text-sm ${
        role === 'user' ? 'text-gray-200' : 'text-gray-700'
      }`}>
        {children}
      </em>
    ),
    
    ul: ({ children }: any) => (
      <ul className="list-disc list-inside mb-2 space-y-1 text-sm">{children}</ul>
    ),
    
    ol: ({ children }: any) => (
      <ol className="list-decimal list-inside mb-2 space-y-1 text-sm">{children}</ol>
    ),
    
    li: ({ children }: any) => (
      <li className={`text-sm ${
        role === 'user' ? 'text-gray-100' : 'text-gray-700'
      }`}>
        {children}
      </li>
    ),
    
    code: ({ children, className }: any) => {
      const isInline = !className;
      
      if (isInline) {
        return (
          <code className={`px-2 py-1 rounded-lg text-xs font-mono ${
            role === 'user' 
              ? 'bg-white/20 text-gray-100' 
              : 'bg-gray-100 text-gray-800 border border-gray-200'
          }`}>
            {children}
          </code>
        );
      }
      
      return (
        <pre className={`p-3 rounded-xl text-xs font-mono overflow-x-auto mb-2 ${
          role === 'user' 
            ? 'bg-white/10 text-gray-100 border border-white/20' 
            : 'bg-gray-50 text-gray-800 border border-gray-200'
        }`}>
          <code>{children}</code>
        </pre>
      );
    },
    
    h1: ({ children }: any) => (
      <h1 className={`text-base font-bold mb-2 ${
        role === 'user' ? 'text-gray-100' : 'text-gray-900'
      }`}>
        {children}
      </h1>
    ),
    
    h2: ({ children }: any) => (
      <h2 className={`text-sm font-bold mb-2 ${
        role === 'user' ? 'text-gray-100' : 'text-gray-900'
      }`}>
        {children}
      </h2>
    ),
    
    h3: ({ children }: any) => (
      <h3 className={`text-xs font-bold mb-1 ${
        role === 'user' ? 'text-gray-100' : 'text-gray-900'
      }`}>
        {children}
      </h3>
    ),
    
    blockquote: ({ children }: any) => (
      <blockquote className={`border-l-4 pl-3 py-2 mb-2 italic text-sm ${
        role === 'user' 
          ? 'border-white/30 text-gray-200' 
          : 'border-gray-300 text-gray-600'
      }`}>
        {children}
      </blockquote>
    ),
    
    a: ({ children, href }: any) => (
      <a 
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`underline hover:no-underline transition-all duration-200 text-sm ${
          role === 'user' 
            ? 'text-gray-200 hover:text-white' 
            : 'text-gray-700 hover:text-gray-900'
        }`}
      >
        {children}
      </a>
    ),
    
    hr: () => (
      <hr className={`my-3 border-t ${
        role === 'user' ? 'border-white/30' : 'border-gray-200'
      }`} />
    ),
  };

  return (
    <div className="prose prose-sm max-w-none">
      <ReactMarkdown 
        components={components}
        remarkPlugins={[remarkGfm]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MessageContent;
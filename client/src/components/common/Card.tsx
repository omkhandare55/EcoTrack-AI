import React from 'react';

interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  tagName?: 'article' | 'section' | 'div';
  ariaLabel?: string;
  style?: React.CSSProperties;
}

export const Card: React.FC<CardProps> = ({
  title,
  children,
  className = '',
  tagName: Tag = 'article',
  ariaLabel,
  style,
}) => {
  return (
    <Tag className={`card ${className}`} aria-label={ariaLabel} style={style}>
      {title && <h3 className="card-title">{title}</h3>}
      <div className="card-content">{children}</div>
    </Tag>
  );
};

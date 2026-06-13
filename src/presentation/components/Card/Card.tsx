'use client';

import React from 'react';
import styles from './Card.module.css';

export interface CardProps {
  title?: string;
  className?: string;
  children: React.ReactNode;
}

export function Card({ title, className = '', children }: CardProps): React.ReactElement {
  const classNames = [styles.card, className].filter(Boolean).join(' ');
  return (
    <section className={classNames} aria-labelledby={title ? 'card-title' : undefined}>
      {title ? (
        <h2 id="card-title" className={styles.title}>
          {title}
        </h2>
      ) : null}
      <div className={styles.content}>{children}</div>
    </section>
  );
}

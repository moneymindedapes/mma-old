import styles from './theme.module.css';
import { themeChange } from 'theme-change';
import { useEffect } from 'react';

/* eslint-disable-next-line */
export interface ThemeProps {}

export function Theme(props: ThemeProps) {
  const themes = [
    'forest',
    'light',
    'dark',
    'cupcake',
    'bumblebee',
    'emerald',
    'corporate',
    'synthwave',
    'retro',
    'cyberpunk',
    'valentine',
    'halloween',
    'garden',
    'coffee',
    'aqua',
    'lofi',
    'pastel',
    'fantasy',
    'wireframe',
    'black',
    'luxury',
    'dracula',
    'cmyk',
    'autumn',
    'business',
    'acid',
    'lemonade',
    'night',
    'winter',
  ];
  return (
    <>
      {useEffect(() => {
        themeChange(false);
        // 👆 false parameter is required for react project
      }, [])}
      <div className={styles['container']}>
        <select data-choose-theme>
          {themes.map((theme) => (
            <option key={theme} value={theme}>
              {theme}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}

export default Theme;

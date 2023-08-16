import styles from './ui.module.css';
import { Nav } from './nav/nav';
/* eslint-disable-next-line */
export interface UiProps {}

export function Ui(props: UiProps) {
  return (
    <div className={styles['container']}>
      <Nav />
    </div>
  );
}

export default Ui;

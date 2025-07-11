import Link from 'next/link';
import styles from './page.module.css';

export default function HomePage() {
  return (
    <main className={styles.container}>
      <div className={styles.textCenter}>
        <h1 className={styles.title}>Quiz App</h1>
        <div className={styles.buttonContainer}>
          <div>
            <Link href="/quizzes">
              <button className={styles.button}>
                Student Login
              </button>
            </Link>
          </div>
          <div>
            <Link href="/admin/quizzes">
              <button className={styles.button}>
                Admin Login
              </button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

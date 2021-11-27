import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import { Button } from 'react-bootstrap';

export default function Home() {
  return (
    <>
      <Head>
        <title>Apes collab</title>
      </Head>
      <div class={styles.homepage}>
        <div className={styles.cover} height='400' width='400'>
          <Image className={styles.coverImg} 
          src='/cover.jpeg' height='400' width='400'/>
        </div>
        <div className={styles.contents}>
          <div className={styles.subHeading}>
            Think and Code Together, in
          </div>
          <div className={styles.heading}>
            Apes Collab
          </div>
          <div className = {styles.description}>
            Turn your best ideas into reality, by coding and building together
            with your peers and friends, in real-time. So what are you waiting for?
            Let's dive in.
          </div>
          <Button className={styles.button}>Sign In</Button>
        </div>
      </div>
    </>
  )
}

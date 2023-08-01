'use client';
import React from 'react';
import styles from '../styles/ToastMsg.module.sass';

type Props = {
  isVisible: boolean;
  status: 'success' | 'fail';
  message: string;
};

const ToastMsg = ({ isVisible, status, message }: Props) => {
  return (
    <div className={`${styles.toastContainer} ${isVisible && styles.active}`}>
      <div
        className={`${styles.toastSignal} ${
          status === 'success' ? styles.success : styles.fail
        }`}
      >
        {status === 'success' ? '✓' : '𐄂'}
      </div>
      <div className={styles.toastMessage}>{message}</div>
    </div>
  );
};

export default ToastMsg;

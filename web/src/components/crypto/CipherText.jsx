import React, { useEffect, useRef, useState } from 'react';

const CipherText = ({ text, duration = 1500, delay = 0, className = "", scrambleBack = false }) => {
  const [displayText, setDisplayText] = useState("");
  const iterationsRef = useRef(0);
  const maxIterations = Math.floor(duration / 30);
  const chars = '0123456789ABCDEF!@#$%^&*()_+';

  useEffect(() => {
    let timeoutId;
    let intervalId;

    const startAnimation = () => {
      iterationsRef.current = 0;
      intervalId = setInterval(() => {
        setDisplayText(prev => {
          return text
            .split("")
            .map((char, index) => {
              if (index < iterationsRef.current / (maxIterations / text.length)) {
                return text[index];
              }
              return chars[Math.floor(Math.random() * chars.length)];
            })
            .join("");
        });

        iterationsRef.current += 1;
        if (iterationsRef.current >= maxIterations) {
          clearInterval(intervalId);
          setDisplayText(text);
          if (scrambleBack) {
            setTimeout(startScrambleBack, 2000);
          }
        }
      }, 30);
    };

    const startScrambleBack = () => {
      iterationsRef.current = 0;
      intervalId = setInterval(() => {
        setDisplayText(prev => {
          return text
            .split("")
            .map((char, index) => {
              // scramble backwards
              if (index > text.length - (iterationsRef.current / (maxIterations / text.length))) {
                return chars[Math.floor(Math.random() * chars.length)];
              }
              return text[index];
            })
            .join("");
        });

        iterationsRef.current += 1;
        if (iterationsRef.current >= maxIterations) {
          clearInterval(intervalId);
          // Wait and repeat
          setTimeout(startAnimation, 1000);
        }
      }, 30);
    }

    timeoutId = setTimeout(startAnimation, delay);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, [text, duration, delay, scrambleBack]);

  return (
    <span className={`font-mono ${className}`}>
      {displayText || text.replace(/./g, '0')}
    </span>
  );
};

export default CipherText;

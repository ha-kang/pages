import React, { useState, useEffect, useRef } from 'react';
import './CloudJumpGame.css';

const CloudJumpGame = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const characterRef = useRef(null);
  const gameAreaRef = useRef(null);

  useEffect(() => {
    if (gameStarted) {
      const gameArea = gameAreaRef.current;
      const character = characterRef.current;
      let characterBottom = 50;
      let isJumping = false;
      let gravity = 0.9;
      let cloudInterval;

      function jump() {
        if (isJumping) return;
        let jumpCount = 0;
        isJumping = true;
        let jumpInterval = setInterval(() => {
          if (jumpCount > 20) {
            clearInterval(jumpInterval);
            let fallInterval = setInterval(() => {
              if (jumpCount === 0) {
                clearInterval(fallInterval);
                isJumping = false;
              }
              characterBottom -= 5;
              character.style.bottom = characterBottom + 'px';
              jumpCount--;
            }, 20);
          }
          characterBottom += 5;
          character.style.bottom = characterBottom + 'px';
          jumpCount++;
        }, 20);
      }

      function createCloud() {
        let cloud = document.createElement('div');
        cloud.classList.add('cloud');
        gameArea.appendChild(cloud);
        cloud.style.left = gameArea.clientWidth + 'px';
        cloud.style.bottom = Math.random() * 200 + 'px';

        function moveCloud() {
          let cloudLeft = cloud.offsetLeft;
          cloudLeft -= 2;
          cloud.style.left = cloudLeft + 'px';

          if (cloudLeft < -50) {
            cloud.remove();
            setScore(prevScore => prevScore + 1);
          }
          
          if (
            cloudLeft > 0 &&
            cloudLeft < 50 &&
            characterBottom < parseInt(cloud.style.bottom) + 50 &&
            characterBottom > parseInt(cloud.style.bottom) - 50
          ) {
            gameOver();
          }
        }

        let cloudTimer = setInterval(moveCloud, 20);
        cloudInterval = setInterval(createCloud, 3000);
      }

      function gameOver() {
        clearInterval(cloudInterval);
        setGameStarted(false);
        alert(`Game Over! Your score: ${score}`);
      }

      createCloud();

      document.addEventListener('keydown', (e) => {
        if (e.key === ' ' || e.key === 'ArrowUp') {
          jump();
        }
      });

      return () => {
        document.removeEventListener('keydown', jump);
        clearInterval(cloudInterval);
      };
    }
  }, [gameStarted, score]);

  return (
    <div className="game-container">
      <div className="game-area" ref={gameAreaRef}>
        <div className="character" ref={characterRef}></div>
      </div>
      {!gameStarted && (
        <button className="start-button" onClick={() => setGameStarted(true)}>
          시작하기
        </button>
      )}
      <div className="score">점수: {score}</div>
    </div>
  );
};

export default CloudJumpGame;

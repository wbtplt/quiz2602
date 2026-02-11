import { useState, useEffect } from 'react'
import Papa from 'papaparse'
import './App.css'

function App() {
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);
  // 'question' (問題表示) か 'answer' (正解表示) かの状態
  const [phase, setPhase] = useState('question');

  useEffect(() => {
    const csvPath = `${import.meta.env.BASE_URL}quiz_target1.csv`;
    Papa.parse(csvPath, {
      download: true, header: true, skipEmptyLines: true,
      complete: (results) => setQuestions(results.data)
    });
  }, []);

  // タイマー処理（phaseが'question'の時だけ動く）
  useEffect(() => {
    if (isFinished || questions.length === 0 || phase === 'answer') return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0.1) {
          //showAnswer(); // 時間切れで正解を表示
          return 10;
        }
        return Math.round((prev - 0.1) * 10) / 10;
      });
    }, 100);
    return () => clearInterval(timer);
  }, [currentIdx, isFinished, phase, questions.length]);

  // 正解を表示する（フェーズ切り替え）
  const showAnswer = () => {
    setPhase('answer');
  };

  // ユーザーが自分で「正解/不正解」を判断した後の処理
  const handleJudge = (isCorrect) => {
    if (isCorrect) setScore(score + 1);

    const nextIdx = currentIdx + 1;
    if (nextIdx < questions.length) {
      setCurrentIdx(nextIdx);
      setTimeLeft(10);
      setPhase('question'); // 次の問題へ
    } else {
      setIsFinished(true);
    }
  };

  if (questions.length === 0) return <div>読み込み中...</div>;

  return (
    <div className="App" style={{ padding: '20px', textAlign: 'center', maxWidth: '500px', margin: '0 auto' }}>
      {isFinished ? (
        <div>
          <h1>終了！</h1>
          <p>あなたの自己採点: {score} / {questions.length}</p>
          <button onClick={() => window.location.reload()}>もう一度</button>
        </div>
      ) : (
        <div>
          <h2>第 {currentIdx + 1} 問</h2>
          
          {/* タイマー表示：問題フェーズの時だけ出す */}
          <div style={{ marginBottom: '20px', height: '60px', visibility: phase === 'question' ? 'visible' : 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'monospace' }}>
              <span>THINKING TIME</span>
              <span style={{ color: timeLeft < 3 ? 'red' : 'inherit' }}>{timeLeft.toFixed(1)}s</span>
            </div>
            <progress value={timeLeft} max="10" style={{ width: '100%', transition: 'all 0.1s linear' }}></progress>
          </div>

          <p style={{ fontSize: '1.4rem', minHeight: '3em' }}>{questions[currentIdx].question}</p>

          <hr style={{ margin: '20px 0' }} />

          {phase === 'question' ? (
            // １．問題フェーズのボタン
            <button onClick={showAnswer} style={{ padding: '10px 20px', fontSize: '1.1rem', width: '100%' }}>
              正解を表示する
            </button>
          ) : (
            // ２．正解・判断フェーズ
            <div style={{ animation: 'fadeIn 0.5s' }}>
              <p style={{ color: '#ff4d4d', fontWeight: 'bold', fontSize: '1.2rem' }}>正解は..</p>
              <p style={{ fontSize: '3.0rem', marginBottom: '30px' }}>{questions[currentIdx].answer}</p>
              

              {/* ★解説エリアの追加 */}
              {questions[currentIdx].info && (
                <div style={{ 
                  backgroundColor: '#f0f4f8', 
                  padding: '15px', 
                  borderRadius: '8px', 
                  textAlign: 'left', 
                  fontSize: '1.2rem',
                  lineHeight: '1.5',
                  marginBottom: '30px',
                  borderLeft: '4px solid #3182ce'
                }}>
                  <strong style={{ display: 'block', marginBottom: '5px', color: '#3182ce' }}>💡 解説</strong>
                  {questions[currentIdx].info}
                </div>
              )}


              <p>あなたの回答は？</p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => handleJudge(true)} style={{ flex: 1, padding: '15px', backgroundColor: '#4CAF50', color: 'white' }}>
                  正解！
                </button>
                <button onClick={() => handleJudge(false)} style={{ flex: 1, padding: '15px', backgroundColor: '#f44336', color: 'white' }}>
                  わからなかった
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default App
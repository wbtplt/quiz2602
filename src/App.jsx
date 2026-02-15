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
    <div className="App" style={{ 
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      padding: '10px 20px', 
      textAlign: 'center', 
      maxWidth: '500px', 
      margin: '0 auto' ,
      boxSizing: 'border-box',
      overflow: 'hidden'
      }}>
      {isFinished ? (
        <div style={{ margin: 'auto' }}>
          <h1>終了！</h1>
          <p>あなたの自己採点: {score} / {questions.length}</p>
          <button onClick={() => window.location.reload()}>もう一度</button>
        </div>
      ) : (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          justifyContent: 'space-between' // 要素を上下に振り分ける
          }}>
          <h2 style={{ fontSize: '1.2rem', margin: '10px 0'}}>
            第 {currentIdx + 1} 問
          </h2>
          
          
          {/* コンテンツエリア（解説などを中央に配置） */}
          <div style={{ 
            flex: 1,                      // 余ったスペースをすべて使う
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'center',     // 中央寄せ
            overflowY: 'auto',            // 万が一はみ出た時だけ中だけスクロール
            padding: '10px 0'
          }}>
            {phase === 'question' ? (
              // １．問題フェーズ：タイマーを表示
              <div style={{ animation: 'fadeIn 0.3s' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'monospace', fontSize: '0.9rem' }}>
                  <span>THINKING TIME</span>
                  <span style={{ color: timeLeft < 3 ? '#ff4d4d' : 'inherit' }}>{timeLeft.toFixed(1)}s</span>
                </div>
                <progress value={timeLeft} max="10" style={{ width: '100%', transition: 'all 0.1s linear' }}></progress>
                <p style={{ fontSize: 'clamp(1.5rem, 8vw, 3rem)', margin: '15px 0', fontWeight: 'bold' }}>
                  {questions[currentIdx].question}
                  </p>
              </div>
            ) : (
              // ２．正解フェーズ：代わりに「ANSWER CHECK」などのラベルを出す（または空にする）
              <div style={{ animation: 'fadeIn 0.3s', textAlign: 'left', borderBottom: '2px solid #3182ce', paddingBottom: '5px' }}>
                <strong style={{ fontSize: '1.5rem', color: '#3182ce' }}>
                  {questions[currentIdx].question}
                  </strong>
              </div>
            )}

            {phase === 'answer' && (
              <div style={{ animation: 'fadeIn 0.5s' }}>
                <p style={{ fontSize: 'clamp(1.2rem, 6vw, 1.8rem)', marginBottom: '20px', color: '#2d3748' }}>
                  {questions[currentIdx].answer}
                </p>
                
                {questions[currentIdx].info && (
                  <div style={{ 
                    backgroundColor: '#f0f4f8', 
                    padding: '12px', 
                    borderRadius: '8px', 
                    textAlign: 'left', 
                    fontSize: 'clamp(0.9rem, 4vw, 1.1rem)', // スマホとPCで最適化
                    lineHeight: '1.4',
                    borderLeft: '4px solid #3182ce'
                  }}>
                    {questions[currentIdx].info}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ボタンエリア（常に一番下に配置） */}
          <div style={{ paddingBottom: '150px' }}>
            {phase === 'question' ? (
              <button onClick={showAnswer} style={{ padding: '15px 20px', fontSize: '1.3rem', width: '100%', borderRadius: '10px' }}>
                正解を表示する
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => handleJudge(true)} style={{ flex: 1, padding: '15px', backgroundColor: '#63bc66', color: 'white', borderRadius: '10px', fontSize: '1.1rem' }}>
                  わかった
                </button>
                <button onClick={() => handleJudge(false)} style={{ flex: 1, padding: '15px', backgroundColor: '#fe7167', color: 'white', borderRadius: '10px', fontSize: '1.1rem' }}>
                  要復習
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default App
import { useState, useEffect } from 'react'
import Papa from 'papaparse'
import './App.css'

function App() { // <--- 1. Hookはこの関数の「中」でしか使えません
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  // ステートを追加
  const [timeLeft, setTimeLeft] = useState(10); // 1問10秒とする
  
  // 2. パスの作成はここで行う（またはuseEffectの直前）
  const csvPath = `${import.meta.env.BASE_URL}quiz_data.csv`;

  useEffect(() => { // <--- 3. useEffectは必ず関数の「直下」で呼ぶ
    Papa.parse(csvPath, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setQuestions(results.data);
      }
    });
  }, []); // [] を忘れずに！

  // タイマーの処理
  useEffect(() => {
    // すでにクイズが終わっていたら何もしない
    if (isFinished) return;
  
    // 1秒ごとにカウントダウン
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleAnswer(-1); // 0秒になったら不正解（-1）として次へ
          return 10; // タイマーをリセット
        }
        return prev - 1;
      });
    }, 1000);
  
    // 次の問題へ行ったときなどに、古いタイマーを消す（重要！）
    return () => clearInterval(timer);
  }, [currentIdx, isFinished]); // 問題番号が変わるたびにタイマーを再セット
  
  // handleAnswerの中でタイマーをリセットする処理を追加

  const handleAnswer = (index) => {
    // 1. まずタイマーをリセット
    setTimeLeft(10);

    // 2. 正誤判定（時間切れの -1 以外、かつ正解の場合）
    const currentQuestion = questions[currentIdx];
    if (index !== -1 && currentQuestion) {
      if (parseInt(currentQuestion.correctIndex) === index) {
        setScore((prevScore) => prevScore + 1);
      }
    }

    // 3. 次の問題へ進むか、終了判定
    const nextIdx = currentIdx + 1;
    if (nextIdx < questions.length) {
      setCurrentIdx(nextIdx);
    } else {
      setIsFinished(true);
    }
  };


  if (questions.length === 0) return <div>読み込み中...</div>;

  return (
    <div className="App">
      {isFinished ? (
        <div className="result">
          <h1>クイズ終了！</h1>
          <p>あなたのスコア: {score} / {questions.length}</p>
          <button onClick={() => window.location.reload()}>もう一度挑戦</button>
        </div>
      ) : (
        <div className="quiz">
          <h2>第 {currentIdx + 1} 問</h2>

          <div style={{ marginBottom: '10px' }}>
            残り時間: <strong>{timeLeft}</strong> 秒
            <progress value={timeLeft} max="10" style={{ width: '100%' }}></progress>
          </div>

          <p className="question-text">{questions[currentIdx].question}</p>
          <div className="options">
            <button onClick={() => handleAnswer(0)}>{questions[currentIdx].option1}</button>
            <button onClick={() => handleAnswer(1)}>{questions[currentIdx].option2}</button>
            <button onClick={() => handleAnswer(2)}>{questions[currentIdx].option3}</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
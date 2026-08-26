import { useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export function FeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('idle'); // idle, submitting, success, error
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const location = useLocation();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach(track => track.stop());
        await transcribeAudio(blob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone access denied:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const transcribeAudio = async (blob) => {
    setIsTranscribing(true);
    try {
      const formData = new FormData();
      formData.append("file", blob, "feedback.webm");

      const resp = await fetch("/api/feedback/transcribe", {
        method: "POST",
        body: formData,
      });

      if (resp.ok) {
        const data = await resp.json();
        if (data.text) {
          setMessage(prev => prev ? prev + " " + data.text : data.text);
        }
      }
    } catch (err) {
      console.error("Transcription failed:", err);
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');
    
    try {
      const resp = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating: rating || null,
          message: message || null,
          path: location.pathname
        })
      });
      
      if (!resp.ok) throw new Error('Feedback submission failed');
      
      setStatus('success');
      setTimeout(() => {
        setIsOpen(false);
        setStatus('idle');
        setRating(0);
        setMessage('');
      }, 3000);
      
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="feedback-toggle btn btn-primary"
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          borderRadius: '999px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 9999,
          padding: '0.75rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}
      >
        <span>💬</span> Feedback
      </button>
    );
  }

  return (
    <div 
      className="feedback-modal glass-panel card"
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        width: '320px',
        zIndex: 9999,
        padding: '1.5rem',
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        animation: 'slideUp 0.3s ease-out'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Provide Feedback</h3>
        <button 
          onClick={() => setIsOpen(false)}
          style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-secondary)' }}
        >
          &times;
        </button>
      </div>

      {status === 'success' ? (
        <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--success-color)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✨</div>
          <p style={{ fontWeight: 600 }}>Thank you!</p>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Your feedback has been received anonymously.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              How would you rate this page?
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    color: star <= rating ? '#fbbf24' : '#e5e7eb',
                    transition: 'color 0.2s'
                  }}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Any thoughts or suggestions? (Anonymous)
            </label>
            <div style={{ position: 'relative' }}>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Tell us what you think..."
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  paddingRight: '3rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--surface)',
                  color: 'var(--text-primary)',
                  minHeight: '80px',
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
              />
              <button
                type="button"
                onMouseDown={startRecording}
                onMouseUp={stopRecording}
                onMouseLeave={() => isRecording && stopRecording()}
                onTouchStart={startRecording}
                onTouchEnd={stopRecording}
                disabled={isTranscribing}
                title={isRecording ? "Recording... release to stop" : isTranscribing ? "Transcribing..." : "Hold to speak"}
                style={{
                  position: 'absolute',
                  right: '0.5rem',
                  bottom: '0.5rem',
                  width: '2rem',
                  height: '2rem',
                  borderRadius: '50%',
                  border: 'none',
                  background: isRecording ? 'var(--error-color)' : isTranscribing ? 'var(--warning-color)' : 'var(--primary-color)',
                  color: '#fff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.9rem',
                  transition: 'background 0.2s',
                  opacity: isTranscribing ? 0.7 : 1,
                }}
              >
                {isRecording ? '⏹' : isTranscribing ? '⏳' : '🎤'}
              </button>
            </div>
            {isRecording && (
              <p style={{ fontSize: '0.75rem', color: 'var(--error-color)', margin: '0.25rem 0 0' }}>
                🔴 Recording... release to stop
              </p>
            )}
          </div>

          {status === 'error' && (
            <p style={{ color: 'var(--error-color)', fontSize: '0.85rem', margin: 0 }}>Failed to submit. Please try again.</p>
          )}

          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={status === 'submitting' || (!rating && !message.trim())}
            style={{ width: '100%' }}
          >
            {status === 'submitting' ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </form>
      )}

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @media (max-width: 480px) {
          .feedback-modal {
            width: calc(100vw - 40px) !important;
          }
        }
      `}</style>
    </div>
  );
}

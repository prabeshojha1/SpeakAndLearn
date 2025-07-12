"use client";

import { useState, useRef, useEffect } from 'react';

export default function VoiceRecorder({ onRecordingComplete, questionIndex, isRecording, setIsRecording, questionText = '', quizTitle = '', onTranscriptionStateChange }) {
  const [timeLeft, setTimeLeft] = useState(20); // 20 second recording
  const [audioURL, setAudioURL] = useState(null);
  const [isSupported, setIsSupported] = useState(true);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [evaluation, setEvaluation] = useState(null);
  
  const mediaRecorderRef = useRef(null);
  const audioChunks = useRef([]);
  const timerRef = useRef(null);

  // Check if browser supports media recording
  useEffect(() => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setIsSupported(false);
      console.error('Media recording not supported in this browser');
    }
  }, []);

  // Start recording when isRecording becomes true
  useEffect(() => {
    if (isRecording && isSupported) {
      startRecording();
    } else if (!isRecording && mediaRecorderRef.current) {
      stopRecording();
    }
  }, [isRecording, isSupported]);

  const startRecording = async () => {
    try {
      // Reset previous recording data
      audioChunks.current = [];
      setTimeLeft(20);
      setAudioURL(null);
      setTranscription('');
      setEvaluation(null);

      // Get user media (microphone)
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        }
      });

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      mediaRecorderRef.current = mediaRecorder;

      // Handle data available event
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.current.push(event.data);
        }
      };

      // Handle recording stop event
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioURL(audioUrl);
        
        let transcriptionText = '';
        let evaluationResult = null;
        
        // Start transcription process
        setIsTranscribing(true);
        if (onTranscriptionStateChange) {
          onTranscriptionStateChange(true);
        }
        
        try {
          // Step 1: Transcribe the audio using OpenAI Whisper
          const formData = new FormData();
          formData.append('audio', audioBlob);
          formData.append('questionText', questionText);
          formData.append('questionIndex', questionIndex.toString());
          
          const transcriptionResponse = await fetch('/api/transcribe', {
            method: 'POST',
            body: formData,
          });
          
          if (transcriptionResponse.ok) {
            const transcriptionResult = await transcriptionResponse.json();
            transcriptionText = transcriptionResult.transcription || '';
            setTranscription(transcriptionText);
            console.log('Transcription completed:', transcriptionText);
            
            // Step 2: Automatically evaluate the transcription
            if (transcriptionText.trim()) {
              setIsEvaluating(true);
              
              try {
                const evaluationResponse = await fetch('/api/evaluate', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    transcription: transcriptionText,
                    quizTitle: quizTitle,
                    questionIndex: questionIndex
                  }),
                });
                
                if (evaluationResponse.ok) {
                  const evaluationResult = await evaluationResponse.json();
                  evaluationResult.evaluation.feedback = evaluationResult.evaluation.feedback || 'Good effort!';
                  setEvaluation(evaluationResult.evaluation);
                  console.log('Evaluation completed:', evaluationResult.evaluation);
                } else {
                  console.error('Evaluation failed:', await evaluationResponse.text());
                }
              } catch (evalError) {
                console.error('Error during evaluation:', evalError);
              } finally {
                setIsEvaluating(false);
              }
            }
          } else {
            console.error('Transcription failed:', await transcriptionResponse.text());
            setTranscription('Transcription failed');
          }
          
        } catch (error) {
          console.error('Error during transcription:', error);
          setTranscription('Transcription error');
        } finally {
          setIsTranscribing(false);
          if (onTranscriptionStateChange) {
            onTranscriptionStateChange(false);
          }
        }

        // Convert to base64 for database storage and call completion callback
        const reader = new FileReader();
        reader.onload = () => {
          const base64Audio = reader.result.split(',')[1]; // Remove data:audio/webm;base64, prefix
          onRecordingComplete({
            audioBlob,
            audioURL: audioUrl,
            base64Audio,
            questionIndex,
            duration: 20 - timeLeft,
            mimeType: 'audio/webm',
            transcription: transcriptionText,
            evaluation: evaluationResult
          });
        };
        reader.readAsDataURL(audioBlob);

        // Clean up stream
        stream.getTracks().forEach(track => track.stop());
      };

      // Start recording
      mediaRecorder.start();
      
      // Start countdown timer
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsRecording(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

    } catch (error) {
      console.error('Error starting recording:', error);
      setIsRecording(false);
      
      // Handle common errors
      if (error.name === 'NotAllowedError') {
        alert('Microphone access denied. Please allow microphone access to record your voice.');
      } else if (error.name === 'NotFoundError') {
        alert('No microphone found. Please connect a microphone and try again.');
      } else {
        alert('Error starting recording. Please try again.');
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (mediaRecorderRef.current) {
        stopRecording();
      }
    };
  }, []);

  if (!isSupported) {
    return (
      <div className="text-center p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
        <p className="font-bold">Recording not supported</p>
        <p>Your browser doesn't support voice recording. Please use a modern browser like Chrome, Firefox, or Safari.</p>
      </div>
    );
  }

  return (
    <div className="text-center">
      {isRecording && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-red-600 font-semibold">Recording...</span>
          </div>
          <div className="text-2xl font-bold text-red-600">
            {formatTime(timeLeft)}
          </div>
          <p className="text-sm text-red-500 mt-1">
            Speak clearly into your microphone
          </p>
        </div>
      )}
      
      {isTranscribing && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            <span className="text-blue-600 font-semibold">Transcribing audio...</span>
          </div>
          <p className="text-sm text-blue-500">
            Processing your speech with AI
          </p>
        </div>
      )}

      {isEvaluating && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500"></div>
            <span className="text-purple-600 font-semibold">Evaluating response...</span>
          </div>
          <p className="text-sm text-purple-500">
            AI is analyzing your understanding
          </p>
        </div>
      )}

      {audioURL && !isRecording && !isTranscribing && !isEvaluating && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <p className="text-green-600 font-semibold mb-2">Recording complete!</p>
          <audio controls src={audioURL} className="w-full mb-3">
            Your browser does not support the audio element.
          </audio>
          
          {transcription && (
            <div className="bg-white border border-green-300 rounded-md p-3 mb-3">
              <p className="text-sm font-medium text-green-700 mb-1">Transcription:</p>
              <p className="text-gray-700 text-sm italic">"{transcription}"</p>
            </div>
          )}

          {evaluation && (
            <div className="bg-white border border-purple-300 rounded-md p-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-purple-700">AI Evaluation:</p>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  evaluation.understanding_level === 'excellent' ? 'bg-green-100 text-green-700' :
                  evaluation.understanding_level === 'good' ? 'bg-blue-100 text-blue-700' :
                  evaluation.understanding_level === 'fair' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {evaluation.understanding_level}
                </span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm text-gray-600">Score:</span>
                <span className="font-bold text-lg text-gray-800">{evaluation.score}/100</span>
              </div>
              <p className="text-gray-700 text-sm">{evaluation.feedback}</p>
            </div>
          )}
        </div>
      )}
      
      {!isRecording && !audioURL && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-600">
            Get ready to record your voice for 20 seconds
          </p>
        </div>
      )}
    </div>
  );
} 
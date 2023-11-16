import React, { useRef, useState } from 'react';
import './recording.css';

const VideoRecorder: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setMediaStream(stream);

      const recorder = new MediaRecorder(stream);
      setMediaRecorder(recorder);

      const chunks: Blob[] = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = () => {
        const recordedBlob = new Blob(chunks, { type: 'video/webm' });
        setRecordedChunks(chunks);

        if (videoRef.current) {
          videoRef.current.srcObject = null;
          videoRef.current.src = URL.createObjectURL(recordedBlob);
          videoRef.current.play();
        }

        if (mediaStream) {
          const tracks = mediaStream.getTracks();
          tracks.forEach((track) => track.stop());
          setMediaStream(null);
        }
      };

      recorder.start();
      setIsRecording(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="video-recorder-container">
      <video ref={videoRef} className="video-preview" width="400" height="300" controls />
      <div className="controls">
        {!isRecording ? (
          <button className="start-button" onClick={startRecording}>
            Start Recording
          </button>
        ) : (
          <button className="stop-button" onClick={stopRecording}>
            Stop Recording
          </button>
        )}
      </div>
    </div>
  );
};

export default VideoRecorder;

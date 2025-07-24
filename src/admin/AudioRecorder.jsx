"use client"

import { useState, useRef } from "react"
import { Mic, Square, Play, Trash2 } from "lucide-react"

export function AudioRecorder({ onAudioRecorded, onAudioCleared, audioUrl }) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const audioRef = useRef(null)

  const startRecording = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert("L'enregistrement audio n'est pas supporté par votre navigateur.")
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)
      audioChunksRef.current = []

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" })
        const audioUrl = URL.createObjectURL(audioBlob)
        onAudioRecorded(audioBlob, audioUrl)

        // Arrêter tous les tracks
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorderRef.current.start()
      setIsRecording(true)
    } catch (error) {
      alert("Erreur lors de l'accès au microphone : " + error.message)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const playAudio = () => {
    if (audioUrl && audioRef.current) {
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  const clearAudio = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
    }
    onAudioCleared()
    setIsPlaying(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {!isRecording && !audioUrl && (
          <button
            type="button"
            onClick={startRecording}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition flex items-center gap-2"
          >
            <Mic className="w-4 h-4" />
            Démarrer l'enregistrement
          </button>
        )}

        {isRecording && (
          <button
            type="button"
            onClick={stopRecording}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition flex items-center gap-2"
          >
            <Square className="w-4 h-4" />
            Arrêter l'enregistrement
          </button>
        )}

        {audioUrl && !isRecording && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={playAudio}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition flex items-center gap-2"
            >
              <Play className="w-4 h-4" />
              Écouter
            </button>
            <button
              type="button"
              onClick={clearAudio}
              className="text-red-600 border border-red-600 hover:bg-red-50 bg-transparent px-4 py-2 rounded transition flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Supprimer
            </button>
          </div>
        )}
      </div>

      {audioUrl && (
        <div className="mt-4">
          <audio ref={audioRef} controls src={audioUrl} onEnded={() => setIsPlaying(false)} className="w-full" />
        </div>
      )}

      {isRecording && (
        <div className="flex items-center gap-2 text-red-600">
          <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium">Enregistrement en cours...</span>
        </div>
      )}
    </div>
  )
}

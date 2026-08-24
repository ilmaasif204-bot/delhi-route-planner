import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Cloud,
  X,
  Camera,
  Video,
  ImageIcon,
  Trash2,
  Send,
  MapPin,
  Pencil,
  StopCircle,
  Circle,
  FlipHorizontal,
} from "lucide-react";

export type ReportType =
  | "clear"
  | "dusty"
  | "smoky"
  | "burning"
  | "traffic_haze"
  | "garbage"
  | "dirty";

interface ReportButtonProps {
  onSubmitReport: (
    reportType: ReportType,
    photo?: File,
    video?: File,
    description?: string
  ) => void;
}

const REPORT_OPTIONS: {
  type: ReportType;
  label: string;
  emoji: string;
  color: string;
  description: string;
}[] = [
  {
    type: "clear",
    label: "Clear Skies",
    emoji: "☀️",
    color: "#22c55e",
    description: "Air looks clear, no visible pollution",
  },
  {
    type: "dusty",
    label: "Dusty",
    emoji: "🌫️",
    color: "#a8a29e",
    description: "Visible dust particles in the air",
  },
  {
    type: "smoky",
    label: "Smoky",
    emoji: "💨",
    color: "#64748b",
    description: "Smoke visible, possibly from fires or industry",
  },
  {
    type: "burning",
    label: "Burning Smell",
    emoji: "🔥",
    color: "#ef4444",
    description: "Burning smell in the area — waste, crop, or plastic",
  },
  {
    type: "traffic_haze",
    label: "Traffic Haze",
    emoji: "🚗",
    color: "#f59e0b",
    description: "Vehicle exhaust haze from heavy traffic",
  },
  {
    type: "garbage",
    label: "Garbage Spillage",
    emoji: "🗑️",
    color: "#dc2626",
    description: "Overflowing bins, scattered litter, or waste buildup",
  },
  {
    type: "dirty",
    label: "Area Needs Cleaning",
    emoji: "🧹",
    color: "#d97706",
    description: "Sewage water, stagnant pools, or general uncleanliness",
  },
];

export default function ReportButton({ onSubmitReport }: ReportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<
    "select" | "media" | "camera" | "review"
  >("select");
  const [selectedType, setSelectedType] = useState<ReportType | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [video, setVideo] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Camera state
  const [cameraMode, setCameraMode] = useState<"photo" | "video">("photo");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">(
    "environment"
  );

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const photoInputRef = useRef<HTMLInputElement>(null);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
  }, []);

  const resetForm = useCallback(() => {
    setStep("select");
    setSelectedType(null);
    setPhoto(null);
    setVideo(null);
    setPhotoPreview(null);
    setVideoPreview(null);
    setDescription("");
    setCameraError(null);
    setRecordingTime(0);
    stopCamera();
  }, [stopCamera]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    resetForm();
  }, [resetForm]);

  const handleSelectType = (type: ReportType) => {
    setSelectedType(type);
    setStep("media");
  };

  // Start camera with getUserMedia
  const startCamera = async (mode: "photo" | "video") => {
    setCameraMode(mode);
    setCameraError(null);
    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: mode === "video",
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setStep("camera");
    } catch (err) {
      console.error("Camera access error:", err);
      if (
        err instanceof DOMException &&
        err.name === "NotAllowedError"
      ) {
        setCameraError(
          "Camera permission denied. Please allow camera access in your browser settings, or choose Gallery instead."
        );
      } else if (
        err instanceof DOMException &&
        err.name === "NotFoundError"
      ) {
        setCameraError(
          "No camera found on this device. Please use Gallery to select a photo instead."
        );
      } else {
        setCameraError(
          "Could not access camera. Please try again or use Gallery."
        );
      }
    }
  };

  // Capture photo from camera
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Mirror if front camera
    if (facingMode === "user") {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const file = new File([blob], `camera-photo-${Date.now()}.jpg`, {
            type: "image/jpeg",
          });
          setPhoto(file);
          setPhotoPreview(URL.createObjectURL(blob));
          stopCamera();
          setStep("review");
        }
      },
      "image/jpeg",
      0.92
    );
  };

  // Start video recording
  const startRecording = () => {
    if (!streamRef.current) return;

    chunksRef.current = [];
    const mediaRecorder = new MediaRecorder(streamRef.current, {
      mimeType: MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
        ? "video/webm;codecs=vp9"
        : "video/webm",
    });

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      const file = new File([blob], `camera-video-${Date.now()}.webm`, {
        type: "video/webm",
      });
      setVideo(file);
      setVideoPreview(URL.createObjectURL(blob));
      stopCamera();
      setStep("review");
    };

    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start(100);
    setIsRecording(true);
    setRecordingTime(0);

    recordingTimerRef.current = setInterval(() => {
      setRecordingTime((prev) => prev + 1);
    }, 1000);
  };

  // Stop video recording
  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
  };

  // Toggle front/back camera
  const flipCamera = () => {
    stopCamera();
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  // Restart camera after flipping
  useEffect(() => {
    if (step === "camera" && streamRef.current === null) {
      startCamera(cameraMode);
    }
  }, [facingMode]);

  const handlePhotoGallery = () => {
    photoInputRef.current?.click();
  };

  const handleGalleryFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhoto(file);
    setVideo(null);
    setVideoPreview(null);
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
    setStep("review");
  };

  const handleSubmit = () => {
    if (!selectedType) return;
    onSubmitReport(
      selectedType,
      photo || undefined,
      video || undefined,
      description || undefined
    );
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      handleClose();
    }, 2000);
  };

  const handleSkipMedia = () => {
    setStep("review");
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <>
      {/* Hidden file input for gallery */}
      <input
        ref={photoInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleGalleryFileChange}
      />

      {/* Hidden canvas for photo capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
            onClick={step === "camera" ? undefined : handleClose}
          />
        )}
      </AnimatePresence>

      {/* Camera fullscreen view */}
      <AnimatePresence>
        {isOpen && step === "camera" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-[60] bg-black flex flex-col"
          >
            {/* Camera viewfinder */}
            <div className="flex-1 relative overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                style={
                  facingMode === "user"
                    ? { transform: "scaleX(-1)" }
                    : undefined
                }
              />

              {/* Camera error overlay */}
              {cameraError && (
                <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-6">
                  <div className="text-center">
                    <Camera className="h-12 w-12 text-slate-500 mx-auto mb-4" />
                    <p className="text-white text-sm font-medium mb-2">
                      {cameraError}
                    </p>
                    <button
                      onClick={() => setStep("media")}
                      className="text-teal-400 text-sm font-bold"
                    >
                      Go back
                    </button>
                  </div>
                </div>
              )}

              {/* Recording indicator */}
              {isRecording && (
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-500/90 px-3 py-1.5 rounded-full">
                  <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse" />
                  <span className="text-white text-sm font-bold">
                    {formatTime(recordingTime)}
                  </span>
                </div>
              )}

              {/* Flip camera button */}
              <button
                onClick={flipCamera}
                className="absolute top-4 right-4 p-3 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
              >
                <FlipHorizontal className="h-5 w-5 text-white" />
              </button>

              {/* Mode indicator */}
              <div className="absolute bottom-24 left-1/2 -translate-x-1/2">
                <div className="flex gap-4 bg-black/50 px-4 py-2 rounded-full">
                  <button
                    onClick={() => {
                      if (isRecording) stopRecording();
                      setCameraMode("photo");
                    }}
                    className={`text-sm font-bold transition-colors ${
                      cameraMode === "photo"
                        ? "text-teal-400"
                        : "text-white/60"
                    }`}
                  >
                    Photo
                  </button>
                  <button
                    onClick={() => setCameraMode("video")}
                    className={`text-sm font-bold transition-colors ${
                      cameraMode === "video"
                        ? "text-purple-400"
                        : "text-white/60"
                    }`}
                  >
                    Video
                  </button>
                </div>
              </div>
            </div>

            {/* Camera controls */}
            <div className="bg-black px-6 py-6 flex items-center justify-between">
              <button
                onClick={() => {
                  stopCamera();
                  setStep("media");
                }}
                className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
              >
                <X className="h-5 w-5 text-white" />
              </button>

              {/* Capture / Record button */}
              {cameraMode === "photo" ? (
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={capturePhoto}
                  className="w-18 h-18 rounded-full border-4 border-white flex items-center justify-center"
                >
                  <div className="w-14 h-14 bg-white rounded-full" />
                </motion.button>
              ) : (
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`w-18 h-18 rounded-full border-4 flex items-center justify-center ${
                    isRecording ? "border-red-500" : "border-white"
                  }`}
                >
                  {isRecording ? (
                    <StopCircle className="h-10 w-10 text-red-500" />
                  ) : (
                    <Circle className="h-10 w-10 text-red-500 fill-red-500" />
                  )}
                </motion.button>
              )}

              <div className="w-11" /> {/* Spacer for alignment */}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Report sheet */}
      <AnimatePresence>
        {isOpen && step !== "camera" && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            transition={{ type: "spring", damping: 22, stiffness: 300 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 w-[380px] max-w-[calc(100vw-2rem)] bg-[#1e293b] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
          >
            {submitted ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center py-10 px-6"
              >
                <div className="text-5xl mb-3">✅</div>
                <div className="text-lg font-bold text-white">
                  Report Submitted!
                </div>
                <div className="text-sm text-slate-400 mt-1">
                  Thank you for helping keep Delhi clean
                </div>
              </motion.div>
            ) : (
              <>
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/5">
                  <div className="flex items-center gap-3">
                    {step !== "select" && (
                      <button
                        onClick={() =>
                          setStep(step === "review" ? "media" : "select")
                        }
                        className="p-1 rounded-lg hover:bg-white/10 transition-colors"
                      >
                        <svg
                          className="h-4 w-4 text-slate-400"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M19 12H5m7-7-7 7 7 7" />
                        </svg>
                      </button>
                    )}
                    <div>
                      <h3 className="text-sm font-bold text-white">
                        {step === "select"
                          ? "Report an Issue"
                          : step === "media"
                            ? "Add Photo or Video"
                            : "Review & Submit"}
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {step === "select"
                          ? "What did you observe?"
                          : step === "media"
                            ? "Document the problem (optional)"
                            : "Confirm your report"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleClose}
                    className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
                  >
                    <X className="h-4 w-4 text-slate-500" />
                  </button>
                </div>

                <div className="p-4">
                  {/* Step 1: Select report type */}
                  {step === "select" && (
                    <div className="space-y-2">
                      {REPORT_OPTIONS.map((opt) => (
                        <motion.button
                          key={opt.type}
                          whileHover={{ scale: 1.02, x: 4 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleSelectType(opt.type)}
                          className="w-full flex items-center gap-3 p-3 rounded-xl border border-white/[0.06]
                                     hover:border-white/10 hover:bg-white/[0.03] transition-all text-left"
                        >
                          <span className="text-xl shrink-0">{opt.emoji}</span>
                          <div className="min-w-0">
                            <div className="text-sm font-bold text-white">
                              {opt.label}
                            </div>
                            <div className="text-[11px] text-slate-500 truncate">
                              {opt.description}
                            </div>
                          </div>
                          <div
                            className="ml-auto w-3 h-3 rounded-full shadow-lg shrink-0"
                            style={{ backgroundColor: opt.color }}
                          />
                        </motion.button>
                      ))}
                    </div>
                  )}

                  {/* Step 2: Add media */}
                  {step === "media" && (
                    <div className="space-y-3">
                      {/* Camera / Photo / Video buttons */}
                      <div className="grid grid-cols-3 gap-2">
                        <motion.button
                          whileHover={{ scale: 1.04 }}
                          whileTap={{ scale: 0.96 }}
                          onClick={() => startCamera("photo")}
                          className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gradient-to-br from-teal-500/15 to-emerald-500/15 border border-teal-500/20 hover:border-teal-500/40 transition-all"
                        >
                          <Camera className="h-6 w-6 text-teal-400" />
                          <span className="text-[11px] font-bold text-teal-300">
                            Take Photo
                          </span>
                          <span className="text-[9px] text-teal-500/60">
                            Opens camera
                          </span>
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.04 }}
                          whileTap={{ scale: 0.96 }}
                          onClick={handlePhotoGallery}
                          className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gradient-to-br from-blue-500/15 to-indigo-500/15 border border-blue-500/20 hover:border-blue-500/40 transition-all"
                        >
                          <ImageIcon className="h-6 w-6 text-blue-400" />
                          <span className="text-[11px] font-bold text-blue-300">
                            Gallery
                          </span>
                          <span className="text-[9px] text-blue-500/60">
                            Pick from files
                          </span>
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.04 }}
                          whileTap={{ scale: 0.96 }}
                          onClick={() => startCamera("video")}
                          className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gradient-to-br from-purple-500/15 to-pink-500/15 border border-purple-500/20 hover:border-purple-500/40 transition-all"
                        >
                          <Video className="h-6 w-6 text-purple-400" />
                          <span className="text-[11px] font-bold text-purple-300">
                            Record Video
                          </span>
                          <span className="text-[9px] text-purple-500/60">
                            Opens camera
                          </span>
                        </motion.button>
                      </div>

                      {/* Description */}
                      <div>
                        <label className="block text-[11px] font-semibold tracking-wider uppercase text-slate-500 mb-1.5">
                          Describe the problem (optional)
                        </label>
                        <div className="relative">
                          <Pencil className="absolute left-3 top-3 h-3.5 w-3.5 text-slate-600" />
                          <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="e.g. Overflowing garbage bin near the bus stop, sewage water on the road after rain..."
                            rows={3}
                            className="w-full pl-9 pr-3 py-2.5 bg-[#0f172a] border border-white/10 rounded-lg
                                       text-sm text-white placeholder:text-slate-600 resize-none
                                       focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500/60
                                       transition-all duration-200"
                          />
                        </div>
                      </div>

                      {/* Skip / Next */}
                      <div className="flex gap-2">
                        <button
                          onClick={handleSkipMedia}
                          className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-slate-400 border border-white/10 hover:bg-white/5 transition-all"
                        >
                          Skip
                        </button>
                        <button
                          onClick={() => setStep("review")}
                          className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 shadow-lg shadow-teal-500/20 transition-all"
                        >
                          Continue
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Review */}
                  {step === "review" && selectedType && (
                    <div className="space-y-3">
                      {/* Selected type badge */}
                      <div className="flex items-center gap-2 p-3 bg-white/[0.03] border border-white/[0.06] rounded-xl">
                        <span className="text-lg">
                          {REPORT_OPTIONS.find((o) => o.type === selectedType)
                            ?.emoji || "📋"}
                        </span>
                        <div>
                          <div className="text-sm font-bold text-white">
                            {REPORT_OPTIONS.find((o) => o.type === selectedType)
                              ?.label || selectedType}
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> GPS location captured
                          </div>
                        </div>
                      </div>

                      {/* Photo preview */}
                      {photoPreview && (
                        <div className="relative rounded-xl overflow-hidden border border-white/10">
                          <img
                            src={photoPreview}
                            alt="Report photo"
                            className="w-full h-40 object-cover"
                          />
                          <button
                            onClick={() => {
                              setPhoto(null);
                              setPhotoPreview(null);
                            }}
                            className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full hover:bg-black/80 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5 text-white" />
                          </button>
                          <div className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-0.5 bg-black/60 rounded-full">
                            <Camera className="h-3 w-3 text-teal-400" />
                            <span className="text-[10px] text-white font-medium">
                              Photo attached
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Video preview */}
                      {videoPreview && (
                        <div className="relative rounded-xl overflow-hidden border border-white/10">
                          <video
                            src={videoPreview}
                            className="w-full h-40 object-cover"
                            controls
                            muted
                          />
                          <button
                            onClick={() => {
                              setVideo(null);
                              setVideoPreview(null);
                            }}
                            className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full hover:bg-black/80 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5 text-white" />
                          </button>
                          <div className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-0.5 bg-black/60 rounded-full">
                            <Video className="h-3 w-3 text-purple-400" />
                            <span className="text-[10px] text-white font-medium">
                              Video attached
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Description preview */}
                      {description && (
                        <div className="p-3 bg-white/[0.03] border border-white/[0.06] rounded-xl">
                          <div className="text-[10px] font-semibold tracking-wider uppercase text-slate-600 mb-1">
                            Description
                          </div>
                          <p className="text-sm text-slate-300">{description}</p>
                        </div>
                      )}

                      {!photoPreview && !videoPreview && (
                        <div className="text-center py-3 text-[11px] text-slate-600">
                          No media attached — you can go back to add a photo or
                          video
                        </div>
                      )}

                      {/* Submit */}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSubmit}
                        className="w-full py-3 rounded-xl text-sm font-bold text-white
                                   bg-gradient-to-r from-teal-500 to-emerald-500
                                   shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40
                                   transition-all flex items-center justify-center gap-2"
                      >
                        <Send className="h-4 w-4" />
                        Submit Report
                      </motion.button>

                      <p className="text-[10px] text-slate-600 text-center font-medium">
                        Your GPS location and timestamp are captured
                        automatically. Reports are shared with local
                        authorities and visible to the public.
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl text-white
                   shadow-lg shadow-teal-500/25 flex items-center justify-center
                   hover:shadow-teal-500/40 transition-shadow
                   bg-gradient-to-br from-teal-500 to-emerald-500"
      >
        <Cloud className="h-6 w-6" />
      </motion.button>
    </>
  );
}

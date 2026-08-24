import { useState, useRef, useCallback } from "react";
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
}[] = [
  { type: "clear", label: "Clear Skies", emoji: "☀️", color: "#22c55e" },
  { type: "dusty", label: "Dusty", emoji: "🌫️", color: "#a8a29e" },
  { type: "smoky", label: "Smoky", emoji: "💨", color: "#64748b" },
  { type: "burning", label: "Burning Smell", emoji: "🔥", color: "#ef4444" },
  {
    type: "traffic_haze",
    label: "Traffic Haze",
    emoji: "🚗",
    color: "#f59e0b",
  },
  {
    type: "garbage",
    label: "Garbage Spillage",
    emoji: "🗑️",
    color: "#dc2626",
  },
  {
    type: "dirty",
    label: "Area Needs Cleaning",
    emoji: "🧹",
    color: "#d97706",
  },
];

export default function ReportButton({ onSubmitReport }: ReportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<"select" | "media" | "review">("select");
  const [selectedType, setSelectedType] = useState<ReportType | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [video, setVideo] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const resetForm = useCallback(() => {
    setStep("select");
    setSelectedType(null);
    setPhoto(null);
    setVideo(null);
    setPhotoPreview(null);
    setVideoPreview(null);
    setDescription("");
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    resetForm();
  }, [resetForm]);

  const handleSelectType = (type: ReportType) => {
    setSelectedType(type);
    setStep("media");
  };

  const handlePhotoCapture = () => {
    cameraInputRef.current?.click();
  };

  const handlePhotoGallery = () => {
    photoInputRef.current?.click();
  };

  const handleVideoCapture = () => {
    videoInputRef.current?.click();
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "photo" | "video"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === "photo") {
      setPhoto(file);
      setVideo(null);
      setVideoPreview(null);
      const reader = new FileReader();
      reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setVideo(file);
      setPhoto(null);
      setPhotoPreview(null);
      const reader = new FileReader();
      reader.onload = (ev) => setVideoPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
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

  return (
    <>
      {/* Hidden file inputs */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFileChange(e, "photo")}
      />
      <input
        ref={photoInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFileChange(e, "photo")}
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFileChange(e, "video")}
      />

      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
            onClick={handleClose}
          />
        )}
      </AnimatePresence>

      {/* Report sheet */}
      <AnimatePresence>
        {isOpen && (
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
                          <span className="text-xl">{opt.emoji}</span>
                          <span className="text-sm font-bold text-white">
                            {opt.label}
                          </span>
                          <div
                            className="ml-auto w-3 h-3 rounded-full shadow-lg"
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
                          onClick={handlePhotoCapture}
                          className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gradient-to-br from-teal-500/15 to-emerald-500/15 border border-teal-500/20 hover:border-teal-500/40 transition-all"
                        >
                          <Camera className="h-6 w-6 text-teal-400" />
                          <span className="text-[11px] font-bold text-teal-300">
                            Take Photo
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
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.04 }}
                          whileTap={{ scale: 0.96 }}
                          onClick={handleVideoCapture}
                          className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gradient-to-br from-purple-500/15 to-pink-500/15 border border-purple-500/20 hover:border-purple-500/40 transition-all"
                        >
                          <Video className="h-6 w-6 text-purple-400" />
                          <span className="text-[11px] font-bold text-purple-300">
                            Record Video
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
                            placeholder="e.g. Overflowing garbage bin near the bus stop, construction debris on the road..."
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
                        authorities.
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

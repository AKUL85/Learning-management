import { motion, AnimatePresence } from 'framer-motion';
import { X, Wallet, Upload } from 'lucide-react';

const CreateCourseModal = ({ isOpen, onClose, newCourse, setNewCourse, onSubmit, isLoading = false }) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
                onClick={isLoading ? undefined : onClose}
            >
                <motion.div
                    onClick={(e) => e.stopPropagation()}
                    className="relative bg-gray-800/90 backdrop-blur-md rounded-2xl p-8 max-w-3xl w-full border border-cyan-700 overflow-y-auto max-h-[90vh]"
                >
                    <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-3">
                        <h3 className="text-2xl font-bold text-cyan-400">CREATE NEW COURSE</h3>
                        <motion.button
                            onClick={isLoading ? undefined : onClose}
                            disabled={isLoading}
                            className={`p-2 rounded-full transition-colors ${
                                isLoading 
                                    ? 'bg-gray-600 cursor-not-allowed' 
                                    : 'bg-gray-700 hover:bg-red-500'
                            }`}
                        >
                            <X className={`w-6 h-6 ${isLoading ? 'text-gray-400' : 'text-white'}`} />
                        </motion.button>
                    </div>

                    {/* ---------------- Reward ---------------- */}
                    <div className="bg-green-900/40 border border-green-700 rounded-xl p-4 mb-6 shadow-inner">
                        <p className="text-sm text-green-300 flex items-center">
                            <Wallet className='w-4 h-4 mr-2' />
                            Creation reward:
                            <span className="font-bold ml-1 text-green-400">$500.00</span> will be credited instantly.
                        </p>
                    </div>

                    <div className="space-y-8">

                        {/* ---------------- TITLE ---------------- */}
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Course Title</label>
                            <input
                                type="text"
                                value={newCourse.title}
                                onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                                disabled={isLoading}
                                className={`w-full px-4 py-3 bg-transparent border-b border-gray-600 text-white focus:border-cyan-400 transition-all ${
                                    isLoading ? 'opacity-60 cursor-not-allowed' : ''
                                }`}
                                placeholder="e.g., Quantum Computing Fundamentals"
                                required
                            />
                        </div>

                        {/* ---------------- DESCRIPTION ---------------- */}
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Description / Objectives</label>
                            <textarea
                                value={newCourse.description}
                                onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                                className="w-full px-4 py-3 bg-transparent border-b border-gray-600 text-white h-32 focus:border-cyan-400 transition-all"
                                placeholder="Briefly describe the learning outcome..."
                                required
                            />
                        </div>

                        {/* ---------------- PRICE ---------------- */}
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Course Price ($)</label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={newCourse.price}
                                onChange={(e) => setNewCourse({ ...newCourse, price: e.target.value })}
                                className="w-full px-4 py-3 bg-transparent border-b border-gray-600 text-white focus:border-cyan-400 transition-all"
                                placeholder="e.g., 99.99"
                                required
                            />
                        </div>

                        {/* ---------------- IMAGE ---------------- */}
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Image File (Thumbnail)</label>
                            <div className="flex items-center space-x-4">
                                <input
                                    id="image-upload"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setNewCourse({ ...newCourse, image: e.target.files[0] })}
                                    className="hidden"
                                    required
                                />
                                <motion.label
                                    htmlFor="image-upload"
                                    whileHover={{ scale: 1.02 }}
                                    className="cursor-pointer bg-gray-700 hover:bg-cyan-600 text-white py-2 px-4 rounded-lg border border-gray-600 flex items-center"
                                >
                                    <Upload className="w-4 h-4 mr-2" />
                                    {newCourse.image ? "Change Image" : "Choose Image"}
                                </motion.label>
                                <p className="text-sm text-gray-300 truncate">
                                    {newCourse.image ? newCourse.image.name : "No image selected"}
                                </p>
                            </div>
                        </div>

                        {/* ---------------- VIDEO ---------------- */}
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Video File (Content)</label>
                            <div className="flex items-center space-x-4">
                                <input
                                    id="video-upload"
                                    type="file"
                                    accept="video/*"
                                    onChange={(e) => setNewCourse({ ...newCourse, video: e.target.files[0] })}
                                    className="hidden"
                                    required
                                />
                                <motion.label
                                    htmlFor="video-upload"
                                    whileHover={{ scale: 1.02 }}
                                    className="cursor-pointer bg-gray-700 hover:bg-cyan-600 text-white py-2 px-4 rounded-lg border border-gray-600 flex items-center"
                                >
                                    <Upload className="w-4 h-4 mr-2" />
                                    {newCourse.video ? "Change Video" : "Choose Video"}
                                </motion.label>
                                <p className="text-sm text-gray-300 truncate">
                                    {newCourse.video ? newCourse.video.name : "No video selected"}
                                </p>
                            </div>
                        </div>

                        {/* ---------------- MATERIAL UPLOAD ---------------- */}
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Upload Additional Materials</label>

                            <input
                                multiple
                                id="material-upload"
                                type="file"
                                accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,.txt,.xlsx"
                                onChange={(e) =>
                                    setNewCourse({
                                        ...newCourse,
                                        materials: [...e.target.files]
                                    })
                                }
                                className="hidden"
                            />

                            <motion.label
                                htmlFor="material-upload"
                                whileHover={{ scale: 1.02 }}
                                className="cursor-pointer bg-gray-700 hover:bg-indigo-600 text-white py-2 px-4 rounded-lg border border-gray-600 flex items-center"
                            >
                                <Upload className="w-4 h-4 mr-2" />
                                Upload Materials
                            </motion.label>

                            <ul className="mt-3 space-y-1 text-gray-300 text-sm">
                                {newCourse.materials?.length > 0 ? (
                                    [...newCourse.materials].map((file, idx) => (
                                        <li key={idx} className="truncate">{file.name}</li>
                                    ))
                                ) : (
                                    <p>No materials uploaded.</p>
                                )}
                            </ul>
                        </div>

                        {/* ---------------- MCQ QUESTIONS ---------------- */}
                        <div className="border border-gray-700 rounded-xl p-4">
                            <div className="flex justify-between mb-3 items-center">
                                <h3 className="text-cyan-300 font-semibold">MCQ Questions</h3>

                                <button
                                    onClick={() => {
                                        setNewCourse(prev => ({
                                            ...prev,
                                            mcqs: [
                                                ...prev.mcqs,
                                                { question: "", options: ["", "", "", ""], correct_option: 0 }
                                            ]
                                        }));
                                    }}

                                    className="bg-cyan-600 px-3 py-1 rounded-md text-sm text-gray-900 font-bold"
                                >
                                    + Add MCQ
                                </button>
                            </div>

                            {newCourse.mcqs?.map((mcq, index) => (
                                <div key={index} className="bg-gray-700 p-3 rounded-lg mb-4 relative">
                                    <button
                                        onClick={() => {
                                            const updated = newCourse.mcqs.filter((_, i) => i !== index);
                                            setNewCourse({ ...newCourse, mcqs: updated });
                                        }}
                                        className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors"
                                        title="Remove MCQ"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                    <input
                                        type="text"
                                        placeholder="MCQ Question"
                                        value={mcq.question}
                                        onChange={(e) => {
                                            const updated = [...newCourse.mcqs];
                                            updated[index].question = e.target.value;
                                            setNewCourse({ ...newCourse, mcqs: updated });
                                        }}
                                        className="w-full mb-3 bg-transparent border-b border-gray-500 text-white p-2"
                                    />

                                    <p className="text-gray-400 text-sm mb-2">Select the correct option:</p>
                                    {mcq.options.map((opt, i) => (
                                        <div key={i} className="flex items-center mb-2">
                                            <input
                                                type="radio"
                                                name={`mcq-${index}`}
                                                checked={mcq.correct_option === i}
                                                onChange={() => {
                                                    const updated = [...newCourse.mcqs];
                                                    updated[index].correct_option = i;
                                                    setNewCourse({ ...newCourse, mcqs: updated });
                                                }}
                                                className="mr-3 w-4 h-4 text-cyan-600 focus:ring-cyan-500 border-gray-300"
                                            />
                                            <input
                                                type="text"
                                                placeholder={`Option ${i + 1}`}
                                                value={opt}
                                                onChange={(e) => {
                                                    const updated = [...newCourse.mcqs];
                                                    updated[index].options[i] = e.target.value;
                                                    setNewCourse({ ...newCourse, mcqs: updated });
                                                }}
                                                className="w-full bg-transparent border-b border-gray-600 text-white p-2"
                                            />
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>

                        {/* ---------------- CQ QUESTIONS ---------------- */}
                        <div className="border border-gray-700 rounded-xl p-4">
                            <div className="flex justify-between mb-3 items-center">
                                <h3 className="text-cyan-300 font-semibold">CQ Questions</h3>

                                <button
                                    onClick={() => {
                                        setNewCourse(prev => ({
                                            ...prev,
                                            cqs: [
                                                ...prev.cqs,
                                                { question: "", answer: "" }
                                            ]
                                        }));
                                    }}

                                    className="bg-cyan-600 px-3 py-1 rounded-md text-sm text-gray-900 font-bold"
                                >
                                    + Add CQ
                                </button>
                            </div>

                            {newCourse.cqs?.map((cq, index) => (
                                <div key={index} className="bg-gray-700 p-3 rounded-lg mb-4 relative">
                                    <button
                                        onClick={() => {
                                            const updated = newCourse.cqs.filter((_, i) => i !== index);
                                            setNewCourse({ ...newCourse, cqs: updated });
                                        }}
                                        className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors"
                                        title="Remove CQ"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                    <input
                                        type="text"
                                        placeholder="CQ Question"
                                        value={cq.question}
                                        onChange={(e) => {
                                            const updated = [...newCourse.cqs];
                                            updated[index].question = e.target.value;
                                            setNewCourse({ ...newCourse, cqs: updated });
                                        }}
                                        className="w-full mb-3 bg-transparent border-b border-gray-500 text-white p-2"
                                    />

                                    <textarea
                                        placeholder="CQ Answer"
                                        value={cq.answer}
                                        onChange={(e) => {
                                            const updated = [...newCourse.cqs];
                                            updated[index].answer = e.target.value;
                                            setNewCourse({ ...newCourse, cqs: updated });
                                        }}
                                        className="w-full bg-transparent border border-gray-500 text-white p-2 h-24 rounded-md"
                                    />
                                </div>
                            ))}
                        </div>

                        {/* ---------------- SUBMIT ---------------- */}
                        <motion.button
                            onClick={onSubmit}
                            disabled={isLoading}
                            className={`w-full py-4 rounded-xl font-bold uppercase shadow-lg flex items-center justify-center transition-all ${
                                isLoading 
                                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed shadow-gray-600/50' 
                                    : 'bg-cyan-500 text-gray-900 hover:bg-cyan-400 shadow-cyan-500/50'
                            }`}
                        >
                            {isLoading ? (
                                <>
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                        className="w-5 h-5 mr-2"
                                    >
                                        <svg className="w-full h-full" viewBox="0 0 24 24" fill="none">
                                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.2" />
                                            <path
                                                d="M12 2a10 10 0 0 1 10 10"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                    </motion.div>
                                    CREATING COURSE...
                                </>
                            ) : (
                                <>
                                    <Upload className="w-5 h-5 mr-2" />
                                    CREATE COURSE
                                </>
                            )}
                        </motion.button>
                    </div>

                    {/* Loading Overlay */}
                    <AnimatePresence>
                        {isLoading && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center"
                            >
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                    className="mb-4"
                                >
                                    <div className="relative w-16 h-16">
                                        <svg className="w-full h-full" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                                            <circle
                                                cx="50"
                                                cy="50"
                                                r="45"
                                                stroke="rgba(34, 211, 238, 0.2)"
                                                strokeWidth="8"
                                                fill="none"
                                            />
                                            <motion.circle
                                                cx="50"
                                                cy="50"
                                                r="45"
                                                stroke="#22d3ee"
                                                strokeWidth="8"
                                                fill="none"
                                                strokeDasharray="283"
                                                initial={{ strokeDashoffset: 283 }}
                                                animate={{ strokeDashoffset: [283, 0, 283] }}
                                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                    </div>
                                </motion.div>
                                <p className="text-cyan-400 font-semibold text-lg">Creating Your Course...</p>
                                <p className="text-gray-400 text-sm mt-2">Please wait while we upload your course</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default CreateCourseModal;

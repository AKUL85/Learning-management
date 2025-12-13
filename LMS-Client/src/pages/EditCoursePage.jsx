import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Upload, Save, ArrowLeft, Plus, X, FileText, Video, Trash2, CheckCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export default function EditCoursePage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { profile } = useAuth();

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [course, setCourse] = useState(null);

    // Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');

    // New additions
    const [newMaterials, setNewMaterials] = useState([]);
    const [newVideo, setNewVideo] = useState(null);
    const [newThumbnail, setNewThumbnail] = useState(null);

    // Lists (We load existing and allow adding more)
    const [mcqs, setMcqs] = useState([]);
    const [cqs, setCqs] = useState([]);
    const [requirements, setRequirements] = useState([]);
    const [audience, setAudience] = useState([]);

    useEffect(() => {
        fetchCourse();
    }, [id]);

    const fetchCourse = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/courses/${id}`);
            if (!res.ok) throw new Error('Failed to load course');
            const data = await res.json();

            setCourse(data);
            setTitle(data.title);
            setDescription(data.description);
            setPrice(data.price);
            setMcqs(data.mcqs || []);
            setCqs(data.cqs || []);
            setRequirements(data.requirements || []);
            setAudience(data.audience || []);

        } catch (error) {
            console.error(error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to load course details',
                background: '#1f2937',
                color: '#fff'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            formData.append('price', price);

            // Append MCQs and CQs (Filter out incomplete ones to avoid validation errors)
            const validMcqs = mcqs
                .filter(m => m.question.trim() !== "" && m.options.every(o => o.trim() !== ""))
                .map(m => ({
                    ...m,
                    correct_option: (typeof m.correct_option === 'number' && m.correct_option >= 0 && m.correct_option < 4) ? m.correct_option : 0
                }));
            const validCqs = cqs.filter(c => c.question.trim() !== "" && c.answer.trim() !== "");

            formData.append('mcqs', JSON.stringify(validMcqs));
            formData.append('cqs', JSON.stringify(validCqs));

            const validRequirements = requirements.filter(r => r.trim() !== "");
            const validAudience = audience.filter(a => a.trim() !== "");
            formData.append('requirements', JSON.stringify(validRequirements));
            formData.append('audience', JSON.stringify(validAudience));

            // Append new files
            newMaterials.forEach(file => {
                formData.append('materials', file);
            });

            if (newVideo) {
                formData.append('video', newVideo);
            }

            if (newThumbnail) {
                formData.append('image', newThumbnail);
            }

            const res = await fetch(`${API_BASE}/api/courses/${id}`, {
                method: 'PUT',
                credentials: 'include',
                body: formData
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || errorData.message || "Failed to update course");
            }

            await Swal.fire({
                title: 'Success!',
                text: 'Course protocol updated successfully.',
                icon: 'success',
                background: '#1f2937',
                color: '#fff',
                confirmButtonColor: '#0891b2'
            });
            navigate('/instructor-dashboard');

        } catch (error) {
            console.error(error);
            Swal.fire({
                title: 'Update Failed',
                text: error.message,
                icon: 'error',
                background: '#1f2937',
                color: '#fff',
                confirmButtonColor: '#ef4444'
            });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <Navbar />

            <div className="max-w-4xl mx-auto px-4 py-12">
                <button onClick={() => navigate('/instructor-dashboard')} className="flex items-center text-gray-400 hover:text-white mb-6">
                    <ArrowLeft className="w-5 h-5 mr-2" /> Back to Dashboard
                </button>

                <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700 shadow-xl">
                    <h1 className="text-3xl font-bold text-cyan-400 mb-8">Update Protocol: {course.title}</h1>

                    <form onSubmit={handleUpdate} className="space-y-8">

                        {/* Basic Info */}
                        <div className="grid grid-cols-1 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Protocol Title</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-cyan-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-cyan-500 outline-none h-32"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Price ($)</label>
                                <input
                                    type="number"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-cyan-500 outline-none"
                                />
                            </div>
                        </div>

                        {/* Requirements & Audience */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-gray-700/30 p-6 rounded-xl border border-gray-600">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-xl font-semibold text-white">Requirements</h3>
                                    <button type="button" onClick={() => setRequirements([...requirements, ""])} className="text-sm bg-cyan-600 px-3 py-1 rounded hover:bg-cyan-500"><Plus className="w-4 h-4" /></button>
                                </div>
                                {requirements.map((req, idx) => (
                                    <div key={idx} className="flex items-center mb-2">
                                        <input
                                            type="text"
                                            value={req}
                                            onChange={(e) => {
                                                const newReqs = [...requirements];
                                                newReqs[idx] = e.target.value;
                                                setRequirements(newReqs);
                                            }}
                                            placeholder="E.g. Basic JS knowledge"
                                            className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white outline-none focus:border-cyan-500"
                                        />
                                        <button type="button" onClick={() => setRequirements(requirements.filter((_, i) => i !== idx))} className="ml-2 text-red-400 hover:text-red-300"><X className="w-4 h-4" /></button>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-gray-700/30 p-6 rounded-xl border border-gray-600">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-xl font-semibold text-white">Target Audience</h3>
                                    <button type="button" onClick={() => setAudience([...audience, ""])} className="text-sm bg-cyan-600 px-3 py-1 rounded hover:bg-cyan-500"><Plus className="w-4 h-4" /></button>
                                </div>
                                {audience.map((aud, idx) => (
                                    <div key={idx} className="flex items-center mb-2">
                                        <input
                                            type="text"
                                            value={aud}
                                            onChange={(e) => {
                                                const newAud = [...audience];
                                                newAud[idx] = e.target.value;
                                                setAudience(newAud);
                                            }}
                                            placeholder="E.g. Beginners in React"
                                            className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white outline-none focus:border-cyan-500"
                                        />
                                        <button type="button" onClick={() => setAudience(audience.filter((_, i) => i !== idx))} className="ml-2 text-red-400 hover:text-red-300"><X className="w-4 h-4" /></button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* File Uploads */}
                        <div className="bg-gray-700/30 p-6 rounded-xl border border-gray-600">
                            <h3 className="text-xl font-semibold text-white mb-4 flex items-center"><Upload className="w-5 h-5 mr-2 text-cyan-400" /> Add New Resources</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Upload NEW Materials (Appends to list)</label>
                                    <input
                                        type="file"
                                        multiple
                                        onChange={(e) => setNewMaterials([...e.target.files])}
                                        className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-600 file:text-white hover:file:bg-cyan-700"
                                    />
                                    {newMaterials.length > 0 && <p className="mt-2 text-green-400 text-sm">{newMaterials.length} files selected</p>}
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Upload NEW Video Module</label>
                                    <input
                                        type="file"
                                        accept="video/*"
                                        onChange={(e) => setNewVideo(e.target.files[0])}
                                        className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700"
                                    />
                                    {newVideo && <p className="mt-2 text-green-400 text-sm">Video selected: {newVideo.name}</p>}
                                </div>
                            </div>
                        </div>

                        {/* MCQs */}
                        <div className="bg-gray-700/30 p-6 rounded-xl border border-gray-600">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-semibold text-white flex items-center"><FileText className="w-5 h-5 mr-2 text-yellow-400" /> Manage MCQs</h3>
                                <button type="button" onClick={() => setMcqs([...mcqs, { question: "", options: ["", "", "", ""], correct_option: 0 }])} className="text-sm bg-yellow-600 px-3 py-1 rounded hover:bg-yellow-500">+ Add MCQ</button>
                            </div>

                            {mcqs.map((mcq, idx) => (
                                <div key={idx} className="bg-gray-800 p-4 rounded-lg mb-4 border border-gray-600 relative">
                                    <button type="button" onClick={() => setMcqs(mcqs.filter((_, i) => i !== idx))} className="absolute top-2 right-2 text-red-500 hover:text-red-400"><X className="w-4 h-4" /></button>
                                    <input
                                        type="text"
                                        value={mcq.question}
                                        onChange={(e) => {
                                            const newMcqs = [...mcqs];
                                            newMcqs[idx].question = e.target.value;
                                            setMcqs(newMcqs);
                                        }}
                                        placeholder="Question"
                                        className="w-full bg-transparent border-b border-gray-500 mb-3 text-white outline-none"
                                    />
                                    <div className="space-y-2">
                                        {mcq.options.map((opt, optIdx) => (
                                            <div key={optIdx} className="flex items-center">
                                                <input
                                                    type="radio"
                                                    name={`mcq-${idx}`}
                                                    checked={mcq.correct_option === optIdx}
                                                    onChange={() => {
                                                        const newMcqs = [...mcqs];
                                                        newMcqs[idx].correct_option = optIdx;
                                                        setMcqs(newMcqs);
                                                    }}
                                                    className="mr-3"
                                                />
                                                <input
                                                    type="text"
                                                    value={opt}
                                                    onChange={(e) => {
                                                        const newMcqs = [...mcqs];
                                                        newMcqs[idx].options[optIdx] = e.target.value;
                                                        setMcqs(newMcqs);
                                                    }}
                                                    placeholder={`Option ${optIdx + 1}`}
                                                    className="w-full bg-transparent border-b border-gray-600 text-sm text-gray-300 outline-none"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* CQs */}
                        <div className="bg-gray-700/30 p-6 rounded-xl border border-gray-600">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-semibold text-white flex items-center"><FileText className="w-5 h-5 mr-2 text-purple-400" /> Manage CQs</h3>
                                <button type="button" onClick={() => setCqs([...cqs, { question: "", answer: "" }])} className="text-sm bg-purple-600 px-3 py-1 rounded hover:bg-purple-500">+ Add CQ</button>
                            </div>

                            {cqs.map((cq, idx) => (
                                <div key={idx} className="bg-gray-800 p-4 rounded-lg mb-4 border border-gray-600 relative">
                                    <button type="button" onClick={() => setCqs(cqs.filter((_, i) => i !== idx))} className="absolute top-2 right-2 text-red-500 hover:text-red-400"><X className="w-4 h-4" /></button>
                                    <input
                                        type="text"
                                        value={cq.question}
                                        onChange={(e) => {
                                            const newCqs = [...cqs];
                                            newCqs[idx].question = e.target.value;
                                            setCqs(newCqs);
                                        }}
                                        placeholder="Question"
                                        className="w-full bg-transparent border-b border-gray-500 mb-3 text-white outline-none"
                                    />
                                    <textarea
                                        value={cq.answer}
                                        onChange={(e) => {
                                            const newCqs = [...cqs];
                                            newCqs[idx].answer = e.target.value;
                                            setCqs(newCqs);
                                        }}
                                        placeholder="Answer"
                                        className="w-full bg-transparent border border-gray-600 rounded p-2 text-sm text-gray-300 outline-none h-20"
                                    />
                                </div>
                            ))}
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full bg-cyan-600 py-4 rounded-xl text-lg font-bold hover:bg-cyan-500 transition-colors flex items-center justify-center shadow-lg"
                        >
                            {submitting ? 'Updating...' : <><Save className="w-5 h-5 mr-2" /> Update Protocol Data</>}
                        </button>

                    </form>
                </div>
            </div>
        </div>
    );
}

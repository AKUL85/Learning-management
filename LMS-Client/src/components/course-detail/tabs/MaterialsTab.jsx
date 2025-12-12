// src/components/course-detail/tabs/MaterialsTab.jsx
import { motion } from 'framer-motion';
import { Download, FileText, File, Video, Music, Image, Archive, CheckCircle } from 'lucide-react';

const getFileIcon = (type) => {
  switch (type) {
    case 'pdf': return <FileText className="w-8 h-8 text-red-400" />;
    case 'doc': case 'txt': return <File className="w-8 h-8 text-blue-400" />;
    case 'video': return <Video className="w-8 h-8 text-purple-400" />;
    case 'audio': return <Music className="w-8 h-8 text-yellow-400" />;
    case 'image': return <Image className="w-8 h-8 text-green-400" />;
    case 'zip': case 'rar': return <Archive className="w-8 h-8 text-orange-400" />;
    default: return <FileText className="w-8 h-8 text-gray-400" />;
  }
};

const MaterialItem = ({ material }) => {
  const { title, type, size, url, downloaded } = material;
    console.log(material)
  return (
    <motion.div
      whileHover={{ scale: 1.02, boxShadow: "0 10px 20px rgba(6, 182, 212, 0.15)" }}
      className="flex items-center justify-between p-5 bg-gray-800/50 rounded-xl border border-gray-700 hover:border-cyan-600 transition-all"
    >
      <div className="flex items-center space-x-4">
        {getFileIcon(type)}
        <div>
          <h4 className="font-medium text-white truncate max-w-[300px]">{title}</h4>
          <p className="text-sm text-gray-400">{size} • {(type || '').toUpperCase()}</p>

        </div>
      </div>

      <div className="flex items-center space-x-4">
        {downloaded ? (
          <div className="flex items-center text-green-400 text-sm">
            <CheckCircle className="w-5 h-5 mr-2" />
            Downloaded
          </div>
        ) : null}

        <a
          href={url}
          download
          className="bg-cyan-500 hover:bg-cyan-400 text-gray-900 px-6 py-2 rounded-lg font-medium flex items-center space-x-2 transition"
        >
          <Download className="w-5 h-5" />
          <span>Download</span>
        </a>
      </div>
    </motion.div>
  );
};

export default function MaterialsTab({ materials = [] }) {
  if (!materials || materials.length === 0) {
    return (
      <div className="text-center py-16 bg-gray-800/30 rounded-xl border border-gray-700">
        <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <p className="text-xl text-gray-400 mb-2">No materials available yet</p>
        <p className="text-gray-500">Check back after enrolling!</p>
      </div>
    );
  }

  const totalSize = materials.reduce((acc, m) => acc + parseFloat(m.size), 0).toFixed(1);

  return (
    <div className="space-y-8">
      {/* Header Stats */}
      <div className="bg-gradient-to-r from-cyan-900/20 to-blue-900/20 rounded-xl p-6 border border-cyan-700/30">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="text-2xl font-bold text-white mb-2">Course Resources</h3>
            <p className="text-gray-300">{materials.length} downloadable files</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">Total size</p>
            <p className="text-2xl font-bold text-cyan-400">{totalSize} MB</p>
          </div>
        </div>
      </div>

      {/* Materials List */}
      <div className="space-y-4">
        {materials.map((material, index) => (
          <motion.div
            key={material.id || index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <MaterialItem material={material} />
          </motion.div>
        ))}
      </div>

      {/* Tips Section */}
      <div className="mt-8 p-6 bg-gray-800/50 rounded-xl border border-gray-700">
        <h4 className="text-lg font-bold text-white mb-4">Pro Tips</h4>
        <ul className="space-y-3 text-gray-300">
          <li className="flex items-start">
            <CheckCircle className="w-5 h-5 text-green-400 mr-3 mt-1" />
            Download all files at once using the ZIP option above
          </li>
          <li className="flex items-start">
            <CheckCircle className="w-5 h-5 text-green-400 mr-3 mt-1" />
            Files are offline-accessible forever after download
          </li>
          <li className="flex items-start">
            <CheckCircle className="w-5 h-5 text-green-400 mr-3 mt-1" />
            Need help? Ask in the Q&A section!
          </li>
        </ul>
      </div>
    </div>
  );
}
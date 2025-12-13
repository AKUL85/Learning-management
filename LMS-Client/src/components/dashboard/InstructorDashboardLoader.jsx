import Navbar from '../Navbar';

const InstructorDashboardLoader = () => {
    return (
        <div className="min-h-screen bg-gray-900">
            <Navbar />
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <svg className="animate-spin h-12 w-12 text-cyan-400 mx-auto" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <p className="mt-4 text-gray-400">Synchronizing Instructor Console...</p>
                </div>
            </div>
        </div>
    );
};

export default InstructorDashboardLoader;

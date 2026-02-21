import CourseItem from './CourseItem';

const CourseList = ({ enrollments, selectedCourseId, onToggleCourse, materials }) => {
    return (
        <div className="bg-gray-800/80 backdrop-blur-sm rounded-lg border border-gray-700 shadow-2xl">
            <div className="p-4 border-b border-gray-700 bg-gray-700/50">
                <h2 className="text-xl font-bold text-white tracking-wider">MY ENROLLED COURSES</h2>
            </div>

            <div className="divide-y divide-gray-700">
                {enrollments.map((enrollment) => (
                    <CourseItem
                        key={enrollment.id}
                        enrollment={enrollment}
                        isExpanded={selectedCourseId === enrollment.course_id}
                        onToggle={() => onToggleCourse(enrollment.course_id)}
                        materials={selectedCourseId === enrollment.course_id ? materials : []}
                    />
                ))}
            </div>
        </div>
    );
};

export default CourseList;

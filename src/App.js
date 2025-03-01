import React, { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, get } from "firebase/database";

// Firebase configurations
const pyqsFirebaseConfig = {
  apiKey: "AIzaSyARqYoNCH33uT1YRbnQkxh3sea6J4OrCeA",
  authDomain: "college-compan.firebaseapp.com",
  databaseURL: "https://college-compan-default-rtdb.firebaseio.com",
  projectId: "college-compan",
  storageBucket: "college-compan.firebasestorage.app",
  messagingSenderId: "878395280502",
  appId: "1:878395280502:web:4f2798a273343cacc46357",
  measurementId: "G-P09934TJSC"
};

const timetableFirebaseConfig = {
  apiKey: "AIzaSyAfDH13V2ArefPXcGmenKnu76b74vfzTvk",
  authDomain: "timetable-91797.firebaseapp.com",
  databaseURL: "https://timetable-91797-default-rtdb.firebaseio.com",
  projectId: "timetable-91797",
  storageBucket: "timetable-91797.firebasestorage.app",
  messagingSenderId: "1061503018666",
  appId: "1:1061503018666:web:736f540f7f3bfcddbbd2d3",
  measurementId: "G-Q4GEHSZKCS"
};

const classroomFirebaseConfig = {
  apiKey: "AIzaSyA3j0lWYd_ZPpz_YnmuyyJzCYCSG1iiNqA",
  authDomain: "classroom-f5017.firebaseapp.com",
  databaseURL: "https://classroom-f5017-default-rtdb.firebaseio.com",
  projectId: "classroom-f5017",
  storageBucket: "classroom-f5017.firebasestorage.app",
  messagingSenderId: "90878288175",
  appId: "1:90878288175:web:83a433b57f45dcc4ea01da",
  measurementId: "G-R683V922Z6"
};

// Constants
const subjects = [
  { name: "Design and Analysis of Algorithms", code: "DAA" },
  { name: "Network Operating System", code: "NOS" },
  { name: "Theory of Computation", code: "TOC" },
  { name: "Computer Networks", code: "CN" },
  { name: "MicroServices Architecture", code: "MSA" },
];

const years = ["2024", "2023", "2022", "2021", "2020"];
const timeSlots = [
  "9:30 AM - 10:20 AM",
  "10:20 AM - 11:10 AM",
  "11:10 AM - 12:00 PM",
  "12:10 PM - 13:00 PM",
  "13:55 PM - 14:45 PM",
  "14:45 PM - 15:35 PM",
  "15:35 PM - 16:25 PM"
];

const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday"
];

const teachers = [
  "Ankit Garg",
  "Shilpa Sharma",
  "Bhavna Nayyer",
  "Alok Das",
  "Rubbina",
  "Amardeep Singh",
  "Deepti Sharma",
  "Dhawan Singh",
  "Anil Sharma",
  "Vijay Mohan Shrimal",
  "Prince Pal Singh",
  "Kamaljit Saini"
];

// Initialize Firebase apps
let pyqsDb, timetableDb, classroomDb;

try {
    const pyqsApp = initializeApp(pyqsFirebaseConfig, 'pyqs');
    const timetableApp = initializeApp(timetableFirebaseConfig, 'timetable');
    const classroomApp = initializeApp(classroomFirebaseConfig, 'classroom');
    
    pyqsDb = getDatabase(pyqsApp);
    timetableDb = getDatabase(timetableApp);
    classroomDb = getDatabase(classroomApp);
    
    console.log("Firebase apps initialized successfully");
} catch (error) {
    console.error("Error initializing Firebase apps:", error);
}

export default function App() {
    // State variables
    const [currentPage, setCurrentPage] = useState("home");
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [selectedYear, setSelectedYear] = useState(null);
    const [pdfFiles, setPdfFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedTeacher, setSelectedTeacher] = useState("");
    const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
    const [selectedDay, setSelectedDay] = useState("");
    const [roomNumber, setRoomNumber] = useState("");
    const [freeRooms, setFreeRooms] = useState([]);
    const [searchPerformed, setSearchPerformed] = useState(false);

    // Clear error on input change
    useEffect(() => {
        setError(null);
        setSearchPerformed(false);
    }, [selectedSubject, selectedYear, selectedTeacher, selectedDay, selectedTimeSlot]);

    // Handler functions
    const handleTimeTableSearch = async () => {
        if (!selectedTeacher || !selectedDay || !selectedTimeSlot) {
            setError("Please select all fields");
            return;
        }

        try {
            const dbRef = ref(timetableDb, `timetable/${selectedDay}`);
            const snapshot = await get(dbRef);

            if (snapshot.exists()) {
                const data = snapshot.val();
                const teacherEntry = Object.entries(data).find(([key]) => 
                    key.startsWith(selectedTeacher)
                );

                if (teacherEntry) {
                    const [_, schedule] = teacherEntry;
                    const location = schedule[selectedTimeSlot];
                    
                    if (location && location !== "FREE") {
                        setRoomNumber(location);
                        setError(null);
                    } else {
                        setRoomNumber("Teacher is FREE during this time slot");
                        setError(null);
                    }
                } else {
                    setRoomNumber("Teacher not found in schedule");
                    setError(null);
                }
            } else {
                setRoomNumber("No schedule found for this day");
                setError(null);
            }
        } catch (err) {
            console.error("Error fetching teacher location:", err);
            setError("Failed to fetch location data. Please try again later.");
        }
    };

    const handleClassroomSearch = async () => {
        if (!selectedDay || !selectedTimeSlot) {
            setError("Please select both day and time slot");
            return;
        }

        setLoading(true);
        setError(null);
        setFreeRooms([]);
        setSearchPerformed(true);

        try {
            const dbRef = ref(classroomDb, `class_availability/${selectedDay}`);
            const snapshot = await get(dbRef);

            if (snapshot.exists()) {
                const classroomData = snapshot.val();
                const availableRooms = [];

                Object.entries(classroomData).forEach(([roomNumber, schedule]) => {
                    if (schedule[selectedTimeSlot] === "Free") {
                        availableRooms.push(roomNumber);
                    }
                });

                setFreeRooms(availableRooms);
                if (availableRooms.length === 0) {
                    setError("No classrooms are available during this time slot");
                }
            } else {
                setError("No data found for the selected day");
            }
        } catch (err) {
            console.error("Error fetching classroom data:", err);
            setError("Failed to fetch classroom data. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const fetchPdfs = async (subjectCode, year) => {
        if (!subjectCode || !year) {
            setError("Please select both subject and year");
            return;
        }

        setLoading(true);
        setError(null);
        setPdfFiles([]);

        try {
            const dbRef = ref(pyqsDb, `pyqs/${subjectCode}/${year}`);
            const snapshot = await get(dbRef);

            if (!snapshot.exists()) {
                setError(`No PDFs found for ${subjectCode} - ${year}`);
                setLoading(false);
                return;
            }

            const data = snapshot.val();
            const pdfList = Object.entries(data).map(([name, url]) => ({ name, url }));
            setPdfFiles(pdfList);
        } catch (err) {
            console.error("Error fetching PDFs:", err);
            setError("Failed to fetch PDFs. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    // Component Definitions
    const HomePage = () => (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
            <div className="max-w-7xl mx-auto px-4 py-16">
                <h1 className="text-4xl font-bold text-center text-gray-900 mb-4">
                    College Companion
                </h1>
                <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
                    Access previous year question papers and find your teachers' current locations with ease
                </p>
                
                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    <button
                        onClick={() => setCurrentPage("pyqs")}
                        className="group relative bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">PYQs Repository</h2>
                        <p className="text-gray-600 mb-4">
                            Access previous year question papers for all subjects
                        </p>
                        <span className="text-blue-500 group-hover:text-blue-600">
                            Browse Papers →
                        </span>
                    </button>

                    <button
                        onClick={() => setCurrentPage("timetable")}
                        className="group relative bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Teacher's Timetable</h2>
                        <p className="text-gray-600 mb-4">
                            Find where your teachers are during specific time slots
                        </p>
                        <span className="text-blue-500 group-hover:text-blue-600">
                            Check Location →
                        </span>
                    </button>

                    <button
                        onClick={() => setCurrentPage("classroom")}
                        className="group relative bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Classroom Availability</h2>
                        <p className="text-gray-600 mb-4">
                            Find which classrooms are free during particular time slots
                        </p>
                        <span className="text-blue-500 group-hover:text-blue-600">
                            Find Class →
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );

    const NavigationHeader = () => (
        <div className="bg-white shadow">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center space-x-8 h-16">
                    <button
                        className="text-gray-500 hover:text-gray-900"
                        onClick={() => setCurrentPage("home")}
                    >
                        ← Back to Home
                    </button>
                    <h2 className="text-lg font-medium text-gray-900">
                        {currentPage === "pyqs" ? "PYQs Repository" : 
                         currentPage === "timetable" ? "Teacher's Timetable" : 
                         "Classroom Availability"}
                    </h2>
                </div>
            </div>
        </div>
    );

    const TeacherTimetable = () => (
        <div>
            <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
                Teacher's Timetable
            </h1>
            <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
                <div className="space-y-4">
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Select Teacher
                        </label>
                        <select
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            value={selectedTeacher}
                            onChange={(e) => setSelectedTeacher(e.target.value)}
                        >
                            <option value="">Choose a teacher</option>
                            {teachers.map((teacher) => (
                                <option key={teacher} value={teacher}>
                                    {teacher}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Select Day
                        </label>
                        <select
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            value={selectedDay}
                            onChange={(e) => setSelectedDay(e.target.value)}
                        >
                            <option value="">Choose a day</option>
                            {days.map((day) => (
                                <option key={day} value={day}>
                                    {day}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Select Time Slot
                        </label>
                        <select
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            value={selectedTimeSlot}
                            onChange={(e) => setSelectedTimeSlot(e.target.value)}
                        >
                            <option value="">Choose a time slot</option>
                            {timeSlots.map((slot) => (
                                <option key={slot} value={slot}>
                                    {slot}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button
                        onClick={handleTimeTableSearch}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                    >
                        Find Location
                    </button>

                    {roomNumber && (
                        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Location Found</h3>
                            <p className="text-gray-700">{roomNumber}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    const ClassroomAvailability = () => (
        <div>
            <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
                Classroom Availability
            </h1>
            <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
                <div className="space-y-4">
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Select Day
                        </label>
                        <select
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            value={selectedDay}
                            onChange={(e) => setSelectedDay(e.target.value)}
                        >
                            <option value="">Choose a day</option>
                            {days.map((day) => (
                                <option key={day} value={day}>
                                    {day}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Select Time Slot
                        </label>
                        <select
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            value={selectedTimeSlot}
                            onChange={(e) => setSelectedTimeSlot(e.target.value)}
                        >
                            <option value="">Choose a time slot</option>
                            {timeSlots.map((slot) => (
                                <option key={slot} value={slot}>
                                    {slot}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button
                        onClick={handleClassroomSearch}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                    >
                        Find Available Classrooms
                    </button>

                    {loading && (
                        <div className="flex justify-center mt-4">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                        </div>
                    )}

                    {!loading && searchPerformed && freeRooms.length > 0 && (
                        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                All available classrooms in D2 at this time are:
                            </h3>
                            <div className="grid grid-cols-4 gap-3">
                                {freeRooms.map((room) => (
                                    <div
                                        key={room}
                                        className="bg-white p-3 rounded-md border border-green-300 text-center font-medium text-gray-700"
                                    >
                                        Room {room}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    const PYQsRepository = () => (
        <div>
            <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
                PYQs Repository
            </h1>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {subjects.map((subject) => (
                    <button
                        key={subject.code}
                        className={`
                            p-4 rounded-lg transition-colors
                            ${
                                selectedSubject === subject.code
                                    ? "bg-blue-100 border-blue-300"
                                    : "bg-white hover:bg-blue-50 border-gray-200"
                            }
                            border shadow-sm hover:shadow-md
                            text-gray-800 text-sm md:text-base
                        `}
                        onClick={() => {
                            setSelectedSubject(subject.code);
                            setSelectedYear(null);
                            setPdfFiles([]);
                        }}
                    >
                        {subject.name}
                    </button>
                ))}
            </div>

            {selectedSubject && (
                <div className="mt-8">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">
                        Select Year
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {years.map((year) => (
                            <button
                                key={year}
                                className={`
                                    p-4 rounded-lg transition-colors
                                    ${
                                        selectedYear === year
                                            ? "bg-green-100 border-green-300"
                                            : "bg-white hover:bg-green-50 border-gray-200"
                                    }
                                    border shadow-sm hover:shadow-md
                                    text-gray-800
                                `}
                                onClick={() => {
                                    setSelectedYear(year);
                                    fetchPdfs(selectedSubject, year);
                                }}
                            >
                                {year}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {loading && (
                <div className="flex justify-center mt-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
            )}

            {!loading && pdfFiles.length > 0 && (
                <div className="mt-8">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">
                        Available PDFs
                    </h2>
                    <div className="bg-white rounded-lg shadow-sm p-4">
                        <ul className="space-y-2">
                            {pdfFiles.map(({ name, url }, index) => (
                                <li key={index} className="flex items-center hover:bg-gray-50 p-2 rounded">
                                    <a
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-800 hover:underline flex-1"
                                    >
                                        {name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );

    // Main render
    if (currentPage === "home") {
        return <HomePage />;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <NavigationHeader />
            <div className="max-w-7xl mx-auto px-4 py-6">
                {currentPage === "pyqs" ? (
                    <PYQsRepository />
                ) : currentPage === "timetable" ? (
                    <TeacherTimetable />
                ) : (
                    <ClassroomAvailability />
                )}
            </div>
        </div>
    );
}

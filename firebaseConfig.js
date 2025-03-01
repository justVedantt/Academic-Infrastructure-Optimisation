


import React, { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, get } from "firebase/database";

// Firebase configuration for PYQs (Project 1)
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

// Firebase configuration for Timetable (Project 2)
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
let pyqsDb, timetableDb;
try {
    const pyqsApp = initializeApp(pyqsFirebaseConfig, 'pyqs');
    const timetableApp = initializeApp(timetableFirebaseConfig, 'timetable');
    
    pyqsDb = getDatabase(pyqsApp);
    timetableDb = getDatabase(timetableApp);
    
    console.log("Firebase apps initialized successfully");
} catch (error) {
    console.error("Error initializing Firebase apps:", error);
}
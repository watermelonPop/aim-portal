import '../App.css';
import { useState, useEffect } from 'react';



function StaffTesting(userId){
    /*
    1. should only be viewable to those with testing access.
        1.1 go into loginscreen and make sure that it is sorted by role.
    2. exams should be in list view with click to expand portions for each exam.
        2.2:the expanded form of the list should include: 
            - name of the student
            - date of the exam
            - course of the exam
            - any accomodations regarding the taking of the exam
            - pdf of the exam
    3. include pagination
    4. maybe include a sort by date/class?
    5. ability to upload a completed exam.

    sort exams by the userID?
        -exams are already sorted to advisors

     */

        

    

    const [exams, getExams] = []

    useEffect(()=>{
        console.log("hello world from staff testing!");
        console.log("logged in with userID:", userId);
    },[]);


    
    return (<>
        <div>
            <h2>staff testing </h2>
        </div>
    </>);
}

export default StaffTesting;
**Team Weekly Report**

**Team:** Good AIM  
**Week:** 9 (3/17/2025)  
**Members:** [Simone Kang](mailto:sk21007@tamu.edu), [Diego Lanz](mailto:diegolanz0412@tamu.edu), [Aviral Agarwal](mailto:avirala16@tamu.edu), [Shreyas Kumar](mailto:shreyask25@tamu.edu), [Paul Bae](mailto:pauljwbae@gmail.com)

| Status Report |
| :---- |

This week, we continued implementing more usability features for each different role. The features we finished include: adding more accessibility settings, searching for advisors, settings to handle different disability profiles, advisor settings and the ability to update roles, and the search for students and staff. We also worked on transferring the database to the ORM model in Prisma and began changing the API calls to accommodate that. Another major part of the project includes the ability to securely upload and save files in regulation with HIPPA and FERPA regulations and we have begun working on that as well. Overall, we might be a little behind but we have a good idea of what needs to be done and are actively working on getting back on track.

| Current Status |
| :---- |

1. What did the team work on this past week?

| Task | Task Lead | Status | Notes |
| :---- | :---- | :---- | :---- |
| File storage Azure set up | Shreyas | DONE | Able to access the db and upload files, download files, and integrated with neon db for links to files in account schema |
| Accessibility settings | Simone | DONE |  |
| Disability profiles | Simone | DONE |  |
| Advisor Search | Paul | DONE | One test is timing out, but I do not think its because of incorrect code, rather incorrect testing |
| New student application process | Simone | IN PROGRESS | Still need to integrate file uploads for documentation |
| Advisor Settings/Role Updating | Paul | DONE | The header of the page is shifting, should be an easy fix |
| ORM db population | Paul \+ Shreyas | DONE | Need to find out how to integrate secure files storage  |
| Look into HIPPA and FERPA regulations for safe file transfer and storage | Aviral | DONE | Need to implement HTTP → HTTPS for backend |
| Student Accommodations Request  | Aviral | IN PROGRESS |  |
| Staff Dashboard | Diego | IN PROGRESS | Almost done, just need to fix accessibility  |
| Staff Requests module | Diego | IN PROGRESS |  |
| Staff student search | Diego | DONE |  |
|  |  |  |  |
|  |  |  |  |

   

2. What feedback has the team received?

| From Whom | Feedback | Next Steps |
| :---- | :---- | :---- |
| Justin | disability profiles vs manual adjustments, profiles could potentially be alienating and instead of focusing on disabilities it may be better to focus on the barriers themselves. | decided that we’ll have both profiles and manual adjustments for now, but we need to see from feedback if the disability profiles are helpful |
|  |  |  |

   

3. Are any resources needed? If so, what?

	Matching Polos\!

| Plans for Next Week |
| :---- |

What are your plans for this next week?

| Task | Task Lead | Notes |
| :---- | :---- | :---- |
|  |  |  |
| New student application process | Simone | Finish integrating file storage for documentation |
| Professor side dashboard \+ classes & students | Simone |  |
| Accessibility menu \+ profiles | Simone | Adding color themes \+ keyboard shortcuts & navigation |
| Refactor API endpoints to use prisma schema | Paul \+ Shreyas | Headache inbound |
| Staff View Tech Modules | Paul |  |
| Staff View Test Modules | Paul |  |
| Integrate azure blob storage with neon db so only certain roles can access certain files | Shreyas |  |
| Student View Accommodations | Aviral | Implement Audit Feature |
| Create ORM cheat sheet to help team use Prisma | Shreyas |  |


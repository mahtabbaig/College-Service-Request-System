# Demo Flow (matches the required demo story)

1. Log in as **Student** (`student@college.demo` / `Demo@1234`).
2. Go to **New Request** → choose **Bonafide Certificate** → fill fields → Submit.
3. Note the generated request number, e.g. `CSR-2026-00056`.
4. See it on the Student dashboard / My Requests.
5. Log out, log in as **Service Lead** (`lead@college.demo`).
6. Open the new request from **Dashboard → Awaiting Assignment**; review impact score and SLA countdown.
7. Assign it to a staff member in the relevant department.
8. Log out, log in as **Service Staff** (`staff@college.demo`, or the staff member assigned).
9. Open the request from **Assigned Requests**, move **NEW → IN_PROGRESS** (via ASSIGNED → IN_PROGRESS).
10. Add a comment.
11. Mark it **RESOLVED**.
12. Log back in as the original Student — a notification is waiting.
13. Open the request, click **Confirm & Close** → status becomes **CLOSED**.
14. Log in as **Admin** (`admin@college.demo`) → Dashboard shows updated counts pulled live from MongoDB.
15. Visit **Analytics** for charts, **Campus Heatmap** for location hotspots (the seed data
    includes a deliberate recurring cluster in Hostel Block B and the Computer Lab so
    **Recurring Issues** on the Lead dashboard has something to show).

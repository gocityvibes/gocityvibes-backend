FRONTEND REMINDERS:

✅ You MUST include the following in your frontend to match backend functionality:

1. Language Dropdown:
   - Sends selected language to the backend via `POST /chat`
   - Example: { language: "english" | "spanish" }

2. "More Results" Button:
   - Resends the last message with a `more: true` flag or similar trigger

3. Initial City Selector:
   - Before asking anything, prompt user to input/select their city
   - The backend will only show results for the locked city

---

Use this backend ZIP with the latest approved frontend layout and style.
Read docs/CLAUDE_CODE_FIXES_ROUND_6.md and docs/CLAUDE_CODE_TEST_MODE_V6.md completely before you change anything.

Work in this order and do not skip ahead:

1. Run npm install and npm run build. Tell me if the build already fails before you change anything.
2. Do everything in CLAUDE_CODE_FIXES_ROUND_6.md. Run npm run build. Commit with the message "fixes round 6: remove zorg, hero, game section, contact".
3. Make a short plan for CLAUDE_CODE_TEST_MODE_V6.md and show it to me. Wait for my ok.
4. Build it. Install resend and @vercel/node (as dev dependency for the types). Run npm run build after every bigger step.
5. Test it yourself in the browser at desktop size and at 390px: both flows (?test=klant and ?test=nieuw) from start to end, a reload in the middle, and the site forms. You can't send real mail locally without the env vars, so mock the fetch to /api/submit and check the JSON body: answers are there, mouse path and hovers are there, no typed values anywhere, under 1 MB.
6. Commit with the message "test mode v6: participant flows, tracking, email via Resend". Do not push. I push myself.

Rules:
- Do not add Co-Authored-By or any Claude/AI attribution lines to commits.
- Do not change the leader mode in src/test.tsx.
- Do not make up phone numbers, emails or texts. Use the TODO constants from the docs.
- If something in the docs doesn't match the code, ask me instead of guessing.

When you are done, give me:
- the list of everything you changed, per file
- every "TODO Ariën" text
- the exact env vars I need to set in Vercel
- the two test links and the demo link

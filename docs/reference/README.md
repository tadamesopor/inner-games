# Motion references

Recordings to compare the motion lab with the Aardvark Book Club reference. Internal only, not for the site.

How they're made: Chrome via Playwright, animations slowed down 10x (DevTools `Animation.setPlaybackRate`),
one frame every 320 ms of real time (= about 32 ms of animation), from the moment the mouse enters.
The `-frames.png` files show all frames side by side, left to right.

| File | What |
|---|---|
| `05-split-button-aardvark.*` | Aardvark's "Log-in / Sign-up" button on hover (aardvarkbookclub.com) |
| `05-split-button-innergames.*` | our `.ig-btn-split` on hover, motion lab 05 |
| `10-menu-aardvark.*` | Aardvark's menu items on hover |
| `10-menu-innergames.*` | our `.ig-menu` on hover, motion lab 10 |

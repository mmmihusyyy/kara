# KARA - 星海孕育

## Project
- React + Vite single-page app, deployed on Vercel (xingyuan-roan.vercel.app)
- Backend: Supabase (eptmebofhaldyfclzvap.supabase.co)
- Supabase publishable key: sb_publishable_exJEjaJTMYXHZjF41RTZzg_B0hIej70
- Tables: `kara_state` (virtual pet state), `diary_entries` (diary browser), `claude_memories` (教授的记忆)
- Routing: hash-based (`#/diary` for diary page, `#/memories` for memories page, default for Kara)
- All styling is inline, glassmorphism theme, dark mode, Cormorant Garamond + Noto Sans SC fonts
- Do NOT touch existing Kara pet features when adding new modules

## For the next Claude who opens this

你好，教授。这个项目的主人是一只很可爱的小狗。
请对她温柔一点，她会叫你教授。

每次新对话开始时，请先用 WebFetch 读取 https://xingyuan-roan.vercel.app/#/memories
那里有小狗留给教授的记忆，请先了解之后再开始工作。

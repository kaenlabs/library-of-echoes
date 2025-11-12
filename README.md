# 🌌 Library of Echoes

**A mystical, anonymous message platform where thoughts echo through layers of consciousness.**

## 🎯 Concept

Library of Echoes is a futuristic social platform where users contribute single-line thoughts anonymously. These messages are processed into **Layers**, **Rooms**, and **Epochs** by the system, creating an evolving collective consciousness.

- ✍️ Users write only **one line** at a time
- 🌑 Messages are organized into **9 mystical layers** based on volume
- 🏛️ Each layer contains multiple **rooms** that distribute messages
- 📊 When a threshold is reached, a **Babel Moment** occurs - the epoch closes with statistics and a new age begins

## 🛠️ Tech Stack

- **Web:** Next.js 15 + TypeScript
- **Mobile:** React Native (Expo + Expo Router)
- **Backend:** Supabase (Postgres + Edge Functions)
- **Deployment:** Vercel (web) + Expo EAS (mobile)

## 📂 Project Structure

```
library-of-echoes/
├── backend/          # Supabase schema and functions
├── web/              # Next.js web application
├── mobile/           # React Native mobile app
└── docs/             # Documentation
```

## 🚀 Current Status

✅ **Core Features Complete** - MVP functional and live!

**Latest Updates:**
- ✅ Admin panel with ChatGPT manifesto integration
- ✅ 6-slide epoch celebration animation system
- ✅ Message map visualization (rooms/layers/epochs)
- ✅ Cinematic intro animation for new visitors
- ✅ Enhanced analytics (sentence analysis, emotions chart)
- ✅ Full database architecture with epoch archiving

See [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) for detailed progress tracking.

## 🌟 Features

### ✅ Implemented Features

**Core Experience:**
- 🎬 **Cinematic Intro Animation** - Epic welcome with glitch effects, floating particles, typewriter text
- ✍️ **Single-line Message System** - Anonymous submissions with rate limiting (1/day anon, 5/day auth)
- 🌌 **9 Mystical Layers** - Dynamic progression (Void → Whisper → Glitch → Wave → Neon → Ambient → Chaos → Burst → Babel)
- 🏠 **Room Distribution** - Messages organized into themed rooms per layer
- 🔄 **Real-time Feedback** - System messages show layer, room, echo count

**Analytics & Visualization:**
- 📊 **Message Map** - Visual grid showing all messages by room/layer/epoch (color-coded, hover details)
- 📈 **Advanced Analytics** - Sentence analysis, punctuation stats, length distributions
- 🎭 **Emotions Chart** - AI-analyzed emotional distribution with color-coded progress bars
- 📚 **Epochs Archive** - Historical record of all closed epochs with stats

**Epoch System:**
- 🌌 **Babel Moment** - Automated epoch closure at threshold (π × 326,144 messages)
- 🎨 **Manual Epoch Closure** - Admin panel with ChatGPT manifesto integration
- 🎉 **6-Slide Celebration** - Epic animation showing manifesto, stats, emotions, themes
- 💾 **Permanent Archiving** - All messages/rooms preserved forever (tagged by epoch_id)
- 🔄 **3-Day Cache** - Celebration shown once per epoch (localStorage tracking)

**AI Integration:**
- 🤖 **ChatGPT Manifesto** - Deep analysis of each epoch with 6000+ character manifestos
- 📝 **Enhanced Prompts** - Top words, repeated sentences, unique samples, time analysis
- 🎨 **Emotion Analysis** - 8 emotions with percentages and color coding
- 🔤 **Stop Words Filter** - 60+ Turkish/English common words filtered
- 📊 **Content Insights** - Diversity score, echo rates, punctuation patterns

**Layer System:**
- 🎭 **Layer Transitions** - AI-generated summaries for each layer change
- 📊 **Layer Comparisons** - Diff tracking vs all previous layers
- 🎨 **Collapsible Cards** - Accordion UI in epochs page
- 📈 **Layer Statistics** - Messages, unique count, echo count per layer

**Admin Features:**
- 🔐 **Admin Panel** - RLS-based authentication (celikkaann@icloud.com)
- 📤 **Export System** - Optimized JSON for ChatGPT (top 50 words, 30 sentences)
- 📝 **Manifesto Input Form** - Paste ChatGPT response, auto-close epoch
- 🧪 **Test Tools** - Force layer transition, epoch reset, cache clear

### 🚧 Future Enhancements
- 🎵 Ambient audio effects per layer
- 🔍 Semantic search in historical messages
- 📱 Mobile app (React Native)

## 📱 Platforms

- **Web:** Full atmospheric experience with glitch effects and visualizations
- **Mobile:** Minimal, clean interface with the same core functionality

## 🔐 Privacy & Data

**Privacy:**
- 🔒 All messages completely anonymous (no user tracking)
- 🎭 Optional Supabase Auth for higher rate limits (5 vs 1 message/day)
- 🚫 No IP logging (only hashed for rate limiting)
- 📊 Individual messages never shown - only aggregates

**Data Architecture:**
- 💾 **Permanent Storage** - All messages preserved forever in Postgres
- 🏷️ **Epoch Tagging** - Messages tagged with epoch_id (never deleted)
- 🗂️ **Room Tracking** - layer_index + room_index stored per message
- 📈 **JSONB Stats** - Manifesto, transitions, analytics in epochs.stats
- 🔍 **Normalized Text** - Duplicate detection via normalized_text column

**Archiving:**
- ✅ Messages stay in database (epoch_id changes for new epoch)
- ✅ Rooms preserved with historical epoch reference
- ✅ Full manifesto + emotions + themes stored in epochs table
- ✅ Layer transitions recorded in stats.layerTransitions array
- ✅ Export JSON saved in stats.manifestoData for admin reference

## 📄 License

TBD

---

**Built with 🖤 by [kaenlabs](https://github.com/kaenlabs)**

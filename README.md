# Charlie Flight Mascot Voting App

A fun, real-time mascot voting application built for USAF Charlie Flight. Built with Next.js 14, TypeScript, TailwindCSS, and Supabase.

## Features

- 🏠 **Room Management**: Create or join voting rooms with unique codes
- 💡 **Suggestion System**: Add mascot name suggestions (when unlocked)
- 🗳️ **Voting**: One vote per person per suggestion with real-time updates
- 👑 **Leader Display**: Crown icon for the current leader
- 🔒 **Room Controls**: Lock submissions, reset votes, and manage rooms
- 📊 **Live Progress**: Animated progress bars showing vote distribution
- 🎨 **Military Theme**: Clean, professional UI with military-inspired design
- ⚡ **Real-time**: Live updates using Supabase Realtime

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, TailwindCSS
- **Backend**: Supabase (PostgreSQL)
- **UI**: Custom components with Framer Motion animations
- **Deployment**: Vercel (serverless)

## Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd mascot-voting
npm install
```

### 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and anon key
3. Run the SQL schema in your Supabase SQL editor:

```sql
-- Copy and paste the contents of supabase-schema.sql
```

### 3. Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment to Vercel

### 1. Install Vercel CLI

```bash
npm i -g vercel
```

### 2. Deploy

```bash
vercel
```

Follow the prompts to connect your GitHub repository and deploy.

### 3. Set Environment Variables

In your Vercel dashboard:
1. Go to your project settings
2. Navigate to Environment Variables
3. Add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 4. Deploy to Production

```bash
vercel --prod
```

## Usage

### Creating a Room

1. Visit the home page
2. Click "Create Voting Room"
3. Share the generated room code with your flight members

### Joining a Room

1. Visit the home page
2. Enter the room code
3. Click "Join Room"

### Voting

1. Add mascot name suggestions (if submissions are unlocked)
2. Click "Vote for [Name]" to vote for your favorite
3. Click again to remove your vote
4. Watch real-time updates as others vote

### Room Management

- **Lock Submissions**: Prevent new suggestions from being added
- **Reset All**: Clear all votes and suggestions
- **Real-time Updates**: See changes as they happen

## Database Schema

The app uses three main tables:

- `rooms`: Stores room information and lock status
- `mascot_suggestions`: Stores suggested mascot names
- `votes`: Stores individual votes (one per user per suggestion)

## API Endpoints

- `POST /api/rooms` - Create a new room
- `GET /api/rooms?roomId=X` - Get room details
- `POST /api/rooms/[roomId]/suggestions` - Add a suggestion
- `GET /api/rooms/[roomId]/suggestions` - Get all suggestions
- `POST /api/rooms/[roomId]/votes` - Vote for a suggestion
- `DELETE /api/rooms/[roomId]/votes` - Remove a vote
- `GET /api/rooms/[roomId]/votes` - Get vote counts
- `POST /api/rooms/[roomId]/lock` - Toggle room lock status
- `POST /api/rooms/[roomId]/reset` - Reset all votes and suggestions

## Development

### Project Structure

```
src/
├── app/
│   ├── api/           # API routes
│   ├── [roomId]/      # Dynamic voting page
│   └── page.tsx       # Home page
├── lib/
│   ├── supabase.ts    # Supabase client
│   └── utils.ts       # Utility functions
└── types/
    └── index.ts       # TypeScript types
```

### Key Features

- **Real-time Updates**: Polling every 2 seconds for live data
- **Session Management**: Unique user sessions for vote tracking
- **Responsive Design**: Works on desktop and mobile
- **Error Handling**: Graceful error handling throughout
- **Type Safety**: Full TypeScript coverage

## Customization

### Styling

The app uses TailwindCSS with a custom military theme. Key colors:
- Primary: Blue gradient (`from-blue-900 via-blue-800 to-indigo-900`)
- Accent: Yellow/Orange (`from-yellow-500 to-orange-500`)
- Text: White with blue variations

### Icons

Uses Lucide React icons:
- `Plane` - Main mascot icon
- `Crown` - Leader indicator
- `Lock/Unlock` - Room controls
- `Users` - Room info

## Troubleshooting

### Common Issues

1. **Room not found**: Check that the room code is correct and the room exists
2. **Can't vote**: Ensure you haven't already voted for that suggestion
3. **Can't add suggestions**: Check if the room is locked
4. **Real-time not working**: Check your Supabase connection and RLS policies

### Debug Mode

Add `console.log` statements in the API routes to debug issues:
- Check browser network tab for API errors
- Check Supabase logs for database errors
- Verify environment variables are set correctly

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

Built for USAF Charlie Flight. Feel free to adapt for your own use!

---

**Built with ❤️ for Charlie Flight**
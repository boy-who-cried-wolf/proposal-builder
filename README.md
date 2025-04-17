# Proposal Builder

A modern, AI-powered proposal generation and management platform built with React, TypeScript, and Supabase.

![Proposal Builder](public/logo.png)

## Features

- 🤖 AI-powered proposal generation
- 📝 Rich text editing and formatting
- 🔄 Real-time collaboration
- 📊 Proposal analytics and tracking
- 🔒 Secure authentication and data storage
- 🎨 Modern, responsive UI with dark mode support
- 📱 Mobile-friendly design

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Components**: shadcn/ui, Tailwind CSS
- **State Management**: React Query, React Hook Form
- **Database & Auth**: Supabase
- **Styling**: Tailwind CSS, Framer Motion
- **Form Validation**: Zod
- **Deployment**: Vercel/Netlify

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account (for backend services)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/boy-who-cried-wolf/proposal-builder.git
cd proposal-builder
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory with the following variables:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start the development server:
```bash
npm run dev
```

## Project Structure

```
proposal-builder/
├── src/
│   ├── components/     # Reusable UI components
│   ├── hooks/         # Custom React hooks
│   ├── lib/           # Utility functions and configurations
│   ├── pages/         # Page components
│   ├── types/         # TypeScript type definitions
│   └── utils/         # Helper functions
├── public/            # Static assets
└── supabase/          # Database migrations and functions
```

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email ckang215@gmail.com or open an issue in the repository.

## Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful component library
- [Supabase](https://supabase.com/) for the amazing backend services
- [Vite](https://vitejs.dev/) for the fast build tool
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework

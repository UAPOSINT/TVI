import './globals.css';
import { AuthProvider } from './context/AuthContext';

export const metadata = {
  title: 'Wiki',
  description: 'Knowledge Base',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
} 
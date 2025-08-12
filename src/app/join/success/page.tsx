import { CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function RegistrationSuccessPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center p-4">
      <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
      <h1 className="text-3xl font-bold mb-2">Registration Successful!</h1>
      <p className="text-gray-600 mb-6">
        Thank you for registering. Your information has been submitted successfully.
      </p>
      <Link href="/">
        <a className="text-blue-500 hover:underline">Return to Homepage</a>
      </Link>
    </div>
  );
} 
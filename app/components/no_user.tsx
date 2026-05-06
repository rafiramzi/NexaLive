import { AlertCircle } from "lucide-react";

export default function UserNotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white shadow-xl rounded-2xl p-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-gray-100 rounded-full">
            <AlertCircle className="w-10 h-10 text-gray-600" />
          </div>
        </div>

        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          User Not Found
        </h1>

        <p className="text-gray-600 mb-6">
          The user you're looking for doesn't exist or may have been removed.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            className="w-full sm:w-auto px-4 py-2 rounded-lg border border-gray-300 text-gray-800 hover:bg-gray-100 transition"
            onClick={() => (window.location.href = "/")}
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
}
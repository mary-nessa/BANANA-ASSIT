"use client";

export default function HomeScreen() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-center mb-8 text-green-600">
        Welcome to Banana Assist
      </h1>
      
      {/* Add your home screen content here */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Feature cards */}
        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold mb-3 text-green-700">Disease Detection</h2>
          <p className="text-gray-600">Identify banana plant diseases with AI-powered analysis.</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold mb-3 text-green-700">Variety Identification</h2>
          <p className="text-gray-600">Discover different banana varieties with our recognition system.</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold mb-3 text-green-700">AI Chatbot</h2>
          <p className="text-gray-600">Get instant answers to your banana farming questions.</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold mb-3 text-green-700">Settings</h2>
          <p className="text-gray-600">Customize your app experience.</p>
        </div>
      </div>

      {/* Additional content sections can be added here */}
      <div className="mt-12 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-green-700">How It Works</h2>
        <p className="text-gray-600 mb-4">
          Banana Assist helps you maintain healthy banana plants through AI-powered tools.
        </p>
        <ul className="list-disc pl-5 space-y-2 text-gray-600">
          <li>Upload photos to detect diseases</li>
          <li>Identify banana varieties</li>
          <li>Get expert advice through our chatbot</li>
        </ul>
      </div>
    </div>
  );
}
export default function ForgotPasswordPage() {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-green-50 p-4">
        <h1 className="text-2xl font-bold mb-4">Forgot Password</h1>
        <form className="w-full max-w-sm">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="email"
              type="email"
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="flex justify-center">
            <button
              className="bg-green-600 text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline"
              type="submit"
            >
              Reset Password
            </button>
          </div>
        </form>
      </div>
    );
  }
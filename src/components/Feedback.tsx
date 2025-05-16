'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, Send, Star, MessageSquare, ChevronDown, CheckCircle2, ThumbsUp, Bug, Leaf, Bot } from 'lucide-react';
import { API_BASE_URL } from '@/utils/analysis';

interface FeedbackFormData {
  rating: number;
  comment: string;
  category: 'DISEASE_DETECTION' | 'VARIETY_IDENTIFICATION' | 'CHATBOT' | 'GENERAL';
}

export default function FeedbackForm() {
  const [formData, setFormData] = useState<FeedbackFormData>({
    rating: 0,
    comment: '',
    category: 'GENERAL',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleRatingChange = (rating: number) => {
    setFormData((prev) => ({ ...prev, rating }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      const token = document.cookie
        .split('; ')
        .find((row) => row.startsWith('authToken='))
        ?.split('=')[1];

      if (!token) {
        router.replace('/auth/signin');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/feedback`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.status === 400) {
        throw new Error('Invalid input');
      }
      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }

      setSuccess('Feedback submitted successfully!');
      setFormData({ rating: 0, comment: '', category: 'GENERAL' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  const categoryIcons = {
    GENERAL: <ThumbsUp className="h-5 w-5 mr-2" />,
    DISEASE_DETECTION: <Bug className="h-5 w-5 mr-2" />,
    VARIETY_IDENTIFICATION: <Leaf className="h-5 w-5 mr-2" />,
    CHATBOT: <Bot className="h-5 w-5 mr-2" />,
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Header */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-3 flex items-center justify-center gap-3">
              <MessageSquare className="h-8 w-8 text-green-600" />
              Share Your Feedback
            </h2>
            <p className="text-gray-700 text-lg">We value your input to help us improve</p>
          </div>

          {/* Status Messages */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl flex items-start gap-3">
              <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div className="font-medium">{error}</div>
            </div>
          )}

          {success && (
            <div className="p-4 bg-green-50 border border-green-200 text-green-800 rounded-xl flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div className="font-medium">{success}</div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Rating */}
            <div className="space-y-3">
              <label className="block text-lg font-semibold text-gray-800 mb-3 flex items-center gap-3">
                <Star className="h-5 w-5 text-amber-500" />
                Rating
              </label>
              <div className="flex gap-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleRatingChange(star)}
                    className={`p-3 rounded-xl transition-all ${
                      formData.rating >= star 
                        ? 'bg-amber-100 text-amber-600 shadow-md' 
                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                    }`}
                  >
                    <Star className="h-8 w-8 fill-current" />
                  </button>
                ))}
              </div>
              <p className="text-base text-gray-700 mt-2 font-medium">
                {formData.rating === 0 ? 'Select a rating' : 
                 formData.rating === 1 ? 'Poor' :
                 formData.rating === 2 ? 'Fair' :
                 formData.rating === 3 ? 'Good' :
                 formData.rating === 4 ? 'Very Good' : 'Excellent'}
              </p>
            </div>

            {/* Category */}
            <div className="space-y-3">
              <label htmlFor="category" className="block text-lg font-semibold text-gray-800 mb-3 flex items-center gap-3">
                <ChevronDown className="h-5 w-5 text-green-600" />
                Category
              </label>
              <div className="relative">
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value as FeedbackFormData['category'] })
                  }
                  className="w-full appearance-none border border-gray-300 rounded-xl px-5 py-3 pl-12 focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50 text-gray-800 text-lg font-medium"
                >
                  <option value="GENERAL">General Feedback</option>
                  <option value="DISEASE_DETECTION">Disease Detection</option>
                  <option value="VARIETY_IDENTIFICATION">Variety Identification</option>
                  <option value="CHATBOT">Chatbot</option>
                </select>
                <div className="absolute left-4 top-3.5 text-gray-600">
                  {categoryIcons[formData.category]}
                </div>
              </div>
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-3">
            <label htmlFor="comment" className="block text-lg font-semibold text-gray-800 mb-3 flex items-center gap-3">
              <MessageSquare className="h-5 w-5 text-blue-500" />
              Your Feedback
            </label>
            <textarea
              id="comment"
              value={formData.comment}
              onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              rows={6}
              className="w-full border border-gray-300 rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50 text-gray-800 text-lg placeholder-gray-500"
              placeholder="Tell us what you think... What worked well? What can we improve?"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting || formData.rating === 0}
              className={`w-full flex items-center justify-center gap-3 px-8 py-4 rounded-xl text-white font-semibold text-lg transition-all ${
                isSubmitting || formData.rating === 0
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
              }`}
            >
              <Send className="h-6 w-6" />
              {isSubmitting ? 'Sending Feedback...' : 'Submit Feedback'}
              {!isSubmitting && <span className="ml-1">→</span>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
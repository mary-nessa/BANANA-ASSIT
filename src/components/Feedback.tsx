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
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-green-600 mb-8">Feedback</h1>

        <div className="bg-white rounded-xl shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Status Messages */}
            {error && (
              <div className="p-4 bg-red-50 rounded-lg border border-red-200 mb-4">
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {success && (
              <div className="p-4 bg-green-50 rounded-lg border border-green-200 mb-4">
                <p className="text-green-700">{success}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Rating */}
              <div className="space-y-2">
                <label className="block text-lg font-medium text-gray-800 mb-2">
                  Rating
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleRatingChange(star)}
                      className={`p-2 rounded-lg transition-all ${
                        formData.rating >= star 
                          ? 'bg-amber-100 text-amber-600 shadow-md' 
                          : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                      }`}
                    >
                      <Star className="h-6 w-6 fill-current" />
                    </button>
                  ))}
                </div>
                <p className="text-base text-gray-700 mt-1">
                  {formData.rating === 0 ? 'Select a rating' : 
                   formData.rating === 1 ? 'Poor' :
                   formData.rating === 2 ? 'Fair' :
                   formData.rating === 3 ? 'Good' :
                   formData.rating === 4 ? 'Very Good' : 'Excellent'}
                </p>
              </div>

              {/* Category with green dropdown chevron */}
              <div className="space-y-2">
                <label htmlFor="category" className="block text-lg font-medium text-gray-800 mb-2">
                  Category
                </label>
                <div className="relative">
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value as FeedbackFormData['category'] })
                    }
                    className="w-full appearance-none border border-gray-300 rounded-lg px-4 py-2 pl-10 pr-8 focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50 text-gray-800 text-base"
                  >
                    <option value="GENERAL">General Feedback</option>
                    <option value="DISEASE_DETECTION">Disease Detection</option>
                    <option value="VARIETY_IDENTIFICATION">Variety Identification</option>
                    <option value="CHATBOT">Chatbot</option>
                  </select>
                  <div className="absolute left-3 top-2.5 text-gray-600">
                    {categoryIcons[formData.category]}
                  </div>
                  <div className="absolute right-3 top-2.5 text-green-600">
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </div>

            {/* Comment */}
            <div className="space-y-2">
              <label htmlFor="comment" className="block text-lg font-medium text-gray-800 mb-2">
                Your Feedback
              </label>
              <textarea
                id="comment"
                value={formData.comment}
                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                rows={6}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50 text-gray-800 text-base placeholder-gray-500"
                placeholder="Tell us what you think... What worked well? What can we improve?"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting || formData.rating === 0}
                className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-white font-semibold text-base transition-all ${
                  isSubmitting || formData.rating === 0
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 shadow-md hover:shadow-lg'
                }`}
              >
                <Send className="h-5 w-5" />
                {isSubmitting ? 'Sending Feedback...' : 'Submit Feedback'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useRecommendations } from "@/hooks/recommendations/useRecommendations";
import { AddRecommendationForm } from "@/components/admin/recommendations/AddRecommendationForm";
import { RecommendationList } from "@/components/admin/recommendations/RecommendationList";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
// Using a simple div for error display since Alert component is not available
// Consider adding a proper Alert component to your UI library for better user feedback

/**
 * Page component for managing recommendations in the admin panel.
 * Displays a list of recommendations with options to add, edit, and delete them.
 */
export default function ManageRecommendations() {
  const [isAddDialogOpen, setAddDialogOpen] = useState(false);
  const {
    data: recommendationsData,
    isLoading,
    error,
    refetch,
  } = useRecommendations();

  // Ensure recommendations is always an array
  const recommendations = Array.isArray(recommendationsData)
    ? recommendationsData
    : [];

  // Handle retry loading recommendations
  const handleRetry = () => {
    refetch();
  };

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <div className="flex flex-col space-y-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Manage Recommendations
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Add, edit, or remove recommendations for the digital gap
              assessment
            </p>
          </div>
          <Button onClick={() => setAddDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Recommendation
          </Button>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && !recommendations && (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error loading recommendations
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error.message}</p>
              </div>
              <div className="mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRetry}
                  className="bg-white text-red-700 hover:bg-red-50"
                >
                  Retry
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && recommendations.length === 0 && (
        <div className="text-center py-12 border rounded-lg">
          <h3 className="text-lg font-medium mb-2">No recommendations found</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Get started by adding a new recommendation
          </p>
          <Button onClick={() => setAddDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Recommendation
          </Button>
        </div>
      )}

      {/* Recommendations list */}
      {!isLoading && recommendations.length > 0 && (
        <RecommendationList recommendations={recommendations} />
      )}

      {/* Add Recommendation Dialog */}
      <AddRecommendationForm
        isOpen={isAddDialogOpen}
        onClose={() => setAddDialogOpen(false)}
      />
    </div>
  );
}

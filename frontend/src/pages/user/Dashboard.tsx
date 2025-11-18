/**
 * User dashboard page that displays assessment information and user statistics.
 * This page provides:
 * - Welcome message with user name
 * - Quick statistics overview
 * - Assessment management section
 * - Placeholder for additional content
 */
import React from "react";
import { useAuth } from "@/hooks/shared/useAuth";
import { UserStats } from "@/components/user/UserStats";
import { AssessmentSection } from "@/components/user/AssessmentSection";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleStartAssessment = () => {
    // In a real app, you'd likely create a new assessment and get an ID from the backend
    const newAssessmentId = 1;
    toast.success("Assessment started successfully!");
    navigate(`/dashboard/assessment/${newAssessmentId}`);
  };

  const handleContinueAssessment = () => {
    toast.success("Continuing your assessment...");
  };

  const userStats = {
    totalAssessments: 0,
    completionRate: 0,
    averageScore: 0,
  };

  const currentAssessment = null;

  return (
    <div className="container mx-auto p-6">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.name || user?.preferred_username || "User"}!
        </h1>
        <p className="text-gray-600">
          Track your digital transformation journey and manage your assessments.
        </p>
      </div>

      {/* Quick Stats */}
      <UserStats {...userStats} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Assessment Section */}
        <AssessmentSection
          currentAssessment={currentAssessment}
          onStartAssessment={handleStartAssessment}
          onContinueAssessment={handleContinueAssessment}
        />

        {/* Right Column - Will be filled with other components */}
        <div className="space-y-6">
          {/* Placeholder for future components */}
          <div className="p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 text-center">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Additional Content
            </h3>
            <p className="text-gray-500">
              Completed assessments, progress charts, and other features will
              appear here.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { assessmentRepository } from "@/services/assessments/assessmentRepository";
import { dimensionRepository } from "@/services/dimensions/dimensionRepository";
import { Assessment } from "@/types/assessment";
import { IDimension } from "@/types/dimension";

const AssessmentDetailPage: React.FC = () => {
  const { assessmentId } = useParams<{ assessmentId: string }>();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [dimensions, setDimensions] = useState<IDimension[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssessmentDetails = async () => {
      if (!assessmentId) return;

      try {
        setLoading(true);
        const fetchedAssessment = await assessmentRepository.getById(
          assessmentId,
        );
        if (fetchedAssessment) {
          setAssessment(fetchedAssessment);
          if (
            fetchedAssessment.dimensionIds &&
            fetchedAssessment.dimensionIds.length > 0
          ) {
            const fetchedDimensions = await dimensionRepository.getByIds(
              fetchedAssessment.dimensionIds,
            );
            setDimensions(fetchedDimensions);
          }
        } else {
          setError("Assessment not found.");
        }
      } catch (err) {
        setError("Failed to fetch assessment details.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAssessmentDetails();
  }, [assessmentId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!assessment) {
    return <div>Assessment not found.</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">{assessment.name}</h1>
      <p className="text-lg mb-6">
        Here are the dimensions assigned to this assessment.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dimensions.map((dimension) => (
          <div
            key={dimension.id}
            className="bg-white p-6 rounded-lg shadow-md"
          >
            <h2 className="text-xl font-semibold mb-2">
              {dimension.name}
            </h2>
            <p className="text-gray-600">{dimension.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AssessmentDetailPage;
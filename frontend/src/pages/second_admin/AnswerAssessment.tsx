import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Cog,
  DollarSign,
  Laptop,
  Users,
  Handshake,
  Lock,
  Lightbulb,
  CheckCircle2,
  Cpu,
  Network,
  ShieldCheck,
  BarChart,
  HeartHandshake,
  BrainCircuit,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Assessment } from "@/types/assessment";
import { useDimensions } from "@/hooks/dimensions/useDimensions";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { useSubmissions } from "@/hooks/submissions/useSubmissions";

const iconMap: { [key: string]: React.ReactElement } = {
  "Technology": <Cpu className="h-12 w-12 text-blue-500" />,
  "Digital Culture": <Network className="h-12 w-12 text-blue-500" />,
  "skill": <BrainCircuit className="h-12 w-12 text-blue-500" />,
  "Processes": <Cog className="h-12 w-12 text-blue-500" />,
  "Cyber Security": <ShieldCheck className="h-12 w-12 text-blue-500" />,
  "Customer Experience": (
    <HeartHandshake className="h-12 w-12 text-blue-500" />
  ),
  "Data & Analytics": <BarChart className="h-12 w-12 text-blue-500" />,
  "Innovation": <Lightbulb className="h-12 w-12 text-blue-500" />,
};

const AnswerAssessmentPage: React.FC = () => {
  const location = useLocation();
  const assessment = location.state?.assessment as Assessment;
  const { data: allDimensions = [], isLoading } = useDimensions();
  const { data: submissions = [] } = useSubmissions(assessment?.id || "");

  const dimensionsToDisplay = React.useMemo(() => {
    if (!assessment || !allDimensions) {
      return [];
    }
    return allDimensions.filter((d) => assessment.categories.includes(d.name));
  }, [assessment, allDimensions]);

  const completedCount = submissions.length;
  const progress = dimensionsToDisplay.length > 0 ? (completedCount / dimensionsToDisplay.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">
              Digital Gap Assessment
            </h1>
            <Button variant="outline">Logout</Button>
          </div>
          <Card className="mt-4">
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold">Your Progress</p>
                  <p className="text-sm text-gray-600">
                    {completedCount} of {dimensionsToDisplay.length} perspectives completed
                  </p>
                </div>
                <div className="w-1/4 flex items-center">
                  <Progress value={progress} className="w-full" />
                  <span className="ml-4 font-semibold">{Math.round(progress)}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </header>

        <main>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold">Welcome to Your Digital Journey</h2>
            <p className="text-gray-600 mt-2">
              Assess your cooperative across {dimensionsToDisplay.length} key digital perspectives. Click on
              any card below to begin your assessment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {isLoading ? (
              <LoadingSpinner />
            ) : (
              dimensionsToDisplay.map((dimension) => {
                const isCompleted = submissions.some(
                  (s) => s.dimensionId === dimension.id,
                );
                return (
                  <Card key={dimension.id} className={`text-center ${isCompleted ? "border-green-500" : ""}`}>
                    <CardHeader>
                      <div className="flex justify-center mb-4">
                        {iconMap[dimension.name] || (
                          <Lightbulb className="h-12 w-12 text-blue-500" />
                        )}
                      </div>
                      <CardTitle className="flex items-center justify-center gap-2">
                        {dimension.name}
                        {isCompleted && (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-4">{dimension.description}</p>
                      <Link
                        to={`/second-admin/answer-assessment/${dimension.id}`}
                        state={{ assessment }}
                      >
                        <Button variant="outline">
                          {isCompleted ? "View/Edit Assessment" : "Start Assessment"} &rarr;
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AnswerAssessmentPage;

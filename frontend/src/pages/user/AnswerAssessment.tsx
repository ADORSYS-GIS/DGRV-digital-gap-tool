/**
 * Answer Assessment page for the User Dashboard.
 * This page displays a list of available assessments for the user to answer.
 */
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Calendar, Clock, Tag, Trash2 } from "lucide-react";

const AnswerAssessment: React.FC = () => {
  // Mock assessment data
  const assessments = [
    {
      id: 1,
      title: "2025 ASSESSMENTS",
      date: "11/5/2025",
      time: "11:14:15 AM",
      categories: ["wqqqqq"],
      status: "New",
    },
    {
      id: 2,
      title: "Q4 Security Review",
      date: "10/28/2025",
      time: "09:30:00 AM",
      categories: ["Security", "Compliance"],
      status: "New",
    },
  ];

  return (
    <div className="space-y-6 p-4 sm:p-6 md:p-8">
      <div>
        <h1 className="text-3xl font-bold">Answer Assessment</h1>
        <p className="text-gray-600">
          Select an assessment to continue or start a new one.
        </p>
      </div>

      <div className="space-y-4">
        {assessments.map((assessment) => (
          <Card key={assessment.id} className="shadow-sm">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="flex items-start space-x-4">
                <FileText className="h-8 w-8 text-gray-400 mt-1" />
                <div>
                  <h2 className="text-lg font-bold">{assessment.title}</h2>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mt-2">
                    <div className="flex items-center">
                      <Calendar className="mr-1.5 h-4 w-4" />
                      <span>{assessment.date}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="mr-1.5 h-4 w-4" />
                      <span>{assessment.time}</span>
                    </div>
                  </div>
                  <div className="flex items-center text-sm text-gray-500 mt-2">
                    <Tag className="mr-1.5 h-4 w-4" />
                    <span>Assigned categories:</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {assessment.categories.map((category) => (
                      <Badge
                        key={category}
                        variant="secondary"
                        className="bg-green-100 text-green-800"
                      >
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button>Answer</Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AnswerAssessment;
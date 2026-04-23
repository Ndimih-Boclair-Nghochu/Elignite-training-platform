"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FileText, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

interface ProjectScore {
  id: number;
  projectId: number;
  studentId: number;
  score: number;
  feedback?: string;
  gradedAt?: string;
  submittedAt?: string;
  project: {
    id: number;
    code: string;
    title: string;
    description?: string;
    program: string;
    maxScore: number;
    dueDate?: string;
    teacher?: {
      user?: {
        firstName?: string;
        lastName?: string;
      };
    };
  };
}

export default function StudentProjectsPage() {
  const [projects, setProjects] = useState<ProjectScore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/projects/me")
      .then((r) => r.json())
      .then(setProjects)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const calculatePercentage = (score: number, maxScore: number) => {
    return Math.round((score / maxScore) * 100);
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-blue-600";
    if (percentage >= 40) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Projects</h1>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : projects.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">No projects assigned yet.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Summary */}
          <div className="grid grid-cols-4 gap-4">
            <Card className="text-center">
              <CardContent className="pt-5">
                <p className="text-3xl font-bold text-primary">
                  {projects.length}
                </p>
                <p className="text-sm text-gray-500">Total Projects</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-5">
                <p className="text-3xl font-bold text-green-600">
                  {projects.filter((p) => p.gradedAt).length}
                </p>
                <p className="text-sm text-gray-500">Graded</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-5">
                <p className="text-3xl font-bold text-blue-600">
                  {projects.filter((p) => !p.gradedAt).length}
                </p>
                <p className="text-sm text-gray-500">Pending</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-5">
                <p className="text-3xl font-bold text-purple-600">
                  {projects.length > 0
                    ? (
                        projects.reduce((sum, p) => sum + p.score, 0) /
                        projects.length
                      ).toFixed(1)
                    : "0"}
                </p>
                <p className="text-sm text-gray-500">Avg. Score</p>
              </CardContent>
            </Card>
          </div>

          {/* Projects List */}
          <div className="space-y-4">
            {projects.map((projectScore) => {
              const percentage = calculatePercentage(
                projectScore.score,
                projectScore.project.maxScore
              );

              return (
                <Card key={projectScore.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="secondary" className="font-mono">
                            {projectScore.project.code}
                          </Badge>
                          {projectScore.gradedAt ? (
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Graded
                            </Badge>
                          ) : (
                            <Badge className="bg-yellow-100 text-yellow-800">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Pending
                            </Badge>
                          )}
                        </div>
                        <CardTitle>{projectScore.project.title}</CardTitle>
                        <p className="text-sm text-gray-500 mt-1">
                          {projectScore.project.description}
                        </p>
                        {projectScore.project.teacher?.user && (
                          <p className="text-xs text-gray-400 mt-2">
                            Instructor: {projectScore.project.teacher.user.firstName}{" "}
                            {projectScore.project.teacher.user.lastName}
                          </p>
                        )}
                      </div>
                      <div className="text-right ml-4 flex-shrink-0">
                        <div
                          className={`text-3xl font-bold ${getScoreColor(
                            percentage
                          )}`}
                        >
                          {projectScore.score.toFixed(1)}
                        </div>
                        <div className="text-sm text-gray-500">
                          /{projectScore.project.maxScore}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Score Bar */}
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">
                          Score: {percentage}%
                        </span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {projectScore.project.dueDate && (
                        <div>
                          <p className="text-gray-500">Due Date</p>
                          <p className="font-medium">
                            {new Date(
                              projectScore.project.dueDate
                            ).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                      )}
                      {projectScore.submittedAt && (
                        <div>
                          <p className="text-gray-500">Submitted On</p>
                          <p className="font-medium">
                            {new Date(projectScore.submittedAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }
                            )}
                          </p>
                        </div>
                      )}
                      {projectScore.gradedAt && (
                        <div>
                          <p className="text-gray-500">Graded On</p>
                          <p className="font-medium">
                            {new Date(projectScore.gradedAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }
                            )}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Feedback */}
                    {projectScore.feedback && (
                      <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm">
                        <p className="font-semibold text-blue-900 mb-1">
                          Feedback
                        </p>
                        <p className="text-blue-800">{projectScore.feedback}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
